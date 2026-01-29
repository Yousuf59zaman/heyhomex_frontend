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

    // Dropdown states
    const isPropertyTypeOpen = ref(false)
    const isPriceRangeOpen = ref(false)
    const propertyTypeRef = ref(null)
    const priceRangeRef = ref(null)

    // Dropdown options
    const propertyTypeOptions = [
        {label: "Property Type: All", value: ""},
        {label: "Studio", value: "studio"},
        {label: "1 Bed", value: "one_bed"},
        {label: "2 Bed", value: "two_bed"},
        {label: "3+ Bed", value: "three_plus_bed"},
    ]

    const priceRangeOptions = [
        {label: "Price Range: All", value: ""},
        {label: "Under $250,000", value: "250000"},
        {label: "Under $500,000", value: "500000"},
        {label: "Under $750,000", value: "750000"},
        {label: "$1,000,000+", value: "1000000_plus"},
    ]

    // Computed labels
    const propertyTypeLabel = computed(() => {
        const option = propertyTypeOptions.find((o) => o.value === selectedHomeType.value)
        return option ? option.label : "Property Type: All"
    })

    const priceRangeLabel = computed(() => {
        const option = priceRangeOptions.find((o) => o.value === selectedPriceRange.value)
        return option ? option.label : "Price Range: All"
    })

    // Toggle functions
    const togglePropertyType = () => {
        isPropertyTypeOpen.value = !isPropertyTypeOpen.value
        isPriceRangeOpen.value = false
    }

    const togglePriceRange = () => {
        isPriceRangeOpen.value = !isPriceRangeOpen.value
        isPropertyTypeOpen.value = false
    }

    // Select functions
    const selectPropertyType = (option) => {
        selectedHomeType.value = option.value
        isPropertyTypeOpen.value = false
        emit("update:home-type", option.value)
    }

    const selectPriceRange = (option) => {
        selectedPriceRange.value = option.value
        isPriceRangeOpen.value = false
        emit("update:price-range", option.value)
    }

    // Click outside handler
    const handleClickOutside = (event) => {
        if (propertyTypeRef.value && !propertyTypeRef.value.contains(event.target)) {
            isPropertyTypeOpen.value = false
        }
        if (priceRangeRef.value && !priceRangeRef.value.contains(event.target)) {
            isPriceRangeOpen.value = false
        }
    }

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

    onMounted(() => {
        document.addEventListener("click", handleClickOutside)
    })

    onUnmounted(() => {
        document.removeEventListener("click", handleClickOutside)
    })
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
                <!-- Property Type Dropdown -->
                <!-- <div ref="propertyTypeRef" class="relative">
                    <button
                        type="button"
                        @click="togglePropertyType"
                        class="flex items-center gap-2 border border-[#D4D4D4] rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20">
                        <span class="text-base text-[#121A22] font-medium whitespace-nowrap">
                            {{ propertyTypeLabel }}
                        </span>
                        <svg
                            class="size-[18px] transition-transform duration-200"
                            :class="{'rotate-180': isPropertyTypeOpen}"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2">
                            <path
                                d="M6 9l6 6 6-6"
                                stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    <Transition
                        enter-active-class="transition duration-150 ease-out"
                        enter-from-class="opacity-0 scale-95 -translate-y-1"
                        enter-to-class="opacity-100 scale-100 translate-y-0"
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100 scale-100 translate-y-0"
                        leave-to-class="opacity-0 scale-95 -translate-y-1">
                        <div
                            v-if="isPropertyTypeOpen"
                            class="absolute left-0 top-[calc(100%+4px)] z-50 min-w-full overflow-hidden rounded-[8px] bg-white py-1 shadow-lg ring-1 ring-black/5">
                            <button
                                v-for="option in propertyTypeOptions"
                                :key="option.value"
                                type="button"
                                @click="selectPropertyType(option)"
                                class="flex w-full items-center px-4 py-2 text-[14px] leading-[20px] transition-colors whitespace-nowrap"
                                :class="
                                    selectedHomeType === option.value
                                        ? 'bg-[#2C3E50] text-white font-medium'
                                        : 'text-[#2C3E50] hover:bg-[#F5F6F7]'
                                ">
                                {{ option.label }}
                            </button>
                        </div>
                    </Transition>
                </div> -->

                <!-- Price Range Dropdown -->
                <!-- <div ref="priceRangeRef" class="relative">
                    <button
                        type="button"
                        @click="togglePriceRange"
                        class="flex items-center gap-2 border border-[#D4D4D4] rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20">
                        <span class="text-base text-[#121A22] font-medium whitespace-nowrap">
                            {{ priceRangeLabel }}
                        </span>
                        <svg
                            class="size-[18px] transition-transform duration-200"
                            :class="{'rotate-180': isPriceRangeOpen}"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2">
                            <path
                                d="M6 9l6 6 6-6"
                                stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                    <Transition
                        enter-active-class="transition duration-150 ease-out"
                        enter-from-class="opacity-0 scale-95 -translate-y-1"
                        enter-to-class="opacity-100 scale-100 translate-y-0"
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100 scale-100 translate-y-0"
                        leave-to-class="opacity-0 scale-95 -translate-y-1">
                        <div
                            v-if="isPriceRangeOpen"
                            class="absolute right-0 top-[calc(100%+4px)] z-50 min-w-full overflow-hidden rounded-[8px] bg-white py-1 shadow-lg ring-1 ring-black/5">
                            <button
                                v-for="option in priceRangeOptions"
                                :key="option.value"
                                type="button"
                                @click="selectPriceRange(option)"
                                class="flex w-full items-center px-4 py-2 text-[14px] leading-[20px] transition-colors whitespace-nowrap"
                                :class="
                                    selectedPriceRange === option.value
                                        ? 'bg-[#2C3E50] text-white font-medium'
                                        : 'text-[#2C3E50] hover:bg-[#F5F6F7]'
                                ">
                                {{ option.label }}
                            </button>
                        </div>
                    </Transition>
                </div> -->
            </div>
        </div>
    </div>
</template>
