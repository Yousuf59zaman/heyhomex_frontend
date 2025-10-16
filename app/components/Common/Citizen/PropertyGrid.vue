<script setup>
    // Props
    const props = defineProps({
        title: {
            type: String,
            default: 'Homes in Your Favorite Areas!',
        },
        properties: {
            type: Array,
            default: () => [],
        },
    });

    // Emits
    const emit = defineEmits(['see-all', 'property-click', 'favorite-toggle']);

    // Methods
    const handlePropertyClick = (property) => {
        emit('property-click', property);
    };

    const handleFavoriteToggle = (property) => {
        emit('favorite-toggle', property);
    };
</script>

<template>
    <div class="rounded-lg shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <h2
                class="text-base sm:text-lg tracking-wider font-semibold text-gray-900">
                {{ title }}
            </h2>
            <button
                @click="$emit('see-all')"
                class="text-sm text-[#2C3E50] hover:text-blue-700 font-medium">
                See all
            </button>
        </div>

        <!-- Horizontal Property Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CommonCitizenPropertyCard
                v-for="property in properties"
                :key="property.id"
                :property="property"
                @click="handlePropertyClick"
                @favorite="handleFavoriteToggle" />
        </div>
    </div>
</template>
