<script setup lang="ts">
/**
 * JW Player Wrapper Component
 *
 * A Vue 3 wrapper around JW Player with YouTube-like features:
 * - Responsive video playback
 * - Custom controls
 * - Quality selection
 * - Playback speed control
 * - Keyboard shortcuts
 * - Picture-in-picture support
 * - Auto-quality selection
 *
 * @see https://developer.jwplayer.com/
 */

import Hls from 'hls.js';
import type { Video } from '~/composables/useVideoPlayer';

interface AdSchedule {
    offset: string; // 'pre', 'post', '50%', or time in seconds
    tag: string; // VAST tag URL
    type?: 'linear' | 'nonlinear'; // Ad type (default: linear)
}

interface AdvertisingConfig {
    client: 'vast' | 'googima'; // Ad client type
    schedule?: AdSchedule[]; // Ad schedule (pre-roll, mid-roll, post-roll)
    skipoffset?: number; // Seconds before skip button appears
    admessage?: string; // Custom ad message
    skipmessage?: string; // Custom skip message
    vpaidcontrols?: boolean; // Show controls during VPAID ads
    autoplayadsmuted?: boolean; // Auto-play ads muted
}

interface Props {
    video: Video;
    autoplay?: boolean;
    controls?: boolean;
    muted?: boolean;
    playbackRate?: number;
    aspectRatio?: string;
    advertising?: AdvertisingConfig; // Advertising configuration
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
    adImpression: [data: { tag: string }]; // Ad started
    adComplete: [data: { tag: string }]; // Ad finished
    adSkipped: [data: { tag: string }]; // Ad skipped
    adError: [error: any]; // Ad error
    adClick: [data: { tag: string }]; // Ad clicked
}>();

// Unique player ID
const playerId = ref(`jwplayer-${Math.random().toString(36).substr(2, 9)}`);
const playerContainer = ref<HTMLDivElement | null>(null);
const wrapperElement = ref<HTMLDivElement | null>(null);
const playerInstance = ref<any>(null);
const isReady = ref(false);
const currentSource = ref('');
const usingHlsFallback = ref(false);
const hlsInstance = ref<Hls | null>(null);
const hlsVideoEl = ref<HTMLVideoElement | null>(null);
const fallbackEventCleanups: Array<() => void> = [];
let pendingPlayPromise: Promise<void> | null = null;
let attemptedFallbackFromError = false;
let fullscreenControlsTimeout: NodeJS.Timeout | null = null;

// HLS Fallback UI state
const hlsFallbackState = reactive({
    showControls: false,
    showSettings: false,
    settingsTab: 'quality' as 'quality' | 'speed', // Active tab in settings menu
    currentQuality: -1, // -1 means "Auto"
    availableQualities: [] as Array<{ label: string; index: number }>,
    playbackSpeed: 1,
    volume: 100,
    showVolumeSlider: false,
    showPlayPauseEffect: false,
    playPauseEffectIcon: 'play' as 'play' | 'pause',
});

// Player state
const state = reactive({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 100,
    isMuted: false,
    isFullscreen: false,
});

const isHlsSource = (src: string) => src?.toLowerCase().includes('.m3u8');

const canPlayHlsNatively = () => {
    if (typeof document === 'undefined') return false;
    const video = document.createElement('video');
    return Boolean(video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL'));
};

/**
 * Safe play helper to avoid unhandled AbortError when pausing during pending play()
 */
const safePlay = () => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        if (pendingPlayPromise) return pendingPlayPromise;
        const attempt = hlsVideoEl.value.play();
        if (attempt && typeof attempt.catch === 'function') {
            pendingPlayPromise = attempt
                .catch((err) => {
                    if (!err || err.name === 'AbortError') return;
                    console.error('[HLS Fallback] Playback start failed:', err);
                })
                .finally(() => {
                    pendingPlayPromise = null;
                });
        }
        return attempt;
    }

    return playerInstance.value?.play();
};

/**
 * Initialize JW Player
 */
