<script setup lang="ts">
type OnboardingStep = "motivation" | "budget" | "location" | "success"

const {citizen_user} = citizenAuth()

const props = defineProps<{modelValue: boolean}>()
const visible = ref(props.modelValue)

watch(
    () => props.modelValue,
    (newVal) => {
        visible.value = newVal
    }
)
watch(visible, (newVal) => {
    emit("update:modelValue", newVal)
    if (!newVal) emit("close")
})

const emit = defineEmits<{
    "update:modelValue": [value: boolean]
    "onboarding-complete": [data: OnboardingData]
    back: []
    close: []
}>()

interface OnboardingData {
    motivation: number | null
    budget: number | null
    locationType: number | null
}

interface QuestionAnswer {
    id: number
    answer_text: string
    user_type_id: number | null
    is_active: boolean
    minimum_amount: number | null
    maximum_amount: number | null
    area: string | null
    [key: string]: any
}

interface QuestionGroup {
    id: number
    name: string
    is_active: boolean
    created_at: string
}

interface Question {
    id: number
    question_group: QuestionGroup
    question_text: string
    is_active: boolean
    created_at: string
    answers: QuestionAnswer[]
}

interface QuestionsListResponse {
    status: string
    message: string
    data: {
        data: Question[]
        links: {
            first: string | null
            last: string | null
            prev: string | null
            next: string | null
        }
        meta: {
            current_page: number
            from: number
            last_page: number
            per_page: number
            to: number
            total: number
        }
        permissions?: {
            view: boolean
            add: boolean
            edit: boolean
            delete: boolean
        }
    }
}

interface UserType {
    id: number
    name: string
    slug: string
}

interface OnboardingResponse {
    status: string
    message: string
    data: {
        id: number
        name: string
        email: string
        user_onboard_profile_status: number
        user_type?: UserType[]
        [key: string]: any
    }
}

interface OptionItem {
    label: string
    value: number
}

const currentStep = ref<OnboardingStep>("motivation")
const loading = ref(false)
const questionsLoading = ref(false)
const showStartOverConfirm = ref(false)

const formData = reactive<OnboardingData>({
    motivation: null,
    budget: null,
    locationType: null,
})

const questions = ref<Question[]>([])
const motivationQuestion = ref<Question | null>(null)
const budgetQuestion = ref<Question | null>(null)
const locationQuestion = ref<Question | null>(null)

const motivationOptions = computed<OptionItem[]>(() => {
    if (!motivationQuestion.value) return []
    return motivationQuestion.value.answers
        .filter((answer) => answer.is_active)
        .map((answer) => ({
            label: answer.answer_text,
            value: answer.id,
        }))
})

const budgetOptions = computed<OptionItem[]>(() => {
    if (!budgetQuestion.value) return []
    return budgetQuestion.value.answers
        .filter((answer) => answer.is_active)
        .map((answer) => ({
            label: answer.answer_text,
            value: answer.id,
        }))
})

const locationTypeOptions = computed<OptionItem[]>(() => {
    if (!locationQuestion.value) return []
    return locationQuestion.value.answers
        .filter((answer) => answer.is_active)
        .map((answer) => ({
            label: answer.answer_text,
            value: answer.id,
        }))
})

const heroTitle = "You bring the dream. We'll map the way. ✨"

const stepConfigs = computed(() => ({
    motivation: {
        title: heroTitle,
        subtitle:
            motivationQuestion.value?.question_text ||
            "What's the heart behind your home search?",
        stepLabel: "Steps: 1/3",
    },
    budget: {
        title: heroTitle,
        subtitle:
            budgetQuestion.value?.question_text ||
            "What's your sweet spot, budget-wise? No judgment — just vibes and homes that fit",
        stepLabel: "Steps: 2/3",
    },
    location: {
        title: heroTitle,
        subtitle:
            locationQuestion.value?.question_text ||
            "Where's your dream home hiding? We'll find it together.",
        stepLabel: "Steps: 3/3",
    },
    success: {
        title: "Welcome to your home journey!",
        subtitle:
            "We've saved your preferences and we're ready to help you find your perfect home.",
        stepLabel: "",
    },
}))

const getCurrentStepConfig = () => stepConfigs.value[currentStep.value]

const progressSteps: OnboardingStep[] = ["motivation", "budget", "location"]
const showProgressBar = computed(() => progressSteps.includes(currentStep.value))
const currentProgressIndex = computed(() => progressSteps.indexOf(currentStep.value))

