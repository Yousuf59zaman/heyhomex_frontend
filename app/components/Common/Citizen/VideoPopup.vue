<script setup>
    const props = defineProps({
        video: {
            type: Object,
            required: true,
        },
    })
</script>

<template>
    <div
        class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-[350px]">
        <div class="flex items-start gap-3">
            <div class="relative flex-shrink-0">
                <img
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="w-20 h-14 rounded-md object-cover" />

                <div
                    class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <div class="bg-red-600 rounded-full p-1">
                        <Icon
                            name="lucide:play"
                            class="w-3 h-3 text-white" />
                    </div>
                </div>

                <div
                    class="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded">
                    {{ video.duration }}
                </div>
            </div>

            <div class="flex-1 min-w-0">
                <h4
                    class="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                    {{ video.title }}
                </h4>
                <p class="text-xs text-gray-600 mb-1">
                    {{ video.channel }}
                </p>
                <div class="flex items-center text-xs text-gray-500 gap-1 mb-2">
                    <!-- <span>{{ video.views }}</span> -->
                    <span>•</span>
                    <span>{{ video.uploadTime }}</span>
                </div>

                <div class="flex items-center justify-between">
                    <span
                        class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {{ video.category }}
                    </span>
                    <div class="flex items-center text-xs text-gray-600">
                        <Icon
                            name="lucide:map-pin"
                            class="w-3 h-3 mr-1" />
                        {{ video.location }}
                    </div>
                </div>
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