const initializePlayer = () => {
    try {
        // Get video source
        const videoSource = props.video.videoUrl || 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8';
        currentSource.value = videoSource;
        attemptedFallbackFromError = false;

        const jwplayer = typeof window !== 'undefined' ? (window as any).jwplayer : null;
        const sourceIsHls = isHlsSource(videoSource);
        if (!jwplayer) {
            console.warn('[JWPlayer] Library not loaded, using HLS.js/native fallback');
            setupHlsFallback(videoSource);
            return;
        }

        // Setup player configuration
        const config: any = {
            file: videoSource,
            image: props.video.thumbnail,
            title: props.video.title,
            description: props.video.description || props.video.subtitle,
            aspectratio: props.aspectRatio,
            width: '100%',
            height: '100%',
            autostart: props.autoplay,
            mute: props.muted,
            controls: props.controls,
            playbackRateControls: true,
            playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            stretching: 'uniform',
            preload: 'metadata',
            primary: 'html5',

            // YouTube-like features
            displaytitle: true,
            displaydescription: true,

            // Responsive
            responsive: true,

            // Quality levels (will be populated from adaptive streaming)
            qualityLabels: {
                0: 'Auto',
                360: '360p',
                480: '480p',
                720: '720p HD',
                1080: '1080p Full HD',
                1440: '1440p QHD',
                2160: '4K UHD',
            },

            // Skin customization for YouTube-like appearance
            skin: {
                name: 'heyhomex',
            },

            // Related videos plugin (can be configured later)
            related: {
                displayMode: 'shelf',
                oncomplete: 'show',
            },
        };

        // Add advertising configuration if provided
        if (props.advertising) {
            config.advertising = {
                client: props.advertising.client || 'vast',
                schedule: props.advertising.schedule || [],
                skipoffset: props.advertising.skipoffset !== undefined ? props.advertising.skipoffset : 5,
                admessage: props.advertising.admessage || 'Ad will end in xx seconds',
                skipmessage: props.advertising.skipmessage || 'Skip ad',
                vpaidcontrols: props.advertising.vpaidcontrols !== undefined ? props.advertising.vpaidcontrols : true,
                autoplayadsmuted: props.advertising.autoplayadsmuted !== undefined ? props.advertising.autoplayadsmuted : props.muted,
            };
        }

        // Initialize player
        playerInstance.value = jwplayer(playerId.value).setup(config);

        // Set initial playback rate
        if (props.playbackRate !== 1) {
            playerInstance.value.setPlaybackRate(props.playbackRate);
        }

        // Bind events
        bindPlayerEvents();

        console.log('[JWPlayer] Player initialized successfully');
    } catch (error) {
        console.error('[JWPlayer] Initialization error:', error);
        if (isHlsSource(currentSource.value)) {
            console.warn('[JWPlayer] Switching to HLS.js fallback after init error');
            setupHlsFallback(currentSource.value);
            return;
        }
        emit('error', error);
    }
};

/**
 * Bind JW Player events to component events
 */
const bindPlayerEvents = () => {
    if (!playerInstance.value) return;

    const player = playerInstance.value;

    // Ready event
    player.on('ready', () => {
        isReady.value = true;
        state.duration = player.getDuration();
        emit('ready');
    });

    // Play event
    player.on('play', () => {
        state.isPlaying = true;
        emit('play');
    });

    // Pause event
    player.on('pause', () => {
        state.isPlaying = false;
        emit('pause');
    });

    // Time update
    player.on('time', (data: any) => {
        state.currentTime = data.position;
        state.duration = data.duration;
        emit('time', { position: data.position, duration: data.duration });
    });

    // Seek event
    player.on('seek', (data: any) => {
        emit('seek', { offset: data.offset });
    });

    // Buffer event
    player.on('buffer', (data: any) => {
        state.buffered = data.percentage || 0;
        emit('buffer', { percentage: data.percentage || 0 });
    });

    // Complete event (video ended)
    player.on('complete', () => {
        state.isPlaying = false;
        emit('complete');
    });

    // Error event
    player.on('error', (error: any) => {
        console.error('[JWPlayer] Playback error:', error);
        if (isHlsSource(currentSource.value) && !attemptedFallbackFromError) {
            attemptedFallbackFromError = true;
            console.warn('[JWPlayer] Falling back to HLS.js after playback error');
            cleanupPlayer();
            setupHlsFallback(currentSource.value);
            return;
        }
        emit('error', error);
    });

    // Fullscreen event
    player.on('fullscreen', (data: any) => {
        state.isFullscreen = data.fullscreen;
        emit('fullscreen', data.fullscreen);
    });

    // Volume change
    player.on('volume', (data: any) => {
        state.volume = data.volume;
    });

    // Mute change
    player.on('mute', (data: any) => {
        state.isMuted = data.mute;
    });

    // Advertising events
    player.on('adImpression', (data: any) => {
        console.log('[JWPlayer] Ad impression:', data);
        emit('adImpression', { tag: data.tag || data.adtitle || 'unknown' });
    });

    player.on('adComplete', (data: any) => {
        console.log('[JWPlayer] Ad complete:', data);
        emit('adComplete', { tag: data.tag || data.adtitle || 'unknown' });
    });

    player.on('adSkipped', (data: any) => {
        console.log('[JWPlayer] Ad skipped:', data);
        emit('adSkipped', { tag: data.tag || data.adtitle || 'unknown' });
    });

    player.on('adError', (error: any) => {
        console.error('[JWPlayer] Ad error:', error);
        emit('adError', error);
    });

    player.on('adClick', (data: any) => {
        console.log('[JWPlayer] Ad clicked:', data);
        emit('adClick', { tag: data.tag || data.adtitle || 'unknown' });
    });
};

