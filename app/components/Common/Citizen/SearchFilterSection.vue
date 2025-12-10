<script setup>
    const emit = defineEmits([
        "update:modelValue",
        "update:category",
        "update:home-type",
        "update:price-range",
        "search",
        "map-search",
        "toggle-filters",
    ])

    const props = defineProps({
        placeholder: {
            type: String,
            default: "Search Here...",
        },
        modelValue: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            default: "",
        },
        homeType: {
            type: String,
            default: "",
        },
        priceRange: {
            type: String,
            default: "",
        },
    })

    const searchQuery = ref(props.modelValue)
    const selectedCategory = ref(props.category)
    const selectedHomeType = ref(props.homeType)
    const selectedPriceRange = ref(props.priceRange)

    watch(
        () => props.modelValue,
        (newValue) => {
            searchQuery.value = newValue
        }
    )

    watch(
        () => props.category,
        (newValue) => {
            selectedCategory.value = newValue
        }
    )

    watch(
        () => props.homeType,
        (newValue) => {
            selectedHomeType.value = newValue
        }
    )

    watch(
        () => props.priceRange,
        (newValue) => {
            selectedPriceRange.value = newValue
        }
    )

    const handleSearch = () => {
        emit("update:modelValue", searchQuery.value)
        emit("search", searchQuery.value)
    }

    const handleCategoryChange = () => {
        emit("update:category", selectedCategory.value)
    }

    const handleHomeTypeChange = () => {
        emit("update:home-type", selectedHomeType.value)
    }

    const handlePriceRangeChange = () => {
        emit("update:price-range", selectedPriceRange.value)
    }
</script>

<template>
    <div>
        <div class="block lg:hidden">
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

                <button
                    @click="$emit('toggle-filters')"
                    class="px-2 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <Icon
                        name="lucide:sliders-horizontal"
                        class="h-4 text-gray-600" />
                </button>
            </div>

            <div class="w-full">
                <button
                    @click="$emit('map-search')"
                    class="w-full bg-[#121A22] text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Map Search
                </button>
            </div>
        </div>

        <div class="hidden lg:flex lg:items-center lg:justify-between gap-4">
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

            <div class="flex items-center gap-3">
                <select
                    v-model="selectedCategory"
                    @change="handleCategoryChange"
                    class="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option
                        value=""
                        disabled
                        selected>
                        Category: All
                    </option>
                    <option value="for_sale">For Sale</option>
                    <option value="for_rent">For Rent</option>
                    <option value="sold">Sold</option>
                </select>

                <select
                    v-model="selectedHomeType"
                    @change="handleHomeTypeChange"
                    class="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option
                        value=""
                        disabled
                        selected>
                        Home Type: All
                    </option>
                    <option value="studio">Studio</option>
                    <option value="one_bed">1 Bed</option>
                    <option value="two_bed">2 Bed</option>
                    <option value="three_plus_bed">3+ Bed</option>
                </select>

                <select
                    v-model="selectedPriceRange"
                    @change="handlePriceRangeChange"
                    class="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option
                        value=""
                        disabled
                        selected>
                        Price Range: All
                    </option>
                    <option value="250000">Under $250,000</option>
                    <option value="500000">Under $500,000</option>
                    <option value="750000">Under $750,000</option>
                    <option value="1000000_plus">$1,000,000+</option>
                </select>
            </div>
        </div>
    </div>
</template>
