import type { Ref } from 'vue';
import type Hls from 'hls.js';
import type { Video } from '~/composables/useVideoPlayer';
import { useHlsPlayerAds, type ParsedAd, type AdvertisingConfigHls } from '~/composables/useHlsPlayerAds';

export interface HlsPlayerProps {
    video: Video;
    autoplay?: boolean;
    controls?: boolean;
    muted?: boolean;
    playbackRate?: number;
    aspectRatio?: string;
    advertising?: AdvertisingConfigHls;
}

interface ApiAdvertisement {
    id: number;
    title: string;
    description?: string;
    type: number;
    type_label: string;
    media_url: string;
    redirect_url?: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
}

interface AdPlaybackState {
    isPlayingAd: boolean;
    currentAd: ParsedAd | null;
    adCurrentTime: number;
    adDuration: number;
    canSkip: boolean;
    skipTimeRemaining: number;
}

export const useHlsPlayerCore = (
    props: HlsPlayerProps,
    emit: {
        (e: 'ready'): void;
        (e: 'play'): void;
        (e: 'pause'): void;
        (e: 'complete'): void;
        (e: 'error', error: any): void;
        (e: 'time', data: { position: number; duration: number }): void;
        (e: 'seek', data: { offset: number }): void;
        (e: 'buffer', data: { percentage: number }): void;
        (e: 'fullscreen', isFullscreen: boolean): void;
        (e: 'adImpression', data: { tag: string }): void;
        (e: 'adComplete', data: { tag: string }): void;
        (e: 'adSkipped', data: { tag: string }): void;
        (e: 'adError', error: any): void;
        (e: 'adClick', data: { tag: string }): void;
    }
) => {
    const playerContainer = ref<HTMLDivElement | null>(null);
    const wrapperElement = ref<HTMLDivElement | null>(null);
    const isReady = ref(false);
    const hlsInstance = ref<Hls | null>(null);
    const hlsVideoEl = ref<HTMLVideoElement | null>(null);
    const adVideoEl = ref<HTMLVideoElement | null>(null);
    const fallbackEventCleanups: Array<() => void> = [];
    let pendingPlayPromise: Promise<void> | null = null;
    let fullscreenControlsTimeout: NodeJS.Timeout | null = null;

    const parsedAds = ref<ParsedAd[]>([]);
    const adState = reactive<AdPlaybackState>({
        isPlayingAd: false,
        currentAd: null,
        adCurrentTime: 0,
        adDuration: 0,
        canSkip: false,
        skipTimeRemaining: 0,
    });
    const adUiState = reactive({
        isPaused: false,
        isMuted: props.muted ?? false,
    });
    let adCheckInterval: NodeJS.Timeout | null = null;
    let preRollPlayed = false;
    let contentWasPausedForAd = false;
    const adEventCleanups: Array<() => void> = [];

    const hlsFallbackState = reactive({
        showControls: false,
        showSettings: false,
        settingsTab: 'quality' as 'quality' | 'speed',
        currentQuality: -1,
        availableQualities: [] as Array<{ label: string; index: number }>,
        playbackSpeed: 1,
        volume: 100,
        showVolumeSlider: false,
        showPlayPauseEffect: false,
        playPauseEffectIcon: 'play' as 'play' | 'pause',
    });

    const lastVolumeBeforeMute = ref(100);
    const state = reactive({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        volume: 100,
        isMuted: false,
        isFullscreen: false,
        isBuffering: false,
    });

    const isHlsSource = (src: string) => src?.toLowerCase().includes('.m3u8');

    const {
        processAdSchedule,
        findAdToPlay,
        trackImpression,
        trackEvent,
    } = useHlsPlayerAds();

    type HlsModuleType = typeof import('hls.js');
    let hlsModule: HlsModuleType | null = null;
    const loadHlsLib = async (): Promise<HlsModuleType> => {
        if (hlsModule) return hlsModule;
        const mod = await import('hls.js');
        hlsModule = mod as HlsModuleType;
        return hlsModule;
    };

    const safePlay = () => {
        if (!hlsVideoEl.value) {
            return;
        }

        if (pendingPlayPromise) {
            return pendingPlayPromise;
        }

        const attempt = hlsVideoEl.value.play();
        if (attempt && typeof attempt.catch === 'function') {
            pendingPlayPromise = attempt
                .catch((err) => {
                    if (!err || err.name === 'AbortError') {
                        return;
                    }
                    console.error('[HLS Fallback] Playback start failed:', err);
                })
                .finally(() => {
                    pendingPlayPromise = null;
                });
        }
        return attempt;
    };

    const setupAdVideoElement = () => {
        if (!playerContainer.value || adVideoEl.value) return;

        const adVideo = document.createElement('video');
        adVideo.className = 'hls-ad-player';
        adVideo.playsInline = true;
        adVideo.controls = false;
        adVideo.muted = props.muted ?? false;
        adVideo.style.position = 'absolute';
        adVideo.style.top = '0';
        adVideo.style.left = '0';
        adVideo.style.width = '100%';
        adVideo.style.height = '100%';
        adVideo.style.objectFit = 'contain';
        adVideo.style.zIndex = '30';
        adVideo.style.display = 'none';
        adVideo.style.backgroundColor = '#000';
        adUiState.isMuted = adVideo.muted;
        adUiState.isPaused = adVideo.paused;

        playerContainer.value.appendChild(adVideo);
        adVideoEl.value = adVideo;

        const addAdListener = (event: keyof HTMLVideoElementEventMap, handler: EventListener) => {
            adVideo.addEventListener(event, handler);
            adEventCleanups.push(() => adVideo.removeEventListener(event, handler));
        };

        addAdListener('timeupdate', () => {
            if (!adState.currentAd) return;

            adState.adCurrentTime = adVideo.currentTime;
            adState.adDuration = adVideo.duration || adState.currentAd.duration || 0;
            const skipOffset = adState.currentAd.skipOffset || 0;
            if (adVideo.currentTime >= skipOffset) {
                adState.canSkip = true;
                adState.skipTimeRemaining = 0;
            } else {
                adState.canSkip = false;
                adState.skipTimeRemaining = Math.ceil(skipOffset - adVideo.currentTime);
            }
        });

        addAdListener('ended', () => {
            handleAdComplete();
        });

        addAdListener('play', () => {
            adUiState.isPaused = false;
        });

        addAdListener('pause', () => {
            adUiState.isPaused = true;
        });

        addAdListener('volumechange', () => {
            adUiState.isMuted = adVideo.muted;
        });

        addAdListener('error', (event: Event) => {
            if (adState.isPlayingAd && adVideoEl.value?.src) {
                console.error('[HLS Ads] Ad playback error:', event);
                emit('adError', adVideo.error || event);
                handleAdComplete();
            }
        });
    };

    const trackApiImpression = async (apiAdId: number) => {
        try {
            const response = await $fetchCitizen<any>(`/advertiser/advertisements/${apiAdId}/impression`, {
                method: 'POST',
            });
            console.log('[HLS Ads] API Impression tracked:', response);
        } catch (error) {
            console.error('[HLS Ads] Error tracking API impression:', error);
        }
    };

    const playAd = async (ad: ParsedAd) => {
        if (!adVideoEl.value || !hlsVideoEl.value || !ad.mediaFileUrl) return;

        try {
            ad.hasBeenPlayed = true;
            contentWasPausedForAd = !state.isPlaying;
            if (hlsVideoEl.value && !hlsVideoEl.value.paused) {
                hlsVideoEl.value.pause();
            }

            adState.isPlayingAd = true;
            adState.currentAd = ad;
            adState.adCurrentTime = 0;
            adState.adDuration = ad.duration || 0;
            adState.canSkip = false;
            adState.skipTimeRemaining = ad.skipOffset || 0;
            if (adVideoEl.value) {
                adVideoEl.value.muted = adUiState.isMuted;
            }
            adUiState.isPaused = false;
            adVideoEl.value.style.display = 'block';

            adVideoEl.value.src = ad.mediaFileUrl;
            await adVideoEl.value.play();

            if (ad.vastResponse) {
                trackImpression(ad.vastResponse);
                trackEvent(ad.vastResponse, 'start');
            }

            // Track API impression when ad starts playing
            if (ad.apiAdId) {
                trackApiImpression(ad.apiAdId);
            }

            emit('adImpression', { tag: ad.vastTag });
        } catch (error) {
            console.error('[HLS Ads] Error playing ad:', error);
            emit('adError', error);
            handleAdComplete();
        }
    };

    const skipAd = () => {
        if (!adState.canSkip || !adState.currentAd) return;

        if (adState.currentAd.vastResponse) {
            trackEvent(adState.currentAd.vastResponse, 'skip');
        }

        emit('adSkipped', { tag: adState.currentAd.vastTag });
        handleAdComplete();
    };

    const handleAdComplete = () => {
        if (!adVideoEl.value || !hlsVideoEl.value) return;

        const completedAd = adState.currentAd;
        if (completedAd?.vastResponse && adVideoEl.value.currentTime >= (adState.adDuration - 1)) {
            trackEvent(completedAd.vastResponse, 'complete');
            emit('adComplete', { tag: completedAd.vastTag });
        }

        adVideoEl.value.pause();
        adVideoEl.value.style.display = 'none';
        adVideoEl.value.removeAttribute('src');
        adVideoEl.value.load();

        adState.isPlayingAd = false;
        adState.currentAd = null;
        adState.adCurrentTime = 0;
        adState.adDuration = 0;
        adState.canSkip = false;
        adState.skipTimeRemaining = 0;
        adUiState.isPaused = false;
        adUiState.isMuted = adVideoEl.value ? adVideoEl.value.muted : adUiState.isMuted;
        
        if (!contentWasPausedForAd && hlsVideoEl.value.paused) {
            safePlay();
        }
    };

    const toggleAdPlayPause = () => {
        if (!adVideoEl.value || !adState.isPlayingAd) {
            return;
        }

        if (adVideoEl.value.paused) {
            adVideoEl.value.play();
            adUiState.isPaused = false;
        } else {
            adVideoEl.value.pause();
            adUiState.isPaused = true;
        }
    };

    const toggleAdMute = () => {
        if (!adVideoEl.value || !adState.isPlayingAd) return;
        adVideoEl.value.muted = !adVideoEl.value.muted;
        adUiState.isMuted = adVideoEl.value.muted;
    };

    const checkForAds = () => {
        if (!hlsVideoEl.value || adState.isPlayingAd || parsedAds.value.length === 0) return;
        const currentTime = hlsVideoEl.value.currentTime;
        const duration = hlsVideoEl.value.duration;
        const adToPlay = findAdToPlay(parsedAds.value, currentTime, duration, false, false);
        if (adToPlay) {
            playAd(adToPlay);
        }
    };

    const fetchAdsFromApi = async (videoId: number): Promise<AdvertisingConfigHls | null> => {
        try {
            const { $generateVastXml, $buildAdConfig } = useNuxtApp();

            // Use $fetchCitizen from utils (auto-imported)
            const response = await $fetchCitizen<any>(`/advertiser/advertisements/by-video/${videoId}`, {
                method: 'GET',
            }).catch(() => null);

            if (!response?.data?.data || !Array.isArray(response.data.data)) {
                return null;
            }

            const ads: ApiAdvertisement[] = response.data.data;
            if (ads.length === 0) {
                return null;
            }

            const config = $buildAdConfig(ads, $generateVastXml);
            return config as AdvertisingConfigHls;
        } catch (error) {
            console.error('[HLS Ads] Error fetching ads from API:', error);
            return null;
        }
    };

    const initializeAds = async () => {
        // First try to fetch ads from API using video ID
        const videoId = props.video?.id;
        let adConfig: AdvertisingConfigHls | null = null;

        if (videoId) {
            adConfig = await fetchAdsFromApi(videoId);
        }

        // Fallback to props.advertising if no API ads found
        if (!adConfig && props.advertising?.schedule?.length) {
            adConfig = props.advertising;
        }

        if (!adConfig || !adConfig.schedule?.length) {
            return;
        }

        try {
            const ads = await processAdSchedule(
                adConfig.schedule,
                adConfig.skipoffset || 5
            );
            parsedAds.value = ads;
            setupAdVideoElement();
            if (adCheckInterval) {
                clearInterval(adCheckInterval);
            }
            adCheckInterval = setInterval(checkForAds, 1000);
        } catch (error) {
            console.error('[HLS Ads] Error initializing ads:', error);
        }
    };

    const playPreRollAd = () => {
        if (preRollPlayed || adState.isPlayingAd || parsedAds.value.length === 0) return;
        const duration = hlsVideoEl.value?.duration || 0;
        const preRollAd = findAdToPlay(parsedAds.value, 0, duration, true, false);
        if (preRollAd) {
            preRollPlayed = true;
            playAd(preRollAd);
        }
    };

    const playPostRollAd = () => {
        if (adState.isPlayingAd || parsedAds.value.length === 0) return;
        const duration = hlsVideoEl.value?.duration || 0;
        const postRollAd = findAdToPlay(parsedAds.value, 0, duration, false, true);
        if (postRollAd) {
            playAd(postRollAd);
        }
    };

    const cleanupAds = () => {
        if (adCheckInterval) {
            clearInterval(adCheckInterval);
            adCheckInterval = null;
        }
        if (adEventCleanups.length) {
            adEventCleanups.splice(0).forEach((cleanup) => cleanup());
        }
        if (adVideoEl.value) {
            try {
                adVideoEl.value.pause();
                adVideoEl.value.removeAttribute('src');
                adVideoEl.value.load();
                adVideoEl.value.remove();
            } catch (err) {
                console.error('[HLS Ads] Error cleaning up ad video element:', err);
            }
            adVideoEl.value = null;
        }
        parsedAds.value = [];
        adState.isPlayingAd = false;
        adState.currentAd = null;
        preRollPlayed = false;
    };

    const teardownHlsFallback = () => {
        cleanupAds();
        if (hlsInstance.value) {
            hlsInstance.value.destroy();
            hlsInstance.value = null;
        }
        if (fallbackEventCleanups.length) {
            fallbackEventCleanups.splice(0).forEach((cleanup) => cleanup());
        }

        if (hlsVideoEl.value) {
            try {
                hlsVideoEl.value.pause();
                hlsVideoEl.value.removeAttribute('src');
                hlsVideoEl.value.load();
                hlsVideoEl.value.remove();
            } catch (err) {
                console.error('[HLS Fallback] Error cleaning up video element:', err);
            }
            hlsVideoEl.value = null;
        }

        pendingPlayPromise = null;
    };

    const setKeyboardHandlers = (video: HTMLVideoElement) => {
        let volumeBarTimeout: NodeJS.Timeout | null = null;
        const keyboardHandler = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    if (hlsVideoEl.value) {
                        seek(Math.max(0, state.currentTime - 5));
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (hlsVideoEl.value) {
                        seek(Math.min(state.duration, state.currentTime + 5));
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    hlsFallbackState.showVolumeSlider = true;
                    setHlsFallbackVolume(Math.min(100, state.volume + 5));
                    if (volumeBarTimeout) {
                        clearTimeout(volumeBarTimeout);
                    }
                    volumeBarTimeout = setTimeout(() => {
                        hlsFallbackState.showVolumeSlider = false;
                        volumeBarTimeout = null;
                    }, 3000);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    hlsFallbackState.showVolumeSlider = true;
                    setHlsFallbackVolume(Math.max(0, state.volume - 5));
                    if (volumeBarTimeout) {
                        clearTimeout(volumeBarTimeout);
                    }
                    volumeBarTimeout = setTimeout(() => {
                        hlsFallbackState.showVolumeSlider = false;
                        volumeBarTimeout = null;
                    }, 3000);
                    break;
                case ' ':
                case 'k':
                    e.preventDefault();
                    toggleHlsFallbackPlay();
                    break;
            }
        };

        document.addEventListener('keydown', keyboardHandler);
        fallbackEventCleanups.push(() => document.removeEventListener('keydown', keyboardHandler));

        const addListener = (event: keyof HTMLVideoElementEventMap, handler: EventListener) => {
            video.addEventListener(event, handler);
            fallbackEventCleanups.push(() => video.removeEventListener(event, handler));
        };

        const updateBuffered = () => {
            if (!video.duration) return;
            const buffered = video.buffered;
            if (!buffered || buffered.length === 0) return;
            const end = buffered.end(buffered.length - 1);
            const percentage = Math.min(100, (end / video.duration) * 100);
            state.buffered = percentage;
            emit('buffer', { percentage });
        };

        addListener('timeupdate', () => {
            state.currentTime = video.currentTime;
            state.duration = video.duration || state.duration;
            emit('time', { position: video.currentTime, duration: video.duration || state.duration });
        });

        addListener('progress', updateBuffered);

        addListener('seeking', () => {
            state.isBuffering = true;
            emit('seek', { offset: video.currentTime });
        });
        addListener('seeked', () => {
            state.isBuffering = false;
        });
        addListener('waiting', () => {
            state.isBuffering = true;
        });
        addListener('canplay', () => {
            state.isBuffering = false;
        });
        addListener('play', () => {
            state.isPlaying = true;
            emit('play');
        });
        addListener('playing', () => {
            state.isBuffering = false;
        });
        addListener('pause', () => {
            state.isPlaying = false;
            emit('pause');
        });
        addListener('ended', () => {
            state.isPlaying = false;
            playPostRollAd();
            emit('complete');
        });
        addListener('loadedmetadata', () => {
            state.duration = video.duration || 0;
            isReady.value = true;
            emit('ready');
            updateBuffered();

            // Always try to initialize ads - will fetch from API or use props.advertising
            initializeAds().then(() => {
                if (props.autoplay) {
                    playPreRollAd();
                }
            });
        });
        addListener('volumechange', () => {
            state.volume = Math.round(video.volume * 100);
            state.isMuted = video.muted;
        });
        addListener('error', (event: Event) => {
            console.error('[HLS Fallback] Video error:', video.error || event);
            emit('error', video.error || event);
        });

        const onFullscreenChange = () => {
            const full = Boolean(document.fullscreenElement);
            state.isFullscreen = full;
            emit('fullscreen', full);
            if (full) {
                hlsFallbackState.showControls = true;
            }
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        fallbackEventCleanups.push(() => document.removeEventListener('fullscreenchange', onFullscreenChange));
    };

    const setupHlsFallback = async (source: string) => {
        if (!playerContainer.value) return;

        teardownHlsFallback();
        isReady.value = false;
        state.isPlaying = false;
        state.buffered = 0;
        state.currentTime = 0;
        state.duration = 0;

        playerContainer.value.innerHTML = '';
        const video = document.createElement('video');
        const sourceIsHls = isHlsSource(source);
        video.className = 'hls-fallback-player';
        video.playsInline = true;
        video.controls = false;
        video.autoplay = props.autoplay ?? false;
        video.muted = props.muted ?? false;
        video.preload = 'metadata';
        video.poster = props.video.thumbnail || '';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.volume = (state.volume ?? 100) / 100;

        hlsFallbackState.showControls = false;
        hlsFallbackState.playbackSpeed = 1;
        hlsFallbackState.volume = Math.round(video.volume * 100);

        playerContainer.value.appendChild(video);
        hlsVideoEl.value = video;

        setKeyboardHandlers(video);

        let HlsCtor: HlsModuleType['default'] | undefined;
        if (sourceIsHls) {
            try {
                const mod = await loadHlsLib();
                HlsCtor = (mod as any).default || (mod as any);
            } catch (err) {
                console.error('[HLS Fallback] Failed to load hls.js dynamically:', err);
            }
        }

        if (sourceIsHls && HlsCtor && typeof HlsCtor.isSupported === 'function' && HlsCtor.isSupported()) {
            const Events = HlsCtor.Events;
            const hls: Hls = new HlsCtor({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Events.MANIFEST_PARSED, () => {
                isReady.value = true;
                emit('ready');

                const levels = hls.levels || [];
                hlsFallbackState.availableQualities = levels.map((level, index) => {
                    let label = '';
                    if (level.height) {
                        label = `${level.height}p`;
                    } else if (level.bitrate) {
                        const bitrateKbps = level.bitrate / 1000;
                        let estimatedHeight = '';
                        if (bitrateKbps < 300) {
                            estimatedHeight = '144p';
                        } else if (bitrateKbps < 700) {
                            estimatedHeight = '240p';
                        } else if (bitrateKbps < 1500) {
                            estimatedHeight = '360p';
                        } else if (bitrateKbps < 3000) {
                            estimatedHeight = '480p';
                        } else if (bitrateKbps < 6000) {
                            estimatedHeight = '720p';
                        } else if (bitrateKbps < 10000) {
                            estimatedHeight = '1080p';
                        } else if (bitrateKbps < 16000) {
                            estimatedHeight = '1440p';
                        } else {
                            estimatedHeight = '4K';
                        }
                        label = estimatedHeight;
                    } else {
                        label = `Level ${index + 1}`;
                    }
                    return { label, index };
                });
                hlsFallbackState.currentQuality = -1;
            });
            hls.on(Events.LEVEL_SWITCHING, () => {
                state.isBuffering = true;
            });
            hls.on(Events.LEVEL_SWITCHED, (_event: any, data: any) => {
                hlsFallbackState.currentQuality = hls.autoLevelEnabled ? -1 : data.level;
                state.isBuffering = false;
            });
            hls.on(Events.BUFFER_APPENDING, () => {
                state.isBuffering = true;
            });
            hls.on(Events.BUFFER_APPENDED, () => {
                state.isBuffering = false;
            });
            hls.on(Events.ERROR, (_event: any, data: any) => {
                if (data?.fatal) {
                    console.error('[HLS Fallback] Fatal HLS error:', data);
                    emit('error', data);
                } else {
                    console.warn('[HLS Fallback] Non-fatal HLS error:', data);
                }
            });
            hlsInstance.value = hls;
        } else if (sourceIsHls && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }

        if (video.autoplay) {
            safePlay();
        }
    };

    const play = () => {
        if (adState.isPlayingAd && adVideoEl.value) {
            if (adVideoEl.value.paused) {
                adVideoEl.value.play();
                adUiState.isPaused = false;
            }
            return;
        }
        safePlay();
    };

    const pause = () => {
        if (adState.isPlayingAd && adVideoEl.value) {
            adVideoEl.value.pause();
            adUiState.isPaused = true;
            return;
        }
        hlsVideoEl.value?.pause();
    };

    const stop = () => {
        if (hlsVideoEl.value) {
            hlsVideoEl.value.pause();
            hlsVideoEl.value.currentTime = 0;
        }
    };

    const seek = (position: number) => {
        if (!hlsVideoEl.value) return;
        hlsVideoEl.value.currentTime = Math.max(0, position);
    };

    const setVolume = (volume: number) => {
        if (!hlsVideoEl.value) return;
        const clamped = Math.max(0, Math.min(100, volume));
        hlsVideoEl.value.volume = clamped / 100;
        state.volume = clamped;
    };

    const setMute = (muted: boolean) => {
        if (!hlsVideoEl.value) return;
        hlsVideoEl.value.muted = muted;
        state.isMuted = muted;
    };

    const setPlaybackRate = (rate: number) => {
        if (!hlsVideoEl.value) return;
        hlsVideoEl.value.playbackRate = rate;
        hlsFallbackState.playbackSpeed = rate;
    };

    const toggleFullscreen = () => {
        if (!wrapperElement.value) return;

        if (!document.fullscreenElement) {
            wrapperElement.value.requestFullscreen?.();
            state.isFullscreen = true;
            emit('fullscreen', true);
        } else {
            document.exitFullscreen?.();
            state.isFullscreen = false;
            emit('fullscreen', false);
        }
    };

    const getPosition = () => hlsVideoEl.value?.currentTime || 0;
    const getDuration = () => hlsVideoEl.value?.duration || 0;
    const getState = () => {
        if (!hlsVideoEl.value) return 'idle';
        if (hlsVideoEl.value.paused) return 'paused';
        return 'playing';
    };

    const setHlsFallbackQuality = (qualityIndex: number) => {
        if (!hlsInstance.value) return;
        if (qualityIndex === -1) {
            hlsInstance.value.currentLevel = -1;
            hlsFallbackState.currentQuality = -1;
        } else {
            hlsInstance.value.currentLevel = qualityIndex;
            hlsFallbackState.currentQuality = qualityIndex;
        }
    };

    const setHlsFallbackSpeed = (speed: number) => {
        if (!hlsVideoEl.value) return;
        hlsVideoEl.value.playbackRate = speed;
        hlsFallbackState.playbackSpeed = speed;
    };

    const toggleHlsFallbackPlay = () => {
        if (adState.isPlayingAd && adVideoEl.value) {
            toggleAdPlayPause();
            return;
        }

        const videoEl = hlsVideoEl.value;
        if (!videoEl) {
            return;
        }
        if (videoEl.paused) {
            play();
        } else {
            pause();
        }
    };

    const handleVideoHitareaClick = () => {
        hlsFallbackState.playPauseEffectIcon = state.isPlaying ? 'pause' : 'play';
        hlsFallbackState.showPlayPauseEffect = true;
        toggleHlsFallbackPlay();
        setTimeout(() => {
            hlsFallbackState.showPlayPauseEffect = false;
        }, 500);
    };

    const formatTime = (seconds: number): string => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleHlsFallbackMute = () => {
        if (state.isMuted) {
            const restoreVolume = lastVolumeBeforeMute.value > 0 ? lastVolumeBeforeMute.value : 100;
            setMute(false);
            setHlsFallbackVolume(restoreVolume);
        } else {
            const currentVolume = state.volume > 0 ? state.volume : hlsFallbackState.volume || 100;
            lastVolumeBeforeMute.value = currentVolume || 100;
            setHlsFallbackVolume(0);
            setMute(true);
        }
    };

    const setHlsFallbackVolume = (volume: number) => {
        const clamped = Math.max(0, Math.min(100, volume));
        if (!state.isMuted && clamped > 0) {
            lastVolumeBeforeMute.value = clamped;
        }
        setVolume(clamped);
        hlsFallbackState.volume = clamped;
        if (clamped > 0 && state.isMuted) {
            setMute(false);
        }
    };

    const handleMouseEnter = () => {
        hlsFallbackState.showControls = true;
        if (fullscreenControlsTimeout) {
            clearTimeout(fullscreenControlsTimeout);
            fullscreenControlsTimeout = null;
        }
    };

    const handleMouseLeave = () => {
        if (state.isFullscreen) {
            if (fullscreenControlsTimeout) {
                clearTimeout(fullscreenControlsTimeout);
            }
            fullscreenControlsTimeout = setTimeout(() => {
                hlsFallbackState.showControls = false;
                fullscreenControlsTimeout = null;
            }, 3000);
        } else {
            hlsFallbackState.showControls = false;
        }
    };

    const handleMouseMove = () => {
        hlsFallbackState.showControls = true;
        if (state.isFullscreen) {
            if (fullscreenControlsTimeout) {
                clearTimeout(fullscreenControlsTimeout);
            }
            fullscreenControlsTimeout = setTimeout(() => {
                hlsFallbackState.showControls = false;
                fullscreenControlsTimeout = null;
            }, 3000);
        }
    };

    const togglePictureInPicture = async () => {
        if (!hlsVideoEl.value) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (hlsVideoEl.value) {
                await hlsVideoEl.value.requestPictureInPicture();
            }
        } catch (error) {
            console.error('[HLS Fallback] Picture-in-Picture error:', error);
        }
    };

    const cleanupPlayer = () => {
        cleanupAds();
        teardownHlsFallback();
        isReady.value = false;
    };

    const reloadPlayerWithNewVideo = async (newVideo: any) => {
        if (!newVideo) {
            console.warn('[HLS Fallback] No video provided for reload');
            return;
        }

        const source = newVideo.videoUrl || 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8';
        cleanupPlayer();
        await setupHlsFallback(source);
    };

    return {
        // state
        playerContainer,
        wrapperElement,
        isReady,
        hlsFallbackState,
        adState,
        adUiState,
        state,

        // setup/teardown
        setupHlsFallback,
        cleanupPlayer,
        reloadPlayerWithNewVideo,

        // playback
        play,
        pause,
        stop,
        seek,
        setVolume,
        setMute,
        setPlaybackRate,
        toggleFullscreen,
        getPosition,
        getDuration,
        getState,
        toggleHlsFallbackPlay,
        toggleHlsFallbackMute,
        setHlsFallbackVolume,
        setHlsFallbackQuality,
        setHlsFallbackSpeed,
        togglePictureInPicture,

        // ui handlers
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove,
        handleVideoHitareaClick,
        formatTime,

        // ads
        toggleAdPlayPause,
        toggleAdMute,
        skipAd,
        adVideoEl,
    };
};
