<script setup lang="ts">
    interface Props {
        modelValue: boolean
        email?: string
        source?: string
    }

    const props = withDefaults(defineProps<Props>(), {
        email: "",
        source: "registration",
    })

    const visible = ref<boolean>(props.modelValue)

    watch(
        () => props.modelValue,
        (newVal: boolean): void => {
            visible.value = newVal
        }
    )

    watch(visible, (newVal: boolean): void => {
        emit("update:modelValue", newVal)
        if (!newVal) emit("close")
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'verify-success': [data: any]
        'verify-forgot-password-success': [data: any]
        'back': []
        'close': []
    }>()

    const otpDigits = ref<string[]>(["", "", "", "", "", ""])
    const timeRemaining = ref<number>(300)
    const isVerifying = ref<boolean>(false)
    const errorMessage = ref<string>("")
    const otpInputRefs = ref<HTMLInputElement[]>([])
    const getUuid = useState<any>("uuid")
    const resendAttempts = ref<number>(0)
    const maxResendAttempts: number = 3
    const isResending = ref<boolean>(false)
    const timerInterval = ref<NodeJS.Timeout | null>(null)

    const formattedTime = computed((): string => {
        const minutes = Math.floor(timeRemaining.value / 60)
        const seconds = timeRemaining.value % 60
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    })

    const startTimer = (): void => {
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

    const handleBack = (): void => {
        emit("back")
    }

    const closeHandler = () => {
        emit("close")
    }

    const handleOtpInput = (index: number, event: Event): void => {
        const input = event.target as HTMLInputElement
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

    const handleKeyDown = (index: number, event: KeyboardEvent): void => {
        if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
            const prevInput = otpInputRefs.value[index - 1]
            if (prevInput) {
                prevInput.focus()
            }
        }
    }

    const handlePaste = (event: ClipboardEvent): void => {
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

    const handleResend = async (): Promise<void> => {

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
            const response: any = await $fetchCMS(`/resent/temp/reg/otp`, {
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
        } catch (err: any) {
            console.error("Resend OTP error:", err)
            errorMessage.value =
                err?.data?.message ||
                err?.message ||
                "Unable to resend OTP. Please try again later."
        } finally {
            isResending.value = false
        }
    }

    const handleVerify = async (): Promise<void> => {
        errorMessage.value = ""

        const otp = otpDigits.value.join("")
        if (otp.length !== 6) {
            errorMessage.value = "Please enter all 6 digits"
            return
        }

        if (props.source === "registration") {
            const uuid = getUuid.value?.uuid
            if (!uuid) {
                errorMessage.value = "Session expired. Please start over."
                return
            }
            isVerifying.value = true
            try {
                const response: any = await $fetchCMS(`/temp-reg/otp/verify`, {
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
            } catch (error: any) {
                console.error("OTP verify error:", error)
                errorMessage.value =
                    error?.data?.message ||
                    error?.message ||
                    "Invalid OTP. Please try again."
            } finally {
                isVerifying.value = false
            }
        } else if (props.source === "forgot-password") {
            // Forgot password flow
            isVerifying.value = true
            try {
                const otp = otpDigits.value.join("")
                const response: any = await $fetchCMS(`/forget-password/otp/verify`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: {
                        email: props.email,
                        otp: otp,
                    },
                })

                if (response?.status === "success") {
                    emit("verify-forgot-password-success", response.data)
                } else {
                    errorMessage.value =
                        response?.message || "Invalid OTP. Please try again."
                }
            } catch (error: any) {
                console.error("Forgot Password OTP verify error:", error)
                errorMessage.value =
                    error?.data?.message ||
                    error?.message ||
                    "Invalid OTP. Please try again."
            } finally {
                isVerifying.value = false
            }
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
        :closable="false"
        :draggable="false"
        :resizable="false"
        class="citizen-verify-otp-modal"
        :style="{width: 'min(45rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-8',
        }">
        <template #header>
            <div class="absolute right-0 top-0 z-50">
                <button
                    @click="closeHandler"
                    class="w-14 h-14 flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-[0.9375rem] rounded-tr-[0.625rem] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-2xl"></i>
                </button>
            </div>
            <div class="w-full px-6 pt-8">
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

                    <h2 class="text-2xl md:text-3xl lg:text-[32px] leading-tight lg:leading-[40px] font-[510] text-[#121A22] text-center font-['sf-pro-Regular']">
                        OTP Verification
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pt-8 pb-2 space-y-7">
            <div class="text-center space-y-2 w-full">
                <p class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]">
                    We have sent a 6-digit OTP to your email. Please enter it
                    below.
                </p>
                <p class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]">
                    The OTP is valid for 5 minutes and you can request a maximum
                    of 3 times.
                </p>
            </div>

            <div class="flex justify-center gap-3 md:gap-5">
                <input
                    v-for="(digit, index) in otpDigits"
                    :key="index"
                    :ref="
                        (el) => {
                            if (el) otpInputRefs[index] = el as HTMLInputElement
                        }
                    "
                    v-model="otpDigits[index]"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    class="w-[3rem] h-14 px-[15px] flex items-center self-stretch text-center text-lg font-semibold border border-[#CFDBE8] rounded-[8px] bg-white text-[#121A22] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors md:w-[4rem] md:h-14"
                    @input="handleOtpInput(index, $event)"
                    @keydown="handleKeyDown(index, $event)"
                    @paste="index === 0 ? handlePaste($event) : null" />
            </div>

            <div class="text-center space-y-2">
                <div
                    v-if="timeRemaining > 0 && !errorMessage"
                    class="text-base font-medium text-[#121A22]">
                    <p class="text-base leading-6 font-[510] text-[#121A22] text-center font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]">
                        Time remaining:
                        <span class="font-bold text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]">{{ formattedTime }}</span>
                    </p>
                </div>

                <div v-if="timeRemaining <= 0 && !errorMessage">
                    <p class="text-base leading-6 font-[510] text-[#121A22] text-center font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] mb-3">
                        Didn't receive the code?
                    </p>
                    <button
                        v-if="resendAttempts < maxResendAttempts"
                        @click="handleResend"
                        :disabled="isResending"
                        class="px-4 py-2 bg-white border border-gray-300 rounded-md text-base leading-6 font-bold text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <span v-if="isResending">Resending...</span>
                        <span v-else>Resend OTP</span>
                    </button>
                    <p
                        v-else
                        class="text-base leading-6 font-[510] text-[#121A22] text-center font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]">
                        Maximum resend attempts reached
                    </p>
                    <p class="text-base leading-6 font-[510] text-[#121A22] text-center font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] mt-2">
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
                class="w-full h-[3.25rem] px-6 bg-[#18222c] hover:bg-[#101822] disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors duration-200 flex items-center justify-center">
                {{ isVerifying ? "Verifying..." : "Verify email" }}
            </button>

            <div class="text-center">
                <p class="text-base font-medium text-[#121A22]">
                    By using heyhomex, you agree to the
                    <a
                        href="/terms"
                        class="text-base leading-6 font-bold text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] hover:underline"
                        >Terms</a
                    >
                    and
                    <a
                        href="/privacy"
                        class="text-base leading-6 font-bold text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] hover:underline"
                        >Privacy Policy</a
                    >.
                </p>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-verify-otp-modal .p-dialog {
        border-radius: 0.625rem;
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
