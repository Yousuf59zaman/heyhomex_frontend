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

    const stepConfigs = computed(() => ({
        motivation: {
            title: "You bring the dream. We'll map the way. ✨",
            subtitle:
                motivationQuestion.value?.question_text ||
                "What's the heart behind your home search?",
            stepLabel: "Step: 1/3",
        },
        budget: {
            title: "You bring the dream. We'll map the way. ✨",
            subtitle:
                budgetQuestion.value?.question_text ||
                "What's your sweet spot, budget-wise?\nNo judgment — just vibes and homes that fit",
            stepLabel: "Step: 2/3",
        },
        location: {
            title: "You bring the dream. We'll map the way. ✨",
            subtitle:
                locationQuestion.value?.question_text ||
                "Where's your dream home hiding? We'll find it together.",
            stepLabel: "Step: 3/3",
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
    const showProgressBar = computed(() =>
        progressSteps.includes(currentStep.value)
    )
    const currentProgressIndex = computed(() =>
        progressSteps.indexOf(currentStep.value)
    )

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
            }
        } catch (error: any) {
            console.error("Failed to fetch questions:", error)

            if (import.meta.client) {
                const errorMessage =
                    error?.data?.message ||
                    "Failed to load questions. Please try again."
                // alert(errorMessage)
            }
        } finally {
            questionsLoading.value = false
        }
    }

    const closeModal = () => {
        emit("update:modelValue", false)
        emit("close")
        setTimeout(() => {
            currentStep.value = "motivation"
        }, 300)
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

    const closeHandler = () => {
        emit("close")
    }

    const handleComplete = async () => {
        loading.value = true

        try {
            const payload = new FormData()

            if (formData.motivation !== null) {
                payload.append(
                    "question_answer_one",
                    formData.motivation.toString()
                )
            }
            if (formData.budget !== null) {
                payload.append(
                    "question_answer_two",
                    formData.budget.toString()
                )
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

            // const redirectSlug = response.data.user_type?.[0]?.slug || "kamaina"
            // const targetPath =
            //     redirectSlug === "kamaaina" ? "/kamaina/" : `/${redirectSlug}/`
            // navigateTo(targetPath)
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
        :style="{width: 'min(38rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl m-4',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div class="absolute right-[0px] top-[0px] z-50">
                <button
                    @click="closeHandler"
                    class="w-[40px] h-[47px] flex items-center justify-center bg-black/50 text-white cursor-pointer rounded-bl-[15px] rounded-tr-[15px] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-xl"></i>
                </button>
            </div>
            <div
                class="w-full text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <h1
                    class="text-2xl sm:text-3xl max-w-sm mx-auto  text-[#121A22] mb-2 leading-tight" style="font-family: sf-pro-Medium;">
                    {{ getCurrentStepConfig().title }}
                </h1>
            </div>
        </template>

        <!-- Content -->
        <div class="px-2 sm:px-2 pb-6">
            <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
                <div
                    v-if="getCurrentStepConfig().stepLabel"
                    class="text-xs text-[#121A22] uppercase tracking-wide">
                    {{ getCurrentStepConfig().stepLabel }}
                </div>

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

            <!-- Step 1: Motivation -->
            <div
                v-if="currentStep === 'motivation'"
                class="space-y-6">
                <p
                    v-if="getCurrentStepConfig().subtitle"
                    class="text-2xl text-[#121A22] whitespace-pre-line" style="font-family: sf-pro-Medium;">
                    {{ getCurrentStepConfig().subtitle }}
                </p>
                <div
                    v-if="questionsLoading"
                    class="space-y-3">
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
                    class="space-y-3 space-x-2">
                    <div
                        v-for="option in motivationOptions"
                        :key="option.value"
                        @click="formData.motivation = option.value"
                        :class="[
                            'inline-flex py-3 px-4  rounded-full cursor-pointer transition-all duration-200',
                            formData.motivation === option.value
                                ? 'bg-black text-white'
                                : 'bg-[#F0F1F3] hover:bg-[#e3e4e6]',
                        ]">
                        <p class="text-sm font-medium">
                            {{ option.label }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button
                        @click="handleNext"
                        outlined
                        class="flex-1 order-2 sm:order-1 w-full px-6 py-3 bg-[#F0F1F3] hover:bg-[#e3e4e6] disabled:bg-gray-400 text-black font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                        Start Over
                    </button>

                    <button
                        @click="handleNext"
                        :disabled="!formData.motivation || loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 order-1 sm:order-2 w-full px-6 py-3.5 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white">
                        Next
                    </button>
                </div>
            </div>

            <!-- Step 2: Budget -->
            <div
                v-else-if="currentStep === 'budget'"
                class="space-y-6">
                <p
                    v-if="getCurrentStepConfig().subtitle"
                    class="text-2xl  text-[#121A22] whitespace-pre-line" style="font-family: sf-pro-Medium;">
                    {{ getCurrentStepConfig().subtitle }}
                </p>
                <div
                    v-if="questionsLoading"
                    class="space-y-3">
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
                    class="space-y-3 space-x-3">
                    <div
                        v-for="option in budgetOptions"
                        :key="option.value"
                        @click="formData.budget = option.value"
                        :class="[
                            'inline-flex py-3 px-5  rounded-full cursor-pointer transition-all duration-200',
                            formData.budget === option.value
                                ? 'bg-black text-white'
                                : 'bg-[#F0F1F3] hover:bg-[#e3e4e6]',
                        ]">
                        <p class="text-sm font-medium">
                            {{ option.label }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button
                        @click="handlePrev"
                        outlined
                        class="flex-1 order-2 sm:order-1 w-full px-6 py-3 bg-[#F0F1F3] hover:bg-[#e3e4e6] disabled:bg-gray-400 text-black font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                        Back
                    </button>

                    <button
                        @click="handleNext"
                        :disabled="!formData.budget || loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 order-1 sm:order-2 w-full px-6 py-3.5 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white">
                        Next
                    </button>
                </div>
            </div>

            <!-- Step 3: Location -->
            <div
                v-else-if="currentStep === 'location'"
                class="space-y-6">
                <p
                    v-if="getCurrentStepConfig().subtitle"
                    class="text-2xl  text-[#121A22] whitespace-pre-line" style="font-family: sf-pro-Medium;">
                    {{ getCurrentStepConfig().subtitle }}
                </p>
                <div
                    v-if="questionsLoading"
                    class="space-y-3">
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
                    class="space-y-3 space-x-3">
                    <div
                        v-for="option in locationTypeOptions"
                        :key="option.value"
                        @click="formData.locationType = option.value"
                        :class="[
                            'inline-flex py-3 px-5 rounded-full cursor-pointer transition-all duration-200',
                            formData.locationType === option.value
                                ? 'bg-black text-white'
                                : 'bg-[#F0F1F3] hover:bg-[#e3e4e6]',
                        ]">
                        <p class="text-sm font-medium">
                            {{ option.label }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button
                        @click="handlePrev"
                        outlined
                        class="flex-1 order-2 sm:order-1 w-full px-6 py-3 bg-[#F0F1F3] hover:bg-[#e3e4e6] disabled:bg-gray-400 text-black font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                        Back
                    </button>

                    <button
                        @click="handleNext"
                        :disabled="!formData.locationType || loading"
                        :loading="loading"
                        loadingIcon="pi pi-spin pi-spinner"
                        class="flex-1 order-1 sm:order-2 w-full px-6 py-3.5 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white">
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
                        class="w-full px-6 py-3 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                        {{ loading ? "Saving..." : "Continue to Dashboard" }}
                    </button>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-onboarding-modal .p-dialog {
        border-radius: 1rem;
    }

    .citizen-onboarding-modal .p-dialog-header {
        border: none;
        padding-bottom: 0;
    }

    .citizen-onboarding-modal .p-dialog-content {
        border: none;
        padding-top: 0;
        padding-bottom: 1.5rem;
    }
</style>
