<script setup>
import { useVideoPlayer } from '~/composables/useVideoPlayer';

// Props
const props = defineProps({
    title: {
        type: String,
        default: 'Videos you might like!',
    },
    videos: {
        type: Array,
        default: () => [],
    },
    // Enable playlist mode (videos will auto-play next)
    enablePlaylist: {
        type: Boolean,
        default: true,
    },
    // Ad configuration for VAST video advertising
    adConfig: {
        type: Object,
        default: () => ({}),
    },
});

// Emits
const emit = defineEmits(['see-all', 'video-click']);

// Video player composable
const { openVideo } = useVideoPlayer();

// Methods
const handleVideoClick = (video) => {
    // Emit click event (for backward compatibility)
    emit('video-click', video);

    // Open video with playlist if enabled
    if (props.enablePlaylist) {
        openVideo(video, props.videos);
    }
};
</script>


<template>
    <div class="rounded-lg mb-10">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">
                {{ title }}
            </h2>
            <button
                @click="$emit('see-all')"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                See all
            </button>
        </div>

        <!-- Video Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CommonCitizenVideoCard
                v-for="video in videos"
                :key="video.id"
                :video="video"
                @click="handleVideoClick" />
        </div>

        <!-- Video Player Modal with Ads -->
        <ClientOnly>
            <VideoPlayerModal :adConfig="adConfig" />
        </ClientOnly>
    </div>
</template>


