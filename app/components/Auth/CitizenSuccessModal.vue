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
        :style="{ width: '28rem' }">
        <template #header>
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

        <div class="text-center space-y-6 py-4">
            <!-- Success Icon -->
            <div class="flex justify-center">
                <div
                    class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="pi pi-check text-4xl text-green-600"></i>
                </div>
            </div>

            <!-- Success Message -->
            <div class="space-y-2">
                <h2 class="text-2xl font-semibold text-gray-900">
                    Success!
                </h2>
                <p class="text-gray-600">
                    You have successfully created your account!
                </p>
            </div>

            <!-- Continue Button -->
            <Button
                @click="handleNext"
                label="Continue to login"
                class="w-full px-6 py-3.5 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                size="large" />
        </div>
    </Dialog>
</template>

<style lang="scss" scoped></style>
