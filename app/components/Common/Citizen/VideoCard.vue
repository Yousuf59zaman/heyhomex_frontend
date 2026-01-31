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
        showInfo: {
            type: Boolean,
            default: false,
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
        class="rounded-lg overflow-hidden transition-all duration-200 group">
        <div class="relative h-40 sm:h-48 md:h-52">
            <img
                :src="video.thumbnail"
                :alt="video.title"
                class="w-full h-full object-cover" />

            <div
                v-if="!showInfo"
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
                @click="handleClick"
                class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div
                    class="bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg flex items-center justify-center">
                    <Icon
                        name="lucide:play"
                        class="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                </div>
            </div>

           

            <div
                class="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                {{ video.duration }}
            </div>
        </div>

        <div v-if="showInfo" class="px-0 pb-4">
            <div class="flex gap-1 items-start mt-4">
                <div class="flex-1 flex gap-4 items-start">
                    <div class="bg-[#283849] w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0">
                        <span class="text-white text-sm font-semibold">Hello</span>
                    </div>
                    <div class="flex-1 flex flex-col gap-1">
                        <p class="text-base font-semibold text-[#283849] leading-6 line-clamp-2">
                            {{ video.title }}
                        </p>
                        <div class="flex items-center gap-1.5 text-xs text-[#283849]">
                            <span>{{ video.channelName || video.subtitle || "Unknown Channel" }}</span>
                            <!-- <div class="w-px h-3 bg-[#d4d4d4]"></div> -->
                            <!-- <span>{{ video.views || "0 Views" }}</span> -->
                            <div class="w-px h-3 bg-[#d4d4d4]"></div>
                            <span>{{ video.timeAgo || "" }}</span>
                        </div>
                    </div>
                </div>
                <button
                    class="w-5 h-5 flex items-center justify-center flex-shrink-0"
                    @click.stop>
                    <Icon
                        name="lucide:more-vertical"
                        class="w-5 h-5 text-[#283849]" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