const teardownHlsFallback = () => {
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

    usingHlsFallback.value = false;
    pendingPlayPromise = null;
};

const setupHlsFallback = (source: string) => {
    if (!playerContainer.value) return;

    teardownHlsFallback();
    usingHlsFallback.value = true;
    isReady.value = false;
    state.isPlaying = false;
    state.buffered = 0;
    state.currentTime = 0;
    state.duration = 0;

    // Build a simple HTML5 video element that mirrors the JW API surface used above
    playerContainer.value.innerHTML = '';
    const video = document.createElement('video');
    const sourceIsHls = isHlsSource(source);
    video.className = 'hls-fallback-player';
    video.playsInline = true;
    video.controls = false; // Disable native controls, we'll use custom ones
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

    // Add click-to-play/pause functionality with visual effect
    const videoClickHandler = () => {
        // Show play/pause effect
        hlsFallbackState.playPauseEffectIcon = state.isPlaying ? 'pause' : 'play';
        hlsFallbackState.showPlayPauseEffect = true;

        toggleHlsFallbackPlay();

        // Hide effect after animation
        setTimeout(() => {
            hlsFallbackState.showPlayPauseEffect = false;
        }, 500);
    };
    video.addEventListener('click', videoClickHandler);
    fallbackEventCleanups.push(() => video.removeEventListener('click', videoClickHandler));

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
                // Seek forward 5 seconds
                if (hlsVideoEl.value) {
                    seek(Math.min(state.duration, state.currentTime + 5));
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                // Increase volume by 5%
                hlsFallbackState.showVolumeSlider = true;
                setHlsFallbackVolume(Math.min(100, state.volume + 5));
                // Clear existing timeout
                if (volumeBarTimeout) {
                    clearTimeout(volumeBarTimeout);
                }
                // Set new timeout for 3 seconds
                volumeBarTimeout = setTimeout(() => {
                    hlsFallbackState.showVolumeSlider = false;
                    volumeBarTimeout = null;
                }, 3000);
                break;
            case 'ArrowDown':
                e.preventDefault();
                // Decrease volume by 5%
                hlsFallbackState.showVolumeSlider = true;
                setHlsFallbackVolume(Math.max(0, state.volume - 5));
                // Clear existing timeout
                if (volumeBarTimeout) {
                    clearTimeout(volumeBarTimeout);
                }
                // Set new timeout for 3 seconds
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

    addListener('seeking', () => emit('seek', { offset: video.currentTime }));
    addListener('play', () => {
        state.isPlaying = true;
        emit('play');
    });
    addListener('pause', () => {
        state.isPlaying = false;
        emit('pause');
    });
    addListener('ended', () => {
        state.isPlaying = false;
        emit('complete');
    });
    addListener('loadedmetadata', () => {
        state.duration = video.duration || 0;
        isReady.value = true;
        emit('ready');
        updateBuffered();
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

        // Ensure controls are visible in fullscreen
        if (full) {
            hlsFallbackState.showControls = true;
        }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    fallbackEventCleanups.push(() => document.removeEventListener('fullscreenchange', onFullscreenChange));

    if (sourceIsHls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            isReady.value = true;
            emit('ready');

            // Populate quality levels
            const levels = hls.levels || [];
            hlsFallbackState.availableQualities = levels.map((level, index) => {
                const pieces = [];
                if (level.height) {
                    pieces.push(`${level.height}p`);
                }
                if (level.bitrate) {
                    pieces.push(`${Math.round(level.bitrate / 1000)}kbps`);
                }
                return {
                    label: pieces.join(' ') || `Level ${index + 1}`,
                    index,
                };
            });
            hlsFallbackState.currentQuality = -1; // Auto by default
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
            if (hls.autoLevelEnabled) {
                hlsFallbackState.currentQuality = -1;
            } else {
                hlsFallbackState.currentQuality = data.level;
            }
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
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
        // Last-resort: fall back to direct assignment (may not play but avoids crash)
        video.src = source;
    }

    if (video.autoplay) {
        safePlay();
    }
};

/**
 * Public methods for external control
 */
const play = () => {
    safePlay();
};

const pause = () => {
    if (usingHlsFallback.value) {
        hlsVideoEl.value?.pause();
    } else {
        playerInstance.value?.pause();
    }
};

const stop = () => {
    if (usingHlsFallback.value) {
        hlsVideoEl.value?.pause();
        if (hlsVideoEl.value) {
            hlsVideoEl.value.currentTime = 0;
        }
    } else {
        playerInstance.value?.stop();
    }
};

const seek = (position: number) => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        hlsVideoEl.value.currentTime = Math.max(0, position);
    } else {
        playerInstance.value?.seek(position);
    }
};

const setVolume = (volume: number) => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        const clamped = Math.max(0, Math.min(100, volume));
        hlsVideoEl.value.volume = clamped / 100;
        state.volume = clamped;
    } else {
        playerInstance.value?.setVolume(volume);
    }
};

