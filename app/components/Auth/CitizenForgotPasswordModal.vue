<script setup lang="ts">
    interface Props {
        modelValue: boolean
    }

    const props = defineProps<Props>()

    const emit = defineEmits<{
        "update:modelValue": [value: boolean]
        next: [email: string]
        "back-to-login": []
        close: []
        "verify-otp": []
    }>()

    const visible = computed({
        get: (): boolean => props.modelValue,
        set: (value: boolean): void => {
            emit("update:modelValue", value)

            if (!value) {
                emit("close")
            }
        },
    })

    interface ValidationErrors {
        email?: string
        message?: string
        [key: string]: string | undefined
    }

    interface FormData {
        email: string
    }

    const validations_errors = ref<ValidationErrors>({})
    const formData = ref<FormData>({
        email: "",
    })
    const isLoading = ref<boolean>(false)
    const isSuccess = ref<boolean>(false)

    const handleBackToLogin = (): void => {
        emit("back-to-login")
    }

    const closeHandler = () => {
        emit("close")
    }

    const handleSubmit = async (): Promise<void> => {
        validations_errors.value = {}

        if (!formData.value.email) {
            validations_errors.value.email = "Email is required"
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.value.email)) {
            validations_errors.value.email =
                "Please enter a valid email address"
            return
        }

        try {
            isLoading.value = true

            const response: any = await $fetchCMS(`/forget-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {email: formData.value.email},
            })

            if (response?.status === "success") {
                isSuccess.value = true
                emit("next", response.data?.email || formData.value.email)
            } else {
                validations_errors.value.message =
                    response?.message ||
                    "Unable to send reset link. Please try again."
            }
        } catch (e: any) {
            console.log(
                "Forgot Password Error:",
                e instanceof Error ? e.message : String(e)
            )
            const status = e?.response?.status || e?.statusCode
            const responseMessage = e?.response?._data?.message || e?.data?.message

            if (status === 422 || status === 409) {
                const errorsData = e.response?._data?.data || {}
                for (const key in errorsData) {
                    if (errorsData.hasOwnProperty(key)) {
                        validations_errors.value[key] = errorsData[key][0]
                    }
                }
                if (Object.keys(validations_errors.value).length === 0) {
                    validations_errors.value.message = responseMessage || "Please check your email and try again."
                }
            } else if (status === 404) {
                validations_errors.value.message =
                    "We couldn't find an account with that email address. Please check and try again."
            } else if (status === 500) {
                validations_errors.value.message =
                    responseMessage || "We couldn't find an account with that email address. Please check and try again."
            } else {
                validations_errors.value.message =
                    "Something went wrong. Please try again later."
            }
        } finally {
            isLoading.value = false
        }
    }

    watch(
        () => props.modelValue,
        (newValue) => {
            if (import.meta.client) {
                document.body.style.overflow = newValue ? "hidden" : ""
            }
        }
    )
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :draggable="false"
        :resizable="false"
        class="citizen-forgot-password-modal"
        :style="{width: '45rem', maxWidth: '720px'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4 bg-white overflow-hidden',
            header: 'border-0 p-[0px!important] bg-white',
            content: 'border-0 p-[0px!important] bg-white',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200',
        }">
        <template #header>
            <div class="absolute right-0 top-0 z-50">
                <button
                    @click="closeHandler"
                    class="w-14 h-14 flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-[0.9375rem] rounded-tr-[0.625rem] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-2xl"></i>
                </button>
            </div>
            <div class="w-full px-6 pt-8 pb-0">
                <div class="flex items-center justify-center">
                    <h2
                        class="text-2xl md:text-3xl lg:text-[32px] leading-tight lg:leading-[40px] font-[510] text-[#121A22] text-center font-['sf-pro-Regular']">
                        Forgot password
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-8 pt-12">
            <div
                v-if="!isSuccess"
                class="flex flex-col gap-10">
                <p class="text-base leading-6 font-normal text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]">
                    No worries! Enter your email address and we'll send you a
                    link to reset it.
                </p>

                <div class="flex flex-col gap-0.5">
                    <label
                        for="forgot-email"
                        class="text-base leading-6 pb-2 font-[510] text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]"
                        >Email Address</label
                    >
                    <InputText
                        id="forgot-email"
                        v-model="formData.email"
                        type="email"
                        placeholder="Enter your email address"
                        @keyup.enter="handleSubmit"
                        :pt="{
                            root: 'w-full px-4 py-4 h-14 border border-[#CFDBE8] rounded-lg text-base leading-6 text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                    <div
                        v-if="validations_errors.email"
                        class="text-base leading-6 font-normal text-[var(--Colors-Red,#FF3B30)] font-['sf-pro-Regular'] bg-[rgba(255,59,48,0.05)] border border-[#FF0000] rounded-[10px] px-3 py-2 mt-4 inline-flex items-center justify-between gap-2 w-full">
                        <span>{{ validations_errors.email }}</span>
                        <button
                            type="button"
                            aria-label="Dismiss error"
                            @click="validations_errors.email = ''"
                            class="p-0.5 text-[var(--Colors-Red,#FF3B30)]">
                            <svg
                                class="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M18 6L6 18M6 6l12 12"
                                    stroke="var(--Colors-Red,#FF3B30)"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    v-if="validations_errors.message"
                    class="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg flex items-center justify-between gap-2">
                    <p class="text-sm text-[#DC2626]">{{ validations_errors.message }}</p>
                    <button
                        type="button"
                        @click="validations_errors.message = ''"
                        class="text-[#DC2626] hover:text-red-800 flex-shrink-0">
                        <i class="pi pi-times text-sm"></i>
                    </button>
                </div>

                <button
                    @click="handleSubmit"
                    :disabled="isLoading"
                    type="button"
                    class="w-full px-5 py-3.5 h-[3.25rem] font-bold text-base leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    :class="
                        isLoading
                            ? 'bg-[#606e83] text-white cursor-not-allowed'
                            : 'bg-[#18222C] hover:bg-[#0F172A] text-white'
                    ">
                    <svg
                        v-if="isLoading"
                        class="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"></circle>
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading ? "Sending..." : "Continue" }}
                </button>

                <div class="text-center">
                    <button
                        @click="handleBackToLogin"
                        type="button"
                        class="text-base leading-6 text-[#121A22] font-bold font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] hover:underline">
                        Back to Sign in
                    </button>
                </div>
            </div>

            <div
                v-else
                class="space-y-4 text-center">
                <div class="flex justify-center">
                    <div
                        class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            class="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>
                <h3 class="text-lg font-semibold text-[#121A22]">
                    Check your email
                </h3>
                <p class="text-sm text-gray-600">
                    We've sent a password reset link to
                    <span class="font-medium">{{ formData.email }}</span>
                </p>
                <p class="text-xs text-gray-500">
                    Redirecting you back to sign in...
                </p>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-forgot-password-modal .p-dialog {
        border-radius: 0.625rem;
    }

    .citizen-forgot-password-modal .p-dialog-header {
        border: none;
        padding: 0;
    }

    .citizen-forgot-password-modal .p-dialog-content {
        border: none;
        padding: 0;
    }
</style>
