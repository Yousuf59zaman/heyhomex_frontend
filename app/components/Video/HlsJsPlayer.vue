<script setup lang="ts">
import type Hls from 'hls.js';
import type { Video } from '~/composables/useVideoPlayer';
import { useHlsPlayerAds, type ParsedAd, type AdvertisingConfigHls } from '~/composables/useHlsPlayerAds';
interface AdPlaybackState {
    isPlayingAd: boolean;
    currentAd: ParsedAd | null;
    adCurrentTime: number;
    adDuration: number;
    canSkip: boolean;
    skipTimeRemaining: number;
}
interface Props {
    video: Video;
    autoplay?: boolean;
    controls?: boolean;
    muted?: boolean;
    playbackRate?: number;
    aspectRatio?: string;
    advertising?: AdvertisingConfigHls;
}

const props = withDefaults(defineProps<Props>(), {
    autoplay: false,
    controls: true,
    muted: false,
    playbackRate: 1,
    aspectRatio: '16:9',
});

const emit = defineEmits<{
    ready: [];
    play: [];
    pause: [];
    complete: [];
    error: [error: any];
    time: [data: { position: number; duration: number }];
    seek: [data: { offset: number }];
    buffer: [data: { percentage: number }];
    fullscreen: [isFullscreen: boolean];
    adImpression: [data: { tag: string }];
    adComplete: [data: { tag: string }];
    adSkipped: [data: { tag: string }];
    adError: [error: any];
    adClick: [data: { tag: string }];
}>();

const playerContainer = ref<HTMLDivElement | null>(null);
const wrapperElement = ref<HTMLDivElement | null>(null);
const isReady = ref(false);
const hlsInstance = ref<Hls | null>(null);
const hlsVideoEl = ref<HTMLVideoElement | null>(null);
const adVideoEl = ref<HTMLVideoElement | null>(null);
const fallbackEventCleanups: Array<() => void> = [];
let pendingPlayPromise: Promise<void> | null = null;
let fullscreenControlsTimeout: NodeJS.Timeout | null = null;

// Ad-related state
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

// HLS Fallback UI state
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

// Initialize ad utilities
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

    // Ad video event listeners
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

const playAd = async (ad: ParsedAd) => {
    if (!adVideoEl.value || !hlsVideoEl.value || !ad.mediaFileUrl) return;

    try {
        // console.log('[HLS Ads] Playing ad:', ad);
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

        emit('adImpression', { tag: ad.vastTag });
    } catch (error) {
        console.error('[HLS Ads] Error playing ad:', error);
        emit('adError', error);
        handleAdComplete();
    }
};

