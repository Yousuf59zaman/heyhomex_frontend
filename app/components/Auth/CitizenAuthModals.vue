<script setup lang="ts">
// import auth from '~~/server/api/auth';

    interface Props {
        isOpenStartModal: boolean
        initialStep?: number
    }
    const props = withDefaults(defineProps<Props>(), {
        initialStep: 0,
        isOpenStartModal: false,
    })
    const emit = defineEmits<{
        'update:isOpenStartModal': [value: boolean]
    }>()

    const activeIndex = ref<number>(0)
    const userEmail = ref<string>("")
    const accountType = ref<any>("")
    const needsOnboarding = ref<boolean>(false)
    const otpSource = ref<string>("")
    const typeSource = ref<string>("")
    const ssoData = ref({})
    const authType = ref<string>("")

    const isGetStartedVisible = ref(false)
    const isSendEmailVisible = ref(false)
    const isVerifyOtpVisible = ref(false)
    const isAccountTypeVisible = ref(false)
    const isRegisterVisible = ref(false)
    const isProfessionalVisible = ref(false)
    const isLoginVisible = ref(false)
    const isOnboardingVisible = ref(false)
    const isForgotPasswordVisible = ref(false)
    const isSuccessVisible = ref(false)
    const isChangePasswordVisible = ref(false)

    watch(
        () => props.isOpenStartModal,
        (newVal) => {
            if (newVal) {
                activeIndex.value = props.initialStep
            } else {
                activeIndex.value = 0
                userEmail.value = ""
                accountType.value = ""
                needsOnboarding.value = false
                otpSource.value = ""
            }
        }
    )

    watch(
        [() => props.isOpenStartModal, activeIndex],
        ([isOpen, index]) => {
            isGetStartedVisible.value = isOpen && index === 0
            isSendEmailVisible.value = isOpen && index === 1
            isVerifyOtpVisible.value = isOpen && index === 2
            isAccountTypeVisible.value = isOpen && index === 3
            isRegisterVisible.value = isOpen && index === 4
            isProfessionalVisible.value = isOpen && index === 5
            isLoginVisible.value = isOpen && index === 6
            isOnboardingVisible.value = isOpen && index === 7
            isForgotPasswordVisible.value = isOpen && index === 8
            isSuccessVisible.value = isOpen && index === 9
            isChangePasswordVisible.value = isOpen && index === 10
        },
        { immediate: true }
    )
    const closeJourney = () => {
        emit("update:isOpenStartModal", false)
    }

    const handleBack = () => {
        if (activeIndex.value > 0) {
            if (activeIndex.value === 6) {
                activeIndex.value = 0
            } else if (activeIndex.value === 4) {
                activeIndex.value = 3
            } else {
                activeIndex.value = activeIndex.value - 1
            }
        } else {
            closeJourney()
        }
    }

    const handleModalClose = () => {
        closeJourney()
    }

    const handleGoToEmail = () => {
        activeIndex.value = 1
    }

   const handleNextFromSendOtp = (email: string): void => {
        userEmail.value = email
        otpSource.value = "registration"
        activeIndex.value = 2
    }

    const handleNextFromForgetPasswaord = (email: string): void => {
        userEmail.value = email
        otpSource.value = "forgot-password"
        activeIndex.value = 2
    }

    const handleVerifyOtpSuccess = (): void => {
        typeSource.value = "otp"
        activeIndex.value = 3
    }
    const handleSsoSuccess = (data:any): void => {
        typeSource.value = "sso"
        console.log('check from test' , data)
        ssoData.value = data;
        activeIndex.value = 3
    }

    const handleAccountTypeNext = (type: any): void => {
        accountType.value = type
        activeIndex.value = 4
        
    }

    const handleRegisterSuccess = (data:any) => {
        activeIndex.value = 9 
        // if(accountType.value == 3){
        //    activeIndex.value = 9 
        // }
        // else{
        //     activeIndex.value = 5
        // }
    }

    const handleProfessionalNext = (data: any): void => {
        activeIndex.value = 9
    }

    const handleLoginSuccess = (needsOnboardingCheck: boolean): void => {
        needsOnboarding.value = needsOnboardingCheck
        // if (needsOnboardingCheck) {
        //     activeIndex.value = 7
        // } else {
        //     closeJourney()
        //     navigateTo("/kamaina/")
        // }
        if(authType.value === "sso"){
                if (needsOnboardingCheck && accountType.value == 3) {
                    activeIndex.value = 7
                } else{
                    activeIndex.value = 5
                }
        }
        else{
                if (needsOnboardingCheck && accountType.value == 3) {
                    activeIndex.value = 7
                } else if(needsOnboardingCheck && (accountType.value == 1 || accountType.value == 2)) {
                    activeIndex.value = 5
                }
                else{
                    activeIndex.value = 7
                }
        }
        // console.log('nneed onboarding' , needsOnboarding.value)
        // console.log('otp source dsd' , accountType.value)
        // if (needsOnboardingCheck && accountType.value == 3) {
        //     activeIndex.value = 7
        // } else if(needsOnboardingCheck && (accountType.value == 1 || accountType.value == 2)) {
        //     activeIndex.value = 5
        // }
        // else{
        //     activeIndex.value = 7
        // }
    }

    const handleAccountType = (data: any) => {
        console.log('calling account tyoe' , data)
        accountType.value = data;
    }
    const handleAuthType = (data: any) => {
        console.log('calling auth tyoe' , data)
        authType.value = data;
    }

    const handleOnboardingComplete = (data: any): void => {
        closeJourney()
        // navigateTo("/kamaina/")
    }

    const handleShowLoginFromGetStarted = () => {
        activeIndex.value = 6
    }

    const handleShowLoginFromRegister = () => {
        activeIndex.value = 6
    }

    const handleShowRegisterFromLogin = () => {
        activeIndex.value = 0
    }

    const handleShowForgotPasswordFromLogin = () => {
        activeIndex.value = 8
    }

    const handleBackToLoginFromForgotPassword = () => {
        activeIndex.value = 6
    }

    const handleVerifyForgotPasswordSuccess = () => {
        activeIndex.value = 10
    }

    const handleSuccessModalNext = () => {
        activeIndex.value = 6 
    }

    const handlePasswordChanged = ()=> {
        activeIndex.value =  9
    }
