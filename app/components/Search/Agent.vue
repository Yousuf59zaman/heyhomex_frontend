<script setup>
const props = defineProps({
    agent: {
        type: Object,
        required: true,
    },
    segment: {
        type: String,
        default: 'kamaina',
        validator: (value) => ['military', 'investor', 'kamaina'].includes(value),
    },
})

const emit = defineEmits(['toggle-favorite'])

const navigateToAgent = () => {
    navigateTo(`/${props.segment}/agent/${props.agent.id}`)
}

const handleFavoriteClick = (event) => {
    event.stopPropagation()
    emit('toggle-favorite', props.agent)
}

const formatPriceRange = (minPrice, maxPrice) => {
    if (!minPrice && !maxPrice) return 'N/A'
    
    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(1)}M`
        } else if (price >= 1000) {
            return `$${(price / 1000).toFixed(0)}k`
        }
        return `$${price}`
    }
    
    if (minPrice && maxPrice) {
        return `${formatPrice(minPrice)}-${formatPrice(maxPrice)}`
    } else if (minPrice) {
        return `From ${formatPrice(minPrice)}`
    } else {
        return `Up to ${formatPrice(maxPrice)}`
    }
}

const priceRange = computed(() => {
    return formatPriceRange(props.agent.min_price, props.agent.max_price)
})

const soldCount = computed(() => {
    return props.agent.sales_count || 0
})

const rating = computed(() => {
    return props.agent.rating || 5.0
})

const reviewCount = computed(() => {
    return props.agent.reviews_count || 0
})
</script>

<template>
    <div class="bg-white border border-[#D9D9D9] rounded-[8px] p-3 cursor-pointer hover:shadow-lg transition-shadow"
        @click="navigateToAgent">
        <!-- Agent Image -->
        <div class="relative w-full h-[200px] rounded-[10px] overflow-hidden mb-4">
            <img :src="agent.photo || agent.image || '/images/dashboard/1.png'" :alt="agent.name"
                class="w-full h-full object-cover" @error="$event.target.src = '/images/dashboard/1.png'" />

            <!-- Favorite Button -->
            <!-- <button
                class="absolute top-2 right-2 bg-white/90 backdrop-blur-[2px] p-2 rounded-lg hover:bg-white transition-colors"
                @click="handleFavoriteClick">
                <Icon :name="agent.isFavorited ? 'ph:heart-fill' : 'ph:heart'" class="w-5 h-5"
                    :class="agent.isFavorited ? 'text-red-500' : 'text-gray-600'" />
            </button> -->
        </div>

        <!-- Agent Info -->
        <div class="flex flex-col gap-3">
            <!-- Name and Rating -->
            <div class="flex items-center justify-between gap-2">
                <h3 class="text-[16px] font-bold text-[#283849] leading-[28px] truncate">
                    {{ agent.name }}
                </h3>
                <!-- <div class="flex items-center gap-1 flex-shrink-0">
                    <span class="text-[20px] font-bold text-[#283849] leading-[1.5]">{{ rating.toFixed(1) }}</span>
                    <Icon name="fa6-solid:star" class="w-4 h-4 text-[#FFB013]" />
                    <span class="text-[14px] text-[#121A22] leading-[20px]">({{ reviewCount }})</span>
                </div> -->
            </div>

            <!-- Agent Type/Category -->
            <p class="text-[14px] text-[#121A22] leading-[20px] capitalize">
                {{ agent.agent_type || 'Top Agents' }}
            </p>

            <!-- Divider -->
            <!-- <div class="border-t border-[#D9D9D9]"></div> -->

            <!-- Stats -->
            <!-- <div class="flex items-center gap-3">
                <div class="flex-1 bg-[#FAF9F8] rounded-[4px] px-3 py-2.5">
                    <p class="text-[12px] font-semibold text-[#121A22] leading-[16px] capitalize text-center truncate">
                        {{ priceRange }} price Range
                    </p>
                </div>
                <div class="flex-1 bg-[#FAF9F8] rounded-[4px] px-3 py-2.5">
                    <p class="text-[12px] font-semibold text-[#121A22] leading-[16px] capitalize text-center truncate">
                        {{ soldCount }} sold last 12 mos
                    </p>
                </div>
            </div> -->
        </div>
    </div>
</template>
