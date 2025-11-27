<script setup lang="ts">
    interface Props {
        modelValue: boolean
    }
    const { googleLogin, facebookLogin , appleLogin } = citizenAuth()
    const props = defineProps<Props>()
    const visible = ref<boolean>(props.modelValue)
    const isLoading = ref<boolean>(false)
    const isFacebookLoadingSSO = ref(false)
    const isAppleLoadingSSO = ref(false)
    const isGoogleLoadingSSO = ref(false)
    const unauthorizedError = ref<string>("")
    
    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'go-to-email': []
        'show-login': []
        'show-account-type': [data: any]
        'login-success': [needsOnboarding: boolean]
        'back': []
        'close': []
    }>()
    
    //modelValue jodi true hoe
    watch(
        () => props.modelValue,
        (newVal: boolean): void => {
            visible.value = newVal
        }
    )
    //visible jodi false hoe
    watch(visible, (newVal: boolean): void => {
        emit("update:modelValue", newVal)
        if (!newVal) emit("close")
    })

    const handleBack = (): void => {
        emit("back")
    }

    const handleContinueWithEmail = (): void => {
        emit("go-to-email")
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

            if (!needsOnboarding && userData.user_type?.[0]?.slug) {
                const redirectSlug = userData.user_type[0].slug
                const targetPath =
                    redirectSlug === "kamaaina"
                        ? "/kamaina/"
                        : `/${redirectSlug}/`
                window.location.href = targetPath;
            } else {
                emit("login-success", needsOnboarding)
            }
        } else {
            unauthorizedError.value =
                response?.message ||
                "Login failed. Please try again."
        }
    }

    const closeHandler = () => {
        emit("close")
    }

    const handleContinueWithApple = async (): Promise<void> => {
        isAppleLoadingSSO.value = true
        unauthorizedError.value = ""
        try {
            const response = await appleLogin()
            if (!response) {
                throw new Error("No response from Apple login.")
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
            console.error('Apple login error:', error)
            unauthorizedError.value =
                error?.message ||
                error?.data?.errors ||
                "Failed to sign in with Apple. Please try again."
        } finally {
            isAppleLoadingSSO.value = false
        }
    }

    const handleContinueWithFacebook = async (): Promise<void> => {
        isFacebookLoadingSSO.value = true
        unauthorizedError.value = ""
        try {
            const response = await facebookLogin()
            if (!response) {
                throw new Error("No response from Facebook login.")
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
            console.error('Facebook login error:', error)
            unauthorizedError.value =
                error?.message ||
                error?.data?.errors ||
                "Failed to sign in with Facebook. Please try again."
        } finally {
            isFacebookLoadingSSO.value = false
        }
    }

    const handleContinueWithGoogle = async (): Promise<void> => {
        isGoogleLoadingSSO.value = true
        unauthorizedError.value = ""
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
            console.error('Google login error:', error)
            unauthorizedError.value =
                error?.message ||
                error?.data?.errors ||
                "Failed to sign in with Google. Please try again."
        } finally {
            isGoogleLoadingSSO.value = false
        }
    }
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :draggable="false"
        :resizable="false"
        class="citizen-get-started-modal"
        :style="{width: 'min(45rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-[10px] shadow-2xl m-4',
            header: 'border-0 p-0',
            content: 'border-0 p-0',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200',
        }">
        <template #header>
            <div class="absolute right-[0px] top-[0] z-50">
                <button
                    @click="closeHandler"
                    class="w-[40px] h-[47px] flex items-center justify-center bg-black/50 text-white cursor-pointer rounded-bl-[15px] rounded-tr-[15px] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-xl"></i>
                </button>
            </div>
            <div class="w-full px-6 pt-8 pb-10">
                <div class="relative mx-auto flex w-full max-w-[672px] items-center justify-center">
                    <button
                        @click="handleBack"
                        type="button"
                        class="absolute left-0 flex h-6 w-6 items-center justify-center text-[#121A22]"
                        aria-label="Go back">
                        <svg
                            class="h-6 w-6"
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

                    <h2 class="text-[32px] leading-[40px] font-medium text-[#121A22]">
                        Create account
                    </h2>
                    <div aria-hidden="true" class="absolute right-0 h-6 w-6"></div>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-8">
            <div class="mx-auto flex w-full max-w-[676px] flex-col gap-12">
                <!-- Error Message -->
                <div
                    v-if="unauthorizedError"
                    class="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p class="text-sm text-red-600">{{ unauthorizedError }}</p>
                </div>

                <div class="flex flex-col gap-[10px]">
                    <button
                        @click="handleContinueWithEmail"
                        type="button"
                        :disabled="isLoading"
                        class="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#18222c] px-5 text-base font-bold leading-6 text-white transition-colors duration-200 hover:bg-[#111822] disabled:cursor-not-allowed disabled:opacity-50">
                        Continue with email
                    </button>

                    <div class="flex items-center justify-center">
                        <span class="text-base font-medium leading-6 text-[#121a22]">
                            or
                        </span>
                    </div>

                    <button
                        @click="handleContinueWithApple"
                        type="button"
                        :disabled="isAppleLoadingSSO"
                        class="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#cfdbe8] bg-white px-5 text-base font-bold leading-6 text-[#18222c] transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                        <svg
                            v-if="!isAppleLoadingSSO"
                            class="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="currentColor">
                            <path
                                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        <span
                            v-else
                            class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></span>
                        Continue with Apple
                    </button>

                    <button
                        @click="handleContinueWithFacebook"
                        type="button"
                        :disabled="isFacebookLoadingSSO"
                        class="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#cfdbe8] bg-white px-5 text-base font-bold leading-6 text-[#18222c] transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                        <svg
                            v-if="!isFacebookLoadingSSO"
                            class="h-5 w-5 text-[#1877F2]"
                            viewBox="0 0 24 24"
                            fill="currentColor">
                            <path
                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span
                            v-else
                            class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></span>
                        Continue with Facebook
                    </button>

                    <button
                        @click="handleContinueWithGoogle"
                        type="button"
                        :disabled="isGoogleLoadingSSO"
                        class="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#cfdbe8] bg-white px-5 text-base font-bold leading-6 text-[#18222c] transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                        <svg
                            v-if="!isGoogleLoadingSSO"
                            class="h-5 w-5"
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
                        <span
                            v-else
                            class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></span>
                        Continue with Google
                    </button>
                </div>

                <div class="text-center">
                    <p class="text-[16px] leading-6 text-[#121a22]">
                        By using heyhomex, you agree to the
                        <a
                            href="/terms"
                            class="font-bold text-[#121a22] hover:underline">Terms</a>
                        and
                        <a
                            href="/privacy"
                            class="font-bold text-[#121a22] hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    </Dialog>
</template>
<style scoped>
    .citizen-get-started-modal .p-dialog {
        border-radius: 10px;
    }

    .citizen-get-started-modal .p-dialog-header {
        border: none;
    }

    .citizen-get-started-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
