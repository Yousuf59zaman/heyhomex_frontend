<script setup lang="ts">
    const baseURL = useRuntimeConfig().public.API_BASE_URL

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'next': [email: string]
        'back-to-login': []
        'close': []
        'verify-otp': []
    }>()

    interface Props {
        modelValue: boolean
    }

    const props = defineProps<Props>()

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

    const handleSubmit = async (): Promise<void> => {
        validations_errors.value = {}

        if (!formData.value.email) {
            validations_errors.value.email = "Email is required"
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.value.email)) {
            validations_errors.value.email = "Please enter a valid email address"
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
                emit("next" , response.data?.email || formData.value.email)
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
            const status = e?.response?.status
            if (status === 422 || status === 409) {
                const errorsData = e.response?._data?.data || {}
                for (const key in errorsData) {
                    if (errorsData.hasOwnProperty(key)) {
                        validations_errors.value[key] = errorsData[key][0]
                    }
                }
            } else if (status === 404) {
                validations_errors.value.message =
                    "Email address not found. Please check and try again."
            } else {
                validations_errors.value.message =
                    e?.message || "Something went wrong. Please try again."
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
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-forgot-password-modal"
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
                <div class="flex items-center justify-center">
                    <h2 class="text-xl font-semibold text-[#121A22]">
                        Forgot password
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6">
            <div v-if="!isSuccess" class="space-y-4">
                <p class="text-sm text-gray-600 text-center">
                    No worries! Enter your email address and we'll send you a
                    link to reset it.
                </p>

                <div class="flex flex-col gap-2">
                    <label
                        for="forgot-email"
                        class="text-sm font-medium text-gray-700"
                        >Email Address</label
                    >
                    <InputText
                        id="forgot-email"
                        v-model="formData.email"
                        type="email"
                        placeholder="Enter your email address"
                        @keyup.enter="handleSubmit"
                        :pt="{
                            root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                    <span
                        v-if="validations_errors.email"
                        class="text-xs text-red-500">
                        {{ validations_errors.email }}
                    </span>
                </div>

                <span
                    v-if="validations_errors.message"
                    class="text-xs text-red-500 block text-center">
                    {{ validations_errors.message }}
                </span>

                <button
                    @click="handleSubmit"
                    :disabled="isLoading"
                    type="button"
                    class="w-full px-6 py-3.5 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    :class="
                        isLoading
                            ? 'bg-[#606e83] text-white cursor-not-allowed'
                            : 'bg-[#1E293B] hover:bg-[#0F172A] text-white'
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

                <div class="text-center pt-2">
                    <button
                        @click="handleBackToLogin"
                        type="button"
                        class="text-sm text-gray-900 font-medium hover:underline">
                        Back to Sign in
                    </button>
                </div>
            </div>

            <div v-else class="space-y-4 text-center">
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
        border-radius: 1rem;
    }

    .citizen-forgot-password-modal .p-dialog-header {
        border: none;
    }

    .citizen-forgot-password-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
