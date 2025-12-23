<script setup>
    const emit = defineEmits(["see-all", "property-click", "favorite-toggle"])

    const props = defineProps({
        title: {
            type: String,
            default: "Homes in Your Favorite Areas!",
        },
        properties: {
            type: Array,
            default: () => [],
        },
    })
    const handlePropertyClick = (property) => {
        emit("property-click", property)
    }

    const handleFavoriteToggle = (property) => {
        emit("favorite-toggle", property)
    }
</script>

<template>
    <div class="rounded-lg">
        <div class="flex items-end justify-between mb-4">
            <h2
                class="text-[20px] sm:text-[24px] leading-[32px] font-semibold text-[#121A22]">
                {{ title }}
            </h2>
            <button
                @click="$emit('see-all')"
                class="hidden sm:inline-flex text-[16px] leading-[24px] text-[#2C3E50] font-medium hover:text-[#1F2E3D]">
                See all
            </button>
        </div>
        <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CommonCitizenPropertyCard
                v-for="property in properties"
                :key="property.id"
                :property="property"
                @click="handlePropertyClick"
                @favorite="handleFavoriteToggle" />
        </div>
        <button
            @click="$emit('see-all')"
            class="mt-4 w-full text-center text-[16px] leading-[24px] text-[#2C3E50] font-semibold sm:hidden">
            See all
        </button>
    </div>
</template>
