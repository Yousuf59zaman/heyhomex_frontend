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
        <div class="flex flex-col gap-4 lg:hidden">
            <div class="flex items-center gap-4">
                <div class="relative flex-1 h-[44px]">
                    <Icon
                        name="lucide:search"
                        class="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-[#6C6C6C]" />
                    <input
                        type="text"
                        :placeholder="placeholder"
                        v-model="searchQuery"
                        @input="handleSearch"
                        class="w-full h-full pl-11 pr-4 border border-[#D4D4D4] rounded-lg text-sm text-[#6C6C6C] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <button
                    @click="$emit('toggle-filters')"
                    class="p-3 border border-[#D4D4D4] rounded-lg bg-white hover:bg-gray-50 transition-colors shrink-0">
                    <Icon
                        name="lucide:sliders-horizontal"
                        class="size-[18px] text-[#121A22]" />
                </button>
            </div>

            <button
                @click="$emit('map-search')"
                class="w-full bg-[#121A22] text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-[#1a2530] transition-colors capitalize">
                Map Search
            </button>
        </div>

        <div class="hidden lg:flex lg:items-center lg:justify-between">
            <div class="flex items-center gap-3">
                <div class="relative w-[400px]">
                    <Icon
                        name="lucide:search"
                        class="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-[#6C6C6C]" />
                    <input
                        type="text"
                        :placeholder="placeholder"
                        v-model="searchQuery"
                        @input="handleSearch"
                        class="w-full pl-11 pr-4 py-3 border border-[#D4D4D4] rounded-lg text-sm text-[#6C6C6C] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button
                    @click="$emit('map-search')"
                    class="bg-[#121A22] text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-[#1a2530] transition-colors whitespace-nowrap capitalize">
                    Map Search
                </button>
            </div>

            <div class="flex items-center gap-3">
                <select
                    v-model="selectedHomeType"
                    @change="handleHomeTypeChange"
                    class="border border-[#D4D4D4] rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[#121A22] font-medium appearance-none bg-no-repeat bg-right pr-10"
                    style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2718%27 height=%2718%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23121A22%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M6 9l6 6 6-6%27/%3E%3C/svg%3E'); background-position: right 12px center;">
                    <option value="">Property Type: All</option>
                    <option value="studio">Studio</option>
                    <option value="one_bed">1 Bed</option>
                    <option value="two_bed">2 Bed</option>
                    <option value="three_plus_bed">3+ Bed</option>
                </select>

                <select
                    v-model="selectedPriceRange"
                    @change="handlePriceRangeChange"
                    class="border border-[#D4D4D4] rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[#121A22] font-medium appearance-none bg-no-repeat bg-right pr-10"
                    style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2718%27 height=%2718%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23121A22%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M6 9l6 6 6-6%27/%3E%3C/svg%3E'); background-position: right 12px center;">
                    <option value="">Price Range: All</option>
                    <option value="250000">Under $250,000</option>
                    <option value="500000">Under $500,000</option>
                    <option value="750000">Under $750,000</option>
                    <option value="1000000_plus">$1,000,000+</option>
                </select>
            </div>
        </div>
    </div>
</template>