const fetchQuestions = async () => {
    questionsLoading.value = true
    try {
        const response = await $fetchCMS<QuestionsListResponse>(
            "/admin/question-banks/question/list",
            {
                method: "GET",
            }
        )

        if (response.status === "success" && response.data?.data) {
            questions.value = response.data.data

            motivationQuestion.value =
                response.data.data.find(
                    (q) =>
                        q.question_group.name === "user-type" && q.is_active
                ) || null

            budgetQuestion.value =
                response.data.data.find(
                    (q) =>
                        q.question_group.name === "price-range" &&
                        q.is_active
                ) || null

            locationQuestion.value =
                response.data.data.find(
                    (q) => q.question_group.name === "area" && q.is_active
                ) || null

            if (!formData.motivation && motivationQuestion.value) {
                const firstActive = motivationQuestion.value.answers.find(
                    (a) => a.is_active
                )
                formData.motivation = firstActive?.id ?? null
            }
        }
    } catch (error: any) {
        console.error("Failed to fetch questions:", error)
    } finally {
        questionsLoading.value = false
    }
}

const handleNext = () => {
    const steps: OnboardingStep[] = [
        "motivation",
        "budget",
        "location",
        "success",
    ]
    const currentIndex = steps.indexOf(currentStep.value)

    if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1]
        if (nextStep) {
            currentStep.value = nextStep
        }
    }
}

const handlePrev = () => {
    const steps: OnboardingStep[] = [
        "motivation",
        "budget",
        "location",
        "success",
    ]
    const currentIndex = steps.indexOf(currentStep.value)

    if (currentIndex > 0) {
        const prevStep = steps[currentIndex - 1]
        if (prevStep) {
            currentStep.value = prevStep
        }
    }
}

const getDefaultValues = computed(() => {
    const defaultMotivation = motivationQuestion.value?.answers.find(a => a.is_active)
    const defaultBudget = budgetQuestion.value?.answers.find(a => a.is_active)
    const defaultLocation = locationQuestion.value?.answers.find(a => a.is_active)

    return {
        role: defaultMotivation?.answer_text || 'Kamaina',
        budget: defaultBudget?.answer_text || 'Not specified',
        location: defaultLocation?.answer_text || 'Not specified'
    }
})

const handleStartOver = () => {
    showStartOverConfirm.value = true
}

const confirmStartOver = async () => {
    showStartOverConfirm.value = false
    loading.value = true

    try {
        const defaultMotivation = motivationQuestion.value?.answers.find(a => a.is_active)
        const defaultBudget = budgetQuestion.value?.answers.find(a => a.is_active)
        const defaultLocation = locationQuestion.value?.answers.find(a => a.is_active)

        const payload = new FormData()

        if (defaultMotivation?.id) {
            payload.append("question_answer_one", defaultMotivation.id.toString())
        }
        if (defaultBudget?.id) {
            payload.append("question_answer_two", defaultBudget.id.toString())
        }
        if (defaultLocation?.id) {
            payload.append("question_answer_three", defaultLocation.id.toString())
        }

        const response = await $fetchCMS<OnboardingResponse>(
            "/v1/user/onboard",
            {
                method: "POST",
                body: payload,
            }
        )

        if (
            import.meta.client &&
            response.data.user_onboard_profile_status !== undefined
        ) {
            const userId = localStorage.getItem("citizen_user_id")

            if (userId) {
                const onboardingStatusKey = `citizen_onboard_status_${userId}`
                localStorage.setItem(
                    onboardingStatusKey,
                    response.data.user_onboard_profile_status.toString()
                )

                const userData = localStorage.getItem("citizen_user_data")
                if (userData) {
                    try {
                        const parsedUserData = JSON.parse(userData)
                        parsedUserData.user_onboard_profile_status =
                            response.data.user_onboard_profile_status
                        localStorage.setItem(
                            "citizen_user_data",
                            JSON.stringify(parsedUserData)
                        )
                    } catch (e) {
                        console.error("Failed to update user data:", e)
                    }
                }
            }

            localStorage.removeItem("citizen_user_onboard_profile_status")
            localStorage.removeItem("citizen_needs_onboarding")
        }

        citizen_user.value = response

        const redirectSlug = response.data.user_type?.[0]?.slug || "kamaina"
        const targetPath =
            redirectSlug === "kamaaina" ? "/kamaina/" : `/${redirectSlug}/`
        window.location.href = targetPath
    } catch (error: any) {
        console.error("Onboarding with defaults failed:", error)

        if (import.meta.client) {
            const errorMessage =
                error?.data?.message ||
                "Failed to complete onboarding. Please try again."
            alert(errorMessage)
        }
    } finally {
        loading.value = false
    }
}

