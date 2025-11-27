import { readonly, computed } from 'vue';
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
    videoUrl?: string;
}
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
    const openVideo = (video: Video, playlist: Video[] = []) => {
        playerState.value.currentVideo = video;
        playerState.value.playlist = playlist;
        playerState.value.isOpen = true;
        playerState.value.currentTime = 0;
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
        }
    };
    const closeVideo = () => {
        playerState.value.isOpen = false;
        playerState.value.isPlaying = false;
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    };
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
    const togglePlay = () => {
        playerState.value.isPlaying = !playerState.value.isPlaying;
    };
    const setCurrentTime = (time: number) => {
        playerState.value.currentTime = time;
    };
    const setVolume = (volume: number) => {
        playerState.value.volume = Math.max(0, Math.min(100, volume));
        if (volume > 0) {
            playerState.value.isMuted = false;
        }
    };
    const toggleMute = () => {
        playerState.value.isMuted = !playerState.value.isMuted;
    };

    const setPlaybackRate = (rate: number) => {
        playerState.value.playbackRate = rate;
    };

    const setQuality = (quality: string) => {
        playerState.value.quality = quality;
    };

    const toggleFullscreen = () => {
        playerState.value.isFullscreen = !playerState.value.isFullscreen;
    };

    const setDuration = (duration: number) => {
        playerState.value.duration = duration;
    };
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
