<script setup lang="ts">
import type { Video } from '~/composables/useVideoPlayer';
import type { AdvertisingConfigHls } from '~/composables/useHlsPlayerAds';
import { useHlsPlayerCore } from '~/composables/useHlsPlayerCore';

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

const player = useHlsPlayerCore(props, emit);
const {
    playerContainer,
    wrapperElement,
    isReady,
    hlsFallbackState,
    adState,
    adUiState,
    state,
    setupHlsFallback,
    cleanupPlayer,
    reloadPlayerWithNewVideo,
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
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
    handleVideoHitareaClick,
    formatTime,
    toggleAdPlayPause,
    toggleAdMute,
    skipAd,
    handleAdClick,
} = player;

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
            await reloadPlayerWithNewVideo(newVideo);
        }
    }
);

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
</script>

<template>
    <div ref="wrapperElement" class="hls-player-wrapper relative w-full h-full bg-black rounded-lg overflow-hidden"
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
        <div v-if="adState.isPlayingAd" class="hls-ad-overlay" @click="handleAdClick">
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
                    <div class="hls-progress-track"></div>
                    <div class="hls-progress-buffered" :style="{ width: state.buffered + '%' }"></div>
                    <div class="hls-progress-played" :style="{ width: (state.currentTime / (state.duration || 1)) * 100 + '%' }"></div>
                    <input
                        type="range"
                        class="hls-progress-bar"
                        :value="state.currentTime"
                        :max="state.duration || 100"
                        @input="seek(($event.target as HTMLInputElement).valueAsNumber)"
                    />
                </div>
            </div>

            <div class="hls-controls-row">
                <button @click="toggleHlsFallbackPlay" class="hls-control-btn">
                    <Icon v-if="state.isPlaying" name="lucide:pause" class="w-5 h-5" />
                    <Icon v-else name="lucide:play" class="w-5 h-5" />
                </button>

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

                <span class="hls-time-display">
                    {{ formatTime(state.currentTime) }} / {{ formatTime(state.duration) }}
                </span>

                <div class="flex-1"></div>

                <div class="hls-settings-group">
                    <button @click="hlsFallbackState.showSettings = !hlsFallbackState.showSettings" class="hls-control-btn">
                        <Icon name="lucide:settings" class="w-5 h-5" />
                    </button>
                    <div v-if="hlsFallbackState.showSettings" class="hls-settings-menu" @click.stop>
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

                        <div class="hls-settings-content">
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

                <button @click="togglePictureInPicture" class="hls-control-btn" title="Picture-in-Picture">
                    <Icon name="lucide:picture-in-picture-2" class="w-5 h-5" />
                </button>

                <button @click="toggleFullscreen" class="hls-control-btn">
                    <Icon v-if="state.isFullscreen" name="lucide:minimize" class="w-5 h-5" />
                    <Icon v-else name="lucide:maximize" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <slot name="overlay" :state="state" :player="{ play, pause, seek, setVolume }"></slot>
    </div>
</template>

<style scoped>
.hls-player-wrapper {
    min-height: 200px;
    isolation: isolate; /* Creates stacking context to contain z-index values */
}

@media (min-width: 640px) {
    .hls-player-wrapper {
        min-height: 300px;
    }
}

@media (min-width: 1024px) {
    .hls-player-wrapper {
        min-height: 400px;
    }
}

:deep(.hls-player-wrapper:fullscreen),
.hls-player-wrapper:fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
}

:deep(.hls-player-wrapper:fullscreen .hls-fallback-player),
.hls-player-wrapper:fullscreen .hls-fallback-player {
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
    object-fit: contain !important;
    background: black;
}

.hls-fallback-player {
    background: black;
}

.hls-custom-controls {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    padding: 12px 16px 18px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform: translateY(6px);
    pointer-events: none;
}

.hls-custom-controls.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.hls-progress-container {
    width: 100%;
    padding-bottom: 8px;
}

.hls-progress-wrapper {
    position: relative;
    height: 14px;
    display: flex;
    align-items: center;
}

.hls-progress-track {
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.25);
}

.hls-progress-buffered {
    position: absolute;
    left: 0;
    height: 3px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.45);
}

.hls-progress-played {
    position: absolute;
    left: 0;
    height: 3px;
    border-radius: 999px;
    background: #ef4444;
}

.hls-progress-bar {
    position: relative;
    width: 100%;
    -webkit-appearance: none;
    background: transparent;
    height: 14px;
}

.hls-progress-bar::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: #ef4444;
    border: 3px solid white;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    margin-top: -5px;
}

.hls-progress-bar::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: #ef4444;
    border: 3px solid white;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.hls-controls-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
}

.hls-control-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.15s ease;
}

.hls-control-btn:hover {
    background: rgba(0, 0, 0, 0.75);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

.hls-control-btn:active {
    transform: translateY(0);
}

.hls-volume-group {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    position: relative;
}

.hls-volume-slider {
    width: 90px;
    height: 4px;
    -webkit-appearance: none;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 999px;
}

.hls-volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    border: 2px solid #ef4444;
    cursor: pointer;
}

.hls-volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    border: 2px solid #ef4444;
    cursor: pointer;
}

.hls-time-display {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    min-width: 120px;
}

.hls-settings-group {
    position: relative;
}

.hls-play-pause-effect {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 35;
    pointer-events: none;
}

.hls-effect-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeScale 0.5s ease forwards;
}

@keyframes fadeScale {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(1.25);
    }
}

.hls-buffering-spinner {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

.hls-dropdown-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
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

.hls-video-hitarea {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 25; /* Lower than controls (z-index: 30) so buttons work */
    cursor: pointer;
    pointer-events: auto;
}

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
