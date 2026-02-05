<script setup>
    const props = defineProps({
        property: {
            type: Object,
            required: true,
        },
    })

    const emit = defineEmits(["click", "favorite"])

    const fallbackImage = '/svg/not-found-img.svg'
    const imageSrc = ref(props.property.image || fallbackImage)

    // Watch for property changes to update imageSrc
    watch(() => props.property.image, (newImage) => {
        imageSrc.value = newImage || fallbackImage
    })

    const onImageError = () => {
        imageSrc.value = fallbackImage
    }

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
        class="bg-white p-3 rounded-[8px] border border-[#D9D9D9] hover:shadow-sm transition-shadow duration-300 overflow-hidden cursor-pointer">
        <div class="flex flex-col gap-4">
            <div class="relative">
                <img
                    :src="imageSrc"
                    :alt="property.title"
                    @error="onImageError"
                    class="w-full rounded-[10px] h-[200px] object-cover" />
                <button
                    @click.stop="handleFavoriteToggle"
                    :class="[
                        'absolute top-2 right-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors',
                    ]">
                    <Icon
                        :name="property.isFavorited ? 'mdi:heart' : 'mdi:heart-outline'"
                        class="w-5 h-5 text-[#283849]"
                    />
                </button>
            </div>
            <div class="flex flex-col gap-3 font-['sf-pro-Medium']">
                <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between gap-3 text-[#283849]">
                        <h3
                            class="font-bold text-[16px] leading-[24px] lg:leading-[28px] truncate">
                            {{ property.title }}
                        </h3>
                        <p
                            class="text-[18px] lg:text-[20px] leading-[28px] lg:leading-[30px] font-bold shrink-0">
                            {{ formatPrice(property.price) }}
                        </p>
                    </div>
                    <p
                        class="text-[14px] leading-[20px] text-[#121A22] capitalize truncate">
                        {{ property.address }}
                    </p>
                </div>
                <div class="h-px bg-[#EAECEE]"></div>
                <div class="flex items-center gap-1.5 lg:gap-3">
                    <div
                        class="flex-1 flex items-center gap-[4px] bg-[#FAF9F8] px-2 lg:px-3 py-[10px] rounded-[4px]">
                        <img
                            class="w-4 h-4 shrink-0"
                            src="/svg/dashboard/card.bed.svg"
                            alt="" />
                        <span
                            class="text-[12px] leading-[16px] text-[#121A22] capitalize">
                            {{ property.beds }} Beds
                        </span>
                    </div>
                    <div
                        class="flex-1 flex items-center gap-[4px] bg-[#FAF9F8] px-2 lg:px-3 py-[10px] rounded-[4px]">
                        <img
                            class="w-4 h-4 shrink-0"
                            src="/svg/dashboard/card-bath.svg"
                            alt="" />
                        <span
                            class="text-[12px] leading-[16px] text-[#121A22] capitalize">
                            {{ property.baths }} Baths
                        </span>
                    </div>
                    <div
                        class="flex-1 flex items-center gap-[4px] bg-[#FAF9F8] px-2 lg:px-3 py-[10px] rounded-[4px]">
                        <img
                            class="w-4 h-4 shrink-0"
                            src="/svg/dashboard/card-cube.svg"
                            alt="" />
                        <span
                            class="text-[12px] leading-[16px] text-[#121A22] capitalize">
                            {{ property.sqft }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
