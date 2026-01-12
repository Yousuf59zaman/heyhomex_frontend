<script setup>
useHead({ title: "Favorites - Kamaina Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const route = useRoute()
const toast = useToast()
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

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const totalResults = ref(0)
const perPage = ref(12)

const loadFavoriteProperties = async () => {
    pending.value = true
    error.value = null
    try {
        const params = {
            page: route.query.page ? route.query.page : 1,
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
        currentPage.value = response.data.meta.current_page
        totalPages.value = response.data.meta.last_page
        totalResults.value = response.data.meta.total
        perPage.value = response.data.meta.per_page
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
        // TODO: Replace with actual API endpoint when available
        const response = await $fetchCitizen("/v1/favorite-videos/list", {
            method: "GET",
        })
        
        videos.value = response.data.data || []
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
        // TODO: Replace with actual API endpoint when available
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
    // TODO: Navigate to video detail page
    navigateTo(`/kamaina/video/${video.id}`)
}

onMounted(() => {
    loadFavoriteProperties()
    loadFavoriteVideos()
})

watch(
    () => route.query.page,
    () => {
        loadFavoriteProperties()
    }
)
</script>

<template>
    <div class="space-y-4 lg:space-y-6 w-full max-w-[1316px] mx-auto">
        <!-- Top Banner Ad -->
        <AdvertisementDisplay placement-slug="kamaina-favorites-top-banner" />

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
                <div v-if="totalResults > 0" class="mt-6">
                    <!-- <LazyPagination
                        :current-page="currentPage"
                        :total-pages="totalPages"
                        :show-text="true"
                        :total-results="totalResults"
                        :results-per-page="perPage"
                        @page-change="(page) => navigateTo({ query: { ...route.query, page } })" /> -->
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
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Video cards will be rendered here -->
                <div 
                    v-for="video in videos"
                    :key="video.id"
                    @click="handleVideoClick(video)"
                    class="cursor-pointer group">
                    <div class="relative bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                            :src="video.thumbnail || '/images/placeholder-video.jpg'" 
                            :alt="video.title"
                            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200" />
                        <button
                            @click.stop="toggleVideoFavorite(video)"
                            class="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                            <Icon name="lucide:heart" class="w-5 h-5 text-red-500 fill-red-500" />
                        </button>
                    </div>
                    <div class="mt-2">
                        <h3 class="font-semibold text-gray-900 group-hover:text-[#FF6666] transition-colors">
                            {{ video.title }}
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">{{ video.description }}</p>
                    </div>
                </div>
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
