/**
 * Video Player Composable
 *
 * Manages global video player state for the application.
 * Provides methods to open/close video player modal and track playback state.
 *
 * Features:
 * - Global video player state management
 * - YouTube-like modal interface
 * - Playlist support
 * - Playback history tracking
 */

import { readonly, computed } from 'vue';

// Video interface matching your existing video structure
export interface Video {
  id: number;
  title: string;
  subtitle?: string;
  thumbnail: string;
  duration: string;
  channel?: string;
  views?: string;
  uploadTime?: string;
  category?: string;
  location?: string;
  description?: string;
  coordinates?: [number, number];
  // Video source - will be populated when JW Player account is ready
  videoUrl?: string;
}

// Player state interface
interface PlayerState {
  isOpen: boolean;
  currentVideo: Video | null;
  playlist: Video[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  quality: string;
  isFullscreen: boolean;
}

export const useVideoPlayer = () => {
  // Global state (singleton pattern for video player)
  const playerState = useState<PlayerState>('videoPlayerState', () => ({
    isOpen: false,
    currentVideo: null,
    playlist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isMuted: false,
    playbackRate: 1,
    quality: 'auto',
    isFullscreen: false,
  }));

  const config = useRuntimeConfig();
  const demoModeSource = config.public?.jwplayerDemoMode as string | boolean | undefined;
  const demoMode = demoModeSource === true || demoModeSource === 'true';

  /**
   * Open video player modal with a video
   */
  const openVideo = (video: Video, playlist: Video[] = []) => {
    // If in demo mode and no videoUrl, use demo video
    if (demoMode && !video.videoUrl) {
      video.videoUrl = 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8'; // Demo HLS stream
    }

    playerState.value.currentVideo = video;
    playerState.value.playlist = playlist;
    playerState.value.isOpen = true;
    playerState.value.currentTime = 0;

    // Prevent body scroll when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  /**
   * Close video player modal
   */
  const closeVideo = () => {
    playerState.value.isOpen = false;
    playerState.value.isPlaying = false;

    // Restore body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  /**
   * Play next video in playlist
   */
  const playNext = () => {
    if (playerState.value.playlist.length === 0) return;

    const currentIndex = playerState.value.playlist.findIndex(
      (v) => v.id === playerState.value.currentVideo?.id
    );

    if (currentIndex >= 0 && currentIndex < playerState.value.playlist.length - 1) {
      const nextVideo = playerState.value.playlist[currentIndex + 1];
      if (nextVideo) {
        openVideo(nextVideo, playerState.value.playlist);
      }
    }
  };

  /**
   * Play previous video in playlist
   */
  const playPrevious = () => {
    if (playerState.value.playlist.length === 0) return;

    const currentIndex = playerState.value.playlist.findIndex(
      (v) => v.id === playerState.value.currentVideo?.id
    );

    if (currentIndex > 0) {
      const previousVideo = playerState.value.playlist[currentIndex - 1];
      if (previousVideo) {
        openVideo(previousVideo, playerState.value.playlist);
      }
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlay = () => {
    playerState.value.isPlaying = !playerState.value.isPlaying;
  };

  /**
   * Set playback time
   */
  const setCurrentTime = (time: number) => {
    playerState.value.currentTime = time;
  };

  /**
   * Set volume
   */
  const setVolume = (volume: number) => {
    playerState.value.volume = Math.max(0, Math.min(100, volume));
    if (volume > 0) {
      playerState.value.isMuted = false;
    }
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    playerState.value.isMuted = !playerState.value.isMuted;
  };

  /**
   * Set playback rate (speed)
   */
  const setPlaybackRate = (rate: number) => {
    playerState.value.playbackRate = rate;
  };

  /**
   * Set video quality
   */
  const setQuality = (quality: string) => {
    playerState.value.quality = quality;
  };

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = () => {
    playerState.value.isFullscreen = !playerState.value.isFullscreen;
  };

  /**
   * Update duration when video metadata is loaded
   */
  const setDuration = (duration: number) => {
    playerState.value.duration = duration;
  };

  /**
   * Format time in MM:SS or HH:MM:SS format
   */
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    playerState: readonly(playerState),
    isOpen: computed(() => playerState.value.isOpen),
    currentVideo: computed(() => playerState.value.currentVideo),
    playlist: computed(() => playerState.value.playlist),
    isPlaying: computed(() => playerState.value.isPlaying),
    currentTime: computed(() => playerState.value.currentTime),
    duration: computed(() => playerState.value.duration),
    volume: computed(() => playerState.value.volume),
    isMuted: computed(() => playerState.value.isMuted),
    playbackRate: computed(() => playerState.value.playbackRate),
    quality: computed(() => playerState.value.quality),
    isFullscreen: computed(() => playerState.value.isFullscreen),
    demoMode,

    // Methods
    openVideo,
    closeVideo,
    playNext,
    playPrevious,
    togglePlay,
    setCurrentTime,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setQuality,
    toggleFullscreen,
    setDuration,
    formatTime,
  };
};
