<script setup>
    // Props
    const props = defineProps({
        placeholder: {
            type: String,
            default: 'Search Here...',
        },
        modelValue: {
            type: String,
            default: '',
        },
        propertyType: {
            type: String,
            default: '',
        },
        priceRange: {
            type: String,
            default: '',
        },
    });

    // Emits
    const emit = defineEmits([
        'update:modelValue',
        'update:propertyType',
        'update:priceRange',
        'search',
        'map-search',
        'toggle-filters',
    ]);

    // Local reactive state
    const searchQuery = ref(props.modelValue);
    const selectedPropertyType = ref(props.propertyType);
    const selectedPriceRange = ref(props.priceRange);

    // Watch for prop changes
    watch(
        () => props.modelValue,
        (newValue) => {
            searchQuery.value = newValue;
        }
    );

    watch(
        () => props.propertyType,
        (newValue) => {
            selectedPropertyType.value = newValue;
        }
    );

    watch(
        () => props.priceRange,
        (newValue) => {
            selectedPriceRange.value = newValue;
        }
    );

    // Methods
    const handleSearch = () => {
        emit('update:modelValue', searchQuery.value);
        emit('search', searchQuery.value);
    };

    const handlePropertyTypeChange = () => {
        emit('update:propertyType', selectedPropertyType.value);
    };

    const handlePriceRangeChange = () => {
        emit('update:priceRange', selectedPriceRange.value);
    };
</script>

<template>
    <div>
        <!-- Mobile Layout -->
        <div class="block lg:hidden">
            <!-- Search Input Row -->
            <div class="flex items-center gap-3 mb-3">
                <div class="relative flex-1">
                    <Icon
                        name="lucide:search"
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        :placeholder="placeholder"
                        v-model="searchQuery"
                        @input="handleSearch"
                        class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <!-- Filter Button -->
                <button
                    @click="$emit('toggle-filters')"
                    class="px-2 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <Icon
                        name="lucide:sliders-horizontal"
                        class="h-4 text-gray-600" />
                </button>
            </div>

            <!-- Map Search Button Row -->
            <div class="w-full">
                <button
                    @click="$emit('map-search')"
                    class="w-full bg-[#121A22] text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Map Search
                </button>
            </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden lg:flex lg:items-center lg:justify-between gap-4">
            <!-- Left side - Search Input -->
            <div class="flex items-center gap-3 flex-1">
                <div class="relative flex-1 max-w-sm">
                    <Icon
                        name="lucide:search"
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        :placeholder="placeholder"
                        v-model="searchQuery"
                        @input="handleSearch"
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button
                    @click="$emit('map-search')"
                    class="bg-[#121A22] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                    Map Search
                </button>
            </div>

            <!-- Right side - Filters -->
            <div class="flex items-center gap-3">
                <!-- Property Type Filter -->
                <select
                    v-model="selectedPropertyType"
                    @change="handlePropertyTypeChange"
                    class="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Property Type: All</option>
                    <option value="single-family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                </select>

                <!-- Price Range Filter -->
                <select
                    v-model="selectedPriceRange"
                    @change="handlePriceRangeChange"
                    class="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Price Range: All</option>
                    <option value="under-500k">Under $500K</option>
                    <option value="500k-1m">$500K - $1M</option>
                    <option value="over-1m">Over $1M</option>
                </select>
            </div>
        </div>
    </div>
</template>
