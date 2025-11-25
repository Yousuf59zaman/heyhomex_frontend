<script setup lang="ts">
/**
 * JW Player Wrapper Component
 *
 * A Vue 3 wrapper around JW Player with YouTube-like features:
 * - Responsive video playback
 * - Quality selection
 * - Playback speed control
 * - Keyboard shortcuts
 * - Picture-in-picture support
 *
 * @see https://developer.jwplayer.com/
 */

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

// Player refs
const playerId = ref(`jwplayer-${Math.random().toString(36).substr(2, 9)}`);
const playerContainer = ref<HTMLDivElement | null>(null);
const wrapperElement = ref<HTMLDivElement | null>(null);
const playerInstance = ref<any>(null);
const isReady = ref(false);
const currentSource = ref('');
let jwLibraryPromise: Promise<void> | null = null;

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

const runtimeConfig = useRuntimeConfig();

const getJwScriptUrl = () => {
    const rawDevMode = runtimeConfig.public.NUXT_PUBLIC_JWPLAYER_DEVMODE;
    const isDevMode =
        typeof rawDevMode === 'boolean'
            ? rawDevMode
            : String(rawDevMode ?? '').trim().toLowerCase() === 'true';

    const demoLibraryUrl = String(runtimeConfig.public.NUXT_PUBLIC_JWPLAYER_DEVMODE_DEMO_LIBRARY_URL ?? '').trim();
    const productionLibraryUrl = String(runtimeConfig.public.NUXT_PUBLIC_JWPLAYER_LIBRARY_URL ?? '').trim();
    const fallbackDemoLibraryUrl = 'https://cdn.jwplayer.com/libraries/KB5zftYI.js';

    return (isDevMode ? demoLibraryUrl : productionLibraryUrl) || fallbackDemoLibraryUrl;
};

const loadJwLibrary = () => {
    if (typeof window === 'undefined') return Promise.resolve();
    if (window.jwplayer) return Promise.resolve();
    if (jwLibraryPromise) return jwLibraryPromise;

    const scriptUrl = getJwScriptUrl();
    jwLibraryPromise = new Promise<void>((resolve) => {
        // Avoid duplicating the script tag
        if (document.getElementById('jwplayer-cdn-script')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = 'jwplayer-cdn-script';
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => {
            const jwplayerKey = runtimeConfig.public.NUXT_PUBLIC_JWPLAYER_KEY;
            if (jwplayerKey && String(jwplayerKey).trim() !== '') {
                try {
                    (window as any).jwplayer.key = jwplayerKey;
                } catch {
                    // ignore key set errors
                }
            }
            resolve();
        };
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });

    return jwLibraryPromise;
};

const safePlay = () => playerInstance.value?.play();

/**
 * Initialize JW Player
 */
const initializePlayer = () => {
    try {
        const videoSource = props.video.videoUrl || 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8';
        currentSource.value = videoSource;

        const jwplayer = typeof window !== 'undefined' ? (window as any).jwplayer : null;
        if (!jwplayer) {
            const error = new Error('[JWPlayer] Library not loaded');
            emit('error', error);
            return;
        }

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
            displaytitle: true,
            displaydescription: true,
            responsive: true,
            qualityLabels: {
                0: 'Auto',
                360: '360p',
                480: '480p',
                720: '720p HD',
                1080: '1080p Full HD',
                1440: '1440p QHD',
                2160: '4K UHD',
            },
            skin: {
                name: 'heyhomex',
            },
            related: {
                displayMode: 'shelf',
                oncomplete: 'show',
            },
        };

        if (props.advertising) {
            config.advertising = {
                client: props.advertising.client || 'vast',
                schedule: props.advertising.schedule || [],
                skipoffset: props.advertising.skipoffset !== undefined ? props.advertising.skipoffset : 5,
                admessage: props.advertising.admessage || 'Ad will end in xx seconds',
                skipmessage: props.advertising.skipmessage || 'Skip ad',
                vpaidcontrols: props.advertising.vpaidcontrols !== undefined ? props.advertising.vpaidcontrols : true,
                autoplayadsmuted:
                    props.advertising.autoplayadsmuted !== undefined
                        ? props.advertising.autoplayadsmuted
                        : props.muted,
            };
        }

        playerInstance.value = jwplayer(playerId.value).setup(config);

        if (props.playbackRate !== 1) {
            playerInstance.value.setPlaybackRate(props.playbackRate);
        }

        bindPlayerEvents();

        console.log('[JWPlayer] Player initialized successfully');
    } catch (error) {
        console.error('[JWPlayer] Initialization error:', error);
        emit('error', error);
    }
};

/**
 * Bind JW Player events to component events
 */
