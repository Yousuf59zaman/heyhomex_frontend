<script setup>
    const props = defineProps({
        modelValue: Boolean,
    })

    const emit = defineEmits(["update:modelValue", "next", "close"])

    const isOpen = computed({
        get: () => props.modelValue,
        set: (value) => emit("update:modelValue", value),
    })

    const handleNext = () => {
        emit("next")
    }

    const closeHandler = () => {
        emit("close")
    }

    const handleClose = () => {
        emit("close")
    }
</script>

<template>
    <Dialog
        v-model:visible="isOpen"
        modal
        :draggable="false"
        :closable="false"
        class="auth-modal"
        :style="{width: '45rem', maxWidth: '720px'}"
        :pt="{
            header: 'border-0 p-[0px!important]',
            content: 'border-0 px-[24px!important]',
        }">
        <template #header>
            <div class="absolute right-0 top-0 z-50">
                <button
                    @click="closeHandler"
                    class="w-14 h-14 flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-[0.9375rem] rounded-tr-[0.625rem] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-2xl"></i>
                </button>
            </div>
            <div class="flex items-center justify-between w-full">
                <div class="w-6"></div>
                <button
                    @click="handleClose"
                    type="button"
                    class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <i class="pi pi-times text-xl"></i>
                </button>
            </div>
        </template>

        <div class="text-center space-y-6 pb-4 pt-4 flex flex-col items-center">
            <!-- Success Message -->
            <div class="space-y-2 w-[408px] max-w-full pb-2">
                <p class="text-[32px] leading-[40px] font-[510] text-[#121A22] text-center font-['sf-pro-Medium']">
                    You have successfully created your account!
                </p>
            </div>

            <!-- Continue Button -->
            <button
                @click="handleNext"
                class="w-full px-6 py-3 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-gray-400 text-white lg:text-base font-bold rounded-lg transition-colors duration-200 flex items-center justify-center"
                size="large">
                Continue to login
            </button>
        </div>
    </Dialog>
</template>

<style lang="scss" scoped></style>
