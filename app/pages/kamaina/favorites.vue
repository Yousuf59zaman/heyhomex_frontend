<script setup>
useHead({ title: "Favorites - Kamaina Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const route = useRoute()
const toast = useToast()
const { $formatdate } = useNuxtApp()
const properties = ref([])
const videos = ref([])
const pending = ref(false)
const pendingVideos = ref(false)
const error = ref(null)
const errorVideos = ref(null)
const showConfirmModal = ref(false)
const propertyToRemove = ref(null)
const videoToRemove = ref(null)
const activeTab = ref('property')

const paginationConfig = ref({
    data: {},
    lang: "en",
    align: "center",
    action: "",
})

const loadFavoriteProperties = async () => {
    pending.value = true
    error.value = null
    try {
        const params = {
            page: route.query.page ? route.query.page : 1,
            length: 9
        }

        const response = await $fetchCitizen("/v1/favorite-properties/list", {
            method: "GET",
            params,
        })

        properties.value = response.data.data.map((property) => ({
            id: property.id,
            title: property.name,
            address: property.address,
            price: property.price,
            beds: property.beds,
            baths: property.baths,
            sqft: property.square_feet,
            image: property.image_url,
            isFavorited: property.is_favorite || false,
            coordinates: property.location
                ? [
                      parseFloat(property.location.latitude),
                      parseFloat(property.location.longitude),
                  ]
                : null,
        }))

        // Update pagination
        // Update pagination
        paginationConfig.value.data = response.data.meta
    } catch (e) {
        console.error("Error loading favorite properties:", e.message)
        error.value = e
        properties.value = []
    } finally {
        pending.value = false
    }
}

const loadFavoriteVideos = async () => {
    pendingVideos.value = true
    errorVideos.value = null
    try {
        const params = {
            page: route.query.page ? route.query.page : 1,
            limit: 9
        }

        const response = await $fetchCitizen("/v1/favorite-videos/list", {
            method: "GET",
            params,
        })
        
        videos.value = response.data.data.map((video) => ({
            id: video.id,
            title: video.title,
            description: video.description || '',
            channel: video.channel?.name || 'Unknown Channel',
            duration: video.duration || '0:00',
            views: '0 views',
            uploadTime: $formatdate(video.created_at),
            thumbnail: video.video_image || '/images/dashboard/1.png',
            isFavorite: true,
            videoUrl: video.video_url,
        })) || []

        paginationConfig.value.data = response.data.meta
    } catch (e) {
        console.error("Error loading favorite videos:", e.message)
        errorVideos.value = e
        videos.value = []
    } finally {
        pendingVideos.value = false
    }
}

const toggleFavorite = (property) => {
    propertyToRemove.value = property
    showConfirmModal.value = true
}

const toggleVideoFavorite = (video) => {
    videoToRemove.value = video
    showConfirmModal.value = true
}

const confirmRemoveFavorite = async () => {
    if (propertyToRemove.value) {
        await confirmRemoveProperty()
    } else if (videoToRemove.value) {
        await confirmRemoveVideo()
    }
}

const confirmRemoveProperty = async () => {
    if (!propertyToRemove.value) return

    const propertyId = propertyToRemove.value.id
    propertyToRemove.value = null
    
    try {
        const response = await $fetchCitizen(`/v1/favorite-properties/${propertyId}/toggle`, {
            method: "POST",
        })

        if (response.status === "success") {
            properties.value = properties.value.filter(p => p.id !== propertyId)
            
            toast.add({
                severity: 'info',
                summary: 'Removed from Favorites',
                detail: 'Property has been removed from your favorite list',
                life: 3000
            })
            
            if (properties.value.length === 0) {
                await loadFavoriteProperties()
            }
        }
    } catch (e) {
        console.error("Error toggling favorite:", e.message)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update favorite status',
            life: 3000
        })
    }
}

const confirmRemoveVideo = async () => {
    if (!videoToRemove.value) return

    const videoId = videoToRemove.value.id
    videoToRemove.value = null
    
    try {
        const response = await $fetchCitizen(`/v1/favorite-videos/${videoId}/toggle`, {
            method: "POST",
        })

        if (response.status === "success") {
            videos.value = videos.value.filter(v => v.id !== videoId)
            
            toast.add({
                severity: 'info',
                summary: 'Removed from Favorites',
                detail: 'Video has been removed from your favorite list',
                life: 3000
            })
            
            if (videos.value.length === 0) {
                await loadFavoriteVideos()
            }
        }
    } catch (e) {
        console.error("Error toggling favorite video:", e.message)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update favorite status',
            life: 3000
        })
    }
}

const handlePropertyClick = (property) => {
    navigateTo(`/kamaina/property/${property.id}`)
}

const handleVideoClick = (video) => {
    navigateTo(`/kamaina/watch/${video.id}`)
}

onMounted(() => {
    loadFavoriteProperties()
    loadFavoriteVideos()
})

watch(
    () => route.query.page,
    () => {
        if (activeTab.value === 'property') {
            loadFavoriteProperties()
        } else {
            loadFavoriteVideos()
        }
    }
)

watch(activeTab, () => {
    const router = useRouter()
    router.replace({ query: {} })
    
    if (activeTab.value === 'property') {
        loadFavoriteProperties()
    } else {
        loadFavoriteVideos()
    }
})
</script>

