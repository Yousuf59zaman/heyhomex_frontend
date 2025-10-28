<script setup lang="ts">
    const { $citizenModals } = useNuxtApp()

    // Handle register success -> show login
    const handleRegisterSuccess = (data: any) => {
        setTimeout(() => {
            $citizenModals.openLogin()
        }, 500)
    }

    // Handle login success -> check if onboarding needed
    const handleLoginSuccess = (needsOnboarding: boolean) => {
        if (needsOnboarding) {
            setTimeout(() => {
                $citizenModals.openOnboarding()
            }, 500)
        } else {
            navigateTo('/kamaina/')
        }
    }

    // Handle onboarding complete -> redirect to dashboard
    const handleOnboardingComplete = (data: any) => {
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
    const showRegisterModal = computed({
        get: () => $citizenModals.showRegisterModal.value,
        set: (val) => {
            $citizenModals.showRegisterModal.value = val
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
            <!-- Register Modal -->
            <AuthCitizenRegisterModal
                v-model="showRegisterModal"
                @register-success="handleRegisterSuccess"
                @show-login="handleShowLoginFromRegister" />

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
