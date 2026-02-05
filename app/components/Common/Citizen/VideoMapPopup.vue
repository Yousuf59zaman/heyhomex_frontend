<script setup>
const props = defineProps({
    video: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['click'])

const handleClick = () => {
    emit('click', props.video)
}
</script>

<template>
    <div
        @click="handleClick"
        class="bg-white p-2 w-80 rounded-xl border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
        <div class="relative">
            <img
                :src="video.thumbnail"
                :alt="video.title"
                class="w-full rounded-lg h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            
            <!-- Play button overlay -->
            <div
                class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                    class="bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 shadow-lg flex items-center justify-center">
                    <Icon
                        name="lucide:play"
                        class="w-6 h-6 text-gray-800" />
                </div>
            </div>

            <!-- Duration badge -->
            <div
                class="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs font-medium">
                {{ video.duration }}
            </div>

            <!-- Category badge (if available) -->
            <div
                v-if="video.category"
                class="absolute top-2 left-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-medium">
                {{ video.category }}
            </div>
        </div>

        <div class="p-3">
            <div class="flex gap-3 items-start">
                <!-- Channel Avatar -->
                <div class="bg-[#283849] w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                    <span class="text-white text-xs font-semibold">
                        {{ video.channel?.charAt(0) || 'H' }}
                    </span>
                </div>

                <!-- Video Info -->
                <div class="flex-1 min-w-0">
                    <h3
                        class="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {{ video.title }}
                    </h3>
                    <p class="text-xs text-gray-600 mb-1">
                        {{ video.channel || 'Unknown Channel' }}
                    </p>
                    <div class="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>{{ video.views || '0 views' }}</span>
                        <div class="w-1 h-1 rounded-full bg-gray-400"></div>
                        <span>{{ video.uploadTime }}</span>
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
