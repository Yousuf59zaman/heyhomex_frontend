<script setup lang="ts">
const props = defineProps({
  adConfig: {
    type: Object,
    default: () => ({}),
  },
});
/**
 * Video Player Modal Component
 *
 * A full-screen modal for video playback with YouTube-like interface:
 * - Backdrop blur effect
 * - Close button
 * - Video information display
 * - Related videos sidebar (optional)
 * - Keyboard shortcuts (ESC to close, Space to play/pause)
 * - Responsive design
 * - VAST video advertising support
 */

// import { useVideoPlayer } from '~/composables/useVideoPlayer';

const {
  isOpen,
  currentVideo,
  playlist,
  closeVideo,
  playNext,
} = useVideoPlayer();

// Get advertising configuration for video playback

const playerRef = ref<any>(null);
const showInfo = ref(true);
const showPlaylist = ref(true);
const isSmallScreen = ref(false);

/**
 * Handle keyboard shortcuts
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return;

  switch (event.key) {
    case 'Escape':
      closeVideo();
      break;
    case ' ':
      event.preventDefault();
      playerRef.value?.state.isPlaying ? playerRef.value?.pause() : playerRef.value?.play();
      break;
    case 'f':
    case 'F':
      event.preventDefault();
      playerRef.value?.toggleFullscreen();
      break;
    case 'm':
    case 'M':
      event.preventDefault();
      playerRef.value?.setMute(!playerRef.value?.state.isMuted);
      break;
    case 'ArrowRight':
      event.preventDefault();
      playerRef.value?.seek(playerRef.value?.getPosition() + 10);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      playerRef.value?.seek(playerRef.value?.getPosition() - 10);
      break;
    case 'ArrowUp':
      event.preventDefault();
      const currentVol = playerRef.value?.state.volume || 0;
      playerRef.value?.setVolume(Math.min(100, currentVol + 10));
      break;
    case 'ArrowDown':
      event.preventDefault();
      const vol = playerRef.value?.state.volume || 0;
      playerRef.value?.setVolume(Math.max(0, vol - 10));
      break;
  }
};

/**
 * Handle video completion
 */
const handleVideoComplete = () => {
  // Auto-play next video if in playlist
  if (playlist.value.length > 0) {
    playNext();
  }
};

/**
 * Handle backdrop click to close modal
 */
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeVideo();
  }
};

/**
 * Play a video from the playlist
 */
const playFromPlaylist = (video: any) => {
  const { openVideo } = useVideoPlayer();
  openVideo(video, playlist.value);
};

// Check screen size for responsive playlist toggle
const checkScreenSize = () => {
  if (typeof window !== 'undefined') {
    isSmallScreen.value = window.innerWidth < 1024;
  }
};

