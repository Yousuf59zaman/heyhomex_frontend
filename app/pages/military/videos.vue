<script setup>

useHead({ title: "Videos - Investor Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const videos = ref([])
const pending = ref(false)
const error = ref(null)

// Filter state
const searchQuery = ref("")
const selectedTag = ref(null)
const tags = ref([])
const tagsLoading = ref(false)

const clearSearch = () => {
    searchQuery.value = ""
    selectedTag.value = null
    loadVideos()
}

const handleSearch = () => {
    loadVideos()
}

const handleTagClick = (tagId) => {
    selectedTag.value = tagId
    searchQuery.value = ""
    loadVideos()
}

// Load tags from API
const loadTags = async () => {
    tagsLoading.value = true
    try {
        const response = await $fetchCitizen('/get/all/tag', {
            method: 'GET'
        })
        
        if (response.status === 'success') {
            tags.value = response.data || []
        }
    } catch (e) {
        console.error('Error loading tags:', e.message)
        tags.value = []
    } finally {
        tagsLoading.value = false
    }
}

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

        // Add search param if there's a search query
        if (searchQuery.value) {
            params.search = searchQuery.value
        }

        // Add tag filter if a tag is selected
        if (selectedTag.value) {
            params.search = selectedTag.value
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

const toggleFavorite = async (videoId) => {
    const video = videos.value.find((v) => v.id === videoId)
    if (!video) return

    const previousState = video.isFavorite
    video.isFavorite = !video.isFavorite

    try {
        const response = await $fetchCitizen(`/v1/favorite-videos/${videoId}/toggle`, {
            method: "POST",
        })

        if (response.status === "success") {
            video.isFavorite = response.data.is_favorite
            
            toast.add({
                severity: response.data.is_favorite ? 'success' : 'info',
                summary: response.data.is_favorite ? 'Added to Favorites' : 'Removed from Favorites',
                detail: response.data.is_favorite 
                    ? 'Video has been added to your favorite list'
                    : 'Video has been removed from your favorite list',
                life: 3000
            })
        } else {
            video.isFavorite = previousState
        }
    } catch (e) {
        console.error("Error toggling favorite:", e.message)
        video.isFavorite = previousState
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update favorite status',
            life: 3000
        })
    }
}

const playVideo = (videoId) => {
    const video = videos.value.find((item) => item.id === videoId)
    if (!video) {
        return
    }

    router.push(`/military/watch/${videoId}`)
}

onMounted(() => {
    loadVideos()
    loadTags()
})

watch(
    () => route.query.page,
    () => {
        loadVideos()
    }
)
</script>

<template>
    <div class="space-y-4 lg:space-y-6 w-full max-w-[1316px] mx-auto">
        <!-- Top Banner Ad -->
        <AdvertisementDisplay placement-slug="investor-videos-top-banner" />

        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl md:text-2xl font-semibold text-gray-900">Community Videos</h1>
                <!-- <p class="text-sm text-gray-600 mt-1">Browse educational and informational videos</p> -->
            </div>
            <!-- <NuxtLink to="/investor" class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Back to Dashboard
            </NuxtLink> -->
        </div>

        <!-- Search and Filters -->
        <div class="flex items-center gap-6">
            <div class="flex-1 bg-[#f7f7f8] border border-[#f7f7f8] rounded-lg px-4 py-3 flex items-center gap-2">
                <Icon
                    name="lucide:search"
                    class="w-5 h-5 text-[#6c6c6c] flex-shrink-0" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search Here..."
                    class="flex-1 bg-transparent border-none outline-none text-sm text-[#121a22] placeholder:text-[#6c6c6c]"
                    @keyup.enter="handleSearch" />
            </div>
            <button 
                @click="handleSearch"
                class="bg-[#18222C] text-white flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium hover:bg-[#2C3E50] transition-colors whitespace-nowrap">
                <span>Search</span>
                <Icon name="lucide:search" class="w-[18px] h-[18px]" />
            </button>
        </div>
        
        <!-- Horizontal Tag Pills -->
        <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            <button
                v-if="!tagsLoading"
                :class="[
                    'px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex-shrink-0',
                    !selectedTag
                        ? 'bg-[#18222c] text-white'
                        : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e6e8eb]',
                ]"
                @click="selectedTag = null; loadVideos()">
                All
            </button>
            <button
                v-for="tag in tags"
                :key="tag.id"
                :class="[
                    'px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex-shrink-0',
                    selectedTag === tag.id
                        ? 'bg-[#18222c] text-white'
                        : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e6e8eb]',
                ]"
                @click="handleTagClick(tag.id)">
                {{ tag.tag_title }}
            </button>
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
            <button @click="loadVideos" class="px-4 py-2 bg-[#333365] text-white rounded-lg hover:bg-[#232355]">Retry</button>
        </div>

        <div v-else-if="videos.length === 0" class="text-center py-12">
            <Icon name="lucide:video" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Videos Available</h3>
            <p class="text-gray-600">Check back later for new content</p>
        </div>

        <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    v-for="video in videos"
                    :key="video.id"
                    class="video-card flex flex-col">
                    <!-- Thumbnail -->
                    <div class="relative h-[200px] rounded-[10px] overflow-hidden cursor-pointer group" @click="playVideo(video.id)">
                        <img
                            :src="video.thumbnail"
                            :alt="video.title"
                            class="w-full h-full object-cover" />

                        <div
                            class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div
                                class="bg-red-600 group-hover:bg-red-700 flex items-center justify-center rounded-full w-10 h-10 transition-colors">
                                <Icon
                                    name="lucide:play"
                                    class="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <div
                            class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                            {{ video.duration }}
                        </div>
                        <button
                            @click.stop="toggleFavorite(video.id)"
                            class="absolute top-2 left-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors">
                            <Icon
                                name="lucide:heart"
                                :class="[
                                    'w-5 h-5',
                                    video.isFavorite ? 'text-[#2C3E50] fill-current' : 'text-[#2C3E50] fill-none',
                                ]" />
                        </button>
                    </div>

                    <!-- Video Details -->
                    <div class="flex gap-1 items-start mt-4">
                        <div class="flex-1 flex gap-4 items-start">
                            <!-- Channel Avatar -->
                            <div class="bg-[#283849] rounded-[10px] w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                <p class="text-white text-sm font-semibold text-center leading-[16px]">
                                    Hello
                                </p>
                            </div>
                            
                            <!-- Title and Metadata -->
                            <div class="flex-1 flex flex-col gap-1">
                                <h3
                                    class="text-[#283849] text-base font-semibold leading-[1.5] line-clamp-2 cursor-pointer hover:text-[#121a22]"
                                    @click="playVideo(video.id)">
                                    {{ video.title }}
                                </h3>
                                <div
                                    class="flex items-center text-xs text-[#283849] gap-1.5">
                                    <span>{{ video.channel }}</span>
                                    <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                    <span>{{ video.views }}</span>
                                    <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                    <span>{{ video.uploadTime }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Toast position="top-right" />
    
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
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
