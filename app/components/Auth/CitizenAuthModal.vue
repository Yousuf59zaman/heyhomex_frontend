<script setup lang="ts">
    // Types
    type AuthStep =
        | 'initial'
        | 'motivation'
        | 'budget'
        | 'location'
        | 'success';

    interface UserFormData {
        fullName: string;
        email: string;
        priceRange: string;
        preferredLocation: string;
        motivation: string;
        budget: string;
        locationType: string;
    }

    // Props
    const props = defineProps<{
        modelValue: boolean;
        initialStep?: AuthStep;
    }>();

    // Emits
    const emit = defineEmits<{
        'update:modelValue': [value: boolean];
        complete: [userData: UserFormData];
        close: [];
    }>();

    // State
    const currentStep = ref<AuthStep>(props.initialStep || 'initial');
    const loading = ref(false);

    // Form data
    const formData = reactive<UserFormData>({
        fullName: '',
        email: '',
        priceRange: '',
        preferredLocation: '',
        motivation: '',
        budget: '',
        locationType: '',
    });

    // Static step configurations - completely static objects
    const stepConfigs = {
        initial: {
            title: "You bring the dream. We'll map the way. ✨",
            subtitle: '',
            stepLabel: '',
        },
        motivation: {
            title: "You bring the dream. We'll map the way. ✨",
            subtitle: "What's the heart behind your home search?",
            stepLabel: 'Step: 1/3',
        },
        budget: {
            title: "You bring the dream. We'll map the way. ✨",
            subtitle:
                "What's your sweet spot, budget-wise?\nNo judgment — just vibes and homes that fit",
            stepLabel: 'Step: 2/3',
        },
        location: {
            title: "You bring the dream. We'll map the way. ✨",
            subtitle: "Where's your dream home hiding? We'll find it together.",
            stepLabel: 'Step: 3/3',
        },
        success: {
            title: 'Welcome to your home journey!',
            subtitle:
                "We've saved your preferences and we're ready to help you find your perfect home.",
            stepLabel: '',
        },
    };

    const getCurrentStepConfig = () => stepConfigs[currentStep.value];

    // Static options - completely static arrays
    const priceRangeOptions = [
        { label: 'Select price range', value: '', disabled: true },
        { label: '$0 - $300K', value: '0-300k' },
        { label: '$300K - $600K', value: '300k-600k' },
        { label: '$600K - $1M', value: '600k-1m' },
        { label: '$1M+', value: '1m+' },
    ];

    const preferredLocationOptions = [
        { label: 'Select Preferred location', value: '', disabled: true },
        { label: 'Urban', value: 'urban' },
        { label: 'Suburban', value: 'suburban' },
        { label: 'Rural', value: 'rural' },
        { label: 'Coastal', value: 'coastal' },
    ];

    const motivationOptions = [
        { label: "I'm planting roots — this is home", value: 'planting_roots' },
        {
            label: 'Here on orders — base life meets island life',
            value: 'military_orders',
        },
        {
            label: "I'm scouting the next big opportunity",
            value: 'investment_opportunity',
        },
    ];

    const budgetOptions = [
        { label: '$400k - $600k', value: '400k-600k' },
        { label: '$600k - 1.2m', value: '600k-1.2m' },
        { label: '1.2+', value: '1.2m+' },
    ];

    const locationTypeOptions = [
        { label: 'City', value: 'city' },
        { label: 'Suburbs', value: 'suburbs' },
        { label: 'All of it', value: 'all' },
    ];

    const progressSteps = ['motivation', 'budget', 'location'];
    const showProgressBar = computed(() =>
        progressSteps.includes(currentStep.value)
    );
    const currentProgressIndex = computed(() =>
        progressSteps.indexOf(currentStep.value)
    );

    // Methods
    const closeModal = () => {
        emit('update:modelValue', false);
        emit('close');
        // Reset after closing
        setTimeout(() => {
            currentStep.value = props.initialStep || 'initial';
        }, 300);
    };

    const handleNext = () => {
        const steps: AuthStep[] = [
            'initial',
            'motivation',
            'budget',
            'location',
            'success',
        ];
        const currentIndex = steps.indexOf(currentStep.value);

        if (currentIndex < steps.length - 1) {
            const nextStep = steps[currentIndex + 1];
            if (nextStep) {
                currentStep.value = nextStep;
            }
        }
    };

    const handlePrev = () => {
        const steps: AuthStep[] = [
            'initial',
            'motivation',
            'budget',
            'location',
            'success',
        ];
        const currentIndex = steps.indexOf(currentStep.value);

        if (currentIndex > 0) {
            const prevStep = steps[currentIndex - 1];
            if (prevStep) {
                currentStep.value = prevStep;
            }
        }
    };

    const handleComplete = () => {
        emit('complete', { ...formData });
        navigateTo('/kamaina/');
        closeModal();
    };

    // Keyboard event handling
    onMounted(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && props.modelValue) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
        onUnmounted(() => {
            document.removeEventListener('keydown', handleEscape);
        });
    });

    // Prevent body scroll when modal is open
    watch(
        () => props.modelValue,
        (newValue) => {
            if (import.meta.client) {
                document.body.style.overflow = newValue ? 'hidden' : '';
            }
        }
    );

    // Cleanup on unmount
    onUnmounted(() => {
        if (import.meta.client) {
            document.body.style.overflow = '';
        }
    });