// Bind keyboard events and screen size checker
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition
      name="modal-fade"
      @after-leave="showInfo = true">
      <div
        v-if="isOpen && currentVideo"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        @click="handleBackdropClick">
        <!-- Modal Container -->
        <div class="relative w-full h-full flex flex-col lg:flex-row p-2 sm:p-4 md:p-5 lg:p-6 gap-2 sm:gap-3 md:gap-4 overflow-y-auto">
          <!-- Main Player Area -->
          <div class="w-full lg:flex-1 flex flex-col">
            <!-- Close Button -->
            <div class="flex justify-between items-center mb-2 sm:mb-3 md:mb-4 flex-shrink-0">
              <div class="flex items-center gap-3">
                <button
                  @click="closeVideo"
                  class="text-white hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label="Close player">
                  <Icon name="lucide:x" class="w-6 h-6" />
                </button>
                <h2 class="text-white text-lg font-semibold hidden sm:block">
                  {{ currentVideo.title }}
                </h2>
              </div>

              <!-- Toggle Info Button -->
              <div class="flex items-center gap-2">
                <button
                  @click="showInfo = !showInfo"
                  class="text-white hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/10"
                  :aria-label="showInfo ? 'Hide info' : 'Show info'">
                  <Icon name="lucide:info" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Player Container -->
            <div class="flex-shrink-0 w-full">
              <div class="w-full max-w-full sm:max-w-7xl mx-auto">
                <div class="w-full aspect-video">
                <VideoJWPlayer
                  v-if="currentVideo"
                  ref="playerRef"
                  :video="currentVideo"
                  :autoplay="true"
                  :advertising="{ client: adConfig.client ?? '', ...adConfig }"
                  @complete="handleVideoComplete" />
                </div>
              </div>
            </div>

            <!-- Video Information (Below Player) -->
            <Transition name="slide-up">
              <div
                v-if="showInfo"
                class="mt-2 sm:mt-3 md:mt-4 bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-4 text-white">
                <h3 class="text-lg sm:text-xl font-bold mb-2">{{ currentVideo.title }}</h3>
                <div class="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-white/80 mb-2 sm:mb-3">
                  <span v-if="currentVideo.channel" class="flex items-center gap-1">
                    <Icon name="lucide:user" class="w-4 h-4" />
                    {{ currentVideo.channel }}
                  </span>
                  <span v-if="currentVideo.views" class="flex items-center gap-1">
                    <Icon name="lucide:eye" class="w-4 h-4" />
                    {{ currentVideo.views }}
                  </span>
                  <span v-if="currentVideo.uploadTime" class="flex items-center gap-1">
                    <Icon name="lucide:clock" class="w-4 h-4" />
                    {{ currentVideo.uploadTime }}
                  </span>
                  <span v-if="currentVideo.duration" class="flex items-center gap-1">
                    <Icon name="lucide:play-circle" class="w-4 h-4" />
                    {{ currentVideo.duration }}
                  </span>
                </div>

                <p
                  v-if="currentVideo.description || currentVideo.subtitle"
                  class="text-sm text-white/70 leading-relaxed">
                  {{ currentVideo.description || currentVideo.subtitle }}
                </p>

                <div v-if="currentVideo.category || currentVideo.location" class="flex flex-wrap gap-2 mt-3">
                  <span
                    v-if="currentVideo.category"
                    class="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {{ currentVideo.category }}
                  </span>
                  <span
                    v-if="currentVideo.location"
                    class="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                    <Icon name="lucide:map-pin" class="w-3 h-3" />
                    {{ currentVideo.location }}
                  </span>
                </div>

                <!-- Keyboard Shortcuts Info -->
                <div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20">
                  <p class="text-[10px] sm:text-xs text-white/60 leading-relaxed">
                    <strong class="block sm:inline mb-1 sm:mb-0">Keyboard shortcuts:</strong>
                    <span class="block sm:inline">
                      Space (play/pause) • F (fullscreen) • M (mute) • ←/→ (seek) • ↑/↓ (volume) • ESC (close)
                    </span>
                  </p>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Playlist Sidebar (Desktop) / Bottom Sheet (Mobile) -->
            <div
              v-if="playlist.length > 0"
              class="w-full lg:w-96 xl:w-[26rem] bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-4 flex flex-col flex-shrink-0">
              <div class="flex items-center mb-3">
                <h3 class="text-white font-semibold flex items-center gap-2">
                  <Icon name="lucide:list-video" class="w-5 h-5" />
                  Playlist ({{ playlist.length }})
                </h3>
              </div>

              <div class="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                <div
                  v-for="(video, index) in playlist"
                  :key="video.id"
                  @click="playFromPlaylist(video)"
                  :class="[
                    'flex gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all',
                    video.id === currentVideo.id
                      ? 'bg-red-500/30 ring-1 sm:ring-2 ring-red-500'
                      : 'hover:bg-white/10',
                  ]">
                  <!-- Thumbnail -->
                  <div class="relative flex-shrink-0 w-24 h-16 sm:w-28 sm:h-18 md:w-32 md:h-20 rounded overflow-hidden">
                    <img
                      :src="video.thumbnail"
                      :alt="video.title"
                      class="w-full h-full object-cover" />
                    <div class="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                      {{ video.duration }}
                    </div>
                    <div
                      v-if="video.id === currentVideo.id"
                      class="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Icon name="lucide:play" class="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-white text-xs sm:text-sm font-medium line-clamp-2 mb-0.5 sm:mb-1">
                      {{ video.title }}
                    </p>
                    <p class="text-white/60 text-[10px] sm:text-xs line-clamp-1">
                      {{ video.subtitle || video.channel }}
                    </p>
                    <div class="flex items-center gap-1 sm:gap-2 text-white/50 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                      <span v-if="video.views">{{ video.views }}</span>
                      <span v-if="video.uploadTime">• {{ video.uploadTime }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal fade animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Slide left animation */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Custom scrollbar */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
