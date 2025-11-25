<script setup lang="ts">
    import {LockClosedIcon, UserIcon} from "@heroicons/vue/24/outline"
    const {login, googleLogin, facebookLogin, appleLogin} = citizenAuth()

    const props = defineProps<{modelValue: boolean}>()
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

    const emit = defineEmits<{
        "update:modelValue": [value: boolean]
        "login-success": [needsOnboarding: boolean]
        "show-register": []
        "show-forgot-password": []
        "show-account-type": [data: any]
        back: []
        close: []
    }>()

    interface LoginFormData {
        email: string
        password: string
    }

    const loading = ref(false)
    const isFacebookLoadingSSO = ref(false)
    const isAppleLoadingSSO = ref(false)
    const isGoogleLoadingSSO = ref(false)

    const password_open = ref(false)
    // const errorMessage = ref("")
    const validations_errors = ref("")

    const formData = reactive<LoginFormData>({
        email: "",
        password: "",
    })

    const closeModal = () => {
        emit("update:modelValue", false)
        emit("close")
        setTimeout(() => {
            resetForm()
        }, 300)
    }

    const resetForm = () => {
        formData.email = ""
        formData.password = ""
        password_open.value = false
        validations_errors.value = ""
    }

    const password_view_status = (status: boolean) => {
        password_open.value = status
    }

    const handleLogin = async () => {
        loading.value = true
        validations_errors.value = ""

        try {
            const payload = new FormData()
            payload.append("login_id", formData.email)
            payload.append("password", formData.password)

            const response: any = await login(payload)
            responseFormat(response)
        } catch (error: any) {
            console.error("Login error:", error)
            validations_errors.value =
                error.response?._data?.message ||
                error.message ||
                "Login failed. Please check your credentials and try again."
        } finally {
            loading.value = false
        }
    }

    const showRegister = () => {
        emit("show-register")
    }

    const showForgotPassword = () => {
        emit("show-forgot-password")
    }

    const responseFormat = (response: any) => {
        if (response?.status && response?.data) {
            const userData = response.data

            if (import.meta.client) {
                const tokenCookie = useCookie("XCMS-TOKEN")
                tokenCookie.value = userData.token

                localStorage.setItem(
                    "citizen_user_data",
                    JSON.stringify(userData)
                )
                localStorage.setItem("citizen_user_id", userData.id.toString())

                const onboardingStatusKey = `citizen_onboard_status_${userData.id}`
                if (userData.user_onboard_profile_status !== undefined) {
                    localStorage.setItem(
                        onboardingStatusKey,
                        userData.user_onboard_profile_status.toString()
                    )
                }

                localStorage.removeItem("citizen_user_onboard_profile_status")
                localStorage.removeItem("citizen_needs_onboarding")
            }

            const needsOnboarding = userData.user_onboard_profile_status === 0

            // Check for user role (agent, advisor) first
            if (userData.user_role) {
                const roleRouteMap: Record<string, string> = {
                    'agent': '/agent/',
                    'advisor': '/advisor/'
                }
                
                const targetPath = roleRouteMap[userData.user_role]
                if (targetPath) {
                    window.location.href = targetPath
                    return
                }
            }

            // Then check for citizen user type
            if (!needsOnboarding && userData.user_type?.[0]?.slug) {
                const redirectSlug = userData.user_type[0].slug
                const targetPath =
                    redirectSlug === "kamaaina"
                        ? "/kamaina/"
                        : `/${redirectSlug}/`
                window.location.href = targetPath
            } else {
                emit("login-success", needsOnboarding)
            }
        } else {
            validations_errors.value =
                response?.message ||
                "Login failed. Please check your credentials and try again."
        }
    }

    const handleGoogleLogin = async (): Promise<void> => {
        isGoogleLoadingSSO.value = true
        validations_errors.value = ""
        try {
            const response = await googleLogin()
            if (!response) {
                throw new Error("No response from Google login.")
            }
            const {status, data, ssoData} = response
            if (status && data) {
                if (data.user_role) {
                    responseFormat(response)
                } else {
                    emit("show-account-type", ssoData)
                }
            } else {
                throw new Error("Invalid Google login response.")
            }
        } catch (error: any) {
            validations_errors.value =
                error?.message ||
                error?.data?.errors ||
                "Failed to sign in with Google. Please try again."
        } finally {
            isGoogleLoadingSSO.value = false
        }
    }

    const handleFacebookLogin = async (): Promise<void> => {
        isFacebookLoadingSSO.value = true
        validations_errors.value = ""
        try {
            const response = await facebookLogin()
            if (!response) {
                throw new Error("No response from Google login.")
            }
            const {status, data, ssoData} = response
            if (status && data) {
                if (data.user_role) {
                    responseFormat(response)
                } else {
                    emit("show-account-type", ssoData)
                }
            } else {
                throw new Error("Invalid Facebook login response.")
            }
        } catch (error: any) {
            console.error("Facebook login error:", error)
            validations_errors.value =
                error?.message ||
                error?.data?.errors ||
                "Failed to sign in with Facebook. Please try again."
        } finally {
            isFacebookLoadingSSO.value = false
        }
    }

    const handleAppleLogin = async (): Promise<void> => {
        isAppleLoadingSSO.value = true
        validations_errors.value = ""
        try {
            const response = await appleLogin()
            if (!response) {
                throw new Error("No response from Google login.")
            }
            const {status, data, ssoData} = response
            if (status && data) {
                if (data.user_role) {
                    responseFormat(response)
                } else {
                    emit("show-account-type", ssoData)
                }
            } else {
                throw new Error("Invalid Apple login response structure.")
            }
        } catch (error: any) {
            console.error("Apple login error:", error)
            validations_errors.value =
                error?.message ||
                error?.data?.errors ||
                "Failed to sign in with Apple. Please try again."
        } finally {
            isAppleLoadingSSO.value = false
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
        class="citizen-login-modal"
        :style="{width: 'min(32rem, 95vw)', maxWidth: '95vw'}">
        <template #header>
            <div
                class="w-full text-center px-4 sm:px-6 pt-6 sm:pt-4 pb-4 sm:pb-6">
                <h1
                    class="text-2xl sm:text-3xl font-semibold text-[#121A22] mb-2 leading-tight">
                    Welcome Back! 👋
                </h1>
                <p class="text-sm text-[#121A22]">
                    Sign in to continue your home journey
                </p>
            </div>
        </template>

        <!-- Content -->
        <div class="px-4 sm:px-6">
            <form
                @submit.prevent="handleLogin"
                class="space-y-4"
                autocomplete="off">
                <div class="flex flex-col gap-2">
                    <label
                        for="email"
                        class="text-sm font-medium text-gray-700"
                        >Email Address</label
                    >
                    <div class="relative">
                        <UserIcon
                            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <InputText
                            id="email"
                            v-model="formData.email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            autocomplete="off"
                            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label
                        for="password"
                        class="text-sm font-medium text-gray-700"
                        >Password</label
                    >
                    <div class="relative">
                        <LockClosedIcon
                            class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <InputText
                            id="password"
                            v-model="formData.password"
                            :type="password_open ? 'text' : 'password'"
                            placeholder="Enter your password"
                            required
                            autocomplete="current-password"
                            class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        <button
                            type="button"
                            @click="password_view_status(!password_open)"
                            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            :aria-pressed="password_open"
                            aria-label="Toggle password visibility">
                            <i
                                :class="[
                                    'fa text-lg',
                                    password_open ? 'fa-eye' : 'fa-eye-slash',
                                ]"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center">
                        <input
                            type="checkbox"
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span class="ml-2 text-gray-600">Remember me</span>
                    </label>
                    <button
                        type="button"
                        @click="showForgotPassword"
                        class="text-blue-600 hover:text-blue-700 font-medium">
                        Forgot password?
                    </button>
                </div>

                <!-- Error Message -->
                <div
                    v-if="validations_errors"
                    class="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <i class="pi pi-exclamation-circle text-red-600 mt-0.5"></i>
                    <p class="text-sm text-red-800">{{ validations_errors }}</p>
                </div>

                <Button
                    type="submit"
                    :disabled="loading"
                    :loading="loading"
                    loadingIcon="pi pi-spin pi-spinner"
                    class="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                    {{ loading ? "Signing In..." : "Sign In" }}
                </Button>

                <div class="relative flex items-center justify-center">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative px-4 bg-white">
                        <span class="text-sm text-gray-500"
                            >or continue with</span
                        >
                    </div>
                </div>

                <div class="grid grid-cols-3 mb-3 gap-3">
                    <button
                        @click="handleAppleLogin"
                        type="button"
                        :disabled="isAppleLoadingSSO"
                        class="px-2 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium border border-gray-300 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg
                            v-if="!isAppleLoadingSSO"
                            class="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="currentColor">
                            <path
                                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        <span class="text-sm ml-2">Apple</span>
                        <span
                            v-if="isAppleLoadingSSO"
                            class="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span>
                    </button>

                    <button
                        @click="handleFacebookLogin"
                        type="button"
                        :disabled="isFacebookLoadingSSO"
                        class="px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium border border-gray-300 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg
                            v-if="!isFacebookLoadingSSO"
                            class="w-5 h-5 text-[#1877F2]"
                            viewBox="0 0 24 24"
                            fill="currentColor">
                            <path
                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span class="text-sm ml-2">Facebook</span>
                        <span
                            v-if="isFacebookLoadingSSO"
                            class="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span>
                    </button>

                    <button
                        @click="handleGoogleLogin"
                        type="button"
                        :disabled="loading || isGoogleLoadingSSO"
                        class="px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium border border-gray-300 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg
                            v-if="!isGoogleLoadingSSO"
                            class="w-5 h-5"
                            viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span class="text-sm ml-2">Google</span>
                        <span
                            v-if="isGoogleLoadingSSO"
                            class="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span>
                    </button>
                </div>

                <div class="text-center pt-2">
                    <p class="text-sm text-gray-600">
                        Don't have an account?
                        <button
                            type="button"
                            @click="showRegister"
                            class="text-blue-600 hover:text-blue-700 font-medium">
                            Create Account
                        </button>
                    </p>
                </div>
            </form>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-login-modal :deep(.p-dialog) {
        border: 0;
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        margin: 1rem;
    }

    .citizen-login-modal :deep(.p-dialog-header) {
        border: none;
        padding-bottom: 0;
    }

    .citizen-login-modal :deep(.p-dialog-content) {
        border: none;
        padding-top: 0;
        padding-bottom: 1.5rem;
    }

    .citizen-login-modal :deep(.p-dialog-header-close) {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem;
        transition: background-color 0.2s;
    }

    .citizen-login-modal :deep(.p-dialog-header-close:hover) {
        background-color: #f3f4f6;
        border-radius: 0.125rem;
    }
</style>
