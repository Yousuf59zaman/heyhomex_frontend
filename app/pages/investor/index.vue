<script setup>
    definePageMeta({
        layout: 'citizen',
    });

    // Hydration state for SSR/CSR skeleton loading
    const hydrated = ref(false)

    const demoVideoUrl = 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8';
    // Use properties composable with lazy loading
    const { properties, pending, error, toggleFavorite } = useProperties()

    // Search and filter state
    const searchQuery = ref('');
    const selectedPropertyType = ref('');
    const selectedPriceRange = ref('');

    // Chart state
    const chartPeriod = ref('weekly');

    // Top-Right : Saved List
    const savedHomeItems = ref([
        {
            id: 1,
            title: 'Island Bank Hawaii',
            location: '123 Aloha Lane, Honolulu, HI 96814',
            image: '/images/dashboard/1.png',
        },
        {
            id: 2,
            title: 'Island Bank Hawaii',
            location: '456 Kamehameha Hwy, Honolulu, HI 96817',
            image: '/images/dashboard/2.png',
        },
        {
            id: 3,
            title: 'Island Bank Hawaii',
            location: '789 Pali Hwy, Honolulu, HI 96813',
            image: '/images/dashboard/3.png',
        },
    ]);

    const savedVideoItems = ref([
        {
            id: 1,
            title: 'Hawaii Property Tour',
            description: 'Virtual tour',
            duration: '5:30',
            image: '/images/home/home_logo.png',
        },
        {
            id: 2,
            title: 'Neighborhood Guide',
            description: 'Area overview',
            duration: '3:45',
            image: '/images/home/home_logo.png',
        },
    ]);

    // Videos :
    const videos = ref([
        {
            id: 1,
            title: 'HAWAIIAN',
            subtitle: 'AIRLINES',
            thumbnail: '/images/dashboard/video/1.png',
            duration: '3:45',
            videoUrl: demoVideoUrl
        },
        {
            id: 2,
            title: 'LIVESTRAND',
            subtitle: 'HOUSE',
            thumbnail: '/images/dashboard/video/2.png',
            duration: '5:12',
            videoUrl: demoVideoUrl
        },
        {
            id: 3,
            title: 'WHICH',
            subtitle: 'ONE ARE YOU?',
            thumbnail: '/images/dashboard/video/3.png',
            duration: '2:58',
            videoUrl: demoVideoUrl
        }
    ]);

    // Ad configuration for VAST video advertising
    const adConfig = ref({
    "client": "vast",
    "schedule": [
        {
            "offset": "pre",
            "tag": "http://localhost:3000/ads/pre-roll-ad.xml",
            "type": "linear"
        },
        {
            "offset": "50%",
            "tag": "http://localhost:3000/ads/mid-roll-ad.xml",
            "type": "linear"
        },
        {
            "offset": "post",
            "tag": "http://localhost:3000/ads/post-roll-ad.xml",
            "type": "linear"
        }
    ],
    "skipoffset": 5,
    "admessage": "This ad will end in xx seconds",
    "skipmessage": "Skip ad",
    "vpaidcontrols": true,
    "autoplayadsmuted": false
});

    // Event handlers
    const handleSearch = (query) => {
        console.log('Search:', query);
    };

    const handleMapSearch = () => {
        // Navigate to search page with search query and show map view
        const query = {
            q: searchQuery.value || '',
            view: 'map',
        };

        // Map property type to search format
        const propertyTypeMapping = {
            'single-family': 'Single Family',
            condo: 'Condo',
            townhouse: 'Townhouse',
        };

        // Map price range to search format
        const priceRangeMapping = {
            'under-500k': '$500,000',
            '500k-1m': '$750,000',
            'over-1m': '$1,000,000+',
        };

        // Add filters if they exist
        if (
            selectedPropertyType.value &&
            propertyTypeMapping[selectedPropertyType.value]
        ) {
            query.homeType = propertyTypeMapping[selectedPropertyType.value];
        }
        if (
            selectedPriceRange.value &&
            priceRangeMapping[selectedPriceRange.value]
        ) {
            query.priceRange = priceRangeMapping[selectedPriceRange.value];
        }

        navigateTo({
            path: '/investor/search',
            query,
        });
    };

    const handleToggleFilters = () => {
        console.log('Toggle filters clicked');
    };

    const handlePeriodChange = (period) => {
        chartPeriod.value = period;
        console.log('Period changed:', period);
    };

    const handleSavedTabChange = (tab) => {
        console.log('Saved tab changed:', tab);
    };

    const handleSellAll = () => {
        console.log('Sell all clicked');
    };

    const handleRemoveItem = ({ itemId, type }) => {
        console.log('Remove item:', itemId, type);
        if (type === 'home') {
            const index = savedHomeItems.value.findIndex(
                (item) => item.id === itemId
            );
            if (index !== -1) {
                savedHomeItems.value.splice(index, 1);
            }
        } else {
            const index = savedVideoItems.value.findIndex(
                (item) => item.id === itemId
            );
            if (index !== -1) {
                savedVideoItems.value.splice(index, 1);
            }
        }
    };

    const handleSavedItemClick = ({ item, type }) => {
        console.log('Saved item clicked:', item, type);
    };

    const handlePropertyClick = (property) => {
        navigateTo(`/investor/property/${property.id}`);
    };

    const handleFavoriteToggle = (property) => {
        toggleFavorite(property.id);
    };

    const handleVideoClick = (video) => {
        console.log('Video clicked:', video);
    };

    const handleSeeAllProperties = () => {
        console.log('See all properties');
    };

    const handleSeeAllVideos = () => {
        console.log('See all videos');
    };

    // Set hydrated to true after component is mounted on client
    onMounted(() => {
        hydrated.value = true
    })
