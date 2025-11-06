<script setup>
    const baseURL = useRuntimeConfig().public.API_BASE_URL

    const emit = defineEmits([
        "update:modelValue",
        "verify-success",
        "back",
        "close",
    ])

    const props = defineProps({
        modelValue: {
            type: Boolean,
            required: true,
        },
        email: {
            type: String,
            default: "",
        },
    })

    const visible = ref(props.modelValue)

    watch(
        () => props.modelValue,
        (newVal) => {
            visible.value = newVal
        }
    )

    watch(visible, (newVal) => {
        emit("update:modelValue", newVal)
        if (!newVal) emit("close")
    })

    const otpDigits = ref(["", "", "", "", "", ""])
    const timeRemaining = ref(300)
    const isVerifying = ref(false)
    const errorMessage = ref("")
    const otpInputRefs = ref([])
    const getUuid = useState("uuid")
    const resendAttempts = ref(0)
    const maxResendAttempts = 3
    const isResending = ref(false)
    const timerInterval = ref(null)

    const formattedTime = computed(() => {
        const minutes = Math.floor(timeRemaining.value / 60)
        const seconds = timeRemaining.value % 60
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    })

    const startTimer = () => {
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
            timerInterval.value = null
        }

        timeRemaining.value = 300

        timerInterval.value = setInterval(() => {
            timeRemaining.value--
            if (timeRemaining.value <= 0) {
                if (timerInterval.value) {
                    clearInterval(timerInterval.value)
                    timerInterval.value = null
                }
            }
        }, 1000)
    }

    const handleBack = () => {
        emit("back")
    }

    const handleOtpInput = (index, event) => {
        const input = event.target
        const value = input.value
        if (value && !/^\d$/.test(value)) {
            input.value = ""
            return
        }

        otpDigits.value[index] = value

        if (value && index < 5) {
            const nextInput = otpInputRefs.value[index + 1]
            if (nextInput) {
                nextInput.focus()
            }
        }
    }

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
            const prevInput = otpInputRefs.value[index - 1]
            if (prevInput) {
                prevInput.focus()
            }
        }
    }

    const handlePaste = (event) => {
        event.preventDefault()
        const pastedData = event.clipboardData?.getData("text")
        if (pastedData && /^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("")
            otpDigits.value = digits

            const lastInput = otpInputRefs.value[5]
            if (lastInput) {
                lastInput.focus()
            }
        }
    }

    const handleResend = async () => {
        if (resendAttempts.value >= maxResendAttempts) {
            errorMessage.value = "You have reached the maximum resend attempts."
            return
        }

        const uuid = getUuid.value?.uuid
        if (!uuid) {
            errorMessage.value =
                "Session expired. Please go back and re-enter your email."
            return
        }

        isResending.value = true
        errorMessage.value = ""

        try {
            const response = await $fetchCMS(`/resent/temp/reg/otp`, {
                method: "POST",
                body: {uuid},
            })

            if (response?.status === "success") {
                resendAttempts.value++
                timeRemaining.value = 300
                startTimer()
                otpDigits.value = ["", "", "", "", "", ""]
                setTimeout(() => {
                    const firstInput = otpInputRefs.value[0]
                    if (firstInput) firstInput.focus()
                }, 150)
            } else {
                errorMessage.value =
                    response?.message || "Failed to resend OTP."
            }
        } catch (err) {
            console.error("Resend OTP error:", err)
            errorMessage.value =
                err?.data?.message ||
                err?.message ||
                "Unable to resend OTP. Please try again later."
        } finally {
            isResending.value = false
        }
    }

    const handleVerify = async () => {
        errorMessage.value = ""

        const otp = otpDigits.value.join("")
        if (otp.length !== 6) {
            errorMessage.value = "Please enter all 6 digits"
            return
        }

        const uuid = getUuid.value?.uuid
        if (!uuid) {
            errorMessage.value = "Session expired. Please start over."
            return
        }

        isVerifying.value = true

        try {
            const response = await $fetchCMS(`/temp-reg/otp/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    uuid,
                    auth_code: otp,
                },
            })

            if (response?.status === "success") {
                emit("verify-success", response.data)
            } else {
                errorMessage.value =
                    response?.message || "Invalid OTP. Please try again."
            }
        } catch (error) {
            console.error("OTP verify error:", error)
            errorMessage.value =
                error?.data?.message ||
                error?.message ||
                "Invalid OTP. Please try again."
        } finally {
            isVerifying.value = false
        }
    }

    onMounted(() => {
        if (props.modelValue) {
            startTimer()
        }
    })

    watch(
        () => props.modelValue,
        (newValue) => {
            if (import.meta.client) {
                document.body.style.overflow = newValue ? "hidden" : ""

                if (newValue) {
                    resendAttempts.value = 0
                    startTimer()

                    setTimeout(() => {
                        const firstInput = otpInputRefs.value[0]
                        if (firstInput) {
                            firstInput.focus()
                        }
                    }, 100)
                } else {
                    // Clean up timer when modal closes
                    if (timerInterval.value) {
                        clearInterval(timerInterval.value)
                        timerInterval.value = null
                    }
                }
            }
        }
    )

    // Cleanup timer on component unmount
    onUnmounted(() => {
        if (timerInterval.value) {
            clearInterval(timerInterval.value)
            timerInterval.value = null
        }
        if (import.meta.client) {
            document.body.style.overflow = ""
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
        :style="{width: 'min(32rem, 95vw)', maxWidth: '95vw'}"
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

                    <h2 class="text-xl font-semibold text-[#121A22]">
                        OTP Verification
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-6">
            <div class="text-center space-y-1">
                <p class="text-sm text-gray-700">
                    We have sent a 6-digit OTP to your email. Please enter it
                    below.
                </p>
                <p class="text-xs text-gray-600">
                    The OTP is valid for 5 minutes and you can request a maximum
                    of 3 times.
                </p>
            </div>

            <div class="flex justify-center gap-2">
                <input
                    v-for="(digit, index) in otpDigits"
                    :key="index"
                    :ref="
                        (el) => {
                            if (el) otpInputRefs[index] = el
                        }
                    "
                    v-model="otpDigits[index]"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    class="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    @input="handleOtpInput(index, $event)"
                    @keydown="handleKeyDown(index, $event)"
                    @paste="index === 0 ? handlePaste($event) : null" />
            </div>

            <div class="text-center space-y-3">
                <div
                    v-if="timeRemaining > 0 && !errorMessage"
                    class="text-sm text-gray-700">
                    <p>
                        Time remaining:
                        <span class="font-semibold">{{ formattedTime }}</span>
                    </p>
                </div>

                <div v-if="timeRemaining <= 0 && !errorMessage">
                    <p class="text-sm text-gray-600 mb-3">
                        Didn't receive the code?
                    </p>
                    <button
                        v-if="resendAttempts < maxResendAttempts"
                        @click="handleResend"
                        :disabled="isResending"
                        class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <span v-if="isResending">Resending...</span>
                        <span v-else>Resend OTP</span>
                    </button>
                    <p
                        v-else
                        class="text-sm text-red-600 font-medium">
                        Maximum resend attempts reached
                    </p>
                    <p class="text-xs text-gray-500 mt-2">
                        Attempts used: {{ resendAttempts }} /
                        {{ maxResendAttempts }}
                    </p>
                </div>
            </div>

            <div
                v-if="errorMessage"
                class="text-center space-y-3">
                <p class="text-xs text-red-500">{{ errorMessage }}</p>

                <button
                    v-if="resendAttempts < maxResendAttempts"
                    @click="handleResend"
                    :disabled="isResending"
                    class="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span v-if="isResending">Resending...</span>
                    <span v-else>Resend OTP</span>
                </button>
            </div>

            <button
                @click="handleVerify"
                :disabled="isVerifying"
                type="button"
                class="w-full px-6 py-3.5 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                {{ isVerifying ? "Verifying..." : "Verify email" }}
            </button>

            <div class="text-center pt-2">
                <p class="text-xs text-gray-600">
                    By using heyhomex, you agree to the
                    <a
                        href="/terms"
                        class="text-gray-900 font-medium hover:underline"
                        >Terms</a
                    >
                    and
                    <a
                        href="/privacy"
                        class="text-gray-900 font-medium hover:underline"
                        >Privacy Policy</a
                    >.
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
        appearance: textfield;
    }
</style>
