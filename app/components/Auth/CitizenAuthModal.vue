<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <div
                v-if="isOpen"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                @click.self="closeModal">
                <!-- Backdrop -->
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

                <!-- Modal Content -->
                <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 scale-95 translate-y-4"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 translate-y-4">
                    <div
                        v-if="isOpen"
                        class="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <!-- Header -->
                        <div
                            class="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 class="text-xl font-semibold text-gray-900">
                                {{ getStepTitle() }}
                            </h2>
                            <button
                                @click="closeModal"
                                class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                aria-label="Close modal">
                                <Icon
                                    name="lucide:x"
                                    class="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <!-- Progress Bar -->
                        <div class="px-6 py-4 bg-gray-50">
                            <div
                                class="flex items-center justify-center space-x-2">
                                <div
                                    v-for="(step, index) in steps"
                                    :key="step"
                                    :class="[
                                        'w-3 h-3 rounded-full transition-all duration-300',
                                        getStepIndex() >= index
                                            ? 'bg-blue-600'
                                            : 'bg-gray-300',
                                    ]"></div>
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="p-6">
                            <!-- Register Step -->
                            <div
                                v-if="currentStep === 'register'"
                                class="space-y-4">
                                <div class="text-center mb-6">
                                    <p class="text-gray-600">
                                        Join thousands of homeowners and
                                        investors
                                    </p>
                                </div>

                                <form
                                    @submit.prevent="handleRegister"
                                    class="space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                v-model="form.firstName"
                                                type="text"
                                                required
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="John" />
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                v-model="form.lastName"
                                                type="text"
                                                required
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            v-model="form.email"
                                            type="email"
                                            required
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="john@example.com" />
                                    </div>

                                    <div>
                                        <label
                                            class="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            v-model="form.phone"
                                            type="tel"
                                            required
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="(555) 123-4567" />
                                    </div>

                                    <button
                                        type="submit"
                                        :disabled="loading"
                                        class="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                                        <Icon
                                            v-if="loading"
                                            name="lucide:loader-2"
                                            class="w-5 h-5 mr-2 animate-spin" />
                                        {{
                                            loading
                                                ? "Creating Account..."
                                                : "Create Account"
                                        }}
                                    </button>
                                </form>

                                <div class="text-center pt-4">
                                    <p class="text-sm text-gray-600">
                                        Already have an account?
                                        <button
                                            @click="switchToSignIn"
                                            class="text-blue-600 hover:text-blue-700 font-medium">
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            </div>

                            <!-- Verify Step -->
                            <div
                                v-else-if="currentStep === 'verify'"
                                class="text-center space-y-6">
                                <div
                                    class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <Icon
                                        name="lucide:mail"
                                        class="w-8 h-8 text-blue-600" />
                                </div>

                                <div>
                                    <h3
                                        class="text-lg font-semibold text-gray-900 mb-2">
                                        Check your email
                                    </h3>
                                    <p class="text-gray-600">
                                        We've sent a verification link to<br />
                                        <span class="font-medium">{{
                                            userData.email
                                        }}</span>
                                    </p>
                                </div>

                                <div class="space-y-3">
                                    <button
                                        @click="handleResendEmail"
                                        :disabled="resendLoading"
                                        class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                                        <Icon
                                            v-if="resendLoading"
                                            name="lucide:loader-2"
                                            class="w-5 h-5 mr-2 animate-spin" />
                                        {{
                                            resendLoading
                                                ? "Sending..."
                                                : "Resend Email"
                                        }}
                                    </button>

                                    <button
                                        @click="nextStep"
                                        class="w-full px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                                        I've verified my email
                                    </button>
                                </div>

                                <button
                                    @click="setStep('register')"
                                    class="text-sm text-gray-500 hover:text-gray-700 underline">
                                    Use a different email
                                </button>
                            </div>

                            <!-- Success Step -->
                            <div
                                v-else-if="currentStep === 'success'"
                                class="text-center space-y-6">
                                <div
                                    class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Icon
                                        name="lucide:check"
                                        class="w-8 h-8 text-green-600" />
                                </div>

                                <div>
                                    <h3
                                        class="text-lg font-semibold text-gray-900 mb-2">
                                        Welcome to HeyHome!
                                    </h3>
                                    <p class="text-gray-600">
                                        Your account has been successfully
                                        created.<br />
                                        You're now ready to start your home
                                        journey.
                                    </p>
                                </div>

                                <div class="space-y-3">
                                    <button
                                        @click="handleGetStarted"
                                        class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                                        Get Started
                                    </button>

                                    <button
                                        @click="closeModal"
                                        class="w-full px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                                        Continue Browsing
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
    interface RegisterForm {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }

    // Composables
    const {
        isOpen,
        currentStep,
        userData,
        closeModal,
        nextStep,
        setStep,
        updateUserData,
    } = useCitizenAuth();

    // Local state
    const loading = ref(false);
    const resendLoading = ref(false);

    const form = ref<RegisterForm>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // Constants
    const steps = ["register", "verify", "success"] as const;

    // Methods
    const getStepTitle = () => {
        switch (currentStep.value) {
            case "register":
                return "Create Account";
            case "verify":
                return "Verify Email";
            case "success":
                return "Welcome!";
            default:
                return "Get Started";
        }
    };

    const getStepIndex = () => {
        return steps.indexOf(currentStep.value);
    };

    const handleRegister = async () => {
        loading.value = true;

        try {
            // Update user data
            updateUserData(form.value);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Move to verification step
            nextStep();
        } catch (error) {
            console.error("Registration error:", error);
            // Handle error (show toast, etc.)
        } finally {
            loading.value = false;
        }
    };

    const handleResendEmail = async () => {
        resendLoading.value = true;

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Show success message (could use toast)
            console.log("Email resent successfully");
        } catch (error) {
            console.error("Resend email error:", error);
        } finally {
            resendLoading.value = false;
        }
    };

    const handleGetStarted = () => {
        closeModal();
        // Navigate to dashboard or next step
        navigateTo("/dashboard"); // Assuming you have a dashboard route
    };

    const switchToSignIn = () => {
        closeModal();
        // You could open a sign-in modal or navigate to sign-in page
        // For now, just log the action
        console.log("Switch to sign in");
    };

    // Keyboard event handling
    onMounted(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen.value) {
                closeModal();
            }
        };

        document.addEventListener("keydown", handleEscape);

        onUnmounted(() => {
            document.removeEventListener("keydown", handleEscape);
        });
    });
</script>

<style scoped>
    /* Additional custom styles if needed */
</style>