const setMute = (muted: boolean) => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        hlsVideoEl.value.muted = muted;
        state.isMuted = muted;
    } else {
        playerInstance.value?.setMute(muted);
    }
};

const setPlaybackRate = (rate: number) => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        hlsVideoEl.value.playbackRate = rate;
    } else {
        playerInstance.value?.setPlaybackRate(rate);
    }
};

const toggleFullscreen = () => {
    if (usingHlsFallback.value && wrapperElement.value) {
        if (!document.fullscreenElement) {
            wrapperElement.value.requestFullscreen?.();
            state.isFullscreen = true;
            emit('fullscreen', true);
        } else {
            document.exitFullscreen?.();
            state.isFullscreen = false;
            emit('fullscreen', false);
        }
    } else {
        playerInstance.value?.setFullscreen(!state.isFullscreen);
    }
};

const getPosition = () => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        return hlsVideoEl.value.currentTime || 0;
    }
    return playerInstance.value?.getPosition() || 0;
};

const getDuration = () => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        return hlsVideoEl.value.duration || 0;
    }
    return playerInstance.value?.getDuration() || 0;
};

const getState = () => {
    if (usingHlsFallback.value && hlsVideoEl.value) {
        if (hlsVideoEl.value.paused) return 'paused';
        return 'playing';
    }
    return playerInstance.value?.getState() || 'idle';
};

// HLS Fallback specific methods
const setHlsFallbackQuality = (qualityIndex: number) => {
    if (!usingHlsFallback.value || !hlsInstance.value) return;

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
    if (!usingHlsFallback.value || !hlsVideoEl.value) return;

    hlsVideoEl.value.playbackRate = speed;
    hlsFallbackState.playbackSpeed = speed;
};

const toggleHlsFallbackPlay = () => {
    if (!usingHlsFallback.value || !hlsVideoEl.value) return;

    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
};

const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const toggleHlsFallbackMute = () => {
    if (!usingHlsFallback.value || !hlsVideoEl.value) return;

    const newMutedState = !state.isMuted;
    setMute(newMutedState);
};

const setHlsFallbackVolume = (volume: number) => {
    if (!usingHlsFallback.value || !hlsVideoEl.value) return;

    setVolume(volume);
    hlsFallbackState.volume = volume;
};

// Mouse event handlers for controls visibility
const handleMouseEnter = () => {
    if (!usingHlsFallback.value) return;
    hlsFallbackState.showControls = true;

    // Clear any existing timeout
    if (fullscreenControlsTimeout) {
        clearTimeout(fullscreenControlsTimeout);
        fullscreenControlsTimeout = null;
    }
};

const handleMouseLeave = () => {
    if (!usingHlsFallback.value) return;

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
    if (!usingHlsFallback.value) return;
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
    if (!usingHlsFallback.value || !hlsVideoEl.value) return;

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
    playerInstance,
    state,
});

/**
 * Cleanup and remove player instance
 */
