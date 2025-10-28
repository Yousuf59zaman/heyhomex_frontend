export default defineNuxtPlugin(() => {
    const showRegisterModal = useState('showCitizenRegisterModal', () => false);
    const showLoginModal = useState('showCitizenLoginModal', () => false);
    const showOnboardingModal = useState('showCitizenOnboardingModal', () => false);

    const citizenModals = {
        showRegisterModal,
        showLoginModal,
        showOnboardingModal,
        openRegister: () => {
            console.log('Plugin: Opening register modal');
            showRegisterModal.value = true;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
        openLogin: () => {
            console.log('Plugin: Opening login modal');
            showLoginModal.value = true;
            showRegisterModal.value = false;
            showOnboardingModal.value = false;
        },
        openOnboarding: () => {
            console.log('Plugin: Opening onboarding modal');
            showOnboardingModal.value = true;
            showLoginModal.value = false;
            showRegisterModal.value = false;
        },
        closeAll: () => {
            console.log('Plugin: Closing all modals');
            showRegisterModal.value = false;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
    };

    return {
        provide: {
            citizenModals
        },
    };
});
