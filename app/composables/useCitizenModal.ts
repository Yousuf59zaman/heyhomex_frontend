export type AuthStep =
    | "initial"
    | "motivation"
    | "budget"
    | "location"
    | "success";

export interface UserFormData {
    // Step 1: Initial Info
    fullName: string;
    email: string;
    priceRange: string;
    preferredLocation: string;

    // Step 2: Motivation
    motivation: string;

    // Step 3: Budget
    budget: string;

    // Step 4: Location
    locationType: string;
}

interface AuthModalState {
    isOpen: boolean;
    step: AuthStep;
    userData: Partial<UserFormData>;
    completedSteps: AuthStep[];
    loading: boolean;
    errors: Record<string, string>;
}

// Step configurations for developer-friendly setup
export const STEP_CONFIG = {
    initial: {
        title: "You bring the dream. We'll map the way. ✨",
        subtitle: "",
        stepLabel: "",
        fields: ["fullName", "email", "priceRange", "preferredLocation"],
        apiEndpoint: "/api/user/initial-info",
        validation: {
            fullName: { required: true, minLength: 2 },
            email: { required: true, email: true },
            priceRange: { required: true },
            preferredLocation: { required: true },
        },
    },
    motivation: {
        title: "You bring the dream. We'll map the way. ✨",
        subtitle: "What's the heart behind your home search?",
        stepLabel: "Step: 1/3",
        fields: ["motivation"],
        apiEndpoint: "/api/user/motivation",
        validation: {
            motivation: { required: true },
        },
    },
    budget: {
        title: "You bring the dream. We'll map the way. ✨",
        subtitle:
            "What's your sweet spot, budget-wise?\nNo judgment — just vibes and homes that fit",
        stepLabel: "Step: 2/3",
        fields: ["budget"],
        apiEndpoint: "/api/user/budget",
        validation: {
            budget: { required: true },
        },
    },
    location: {
        title: "You bring the dream. We'll map the way. ✨",
        subtitle: "Where's your dream home hiding? We'll find it together.",
        stepLabel: "Step: 3/3",
        fields: ["locationType"],
        apiEndpoint: "/api/user/location",
        validation: {
            locationType: { required: true },
        },
    },
    success: {
        title: "Welcome to your home journey!",
        subtitle:
            "We've saved your preferences and we're ready to help you find your perfect home.",
        stepLabel: "",
        fields: [],
        apiEndpoint: null,
        validation: {},
    },
};

// Choice options for each step
export const STEP_OPTIONS = {
    priceRange: [
        { label: "Select price range", value: "", disabled: true },
        { label: "$0 - $300K", value: "0-300k" },
        { label: "$300K - $600K", value: "300k-600k" },
        { label: "$600K - $1M", value: "600k-1m" },
        { label: "$1M+", value: "1m+" },
    ],
    preferredLocation: [
        { label: "Select Preferred location", value: "", disabled: true },
        { label: "Urban", value: "urban" },
        { label: "Suburban", value: "suburban" },
        { label: "Rural", value: "rural" },
        { label: "Coastal", value: "coastal" },
    ],
    motivation: [
        { label: "I'm planting roots — this is home", value: "planting_roots" },
        {
            label: "Here on orders — base life meets island life",
            value: "military_orders",
        },
        {
            label: "I'm scouting the next big opportunity",
            value: "investment_opportunity",
        },
    ],
    budget: [
        { label: "$400k - $600k", value: "400k-600k" },
        { label: "$600k - 1.2m", value: "600k-1.2m" },
        { label: "1.2+", value: "1.2m+" },
    ],
    locationType: [
        { label: "City", value: "city" },
        { label: "Suburbs", value: "suburbs" },
        { label: "All of it", value: "all" },
    ],
};

// Global reactive state
const modalState = reactive<AuthModalState>({
    isOpen: false,
    step: "initial",
    userData: {},
    completedSteps: [],
    loading: false,
    errors: {},
});

// API service for making calls
const apiService = {
    async saveStepData(step: AuthStep, data: Partial<UserFormData>) {
        const config = STEP_CONFIG[step];
        if (!config.apiEndpoint) return { success: true, data };

        // Simulate API call - replace with actual implementation
        return new Promise<{ success: boolean; data?: any; error?: string }>(
            (resolve) => {
                setTimeout(() => {
                    // Simulate success/error based on data
                    if (Math.random() > 0.1) {
                        // 90% success rate for demo
                        resolve({
                            success: true,
                            data: { id: Date.now(), ...data },
                        });
                    } else {
                        resolve({
                            success: false,
                            error: "Failed to save data. Please try again.",
                        });
                    }
                }, 1500);
            }
        );
    },
};

