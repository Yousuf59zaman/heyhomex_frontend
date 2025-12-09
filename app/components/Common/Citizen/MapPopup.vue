<script setup>
    const props = defineProps({
        property: {
            type: Object,
            required: true,
        },
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };
</script>

<template>
    <div
        @click="handleClick"
        class="bg-white  p-2 w-80 rounded-xl border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
        <div class="relative">
            <img
                :src="property.image"
                :alt="property.title"
                class="w-full rounded-lg h-40  sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            <button
                @click.stop="handleFavoriteToggle"
                :class="[
                    'absolute top-3 right-3 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all',
                    property.isFavorited ? 'bg-red-500 hover:bg-red-600' : 'bg-white hover:bg-gray-50'
                ]">
                <Icon
                    name="lucide:heart"
                    :class="[
                        'w-4 h-4 transition-colors',
                        property.isFavorited
                            ? 'text-white fill-current'
                            : 'text-gray-400 hover:text-red-500',
                    ]" />
            </button>
        </div>
        <div class="p-3 sm:p-4">
            <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-0">
                <div class="flex-1">
                    <h3
                        class="font-semibold tracking-wide text-gray-900 text-sm sm:text-base mb-1">
                        {{ property.title }}
                    </h3>
                    <p class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        {{ property.address }}
                    </p>
                </div>
                <p
                    class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 self-start">
                    {{ formatPrice(property.price) }}
                </p>
            </div>
            <div
                class="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                <div class="flex items-center">
                    <img
                        class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                        src="/svg/dashboard/card.bed.svg"
                        alt="" />
                    <span class="font-medium">{{ property.beds }} Beds</span>
                </div>
                <div class="flex items-center">
                    <img
                        class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                        src="/svg/dashboard/card-bath.svg"
                        alt="" />
                    <span class="font-medium">{{ property.baths }} Baths</span>
                </div>
                <div class="flex items-center">
                    <img
                        class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                        src="/svg/dashboard/card-cube.svg"
                        alt="" />
                    <span class="font-medium">{{ property.sqft }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
