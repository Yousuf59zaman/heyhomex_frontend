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
const playerInstance = ref<any>(null);
const isReady = ref(false);
const currentSource = ref('');
const usingHlsFallback = ref(false);
const hlsInstance = ref<Hls | null>(null);
const hlsVideoEl = ref<HTMLVideoElement | null>(null);
const fallbackEventCleanups: Array<() => void> = [];
let pendingPlayPromise: Promise<void> | null = null;
let attemptedFallbackFromError = false;

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
    video.controls = props.controls ?? true;
    video.autoplay = props.autoplay ?? false;
    video.muted = props.muted ?? false;
    video.preload = 'metadata';
    video.poster = props.video.thumbnail || '';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.volume = (state.volume ?? 100) / 100;

    playerContainer.value.appendChild(video);
    hlsVideoEl.value = video;

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
    if (usingHlsFallback.value && playerContainer.value) {
        if (!document.fullscreenElement) {
            playerContainer.value.requestFullscreen?.();
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
    <div class="jwplayer-wrapper relative w-full h-full bg-black rounded-lg overflow-hidden">
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

/* Ensure JW Player fills the container */
:deep(.jw-wrapper) {
    border-radius: 0.5rem;
}

:deep(.hls-fallback-player) {
    background: #000;
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