<template>
    <div class="space-y-4 lg:space-y-6 w-full max-w-[1316px] mx-auto">
        <!-- Top Banner Ad -->
        <FeatureDisplay placement-slug="kamaina-favorites-top-banner" />

        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl md:text-2xl font-semibold text-gray-900">
                    Favorites
                </h1>
                <p class="text-sm text-gray-600 mt-1">
                    Your saved properties and videos for quick access
                </p>
            </div>
            <NuxtLink
                to="/kamaina"
                class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Back to Dashboard
            </NuxtLink>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-lg p-3 lg:p-4">
            <div class="flex items-center gap-3">
                <button
                    @click="activeTab = 'property'"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeTab === 'property'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900',
                    ]">
                    Property
                </button>
                <button
                    @click="activeTab = 'video'"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeTab === 'video'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900',
                    ]">
                    Video
                </button>
            </div>
        </div>

        <FeatureDisplay placement-slug="kamaina-favorites-top-banner" />
        
        <!-- Properties Tab Content -->
        <div v-if="activeTab === 'property'">
            <!-- Loading State -->
            <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CommonCitizenPropertyCardSkeleton v-for="n in 8" :key="n" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-12">
                <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p class="text-gray-600 mb-4">Failed to load favorite properties</p>
                <button
                    @click="loadFavoriteProperties"
                    class="px-4 py-2 bg-[#FF6666] text-white rounded-lg hover:bg-[#FF5555]">
                    Retry
                </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="properties.length === 0" class="text-center py-12">
                <Icon name="lucide:heart" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    No Favorite Properties
                </h3>
                <p class="text-gray-600 mb-6">
                    Start adding properties to your favorites to see them here
                </p>
                <NuxtLink
                    to="/kamaina/search"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6666] text-white rounded-lg hover:bg-[#FF5555]">
                    <Icon name="lucide:search" class="w-4 h-4" />
                    Browse Properties
                </NuxtLink>
            </div>

            <!-- Properties Grid -->
            <div v-else>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CommonCitizenPropertyCard
                        v-for="property in properties"
                        :key="property.id"
                        :property="property"
                        @click="handlePropertyClick(property)"
                        @favorite="toggleFavorite" />
                </div>

                <!-- Pagination -->
                <div v-if="properties.length > 0" class="mt-6">
                    <LazyPagination :config="paginationConfig" />
                </div>
            </div>
        </div>

        <!-- Videos Tab Content -->
        <div v-else-if="activeTab === 'video'">
            <!-- Loading State -->
            <div v-if="pendingVideos" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="n in 8" :key="n" class="animate-pulse">
                    <div class="bg-gray-200 rounded-lg h-48"></div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="errorVideos" class="text-center py-12">
                <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p class="text-gray-600 mb-4">Failed to load favorite videos</p>
                <button
                    @click="loadFavoriteVideos"
                    class="px-4 py-2 bg-[#FF6666] text-white rounded-lg hover:bg-[#FF5555]">
                    Retry
                </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="videos.length === 0" class="text-center py-12">
                <Icon name="lucide:video" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    No Favorite Videos
                </h3>
                <p class="text-gray-600 mb-6">
                    Start adding videos to your favorites to see them here
                </p>
                <NuxtLink
                    to="/kamaina/videos"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6666] text-white rounded-lg hover:bg-[#FF5555]">
                    <Icon name="lucide:video" class="w-4 h-4" />
                    Browse Videos
                </NuxtLink>
            </div>

            <!-- Videos Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    v-for="video in videos"
                    :key="video.id"
                    class="video-card flex flex-col">
                    <!-- Thumbnail -->
                    <div class="relative h-[200px] rounded-[10px] overflow-hidden cursor-pointer group" @click="handleVideoClick(video)">
                        <CommonHlsVideoThumbnail
                            :thumbnail="video.thumbnail"
                            :video-url="video.videoUrl"
                            :alt="video.title" />

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
                            @click.stop="toggleVideoFavorite(video)"
                            class="absolute top-2 right-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors">
                            <Icon
                                :name="video.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'"
                                class="w-5 h-5 text-[#283849]" />
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
                                    @click="handleVideoClick(video)">
                                    {{ video.title }}
                                </h3>
                                <div
                                    class="flex items-center text-xs text-[#283849] gap-1.5">
                                    <span>{{ video.channel }}</span>
                                    <!-- <div class="bg-[#d4d4d4] h-3 w-px"></div> -->
                                    <!-- <span>{{ video.views }}</span> -->
                                    <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                    <span>{{ video.uploadTime }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             <div v-if="videos.length > 0" class="mt-6">
                <LazyPagination :config="paginationConfig" />
            </div>
        </div>
    </div>

    <!-- Toast Notifications -->
    <Toast position="top-right" />

    <!-- Confirmation Modal -->
    <ConfirmModal
        v-model:isOpenConModal="showConfirmModal"
        :title="propertyToRemove ? 'Remove from Favorites?' : 'Remove from Favorites?'"
        :message="propertyToRemove ? 'This property will be removed from your saved list.' : 'This video will be removed from your saved list.'"
        @confirm="confirmRemoveFavorite" />
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
