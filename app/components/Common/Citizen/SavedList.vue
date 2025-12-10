<script setup>
    const props = defineProps({
        title: {
            type: String,
            default: "Saved List",
        },
        showSellAll: {
            type: Boolean,
            default: true,
        },
        homeItems: {
            type: Array,
            default: () => [],
        },
        videoItems: {
            type: Array,
            default: () => [],
        },
        initialTab: {
            type: String,
            default: "Home",
        },
    })

    const emit = defineEmits([
        "tab-change",
        "sell-all",
        "remove-item",
        "item-click",
    ])

    const tabs = [
        {label: "Home", value: "Home"},
        {label: "Videos", value: "Videos"},
    ]

    const activeTab = ref(props.initialTab)

    const currentItems = computed(() => {
        return activeTab.value === "Home" ? props.homeItems : props.videoItems
    })

    const handleTabChange = (tab) => {
        activeTab.value = tab
        emit("tab-change", tab)
    }

    const handleRemoveItem = (itemId) => {
        emit("remove-item", {itemId, type: activeTab.value.toLowerCase()})
    }

    const handleItemClick = (item) => {
        emit("item-click", {item, type: activeTab.value.toLowerCase()})
    }

    watch(
        () => props.initialTab,
        (newTab) => {
            activeTab.value = newTab
        }
    )
</script>

<template>
    <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-4 lg:mb-6">
            <h2 class="text-base lg:text-lg font-semibold text-gray-900">
                {{ title }}
            </h2>
            <div class="flex items-center space-x-2">
                <span
                    v-if="showSellAll"
                    class="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                    @click="$emit('sell-all')">
                    Sell All
                </span>
            </div>
        </div>

        <div class="flex bg-gray-100 rounded-lg mb-4">
            <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="handleTabChange(tab.value)"
                :class="[
                    'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all',
                    activeTab === tab.value
                        ? 'bg-[#2C3E50] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900',
                ]">
                {{ tab.label }}
            </button>
        </div>

        <div class="space-y-3">
            <template v-if="activeTab === 'Home'">
                <CommonCitizenSavedListItem
                    v-for="item in homeItems"
                    :key="item.id"
                    :item="item"
                    type="home"
                    @remove="handleRemoveItem"
                    @click="handleItemClick" />
            </template>

            <template v-else-if="activeTab === 'Videos'">
                <CommonCitizenSavedListItem
                    v-for="item in videoItems"
                    :key="item.id"
                    :item="item"
                    type="video"
                    @remove="handleRemoveItem"
                    @click="handleItemClick" />
            </template>

            <div
                v-if="currentItems.length === 0"
                class="text-center py-8 text-gray-500">
                <Icon
                    :name="
                        activeTab === 'Home' ? 'lucide:home' : 'lucide:video'
                    "
                    class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">
                    No {{ activeTab.toLowerCase() }} saved yet
                </p>
            </div>
        </div>
    </div>
</template>
