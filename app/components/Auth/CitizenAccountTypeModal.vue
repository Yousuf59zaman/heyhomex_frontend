<script setup lang="ts">
// Props
const props = defineProps<{
    modelValue: boolean
}>()

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'next': [accountType: string]
    'back': []
    'close': []
}>()

// Computed for two-way binding
const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => {
        emit('update:modelValue', value)
        // If dialog is being closed (value is false), emit close event
        if (!value) {
            emit('close')
        }
    },
})

// State
const selectedAccountType = ref('buyer')

// Methods
const closeModal = () => {
    emit('update:modelValue', false)
    emit('close')
    setTimeout(() => {
        resetForm()
    }, 300)
}

const handleBack = () => {
    emit('back')
}

const resetForm = () => {
    selectedAccountType.value = 'buyer'
}

const selectAccountType = (type: string) => {
    selectedAccountType.value = type
}

const handleNext = () => {
    emit('next', selectedAccountType.value)
}

// Watch for modal open
watch(
    () => props.modelValue,
    (newValue) => {
        if (import.meta.client) {
            document.body.style.overflow = newValue ? 'hidden' : ''
        }
    }
)

// Cleanup on unmount
onUnmounted(() => {
    if (import.meta.client) {
        document.body.style.overflow = ''
    }
})
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-account-type-modal"
        :style="{ width: 'min(32rem, 95vw)', maxWidth: '95vw' }"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl m-4',
            header: 'border-0 pb-4',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200',
        }">
        <template #header>
            <div class="w-full px-6 pt-6 pb-2">
                <div class="flex items-center justify-center relative">
                    <!-- Back Button -->
                    <button
                        @click="handleBack"
                        type="button"
                        class="absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        aria-label="Go back">
                        <svg
                            class="w-5 h-5 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <!-- Title -->
                    <h2 class="text-xl font-semibold text-[#121A22]">
                        Select account type
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-6">
            <!-- Account Type Selection -->
            <div class="grid grid-cols-3 gap-3">
                <!-- Buyer Option -->
                <button
                    @click="selectAccountType('buyer')"
                    type="button"
                    :class="[
                        'px-4 py-3.5 rounded-lg font-medium transition-all duration-200',
                        selectedAccountType === 'buyer'
                            ? 'bg-[#1E293B] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    ]">
                    I am a Buyer
                </button>

                <!-- Agent Option -->
                <button
                    @click="selectAccountType('agent')"
                    type="button"
                    :class="[
                        'px-4 py-3.5 rounded-lg font-medium transition-all duration-200',
                        selectedAccountType === 'agent'
                            ? 'bg-[#1E293B] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    ]">
                    I am an Agent
                </button>

                <!-- Advertiser Option -->
                <button
                    @click="selectAccountType('advertiser')"
                    type="button"
                    :class="[
                        'px-4 py-3.5 rounded-lg font-medium transition-all duration-200',
                        selectedAccountType === 'advertiser'
                            ? 'bg-[#1E293B] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    ]">
                    I am an Advertiser
                </button>
            </div>

            <!-- Next Button -->
            <button
                @click="handleNext"
                type="button"
                class="w-full px-6 py-3.5 bg-[#1E293B] hover:bg-[#0F172A] text-white font-medium rounded-lg transition-colors duration-200">
                Next
            </button>

            <!-- Terms and Privacy -->
            <div class="text-center pt-2">
                <p class="text-xs text-gray-600">
                    By using heyhomex, you agree to the
                    <a href="/terms" class="text-gray-900 font-medium hover:underline">Terms</a>
                    and
                    <a href="/privacy" class="text-gray-900 font-medium hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.citizen-account-type-modal .p-dialog {
    border-radius: 1rem;
}

.citizen-account-type-modal .p-dialog-header {
    border: none;
}

.citizen-account-type-modal .p-dialog-content {
    border: none;
    padding-top: 0;
}
</style>