const cleanupPlayer = () => {
    teardownHlsFallback();

    if (playerInstance.value) {
        try {
            // Stop any playing content or ads
            playerInstance.value.stop();

            // Remove the player instance
            playerInstance.value.remove();
            playerInstance.value = null;
            isReady.value = false;
            state.isPlaying = false;
            state.buffered = 0;
            if (playerContainer.value) {
                playerContainer.value.innerHTML = '';
            }

            console.log('[JWPlayer] Player cleaned up successfully');
        } catch (error) {
            console.error('[JWPlayer] Cleanup error:', error);
        }
    }
};

/**
 * Reload player with new video
 * This completely recreates the player instance to avoid ad-related issues
 */
const reloadPlayerWithNewVideo = (newVideo: any) => {
    if (!newVideo || !newVideo.videoUrl) {
        console.warn('[JWPlayer] No video URL provided for reload');
        return;
    }

    try {
        // Cleanup existing player completely
        cleanupPlayer();

        // Small delay to ensure cleanup is complete
        setTimeout(() => {
            // Reinitialize with new video
            initializePlayer();
            console.log('[JWPlayer] Player reloaded with new video');
        }, 100);
    } catch (error) {
        console.error('[JWPlayer] Error reloading player:', error);
    }
};

// Lifecycle hooks
onMounted(() => {
    // Wait for JW Player library to be loaded
    let jwLoadAttempts = 0;
    const maxJwLoadAttempts = 30;
    const checkAndInit = () => {
        const jwAvailable = typeof window !== 'undefined' && (window as any).jwplayer;
        if (jwAvailable || jwLoadAttempts >= maxJwLoadAttempts) {
            initializePlayer();
        } else {
            jwLoadAttempts += 1;
            // Retry after a short delay
            setTimeout(checkAndInit, 100);
        }
    };
    checkAndInit();
});

onBeforeUnmount(() => {
    // Cleanup player instance
    cleanupPlayer();
});

// Watch for video changes
watch(
    () => props.video,
    (newVideo, oldVideo) => {
        // Only reload if the video has actually changed
        if (newVideo && oldVideo && newVideo.id !== oldVideo.id) {
            console.log('[JWPlayer] Video changed, reloading player...');
            reloadPlayerWithNewVideo(newVideo);
        }
    }
);
</script>

<template>
    <div ref="wrapperElement" class="jwplayer-wrapper relative w-full h-full bg-black rounded-lg overflow-hidden"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @mousemove="handleMouseMove">
        <!-- JW Player Container -->
        <div :id="playerId" ref="playerContainer" class="absolute inset-0"></div>

        <!-- Loading State -->
        <div v-if="!isReady"
            class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div class="text-center text-white">
                <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin mx-auto mb-2" />
                <p class="text-sm">Loading player...</p>
            </div>
        </div>

        <!-- Play/Pause Effect Overlay -->
        <div v-if="usingHlsFallback && hlsFallbackState.showPlayPauseEffect" class="hls-play-pause-effect">
            <div class="hls-effect-icon">
                <Icon v-if="hlsFallbackState.playPauseEffectIcon === 'play'" name="lucide:play" class="w-6 h-6" />
                <Icon v-else name="lucide:pause" class="w-6 h-6" />
            </div>
        </div>

        <!-- HLS Fallback Custom Controls -->
        <div v-if="usingHlsFallback && isReady"
            :class="['hls-custom-controls', { 'show': hlsFallbackState.showControls }]">

            <!-- Progress Bar -->
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
                                    v-for="speed in [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3]"
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
    height: 5px;
    cursor: pointer;
}

.hls-progress-track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.hls-progress-buffered {
    position: absolute;
    top: 0;
    left: 0;
    height: 5px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 3px;
    transition: width 0.3s ease;
    pointer-events: none;
}

.hls-progress-played {
    position: absolute;
    top: 0;
    left: 0;
    height: 5px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 3px;
    transition: width 0.1s linear;
    pointer-events: none;
}

.hls-progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    outline: none;
    z-index: 2;
}

.hls-progress-bar::-webkit-slider-runnable-track {
    width: 100%;
    height: 5px;
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
    margin-top: -4.5px;
    box-shadow: 0 2px 6px rgba(255, 108, 0, 0.5);
    transition: transform 0.2s ease;
}

.hls-progress-bar:hover::-webkit-slider-thumb {
    transform: scale(1.2);
}

.hls-progress-bar::-moz-range-track {
    width: 100%;
    height: 5px;
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
    height: 5px;
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
    width: 80px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    outline: none;
}

.hls-volume-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}

.hls-volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: #FF6C00;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -4px;
}

.hls-volume-slider::-moz-range-track {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}

.hls-volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
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
</style>
