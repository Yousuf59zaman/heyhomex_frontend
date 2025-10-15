<template>
    <div class="bg-white rounded-lg p-3 lg:p-4">
        <div class="flex flex-col lg:flex-row gap-3">
            <!-- Filters Row -->
            <div
                class="flex flex-wrap lg:flex-nowrap items-center gap-2 flex-1">
                <!-- Category Filter -->
                <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                    <select
                        v-model="selectedCategory"
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
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
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
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
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                        <option value="">Beds & Baths</option>
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
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
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
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
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

            <!-- Search Bar -->
            <div class="flex items-center gap-2 lg:min-w-[350px]">
                <div class="relative flex-1">
                    <input
                        v-model="searchQuery"
                        type="text"
                        :placeholder="placeholder"
                        @input="handleSearchChange"
                        @keyup.enter="handleSearch"
                        class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
                    @click="handleSaveSearch"
                    class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                    Save Search
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    // Props
    const props = defineProps({
        placeholder: {
            type: String,
            default: '123 Aloha Lane, Honolulu, HI 96818',
        },
        modelValue: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            default: 'For Sell',
        },
        priceRange: {
            type: String,
            default: '$250,000',
        },
        homeType: {
            type: String,
            default: 'Beds & Baths',
        },
        others: {
            type: String,
            default: 'More',
        },
        bedsAndBaths: {
            type: String,
            default: '',
        },
    });

    // Emits
    const emit = defineEmits([
        'update:modelValue',
        'update:category',
        'update:priceRange',
        'update:homeType',
        'update:others',
        'update:bedsAndBaths',
        'search',
        'save-search',
        'filter-change',
    ]);

    // Static filter options
    const categories = ['For Sell', 'For Rent', 'Sold'];
    const priceRanges = ['$250,000', '$500,000', '$750,000', '$1,000,000+'];
    const homeTypes = ['Beds & Baths', 'Studio', '1 Bed', '2 Beds', '3+ Beds'];
    const othersOptions = [
        'More',
        'New Construction',
        'Open House',
        'Recently Sold',
    ];
    const bedsAndBathsOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];

    // Reactive state
    const searchQuery = ref(props.modelValue);
    const selectedCategory = ref(props.category);
    const selectedPriceRange = ref(props.priceRange);
    const selectedHomeType = ref(props.homeType);
    const selectedOthers = ref(props.others);
    const selectedBedsAndBaths = ref(props.bedsAndBaths);

    // Watch for prop changes
    watch(
        () => props.modelValue,
        (newValue) => {
            searchQuery.value = newValue;
        }
    );

    watch(
        () => props.category,
        (newValue) => {
            selectedCategory.value = newValue;
        }
    );

    watch(
        () => props.priceRange,
        (newValue) => {
            selectedPriceRange.value = newValue;
        }
    );

    // Methods
    const handleSearchChange = () => {
        emit('update:modelValue', searchQuery.value);
    };

    const handleSearch = () => {
        emit('search', searchQuery.value);
    };

    const handleSaveSearch = () => {
        emit('save-search');
    };

    const clearSearch = () => {
        searchQuery.value = '';
        emit('update:modelValue', '');
    };

    const handleFilterChange = () => {
        emit('update:category', selectedCategory.value);
        emit('update:priceRange', selectedPriceRange.value);
        emit('update:homeType', selectedHomeType.value);
        emit('update:others', selectedOthers.value);
        emit('update:bedsAndBaths', selectedBedsAndBaths.value);
        emit('filter-change', {
            category: selectedCategory.value,
            priceRange: selectedPriceRange.value,
            homeType: selectedHomeType.value,
            others: selectedOthers.value,
            bedsAndBaths: selectedBedsAndBaths.value,
        });
    };
</script>

<style scoped>
    select {
        background-image: none;
    }
</style>
