<script setup>
    const props = defineProps({
        placeholder: {
            type: String,
            default: "123 Aloha Lane, Honolulu, HI 96818",
        },
        variant: {
            type: String,
            default: "default",
        },
        modelValue: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            default: "",
        },
        priceRange: {
            type: String,
            default: "",
        },
        homeType: {
            type: String,
            default: "",
        },
        others: {
            type: String,
            default: "More",
        },
        bedsAndBaths: {
            type: String,
            default: "",
        },
        hideSearch: {
            type: Boolean,
            default: false,
        },
    })

    const emit = defineEmits([
        "update:modelValue",
        "update:category",
        "update:priceRange",
        "update:homeType",
        "update:others",
        "update:bedsAndBaths",
        "search",
        "save-search",
        "filter-change",
    ])

    const categories = [
        {label: "For Sale", value: "for_sale"},
        {label: "For Rent", value: "for_rent"},
        {label: "Sold", value: "sold"},
    ]
    const priceRanges = [
        {label: "Under $250,000", value: "250000"},
        {label: "Under $500,000", value: "500000"},
        {label: "Under $750,000", value: "750000"},
        {label: "$1,000,000+", value: "1000000_plus"},
    ]
    const homeTypes = [
        {label: "Studio", value: "studio"},
        {label: "1 Bed", value: "one_bed"},
        {label: "2 Bed", value: "two_bed"},
        {label: "3+ Bed", value: "three_plus_bed"},
    ]
    const othersOptions = [
        "More",
        "New Construction",
        "Open House",
        "Recently Sold",
    ]
    const bedsAndBathsOptions = ["Any", "1+", "2+", "3+", "4+", "5+"]

    const searchQuery = ref(props.modelValue)
    const selectedCategory = ref(props.category)
    const selectedPriceRange = ref(props.priceRange)
    const selectedHomeType = ref(props.homeType)
    const selectedOthers = ref(props.others)
    const selectedBedsAndBaths = ref(props.bedsAndBaths)

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
        () => props.priceRange,
        (newValue) => {
            selectedPriceRange.value = newValue
        }
    )

    const handleSearchChange = () => {
        emit("update:modelValue", searchQuery.value)
    }

    const handleSearch = () => {
        emit("search", searchQuery.value)
    }

    const handleSaveSearch = () => {
        emit("save-search")
    }

    const clearSearch = () => {
        searchQuery.value = ""
        emit("update:modelValue", "")
    }

    const handleFilterChange = () => {
        emit("update:category", selectedCategory.value)
        emit("update:priceRange", selectedPriceRange.value)
        emit("update:homeType", selectedHomeType.value)
        emit("update:others", selectedOthers.value)
        emit("update:bedsAndBaths", selectedBedsAndBaths.value)
        emit("filter-change", {
            category: selectedCategory.value,
            priceRange: selectedPriceRange.value,
            homeType: selectedHomeType.value,
            others: selectedOthers.value,
            bedsAndBaths: selectedBedsAndBaths.value,
        })
    }

    const categoryDisplayValue = computed(() => {
        const option = categories.find((category) => category.value === selectedCategory.value)
        return option ? option.label : "Category"
    })

    const priceRangeDisplayValue = computed(() => {
        const option = priceRanges.find((range) => range.value === selectedPriceRange.value)
        return option ? option.label : "Price Range"
    })

    const bedsAndBathsDisplayValue = computed(() => {
        return selectedBedsAndBaths.value || "Beds & Baths"
    })

    const homeTypeDisplayValue = computed(() => {
        const option = homeTypes.find((type) => type.value === selectedHomeType.value)
        return option ? option.label : "Home Type"
    })

    const othersDisplayValue = computed(() => {
        return selectedOthers.value || "More"
    })

    const isFigma = computed(() => props.variant === "figma")
</script>

