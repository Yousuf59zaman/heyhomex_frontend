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
        :class="[
            'rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer',
            type === 'home' ? 'bg-[#FAF9F8]' : 'bg-gray-50',
        ]"
        @click="handleClick">
        <div class="flex items-start space-x-3">
            <div class="relative w-12 h-12 flex-shrink-0">
                <img
                    :src="item.image"
                    :alt="item.title"
                    class="w-12 h-12 rounded-lg object-cover" />

                <div
                    v-if="type === 'video'"
                    class="absolute inset-0 flex items-center justify-center">
                    <Icon
                        name="lucide:play"
                        class="w-4 h-4 text-white" />
                </div>
            </div>

            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-900 text-sm leading-tight">
                    {{ item.title }}
                </h4>
                <p
                    :class="[
                        'mt-1 flex items-center gap-1 text-[12px] leading-[18px]',
                        type === 'home' ? 'text-[#283849]' : 'text-gray-500',
                    ]">
                    <span
                        v-if="type === 'home'"
                        class="flex items-center justify-center rounded-full bg-[#F6F6FA] p-1.5">
                        <Icon
                            name="mdi:map-marker"
                            class="w-3 h-3 text-[#283849]" />
                    </span>
                    <Icon
                        v-else
                        name="lucide:video"
                        class="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span class="truncate">{{ formatSubtitle(item) }}</span>
                </p>
            </div>

            <button
                @click.stop="handleRemove"
                class="p-1 hover:bg-gray-200 rounded transition-colors">
                <Icon
                    name="mdi:heart"
                    :class="[
                        'w-5 h-5',
                        type === 'video' ? 'text-red-500' : 'text-[#2C3E50]',
                    ]" />
            </button>
        </div>
    </div>
</template>
