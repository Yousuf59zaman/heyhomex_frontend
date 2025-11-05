<script setup lang="ts">
    import {LockClosedIcon, UserIcon} from "@heroicons/vue/24/outline"

    const props = defineProps<{
        modelValue: boolean
    }>()

    const emit = defineEmits<{
        "update:modelValue": [value: boolean]
        "login-success": [needsOnboarding: boolean]
        "show-register": []
        back: []
        close: []
    }>()

    interface LoginFormData {
        email: string
        password: string
    }

    interface UserType {
        id: number
        name: string
        slug: string
    }

    interface LoginResponse {
        status: boolean
        message: string
        data: {
            id: number
            name: string
            email: string
            token: string
            user_onboard_profile_status?: number
            user_type?: UserType[]
            [key: string]: any
        }
    }

    const visible = computed({
        get: () => props.modelValue,
        set: (value: boolean) => {
            emit("update:modelValue", value)
            if (!value) {
                emit("close")
            }
        },
    })

    const loading = ref(false)
    const password_open = ref(false)

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
    }

    const password_view_status = (status: boolean) => {
        password_open.value = status
    }

    const handleLogin = async () => {
        loading.value = true

        try {
            const payload = new FormData()
            payload.append("login_id", formData.email)
            payload.append("password", formData.password)

            const response = await $fetchCMS<LoginResponse>("/admin/login", {
                method: "POST",
                body: payload,
            })

            if (response.status && response.data) {
                const userData = response.data

                if (import.meta.client) {
                    const tokenCookie = useCookie("XCMS-TOKEN")
                    tokenCookie.value = userData.token

                    localStorage.setItem(
                        "citizen_user_data",
                        JSON.stringify(userData)
                    )

                    localStorage.setItem(
                        "citizen_user_id",
                        userData.id.toString()
                    )

                    const onboardingStatusKey = `citizen_onboard_status_${userData.id}`

                    if (userData.user_onboard_profile_status !== undefined) {
                        localStorage.setItem(
                            onboardingStatusKey,
                            userData.user_onboard_profile_status.toString()
                        )
                    }

                    localStorage.removeItem(
                        "citizen_user_onboard_profile_status"
                    )
                    localStorage.removeItem("citizen_needs_onboarding")
                }

                const needsOnboarding =
                    userData.user_onboard_profile_status === 0

                if (import.meta.client) {
                }

                if (!needsOnboarding && userData.user_type?.[0]?.slug) {
                    const redirectSlug = userData.user_type[0].slug
                    const targetPath =
                        redirectSlug === "kamaaina"
                            ? "/kamaina/"
                            : `/${redirectSlug}/`
                    navigateTo(targetPath)
                } else {
                    emit("login-success", needsOnboarding)
                }
            }
        } catch (error: any) {
            console.error("Login error:", error)

            if (import.meta.client) {
                const errorMessage =
                    error?.data?.message ||
                    "Login failed. Please check your credentials and try again."
                alert(errorMessage)
            }
        } finally {
            loading.value = false
        }
    }

    const showRegister = () => {
        closeModal()
        setTimeout(() => {
            emit("show-register")
        }, 300)
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
        :style="{width: 'min(45rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl m-4',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div
                class="w-full text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
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
        <div class="px-4 sm:px-6 pb-6">
            <form
                @submit.prevent="handleLogin"
                class="space-y-4">
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
                            autocomplete="username"
                            :pt="{
                                root: 'w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                            }" />
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
                            :pt="{
                                root: 'w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                            }" />
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
                        class="text-blue-600 hover:text-blue-700 font-medium">
                        Forgot password?
                    </button>
                </div>

                <Button
                    type="submit"
                    :disabled="loading"
                    :loading="loading"
                    loadingIcon="pi pi-spin pi-spinner"
                    class="w-full"
                    :pt="{
                        root: 'w-full mb-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                    }">
                    {{ loading ? "Signing In..." : "Sign In" }}
                </Button>

                <div class="text-center">
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
    .citizen-login-modal .p-dialog {
        border-radius: 1rem;
    }

    .citizen-login-modal .p-dialog-header {
        border: none;
        padding-bottom: 0;
    }

    .citizen-login-modal .p-dialog-content {
        border: none;
        padding-top: 0;
        padding-bottom: 1.5rem;
    }
</style>
