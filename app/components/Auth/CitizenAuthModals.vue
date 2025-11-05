<script setup>
    const emit = defineEmits(["update:isOpenStartModal"])

    const props = defineProps({
        isOpenStartModal: Boolean,
        initialStep: {
            type: Number,
            default: 0,
        },
    })

    const activeIndex = ref(0)
    const userEmail = ref("")
    const accountType = ref("")
    const needsOnboarding = ref(false)

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

    const handleNextFromSendOtp = (email) => {
        userEmail.value = email
        activeIndex.value = 2
    }

    const handleVerifyOtpSuccess = () => {
        activeIndex.value = 3
    }

    const handleAccountTypeNext = (type) => {
        accountType.value = type

        activeIndex.value = 4
    }

    const handleRegisterSuccess = (data) => {
        activeIndex.value = 5
    }

    const handleProfessionalNext = (data) => {
        activeIndex.value = 6
    }

    const handleLoginSuccess = (needsOnboardingCheck) => {
        needsOnboarding.value = needsOnboardingCheck
        if (needsOnboardingCheck) {
            activeIndex.value = 7
        } else {
            closeJourney()
            navigateTo("/kamaina/")
        }
    }

    const handleOnboardingComplete = (data) => {
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
                @verify-success="handleVerifyOtpSuccess"
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
                @back-to-login="handleBackToLoginFromForgotPassword"
                @close="handleModalClose" />
        </div>
    </ClientOnly>
</template>

<style lang="scss" scoped></style>
