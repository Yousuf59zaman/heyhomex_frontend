<template>
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px] max-w-[320px]">
        <div class="flex items-start gap-3">
            <img
                :src="property.image"
                :alt="property.title"
                class="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {{ property.title }}
                </h4>
                <p class="text-xs text-gray-600 mb-2 line-clamp-2">
                    {{ property.address }}
                </p>
                <p class="text-lg font-bold text-gray-900 mb-2">
                    {{ formatPrice(property.price) }}
                </p>
                
                <div class="flex items-center justify-between text-xs text-gray-600">
                    <div class="flex items-center">
                        <img
                            class="w-3 h-3 mr-1"
                            src="/svg/dashboard/card.bed.svg"
                            alt="" />
                        <span>{{ property.beds }}</span>
                    </div>
                    <div class="flex items-center">
                        <img
                            class="w-3 h-3 mr-1"
                            src="/svg/dashboard/card-bath.svg"
                            alt="" />
                        <span>{{ property.baths }}</span>
                    </div>
                    <div class="flex items-center">
                        <img
                            class="w-3 h-3 mr-1"
                            src="/svg/dashboard/card-cube.svg"
                            alt="" />
                        <span>{{ property.sqft }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

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

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>