</script>

<template>
    <Dialog
        v-model:visible="props.modelValue"
        modal
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-auth-modal"
        :style="{ width: 'min(45rem, 95vw)', maxWidth: '95vw' }"
        @update:visible="closeModal"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl m-4',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div
                class="w-full text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <h1
                    class="text-2xl sm:text-3xl max-w-sm mx-auto font-semibold text-[#121A22] mb-2 leading-tight">
                    {{ getCurrentStepConfig().title }}
                </h1>

                <p
                    v-if="getCurrentStepConfig().subtitle"
                    class="text-sm text-[#121A22] whitespace-pre-line">
                    {{ getCurrentStepConfig().subtitle }}
                </p>
            </div>
        </template>

        <!-- Content -->
        <div class="px-4 sm:px-6 pb-6">
            <!-- Step Label and Progress Bar Row -->
            <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
                <!-- Step Label -->
                <div
                    v-if="getCurrentStepConfig().stepLabel"
                    class="text-xs text-[#121A22] uppercase tracking-wide">
                    {{ getCurrentStepConfig().stepLabel }}
                </div>

                <!-- Progress Bar (for steps 2-4) -->
                <div
                    v-if="showProgressBar"
                    class="flex-1 max-w-full sm:max-w-xs sm:ml-4">
                    <div class="flex items-center space-x-2">
                        <div
                            v-for="(step, index) in progressSteps"
                            :key="step"
                            :class="[
                                'h-2 rounded-full transition-all duration-300 flex-1',
                                index <= currentProgressIndex
                                    ? 'bg-gray-900'
                                    : 'bg-gray-200',
                            ]"></div>
                    </div>
                </div>
            </div>
            <!-- Step 1: Initial Form -->
            <div
                v-if="currentStep === 'initial'"
                class="space-y-4">
                <form
                    @submit.prevent="handleNext"
                    class="space-y-4">
                    <div class="flex flex-col gap-2">
                        <label for="">Full Name</label>
                        <InputText
                            v-model="formData.fullName"
                            placeholder="Enter your full name"
                            :pt="{
                                root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                            }" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="">Email Address</label>
                        <InputText
                            v-model="formData.email"
                            type="email"
                            placeholder="Enter your email address"
                            :pt="{
                                root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                            }" />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="">Price Range</label>
                            <Dropdown
                                v-model="formData.priceRange"
                                :options="priceRangeOptions"
                                optionLabel="label"
                                optionValue="value"
                                optionDisabled="disabled"
                                placeholder="Price Range"
                                :pt="{
                                    root: 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                    input: 'px-4 py-3',
                                }" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="">Preferred Location</label>
                            <Dropdown
                                v-model="formData.preferredLocation"
                                :options="preferredLocationOptions"
                                optionLabel="label"
                                optionValue="value"
                                optionDisabled="disabled"
                                placeholder="Location"
                                :pt="{
                                    root: 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                    input: 'px-4 py-3',
                                }" />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        :disabled="loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="w-full"
                        :pt="{
                            root: 'w-full mb-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? 'Saving...' : 'Save Search' }}
                    </Button>
                </form>
            </div>
            <div
                v-else-if="currentStep === 'motivation'"
                class="space-y-6">
                <!-- Step 2: Motivation -->
                <div class="space-y-3">
                    <div
                        v-for="option in motivationOptions"
                        :key="option.value"
                        @click="formData.motivation = option.value"
                        :class="[
                            'p-4 border-2 rounded-full cursor-pointer transition-all duration-200',
                            formData.motivation === option.value
                                ? ' bg-black text-white'
                                : 'border-gray-200 hover:border-gray-300',
                        ]">
                        <p class="text-sm font-medium">
                            {{ option.label }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <Button
                        @click="handlePrev"
                        outlined
                        class="flex-1 order-2 sm:order-1"
                        :pt="{
                            root: 'flex-1 px-4 sm:px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200',
                        }">
                        Start Over
                    </Button>

                    <Button
                        @click="handleNext"
                        :disabled="loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 order-1 sm:order-2"
                        :pt="{
                            root: 'flex-1 px-4 sm:px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? 'Saving...' : 'Next' }}
                    </Button>
                </div>
            </div>
            <div
                v-else-if="currentStep === 'budget'"
                class="space-y-6">
                <!-- Step 3: Budget -->
                <div class="space-y-3">
                    <div
                        v-for="option in budgetOptions"
                        :key="option.value"
                        @click="formData.budget = option.value"
                        :class="[
                            'p-4 border-2 rounded-full cursor-pointer transition-all duration-200',
                            formData.budget === option.value
                                ? 'bg-black text-white'
                                : 'border-gray-200 hover:border-gray-300',
                        ]">
                        <p class="text-sm font-medium">
                            {{ option.label }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <Button
                        @click="handlePrev"
                        outlined
                        class="flex-1 order-2 sm:order-1"
                        :pt="{
                            root: 'flex-1 px-4 sm:px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200',
                        }">
                        Back
                    </Button>

                    <Button
                        @click="handleNext"
                        :disabled="loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 order-1 sm:order-2"
                        :pt="{
                            root: 'flex-1 px-4 sm:px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? 'Saving...' : 'Next' }}
                    </Button>
                </div>
            </div>
            <div
                v-else-if="currentStep === 'location'"
                class="space-y-6">
                <!-- Step 4: Location -->
                <div class="space-y-3">
                    <div
                        v-for="option in locationTypeOptions"
                        :key="option.value"
                        @click="formData.locationType = option.value"
                        :class="[
                            'p-4 border-2 rounded-full cursor-pointer transition-all duration-200',
                            formData.locationType === option.value
                                ? 'bg-black text-white'
                                : 'border-gray-200 hover:border-gray-300',
                        ]">
                        <p class="text-sm font-medium">
                            {{ option.label }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <Button
                        @click="handlePrev"
                        outlined
                        class="flex-1 order-2 sm:order-1"
                        :pt="{
                            root: 'flex-1 px-4 sm:px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200',
                        }">
                        Back
                    </Button>

                    <Button
                        @click="handleNext"
                        :disabled="loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 order-1 sm:order-2"
                        :pt="{
                            root: 'flex-1 px-4 sm:px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        {{ loading ? 'Saving...' : 'Next' }}
                    </Button>
                </div>
            </div>
            <div
                v-else-if="currentStep === 'success'"
                class="text-center space-y-6">
                <!-- Step 5: Success -->
                <div
                    class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon
                        name="lucide:check"
                        class="w-8 h-8 text-green-600" />
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
                            root: 'flex-1 px-4 sm:px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                        }">
                        Continue to Dashboard
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

    :deep(.p-dialog-close-button) {
        display: hidden !important;
    }

    :deep(.p-button-icon) {
        display: hidden !important;
    }
</style>
