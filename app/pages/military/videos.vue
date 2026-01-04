<script setup>
import { useVideoPlayer } from "~/composables/useVideoPlayer"

useHead({ title: "Videos - Military Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const { openVideo } = useVideoPlayer()
const route = useRoute()
const toast = useToast()
const videos = ref([])
const pending = ref(false)
const error = ref(null)

// Ad configuration - uses dynamic URLs based on current host
const { getDefaultAdConfig } = useAdConfig()
const adConfig = computed(() => getDefaultAdConfig())

const currentPage = ref(1)
const totalPages = ref(1)
const totalResults = ref(0)
const perPage = ref(12)

const loadVideos = async () => {
    pending.value = true
    error.value = null
    try {
        const params = {
            page: route.query.page ? route.query.page : 1,
        }

        const response = await $fetchCitizen("/videos/list", {
            method: "GET",
            params,
        })

        videos.value = response.data.data.map((video) => ({
            id: video.id,
            title: video.title,
            channel: video.channel?.name || 'Unknown Channel',
            duration: video.duration || '0:00',
            views: '0 views',
            uploadTime: new Date(video.created_at).toLocaleDateString(),
            thumbnail: video.video_image || '/images/dashboard/1.png',
            isFavorite: video.is_favorite || false,
            category: 'Real Estate',
            location: video.latitude && video.longitude ? 'Custom Location' : 'Unknown',
            coordinates: video.latitude && video.longitude ? [video.latitude, video.longitude] : null,
            videoUrl: video.video_url,
        })) || []
        
        currentPage.value = response.data.meta?.current_page || 1
        totalPages.value = response.data.meta?.last_page || 1
        totalResults.value = response.data.meta?.total || 0
        perPage.value = response.data.meta?.per_page || 12
    } catch (e) {
        console.error("Error loading videos:", e.message)
        error.value = e
        videos.value = []
    } finally {
        pending.value = false
    }
}

const toggleFavorite = (videoId) => {
    const video = videos.value.find((v) => v.id === videoId)
    if (video) {
        video.isFavorite = !video.isFavorite
    }
}

const playVideo = (videoId) => {
    const video = videos.value.find((item) => item.id === videoId)
    if (!video) {
        return
    }
    openVideo(video, videos.value)
}

onMounted(() => {
    loadVideos()
})

watch(
    () => route.query.page,
    () => {
        loadVideos()
    }
)
</script>

<template>
    <div class="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
        <!-- Top Banner Ad -->
        <AdvertisementDisplay placement-slug="military-videos-top-banner" />

        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl md:text-2xl font-semibold text-gray-900">Videos</h1>
                <p class="text-sm text-gray-600 mt-1">Browse educational and informational videos</p>
            </div>
            <NuxtLink
                to="/military"
                class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Back to Dashboard
            </NuxtLink>
        </div>

        <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="n in 8" :key="n" class="animate-pulse">
                <div class="bg-gray-200 rounded-lg h-48"></div>
                <div class="mt-2 h-4 bg-gray-200 rounded"></div>
                <div class="mt-2 h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p class="text-gray-600 mb-4">Failed to load videos</p>
            <button @click="loadVideos" class="px-4 py-2 bg-[#6E9EF3] text-white rounded-lg hover:bg-[#5E8EE3]">Retry</button>
        </div>

        <div v-else-if="videos.length === 0" class="text-center py-12">
            <Icon name="lucide:video" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Videos Available</h3>
            <p class="text-gray-600">Check back later for new content</p>
        </div>

        <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                <div
                    v-for="video in videos"
                    :key="video.id"
                    class="video-card bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100"
                    @click="playVideo(video.id)">
                    <div class="relative h-48 lg:h-52">
                        <img
                            :src="video.thumbnail"
                            :alt="video.title"
                            class="w-full h-full object-cover" />

                        <div
                            class="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                            <div
                                class="bg-red-600 hover:bg-red-700 flex items-center justify-center rounded-full w-12 h-12 transition-colors">
                                <Icon
                                    name="lucide:play"
                                    class="w-6 h-6 text-white" />
                            </div>
                        </div>

                        <div
                            class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                            {{ video.duration }}
                        </div>

                        <button
                            @click.stop="toggleFavorite(video.id)"
                            class="absolute top-3 right-3 w-8 h-8 bg-white/80 flex items-center justify-center backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm">
                            <Icon
                                name="lucide:heart"
                                :class="[
                                    'w-4 h-4 transition-colors',
                                    video.isFavorite
                                        ? 'text-red-500 fill-current'
                                        : 'text-gray-600',
                                ]" />
                        </button>
                    </div>

                    <div class="p-4 lg:p-5">
                        <div class="mb-3">
                            <h3
                                class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                                {{ video.title }}
                            </h3>
                            <p class="text-sm text-gray-600 mb-1">
                                {{ video.channel }}
                            </p>
                            <div
                                class="flex items-center text-xs text-gray-500 gap-2">
                                <span>{{ video.views }}</span>
                                <span>•</span>
                                <span>{{ video.uploadTime }}</span>
                            </div>
                        </div>

                        <div class="mt-2">
                            <span
                                class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {{ video.category }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Toast position="top-right" />
    
    <ClientOnly>
        <VideoPlayerModal :adConfig="adConfig" />
    </ClientOnly>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.video-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
