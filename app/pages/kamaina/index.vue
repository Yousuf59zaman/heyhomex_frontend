<script setup>
    definePageMeta({
        layout: 'citizen',
    });

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

    // Propertis :
    const properties = ref([
        {
            id: 1,
            title: 'Hawaii Home Movers',
            address: '123 Aloha Lane, Honolulu, HI 96818',
            price: 475000,
            beds: 5,
            baths: 3,
            sqft: '1733/5000',
            image: '/images/dashboard/1.png',
            isFavorited: false,
        },
        {
            id: 2,
            title: 'Hawaii Home Movers',
            address: '123 Aloha Lane, Honolulu, HI 96818',
            price: 475000,
            beds: 5,
            baths: 3,
            sqft: '1733/5000',
            image: '/images/dashboard/2.png',
            isFavorited: false,
        },
        {
            id: 3,
            title: 'Hawaii Home Movers',
            address: '123 Aloha Lane, Honolulu, HI 96818',
            price: 475000,
            beds: 5,
            baths: 3,
            sqft: '1733/5000',
            image: '/images/dashboard/3.png',
            isFavorited: false,
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
        },
        {
            id: 2,
            title: 'LIVESTRAND',
            subtitle: 'HOUSE',
            thumbnail: '/images/dashboard/video/2.png',
            duration: '5:12',
        },
        {
            id: 3,
            title: 'WHICH',
            subtitle: 'ONE ARE YOU?',
            thumbnail: '/images/dashboard/video/3.png',
            duration: '2:58',
        },
    ]);

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
            path: '/kamaina/search',
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
        navigateTo(`/kamaina/property/${property.id}`);
    };

    const handleFavoriteToggle = (property) => {
        const index = properties.value.findIndex((p) => p.id === property.id);
        if (index !== -1) {
            properties.value[index].isFavorited =
                !properties.value[index].isFavorited;
        }
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
</script>

<template>
    <div class="space-y-6">
        <!-- Search and Filter Section -->
        <CommonCitizenSearchFilterSection
            v-model="searchQuery"
            v-model:property-type="selectedPropertyType"
            v-model:price-range="selectedPriceRange"
            @search="handleSearch"
            @map-search="handleMapSearch"
            @toggle-filters="handleToggleFilters" />

        <!-- Top Section: Chart and Saved List -->
        <div class="flex flex-col lg:grid lg:grid-cols-11 gap-4 lg:gap-2">
            <!-- Left Column - Market Chart (3/4 width) -->
            <div class="order-1 lg:order-1 lg:col-span-6">
                <CommonCitizenMarketChart
                    :initial-period="chartPeriod"
                    @period-change="handlePeriodChange" />
            </div>

            <!-- Right Column - Saved List (1/4 width) -->
            <div class="order-2 lg:order-2 lg:col-span-5">
                <CommonCitizenSavedList
                    :home-items="savedHomeItems"
                    :video-items="savedVideoItems"
                    @tab-change="handleSavedTabChange"
                    @sell-all="handleSellAll"
                    @remove-item="handleRemoveItem"
                    @item-click="handleSavedItemClick" />
            </div>
        </div>

        <!-- Homes in Your Favorite Areas Section -->
        <CommonCitizenPropertyGrid
            :properties="properties"
            @see-all="handleSeeAllProperties"
            @property-click="handlePropertyClick"
            @favorite-toggle="handleFavoriteToggle" />

        <!-- Videos you might like! Section -->
        <CommonCitizenVideoGrid
            :videos="videos"
            @see-all="handleSeeAllVideos"
            @video-click="handleVideoClick" />
    </div>
</template>
