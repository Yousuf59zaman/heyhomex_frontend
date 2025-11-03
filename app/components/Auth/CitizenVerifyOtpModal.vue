<script setup lang="ts">
// Props
const props = defineProps<{
    modelValue: boolean
    email?: string
}>()

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'verify-success': []
    close: []
}>()

// Computed for two-way binding
const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
})

// State
const otpDigits = ref(['', '', '', '', '', ''])
const timeRemaining = ref(300) // 5 minutes in seconds
const isVerifying = ref(false)
const errorMessage = ref('')
const otpInputRefs = ref<HTMLInputElement[]>([])

// Timer countdown
let timerInterval: NodeJS.Timeout | null = null

const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const startTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
    }

    timeRemaining.value = 300
    timerInterval = setInterval(() => {
        if (timeRemaining.value > 0) {
            timeRemaining.value--
        } else {
            if (timerInterval) {
                clearInterval(timerInterval)
            }
        }
    }, 1000)
}

// Methods
const closeModal = () => {
    emit('update:modelValue', false)
    emit('close')
    if (timerInterval) {
        clearInterval(timerInterval)
    }
    setTimeout(() => {
        resetForm()
    }, 300)
}

const handleBack = () => {
    closeModal()
}

const resetForm = () => {
    otpDigits.value = ['', '', '', '', '', '']
    timeRemaining.value = 300
    errorMessage.value = ''
    if (timerInterval) {
        clearInterval(timerInterval)
    }
}

const handleOtpInput = (index: number, event: Event) => {
    const input = event.target as HTMLInputElement
    const value = input.value

    // Only allow digits
    if (value && !/^\d$/.test(value)) {
        input.value = ''
        return
    }

    otpDigits.value[index] = value

    // Auto-focus next input
    if (value && index < 5) {
        const nextInput = otpInputRefs.value[index + 1]
        if (nextInput) {
            nextInput.focus()
        }
    }
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
    // Handle backspace
    if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        const prevInput = otpInputRefs.value[index - 1]
        if (prevInput) {
            prevInput.focus()
        }
    }
}

const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault()
    const pastedData = event.clipboardData?.getData('text')

    if (pastedData && /^\d{6}$/.test(pastedData)) {
        const digits = pastedData.split('')
        otpDigits.value = digits

        // Focus last input
        const lastInput = otpInputRefs.value[5]
        if (lastInput) {
            lastInput.focus()
        }
    }
}

const handleVerify = async () => {
    errorMessage.value = ''

    // Check if all digits are filled
    const otp = otpDigits.value.join('')
    if (otp.length !== 6) {
        errorMessage.value = 'Please enter all 6 digits'
        return
    }

    isVerifying.value = true

    try {
        // TODO: Replace with actual API call
        // const response = await $fetchCMS('/verify-otp', {
        //     method: 'POST',
        //     body: { email: props.email, otp }
        // })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // For now, simulate success
        console.log('OTP verified:', otp)
        emit('verify-success')
        closeModal()
    } catch (error: any) {
        errorMessage.value = error.message || 'Invalid OTP. Please try again.'
    } finally {
        isVerifying.value = false
    }
}

// Watch for modal open
watch(
    () => props.modelValue,
    (newValue) => {
        if (import.meta.client) {
            document.body.style.overflow = newValue ? 'hidden' : ''

            if (newValue) {
                startTimer()
                // Auto-focus first input
                setTimeout(() => {
                    const firstInput = otpInputRefs.value[0]
                    if (firstInput) {
                        firstInput.focus()
                    }
                }, 100)
            }
        }
    }
)

// Cleanup on unmount
onUnmounted(() => {
    if (import.meta.client) {
        document.body.style.overflow = ''
    }
    if (timerInterval) {
        clearInterval(timerInterval)
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
        class="citizen-verify-otp-modal"
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
                        OTP Verification
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-6">
            <!-- Description -->
            <div class="text-center space-y-1">
                <p class="text-sm text-gray-700">
                    We have sent a 6-digit OTP to your email. Please enter it below.
                </p>
                <p class="text-xs text-gray-600">
                    The OTP is valid for 5 minutes and you can request a maximum of 3 times.
                </p>
            </div>

            <!-- OTP Input Boxes -->
            <div class="flex justify-center gap-2">
                <input
                    v-for="(digit, index) in otpDigits"
                    :key="index"
                    :ref="el => { if (el) otpInputRefs[index] = el as HTMLInputElement }"
                    v-model="otpDigits[index]"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    class="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    @input="handleOtpInput(index, $event)"
                    @keydown="handleKeyDown(index, $event)"
                    @paste="index === 0 ? handlePaste($event) : null"
                />
            </div>

            <!-- Timer -->
            <div class="text-center">
                <p class="text-sm text-gray-700">
                    Time remaining: <span class="font-semibold">{{ formattedTime }}</span>
                </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="text-center">
                <p class="text-xs text-red-500">{{ errorMessage }}</p>
            </div>

            <!-- Verify Button -->
            <button
                @click="handleVerify"
                :disabled="isVerifying"
                type="button"
                class="w-full px-6 py-3.5 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                {{ isVerifying ? 'Verifying...' : 'Verify email' }}
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
.citizen-verify-otp-modal .p-dialog {
    border-radius: 1rem;
}

.citizen-verify-otp-modal .p-dialog-header {
    border: none;
}

.citizen-verify-otp-modal .p-dialog-content {
    border: none;
    padding-top: 0;
}

/* Remove spinner for number inputs */
input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="text"] {
    -moz-appearance: textfield;
}
</style>
