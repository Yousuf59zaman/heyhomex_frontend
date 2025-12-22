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
    <div class="bg-white border border-[#F4F4F6] rounded-[12px] p-4 flex flex-col gap-8">
        <div class="flex flex-col gap-5">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <h2 class="text-[20px] leading-[28px] font-semibold text-[#121A22]">
                    {{ title }}
                </h2>
                <!-- Sell all - visible on desktop only in header -->
                <span
                    v-if="showSellAll"
                    class="hidden lg:inline-flex text-[14px] leading-[20px] font-medium text-[#242424] cursor-pointer hover:text-[#121A22]"
                    @click="$emit('sell-all')">
                    Sell all
                </span>
            </div>

            <!-- Tabs -->
            <div class="flex gap-3 bg-[#F0F1F3] rounded-[8px] p-[6px]">
                <button
                    v-for="tab in tabs"
                    :key="tab.value"
                    @click="handleTabChange(tab.value)"
                    :class="[
                        'flex-1 py-[6px] px-5 text-[14px] leading-[20px] rounded-[8px] transition-all',
                        activeTab === tab.value
                            ? 'bg-[#2C3E50] text-white font-semibold'
                            : 'text-[#121A22] font-medium',
                    ]">
                    {{ tab.label }}
                </button>
            </div>

            <!-- List Items -->
            <div class="space-y-4">
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

        <!-- Sell all - visible on mobile only at bottom center -->
        <span
            v-if="showSellAll"
            class="lg:hidden text-[14px] leading-[20px] font-medium text-[#242424] cursor-pointer hover:text-[#121A22] text-center"
            @click="$emit('sell-all')">
            Sell all
        </span>
    </div>
</template>
