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
    </div>
</template>

<script setup>
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
    });

    // Emits
    const emit = defineEmits(['see-all', 'video-click']);

    // Methods
    const handleVideoClick = (video) => {
        emit('video-click', video);
    };
</script>
