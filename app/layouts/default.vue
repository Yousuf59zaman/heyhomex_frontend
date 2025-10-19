<script setup>
    // Modal state for auth modal
    const showAuthModal = ref(false);

    // Handle modal events
    const handleOpenAuthModal = () => {
        console.log('Guest header: Opening auth modal');
        showAuthModal.value = true;
    };

    const handleModalComplete = (userData) => {
        console.log('User completed auth:', userData);
        showAuthModal.value = false;
        // Handle completed user data (e.g., redirect to dashboard)
        navigateTo('/kamaina/');
    };

    const handleModalClose = () => {
        showAuthModal.value = false;
    };
</script>

<template>
    <div class="h-screen overflow-hidden">
        <AppHeaderGuest @open-auth-modal="handleOpenAuthModal" />

        <div :class="[' transition-all duration-100 ']">
            <slot />
        </div>

        <AppFooterGuest />

        <AuthCitizenAuthModal
            v-model="showAuthModal"
            @complete="handleModalComplete"
            @close="handleModalClose" />
    </div>
</template>

<style lang="scss" scoped></style>
