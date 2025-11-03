<script setup lang="ts">
// Props
const props = defineProps<{
    modelValue: boolean
}>()

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'next': [email: string]
    close: []
}>()

// Computed for two-way binding
const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
})

// State
const email = ref('')
const emailError = ref('')

// Methods
const closeModal = () => {
    emit('update:modelValue', false)
    emit('close')
    setTimeout(() => {
        email.value = ''
        emailError.value = ''
    }, 300)
}

const handleBack = () => {
    closeModal()
}

const validateEmail = (emailValue: string): boolean => {
    if (!emailValue || !emailValue.trim()) {
        emailError.value = 'Email is required'
        return false
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(emailValue)) {
        emailError.value = 'Please enter a valid email address'
        return false
    }

    emailError.value = ''
    return true
}

const handleNext = () => {
    if (validateEmail(email.value)) {
        emit('next', email.value)
        closeModal()
    }
}

// Prevent body scroll when modal is open
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
        class="citizen-send-otp-modal"
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
                        Add your email
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-4">
            <!-- Email Input -->
            <div class="flex flex-col gap-2">
                <label
                    for="email"
                    class="text-sm font-medium text-gray-700"
                    >Email Address</label
                >
                <InputText
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="Enter your email address"
                    @keyup.enter="handleNext"
                    :pt="{
                        root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                    }" />
                <span
                    v-if="emailError"
                    class="text-xs text-red-500">
                    {{ emailError }}
                </span>
            </div>

            <!-- Next Button -->
            <button
                @click="handleNext"
                type="button"
                class="w-full px-6 py-3.5 bg-[#1E293B] hover:bg-[#0F172A] text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
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
.citizen-send-otp-modal .p-dialog {
    border-radius: 1rem;
}

.citizen-send-otp-modal .p-dialog-header {
    border: none;
}

.citizen-send-otp-modal .p-dialog-content {
    border: none;
    padding-top: 0;
}
</style>
