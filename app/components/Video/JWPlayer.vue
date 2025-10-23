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

import type { Video } from '~/composables/useVideoPlayer';

interface Props {
  video: Video;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  playbackRate?: number;
  aspectRatio?: string;
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
}>();

// Unique player ID
const playerId = ref(`jwplayer-${Math.random().toString(36).substr(2, 9)}`);
const playerContainer = ref<HTMLDivElement | null>(null);
const playerInstance = ref<any>(null);
const isReady = ref(false);

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

/**
 * Initialize JW Player
 */
const initializePlayer = () => {
  if (typeof window === 'undefined' || !(window as any).jwplayer) {
    console.error('[JWPlayer] Library not loaded');
    return;
  }

  try {
    const jwplayer = (window as any).jwplayer;

    // Get video source
    const videoSource = props.video.videoUrl || 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8';

    // Setup player configuration
    const config = {
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
};

/**
 * Public methods for external control
 */
const play = () => {
  playerInstance.value?.play();
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

// Lifecycle hooks
onMounted(() => {
  // Wait for JW Player library to be loaded
  const checkAndInit = () => {
    if (typeof window !== 'undefined' && (window as any).jwplayer) {
      initializePlayer();
    } else {
      // Retry after a short delay
      setTimeout(checkAndInit, 100);
    }
  };
  checkAndInit();
});

onBeforeUnmount(() => {
  // Cleanup player instance
  if (playerInstance.value) {
    try {
      playerInstance.value.remove();
      playerInstance.value = null;
    } catch (error) {
      console.error('[JWPlayer] Cleanup error:', error);
    }
  }
});

// Watch for video changes
watch(
  () => props.video,
  (newVideo) => {
    if (playerInstance.value && newVideo.videoUrl) {
      playerInstance.value.load({
        file: newVideo.videoUrl,
        image: newVideo.thumbnail,
        title: newVideo.title,
        description: newVideo.description || newVideo.subtitle,
      });
    }
  }
);
</script>

<template>
  <div class="jwplayer-wrapper relative w-full h-full bg-black rounded-lg overflow-hidden">
    <!-- JW Player Container -->
    <div
      :id="playerId"
      ref="playerContainer"
      class="absolute inset-0"></div>

    <!-- Loading State -->
    <div
      v-if="!isReady"
      class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
      <div class="text-center text-white">
        <Icon
          name="lucide:loader-2"
          class="w-12 h-12 animate-spin mx-auto mb-2" />
        <p class="text-sm">Loading player...</p>
      </div>
    </div>

    <!-- Custom Overlay (if needed for additional controls) -->
    <slot name="overlay" :state="state" :player="{ play, pause, seek, setVolume }"></slot>
  </div>
</template>

<style scoped>
.jwplayer-wrapper {
  min-height: 300px;
}

/* Ensure JW Player fills the container */
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