const skipAd = () => {
    if (!adState.canSkip || !adState.currentAd) return;

    console.log('[HLS Ads] Ad skipped');

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

    // Reset ad state
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

const handleAdClick = () => {
    if (!adState.currentAd?.clickThroughUrl) return;

    console.log('[HLS Ads] Ad clicked:', adState.currentAd.clickThroughUrl);
    if (adState.currentAd.vastResponse) {
        trackEvent(adState.currentAd.vastResponse, 'clickTracking');
    }
    emit('adClick', { tag: adState.currentAd.vastTag });
    if (typeof window !== 'undefined') {
        window.open(adState.currentAd.clickThroughUrl, '_blank', 'noopener,noreferrer');
    }
};

const toggleAdPlayPause = () => {
    if (!adVideoEl.value || !adState.isPlayingAd) {
        return;
    }

    if (adVideoEl.value.paused) {
        adVideoEl.value.play();
        console.log('[HLS Ads] Ad resumed');
        adUiState.isPaused = false;
    } else {
        adVideoEl.value.pause();
        console.log('[HLS Ads] Ad paused');
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

const initializeAds = async () => {
    if (!props.advertising || !props.advertising.schedule) return;

    try {
        console.log('[HLS Ads] Initializing ads...');
        const ads = await processAdSchedule(
            props.advertising.schedule,
            props.advertising.skipoffset || 5
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

    // Initialize fallback UI state
    hlsFallbackState.showControls = false;
    hlsFallbackState.playbackSpeed = 1;
    hlsFallbackState.volume = Math.round(video.volume * 100);

    playerContainer.value.appendChild(video);
    hlsVideoEl.value = video;

    // Add keyboard controls
    let volumeBarTimeout: NodeJS.Timeout | null = null;
    const keyboardHandler = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                // Seek backward 5 seconds
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

        if (props.advertising) {
            initializeAds().then(() => {
                if (props.autoplay) {
                    playPreRollAd();
                }
            });
        }
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

            // Populate quality levels - Show only height in 'p' format
            const levels = hls.levels || [];
            hlsFallbackState.availableQualities = levels.map((level, index) => {
                let label = '';
                if (level.height) {
                    label = `${level.height}p`;
                } else if (level.bitrate) {
                    // Convert bitrate to approximate resolution
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
                return {
                    label,
                    index,
                };
            });
            hlsFallbackState.currentQuality = -1; // Auto by default
        });
        hls.on(Events.LEVEL_SWITCHING, () => {
            state.isBuffering = true;
        });
        hls.on(Events.LEVEL_SWITCHED, (_event: any, data: any) => {
            if (hls.autoLevelEnabled) {
                hlsFallbackState.currentQuality = -1;
            } else {
                hlsFallbackState.currentQuality = data.level;
            }
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

const getPosition = () => {
    return hlsVideoEl.value?.currentTime || 0;
};

const getDuration = () => {
    return hlsVideoEl.value?.duration || 0;
};

const getState = () => {
    if (!hlsVideoEl.value) return 'idle';
    if (hlsVideoEl.value.paused) return 'paused';
    return 'playing';
};

const setHlsFallbackQuality = (qualityIndex: number) => {
    if (!hlsInstance.value) return;

    if (qualityIndex === -1) {
        // Auto quality
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
    // Show play/pause effect based on current state
    hlsFallbackState.playPauseEffectIcon = state.isPlaying ? 'pause' : 'play';
    hlsFallbackState.showPlayPauseEffect = true;

    // Toggle play/pause
    toggleHlsFallbackPlay();

    // Hide effect after animation
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

// Mouse event handlers for controls visibility
const handleMouseEnter = () => {
    hlsFallbackState.showControls = true;

    // Clear any existing timeout
    if (fullscreenControlsTimeout) {
        clearTimeout(fullscreenControlsTimeout);
        fullscreenControlsTimeout = null;
    }
};

const handleMouseLeave = () => {
    // Don't hide controls in fullscreen mode
    if (state.isFullscreen) {
        // In fullscreen, start auto-hide timer
        if (fullscreenControlsTimeout) {
            clearTimeout(fullscreenControlsTimeout);
        }
        fullscreenControlsTimeout = setTimeout(() => {
            hlsFallbackState.showControls = false;
            fullscreenControlsTimeout = null;
        }, 3000);
    } else {
        // Not in fullscreen, hide immediately
        hlsFallbackState.showControls = false;
    }
};

const handleMouseMove = () => {
    hlsFallbackState.showControls = true;

    // In fullscreen, reset auto-hide timer on mouse move
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

// Expose methods for parent components
defineExpose({
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
    state,
    isReady,
});

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

onMounted(async () => {
    const source = props.video.videoUrl || 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8';
    await setupHlsFallback(source);
});

onBeforeUnmount(() => {
    cleanupPlayer();
});

watch(
    () => props.video,
    async (newVideo, oldVideo) => {
        if (newVideo && oldVideo && newVideo.id !== oldVideo.id) {
            console.log('[HLS Fallback] Video changed, reloading player...');
            await reloadPlayerWithNewVideo(newVideo);
        }
    }
);
</script>

<template>
    <div ref="wrapperElement" class="jwplayer-wrapper relative w-full h-full bg-black rounded-lg overflow-hidden"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @mousemove="handleMouseMove">
        <div ref="playerContainer" class="absolute inset-0"></div>
        <div v-if="!isReady"
            class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div class="text-center text-white">
                <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin mx-auto mb-2" />
                <p class="text-sm">Loading player...</p>
            </div>
        </div>
        <div v-if="isReady && state.isBuffering && !adState.isPlayingAd"
            class="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div class="hls-buffering-spinner">
                <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-white" />
            </div>
        </div>
        <div v-if="hlsFallbackState.showPlayPauseEffect" class="hls-play-pause-effect">
            <div class="hls-effect-icon">
                <Icon v-if="hlsFallbackState.playPauseEffectIcon === 'play'" name="lucide:play" class="w-6 h-6" />
                <Icon v-else name="lucide:pause" class="w-6 h-6" />
            </div>
        </div>
        <div v-if="isReady && !adState.isPlayingAd" class="hls-video-hitarea" @click="handleVideoHitareaClick"></div>
        <div v-if="adState.isPlayingAd" class="hls-ad-overlay" @click="toggleAdPlayPause">
            <div class="hls-ad-controls" @click.stop>
                <div class="hls-ad-left">
                    <button
                        type="button"
                        class="hls-ad-icon-btn"
                        :aria-label="adUiState.isPaused ? 'Play ad' : 'Pause ad'"
                        @click="toggleAdPlayPause"
                    >
                        <Icon v-if="adUiState.isPaused" name="lucide:play" class="w-5 h-5" />
                        <Icon v-else name="lucide:pause" class="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        class="hls-ad-icon-btn"
                        :aria-label="adUiState.isMuted ? 'Unmute ad' : 'Mute ad'"
                        @click="toggleAdMute"
                    >
                        <Icon v-if="adUiState.isMuted" name="lucide:volume-x" class="w-5 h-5" />
                        <Icon v-else name="lucide:volume-2" class="w-5 h-5" />
                    </button>
                    <div class="hls-ad-message">
                        This ad will end in {{ Math.ceil(Math.max(0, adState.adDuration - adState.adCurrentTime)) }} seconds
                    </div>
                </div>
                <button
                    v-if="adState.canSkip"
                    @click="skipAd"
                    class="hls-ad-skip-button"
                >
                    <span>Skip Ad</span>
                </button>
            </div>

            <div class="hls-ad-progress-bar">
                <div
                    class="hls-ad-progress-fill"
                    :style="{ width: (adState.adCurrentTime / (adState.adDuration || 1)) * 100 + '%' }"
                ></div>
            </div>
        </div>
        <div v-if="isReady && !adState.isPlayingAd"
            :class="['hls-custom-controls', { 'show': hlsFallbackState.showControls }]">
            <div class="hls-progress-container">
                <div class="hls-progress-wrapper">
                    <!-- Background track -->
                    <div class="hls-progress-track"></div>
                    <!-- Buffered portion -->
                    <div class="hls-progress-buffered" :style="{ width: state.buffered + '%' }"></div>
                    <!-- Played portion -->
                    <div class="hls-progress-played" :style="{ width: (state.currentTime / (state.duration || 1)) * 100 + '%' }"></div>
                    <!-- Seekable input -->
                    <input
                        type="range"
                        class="hls-progress-bar"
                        :value="state.currentTime"
                        :max="state.duration || 100"
                        @input="seek(($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>
            </div>

            <!-- Control Buttons -->
            <div class="hls-controls-row">
                <!-- Play/Pause -->
                <button @click="toggleHlsFallbackPlay" class="hls-control-btn">
                    <Icon v-if="state.isPlaying" name="lucide:pause" class="w-5 h-5" />
                    <Icon v-else name="lucide:play" class="w-5 h-5" />
                </button>

                <!-- Volume -->
                <div class="hls-volume-group"
                    @mouseenter="hlsFallbackState.showVolumeSlider = true"
                    @mouseleave="hlsFallbackState.showVolumeSlider = false">
                    <button @click="toggleHlsFallbackMute" class="hls-control-btn">
                        <Icon v-if="state.isMuted || state.volume === 0" name="lucide:volume-x" class="w-5 h-5" />
                        <Icon v-else-if="state.volume < 50" name="lucide:volume-1" class="w-5 h-5" />
                        <Icon v-else name="lucide:volume-2" class="w-5 h-5" />
                    </button>
                    <input
                        v-if="hlsFallbackState.showVolumeSlider"
                        type="range"
                        class="hls-volume-slider"
                        :value="state.volume"
                        min="0"
                        max="100"
                        @input="setHlsFallbackVolume(($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>

                <!-- Time Display -->
                <span class="hls-time-display">
                    {{ formatTime(state.currentTime) }} / {{ formatTime(state.duration) }}
                </span>

                <div class="flex-1"></div>

                <!-- Combined Settings (Quality & Playback Speed) -->
                <div class="hls-settings-group">
                    <button @click="hlsFallbackState.showSettings = !hlsFallbackState.showSettings" class="hls-control-btn">
                        <Icon name="lucide:settings" class="w-5 h-5" />
                    </button>
                    <div v-if="hlsFallbackState.showSettings" class="hls-settings-menu" @click.stop>
                        <!-- Settings Tabs -->
                        <div class="hls-settings-header">
                            <div class="hls-settings-tabs">
                                <button
                                    @click="hlsFallbackState.settingsTab = 'quality'"
                                    :class="['hls-settings-tab', { 'active': hlsFallbackState.settingsTab === 'quality' }]"
                                >
                                    Quality
                                </button>
                                <button
                                    @click="hlsFallbackState.settingsTab = 'speed'"
                                    :class="['hls-settings-tab', { 'active': hlsFallbackState.settingsTab === 'speed' }]"
                                >
                                    Playback Speed
                                </button>
                            </div>
                            <button @click="hlsFallbackState.showSettings = false" class="hls-settings-close">
                                <Icon name="lucide:x" class="w-4 h-4" />
                            </button>
                        </div>

                        <!-- Settings Content -->
                        <div class="hls-settings-content">
                            <!-- Quality Options -->
                            <div v-if="hlsFallbackState.settingsTab === 'quality'" class="hls-settings-panel">
                                <button
                                    @click="setHlsFallbackQuality(-1); hlsFallbackState.showSettings = false"
                                    :class="['hls-menu-item', { 'active': hlsFallbackState.currentQuality === -1 }]"
                                >
                                    <span>Auto</span>
                                    <Icon v-if="hlsFallbackState.currentQuality === -1" name="lucide:play" class="w-4 h-4 ml-auto hls-active-icon" />
                                </button>
                                <button
                                    v-for="quality in hlsFallbackState.availableQualities"
                                    :key="quality.index"
                                    @click="setHlsFallbackQuality(quality.index); hlsFallbackState.showSettings = false"
                                    :class="['hls-menu-item', { 'active': hlsFallbackState.currentQuality === quality.index }]"
                                >
                                    <span>{{ quality.label }}</span>
                                    <Icon v-if="hlsFallbackState.currentQuality === quality.index" name="lucide:play" class="w-4 h-4 ml-auto hls-active-icon" />
                                </button>
                            </div>

                            <!-- Playback Speed Options -->
                            <div v-if="hlsFallbackState.settingsTab === 'speed'" class="hls-settings-panel">
                                <button
                                    v-for="speed in [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]"
                                    :key="speed"
                                    @click="setHlsFallbackSpeed(speed); hlsFallbackState.showSettings = false"
                                    :class="['hls-menu-item', { 'active': hlsFallbackState.playbackSpeed === speed }]"
                                >
                                    <span>{{ speed === 1 ? 'Normal' : speed + 'x' }}</span>
                                    <Icon v-if="hlsFallbackState.playbackSpeed === speed" name="lucide:play" class="w-4 h-4 ml-auto hls-active-icon" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Picture-in-Picture -->
                <button @click="togglePictureInPicture" class="hls-control-btn" title="Picture-in-Picture">
                    <Icon name="lucide:picture-in-picture-2" class="w-5 h-5" />
                </button>

                <!-- Fullscreen -->
                <button @click="toggleFullscreen" class="hls-control-btn">
                    <Icon v-if="state.isFullscreen" name="lucide:minimize" class="w-5 h-5" />
                    <Icon v-else name="lucide:maximize" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- Custom Overlay (if needed for additional controls) -->
        <slot name="overlay" :state="state" :player="{ play, pause, seek, setVolume }"></slot>
    </div>
</template>

<style scoped>
.jwplayer-wrapper {
    min-height: 200px;
}

@media (min-width: 640px) {
    .jwplayer-wrapper {
        min-height: 300px;
    }
}

@media (min-width: 1024px) {
    .jwplayer-wrapper {
        min-height: 400px;
    }
}

/* Fullscreen mode styling - Using deep selector for proper application */
:deep(.jwplayer-wrapper:fullscreen),
.jwplayer-wrapper:fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
}

:deep(.jwplayer-wrapper:fullscreen .hls-fallback-player),
.jwplayer-wrapper:fullscreen .hls-fallback-player {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
}

:deep(.jwplayer-wrapper:fullscreen .hls-custom-controls),
.jwplayer-wrapper:fullscreen .hls-custom-controls {
    opacity: 1 !important;
    transform: translateY(0) !important;
    pointer-events: auto !important;
    display: block !important;
    z-index: 9999 !important;
}

/* Ensure JW Player fills the container */
:deep(.jw-wrapper) {
    border-radius: 0.5rem;
}

:deep(.hls-fallback-player) {
    background: #000;
}

/* Buffering Spinner */
.hls-buffering-spinner {
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Play/Pause Effect Overlay */
.hls-play-pause-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 60;
    animation: fadeInOut 0.5s ease;
}

.hls-effect-icon {
    background: rgba(0, 0, 0, 0.8);
    border-radius: 50px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    animation: scaleUp 0.3s ease;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
    }
    20% {
        opacity: 1;
    }
    80% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

@keyframes scaleUp {
    0% {
        transform: scale(0.8);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

/* HLS Fallback Custom Controls */
.hls-custom-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 70%, transparent 100%);
    padding: 16px 12px 12px;
    z-index: 50;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
}

.hls-custom-controls.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.hls-progress-container {
    margin-bottom: 12px;
    padding: 4px 0;
}

.hls-progress-wrapper {
    position: relative;
    width: 100%;
    height: 18px;
    cursor: pointer;
}

.hls-progress-track {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.hls-progress-buffered {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    height: 6px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 3px;
    transition: width 0.3s ease;
    pointer-events: none;
}

.hls-progress-played {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    height: 6px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 3px;
    transition: width 0.1s linear;
    pointer-events: none;
}

.hls-progress-bar {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 18px;
    transform: translateY(-50%);
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    outline: none;
    z-index: 2;
}

.hls-progress-bar::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    background: transparent;
    border-radius: 3px;
}

.hls-progress-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    background: #FF6C00;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -4px;
    box-shadow: 0 2px 6px rgba(255, 108, 0, 0.5);
    transition: transform 0.2s ease;
}

.hls-progress-bar:hover::-webkit-slider-thumb {
    transform: scale(1.2);
}

.hls-progress-bar::-moz-range-track {
    width: 100%;
    height: 6px;
    background: transparent;
    border-radius: 3px;
}

.hls-progress-bar::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #FF6C00;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(255, 108, 0, 0.5);
    transition: transform 0.2s ease;
}

.hls-progress-bar:hover::-moz-range-thumb {
    transform: scale(1.2);
}

.hls-progress-bar::-moz-range-progress {
    background: transparent;
    height: 6px;
    border-radius: 3px;
}

.hls-controls-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hls-control-btn {
    background: transparent;
    border: none;
    color: #ffffff;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    min-width: 40px;
    height: 40px;
}

.hls-control-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #FF6C00;
    transform: translateY(-1px);
}

.hls-control-btn:active {
    transform: translateY(0);
}

.hls-speed-btn {
    font-size: 14px;
    font-weight: 600;
    min-width: 50px;
}

.hls-volume-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hls-volume-slider {
    width: 120px;
    height: 18px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    outline: none;
}

.hls-volume-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.hls-volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    background: #FF6C00;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -4px;
}

.hls-volume-slider::-moz-range-track {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.hls-volume-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #FF6C00;
    border: none;
    border-radius: 50%;
    cursor: pointer;
}

.hls-time-display {
    color: #ffffff;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    padding: 0 8px;
}

.hls-settings-group {
    position: relative;
}

.hls-dropdown-menu {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 8px;
    background: linear-gradient(135deg, rgba(14, 17, 22, 0.98), rgba(12, 20, 30, 0.98));
    backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5), 0 2px 12px rgba(0, 0, 0, 0.4);
    min-width: 180px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
}

.hls-settings-menu {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 8px;
    background: linear-gradient(135deg, rgba(14, 17, 22, 0.98), rgba(12, 20, 30, 0.98));
    backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5), 0 2px 12px rgba(0, 0, 0, 0.4);
    min-width: 240px;
    z-index: 100;
}

.hls-settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.hls-settings-tabs {
    display: flex;
    gap: 4px;
    flex: 1;
}

.hls-settings-tab {
    flex: 1;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    position: relative;
}

.hls-settings-tab:hover {
    color: rgba(255, 255, 255, 0.9);
}

.hls-settings-tab.active {
    color: #ffffff;
    border-bottom-color: #3b82f6;
}

.hls-settings-close {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.hls-settings-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
}

.hls-settings-content {
    max-height: 300px;
    overflow-y: auto;
}

.hls-settings-panel {
    padding: 4px;
}

.hls-menu-header {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.hls-menu-item {
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: rgba(232, 237, 245, 0.9);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 2px 4px;
}

.hls-menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
}

.hls-menu-item.active {
    background: rgba(255, 108, 0, 0.15);
    color: #FF6C00;
    font-weight: 600;
}

.hls-menu-item.active:hover {
    background: rgba(255, 108, 0, 0.25);
}

.hls-active-icon {
    color: #3b82f6 !important;
    transform: rotate(0deg);
}

/* Scrollbar styling for dropdown menus */
.hls-dropdown-menu::-webkit-scrollbar,
.hls-settings-content::-webkit-scrollbar {
    width: 8px;
}

.hls-dropdown-menu::-webkit-scrollbar-track,
.hls-settings-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.hls-dropdown-menu::-webkit-scrollbar-thumb,
.hls-settings-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

.hls-dropdown-menu::-webkit-scrollbar-thumb:hover,
.hls-settings-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* YouTube-like skin customization */
:deep(.jw-controls) {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

:deep(.jw-button-color) {
    color: #ffffff !important;
}

:deep(.jw-button-color:hover) {
    color: #ef4444 !important;
}

:deep(.jw-progress) {
    background: rgba(255, 255, 255, 0.3);
}

:deep(.jw-progress-bar) {
    background: #ef4444 !important;
}

:deep(.jw-knob) {
    background-color: #ef4444 !important;
}

/* Video Hitarea Styles (for main video click-to-play) */
.hls-video-hitarea {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 35;
    cursor: pointer;
    pointer-events: auto;
}

/* Ad Overlay Styles */
.hls-ad-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.2);
}

.hls-ad-controls {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 16px 20px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
    z-index: 2;
    pointer-events: none;
}

.hls-ad-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    pointer-events: auto;
}

.hls-ad-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    pointer-events: auto;
}

.hls-ad-icon-btn:hover {
    background: rgba(0, 0, 0, 0.85);
    border-color: rgba(255, 255, 255, 0.35);
    color: #ffffff;
    transform: translateY(-1px);
}

.hls-ad-icon-btn:active {
    transform: translateY(0);
}

.hls-ad-message {
    color: #ffffff;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.3px;
    opacity: 0.95;
    pointer-events: none;
}

.hls-ad-skip-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 20px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    pointer-events: auto;
    letter-spacing: 0.3px;
}

.hls-ad-skip-button:hover {
    background: rgba(0, 0, 0, 0.95);
    border-color: rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
}

.hls-ad-skip-button:active {
    transform: translateY(0);
}

.hls-ad-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.2);
    z-index: 3;
}

.hls-ad-progress-fill {
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
    transition: width 0.2s linear;
}

/* Responsive Ad Overlay */
@media (max-width: 640px) {
    .hls-ad-controls {
        padding: 12px 16px;
    }

    .hls-ad-message {
        font-size: 12px;
    }

    .hls-ad-skip-button {
        font-size: 12px;
        padding: 7px 16px;
    }
}
</style>

