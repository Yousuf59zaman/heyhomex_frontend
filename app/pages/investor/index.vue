<script setup>
    useHead({title: "Investor Panel"})
    definePageMeta({middleware: ["auth-citizen"], layout: "citizen"})

    const {citizen_user} = citizenAuth()

    const dashboardUserName = computed(() => {
        if (!citizen_user.value) return "User"
        if (citizen_user.value.data?.name) {
            return citizen_user.value.data.name.split(" ")[0]
        }
        if (citizen_user.value.data?.first_name) {
            return citizen_user.value.data.first_name
        }
        if (citizen_user.value.data?.email) {
            return citizen_user.value.data.email.split("@")[0]
        }
        return "User"
    })

    const toast = useToast()
    // Hydration state for SSR/CSR skeleton loading
    const hydrated = ref(false)

    

    //state
    const properties = ref([])
    const pending = ref(false)
    const error = ref(null)
    const route = useRoute()
    const paginationConfig = ref({
        data: {},
        lang: "en",
        align: "center",
        action: "",
    })
    const demoVideoUrl =
        "https://arprince.me/assets/video/cursor.mp4"

    const searchQuery = ref("")
    const selectedPropertyType = ref("")
    const selectedPriceRange = ref("")
    const chartPeriod = ref("weekly")

    

    const savedHomeItems = ref([])
    const loadingFavorites = ref(false)
    
    // Confirmation modal state
    const showConfirmModal = ref(false)
    const itemToRemove = ref(null)

    const savedVideoItems = ref([
        {
            id: 1,
            title: "Hawaii Property Tour",
            description: "Virtual tour",
            duration: "5:30",
            image: "/images/home/home_logo.png",
        },
        {
            id: 2,
            title: "Neighborhood Guide",
            description: "Area overview",
            duration: "3:45",
            image: "/images/home/home_logo.png",
        },
    ])

    const videos = ref([])
    const videosLoading = ref(false)
    const videosError = ref(null)

    // Load videos from API (without pagination for "videos you might like")
    const loadVideos = async () => {
        videosLoading.value = true
        videosError.value = null
        try {
            const response = await $fetchCitizen("/videos/list", {
                method: "GET",
                params: {
                    page: 1,
                    per_page: 3
                }
            })

            videos.value = response.data.data.map((video) => ({
                id: video.id,
                title: video.title,
                subtitle: video.channel?.name || '',
                thumbnail: video.video_image || '/images/dashboard/video/1.png',
                duration: video.duration || '0:00',
                channelName: video.channel?.name || "Unknown Channel",
                views: "0 Views",
                timeAgo: new Date(video.created_at).toLocaleDateString(),
                videoUrl: video.video_url || demoVideoUrl,
                isFavorite: video.is_favorite || false,
            }))
        } catch (e) {
            console.log("Error loading videos:", e.message)
            videosError.value = e
            videos.value = []
        } finally {
            videosLoading.value = false
        }
    }

    // Ad configuration - uses dynamic URLs based on current host
    const { getDefaultAdConfig } = useAdConfig()
    const adConfig = computed(() => getDefaultAdConfig())

   
    const loadData = async () => {
        pending.value = true
        error.value = null
        try {
            const params = {
                page: route.query.page ? route.query.page : 1,
            }

            if (searchQuery.value) {
                params.search = searchQuery.value
            }

            const response = await $fetchCitizen("/v1/property", {
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

            paginationConfig.value.data = response.data.meta
        } catch (e) {
            console.log("Error loading properties:", e.message)
            error.value = e
            properties.value = []
        } finally {
            pending.value = false
        }
    }

    const handleSearch = (query) => {
        console.log("Search:", query)
        loadData()
    }

    const handleMapSearch = () => {
        const query = {
            q: searchQuery.value || "",
            view: "map",
        }
        const propertyTypeMapping = {
            "single-family": "Single Family",
            condo: "Condo",
            townhouse: "Townhouse",
        }
        const priceRangeMapping = {
            "under-500k": "$500,000",
            "500k-1m": "$750,000",
            "over-1m": "$1,000,000+",
        }
        if (
            selectedPropertyType.value &&
            propertyTypeMapping[selectedPropertyType.value]
        ) {
            query.homeType = propertyTypeMapping[selectedPropertyType.value]
        }
        if (
            selectedPriceRange.value &&
            priceRangeMapping[selectedPriceRange.value]
        ) {
            query.priceRange = priceRangeMapping[selectedPriceRange.value]
        }

        navigateTo({
            path: "/investor/search",
            query,
        })
    }

    const handleToggleFilters = () => {
        console.log("Toggle filters clicked")
    }

    const handlePeriodChange = (period) => {
        chartPeriod.value = period
        console.log("Period changed:", period)
    }

    const handleSavedTabChange = (tab) => {
        console.log("Saved tab changed:", tab)
    }

    const handleSellAll = () => {
        navigateTo("/investor/favorites")
    }

    const handleRemoveItem = ({itemId, type}) => {
        itemToRemove.value = { itemId, type }
        showConfirmModal.value = true
    }

    const confirmRemoveFavorite = async () => {
        if (!itemToRemove.value) return
        
        const itemId = itemToRemove.value.itemId
        const type = itemToRemove.value.type
        itemToRemove.value = null
        
        try {
            if (type === "home") {
                await $fetchCitizen(`/v1/favorite-properties/${itemId}/toggle`, {
                    method: "POST",
                })
                
                toast.add({
                    severity: 'info',
                    summary: 'Removed from Favorites',
                    detail: 'Property has been removed from your saved list',
                    life: 3000
                })
                
                await loadFavoriteProperties()
            } else {
                await $fetchCitizen(`/v1/favorite-videos/${itemId}/toggle`, {
                    method: "POST",
                })
                
                toast.add({
                    severity: 'info',
                    summary: 'Removed from Favorites',
                    detail: 'Video has been removed from your saved list',
                    life: 3000
                })
                
                await loadFavoriteVideos()
            }
        } catch (e) {
            console.error("Error removing favorite:", e.message)
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to remove from favorites',
                life: 3000
            })
        }
    }

    const handleSavedItemClick = ({item, type}) => {
        if (type === "home") {
            navigateTo(`/investor/property/${item.id}`)
        } else {
            navigateTo(`/investor/watch/${item.id}`)
        }
    }

    const handlePropertyClick = (property) => {
        navigateTo(`/investor/property/${property.id}`)
    }

    const handleFavoriteToggle = async (property) => {
        const prop = properties.value.find((p) => p.id === property.id)
        if (!prop) return

        const previousState = prop.isFavorited
        prop.isFavorited = !prop.isFavorited

        try {
            const response = await $fetchCitizen(`/v1/favorite-properties/${property.id}/toggle`, {
                method: "POST",
            })

            if (response.status === "success") {
                prop.isFavorited = response.data.is_favorite
                
                toast.add({
                    severity: response.data.is_favorite ? 'success' : 'info',
                    summary: response.data.is_favorite ? 'Added to Favorites' : 'Removed from Favorites',
                    detail: response.data.is_favorite 
                        ? 'Property has been added to your favorite list'
                        : 'Property has been removed from your favorite list',
                    life: 3000
                })
                
                await loadFavoriteProperties()
            }
        } catch (e) {
            console.error("Error toggling favorite:", e.message)
            prop.isFavorited = previousState
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update favorite status',
                life: 3000
            })
        }
    }

     const loadFavoriteProperties = async () => {
        loadingFavorites.value = true
        try {
            const response = await $fetchCitizen("/v1/favorite-properties/list", {
                method: "GET",
                params: {
                    page: 1,
                    per_page: 3,
                },
            })

            // Only keep the first 3 properties
            savedHomeItems.value = response.data.data
                .slice(0, 3)
                .map((property) => ({
                    id: property.id,
                    title: property.name,
                    location: property.address,
                    image: property.image_url,
                    price: property.price,
                    beds: property.beds,
                    baths: property.baths,
                }))
        } catch (e) {
            console.error("Error loading favorite properties:", e.message)
            savedHomeItems.value = []
        } finally {
            loadingFavorites.value = false
        }
    }

    const loadFavoriteVideos = async () => {
        try {
            const response = await $fetchCitizen("/v1/favorite-videos/list", {
                method: "GET",
                params: {
                    page: 1,
                    per_page: 3,
                },
            })

            // Only keep the first 3 videos
            savedVideoItems.value = response.data.data
                .slice(0, 3)
                .map((video) => ({
                    id: video.id,
                    title: video.title,
                    description: video.description || '',
                    thumbnail: video.video_image || '/images/dashboard/video/1.png',
                }))
        } catch (e) {
            console.error("Error loading favorite videos:", e.message)
            savedVideoItems.value = []
        }
    }

    const handleVideoClick = (video) => {
        navigateTo(`/investor/watch/${video.id}`)
    }

    const toggleVideoFavorite = async (video) => {
        const targetVideo = videos.value.find((v) => v.id === video.id)
        if (!targetVideo) return

        const previousState = targetVideo.isFavorite
        targetVideo.isFavorite = !targetVideo.isFavorite

        try {
            const response = await $fetchCitizen(`/v1/favorite-videos/${video.id}/toggle`, {
                method: "POST",
            })

            if (response.status === "success") {
                targetVideo.isFavorite = response.data.is_favorite
                
                toast.add({
                    severity: response.data.is_favorite ? 'success' : 'info',
                    summary: response.data.is_favorite ? 'Added to Favorites' : 'Removed from Favorites',
                    detail: response.data.is_favorite 
                        ? 'Video has been added to your favorite list'
                        : 'Video has been removed from your favorite list',
                    life: 3000
                })
            } else {
                targetVideo.isFavorite = previousState
            }
        } catch (e) {
            console.error("Error toggling favorite:", e.message)
            targetVideo.isFavorite = previousState
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update favorite status',
                life: 3000
            })
        }
    }

    const handleSeeAllProperties = () => {
        console.log("See all properties")
    }

    const handleSeeAllVideos = () => {
        console.log("See all videos")
    }


    onMounted(() => {
        hydrated.value = true
        loadData()
        loadVideos()
        loadFavoriteProperties()
        loadFavoriteVideos()
    })

   
    watch(
        () => route.query,
        () => {
            if (hydrated.value) {
                loadData()
            }
        }
    )
