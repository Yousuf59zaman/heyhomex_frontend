<script setup lang="ts">
    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'password-changed': []
        'back': []
        'close': []
    }>()

    interface Props {
        modelValue: boolean
        email: string
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

    interface ChangePasswordFormData {
        password: string
        password_confirmation: string
    }

    const isLoading = ref<boolean>(false)
    const validationErrors = ref<Record<string, string>>({})
    const showPassword = ref<boolean>(false)
    const showConfirmPassword = ref<boolean>(false)

    const formData = reactive<ChangePasswordFormData>({
        password: "",
        password_confirmation: "",
    })

    // Password validation computeds (same as CitizenRegisterModal)
    const hasMinimumLength = computed(() => {
        return formData.password.length >= 8
    })

    const hasSymbol = computed(() => {
        const symbolRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
        return symbolRegex.test(formData.password)
    })

    const hasCapitalLetter = computed(() => {
        const capitalRegex = /[A-Z]/
        return capitalRegex.test(formData.password)
    })

    const passwordsMatch = computed(() => {
        if (!formData.password || !formData.password_confirmation) {
            return false
        }
        return formData.password === formData.password_confirmation
    })

    const allPasswordValidationsPassed = computed(() => {
        return hasMinimumLength.value &&
               hasSymbol.value &&
               hasCapitalLetter.value &&
               passwordsMatch.value
    })

    const handleBack = (): void => {
        emit("back")
    }

    const handleSubmit = async (): Promise<void> => {
        validationErrors.value = {}

        if (!allPasswordValidationsPassed.value) {
            validationErrors.value.password = "Please meet all password requirements"
            return
        }

        try {
            isLoading.value = true

            const response: any = await $fetchCMS(`/forget-password/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    email: props.email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                },
            })

            if (response?.status === "success") {
                emit("password-changed")
            } else {
                validationErrors.value.message =
                    response?.message ||
                    "Unable to reset password. Please try again."
            }
        } catch (e: any) {
            console.log(
                "Change Password Error:",
                e instanceof Error ? e.message : String(e)
            )
            const status = e?.response?.status
            if (status === 422 || status === 409) {
                const errorsData = e.response?._data?.data || {}
                for (const key in errorsData) {
                    if (errorsData.hasOwnProperty(key)) {
                        validationErrors.value[key] = errorsData[key][0]
                    }
                }
            } else {
                validationErrors.value.message =
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
        class="citizen-change-password-modal"
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
                        Create New Password
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-4">
            <p class="text-sm text-gray-600 text-center">
                Please create a new password for your account. Make sure it meets all the requirements below.
            </p>

            <!-- Password Field -->
            <div class="flex flex-col gap-2">
                <label
                    for="password"
                    class="text-sm font-medium text-gray-700"
                    >New Password</label
                >
                <div class="relative">
                    <InputText
                        id="password"
                        v-model="formData.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Enter your new password"
                        :pt="{
                            root: 'w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                    <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        <svg
                            v-if="!showPassword"
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg
                            v-else
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="flex flex-col gap-2">
                <label
                    for="confirm-password"
                    class="text-sm font-medium text-gray-700"
                    >Confirm New Password</label
                >
                <div class="relative">
                    <InputText
                        id="confirm-password"
                        v-model="formData.password_confirmation"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        placeholder="Confirm your new password"
                        @keyup.enter="handleSubmit"
                        :pt="{
                            root: 'w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                    <button
                        type="button"
                        @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        <svg
                            v-if="!showConfirmPassword"
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg
                            v-else
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Password Requirements -->
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <p class="text-xs font-medium text-gray-700">Password must contain:</p>
                <div class="space-y-1">
                    <div class="flex items-center gap-2 text-xs">
                        <svg
                            class="w-4 h-4"
                            :class="hasMinimumLength ? 'text-green-600' : 'text-gray-400'"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span :class="hasMinimumLength ? 'text-green-600' : 'text-gray-600'"
                            >At least 8 characters</span
                        >
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                        <svg
                            class="w-4 h-4"
                            :class="hasCapitalLetter ? 'text-green-600' : 'text-gray-400'"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span :class="hasCapitalLetter ? 'text-green-600' : 'text-gray-600'"
                            >One capital letter</span
                        >
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                        <svg
                            class="w-4 h-4"
                            :class="hasSymbol ? 'text-green-600' : 'text-gray-400'"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span :class="hasSymbol ? 'text-green-600' : 'text-gray-600'"
                            >One symbol (!@#$%^&*)</span
                        >
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                        <svg
                            class="w-4 h-4"
                            :class="passwordsMatch ? 'text-green-600' : 'text-gray-400'"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span :class="passwordsMatch ? 'text-green-600' : 'text-gray-600'"
                            >Passwords match</span
                        >
                    </div>
                </div>
            </div>

            <span
                v-if="validationErrors.password"
                class="text-xs text-red-500 block">
                {{ validationErrors.password }}
            </span>

            <span
                v-if="validationErrors.message"
                class="text-xs text-red-500 block text-center">
                {{ validationErrors.message }}
            </span>

            <button
                @click="handleSubmit"
                :disabled="isLoading || !allPasswordValidationsPassed"
                type="button"
                class="w-full px-6 py-3.5 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                :class="
                    isLoading || !allPasswordValidationsPassed
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
                {{ isLoading ? "Resetting Password..." : "Reset Password" }}
            </button>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-change-password-modal .p-dialog {
        border-radius: 1rem;
    }

    .citizen-change-password-modal .p-dialog-header {
        border: none;
    }

    .citizen-change-password-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
