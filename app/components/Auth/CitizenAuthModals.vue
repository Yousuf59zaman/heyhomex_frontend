<script setup>
    const { $citizenModals } = useNuxtApp()

    // Handle get started modal -> show send otp
    const handleShowSendEmailFromGetStarted = () => {
        $citizenModals.openSendOtp()
    }

    // Handle send otp next -> show verify otp
    const handleNextFromSendOtp = (email) => {
        $citizenModals.openVerifyOtp()
    }

    // Handle verify otp success -> show account type
    const handleVerifyOtpSuccess = () => {
        $citizenModals.openAccountType()
    }

    // Handle account type next -> show register
    const handleAccountTypeNext = (accountType) => {
        console.log('Selected account type:', accountType)
        $citizenModals.openRegister()
    }

    // Handle register success -> show professional
    const handleRegisterSuccess = (data) => {
        setTimeout(() => {
            $citizenModals.openProfessional()
        }, 500)
    }

    // Handle professional next -> show login
    const handleProfessionalNext = (data) => {
        console.log('Professional info submitted:', data)
        setTimeout(() => {
            $citizenModals.openLogin()
        }, 500)
    }

    // Handle login success -> check if onboarding needed
    const handleLoginSuccess = (needsOnboarding) => {
        if (needsOnboarding) {
            setTimeout(() => {
                $citizenModals.openOnboarding()
            }, 500)
        } else {
            navigateTo('/kamaina/')
        }
    }

    // Handle onboarding complete -> redirect to dashboard
    const handleOnboardingComplete = (data) => {
        console.log('Onboarding completed:', data)
    }

    // Show login from register modal
    const handleShowLoginFromRegister = () => {
        $citizenModals.openLogin()
    }

    // Show register from login modal
    const handleShowRegisterFromLogin = () => {
        $citizenModals.openRegister()
    }

    // Create computed properties for proper two-way binding
    const showGetStartedModal = computed({
        get: () => $citizenModals.showGetStartedModal.value,
        set: (val) => {
            $citizenModals.showGetStartedModal.value = val
        },
    })

    const showSendEmailModal = computed({
        get: () => $citizenModals.showSendEmailModal.value,
        set: (val) => {
            $citizenModals.showSendEmailModal.value = val
        },
    })

    const showVerifyOtpModal = computed({
        get: () => $citizenModals.showVerifyOtpModal.value,
        set: (val) => {
            $citizenModals.showVerifyOtpModal.value = val
        },
    })

    const showAccountTypeModal = computed({
        get: () => $citizenModals.showAccountTypeModal.value,
        set: (val) => {
            $citizenModals.showAccountTypeModal.value = val
        },
    })

    const showRegisterModal = computed({
        get: () => $citizenModals.showRegisterModal.value,
        set: (val) => {
            $citizenModals.showRegisterModal.value = val
        },
    })

    const showProfessionalModal = computed({
        get: () => $citizenModals.showProfessionalModal.value,
        set: (val) => {
            $citizenModals.showProfessionalModal.value = val
        },
    })

    const showLoginModal = computed({
        get: () => $citizenModals.showLoginModal.value,
        set: (val) => {
            $citizenModals.showLoginModal.value = val
        },
    })

    const showOnboardingModal = computed({
        get: () => $citizenModals.showOnboardingModal.value,
        set: (val) => {
            $citizenModals.showOnboardingModal.value = val
        },
    })
</script>

<template>
    <ClientOnly>
        <div>
            <!-- Get Started Modal -->
            <AuthCitizenGetStartedModal
                v-model="showGetStartedModal"
                @show-register="handleShowSendEmailFromGetStarted"
                @show-login="handleShowLoginFromRegister" />

            <!-- Send OTP Modal -->
            <AuthCitizenSendEmailModal
                v-model="showSendEmailModal"
                @next="handleNextFromSendOtp" />

            <!-- Verify OTP Modal -->
            <AuthCitizenVerifyOtpModal
                v-model="showVerifyOtpModal"
                @verify-success="handleVerifyOtpSuccess" />

            <!-- Account Type Modal -->
            <AuthCitizenAccountTypeModal
                v-model="showAccountTypeModal"
                @next="handleAccountTypeNext" />

            <!-- Register Modal -->
            <AuthCitizenRegisterModal
                v-model="showRegisterModal"
                @register-success="handleRegisterSuccess"
                @show-login="handleShowLoginFromRegister" />

            <!-- Professional Modal -->
            <AuthCitizenProfessionalModal
                v-model="showProfessionalModal"
                @next="handleProfessionalNext" />

            <!-- Login Modal -->
            <AuthCitizenLoginModal
                v-model="showLoginModal"
                @login-success="handleLoginSuccess"
                @show-register="handleShowRegisterFromLogin" />

            <!-- Onboarding Modal -->
            <AuthCitizenOnboardingModal
                v-model="showOnboardingModal"
                @onboarding-complete="handleOnboardingComplete" />
        </div>
    </ClientOnly>
</template>
