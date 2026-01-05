<script setup>
    import {useVideoPlayer} from "~/composables/useVideoPlayer"

    const props = defineProps({
        video: {
            type: Object,
            required: true,
        },

        useModal: {
            type: Boolean,
            default: true,
        },
    })

    const emit = defineEmits(["click", "favorite"])

    const {openVideo} = useVideoPlayer()

    const handleClick = () => {
        emit("click", props.video)

        if (props.useModal) {
            openVideo(props.video)
        }
    }

    const handleFavoriteToggle = () => {
        emit("favorite", props.video)
    }
</script>

<template>
    <div
        @click="handleClick"
        class="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
        <div class="relative h-40 sm:h-48 md:h-52">
            <img
                :src="video.thumbnail"
                :alt="video.title"
                class="w-full h-full object-cover" />

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

            <div
                class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                    class="bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg flex items-center justify-center">
                    <Icon
                        name="lucide:play"
                        class="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                </div>
            </div>

            <div
                class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                {{ video.duration }}
            </div>

            <button
                @click.stop="handleFavoriteToggle"
                class="absolute top-2 left-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors">
                <Icon
                    name="lucide:heart"
                    :class="[
                        'w-5 h-5',
                        video.isFavorite ? 'text-[#2C3E50] fill-current' : 'text-[#2C3E50] fill-none',
                    ]" />
            </button>
        </div>
    </div>
</template>