// Validation service
const validationService = {
    validateField(field: string, value: any, rules: any): string | null {
        if (rules.required && (!value || value.toString().trim() === "")) {
            return `${field} is required`;
        }

        if (rules.email && value && !this.isValidEmail(value)) {
            return "Please enter a valid email address";
        }

        if (rules.minLength && value && value.length < rules.minLength) {
            return `${field} must be at least ${rules.minLength} characters`;
        }

        return null;
    },

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validateStep(
        step: AuthStep,
        data: Partial<UserFormData>
    ): Record<string, string> {
        const config = STEP_CONFIG[step];
        const errors: Record<string, string> = {};

        config.fields.forEach((field) => {
            const rules = (config.validation as Record<string, any>)[field];
            if (rules) {
                const error = this.validateField(
                    field,
                    data[field as keyof UserFormData],
                    rules
                );
                if (error) {
                    errors[field] = error;
                }
            }
        });

        return errors;
    },
};

export const useCitizenModal = () => {
    // Actions
    const openModal = (initialStep: AuthStep = "initial") => {
        modalState.isOpen = true;
        modalState.step = initialStep;
        modalState.errors = {};
    };

    const closeModal = () => {
        modalState.isOpen = false;
        // Reset after animation completes
        setTimeout(() => {
            modalState.step = "initial";
            modalState.userData = {};
            modalState.completedSteps = [];
            modalState.errors = {};
            modalState.loading = false;
        }, 300);
    };

    const nextStep = async (formData?: Partial<UserFormData>) => {
        const currentStepData = formData || modalState.userData;

        // Validate current step
        const errors = validationService.validateStep(
            modalState.step,
            currentStepData
        );
        modalState.errors = errors;

        if (Object.keys(errors).length > 0) {
            return false;
        }

        // Update user data
        Object.assign(modalState.userData, currentStepData);

        // Save to API
        modalState.loading = true;
        try {
            const result = await apiService.saveStepData(
                modalState.step,
                currentStepData
            );

            if (!result.success) {
                modalState.errors = {
                    general: result.error || "Failed to save data",
                };
                modalState.loading = false;
                return false;
            }

            // Mark step as completed
            if (!modalState.completedSteps.includes(modalState.step)) {
                modalState.completedSteps.push(modalState.step);
            }

            // Move to next step
            const steps: AuthStep[] = [
                "initial",
                "motivation",
                "budget",
                "location",
                "success",
            ];
            const currentIndex = steps.indexOf(modalState.step);
            if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1];
                if (nextStep) {
                    modalState.step = nextStep;
                }
            }

            modalState.loading = false;
            return true;
        } catch (error) {
            modalState.errors = { general: "Network error. Please try again." };
            modalState.loading = false;
            return false;
        }
    };

    const prevStep = () => {
        const steps: AuthStep[] = [
            "initial",
            "motivation",
            "budget",
            "location",
            "success",
        ];
        const currentIndex = steps.indexOf(modalState.step);
        if (currentIndex > 0) {
            const prevStep = steps[currentIndex - 1];
            if (prevStep) {
                modalState.step = prevStep;
                modalState.errors = {};
            }
        }
    };

    const setStep = (step: AuthStep) => {
        modalState.step = step;
        modalState.errors = {};
    };

    const updateUserData = (data: Partial<UserFormData>) => {
        Object.assign(modalState.userData, data);
    };

    const clearErrors = () => {
        modalState.errors = {};
    };

    const startOver = () => {
        modalState.step = "initial";
        modalState.userData = {};
        modalState.completedSteps = [];
        modalState.errors = {};
    };

    // Computed values
    const isOpen = computed(() => modalState.isOpen);
    const currentStep = computed(() => modalState.step);
    const userData = computed(() => modalState.userData);
    const completedSteps = computed(() => modalState.completedSteps);
    const loading = computed(() => modalState.loading);
    const errors = computed(() => modalState.errors);
    const currentStepConfig = computed(() => STEP_CONFIG[modalState.step]);
    const currentStepOptions = computed(() => {
        const step = modalState.step;
        return {
            priceRange: step === "initial" ? STEP_OPTIONS.priceRange : [],
            preferredLocation:
                step === "initial" ? STEP_OPTIONS.preferredLocation : [],
            motivation: step === "motivation" ? STEP_OPTIONS.motivation : [],
            budget: step === "budget" ? STEP_OPTIONS.budget : [],
            locationType: step === "location" ? STEP_OPTIONS.locationType : [],
        };
    });

    return {
        // State
        isOpen,
        currentStep,
        userData,
        completedSteps,
        loading,
        errors,
        currentStepConfig,
        currentStepOptions,

        // Actions
        openModal,
        closeModal,
        nextStep,
        prevStep,
        setStep,
        updateUserData,
        clearErrors,
        startOver,
    };
};

const updateUserData = (data: Partial<AuthModalState["userData"]>) => {
    modalState.userData = { ...modalState.userData, ...data };
};
