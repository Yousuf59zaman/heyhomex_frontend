<script setup lang="ts">
    const {login, googleLogin, facebookLogin, appleLogin, citizen_user} =
        citizenAuth()

    const closeHandler = () => {
        emit("close")
    }

    const props = defineProps<{
        modelValue: boolean
        preselectedAccountType?: number | null
    }>()
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
            citizen_user.value = needsOnboarding ? null : response

            // Check for user role (agent, advertiser) first
            if (userData.user_role) {
                const roleRouteMap: Record<string, string> = {
                    agent: "/agent/",
                    advertiser: "/advertiser/",
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
                    const enrichedSsoData = props.preselectedAccountType 
                        ? { ...ssoData, preselectedAccountType: props.preselectedAccountType }
                        : ssoData
                    emit("show-account-type", enrichedSsoData)
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
                    const enrichedSsoData = props.preselectedAccountType 
                        ? { ...ssoData, preselectedAccountType: props.preselectedAccountType }
                        : ssoData
                    emit("show-account-type", enrichedSsoData)
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
                    const enrichedSsoData = props.preselectedAccountType 
                        ? { ...ssoData, preselectedAccountType: props.preselectedAccountType }
                        : ssoData
                    emit("show-account-type", enrichedSsoData)
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
        :closable="false"
        :draggable="false"
        :resizable="false"
        class="citizen-login-modal"
        :style="{width: '45rem', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4 bg-white overflow-hidden',
            header: 'border-0 p-0 bg-white',
            content: 'border-0 p-0 bg-white',
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
              <div class="w-full text-center px-4 sm:px-6 pt-8 md:pt-9 pb-1">
                  <h1 class="text-[1.75rem] sm:text-3xl lg:text-[32px] leading-snug lg:leading-[40px] font-[510] text-[#121A22] font-['sf-pro-Regular']">
                      Welcome back! Let's get you
                      <br />
                      signed in.
                  </h1>
              </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-10 pt-6">
            <form @submit.prevent="handleLogin" class="flex flex-col gap-6" autocomplete="off">
                <div class="flex flex-col gap-2">
                    <label
                        for="email"
                        class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]"
                        >Email Address</label
                    >
                    <LazyInputText
                        id="email"
                        v-model="formData.email"
                        type="email"
                        placeholder="Enter your email address"
                        required
                        autocomplete="off"
                        class="w-full px-4 h-14 border border-[#CFDBE8] rounded-lg text-base leading-6 font-normal text-[#566573] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>

                <div class="flex flex-col gap-2">
                    <label
                        for="password"
                        class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]"
                        >Password</label
                    >
                    <div class="relative">
                        <LazyInputText
                            id="password"
                            v-model="formData.password"
                            :type="password_open ? 'text' : 'password'"
                            placeholder="Enter your password"
                            required
                            autocomplete="current-password"
                            class="w-full px-4 h-14 border border-[#CFDBE8] rounded-lg text-base leading-6 font-normal text-[#566573] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
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
                    <div class="text-left pt-3 pb-4">
                        <button
                            type="button"
                            @click="showForgotPassword"
                            class="text-base leading-6 text-[#121A22] font-bold font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] hover:text-gray-700">
                            Forgot password?
                        </button>
                    </div>
                </div>

                <!-- Error Message -->
                <div
                    v-if="validations_errors"
                    class="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg flex items-center justify-between gap-2">
                    <p class="text-sm text-[#DC2626]">{{ validations_errors }}</p>
                    <button
                        type="button"
                        @click="validations_errors = ''"
                        class="text-[#DC2626] hover:text-red-800 flex-shrink-0">
                        <i class="pi pi-times text-sm"></i>
                    </button>
                </div>

                <button
                    type="submit"
                    :disabled="loading"
                    :loading="loading"
                    loadingIcon="pi pi-spin pi-spinner"
                    class="w-full px-5 py-3.5 h-[3.25rem] bg-[#18222C] hover:bg-[#0F172A] disabled:bg-gray-400 text-white font-bold text-base leading-6 rounded-[12px] transition-colors duration-200 flex items-center justify-center">
                    {{ loading ? "Signing In..." : "Continue" }}
                </button>

                <div class="relative flex items-center justify-center">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative px-4 bg-white">
                        <span class="text-base text-gray-500"
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
                                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l-.01.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
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

                <div class="text-center">
                    <p class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on]">
                        New to heyhomex?
                        <button
                            type="button"
                            @click="showRegister"
                            class="text-base leading-6 text-[#121A22] font-bold font-['sf-pro-Regular'] [font-feature-settings:'dlig'_on] hover:text-gray-700">
                            Create account
                        </button>
                    </p>
                </div>
            </form>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-login-modal :deep(.p-dialog) {
        border-radius: 0.625rem;
        border: 0;
        box-shadow: 0 1.5625rem 3.125rem -0.75rem rgba(0, 0, 0, 0.25);
        margin: 1rem;
    }

    .citizen-login-modal :deep(.p-dialog-header) {
        border: none;
        padding: 0;
    }

    .citizen-login-modal :deep(.p-dialog-content) {
        border: none;
        padding: 0;
    }
</style>
