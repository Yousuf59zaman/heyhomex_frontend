<script setup>
    definePageMeta({
        layout: 'citizen',
    });

    // Reactive state
    const searchQuery = ref('123 Aloha Lane, Honolulu, HI 96818');
    const viewMode = ref('List View'); // 'List View', 'Map View', or 'Web View'
    const selectedCategory = ref('For Sell');
    const selectedPriceRange = ref('$250,000');
    const selectedHomeType = ref('Beds & Baths');
    const selectedOthers = ref('More');

    // Filter options
    const categories = ref(['For Sell', 'For Rent', 'Sold']);
    const priceRanges = ref([
        '$250,000',
        '$500,000',
        '$750,000',
        '$1,000,000+',
    ]);
    const homeTypes = ref([
        'Beds & Baths',
        'Studio',
        '1 Bed',
        '2 Beds',
        '3+ Beds',
    ]);
    const othersOptions = ref([
        'More',
        'New Construction',
        'Open House',
        'Recently Sold',
    ]);
    const bedsAndBathsOptions = ref(['Any', '1+', '2+', '3+', '4+', '5+']);

    // Mock property data matching Figma design
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
            isFavorite: false,
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
            isFavorite: false,
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
            isFavorite: false,
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
            isFavorite: false,
        },
    ]);

    const resultsFound = computed(() => properties.value.length);

    // Methods
    const toggleFavorite = (propertyId) => {
        const property = properties.value.find((p) => p.id === propertyId);
        if (property) {
            property.isFavorite = !property.isFavorite;
        }
    };

    const handleSearch = () => {
        console.log('Searching for:', searchQuery.value);
        // Implement search logic here
    };

    const saveSearch = () => {
        console.log('Saving search...');
        // Implement save search logic here
    };

    const navigateToProperty = (propertyId) => {
        navigateTo(`/kamaina/property/${propertyId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const clearSearch = () => {
        searchQuery.value = '';
    };
</script>

<template>
    <div class="space-y-4 lg:space-y-6">
        <!-- Header Section -->
        <div class="bg-white rounded-lg p-3 lg:p-4">
            <!-- Top Navigation Tabs -->
            <div class="flex items-center gap-3 mb-3">
                <button
                    class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                    Home
                </button>
                <NuxtLink to="/kamaina/seatchvideo"
                    class="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Videos
                </NuxtLink>
            </div>

            <!-- Combined Filter and Search Row -->
            <div class="flex flex-col lg:flex-row gap-3">
                <!-- Filters Row -->
                <div
                    class="flex flex-wrap lg:flex-nowrap items-center gap-2 flex-1">
                    <!-- Category Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedCategory"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option value="">Category: For Sell</option>
                            <option
                                v-for="category in categories"
                                :key="category"
                                :value="category">
                                {{ category }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Price Range Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedPriceRange"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option value="">Price Range: $250,000</option>
                            <option
                                v-for="range in priceRanges"
                                :key="range"
                                :value="range">
                                {{ range }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Beds & Baths Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedBedsAndBaths"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option value="">Price Range: Beds & Baths</option>
                            <option
                                v-for="option in bedsAndBathsOptions"
                                :key="option"
                                :value="option">
                                {{ option }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Home Type Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedHomeType"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option value="">Home Type: Home Type</option>
                            <option
                                v-for="type in homeTypes"
                                :key="type"
                                :value="type">
                                {{ type }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Others Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[120px]">
                        <select
                            v-model="selectedOthers"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option value="">Others: More</option>
                            <option
                                v-for="option in othersOptions"
                                :key="option"
                                :value="option">
                                {{ option }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <!-- Search Bar with Address -->
                <div class="flex items-center gap-2 lg:min-w-[350px]">
                    <div class="relative flex-1">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="123 Aloha Lane, Honolulu, HI 96818"
                            class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            @keyup.enter="handleSearch" />
                        <button
                            v-if="searchQuery"
                            @click="clearSearch"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Icon
                                name="lucide:x"
                                class="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        @click="saveSearch"
                        class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                        Save Search
                    </button>
                </div>
            </div>
        </div>

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

        <!-- List View: 2-column grid + Map -->
        <div
            v-if="viewMode === 'Map View'"
            class="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
            <!-- Property Listings Grid -->
            <div class="lg:col-span-8">
                <!-- Properties Grid - 2 columns on desktop, 1 on mobile -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div
                        v-for="property in properties"
                        :key="property.id"
                        class="property-card bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100"
                        @click="navigateToProperty(property.id)">
                        <!-- Property Image -->
                        <div class="relative h-48 lg:h-52">
                            <img
                                :src="property.image"
                                :alt="property.title"
                                class="w-full h-full object-cover" />

                            <!-- Favorite Button -->
                            <button
                                @click.stop="toggleFavorite(property.id)"
                                class="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm">
                                <Icon
                                    name="lucide:heart"
                                    :class="[
                                        'w-4 h-4 transition-colors',
                                        property.isFavorite
                                            ? 'text-red-500 fill-current'
                                            : 'text-gray-600',
                                    ]" />
                            </button>
                        </div>

                        <!-- Property Details -->
                        <div class="p-4 lg:p-5">
                            <!-- Title and Price -->
                            <div class="mb-3">
                                <h3
                                    class="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                    {{ property.title }}
                                </h3>
                                <p
                                    class="text-sm text-gray-600 mb-2 line-clamp-1">
                                    {{ property.address }}
                                </p>
                                <div class="text-xl font-bold text-gray-900">
                                    {{ formatPrice(property.price) }}
                                </div>
                            </div>

                            <!-- Property Stats -->
                            <div
                                class="flex items-center justify-between text-sm text-gray-600">
                                <div class="flex items-center gap-1">
                                    <Icon
                                        name="lucide:bed"
                                        class="w-4 h-4" />
                                    <span>{{ property.beds }} Beds</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <Icon
                                        name="lucide:bath"
                                        class="w-4 h-4" />
                                    <span>{{ property.baths }} Baths</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <Icon
                                        name="lucide:maximize-2"
                                        class="w-4 h-4" />
                                    <span>{{ property.sqft }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Map Section -->
            <div class="lg:col-span-4">
                <div
                    class="bg-white rounded-xl overflow-hidden h-96 lg:h-[600px] lg:sticky lg:top-6">
                    <!-- Interactive Map -->
                    <div class="w-full h-full bg-gray-100 relative">
                        <!-- Mock Map with Property Markers matching Figma design -->
                        <div
                            class="relative w-full h-full bg-gradient-to-br from-green-50 via-blue-50 to-green-100 overflow-hidden">
                            <!-- Map Grid Background -->
                            <div class="absolute inset-0 opacity-10">
                                <div
                                    class="grid grid-cols-12 grid-rows-12 w-full h-full">
                                    <div
                                        v-for="n in 144"
                                        :key="n"
                                        class="border border-gray-300/50"></div>
                                </div>
                            </div>

                            <!-- Highway Lines -->
                            <svg
                                class="absolute inset-0 w-full h-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none">
                                <!-- Horizontal highways -->
                                <line
                                    x1="0"
                                    y1="25"
                                    x2="100"
                                    y2="25"
                                    stroke="#e5e7eb"
                                    stroke-width="0.5"
                                    opacity="0.6" />
                                <line
                                    x1="0"
                                    y1="45"
                                    x2="100"
                                    y2="45"
                                    stroke="#e5e7eb"
                                    stroke-width="0.3"
                                    opacity="0.4" />
                                <line
                                    x1="0"
                                    y1="65"
                                    x2="100"
                                    y2="65"
                                    stroke="#e5e7eb"
                                    stroke-width="0.5"
                                    opacity="0.6" />

                                <!-- Vertical highways -->
                                <line
                                    x1="30"
                                    y1="0"
                                    x2="30"
                                    y2="100"
                                    stroke="#e5e7eb"
                                    stroke-width="0.4"
                                    opacity="0.5" />
                                <line
                                    x1="60"
                                    y1="0"
                                    x2="60"
                                    y2="100"
                                    stroke="#e5e7eb"
                                    stroke-width="0.3"
                                    opacity="0.4" />
                                <line
                                    x1="80"
                                    y1="0"
                                    x2="80"
                                    y2="100"
                                    stroke="#e5e7eb"
                                    stroke-width="0.4"
                                    opacity="0.5" />
                            </svg>

                            <!-- Property Price Markers -->
                            <div
                                class="absolute top-[20%] left-[25%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="property-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    1.30k
                                </div>
                            </div>

                            <div
                                class="absolute top-[35%] left-[45%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="property-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    1.56k
                                </div>
                            </div>

                            <div
                                class="absolute top-[55%] left-[65%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="property-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    1.75k
                                </div>
                            </div>

                            <div
                                class="absolute top-[70%] left-[35%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="property-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    900k
                                </div>
                            </div>

                            <div
                                class="absolute top-[40%] left-[75%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="property-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    2.1m
                                </div>
                            </div>

                            <div
                                class="absolute top-[25%] left-[70%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="property-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    1.24k
                                </div>
                            </div>

                            <div
                                class="absolute top-[60%] left-[20%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="property-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    1.50k
                                </div>
                            </div>

                            <!-- Location Labels matching Figma -->
                            <div
                                class="absolute top-4 left-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Newton
                            </div>

                            <div
                                class="absolute top-6 right-8 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Wichita
                            </div>

                            <div
                                class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                LAHOMA
                            </div>

                            <div
                                class="absolute bottom-8 left-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Ponca City
                            </div>

                            <div
                                class="absolute top-1/2 right-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Bartlesville
                            </div>

                            <!-- Map Controls -->
                            <div class="absolute bottom-4 right-4">
                                <div
                                    class="bg-white rounded-lg shadow-md p-2 flex flex-col gap-2">
                                    <button
                                        class="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <Icon
                                            name="lucide:plus"
                                            class="w-4 h-4 text-gray-600" />
                                    </button>
                                    <div class="w-full h-px bg-gray-200"></div>
                                    <button
                                        class="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <Icon
                                            name="lucide:minus"
                                            class="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Web View: Full-width property grid (no map) -->
        <div
            v-else="viewMode === 'List View'"
            class="space-y-6">
            <!-- Properties Grid - 3 columns on desktop, 2 on tablet, 1 on mobile -->
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                <div
                    v-for="property in properties"
                    :key="property.id"
                    class="property-card bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100"
                    @click="navigateToProperty(property.id)">
                    <!-- Property Image -->
                    <div class="relative h-48 lg:h-52">
                        <img
                            :src="property.image"
                            :alt="property.title"
                            class="w-full h-full object-cover" />

                        <!-- Favorite Button -->
                        <button
                            @click.stop="toggleFavorite(property.id)"
                            class="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm">
                            <Icon
                                name="lucide:heart"
                                :class="[
                                    'w-4 h-4 transition-colors',
                                    property.isFavorite
                                        ? 'text-red-500 fill-current'
                                        : 'text-gray-600',
                                ]" />
                        </button>
                    </div>

                    <!-- Property Details -->
                    <div class="p-4 lg:p-5">
                        <!-- Title and Price -->
                        <div class="mb-3">
                            <h3
                                class="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                {{ property.title }}
                            </h3>
                            <p class="text-sm text-gray-600 mb-2 line-clamp-1">
                                {{ property.address }}
                            </p>
                            <div class="text-xl font-bold text-gray-900">
                                {{ formatPrice(property.price) }}
                            </div>
                        </div>

                        <!-- Property Stats -->
                        <div
                            class="flex items-center justify-between text-sm text-gray-600">
                            <div class="flex items-center gap-1">
                                <Icon
                                    name="lucide:bed"
                                    class="w-4 h-4" />
                                <span>{{ property.beds }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <Icon
                                    name="lucide:bath"
                                    class="w-4 h-4" />
                                <span>{{ property.baths }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <Icon
                                    name="lucide:maximize-2"
                                    class="w-4 h-4" />
                                <span>{{ property.sqft }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

       
    </div>
</template>

<style scoped>
    /* Hide default select arrow for custom styling */
    select {
        background-image: none;
    }

    /* Custom scrollbar for mobile */
    @media (max-width: 768px) {
        .overflow-x-auto::-webkit-scrollbar {
            display: none;
        }
        .overflow-x-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    }

    /* Line clamp utilities */
    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Property card hover effects */
    .property-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .property-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    /* Map marker animations */
    @keyframes markerPulse {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
        }
        70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }
    }

    .property-marker {
        animation: markerPulse 2s infinite;
    }
</style>