const cancelStartOver = () => {
    showStartOverConfirm.value = false
}

const closeHandler = () => {
    emit("close")
}

const handleComplete = async () => {
    loading.value = true

    try {
        const payload = new FormData()

        if (formData.motivation !== null) {
            payload.append("question_answer_one", formData.motivation.toString())
        }
        if (formData.budget !== null) {
            payload.append("question_answer_two", formData.budget.toString())
        }
        if (formData.locationType !== null) {
            payload.append(
                "question_answer_three",
                formData.locationType.toString()
            )
        }

        const response = await $fetchCMS<OnboardingResponse>(
            "/v1/user/onboard",
            {
                method: "POST",
                body: payload,
            }
        )

        if (
            import.meta.client &&
            response.data.user_onboard_profile_status !== undefined
        ) {
            const userId = localStorage.getItem("citizen_user_id")

            if (userId) {
                const onboardingStatusKey = `citizen_onboard_status_${userId}`
                localStorage.setItem(
                    onboardingStatusKey,
                    response.data.user_onboard_profile_status.toString()
                )

                const userData = localStorage.getItem("citizen_user_data")
                if (userData) {
                    try {
                        const parsedUserData = JSON.parse(userData)
                        parsedUserData.user_onboard_profile_status =
                            response.data.user_onboard_profile_status
                        localStorage.setItem(
                            "citizen_user_data",
                            JSON.stringify(parsedUserData)
                        )
                    } catch (e) {
                        console.error("Failed to update user data:", e)
                    }
                }
            }

            localStorage.removeItem("citizen_user_onboard_profile_status")
            localStorage.removeItem("citizen_needs_onboarding")
        }

        citizen_user.value = response
        emit("onboarding-complete", {...formData})

        const redirectSlug = response.data.user_type?.[0]?.slug || "kamaina"
        const targetPath =
            redirectSlug === "kamaaina" ? "/kamaina/" : `/${redirectSlug}/`
        window.location.href = targetPath
    } catch (error: any) {
        console.error("Onboarding save failed:", error)

        if (import.meta.client) {
            const errorMessage =
                error?.data?.message ||
                "Failed to complete onboarding. Please try again."
            alert(errorMessage)
        }
    } finally {
        loading.value = false
    }
}

watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue && questions.value.length === 0) {
            fetchQuestions()
        }
    },
    {immediate: true}
)

