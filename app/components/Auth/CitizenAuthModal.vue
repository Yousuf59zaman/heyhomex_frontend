<script setup lang="ts">
    // Composables
    const {
        isOpen,
        currentStep,
        userData,
        loading,
        errors,
        currentStepConfig,
        currentStepOptions,
        closeModal,
        nextStep,
        prevStep,
        updateUserData,
        clearErrors,
    } = useCitizenModal();

    // Local reactive form data
    const formData = reactive<Partial<UserFormData>>({
        fullName: "",
        email: "",
        priceRange: "",
        preferredLocation: "",
        motivation: "",
        budget: "",
        locationType: "",
    });

    // Watch for step changes and update form data from stored userData
    watch(currentStep, () => {
        Object.assign(formData, userData.value);
    });

    // Watch for form data changes and update stored data
    watch(
        formData,
        (newData) => {
            updateUserData(newData);
        },
        { deep: true }
    );

    // Progress bar logic
    const progressSteps = ["motivation", "budget", "location"];
    const showProgressBar = computed(() =>
        progressSteps.includes(currentStep.value)
    );
    const currentProgressIndex = computed(() =>
        progressSteps.indexOf(currentStep.value)
    );

    // Methods
    const handleNext = async () => {
        clearErrors();
        const success = await nextStep(formData);

        if (!success) {
            // Scroll to top to show errors
            const modal = document.querySelector("[data-modal-content]");
            if (modal) {
                modal.scrollTop = 0;
            }
        }
    };

    const handleComplete = () => {
        closeModal();
        // Navigate to matches page or dashboard
        navigateTo("/matches");
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

    // Prevent body scroll when modal is open
    watch(isOpen, (newValue) => {
        if (import.meta.client) {
            if (newValue) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        }
    });

    // Cleanup on unmount
    onUnmounted(() => {
        if (import.meta.client) {
            document.body.style.overflow = "";
        }
    });
</script>

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
                    class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

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
                        class="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
                        data-modal-content>
                        <!-- Header -->
                        <div class="relative px-6 pt-8 pb-6 text-center">
                            <button
                                @click="closeModal"
                                class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                aria-label="Close modal">
                                <Icon
                                    name="lucide:x"
                                    class="w-5 h-5 text-gray-500" />
                            </button>

                            <h1
                                class="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                                {{ currentStepConfig.title }}
                            </h1>

                            <p
                                v-if="currentStepConfig.subtitle"
                                class="text-sm text-gray-600 whitespace-pre-line">
                                {{ currentStepConfig.subtitle }}
                            </p>

                            <div
                                v-if="currentStepConfig.stepLabel"
                                class="mt-4 text-xs text-gray-500 uppercase tracking-wide">
                                {{ currentStepConfig.stepLabel }}
                            </div>
                        </div>

                        <!-- Progress Bar (for steps 2-4) -->
                        <div
                            v-if="showProgressBar"
                            class="px-6 mb-6">
                            <div
                                class="flex items-center justify-center space-x-2">
                                <div
                                    v-for="(step, index) in progressSteps"
                                    :key="step"
                                    :class="[
                                        'h-2 rounded-full transition-all duration-300',
                                        index <= currentProgressIndex
                                            ? 'bg-gray-900 flex-1'
                                            : 'bg-gray-200 flex-1',
                                    ]"></div>
                            </div>
                        </div>

                        <!-- Error Message -->
                        <div
                            v-if="errors.general"
                            class="px-6 mb-4">
                            <div
                                class="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p class="text-sm text-red-600">
                                    {{ errors.general }}
                                </p>
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="px-6 pb-6">
                            <!-- Step 1: Initial Form -->
                            <form
                                v-if="currentStep === 'initial'"
                                @submit.prevent="handleNext"
                                class="space-y-4">
                                <div>
                                    <input
                                        v-model="formData.fullName"
                                        type="text"
                                        placeholder="Enter your full name"
                                        :class="[
                                            'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                            errors.fullName
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300',
                                        ]" />
                                    <p
                                        v-if="errors.fullName"
                                        class="text-xs text-red-600 mt-1">
                                        {{ errors.fullName }}
                                    </p>
                                </div>

                                <div>
                                    <input
                                        v-model="formData.email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        :class="[
                                            'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                            errors.email
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300',
                                        ]" />
                                    <p
                                        v-if="errors.email"
                                        class="text-xs text-red-600 mt-1">
                                        {{ errors.email }}
                                    </p>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <select
                                            v-model="formData.priceRange"
                                            :class="[
                                                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white custom-select',
                                                errors.priceRange
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-gray-300',
                                            ]">
                                            <option
                                                v-for="option in currentStepOptions.priceRange"
                                                :key="option.value"
                                                :value="option.value"
                                                :disabled="option.disabled">
                                                {{ option.label }}
                                            </option>
                                        </select>
                                        <p
                                            v-if="errors.priceRange"
                                            class="text-xs text-red-600 mt-1">
                                            {{ errors.priceRange }}
                                        </p>
                                    </div>

                                    <div>
                                        <select
                                            v-model="formData.preferredLocation"
                                            :class="[
                                                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white custom-select',
                                                errors.preferredLocation
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-gray-300',
                                            ]">
                                            <option
                                                v-for="option in currentStepOptions.preferredLocation"
                                                :key="option.value"
                                                :value="option.value"
                                                :disabled="option.disabled">
                                                {{ option.label }}
                                            </option>
                                        </select>
                                        <p
                                            v-if="errors.preferredLocation"
                                            class="text-xs text-red-600 mt-1">
                                            {{ errors.preferredLocation }}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    :disabled="loading"
                                    class="w-full mt-6 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                                    <Icon
                                        v-if="loading"
                                        name="lucide:loader-2"
                                        class="w-5 h-5 mr-2 animate-spin" />
                                    {{ loading ? "Saving..." : "Save Search" }}
                                </button>
                            </form>

                            <!-- Step 2: Motivation -->
                            <div
                                v-else-if="currentStep === 'motivation'"
                                class="space-y-6">
                                <div class="space-y-3">
                                    <div
                                        v-for="option in currentStepOptions.motivation"
                                        :key="option.value"
                                        @click="
                                            formData.motivation = option.value
                                        "
                                        :class="[
                                            'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                            formData.motivation === option.value
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300',
                                        ]">
                                        <p
                                            class="text-sm font-medium text-gray-900">
                                            {{ option.label }}
                                        </p>
                                    </div>
                                    <p
                                        v-if="errors.motivation"
                                        class="text-xs text-red-600">
                                        {{ errors.motivation }}
                                    </p>
                                </div>

                                <div class="flex gap-3">
                                    <button
                                        @click="prevStep"
                                        class="flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                                        Start Over
                                    </button>

                                    <button
                                        @click="handleNext"
                                        :disabled="
                                            loading || !formData.motivation
                                        "
                                        class="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                                        <Icon
                                            v-if="loading"
                                            name="lucide:loader-2"
                                            class="w-5 h-5 mr-2 animate-spin" />
                                        {{ loading ? "Saving..." : "Next" }}
                                    </button>
                                </div>
                            </div>

                            <!-- Step 3: Budget -->
                            <div
                                v-else-if="currentStep === 'budget'"
                                class="space-y-6">
                                <div class="space-y-3">
                                    <div
                                        v-for="option in currentStepOptions.budget"
                                        :key="option.value"
                                        @click="formData.budget = option.value"
                                        :class="[
                                            'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                            formData.budget === option.value
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300',
                                        ]">
                                        <p
                                            class="text-sm font-medium text-gray-900">
                                            {{ option.label }}
                                        </p>
                                    </div>
                                    <p
                                        v-if="errors.budget"
                                        class="text-xs text-red-600">
                                        {{ errors.budget }}
                                    </p>
                                </div>

                                <div class="flex gap-3">
                                    <button
                                        @click="prevStep"
                                        class="flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                                        Back
                                    </button>

                                    <button
                                        @click="handleNext"
                                        :disabled="loading || !formData.budget"
                                        class="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                                        <Icon
                                            v-if="loading"
                                            name="lucide:loader-2"
                                            class="w-5 h-5 mr-2 animate-spin" />
                                        {{ loading ? "Saving..." : "Next" }}
                                    </button>
                                </div>
                            </div>

                            <!-- Step 4: Location -->
                            <div
                                v-else-if="currentStep === 'location'"
                                class="space-y-6">
                                <div class="space-y-3">
                                    <div
                                        v-for="option in currentStepOptions.locationType"
                                        :key="option.value"
                                        @click="
                                            formData.locationType = option.value
                                        "
                                        :class="[
                                            'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                            formData.locationType ===
                                            option.value
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300',
                                        ]">
                                        <p
                                            class="text-sm font-medium text-gray-900">
                                            {{ option.label }}
                                        </p>
                                    </div>
                                    <p
                                        v-if="errors.locationType"
                                        class="text-xs text-red-600">
                                        {{ errors.locationType }}
                                    </p>
                                </div>

                                <div class="flex gap-3">
                                    <button
                                        @click="prevStep"
                                        class="flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                                        Back
                                    </button>

                                    <button
                                        @click="handleNext"
                                        :disabled="
                                            loading || !formData.locationType
                                        "
                                        class="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                                        <Icon
                                            v-if="loading"
                                            name="lucide:loader-2"
                                            class="w-5 h-5 mr-2 animate-spin" />
                                        {{ loading ? "Saving..." : "Next" }}
                                    </button>
                                </div>
                            </div>

                            <!-- Step 5: Success -->
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
                                        Perfect! Your search is saved.
                                    </h3>
                                    <p class="text-gray-600 text-sm">
                                        We'll use your preferences to find the
                                        perfect homes for you.
                                    </p>
                                </div>

                                <div class="space-y-3">
                                    <button
                                        @click="handleComplete"
                                        class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                                        View My Matches
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

<style scoped>
    /* Custom select arrow */
    .custom-select {
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
    }
</style>