</script>

<template>
    <div class="space-y-6">
        <!-- Search Filter Section Skeleton BEFORE hydration -->
        <div v-if="!hydrated" class="bg-white rounded-lg shadow-sm p-4 md:p-6 animate-pulse">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 h-12 bg-gray-200 rounded"></div>
                <div class="w-full md:w-40 h-12 bg-gray-200 rounded"></div>
                <div class="w-full md:w-40 h-12 bg-gray-200 rounded"></div>
                <div class="w-full md:w-32 h-12 bg-gray-200 rounded"></div>
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

        <!-- Chart and Saved List Section -->
        <div class="flex flex-col lg:grid lg:grid-cols-11 2xl:grid-cols-12 gap-4 lg:gap-2 2xl:gap-6">
            <!-- Market Chart Skeleton/Real -->
            <div class="order-1 lg:order-1 lg:col-span-6 2xl:col-span-7">
                <!-- Market Chart Skeleton BEFORE hydration -->
                <div v-if="!hydrated" class="bg-white rounded-lg shadow-sm p-4 md:p-6 animate-pulse">
                    <div class="flex items-center justify-between mb-4">
                        <div class="h-6 w-40 bg-gray-200 rounded"></div>
                        <div class="flex gap-2">
                            <div class="h-8 w-20 bg-gray-200 rounded"></div>
                            <div class="h-8 w-20 bg-gray-200 rounded"></div>
                            <div class="h-8 w-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                    <div class="h-64 bg-gray-200 rounded"></div>
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
                <div v-if="!hydrated" class="bg-white rounded-lg shadow-sm p-4 md:p-6 animate-pulse">
                    <div class="flex gap-2 mb-4">
                        <div class="h-10 flex-1 bg-gray-200 rounded"></div>
                        <div class="h-10 flex-1 bg-gray-200 rounded"></div>
                    </div>
                    <div class="space-y-3">
                        <div class="h-20 bg-gray-200 rounded"></div>
                        <div class="h-20 bg-gray-200 rounded"></div>
                        <div class="h-20 bg-gray-200 rounded"></div>
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
            class="space-y-4 md:space-y-6">
            <div class="flex items-center justify-between">
                <h2 class="text-xl md:text-2xl font-bold text-gray-900">
                    Homes in Your Favorite Areas
                </h2>
                <div class="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                <CommonCitizenPropertyCardSkeleton
                    v-for="n in 3"
                    :key="n" />
            </div>
        </div>

        <!-- Content AFTER hydration -->
        <template v-else>
            <!-- Loading State with Skeleton Loaders -->
            <div v-if="pending" class="space-y-4 md:space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl md:text-2xl font-bold text-gray-900">
                        Homes in Your Favorite Areas
                    </h2>
                    <div class="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                    <CommonCitizenPropertyCardSkeleton v-for="n in 3" :key="n" />
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p class="text-red-600 mb-2">Error loading properties. Please try again later.</p>
                <p class="text-sm text-red-500">{{ error.message }}</p>
            </div>

            <!-- Properties Grid -->
            <CommonCitizenPropertyGrid
                v-else
                :properties="properties"
                @see-all="handleSeeAllProperties"
                @property-click="handlePropertyClick"
                @favorite-toggle="handleFavoriteToggle" />
        </template>

        <!-- Video Grid Skeleton BEFORE hydration -->
        <div v-if="!hydrated" class="space-y-4 md:space-y-6">
            <div class="flex items-center justify-between">
                <h2 class="text-xl md:text-2xl font-bold text-gray-900">
                    Videos you might like!
                </h2>
                <div class="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                <div v-for="n in 3" :key="n" class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div class="aspect-video bg-gray-200"></div>
                    <div class="p-4 space-y-3">
                        <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Real Video Grid AFTER hydration -->
        <CommonCitizenVideoGrid
            v-else
            :videos="videos"
            :ad-config="adConfig"
            @see-all="handleSeeAllVideos"
            @video-click="handleVideoClick" />
    </div>
</template>
