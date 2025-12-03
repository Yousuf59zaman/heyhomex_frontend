<script setup>
import { useVideoPlayer } from '~/composables/useVideoPlayer';

// Props
const props = defineProps({
    video: {
        type: Object,
        required: true,
    },
    // Optional: disable auto-play in modal
    useModal: {
        type: Boolean,
        default: true,
    },
});

// Emits
const emit = defineEmits(['click']);

// Video player composable
const { openVideo } = useVideoPlayer();

// Methods
const handleClick = () => {
    // Emit click event (for backward compatibility)
    emit('click', props.video);

    // Open video in modal if enabled
    if (props.useModal) {
        openVideo(props.video);
    }
};
</script>

<template>
    <div
        @click="handleClick"
        class="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
        <div class="relative h-40 sm:h-48 md:h-52">
            <!-- Video thumbnail -->
            <img
                :src="video.thumbnail"
                :alt="video.title"
                class="w-full h-full object-cover" />

            <!-- Video overlay with title -->
            <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-3 sm:pb-4">
                <div class="text-center text-white z-10">
                    <h3 class="font-bold text-base sm:text-lg mb-1">
                        {{ video.title }}
                    </h3>
                    <p class="text-xs sm:text-sm opacity-90">
                        {{ video.subtitle }}
                    </p>
                </div>
            </div>

            <!-- Play button overlay -->
            <div
                class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                    class="bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg flex items-center justify-center">
                    <Icon
                        name="lucide:play"
                        class="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                </div>
            </div>

            <!-- Duration badge -->
            <div
                class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                {{ video.duration }}
            </div>
        </div>
    </div>
</template>
