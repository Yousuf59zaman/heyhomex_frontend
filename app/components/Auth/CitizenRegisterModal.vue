<script setup lang="ts">
    const getUuid = useState<{uuid: string}>("uuid")

    const emit = defineEmits<{
        "update:modelValue": [value: boolean]
        "register-success": [data: RegisterFormData]
        "show-login": []
        back: []
        close: []
    }>()

    const props = defineProps<{
        modelValue: boolean
    }>()

    const visible = computed({
        get: () => props.modelValue,
        set: (value: boolean) => {
            emit("update:modelValue", value)

            if (!value) {
                emit("close")
            }
        },
    })

    interface RegisterFormData {
        first_name: string
        last_name: string
        password: string
        password_confirmation: string
        price_range_id: string
        location_id: string
        uuid: string
    }

    interface PriceRange {
        id: number
        min_price: string
        max_price: string
        range_title: string
    }

    interface Location {
        id: number
        name: string
    }

    interface ApiResponse<T> {
        status: string
        message: string
        data: T
    }

    interface RegistrationResponseData {
        id: number
        name: string
        email: string
        email_verified_at: string
        user_type: any[]
        otp_for: string | null
        photo: string | null
        email_notification: string | null
        uid: string
        mobile: string | null
        ccode: string
        auth_code: string | null
        is_verify: number
        status: number
        mobile_verified_at: string
        role_id: number
        token: string | null
        expire_time: string | null
        refresh_token: string | null
        user_info: any | null
        user_role: {
            id: number
            role_name: string
            status: boolean
            deleted_at: string | null
        }
        user_preference: {
            id: number
            question_minimum_price: string | null
            question_maximum_price: string | null
            range_minimum_price: string
            range_maximum_price: string
            question_location: string | null
        }
        user_onboard_profile_status: number
    }

    const loading = ref(false)
    const validationErrors = ref<Record<string, string>>({})
    const passwordMatchError = ref("")

    const formData = reactive<RegisterFormData>({
        first_name: "",
        last_name: "",
        password: "",
        password_confirmation: "",
        price_range_id: "",
        location_id: "",
        uuid: getUuid.value?.uuid || "",
    })

    const priceRangeOptions = ref([
        {label: "Select price range", value: "", disabled: true},
    ])

    const preferredLocationOptions = ref([
        {label: "Select Preferred location", value: "", disabled: true},
    ])

    const loadingPriceRanges = ref(false)
    const loadingLocations = ref(false)

    const fetchPriceRanges = async () => {
        try {
            loadingPriceRanges.value = true
            const response = await $fetchCMS<ApiResponse<PriceRange[]>>(
                "/price-range/list",
                {}
            )

            if (
                response?.status === "success" &&
                Array.isArray(response.data)
            ) {
                const apiOptions = response.data.map((range) => ({
                    label: range.range_title,
                    value: String(range.id),
                    disabled: false,
                }))

                priceRangeOptions.value = [
                    {label: "Select price range", value: "", disabled: true},
                    ...apiOptions,
                ]
            }
        } catch (error: any) {
            console.error("Error fetching price ranges:", error)
        } finally {
            loadingPriceRanges.value = false
        }
    }

    const fetchLocations = async () => {
        try {
            loadingLocations.value = true
            const response = await $fetchCMS<ApiResponse<Location[]>>(
                "/locations/list",
                {}
            )

            if (
                response?.status === "success" &&
                Array.isArray(response.data)
            ) {
                const apiOptions = response.data.map((location) => ({
                    label: location.name,
                    value: String(location.id),
                    disabled: false,
                }))

                preferredLocationOptions.value = [
                    {
                        label: "Select Preferred location",
                        value: "",
                        disabled: true,
                    },
                    ...apiOptions,
                ]
            }
        } catch (error: any) {
            console.error("Error fetching locations:", error)
        } finally {
            loadingLocations.value = false
        }
    }

    onMounted(() => {
        fetchPriceRanges()
        fetchLocations()
    })

    const closeModal = () => {
        emit("update:modelValue", false)
        emit("close")
        setTimeout(() => {
            resetForm()
        }, 300)
    }

    const resetForm = () => {
        formData.first_name = ""
        formData.last_name = ""
        formData.password = ""
        formData.password_confirmation = ""
        formData.price_range_id = ""
        formData.location_id = ""
        validationErrors.value = {}
        passwordMatchError.value = ""
    }

    const validatePasswords = () => {
        if (formData.password && formData.password_confirmation) {
            if (formData.password !== formData.password_confirmation) {
                passwordMatchError.value = "Passwords do not match"
                return false
            }
        }
        passwordMatchError.value = ""
        return true
    }

    const showError = (message: string) => {
        // alert(message)
    }

    const handleRegister = async () => {
        validationErrors.value = {}
        passwordMatchError.value = ""

        if (!validatePasswords()) {
            loading.value = false
            return
        }

        loading.value = true
        // emit('register-success', { ...formData })
        const uuid = getUuid.value?.uuid
        if (!uuid) {
            showError(
                "Session expired. Please go back and re-enter your email."
            )
            loading.value = false
            return
        }

        try {
            const response = await $fetchCMS<
                ApiResponse<RegistrationResponseData>
            >("/register", {
                method: "POST",
                body: formData,
            })

            console.log("Response", response)

            if (response.status) {
                console.log("Response in block", response)

                if (import.meta.client) {
                    const onboardingStatus =
                        response.data?.user_onboard_profile_status ?? 0
                    localStorage.setItem(
                        "citizen_user_onboard_profile_status",
                        String(onboardingStatus)
                    )
                    localStorage.setItem(
                        "citizen_user_data",
                        JSON.stringify({
                            id: response.data?.id,
                            name: response.data?.name,
                            email: response.data?.email,
                            uid: response.data?.uid,
                        })
                    )
                }

                setTimeout(() => {
                    emit("register-success", {...formData})
                }, 300)
            } else {
            }
        } catch (e: any) {
            console.log("Get Message", e.message)
            if (e.response?.status === 404 || e.response?.status === 422) {
                console.log("here 1", e.response)
                if (e.response?.status === 404 || e.response?.status === 409) {
                    for (const key in e.response._data.data) {
                        if (e.response._data.data.hasOwnProperty(key)) {
                            const value = e.response._data.data[key][0]
                            validationErrors.value[key] = value
                        }
                    }
                }
            } else {
                showError(
                    e.response?.message ||
                        e.message ||
                        "An error occurred during registration"
                )
            }
        } finally {
            loading.value = false
        }
    }

    const showLogin = () => {
        closeModal()
        setTimeout(() => {
            emit("show-login")
        }, 300)
    }

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
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-register-modal"
        :style="{width: 'min(45rem, 95vw)', maxWidth: '95vw'}"
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
                    You bring the dream. We'll map the way. ✨
                </h1>
                <p class="text-sm text-[#121A22]">
                    Create your account to start your home journey
                </p>
            </div>
        </template>

        <!-- Content -->
        <div class="px-4 sm:px-6 pb-6">
            <form
                @submit.prevent="handleRegister"
                class="space-y-4">
                <div class="flex flex-col gap-2">
                    <label
                        for="fullName"
                        class="text-sm font-medium text-gray-700"
                        >First Name</label
                    >
                    <InputText
                        id="fullName"
                        v-model="formData.first_name"
                        placeholder="Enter your full name"
                        required
                        :pt="{
                            root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                    <span
                        v-if="validationErrors.first_name"
                        class="text-xs text-red-500">
                        {{ validationErrors.first_name }}
                    </span>
                </div>

                <div class="flex flex-col gap-2">
                    <label
                        for="email"
                        class="text-sm font-medium text-gray-700"
                        >Last Name</label
                    >
                    <InputText
                        id="email"
                        v-model="formData.last_name"
                        type="email"
                        placeholder="Enter your email address"
                        required
                        :pt="{
                            root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                    <span
                        v-if="validationErrors.last_name"
                        class="text-xs text-red-500">
                        {{ validationErrors.last_name }}
                    </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label
                            for="password"
                            class="text-sm font-medium text-gray-700"
                            >Password</label
                        >
                        <InputText
                            id="password"
                            v-model="formData.password"
                            type="password"
                            placeholder="Create a password"
                            required
                            @blur="validatePasswords"
                            :pt="{
                                root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                            }" />
                        <span
                            v-if="validationErrors.password"
                            class="text-xs text-red-500">
                            {{ validationErrors.password }}
                        </span>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label
                            for="confirmPassword"
                            class="text-sm font-medium text-gray-700"
                            >Confirm Password</label
                        >
                        <InputText
                            id="confirmPassword"
                            v-model="formData.password_confirmation"
                            type="password"
                            placeholder="Confirm your password"
                            required
                            @blur="validatePasswords"
                            :pt="{
                                root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                            }" />
                        <span
                            v-if="passwordMatchError"
                            class="text-xs text-red-500">
                            {{ passwordMatchError }}
                        </span>
                        <span
                            v-if="validationErrors.password_confirmation"
                            class="text-xs text-red-500">
                            {{ validationErrors.password_confirmation }}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label
                            for="priceRange"
                            class="text-sm font-medium text-gray-700"
                            >Price Range</label
                        >
                        <Dropdown
                            id="priceRange"
                            v-model="formData.price_range_id"
                            :options="priceRangeOptions"
                            optionLabel="label"
                            optionValue="value"
                            optionDisabled="disabled"
                            placeholder="Select price range"
                            :loading="loadingPriceRanges"
                            :disabled="loadingPriceRanges"
                            required
                            :pt="{
                                root: 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                input: 'px-4 py-3',
                            }" />
                        <span
                            v-if="validationErrors.price_range_id"
                            class="text-xs text-red-500">
                            {{ validationErrors.price_range_id }}
                        </span>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label
                            for="preferredLocation"
                            class="text-sm font-medium text-gray-700"
                            >Preferred Location</label
                        >
                        <Dropdown
                            id="preferredLocation"
                            v-model="formData.location_id"
                            :options="preferredLocationOptions"
                            optionLabel="label"
                            optionValue="value"
                            optionDisabled="disabled"
                            placeholder="Select location"
                            :loading="loadingLocations"
                            :disabled="loadingLocations"
                            required
                            :pt="{
                                root: 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                input: 'px-4 py-3',
                            }" />
                        <span
                            v-if="validationErrors.location_id"
                            class="text-xs text-red-500">
                            {{ validationErrors.location_id }}
                        </span>
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
                    {{ loading ? "Creating Account..." : "Create Account" }}
                </Button>

                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Already have an account?
                        <button
                            type="button"
                            @click="showLogin"
                            class="text-blue-600 hover:text-blue-700 font-medium">
                            Sign In
                        </button>
                    </p>
                </div>
            </form>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-register-modal .p-dialog {
        border-radius: 1rem;
    }

    .citizen-register-modal .p-dialog-header {
        border: none;
        padding-bottom: 0;
    }

    .citizen-register-modal .p-dialog-content {
        border: none;
        padding-top: 0;
        padding-bottom: 1.5rem;
    }
</style>
