<script setup>
   
    const visible = ref(false)
    const emit = defineEmits(["go-to-email"])

    defineExpose({
        visible
    })

    const handleBack = () => {
        visible.value = false
    }

    const handleContinueWithEmail = () => {
        setTimeout(() => {
            emit("go-to-email")
        }, 300)
    }

    const handleContinueWithApple = () => {
        console.log("Continue with Apple")
    }

    const handleContinueWithFacebook = () => {
        console.log("Continue with Facebook")
    }

    const handleContinueWithGoogle = () => {
        console.log("Continue with Google")
    }
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-get-started-modal"
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
                    <!-- Back Button -->
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

                    <!-- Title -->
                    <h2 class="text-xl font-semibold text-[#121A22]">
                        Create account
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-4">
            <!-- Continue with Email Button -->
            <button
                @click="handleContinueWithEmail"
                type="button">
                Continue with email
            </button>

            <!-- Divider -->
            <div class="relative flex items-center justify-center">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
            </div>

            <!-- Continue with Apple Button -->
            <button
                @click="handleContinueWithApple"
                type="button">
                Continue with Apple
            </button>

            <!-- Continue with Facebook Button -->
            <button
                @click="handleContinueWithFacebook"
                type="button">
                Continue with Facebook
            </button>

            <!-- Continue with Google Button -->
            <button
                @click="handleContinueWithGoogle"
                type="button">
                Continue with Google
            </button>

            <!-- Terms and Privacy -->
            <div class="text-center pt-2">
                <p class="text-xs text-gray-600">
                    By using heyhomex, you agree to the
                </p>
            </div>
        </div>
    </Dialog>
</template>
<style scoped>
    .citizen-get-started-content {
        width: 100%;
        max-width: 32rem;
    }
</style>
