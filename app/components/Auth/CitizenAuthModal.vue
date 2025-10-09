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
    <Dialog
        v-model:visible="isOpen"
        modal
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-auth-modal"
        :style="{ width: '45rem' }"
        @update:visible="closeModal"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div class="w-full text-center px-6 pt-8 pb-6">
                <h1
                    class="text-3xl max-w-sm mx-auto font-semibold text-[#121A22] mb-2 leading-tight">
                    {{ currentStepConfig.title }}
                </h1>

                <p
                    v-if="currentStepConfig.subtitle"
                    class="text-sm text-[#121A22] whitespace-pre-line">
                    {{ currentStepConfig.subtitle }}
                </p>

                <div
                    v-if="currentStepConfig.stepLabel"
                    class="mt-4 text-xs text-[#121A22] uppercase tracking-wide">
                    {{ currentStepConfig.stepLabel }}
                </div>
            </div>
        </template>

        <!-- Progress Bar (for steps 2-4) -->
        <div v-if="showProgressBar" class="px-6 mb-6">
            <ProgressBar
                :value="
                    ((currentProgressIndex + 1) / progressSteps.length) * 100
                "
                :showValue="false"
                class="h-2"
                :pt="{
                    root: 'bg-gray-200 rounded-full',
                    value: 'bg-gray-900 rounded-full transition-all duration-300',
                }" />
        </div>

        <!-- Error Message -->
        <Message
            v-if="errors.general"
            severity="error"
            :closable="false"
            class="mx-6 mb-4"
            :pt="{
                root: 'bg-red-50 border border-red-200 rounded-lg',
                text: 'text-sm text-red-600',
            }">
            {{ errors.general }}
        </Message>

        <!-- Content -->
        <div class="px-6 pb-6">
            <!-- Step 1: Initial Form -->
            <div v-if="currentStep === 'initial'" class="space-y-4">
                <form @submit.prevent="handleNext" class="space-y-4">
                    <div class="flex flex-col gap-2">
                        <label for="">Full Name</label>
                        <InputText
                            v-model="formData.fullName"
                            placeholder="Enter your full name"
                            :invalid="!!errors.fullName"
                            :pt="{
                                root: [
                                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                    errors.fullName
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300',
                                ],
                            }" />
                        <small v-if="errors.fullName" class="text-red-600">
                            {{ errors.fullName }}
                        </small>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="">Email Address</label>
                        <InputText
                            v-model="formData.email"
                            type="email"
                            placeholder="Enter your email address"
                            :invalid="!!errors.email"
                            :pt="{
                                root: [
                                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                    errors.email
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300',
                                ],
                            }" />
                        <small v-if="errors.email" class="text-red-600">
                            {{ errors.email }}
                        </small>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="">Price Range</label>
                            <Dropdown
                                v-model="formData.priceRange"
                                :options="currentStepOptions.priceRange"
                                optionLabel="label"
                                optionValue="value"
                                optionDisabled="disabled"
                                placeholder="Price Range"
                                :invalid="!!errors.priceRange"
                                :pt="{
                                    root: [
                                        'w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                        errors.priceRange
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300',
                                    ],
                                    input: 'px-4 py-3',
                                }" />
                            <small
                                v-if="errors.priceRange"
                                class="text-red-600">
                                {{ errors.priceRange }}
                            </small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="">Preferred Location</label>
                            <Dropdown
                                v-model="formData.preferredLocation"
                                :options="currentStepOptions.preferredLocation"
                                optionLabel="label"
                                optionValue="value"
                                optionDisabled="disabled"
                                placeholder="Location"
                                :invalid="!!errors.preferredLocation"
                                :pt="{
                                    root: [
                                        'w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                        errors.preferredLocation
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300',
                                    ],
                                    input: 'px-4 py-3',
                                }" />
                            <small
                                v-if="errors.preferredLocation"
                                class="text-red-600">
                                {{ errors.preferredLocation }}
                            </small>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        :disabled="loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="w-full mt-6"
                        :pt="{
                            root: 'w-full mb-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? "Saving..." : "Save Search" }}
                    </Button>
                </form>
            </div>
            <div v-else-if="currentStep === 'motivation'" class="space-y-6">
                <!-- Step 2: Motivation -->
                <div class="space-y-3">
                    <div
                        v-for="option in currentStepOptions.motivation"
                        :key="option.value"
                        @click="formData.motivation = option.value"
                        :class="[
                            'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                            formData.motivation === option.value
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300',
                        ]">
                        <p class="text-sm font-medium text-gray-900">
                            {{ option.label }}
                        </p>
                    </div>
                    <small v-if="errors.motivation" class="text-red-600">
                        {{ errors.motivation }}
                    </small>
                </div>

                <div class="flex gap-3">
                    <Button
                        @click="prevStep"
                        outlined
                        class="flex-1"
                        :pt="{
                            root: 'flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200',
                        }">
                        Start Over
                    </Button>

                    <Button
                        @click="handleNext"
                        :disabled="loading || !formData.motivation"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1"
                        :pt="{
                            root: 'flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? "Saving..." : "Next" }}
                    </Button>
                </div>
            </div>
            <div v-else-if="currentStep === 'budget'" class="space-y-6">
                <!-- Step 3: Budget -->
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
                        <p class="text-sm font-medium text-gray-900">
                            {{ option.label }}
                        </p>
                    </div>
                    <small v-if="errors.budget" class="text-red-600">
                        {{ errors.budget }}
                    </small>
                </div>

                <div class="flex gap-3">
                    <Button
                        @click="prevStep"
                        outlined
                        class="flex-1"
                        :pt="{
                            root: 'flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200',
                        }">
                        Back
                    </Button>

                    <Button
                        @click="handleNext"
                        :disabled="loading || !formData.budget"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1"
                        :pt="{
                            root: 'flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? "Saving..." : "Next" }}
                    </Button>
                </div>
            </div>
            <div v-else-if="currentStep === 'location'" class="space-y-6">
                <!-- Step 4: Location -->
                <div class="space-y-3">
                    <div
                        v-for="option in currentStepOptions.locationType"
                        :key="option.value"
                        @click="formData.locationType = option.value"
                        :class="[
                            'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                            formData.locationType === option.value
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300',
                        ]">
                        <p class="text-sm font-medium text-gray-900">
                            {{ option.label }}
                        </p>
                    </div>
                    <small v-if="errors.locationType" class="text-red-600">
                        {{ errors.locationType }}
                    </small>
                </div>

                <div class="flex gap-3">
                    <Button
                        @click="prevStep"
                        outlined
                        class="flex-1"
                        :pt="{
                            root: 'flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200',
                        }">
                        Back
                    </Button>

                    <Button
                        @click="handleNext"
                        :disabled="loading || !formData.locationType"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1"
                        :pt="{
                            root: 'flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? "Saving..." : "Next" }}
                    </Button>
                </div>
            </div>
            <div
                v-else-if="currentStep === 'success'"
                class="text-center space-y-6">
                <!-- Step 5: Success -->
                <div
                    class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="lucide:check" class="w-8 h-8 text-green-600" />
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Perfect! Your search is saved.
                    </h3>
                    <p class="text-gray-600 text-sm">
                        We'll use your preferences to find the perfect homes for
                        you.
                    </p>
                </div>

                <div class="space-y-3">
                    <Button
                        @click="handleComplete"
                        class="w-full"
                        :pt="{
                            root: 'w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200',
                        }">
                        View My Matches
                    </Button>

                    <Button
                        @click="closeModal"
                        outlined
                        class="w-full"
                        :pt="{
                            root: 'w-full px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200',
                        }">
                        Continue Browsing
                    </Button>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-auth-modal .p-dialog {
        border-radius: 1rem;
    }

    .citizen-auth-modal .p-dialog-header {
        border: none;
        padding-bottom: 0;
    }

    .citizen-auth-modal .p-dialog-content {
        border: none;
        padding-top: 0;
        padding-bottom: 1.5rem;
    }

    .citizen-auth-modal .p-dialog-header-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: background-color 0.2s;
    }

    .citizen-auth-modal .p-dialog-header-close:hover {
        background-color: rgb(243, 244, 246);
    }

    :deep(.p-dialog-close-button){
        display: hidden !important;
    }

    :deep(.p-button-icon){
        display:hidden !important;
    }

</style>
