export default defineNuxtPlugin(() => {
    const showGetStartedModal = useState('showCitizenGetStartedModal', () => false);
    const showSendOtpModal = useState('showCitizenSendOtpModal', () => false);
    const showVerifyOtpModal = useState('showCitizenVerifyOtpModal', () => false);
    const showAccountTypeModal = useState('showCitizenAccountTypeModal', () => false);
    const showRegisterModal = useState('showCitizenRegisterModal', () => false);
    const showProfessionalModal = useState('showCitizenProfessionalModal', () => false);
    const showLoginModal = useState('showCitizenLoginModal', () => false);
    const showOnboardingModal = useState('showCitizenOnboardingModal', () => false);

    const citizenModals = {
        showGetStartedModal,
        showSendOtpModal,
        showVerifyOtpModal,
        showAccountTypeModal,
        showRegisterModal,
        showProfessionalModal,
        showLoginModal,
        showOnboardingModal,
        openGetStarted: () => {
            console.log('Plugin: Opening get started modal');
            showGetStartedModal.value = true;
            showSendOtpModal.value = false;
            showVerifyOtpModal.value = false;
            showAccountTypeModal.value = false;
            showRegisterModal.value = false;
            showProfessionalModal.value = false;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
        openSendOtp: () => {
            console.log('Plugin: Opening send otp modal');
            showSendOtpModal.value = true;
            showGetStartedModal.value = false;
            showVerifyOtpModal.value = false;
            showAccountTypeModal.value = false;
            showRegisterModal.value = false;
            showProfessionalModal.value = false;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
        openVerifyOtp: () => {
            console.log('Plugin: Opening verify otp modal');
            showVerifyOtpModal.value = true;
            showGetStartedModal.value = false;
            showSendOtpModal.value = false;
            showAccountTypeModal.value = false;
            showRegisterModal.value = false;
            showProfessionalModal.value = false;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
        openAccountType: () => {
            console.log('Plugin: Opening account type modal');
            showAccountTypeModal.value = true;
            showGetStartedModal.value = false;
            showSendOtpModal.value = false;
            showVerifyOtpModal.value = false;
            showRegisterModal.value = false;
            showProfessionalModal.value = false;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
        openRegister: () => {
            console.log('Plugin: Opening register modal');
            showRegisterModal.value = true;
            showGetStartedModal.value = false;
            showSendOtpModal.value = false;
            showVerifyOtpModal.value = false;
            showAccountTypeModal.value = false;
            showProfessionalModal.value = false;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
        openLogin: () => {
            console.log('Plugin: Opening login modal');
            showLoginModal.value = true;
            showGetStartedModal.value = false;
            showSendOtpModal.value = false;
            showVerifyOtpModal.value = false;
            showAccountTypeModal.value = false;
            showRegisterModal.value = false;
            showProfessionalModal.value = false;
            showOnboardingModal.value = false;
        },
        openProfessional: () => {
            console.log('Plugin: Opening professional modal');
            showProfessionalModal.value = true;
            showGetStartedModal.value = false;
            showSendOtpModal.value = false;
            showVerifyOtpModal.value = false;
            showAccountTypeModal.value = false;
            showRegisterModal.value = false;
            showLoginModal.value = false;
            showOnboardingModal.value = false;
        },
        openOnboarding: () => {
            console.log('Plugin: Opening onboarding modal');
            showOnboardingModal.value = true;
            showGetStartedModal.value = false;
            showSendOtpModal.value = false;
            showVerifyOtpModal.value = false;
            showAccountTypeModal.value = false;
            showRegisterModal.value = false;
            showProfessionalModal.value = false;
            showLoginModal.value = false;
        },
        closeAll: () => {
            console.log('Plugin: Closing all modals');
            showGetStartedModal.value = false;
            showSendOtpModal.value = false;
            showVerifyOtpModal.value = false;
            showAccountTypeModal.value = false;
            showRegisterModal.value = false;
            showProfessionalModal.value = false;
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
