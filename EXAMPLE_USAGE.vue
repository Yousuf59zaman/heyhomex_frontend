<script setup>
// Example component showing how to trigger the citizen auth modals

const { $citizenModals } = useNuxtApp();

const openRegisterModal = () => {
    $citizenModals.openRegister();
};

const openLoginModal = () => {
    $citizenModals.openLogin();
};
</script>

<template>
    <div class="flex gap-4 p-8">
        <button
            @click="openRegisterModal"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Sign Up
        </button>

        <button
            @click="openLoginModal"
            class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors">
            Sign In
        </button>
    </div>
</template>
