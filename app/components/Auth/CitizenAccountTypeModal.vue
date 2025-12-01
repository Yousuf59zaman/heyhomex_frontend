<script setup lang="ts">
    const props = defineProps<{
        modelValue: boolean
        source?: string
        ssoData?: Record<string, any> | null
    }>()
    const visible = ref(props.modelValue)
    const loading = ref(false)
    const validations_errors = ref("")
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
        next: [accountType: any]
        back: []
        close: []
    }>()

    const selectedAccountType = ref(3)

    const handleBack = () => {
        emit("back")
    }

    const closeHandler = () => {
        emit("close")
    }

    const selectAccountType = (type: any) => {
        selectedAccountType.value = type
    }

    const handleNext = async () => {
        if (props.source === "sso" && props.ssoData) {
            loading.value = true
            validations_errors.value = ""

            const {first_name, last_name, social_media_id} = props.ssoData
            const role_id = selectedAccountType.value

            try {
                const response: any = await $fetchCitizen("/admin/login", {
                    method: "POST",
                    body: {social_media_id, first_name, last_name, role_id},
                })

                const userData = response?.data

                if (response?.status && userData) {
                    if (import.meta.client) {
                        const tokenCookie = useCookie("XCMS-TOKEN")
                        tokenCookie.value = userData.token
                        const userId = userData.id?.toString()
                        localStorage.setItem(
                            "citizen_user_data",
                            JSON.stringify(userData)
                        )
                        localStorage.setItem("citizen_user_id", userId)
                        const onboardingKey = `citizen_onboard_status_${userId}`
                        const onboardStatus =
                            userData.user_onboard_profile_status ?? null
                        if (onboardStatus !== null) {
                            localStorage.setItem(
                                onboardingKey,
                                onboardStatus.toString()
                            )
                        }
                    }
                    const needsOnboarding =
                        userData.user_onboard_profile_status === 0
                    const userSlug = userData.user_type?.[0]?.slug

                    if (!needsOnboarding && userSlug) {
                        const redirectMap: Record<string, string> = {
                            kamaaina: "/kamaina/",
                        }
                        navigateTo(redirectMap[userSlug] || `/${userSlug}/`)
                    } else {
                        emit("login-success", needsOnboarding)
                    }
                }
            } catch (error: any) {
                console.error("SSO login error:", error)

                validations_errors.value =
                    error?.data?.errors ||
                    error?.message ||
                    `Failed to sign in with ${
                        props.ssoData?.provider || "SSO"
                    }. Please try again.`
            } finally {
                loading.value = false
            }
        } else {
            emit("next", selectedAccountType.value)
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
        class="citizen-account-type-modal"
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
                    class="w-14 h-14 flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-2xl rounded-tr-xl transition-all duration-300 focus:outline-none">
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

                    <h2 class="text-2xl md:text-3xl lg:text-4xl leading-tight font-medium text-[#121A22]">
                        Select account type
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pt-8 pb-6 space-y-10">
            <div class="grid grid-cols-3 gap-5">
                <button
                    @click="selectAccountType(3)"
                    type="button"
                    :class="[
                        'h-23 px-5 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all duration-200',
                        selectedAccountType === 3
                            ? 'bg-[#18222c] text-white'
                            : 'bg-white text-[#18222c] border border-[#cfdbe8] hover:bg-gray-50',
                    ]">
                    I am a Buyer
                </button>

                <button
                    @click="selectAccountType(2)"
                    type="button"
                    :class="[
                        'h-23 px-5 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all duration-200',
                        selectedAccountType === 2
                            ? 'bg-[#18222c] text-white'
                            : 'bg-white text-[#18222c] border border-[#cfdbe8] hover:bg-gray-50',
                    ]">
                    I am an Agent
                </button>

                <button
                    @click="selectAccountType(1)"
                    type="button"
                    :class="[
                        'h-23 px-5 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all duration-200',
                        selectedAccountType === 1
                            ? 'bg-[#18222c] text-white'
                            : 'bg-white text-[#18222c] border border-[#cfdbe8] hover:bg-gray-50',
                    ]">
                    I am an Advertiser
                </button>
            </div>

            <button
                @click="handleNext"
                type="button"
                class="w-full h-13 px-6 bg-[#18222c] hover:bg-[#101822] text-white font-bold rounded-xl transition-colors duration-200">
                Next
            </button>

            <div class="text-center">
                <p class="text-base font-medium text-[#121A22]">
                    By using heyhomex, you agree to the
                    <a
                        href="/terms"
                        class="text-[#121A22] font-bold hover:underline"
                        >Terms</a
                    >
                    and
                    <a
                        href="/privacy"
                        class="text-[#121A22] font-bold hover:underline"
                        >Privacy Policy</a
                    >.
                </p>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-account-type-modal .p-dialog {
        border-radius: 10px;
    }

    .citizen-account-type-modal .p-dialog-header {
        border: none;
    }

    .citizen-account-type-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