</script>

<template>
    <ClientOnly>
        <div>
            <AuthCitizenGetStartedModal
                v-if="isGetStartedVisible"
                v-model="isGetStartedVisible"
                @go-to-email="handleGoToEmail"
                @show-login="handleShowLoginFromGetStarted"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenSendEmailModal
                v-if="isSendEmailVisible"
                v-model="isSendEmailVisible"
                @next="handleNextFromSendOtp"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenVerifyOtpModal
                v-if="isVerifyOtpVisible"
                v-model="isVerifyOtpVisible"
                :email="userEmail"
                :source="otpSource"
                @verify-success="handleVerifyOtpSuccess"
                @verify-forgot-password-success="handleVerifyForgotPasswordSuccess"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenAccountTypeModal
                v-if="isAccountTypeVisible"
                v-model="isAccountTypeVisible"
                :source="typeSource"
                :ssoData="ssoData"
                @account-type="handleAccountType"
                @auth-type="handleAuthType"
                @login-success="handleLoginSuccess"
                @next="handleAccountTypeNext"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenRegisterModal
                v-if="isRegisterVisible"
                v-model="isRegisterVisible"
                :email="userEmail"
                :account-type="accountType"
                @register-success="handleRegisterSuccess"
                @show-login="handleShowLoginFromRegister"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenProfessionalModal
                v-if="isProfessionalVisible"
                v-model="isProfessionalVisible"
                @next="handleProfessionalNext"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenLoginModal
                v-if="isLoginVisible"
                v-model="isLoginVisible"
                @login-success="handleLoginSuccess"
                @show-register="handleShowRegisterFromLogin"
                @show-forgot-password="handleShowForgotPasswordFromLogin"
                @show-account-type="handleSsoSuccess"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenOnboardingModal
                v-if="isOnboardingVisible"
                v-model="isOnboardingVisible"
                @onboarding-complete="handleOnboardingComplete"
                @back="handleBack"
                @close="handleModalClose" />

            <AuthCitizenForgotPasswordModal
                v-if="isForgotPasswordVisible"
                v-model="isForgotPasswordVisible"
                @next="handleNextFromForgetPasswaord"
                @back-to-login="handleBackToLoginFromForgotPassword"
                @close="handleModalClose" />

            <AuthCitizenSuccessModal
                v-if="isSuccessVisible"
                v-model="isSuccessVisible"
                @next="handleSuccessModalNext"
                 @close="handleModalClose" />

            <AuthCitizenChangePasswordModal
                v-if="isChangePasswordVisible"
                v-model="isChangePasswordVisible"
                :email="userEmail"
                @password-changed="handlePasswordChanged"
                @back="handleBack"
                @close="handleModalClose" />
        </div>
    </ClientOnly>
</template>

<style lang="scss" scoped></style>
