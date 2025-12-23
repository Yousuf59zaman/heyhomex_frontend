<script setup>
    const props = defineProps({
        item: {
            type: Object,
            required: true,
        },
        type: {
            type: String,
            required: true,
            validator: (value) => ["home", "video"].includes(value),
        },
    })

    const emit = defineEmits(["remove", "click"])

    const formatSubtitle = (item) => {
        if (props.type === "home") {
            return item.location
        } else {
            return `${item.description} • ${item.duration}`
        }
    }

    const handleRemove = () => {
        emit("remove", props.item.id)
    }

    const handleClick = () => {
        emit("click", props.item)
    }
</script>

<template>
    <div
        class="rounded-[8px] px-4 py-3 bg-[#FAF9F8] hover:bg-[#F3F2F1] transition-colors cursor-pointer"
        @click="handleClick">
        <div class="flex items-center gap-4">
            <div class="relative w-14 h-14 flex-shrink-0">
                <img
                    :src="item.image"
                    :alt="item.title"
                    class="w-14 h-14 rounded-[10px] object-cover" />

                <div
                    v-if="type === 'video'"
                    class="absolute inset-0 flex items-center justify-center">
                    <Icon
                        name="lucide:play"
                        class="w-4 h-4 text-white" />
                </div>
            </div>

            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-[#283849] text-[14px] leading-[20px]">
                    {{ item.title }}
                </h4>
                <p
                    :class="[
                        'mt-1 flex items-center gap-2 text-[12px] leading-[18px] text-[#283849]',
                    ]">
                    <span
                        v-if="type === 'home'"
                        class="flex items-center justify-center rounded-[32px] bg-[#F6F6FA] p-[6px]">
                        <Icon
                            name="mdi:map-marker"
                            class="w-3 h-3 text-[#283849]" />
                    </span>
                    <Icon
                        v-else
                        name="lucide:video"
                        class="w-3 h-3 text-[#283849] flex-shrink-0" />
                    <span class="truncate">{{ formatSubtitle(item) }}</span>
                </p>
            </div>

            <button
                @click.stop="handleRemove"
                class="p-1 rounded transition-colors hover:bg-[#ECECEC]">
                <Icon
                    name="mdi:heart"
                    :class="[
                        'w-4 h-4',
                        'text-[#2C3E50]',
                    ]" />
            </button>
        </div>
    </div>
</template>
