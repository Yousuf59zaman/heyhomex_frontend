<script setup>
    import {useVideoPlayer} from "~/composables/useVideoPlayer"

    const emit = defineEmits(["see-all", "video-click", "favorite"])

    const props = defineProps({
        title: {
            type: String,
            default: "Videos you might like!",
        },
        videos: {
            type: Array,
            default: () => [],
        },
        showInfo: {
            type: Boolean,
            default: false,
        },

        enablePlaylist: {
            type: Boolean,
            default: true,
        },

        adConfig: {
            type: Object,
            default: () => ({}),
        },
    })

    const {openVideo} = useVideoPlayer()

    const handleVideoClick = (video) => {
        emit("video-click", video)

        if (props.enablePlaylist) {
            openVideo(video, props.videos)
        }
    }

    const handleFavoriteToggle = (video) => {
        emit("favorite", video)
    }
</script>

<template>
    <div class="rounded-lg mb-10">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">
                {{ title }}
            </h2>
            <div
                @click="$emit('see-all')"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                See all
            </div>
        </div>

        <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CommonCitizenVideoCard
                v-for="video in videos"
                :key="video.id"
                :video="video"
                :show-info="props.showInfo"
                @click="handleVideoClick"
                @favorite="handleFavoriteToggle" />
        </div>

        <ClientOnly>
            <VideoPlayerModal :adConfig="adConfig" />
        </ClientOnly>
    </div>
</template>
