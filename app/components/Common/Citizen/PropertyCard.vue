<script setup>
    const props = defineProps({
        property: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(["click", "favorite"])

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    const handleClick = () => {
        emit("click", props.property)
    }

    const handleFavoriteToggle = () => {
        emit("favorite", props.property)
    }
</script>

<template>
    <div
        @click="handleClick"
        class="bg-white p-3 rounded-lg border border-[#D9D9D9] hover:shadow-sm transition-shadow duration-300 overflow-hidden cursor-pointer">
        <div class="relative">
            <img
                :src="property.image"
                :alt="property.title"
                class="w-full rounded-lg h-40 object-cover" />
            <button
                @click.stop="handleFavoriteToggle"
                :class="[
                    'absolute top-2 right-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-sm shadow-sm transition-colors',
                ]">
                <Icon
                    name="lucide:heart"
                    :class="[
                        'w-5 h-5 text-[#2C3E50]',
                        property.isFavorited ? 'fill-[#2C3E50]' : 'fill-transparent',
                    ]" />
            </button>
        </div>
        <div class="mt-4 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3 text-[#283849]">
                <h3
                    class="font-bold text-[16px] leading-[28px] truncate">
                    {{ property.title }}
                </h3>
                <p
                    class="hidden sm:block text-[20px] leading-[1.5] font-bold">
                    {{ formatPrice(property.price) }}
                </p>
            </div>
            <p
                class="text-[12px] sm:text-[14px] leading-[20px] text-[#121A22] truncate">
                {{ property.address }}
            </p>
            <div class="hidden sm:block h-px bg-[#EAECEE]"></div>
            <div class="hidden sm:flex items-center gap-3">
                <div
                    class="flex-1 flex items-center gap-[4px] bg-[#FAF9F8] px-[12px] py-[10px] rounded-[4px]">
                    <img
                        class="w-4 h-4"
                        src="/svg/dashboard/card.bed.svg"
                        alt="" />
                    <span
                        class="text-[12px] leading-[16px] text-[#121A22]">
                        {{ property.beds }} Beds
                    </span>
                </div>
                <div
                    class="flex-1 flex items-center gap-[4px] bg-[#FAF9F8] px-[12px] py-[10px] rounded-[4px]">
                    <img
                        class="w-4 h-4"
                        src="/svg/dashboard/card-bath.svg"
                        alt="" />
                    <span
                        class="text-[12px] leading-[16px] text-[#121A22]">
                        {{ property.baths }} Baths
                    </span>
                </div>
                <div
                    class="flex-1 flex items-center gap-[4px] bg-[#FAF9F8] px-[12px] py-[10px] rounded-[4px]">
                    <img
                        class="w-4 h-4"
                        src="/svg/dashboard/card-cube.svg"
                        alt="" />
                    <span
                        class="text-[12px] leading-[16px] text-[#121A22]">
                        {{ property.sqft }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