<template>
    <div v-if="isFigma" class="space-y-4 lg:space-y-3">
        <div v-if="!hideSearch" class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
                v-if="$slots.tabs"
                class="w-full lg:w-auto">
                <slot name="tabs" />
            </div>

            <div class="flex flex-col sm:flex-row items-stretch gap-3 lg:gap-6 w-full lg:w-auto">
                <div class="flex items-center gap-2 w-full">
                    <div class="relative flex-1 lg:flex-none lg:w-[440px]">
                        <Icon
                            name="lucide:search"
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6C6C6C]" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            :placeholder="placeholder"
                            @input="handleSearchChange"
                            @keyup.enter="handleSearch"
                            class="w-full h-[44px] pl-10 pr-9 border border-[#D9D9D9] rounded-[8px] text-[14px] leading-[20px] text-[#121A22] placeholder:text-[#6C6C6C] focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20 focus:border-[#2C3E50]/30" />
                        <button
                            v-if="searchQuery"
                            @click="clearSearch"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6C6C] hover:text-[#283849]">
                            <Icon
                                name="lucide:x"
                                class="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    <button
                        type="button"
                        class="md:hidden w-[44px] h-[44px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center justify-center text-[#121A22]">
                        <Icon
                            name="lucide:sliders-horizontal"
                            class="w-4 h-4" />
                    </button>
                </div>
                <button
                    @click="handleSaveSearch"
                    class="w-full sm:w-auto h-[44px] px-4 bg-[#18222C] text-white rounded-[8px] text-[14px] leading-[20px] font-semibold hover:bg-[#1f2b36] transition-colors whitespace-nowrap">
                    Save Search
                </button>
            </div>
        </div>

        <div class="hidden md:flex flex-wrap items-center gap-2">
            <div class="relative w-full md:w-auto md:min-w-[170px]">
                <div
                    class="relative flex items-center gap-2 h-[44px] px-4 pr-10 border border-[#D4D4D4] rounded-[8px] bg-white focus-within:ring-2 focus-within:ring-[#2C3E50]/20 focus-within:border-[#2C3E50]/30">
                    <select
                        v-model="selectedCategory"
                        @change="handleFilterChange"
                        class="absolute inset-0 w-full h-full cursor-pointer appearance-none opacity-0">
                        <option
                            value=""
                            disabled
                            selected>
                            Category
                        </option>
                        <option
                            v-for="category in categories"
                            :key="category.value"
                            :value="category.value">
                            {{ category.label }}
                        </option>
                    </select>
                    <div class="flex items-center gap-2 pointer-events-none whitespace-nowrap">
                        <span class="font-['sf-pro-Regular'] text-[16px] leading-[20px] font-normal text-[#283849]">
                            Category:
                        </span>
                        <span class="font-['sf-pro-Medium'] text-[16px] leading-[20px] font-[510] text-[#121A22]">
                            {{ categoryDisplayValue }}
                        </span>
                    </div>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6C6C6C] pointer-events-none" />
                </div>
            </div>

            <div class="relative w-full md:w-auto md:min-w-[170px]">
                <div
                    class="relative flex items-center gap-2 h-[44px] px-4 pr-10 border border-[#D4D4D4] rounded-[8px] bg-white focus-within:ring-2 focus-within:ring-[#2C3E50]/20 focus-within:border-[#2C3E50]/30">
                    <select
                        v-model="selectedPriceRange"
                        @change="handleFilterChange"
                        class="absolute inset-0 w-full h-full cursor-pointer appearance-none opacity-0">
                        <option
                            value=""
                            disabled
                            selected>
                            Price Range
                        </option>
                        <option
                            v-for="range in priceRanges"
                            :key="range.value"
                            :value="range.value">
                            {{ range.label }}
                        </option>
                    </select>
                    <div class="flex items-center gap-2 pointer-events-none whitespace-nowrap">
                        <span class="font-['sf-pro-Regular'] text-[16px] leading-[20px] font-normal text-[#283849]">
                            Price Range:
                        </span>
                        <span class="font-['sf-pro-Medium'] text-[16px] leading-[20px] font-[510] text-[#121A22]">
                            {{ priceRangeDisplayValue }}
                        </span>
                    </div>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6C6C6C] pointer-events-none" />
                </div>
            </div>

            <div class="relative w-full md:w-auto md:min-w-[210px]">
                <div
                    class="relative flex items-center gap-2 h-[44px] px-4 pr-10 border border-[#D4D4D4] rounded-[8px] bg-white focus-within:ring-2 focus-within:ring-[#2C3E50]/20 focus-within:border-[#2C3E50]/30">
                    <select
                        v-model="selectedBedsAndBaths"
                        @change="handleFilterChange"
                        class="absolute inset-0 w-full h-full cursor-pointer appearance-none opacity-0">
                        <option value="">Beds & Baths</option>
                        <option
                            v-for="option in bedsAndBathsOptions"
                            :key="option"
                            :value="option">
                            {{ option }}
                        </option>
                    </select>
                    <div class="flex items-center gap-2 pointer-events-none whitespace-nowrap">
                        <span class="font-['sf-pro-Regular'] text-[16px] leading-[20px] font-normal text-[#283849]">
                            Beds & Baths:
                        </span>
                        <span class="font-['sf-pro-Medium'] text-[16px] leading-[20px] font-[510] text-[#121A22]">
                            {{ bedsAndBathsDisplayValue }}
                        </span>
                    </div>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6C6C6C] pointer-events-none" />
                </div>
            </div>

            <div class="relative w-full md:w-auto md:min-w-[170px]">
                <div
                    class="relative flex items-center gap-2 h-[44px] px-4 pr-10 border border-[#D4D4D4] rounded-[8px] bg-white focus-within:ring-2 focus-within:ring-[#2C3E50]/20 focus-within:border-[#2C3E50]/30">
                    <select
                        v-model="selectedHomeType"
                        @change="handleFilterChange"
                        class="absolute inset-0 w-full h-full cursor-pointer appearance-none opacity-0">
                        <option
                            value=""
                            disabled
                            selected>
                            Home Type
                        </option>
                        <option
                            v-for="type in homeTypes"
                            :key="type.value"
                            :value="type.value">
                            {{ type.label }}
                        </option>
                    </select>
                    <div class="flex items-center gap-2 pointer-events-none whitespace-nowrap">
                        <span class="font-['sf-pro-Regular'] text-[16px] leading-[20px] font-normal text-[#283849]">
                            Home Type:
                        </span>
                        <span class="font-['sf-pro-Medium'] text-[16px] leading-[20px] font-[510] text-[#121A22]">
                            {{ homeTypeDisplayValue }}
                        </span>
                    </div>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6C6C6C] pointer-events-none" />
                </div>
            </div>

            <div class="relative w-full md:w-auto md:min-w-[150px]">
                <div
                    class="relative flex items-center gap-2 h-[44px] px-4 pr-10 border border-[#D4D4D4] rounded-[8px] bg-white focus-within:ring-2 focus-within:ring-[#2C3E50]/20 focus-within:border-[#2C3E50]/30">
                    <select
                        v-model="selectedOthers"
                        @change="handleFilterChange"
                        class="absolute inset-0 w-full h-full cursor-pointer appearance-none opacity-0">
                        <option
                            v-for="option in othersOptions"
                            :key="option"
                            :value="option">
                            {{ option }}
                        </option>
                    </select>
                    <div class="flex items-center gap-2 pointer-events-none whitespace-nowrap">
                        <span class="font-['sf-pro-Regular'] text-[16px] leading-[20px] font-normal text-[#283849]">
                            Others:
                        </span>
                        <span class="font-['sf-pro-Medium'] text-[16px] leading-[20px] font-[510] text-[#121A22]">
                            {{ othersDisplayValue }}
                        </span>
                    </div>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6C6C6C] pointer-events-none" />
                </div>
            </div>
        </div>
    </div>

    <div v-else class="bg-white rounded-lg p-3 lg:p-4">
        <div class="flex flex-col lg:flex-row lg:items-start gap-3">
            <div class="flex flex-wrap items-center gap-2 flex-1">
                <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                    <select
                        v-model="selectedCategory"
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                        <option
                            value=""
                            disabled
                            selected>
                            Category: All
                        </option>
                        <option
                            v-for="category in categories"
                            :key="category.value"
                            :value="category.value">
                            {{ category.label }}
                        </option>
                    </select>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                    <select
                        v-model="selectedPriceRange"
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                        <option
                            value=""
                            disabled
                            selected>
                            Price Range: All
                        </option>
                        <option
                            v-for="range in priceRanges"
                            :key="range.value"
                            :value="range.value">
                            {{ range.label }}
                        </option>
                    </select>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

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

                <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                    <select
                        v-model="selectedHomeType"
                        @change="handleFilterChange"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                        <option
                            value=""
                            disabled
                            selected>
                            Home Type: All
                        </option>
                        <option
                            v-for="type in homeTypes"
                            :key="type.value"
                            :value="type.value">
                            {{ type.label }}
                        </option>
                    </select>
                    <Icon
                        name="lucide:chevron-down"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

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

<style scoped>
    select {
        background-image: none;
    }
</style>
