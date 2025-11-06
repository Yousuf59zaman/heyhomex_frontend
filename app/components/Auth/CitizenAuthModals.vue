<script setup lang="ts">
    const emit = defineEmits<{
        'update:isOpenStartModal': [value: boolean]
    }>()

    interface Props {
        isOpenStartModal: boolean
        initialStep?: number
    }

    const props = withDefaults(defineProps<Props>(), {
        initialStep: 0,
    })

    const activeIndex = ref<number>(0)
    const userEmail = ref<string>("")
    const accountType = ref<string>("")
    const needsOnboarding = ref<boolean>(false)
    const otpSource = ref<string>("")

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

    const isGetStartedVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 0
    )
    const isSendEmailVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 1
    )
    const isVerifyOtpVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 2
    )
    const isAccountTypeVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 3
    )
    const isRegisterVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 4
    )
    const isProfessionalVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 5
    )
    const isLoginVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 6
    )
    const isOnboardingVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 7
    )
    const isForgotPasswordVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 8
    )
    const isChangePasswordVisible = computed(
        () => props.isOpenStartModal && activeIndex.value === 9
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
        activeIndex.value = 3
    }

    const handleAccountTypeNext = (type: string): void => {
        accountType.value = type

        activeIndex.value = 4
    }

    const handleRegisterSuccess = (data: any): void => {
        activeIndex.value = 5
    }

    const handleProfessionalNext = (data: any): void => {
        activeIndex.value = 6
    }

    const handleLoginSuccess = (needsOnboardingCheck: boolean): void => {
        needsOnboarding.value = needsOnboardingCheck
        if (needsOnboardingCheck) {
            activeIndex.value = 7
        } else {
            closeJourney()
            navigateTo("/kamaina/")
        }
    }

    const handleOnboardingComplete = (data: any): void => {
        closeJourney()
        navigateTo("/kamaina/")
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

    const handleVerifyForgotPasswordSuccess = (): void => {
        activeIndex.value = 9
    }

    const handlePasswordChanged = (): void => {
        // After successful password change, go back to login
        activeIndex.value = 6
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