</script>

<template>
    <div class="flex flex-col gap-6 w-full max-w-[1316px] mx-auto">
        <div class="lg:hidden flex flex-col gap-2 items-start justify-center pt-2">
            <div class="flex items-center gap-2">
                <img
                    class="w-8 h-8"
                    src="/svg/dashboard/home_logo.svg"
                    alt="HeyHome Logo" />
                <h1
                    class="text-[24px] leading-[32px] font-semibold text-[#2C3E50]">
                    Welcome back, {{ dashboardUserName }}!
                </h1>
            </div>
            <p class="text-[14px] leading-[1.5] text-[#283849]">
                Your local community insights are just a click away.
            </p>
        </div>
        <AdvertisementDisplay v-if="hydrated" placement-slug="investor-search-top-banner"
            class="investor-ad-banner" />
        <!-- Search Filter Section Skeleton BEFORE hydration -->
        <div v-if="!hydrated" class="animate-pulse">
            <div class="lg:hidden flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <div class="flex-1 h-[44px] bg-gray-200 rounded-lg"></div>
                    <div class="w-[44px] h-[44px] bg-gray-200 rounded-lg"></div>
                </div>
                <div class="w-full h-[44px] bg-gray-200 rounded-lg"></div>
            </div>
            <div class="hidden lg:flex lg:items-center lg:justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-[400px] h-[44px] bg-gray-200 rounded-lg"></div>
                    <div class="w-[120px] h-[44px] bg-gray-200 rounded-lg"></div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-[150px] h-[44px] bg-gray-200 rounded-lg border border-[#D4D4D4]"></div>
                    <div class="w-[140px] h-[44px] bg-gray-200 rounded-lg border border-[#D4D4D4]"></div>
                </div>
            </div>
        </div>

        <!-- Real Search Filter AFTER hydration -->
        <CommonCitizenSearchFilterSection
            v-else
            v-model="searchQuery"
            v-model:property-type="selectedPropertyType"
            v-model:price-range="selectedPriceRange"
            @search="handleSearch"
            @map-search="handleMapSearch"
            @toggle-filters="handleToggleFilters" />

         <AdvertisementDisplay v-if="hydrated" placement-slug="investor-dashboard-banner" />
        

        <!-- Chart and Saved List Section -->
        <div
            class="flex flex-col lg:grid lg:grid-cols-11 2xl:grid-cols-12 gap-4 lg:gap-2 2xl:gap-6">
            
            <!-- Market Chart Skeleton/Real -->
            <div class="lg:col-span-6 2xl:col-span-7">
                <!-- Market Chart Skeleton BEFORE hydration -->
                <div
                    v-if="!hydrated"
                    class="bg-white rounded-[10px] p-5 flex flex-col gap-5 animate-pulse">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div class="h-6 w-64 bg-gray-200 rounded"></div>
                        <div class="h-[32px] w-24 bg-[#EAECEE] rounded-[32px]"></div>
                    </div>
                    <div class="h-[320px] sm:h-64 md:h-80 bg-gray-200 rounded"></div>
                </div>

                <!-- Real Market Chart AFTER hydration -->
                <CommonCitizenMarketChart
                    v-else
                    :initial-period="chartPeriod"
                    @period-change="handlePeriodChange" />
            </div>

            <!-- Saved List Skeleton/Real -->
            <div class="lg:col-span-5 2xl:col-span-5">
                <!-- Saved List Skeleton BEFORE hydration -->
                <div
                    v-if="!hydrated"
                    class="bg-white border border-[#F4F4F6] rounded-[12px] p-4 flex flex-col gap-8 animate-pulse">
                    <div class="flex flex-col gap-5">
                        <div class="flex items-center justify-between">
                            <div class="h-7 w-28 bg-gray-200 rounded"></div>
                            <div class="hidden lg:block h-5 w-14 bg-gray-200 rounded"></div>
                        </div>
                        <div class="flex gap-3 bg-[#F0F1F3] rounded-[8px] p-[6px]">
                            <div class="flex-1 h-[32px] bg-gray-300 rounded-[8px]"></div>
                            <div class="flex-1 h-[32px] bg-gray-200 rounded-[8px]"></div>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div v-for="n in 3" :key="n" class="flex items-center gap-3">
                            <div class="w-16 h-16 bg-gray-200 rounded-lg shrink-0"></div>
                            <div class="flex-1 space-y-2">
                                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div class="h-3 bg-gray-200 rounded w-full"></div>
                            </div>
                            <div class="w-5 h-5 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                <!-- Real Saved List AFTER hydration -->
                <CommonCitizenSavedList
                    v-else
                    :home-items="savedHomeItems"
                    :video-items="savedVideoItems"
                    @tab-change="handleSavedTabChange"
                    @sell-all="handleSellAll"
                    @remove-item="handleRemoveItem"
                    @item-click="handleSavedItemClick" />
            </div>
        </div>

        <!-- Skeleton BEFORE hydration (SSR/Initial Load) -->
        <div
            v-if="!hydrated"
            class="animate-pulse">
            <div class="flex items-end justify-between mb-4">
                <div class="h-8 w-72 bg-gray-200 rounded"></div>
                <div class="hidden sm:block h-6 w-16 bg-gray-200 rounded"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CommonCitizenPropertyCardSkeleton v-for="n in 3" :key="n" />
            </div>
        </div>

        <!-- Content AFTER hydration -->
        <template v-else>
            <!-- Loading State with Skeleton Loaders -->
            <div
                v-if="pending"
                class="animate-pulse">
                <div class="flex items-end justify-between mb-4">
                    <div class="h-8 w-72 bg-gray-200 rounded"></div>
                    <div class="hidden sm:block h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CommonCitizenPropertyCardSkeleton v-for="n in 3" :key="n" />
                </div>
            </div>

            <!-- Error State -->
            <div
                v-else-if="error"
                class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p class="text-red-600 mb-2">
                    Error loading properties. Please try again later.
                </p>
                <p class="text-sm text-red-500">{{ error.message }}</p>
            </div>

            <!-- Properties Grid -->
            <CommonCitizenPropertyGrid
                v-else
                :properties="properties"
                @see-all="handleSeeAllProperties"
                @property-click="handlePropertyClick"
                @favorite-toggle="handleFavoriteToggle" />

            <!-- Pagination -->
            <LazyPagination
                v-if="!pending && properties.length > 0"
                class="px-4"
                :config="paginationConfig" />
        </template>

        <!-- Video Grid Skeleton BEFORE hydration -->
        <div
            v-if="!hydrated"
            class="rounded-lg mb-10 animate-pulse">
            <div class="flex items-center justify-between mb-4">
                <div class="h-5 sm:h-6 w-48 bg-gray-200 rounded"></div>
                <div class="h-4 w-14 bg-gray-200 rounded"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    v-for="n in 3"
                    :key="n"
                    class="rounded-lg overflow-hidden">
                    <div class="relative h-40 sm:h-48 md:h-52 bg-gray-200">
                        <div class="absolute bottom-2 right-2 h-5 w-10 bg-gray-300 rounded"></div>
                    </div>
                    <div class="px-0 pb-4">
                        <div class="flex gap-1 items-start mt-4">
                            <div class="flex-1 flex gap-4 items-start">
                                <div class="w-12 h-12 bg-gray-200 rounded-[10px] shrink-0"></div>
                                <div class="flex-1 space-y-2">
                                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div class="w-5 h-5 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Real Video Grid AFTER hydration -->
        <CommonCitizenVideoGrid
            v-else
            :videos="videos"
            show-info
            :ad-config="adConfig"
            @see-all="handleSeeAllVideos"
            @video-click="handleVideoClick"
            @favorite="toggleVideoFavorite" />
    </div>

    <!-- Toast Notifications -->
    <Toast position="top-right" />

    <!-- Confirmation Modal -->
    <ConfirmModal
        v-model:isOpenConModal="showConfirmModal"
        title="Remove from Favorites?"
        message="This property will be removed from your saved list."
        @confirm="confirmRemoveFavorite" />
</template>

<style scoped>
@media (min-width: 768px) {
    .investor-ad-banner :deep(.advertisement-content) {
        height: clamp(96px, 12vw, 176px);
    }
}
</style>
