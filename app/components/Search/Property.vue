<script setup>
    // Get URL parameters
    const route = useRoute();

    // Reactive state - initialize from URL params
    const searchQuery = ref(
        route.query.q || '123 Aloha Lane, Honolulu, HI 96818'
    );
    const viewMode = ref(route.query.view === 'map' ? 'Map View' : 'List View');
    const selectedCategory = ref(route.query.category || 'For Sell');
    const selectedPriceRange = ref(route.query.priceRange || '$250,000');
    const selectedHomeType = ref(route.query.homeType || 'Beds & Baths');
    const selectedOthers = ref(route.query.others || 'More');
    const selectedBedsAndBaths = ref(route.query.bedsAndBaths || '');

    // Mock property data - using same format as dashboard
    const properties = ref([
        {
            id: 1,
            title: 'Island Bank Hawaii',
            address: '456 Ocean View Dr, Maui, HI 96753',
            price: 431000,
            beds: 3,
            baths: 3,
            sqft: '1734/5000',
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
            sqft: '1753/5000',
            image: '/images/dashboard/2.png',
            isFavorited: false,
        },
        {
            id: 3,
            title: "Kama'aina Cleaning...",
            address: '89 Sunset Blvd, Kauai, HI 96714',
            price: 231000,
            beds: 2,
            baths: 2,
            sqft: '1200/3000',
            image: '/images/dashboard/3.png',
            isFavorited: false,
        },
        {
            id: 4,
            title: 'Aloha Handyman...',
            address: '22 Coral Ave, Hilo, HI 96720',
            price: 467000,
            beds: 4,
            baths: 3,
            sqft: '1713/5000',
            image: '/images/dashboard/1.png',
            isFavorited: false,
        },
    ]);

    const resultsFound = computed(() => properties.value.length);

    // Methods
    const toggleFavorite = (property) => {
        const index = properties.value.findIndex((p) => p.id === property.id);
        if (index !== -1) {
            properties.value[index].isFavorited =
                !properties.value[index].isFavorited;
        }
    };

    const handlePropertyClick = (property) => {
        navigateTo(`/kamaina/property/${property.id}`);
    };

    const handleSearch = () => {
        console.log('Searching for:', searchQuery.value);
    };

    const saveSearch = () => {
        console.log('Saving search...');
    };

    const clearSearch = () => {
        searchQuery.value = '';
    };

    const handleFilterChange = (filters) => {
        console.log('Filters changed:', filters);
        // Here you could implement filtering logic
    };

    // Watch for URL parameter changes
    watch(
        () => route.query,
        (newQuery) => {
            if (newQuery.q !== undefined) {
                searchQuery.value = newQuery.q;
            }
            if (newQuery.view) {
                viewMode.value =
                    newQuery.view === 'map' ? 'Map View' : 'List View';
            }
            if (newQuery.category) {
                selectedCategory.value = newQuery.category;
            }
            if (newQuery.priceRange) {
                selectedPriceRange.value = newQuery.priceRange;
            }
            if (newQuery.homeType) {
                selectedHomeType.value = newQuery.homeType;
            }
            if (newQuery.others) {
                selectedOthers.value = newQuery.others;
            }
            if (newQuery.bedsAndBaths) {
                selectedBedsAndBaths.value = newQuery.bedsAndBaths;
            }
        }
    );
</script>

<template>
    <div class="space-y-4 lg:space-y-6">
        <!-- Filters and Search Section -->
        <CommonCitizenSearchAdvancedFilterSection
            v-model="searchQuery"
            v-model:category="selectedCategory"
            v-model:price-range="selectedPriceRange"
            v-model:home-type="selectedHomeType"
            v-model:others="selectedOthers"
            v-model:beds-and-baths="selectedBedsAndBaths"
            @search="handleSearch"
            @save-search="saveSearch"
            @filter-change="handleFilterChange" />

        <!-- Results Header -->
        <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-lg p-4 lg:p-6">
            <div class="flex items-center gap-4">
                <h2 class="text-lg lg:text-xl font-semibold text-gray-900">
                    {{ searchQuery }}
                </h2>
            </div>

            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                    {{ resultsFound }} Results Found
                </span>

                <div class="flex items-center gap-2">
                    <button
                        :class="[
                            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                            viewMode === 'List View'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900',
                        ]"
                        @click="viewMode = 'List View'">
                        List View
                    </button>

                    <button
                        :class="[
                            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                            viewMode === 'Map View'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900',
                        ]"
                        @click="viewMode = 'Map View'">
                        Map View
                    </button>
                </div>
            </div>
        </div>

        <!-- Map View: 2-column grid + Map -->
        <div
            v-if="viewMode === 'Map View'"
            class="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
            <!-- Property Listings Grid -->
            <div class="lg:col-span-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <CommonCitizenPropertyCard
                        v-for="property in properties"
                        :key="property.id"
                        :property="property"
                        @click="handlePropertyClick"
                        @favorite="toggleFavorite" />
                </div>
            </div>

            <!-- Map Section -->
            <div class="lg:col-span-4">
                <div
                    class="bg-white rounded-xl overflow-hidden h-96 lg:h-[600px] lg:sticky lg:top-6">
                    <div class="w-full h-full bg-gray-100 relative">
                        <div
                            class="relative w-full h-full bg-gradient-to-br from-green-50 via-blue-50 to-green-100 overflow-hidden">
                            <!-- Map implementation here (same as original) -->
                            <div
                                class="absolute inset-0 flex items-center justify-center text-gray-500">
                                Map View
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- List View: Full-width property grid -->
        <div
            v-else
            class="space-y-6">
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                <CommonCitizenPropertyCard
                    v-for="property in properties"
                    :key="property.id"
                    :property="property"
                    @click="handlePropertyClick"
                    @favorite="toggleFavorite" />
            </div>
        </div>
    </div>
</template>

<style scoped>
    select {
        background-image: none;
    }
</style>
