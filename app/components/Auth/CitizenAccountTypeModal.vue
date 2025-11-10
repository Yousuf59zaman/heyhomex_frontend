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
        "login-success":[needsOnboarding: boolean]
        next: [accountType: string]
        back: []
        close: []
    }>()

    const selectedAccountType = ref("buyer")

    const handleBack = () => {
        emit("back")
    }

    const selectAccountType = (type: string) => {
        selectedAccountType.value = type
    }

    const handleNext = async () => {
         
    if (props.source === "sso" && props.ssoData) {
        loading.value = true
        validations_errors.value = ""
        console.log('coming sso data' , props.ssoData);
        const first_name = props.ssoData.first_name;
        const social_media_id = props.ssoData.social_media_id
        const last_name = props.ssoData.last_name
       
        try {
            const response: any = await $fetchCitizen("/admin/login", {
                method: 'POST',
                body: { social_media_id , first_name , last_name},
            });
            
            if (response?.status && response?.data) {
                const userData = response.data
                if (import.meta.client) {
                    const tokenCookie = useCookie("XCMS-TOKEN")
                    tokenCookie.value = userData.token
                    
                    localStorage.setItem("citizen_user_data", JSON.stringify(userData))
                    localStorage.setItem("citizen_user_id", userData.id.toString())
                    
                    const onboardingStatusKey = `citizen_onboard_status_${userData.id}`
                    if (userData.user_onboard_profile_status !== undefined) {
                        localStorage.setItem(
                            onboardingStatusKey,
                            userData.user_onboard_profile_status.toString()
                        )
                    }
                }
                const needsOnboarding = userData.user_onboard_profile_status === 0
                if (!needsOnboarding && userData.user_type?.[0]?.slug) {
                    const redirectSlug = userData.user_type[0].slug
                    const targetPath = redirectSlug === "kamaaina" ? "/kamaina/" : `/${redirectSlug}/`
                    navigateTo(targetPath)
                } else {
                    emit("login-success", needsOnboarding)
                }
            }
        } catch (error: any) {
            console.error(`${props.ssoData} login error:`, error)
            validations_errors.value = error?.message || error?.data?.errors || `Failed to sign in with ${props.ssoData}. Please try again.`
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
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-account-type-modal"
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
                        Select account type
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-6">
         
            <div class="grid grid-cols-3 gap-3">
                
                <button
                    @click="selectAccountType('buyer')"
                    type="button"
                    :class="[
                        'px-4 py-3.5 rounded-lg font-medium transition-all duration-200',
                        selectedAccountType === 'buyer'
                            ? 'bg-[#1E293B] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
                    ]">
                    I am a Buyer
                </button>

               
                <button
                    @click="selectAccountType('agent')"
                    type="button"
                    :class="[
                        'px-4 py-3.5 rounded-lg font-medium transition-all duration-200',
                        selectedAccountType === 'agent'
                            ? 'bg-[#1E293B] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
                    ]">
                    I am an Agent
                </button>

            
                <button
                    @click="selectAccountType('advertiser')"
                    type="button"
                    :class="[
                        'px-4 py-3.5 rounded-lg font-medium transition-all duration-200',
                        selectedAccountType === 'advertiser'
                            ? 'bg-[#1E293B] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
                    ]">
                    I am an Advertiser
                </button>
            </div>

         
            <button
                @click="handleNext"
                type="button"
                class="w-full px-6 py-3.5 bg-[#1E293B] hover:bg-[#0F172A] text-white font-medium rounded-lg transition-colors duration-200">
                Next
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
    .citizen-account-type-modal .p-dialog {
        border-radius: 1rem;
    }

    .citizen-account-type-modal .p-dialog-header {
        border: none;
    }

    .citizen-account-type-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