const bindPlayerEvents = () => {
    if (!playerInstance.value) return;

    const player = playerInstance.value;

    player.on('ready', () => {
        isReady.value = true;
        state.duration = player.getDuration();
        emit('ready');
    });

    player.on('play', () => {
        state.isPlaying = true;
        emit('play');
    });

    player.on('pause', () => {
        state.isPlaying = false;
        emit('pause');
    });

    player.on('time', (data: any) => {
        state.currentTime = data.position;
        state.duration = data.duration;
        emit('time', { position: data.position, duration: data.duration });
    });

    player.on('seek', (data: any) => {
        emit('seek', { offset: data.offset });
    });

    player.on('buffer', (data: any) => {
        state.buffered = data.percentage || 0;
        emit('buffer', { percentage: data.percentage || 0 });
    });

    player.on('complete', () => {
        state.isPlaying = false;
        emit('complete');
    });

    player.on('error', (error: any) => {
        console.error('[JWPlayer] Playback error:', error);
        emit('error', error);
    });

    player.on('fullscreen', (data: any) => {
        state.isFullscreen = data.fullscreen;
        emit('fullscreen', data.fullscreen);
    });

    player.on('volume', (data: any) => {
        state.volume = data.volume;
    });

    player.on('mute', (data: any) => {
        state.isMuted = data.mute;
    });

    player.on('adImpression', (data: any) => {
        emit('adImpression', { tag: data.tag || data.adtitle || 'unknown' });
    });

    player.on('adComplete', (data: any) => {
        emit('adComplete', { tag: data.tag || data.adtitle || 'unknown' });
    });

    player.on('adSkipped', (data: any) => {
        emit('adSkipped', { tag: data.tag || data.adtitle || 'unknown' });
    });

    player.on('adError', (error: any) => {
        emit('adError', error);
    });

    player.on('adClick', (data: any) => {
        emit('adClick', { tag: data.tag || data.adtitle || 'unknown' });
    });
};

const play = () => {
    safePlay();
};

const pause = () => {
    playerInstance.value?.pause();
};

const stop = () => {
    playerInstance.value?.stop();
};

const seek = (position: number) => {
    playerInstance.value?.seek(position);
};

const setVolume = (volume: number) => {
    playerInstance.value?.setVolume(volume);
};

const setMute = (muted: boolean) => {
    playerInstance.value?.setMute(muted);
};

const setPlaybackRate = (rate: number) => {
    playerInstance.value?.setPlaybackRate(rate);
};

const toggleFullscreen = () => {
    playerInstance.value?.setFullscreen(!state.isFullscreen);
};

const getPosition = () => {
    return playerInstance.value?.getPosition() || 0;
};

const getDuration = () => {
    return playerInstance.value?.getDuration() || 0;
};

const getState = () => {
    return playerInstance.value?.getState() || 'idle';
};

// Expose methods for parent components
configureExpose();
function configureExpose() {
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
}

/**
 * Cleanup and remove player instance
 */
const cleanupPlayer = () => {
    if (playerInstance.value) {
        try {
            playerInstance.value.stop();
            playerInstance.value.remove();
        } catch (error) {
            console.error('[JWPlayer] Cleanup error:', error);
        }
    }
    playerInstance.value = null;
    isReady.value = false;
    state.isPlaying = false;
    state.buffered = 0;
    if (playerContainer.value) {
        playerContainer.value.innerHTML = '';
    }
};

/**
 * Reload player with new video
 */
const reloadPlayerWithNewVideo = (newVideo: any) => {
    if (!newVideo || !newVideo.videoUrl) {
        console.warn('[JWPlayer] No video URL provided for reload');
        return;
    }

    try {
        cleanupPlayer();
        loadJwLibrary().then(() => {
            setTimeout(() => {
                initializePlayer();
            }, 100);
        });
    } catch (error) {
        console.error('[JWPlayer] Error reloading player:', error);
    }
};

// Lifecycle hooks
onMounted(() => {
    loadJwLibrary().then(() => {
        initializePlayer();
    });
});

onBeforeUnmount(() => {
    cleanupPlayer();
});

// Watch for video changes
watch(
    () => props.video,
    (newVideo, oldVideo) => {
        if (newVideo && oldVideo && newVideo.id !== oldVideo.id) {
            reloadPlayerWithNewVideo(newVideo);
        }
    }
);
</script>

<template>
    <div
        ref="wrapperElement"
        class="jwplayer-wrapper relative w-full h-full bg-black rounded-lg overflow-hidden"
    >
        <!-- JW Player Container -->
        <div :id="playerId" ref="playerContainer" class="absolute inset-0"></div>

        <!-- Loading State -->
        <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
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

:deep(.jwplayer-wrapper:fullscreen),
.jwplayer-wrapper:fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
}

:deep(.jw-wrapper) {
    border-radius: 0.5rem;
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
