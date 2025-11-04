<script setup>
    const baseURL = useRuntimeConfig().public.API_BASE_URL

    // Props
    const props = defineProps({
        modelValue: {
            type: Boolean,
            required: true,
        },
    })

    // Emits
    const emit = defineEmits(["update:modelValue", "next", "close"])

    // Computed for two-way binding
    const visible = computed({
        get: () => props.modelValue,
        set: (value) => emit("update:modelValue", value),
    })

    // Datas
    const validations_errors = ref({})
    const skip_validations = ref([])
    const formData = ref({
        email: "",
    })
    const setUuid = useState('uuid', () => ({
        uuid: ''
    }))

    // Clear uuid when modal opens
    watch(
        () => props.modelValue,
        (newValue) => {
            if (newValue && setUuid.value?.uuid) {
                setUuid.value = { uuid: '' }
            }
        }
    )
    const emailError = ref("")
    const isLoading = ref(false)

    // Methods
    const closeModal = () => {
        emit("update:modelValue", false)
        emit("close")
        setTimeout(() => {
            formData.value.email = ""
            validations_errors.value = {}
        }, 300)
    }

    const handleBack = () => {
        closeModal()
    }

    const handleSubmit = async () => {
        validations_errors.value = {};
        const errors = Object.keys(formData.value).filter(
            (item) =>
                !formData.value[item] && !skip_validations.value.includes(item)
        )
        
        if (errors.length > 0) {
            errors.map((item) => {
                validations_errors.value[item] = `Email is required`
            })
            console.log(validations_errors.value)
            return;
        }

        try {
            isLoading.value = true

            const response = await $fetch(`${baseURL}reg-otp-flow`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: { ...formData.value },
            })

            if (response?.status === "success") {
                // save uuid for verification step
                setUuid.value = { ...(setUuid.value || {}), uuid: response.data?.uuid }

                // only proceed to next on success
                emit("next", formData.value.email)
                closeModal()
            } else {
                validations_errors.value.message = response?.message || "Unable to send OTP. Please try again."
            }
        } catch (e) {
            console.log("Get Message", e instanceof Error ? e.message : String(e))
            const status = e?.response?.status
            if (status === 422 || status === 409) {
                const errorsData = e.response?._data?.data || {}
                for (const key in errorsData) {
                    if (errorsData.hasOwnProperty(key)) {
                        validations_errors.value[key] = errorsData[key][0]
                    }
                }
            } else if (status === 404) {
                validations_errors.value.message = e.response?._data?.message || 'Resource not found.'
            } else {
                validations_errors.value.message = e?.message || "Something went wrong. Please try again."
            }
        } finally {
            isLoading.value = false
        }
    }

    const handleNext = () => {
        console.log("handle next called")
        handleSubmit()
    }

    // Prevent body scroll when modal is open
    watch(
        () => props.modelValue,
        (newValue) => {
            if (import.meta.client) {
                document.body.style.overflow = newValue ? "hidden" : ""
            }
        }
    )

    // Cleanup on unmount
    onUnmounted(() => {
        if (import.meta.client) {
            document.body.style.overflow = ""
        }
    })
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-send-otp-modal"
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
                        Add your email
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-6 space-y-4">
            <!-- Email Input -->
            <div class="flex flex-col gap-2">
                <label
                    for="email"
                    class="text-sm font-medium text-gray-700"
                    >Email Address</label
                >
                <InputText
                    id="email"
                    v-model="formData.email"
                    type="email"
                    placeholder="Enter your email address"
                    @keyup.enter="handleNext"
                    :pt="{
                        root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                    }" />
                <span
                    v-if="validations_errors.email"
                    class="text-xs text-red-500">
                    {{ validations_errors.email }}
                </span>
            </div>

            <!-- Next Button -->
            <button
                @click="handleNext"
                :disabled="isLoading"
                type="button"
                class="w-full px-6 py-3.5 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                :class="
                    isLoading
                        ? 'bg-[#606e83] text-white cursor-not-allowed'
                        : 'bg-[#1E293B] hover:bg-[#0F172A] text-white'
                ">
                <svg
                    v-if="isLoading"
                    class="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? "Loading..." : "Next" }}
            </button>

            <!-- Terms and Privacy -->
            <div class="text-center pt-2">
                <p class="text-xs text-gray-600">
                    By using heyhomex, you agree to the
                    <a
                        href="/terms"
                        class="text-gray-900 font-medium hover:underline"
                        >Terms</a
                    >
                    and
                    <a
                        href="/privacy"
                        class="text-gray-900 font-medium hover:underline"
                        >Privacy Policy</a
                    >.
                </p>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-send-otp-modal .p-dialog {
        border-radius: 1rem;
    }

    .citizen-send-otp-modal .p-dialog-header {
        border: none;
    }

    .citizen-send-otp-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