watch(
    () => props.modelValue,
    (newValue) => {
        if (import.meta.client) {
            document.body.style.overflow = newValue ? "hidden" : ""
        }
    }
)
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :draggable="false"
        :resizable="false"
        class="citizen-onboarding-modal"
        :style="{width: 'min(44rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4 bg-white',
            header: 'border-0 pb-[0px!important]',
            content: 'border-0 pt-[0px!important] pb-[0px!important]',
        }">
        <template #header>
            <div class="absolute right-0 top-0 z-50">
                <button
                    @click="closeHandler"
                    class="w-14 h-14 flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-[0.9375rem] rounded-tr-[0.625rem] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-2xl"></i>
                </button>
            </div>
            <div class="w-full text-center px-6 pt-8 pb-0">
                <h1
                    class="text-2xl md:text-3xl lg:text-4xl leading-tight max-w-[25.25rem] mx-auto text-[#121A22] font-medium">
                    {{ getCurrentStepConfig().title }}
                </h1>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-8 flex flex-col gap-12">
            <div class="flex items-center justify-between w-full">
                <div
                    v-if="getCurrentStepConfig().stepLabel"
                    class="text-xs sm:text-sm leading-normal text-[#121A22]">
                    <span class="font-normal">Steps: </span>
                    <span class="font-bold">{{ currentProgressIndex + 1 }}</span>
                    <span class="font-normal">/</span>
                    <span class="font-normal text-[#283849]">{{ progressSteps.length }}</span>
                </div>

                <div
                    v-if="showProgressBar"
                    class="flex items-center gap-[0.4375rem]">
                    <div
                        v-for="(step, index) in progressSteps"
                        :key="step"
                        :class="[
                            'h-1.5 w-[4.0625rem] rounded-full transition-all duration-300',
                            index <= currentProgressIndex
                                ? 'bg-[#18222c]'
                                : 'bg-[#f0f1f3]',
                        ]"></div>
                </div>
            </div>

            <!-- Step 1: Motivation -->
            <div
                v-if="currentStep === 'motivation'"
                class="flex flex-col gap-6">
                <div class="flex flex-col gap-4">
                    <p
                        v-if="getCurrentStepConfig().subtitle"
                        class="text-xl md:text-2xl lg:text-3xl leading-tight text-[#121A22] font-medium">
                        {{ getCurrentStepConfig().subtitle }}
                    </p>
                </div>
                <div class="flex flex-col gap-9">
                    <div
                        v-if="questionsLoading"
                        class="flex flex-col gap-5">
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div
                        v-else
                        class="flex flex-wrap gap-3 max-w-full sm:max-w-[39.8125rem]">
                        <div
                            v-for="option in motivationOptions"
                            :key="option.value"
                            @click="formData.motivation = option.value"
                            :class="[
                                'inline-flex min-h-14 items-center px-5 py-2.5 rounded-[6.1875rem] cursor-pointer transition-all duration-200 text-xs sm:text-sm font-medium leading-tight whitespace-pre',
                                formData.motivation === option.value
                                    ? 'bg-[#18222c] text-white'
                                    : 'bg-[#F0F1F3] text-[#283849] hover:bg-[#e5e7eb]',
                            ]">
                            {{ option.label }}
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-6">
                    <button
                        @click="handleStartOver"
                        outlined
                        class="flex-1 basis-0 w-full h-[3.25rem] px-4 py-3 bg-[#F0F1F3] hover:bg-[#e5e7eb] disabled:bg-gray-300 text-[#121a22] text-base font-bold leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center">
                        Start Over
                    </button>

                    <button
                        @click="handleNext"
                        :disabled="!formData.motivation || loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 basis-0 w-full h-[3.25rem] px-5 py-3.5 text-base font-bold leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 bg-[#121A22] hover:bg-[#0F172A] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>

            <!-- Step 2: Budget -->
            <div
                v-else-if="currentStep === 'budget'"
                class="flex flex-col gap-6">
                <div class="flex flex-col gap-4">
                    <p
                        v-if="getCurrentStepConfig().subtitle"
                        class="text-xl md:text-2xl lg:text-3xl leading-tight text-[#121A22] font-medium">
                        {{ getCurrentStepConfig().subtitle }}
                    </p>
                </div>
                <div class="flex flex-col gap-9">
                    <div
                        v-if="questionsLoading"
                        class="flex flex-col gap-5">
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div
                        v-else
                        class="flex flex-wrap gap-3 max-w-full sm:max-w-[39.8125rem]">
                        <div
                            v-for="option in budgetOptions"
                            :key="option.value"
                            @click="formData.budget = option.value"
                            :class="[
                                'inline-flex min-h-14 items-center px-5 py-2.5 rounded-[6.1875rem] cursor-pointer transition-all duration-200 text-xs sm:text-sm font-medium leading-tight whitespace-pre',
                                formData.budget === option.value
                                    ? 'bg-[#18222c] text-white'
                                    : 'bg-[#F0F1F3] text-[#283849] hover:bg-[#e5e7eb]',
                            ]">
                            {{ option.label }}
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-6">
                    <button
                        @click="handlePrev"
                        outlined
                        class="flex-1 basis-0 w-full h-[3.25rem] px-4 py-3 bg-[#F0F1F3] hover:bg-[#e5e7eb] disabled:bg-gray-300 text-[#121a22] text-base font-bold leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center">
                        Back
                    </button>

                    <button
                        @click="handleNext"
                        :disabled="!formData.budget || loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 basis-0 w-full h-[3.25rem] px-5 py-3.5 text-base font-bold leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 bg-[#121A22] hover:bg-[#0F172A] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>

            <!-- Step 3: Location -->
            <div
                v-else-if="currentStep === 'location'"
                class="flex flex-col gap-6">
                <div class="flex flex-col gap-4">
                    <p
                        v-if="getCurrentStepConfig().subtitle"
                        class="text-xl md:text-2xl lg:text-3xl leading-tight text-[#121A22] font-medium">
                        {{ getCurrentStepConfig().subtitle }}
                    </p>
                </div>
                <div class="flex flex-col gap-9">
                    <div
                        v-if="questionsLoading"
                        class="flex flex-col gap-5">
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div
                            class="p-4 border-2 border-gray-200 rounded-full animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div
                        v-else
                        class="flex flex-wrap gap-3 max-w-full sm:max-w-[39.8125rem]">
                        <div
                            v-for="option in locationTypeOptions"
                            :key="option.value"
                            @click="formData.locationType = option.value"
                            :class="[
                                'inline-flex min-h-14 items-center px-5 py-2.5 rounded-[6.1875rem] cursor-pointer transition-all duration-200 text-xs sm:text-sm font-medium leading-tight whitespace-pre',
                                formData.locationType === option.value
                                    ? 'bg-[#18222c] text-white'
                                    : 'bg-[#F0F1F3] text-[#283849] hover:bg-[#e5e7eb]',
                            ]">
                            {{ option.label }}
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-6">
                    <button
                        @click="handlePrev"
                        outlined
                        class="flex-1 basis-0 w-full h-[3.25rem] px-4 py-3 bg-[#F0F1F3] hover:bg-[#e5e7eb] disabled:bg-gray-300 text-[#121a22] text-base font-bold leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center">
                        Back
                    </button>

                    <button
                        @click="handleNext"
                        :disabled="!formData.locationType || loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 basis-0 w-full h-[3.25rem] px-5 py-3.5 text-base font-bold leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 bg-[#121A22] hover:bg-[#0F172A] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>

            <!-- Step 4: Success -->
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
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Perfect! Your preferences are saved.
                    </h3>
                    <p class="text-gray-600 text-sm">
                        We'll use your preferences to find the perfect homes for
                        you.
                    </p>
                </div>

                <div class="space-y-3">
                    <button
                        @click="handleComplete"
                        :disabled="loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="w-full px-6 py-3 bg-[#18222c] hover:bg-[#0F172A] disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-200 flex items-center justify-center">
                        {{ loading ? "Saving..." : "Continue to Dashboard" }}
                    </button>
                </div>
            </div>
        </div>
    </Dialog>

    <!-- Start Over Confirmation Dialog -->
    <Dialog
        v-model:visible="showStartOverConfirm"
        modal
        :closable="false"
        :draggable="false"
        :resizable="false"
        :style="{width: 'min(32rem, 90vw)', maxWidth: '90vw'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4 bg-white',
            header: 'border-0 pb-3',
            content: 'border-0 pt-0 pb-6',
        }">
        <template #header>
            <div class="w-full px-6 pt-6">
                <h3 class="text-xl font-semibold text-[#121A22]">Start with Default Settings?</h3>
            </div>
        </template>

        <div class="px-6 space-y-4">
            <p class="text-base text-[#283849] leading-relaxed">
                You will be onboarded with the following default values:
            </p>

            <div class="bg-[#F0F1F3] rounded-lg p-4 space-y-2">
                <div class="flex items-start gap-2">
                    <i class="pi pi-user text-[#18222c] mt-1"></i>
                    <div>
                        <p class="text-sm font-semibold text-[#121A22]">Default Role</p>
                        <p class="text-sm text-[#283849]">{{ getDefaultValues.role }}</p>
                    </div>
                </div>
                <div class="flex items-start gap-2">
                    <i class="pi pi-dollar text-[#18222c] mt-1"></i>
                    <div>
                        <p class="text-sm font-semibold text-[#121A22]">Default Budget</p>
                        <p class="text-sm text-[#283849]">{{ getDefaultValues.budget }}</p>
                    </div>
                </div>
                <div class="flex items-start gap-2">
                    <i class="pi pi-map-marker text-[#18222c] mt-1"></i>
                    <div>
                        <p class="text-sm font-semibold text-[#121A22]">Default Location</p>
                        <p class="text-sm text-[#283849]">{{ getDefaultValues.location }}</p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                    @click="cancelStartOver"
                    :disabled="loading"
                    class="flex-1 h-11 px-4 py-2.5 bg-[#F0F1F3] hover:bg-[#e5e7eb] disabled:bg-gray-300 text-[#121a22] text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center">
                    Cancel
                </button>
                <button
                    @click="confirmStartOver"
                    :disabled="loading"
                    class="flex-1 h-11 px-4 py-2.5 bg-[#18222c] hover:bg-[#0F172A] disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                    <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                    <span>{{ loading ? 'Processing...' : 'Okay' }}</span>
                </button>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.citizen-onboarding-modal .p-dialog {
    border-radius: 0.625rem;
}

.citizen-onboarding-modal .p-dialog-header {
    border: none;
    padding: 0;
}

.citizen-onboarding-modal .p-dialog-content {
    border: none;
    padding: 0;
}
</style>
