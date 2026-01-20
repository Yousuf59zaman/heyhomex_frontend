<script setup lang="ts">
    const props = defineProps<{
        modelValue: boolean
        email : string
        accountType : number
    }>()
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

    const getUuid = useState<{uuid: string}>("uuid")

    const emit = defineEmits<{
        "update:modelValue": [value: boolean]
        "register-success": [data: RegisterFormData]
        "show-login": []
        back: []
        close: []
    }>()

    interface RegisterFormData {
        first_name: string
        last_name: string
        password: string
        password_confirmation: string
        user_type : any
        uuid: string
        mobile?: string
        profession_id?: string
        occupation?: string
    }

    interface ApiResponse<T> {
        status: string
        message: string
        data: T
    }

    interface ProfessionResponse {
        status: string
        message: string
        data: Array<{
            id: number
            name: string
            status: number
            status_label: string
        }>
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
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const isLoadingProfessions = ref(false)
    const professionalTypes = ref<Array<{label: string; value: string}>>([])
    const showProfessionDropdown = ref(false)
    const filteredProfessions = ref<Array<{label: string; value: string}>>([])
    const professionSearchTerm = ref("")
    const isProfessionFromAPI = ref(false)

    const formData = ref<RegisterFormData>({
        first_name: "",
        last_name: "",
        password: "",
        password_confirmation: "",
        user_type: props.accountType === 1 ? "advertisers" : props.accountType === 2 ? "agent" : "",
        uuid: getUuid.value?.uuid || "",
        mobile: "",
        profession_id: "",
        occupation: "",
    })

   
    const isAgentOrAdvertiser = computed(() => {
        return props.accountType === 1 || props.accountType === 2
    })

  
    const loadProfessions = async () => {
        if (!isAgentOrAdvertiser.value) return
        
        isLoadingProfessions.value = true
        try {
            const response = await $fetchCMS<ProfessionResponse>("admin/professions/all/active", {
                method: 'GET'
            })
            if (response.status === "success" && response.data) {
                professionalTypes.value = response.data.map(profession => ({
                    label: profession.name,
                    value: profession.id.toString()
                }))
                filteredProfessions.value = professionalTypes.value
            }
        } catch (error) {
            console.error("Failed to load professions:", error)
            professionalTypes.value = []
        } finally {
            isLoadingProfessions.value = false
        }
    }

    // Filter professions based on search term
    const filterProfessions = () => {
        const searchLower = professionSearchTerm.value.toLowerCase()
        filteredProfessions.value = professionalTypes.value.filter(profession =>
            profession.label.toLowerCase().includes(searchLower)
        )
    }

    // Handle profession selection from dropdown
    const selectProfession = (profession: {label: string; value: string}) => {
        professionSearchTerm.value = profession.label
        formData.value.profession_id = profession.value
        formData.value.occupation = ""
        isProfessionFromAPI.value = true
        showProfessionDropdown.value = false
    }

    // Handle manual profession entry
    const handleProfessionInput = () => {
        filterProfessions()
        showProfessionDropdown.value = true
        isProfessionFromAPI.value = false
        formData.value.profession_id = ""
        formData.value.occupation = professionSearchTerm.value
    }

    // Load professions when component mounts if agent or advertiser
    onMounted(() => {
        if (isAgentOrAdvertiser.value) {
            loadProfessions()
        }

        // Close dropdown when clicking outside
        if (import.meta.client) {
            document.addEventListener('click', handleClickOutside)
        }
    })

    onUnmounted(() => {
        if (import.meta.client) {
            document.removeEventListener('click', handleClickOutside)
            document.body.style.overflow = ""
        }
    })

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        const professionInput = document.getElementById('profession')
        if (professionInput && !professionInput.contains(target) && !target.closest('.profession-dropdown')) {
            showProfessionDropdown.value = false
        }
    }

    const hasMinimumLength = computed(() => {
        return formData.value.password.length >= 8
    })

    const hasSymbol = computed(() => {
        const symbolRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
        return symbolRegex.test(formData.value.password)
    })

    const hasCapitalLetter = computed(() => {
        const capitalRegex = /[A-Z]/
        return capitalRegex.test(formData.value.password)
    })

    const passwordsMatch = computed(() => {
        if (!formData.value.password || !formData.value.password_confirmation) {
            return false
        }
        return formData.value.password === formData.value.password_confirmation
    })

    const allPasswordValidationsPassed = computed(() => {
        return (
            hasMinimumLength.value &&
            hasSymbol.value &&
            hasCapitalLetter.value &&
            passwordsMatch.value
        )
    })

    const handleBack = () => {
        emit("back")
    }

    const closeHandler = () => {
        emit("close")
    }

    const validatePasswords = () => {
        if (formData.value.password && formData.value.password_confirmation) {
            if (
                formData.value.password !== formData.value.password_confirmation
            ) {
                passwordMatchError.value = "Passwords do not match"
                return false
            }
        }
        passwordMatchError.value = ""
        return true
    }

    const showError = (message: string) => {}

    const handleRegister = async () => {
        validationErrors.value = {}
        passwordMatchError.value = ""

        if (!allPasswordValidationsPassed.value) {
            if (!validatePasswords()) {
                loading.value = false
                return
            }
            loading.value = false
            return
        }

        loading.value = true
        const uuid = getUuid.value?.uuid
        if (!uuid) {
            showError(
                "Session expired. Please go back and re-enter your email."
            )
            loading.value = false
            return
        }

        try {
            // Prepare request body
            const requestBody: any = {
                first_name: formData.value.first_name,
                last_name: formData.value.last_name,
                password: formData.value.password,
                password_confirmation: formData.value.password_confirmation,
                user_type: formData.value.user_type,
                uuid: formData.value.uuid,
            }

            // Add mobile and profession fields only for agent/advertiser
            if (isAgentOrAdvertiser.value) {
                if (formData.value.mobile) {
                    requestBody.mobile = formData.value.mobile
                }
                
                // Send profession_id if selected from API, otherwise send occupation
                if (isProfessionFromAPI.value && formData.value.profession_id) {
                    requestBody.profession_id = formData.value.profession_id
                } else if (professionSearchTerm.value) {
                    requestBody.occupation = professionSearchTerm.value
                }
            }

            const response = await $fetchCMS<
                ApiResponse<RegistrationResponseData>
            >("/register", {
                method: "POST",
                body: requestBody,
            })

            if (response.status) {
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
                    emit("register-success", {...formData.value})
                }, 300)
            } else {
            }
        } catch (e: any) {
            console.log("Get Message", e.message)
            if (e.response?.status === 404 || e.response?.status === 422) {
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
        class="citizen-register-modal"
        :style="{width: '45rem', maxWidth: '720px'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4',
            header: 'border-0 p-[0px!important]',
            content: 'border-0 p-[0px!important]',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div class="absolute right-0 top-0 z-50">
                <button
                    @click="closeHandler"
                    class="w-14 h-14 flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-[0.9375rem] rounded-tr-[0.625rem] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-2xl"></i>
                </button>
            </div>
            <div class="w-full px-6 pt-8 pb-10">
                <div class="relative mx-auto flex w-full max-w-[42rem] items-center justify-center">
                    <button
                        @click="handleBack"
                        type="button"
                        class="absolute left-0 flex h-6 w-6 items-center justify-center text-[#121A22]"
                        aria-label="Go back">
                        <svg
                            class="h-6 w-6"
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

                    <h1
                        class="text-2xl md:text-3xl lg:text-[32px] leading-tight lg:leading-[40px] font-[510] text-[#121A22] text-center font-['sf-pro-Medium']">
                        Set up profile
                    </h1>
                    <div aria-hidden="true" class="absolute right-0 h-6 w-6"></div>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pb-8">
            <form
                @submit.prevent="handleRegister"
                autocomplete="off"
                class="mx-auto w-full max-w-[42rem] space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-3">
                        <label
                            for="firstName"
                            class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]"
                            >First name</label
                        >
                        <InputText
                            id="firstName"
                            v-model="formData.first_name"
                            placeholder="Enter your first name"
                            required
                            autocomplete="off"
                            :pt="{
                                root: 'w-full h-14 px-4 border border-[#cfdbe8] rounded-lg text-sm md:text-base text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors',
                            }" />
                        <span
                            v-if="validationErrors.first_name"
                            class="text-xs text-red-500">
                            {{ validationErrors.first_name }}
                        </span>
                    </div>

                    <div class="flex flex-col gap-3">
                        <label
                            for="lastName"
                            class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]"
                            >Last name</label
                        >
                        <InputText
                            id="lastName"
                            v-model="formData.last_name"
                            placeholder="Enter your last name"
                            required
                            autocomplete="off"
                            :pt="{
                                root: 'w-full h-14 px-4 border border-[#cfdbe8] rounded-lg text-sm md:text-base text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors',
                            }" />
                        <span
                            v-if="validationErrors.last_name"
                            class="text-xs text-red-500">
                            {{ validationErrors.last_name }}
                        </span>
                    </div>
                </div>

                <!-- Mobile and Profession fields - only for agent/advertiser -->
                <template v-if="isAgentOrAdvertiser">
                    <div class="flex flex-col gap-3">
                        <label
                            for="mobile"
                            class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]"
                            >Mobile Phone</label
                        >
                        <InputText
                            id="mobile"
                            v-model="formData.mobile"
                            placeholder="Enter your mobile phone"
                            required
                            autocomplete="off"
                            type="tel"
                            :pt="{
                                root: 'w-full h-14 px-4 border border-[#cfdbe8] rounded-lg text-sm md:text-base text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors',
                            }" />
                        <span
                            v-if="validationErrors.mobile"
                            class="text-xs text-red-500">
                            {{ validationErrors.mobile }}
                        </span>
                    </div>

                    <div class="flex flex-col gap-3">
                        <label
                            for="profession"
                            class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]"
                            >Profession</label
                        >
                        <div class="relative">
                            <InputText
                                id="profession"
                                v-model="professionSearchTerm"
                                @input="handleProfessionInput"
                                @focus="showProfessionDropdown = true"
                                placeholder="Select or type your profession"
                                required
                                autocomplete="off"
                                :pt="{
                                    root: 'w-full h-14 px-4 border border-[#cfdbe8] rounded-lg text-sm md:text-base text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors',
                                }" />
                            
                            <!-- Profession dropdown -->
                            <div 
                                v-if="showProfessionDropdown && filteredProfessions.length > 0"
                                class="profession-dropdown absolute z-50 w-full mt-1 bg-white border border-[#cfdbe8] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div 
                                    v-for="profession in filteredProfessions"
                                    :key="profession.value"
                                    @click="selectProfession(profession)"
                                    class="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors">
                                    {{ profession.label }}
                                </div>
                            </div>

                            <!-- Loading indicator -->
                            <div 
                                v-if="isLoadingProfessions"
                                class="absolute right-4 top-1/2 -translate-y-1/2">
                                <i class="pi pi-spin pi-spinner text-gray-400"></i>
                            </div>
                        </div>
                        <span
                            v-if="validationErrors.profession_id || validationErrors.occupation"
                            class="text-xs text-red-500">
                            {{ validationErrors.profession_id || validationErrors.occupation }}
                        </span>
                    </div>
                </template>

                <div class="flex flex-col gap-3">
                    <label
                        for="password"
                        class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]"
                        >Password</label
                    >
                    <div class="relative">
                        <InputText
                            id="password"
                            v-model="formData.password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="Enter your password"
                            required
                            autocomplete="new-password"
                            @blur="validatePasswords"
                            :pt="{
                                root: 'w-full h-14 px-4 pr-12 border border-[#cfdbe8] rounded-lg text-sm md:text-base text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors',
                            }" />
                        <button
                            type="button"
                            @click="showPassword = !showPassword"
                            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            tabindex="-1">
                            <svg
                                v-if="!showPassword"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="3"></circle>
                            </svg>
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line
                                    x1="1"
                                    y1="1"
                                    x2="23"
                                    y2="23"></line>
                            </svg>
                        </button>
                    </div>
                    <span
                        v-if="validationErrors.password"
                        class="text-xs text-red-500">
                        {{ validationErrors.password }}
                    </span>
                </div>

                <div class="flex flex-col gap-3">
                    <label
                        for="confirmPassword"
                        class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]"
                        >Confirm password</label
                    >
                    <div class="relative">
                        <InputText
                            id="confirmPassword"
                            v-model="formData.password_confirmation"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            placeholder="Enter your password"
                            required
                            autocomplete="new-password"
                            @blur="validatePasswords"
                            :pt="{
                                root: 'w-full h-14 px-4 pr-12 border border-[#cfdbe8] rounded-lg text-sm md:text-base text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors',
                            }" />
                        <button
                            type="button"
                            @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            tabindex="-1">
                            <svg
                                v-if="!showConfirmPassword"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="3"></circle>
                            </svg>
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line
                                    x1="1"
                                    y1="1"
                                    x2="23"
                                    y2="23"></line>
                            </svg>
                        </button>
                    </div>
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

                <div class="text-sm space-y-3 mt-4">
                    <!-- Minimum 8 characters validation -->
                    <div class="flex items-center gap-2">
                        <span
                            :class="[
                                'w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200',
                                hasMinimumLength
                                    ? 'bg-[#121A22]'
                                    : 'border border-[#cfdbe8]',
                            ]">
                            <svg
                                v-if="hasMinimumLength"
                                class="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="4"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                        <p
                            :class="[
                                'text-base leading-normal transition-colors duration-200',
                                hasMinimumLength
                                    ? 'text-[#121A22]'
                                    : 'text-[#566573]',
                            ]">
                            Minimum of 8 characters
                        </p>
                    </div>

                    <!-- Symbol validation -->
                    <div class="flex items-center gap-2">
                        <span
                            :class="[
                                'w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200',
                                hasSymbol
                                    ? 'bg-[#121A22]'
                                    : 'border border-[#cfdbe8]',
                            ]">
                            <svg
                                v-if="hasSymbol"
                                class="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="4"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                        <p
                            :class="[
                                'text-base leading-normal transition-colors duration-200',
                                hasSymbol ? 'text-[#121A22]' : 'text-[#566573]',
                            ]">
                            Must have at least 1 symbol
                        </p>
                    </div>

                    <!-- Capital letter validation -->
                    <div class="flex items-center gap-2">
                        <span
                            :class="[
                                'w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200',
                                hasCapitalLetter
                                    ? 'bg-[#121A22]'
                                    : 'border border-[#cfdbe8]',
                            ]">
                            <svg
                                v-if="hasCapitalLetter"
                                class="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="4"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                        <p
                            :class="[
                                'text-base leading-normal transition-colors duration-200',
                                hasCapitalLetter
                                    ? 'text-[#121A22]'
                                    : 'text-[#566573]',
                            ]">
                            Must have at least 1 capital letter
                        </p>
                    </div>

                    <!-- Passwords match validation -->
                    <div class="flex items-center gap-2">
                        <span
                            :class="[
                                'w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200',
                                passwordsMatch
                                    ? 'bg-[#121A22]'
                                    : 'border border-[#cfdbe8]',
                            ]">
                            <svg
                                v-if="passwordsMatch"
                                class="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="4"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                        <p
                            :class="[
                                'text-base leading-normal transition-colors duration-200',
                                passwordsMatch
                                    ? 'text-[#121A22]'
                                    : 'text-[#566573]',
                            ]">
                            Password and confirm password must be the same
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    :disabled="loading || !allPasswordValidationsPassed"
                    :loading="loading"
                    loadingIcon="pi pi-spin pi-spinner"
                    class="w-full h-[3.25rem] px-6 bg-[#121A22] hover:bg-[#101822] disabled:bg-[#9ca3af] disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors duration-200 flex items-center justify-center">
                    {{ loading ? "Processing..." : "Next" }}
                </button>

                <div class="text-center">
                    <p class="text-base font-medium text-[#121A22]">
                        By using heyhomex, you agree to the
                        <a
                            href="/terms"
                            class="text-[#121A22] font-bold hover:underline"
                            >Terms</a
                        >
                        and
                        <a
                            href="/privacy"
                            class="text-[#121A22] font-bold hover:underline"
                            >Privacy Policy</a
                        >.
                    </p>
                </div>
            </form>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-register-modal .p-dialog {
        border-radius: 0.625rem;
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

