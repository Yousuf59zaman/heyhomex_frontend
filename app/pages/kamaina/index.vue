<script setup>
    useHead({title: "Kamaina Panel"})
    definePageMeta({middleware: ["auth-citizen"], layout: "citizen"})

   
    const hydrated = ref(false)
    const toast = useToast()

   
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
        "https://eu2.contabostorage.com/beede22b78b34cd7b1c01987a4332d1b:meteka/hls-videos/2025-11-30_15-22-46/index.m3u8"

    const searchQuery = ref("")
    const selectedCategory = ref("")
    const selectedHomeType = ref("")
    const selectedPriceRange = ref("")
    const chartPeriod = ref("weekly")

    const savedHomeItems = ref([])
    const loadingFavorites = ref(false)
    
    // Confirmation modal state
    const showConfirmModal = ref(false)
    const itemToRemove = ref(null)

    // Load favorite properties
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

    const savedVideoItems = ref([])

    // Load favorite videos
    const loadFavoriteVideos = async () => {
        loadingFavorites.value = true
        try {
            const response = await $fetchCitizen("/v1/favorite-videos/list", {
                method: "GET",
                params: {
                    page: 1,
                    per_page: 3,
                },
            })

            savedVideoItems.value = response.data.data
                .slice(0, 3)
                .map((video) => ({
                    id: video.id,
                    title: video.title,
                    description: video.description || '',
                    duration: video.duration || '0:00',
                    image: video.video_image || '/images/home/home_logo.png',
                }))
        } catch (e) {
            console.error("Error loading favorite videos:", e.message)
            savedVideoItems.value = []
        } finally {
            loadingFavorites.value = false
        }
    }

    const videos = ref([
        {
            id: 1,
            title: "HAWAIIAN",
            subtitle: "AIRLINES",
            thumbnail: "/images/dashboard/video/1.png",
            duration: "3:45",
            channelName: "AIRLINES",
            views: "0 Views",
            timeAgo: new Date().toLocaleDateString(),
            videoUrl: demoVideoUrl,
            isFavorite: false,
        },
        {
            id: 2,
            title: "LIVESTRAND",
            subtitle: "HOUSE",
            thumbnail: "/images/dashboard/video/2.png",
            duration: "5:12",
            channelName: "HOUSE",
            views: "0 Views",
            timeAgo: new Date().toLocaleDateString(),
            videoUrl: demoVideoUrl,
            isFavorite: false,
        },
        {
            id: 3,
            title: "WHICH",
            subtitle: "ONE ARE YOU?",
            thumbnail: "/images/dashboard/video/3.png",
            duration: "2:58",
            channelName: "ONE ARE YOU?",
            views: "0 Views",
            timeAgo: new Date().toLocaleDateString(),
            videoUrl: demoVideoUrl,
            isFavorite: false,
        },
    ])

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
            if (selectedCategory.value) {
                params.category = selectedCategory.value
            }
            if (selectedHomeType.value) {
                params.home_type = selectedHomeType.value
            }
            if (selectedPriceRange.value) {
                params.price_range = selectedPriceRange.value
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

    const handlePeriodChange = (period) => {
        chartPeriod.value = period
        console.log("Period changed:", period)
    }

    const handleMapSearch = () => {
        const query = {
            q: searchQuery.value || "",
            view: "list",
        }

        if (selectedCategory.value) {
            query.category = selectedCategory.value
        }
        if (selectedHomeType.value) {
            query.homeType = selectedHomeType.value
        }
        if (selectedPriceRange.value) {
            query.priceRange = selectedPriceRange.value
        }

        navigateTo({
            path: "/kamaina/search",
            query,
        })
    }

    const handleToggleFilters = () => {
        console.log("Toggle filters clicked")
    }

    const handleSavedTabChange = (tab) => {
        console.log("Saved tab changed:", tab)
    }

    const handleSellAll = () => {
        navigateTo("/kamaina/favorites")
    }

    const handleRemoveItem = ({itemId, type}) => {
        itemToRemove.value = { itemId, type }
        showConfirmModal.value = true
    }

    const confirmRemoveFavorite = async () => {
        if (!itemToRemove.value) return
        
        const { itemId, type } = itemToRemove.value
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
            } else if (type === "video") {
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
            navigateTo(`/kamaina/property/${item.id}`)
        } else if (type === "video") {
            navigateTo(`/kamaina/watch/${item.id}`)
        }
    }

    const handlePropertyClick = (property) => {
        navigateTo(`/kamaina/property/${property.id}`)
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
                
                // Reload favorites list
                await loadFavoriteProperties()
            } else {
                prop.isFavorited = previousState
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

    const handleVideoClick = (video) => {
        navigateTo(`/kamaina/watch/${video.id}`)
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
        <AdvertisementDisplay 
            v-if="hydrated"
            placement-slug="kamaina-search-top-banner" 
            
        />
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
            v-model:category="selectedCategory"
            v-model:home-type="selectedHomeType"
            v-model:price-range="selectedPriceRange"
            @search="handleSearch"
            @map-search="handleMapSearch"
            @toggle-filters="handleToggleFilters" />

        <AdvertisementDisplay 
            v-if="hydrated"
            placement-slug="kamaina-dashboard-row1-col-4-8" 
            
        />

        <!-- Chart and Saved List Section -->
        <div
            class="flex flex-col lg:grid lg:grid-cols-11 2xl:grid-cols-12 gap-4 lg:gap-2 2xl:gap-6">
            <!-- Market Chart Skeleton/Real -->
            <div class="order-1 lg:order-1 lg:col-span-6 2xl:col-span-7">
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
            <div class="order-2 lg:order-2 lg:col-span-5 2xl:col-span-5">
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
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
