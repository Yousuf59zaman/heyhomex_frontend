<script setup lang="ts">
    const props = defineProps<{ modelValue: boolean }>()

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
        next: [data: any]
        back: []
        close: []
    }>()

    const formData = reactive({
        professionalType: "",
        licenseNumber: "",
        brokerId: "",
        zipCode: "",
        mobilePhone: "",
        extension: "",
    })

    const errorMessage = ref("")
    const isSubmitting = ref(false)
    const isLoadingProfessions = ref(false)

    const professionalTypes = ref<Array<{label: string; value: string}>>([])

    type OnboardResponse = {
        status: string
        data: {
            user_type?: Array<{slug?: string}>
        }
    }

    type ProfessionResponse = {
        status: string
        message: string
        data: Array<{
            id: number
            name: string
            status: number
            status_label: string
        }>
    }

    // Fetch professions from API
    const loadProfessions = async () => {
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
            }
        } catch (error) {
            console.error("Failed to load professions:", error)
            // Fallback to empty array if API fails
            professionalTypes.value = []
        } finally {
            isLoadingProfessions.value = false
        }
    }

    // Load professions when modal opens
    watch(
        () => props.modelValue,
        (newVal) => {
            if (newVal && professionalTypes.value.length === 0) {
                loadProfessions()
            }
        },
        { immediate: true }
    )

    

    const handleNext = async () => {
        errorMessage.value = ""

        if (!formData.professionalType) {
            errorMessage.value = "Please select a professional type"
            return
        }

        if (!formData.licenseNumber) {
            errorMessage.value = "Please enter your license number"
            return
        }

        if (!formData.zipCode) {
            errorMessage.value = "Please enter your zip code"
            return
        }

        if (!formData.mobilePhone) {
            errorMessage.value = "Please enter your mobile/phone number"
            return
        }

        isSubmitting.value = true

        try {
            const response = await $fetchCMS<OnboardResponse>("/v1/other-user-type/onboard", {
                method: "POST",
                body: {
                    profession_id: formData.professionalType,
                    license_number: formData.licenseNumber,
                    broker_id: formData.brokerId,
                    zip_code: formData.zipCode,
                    mobile: formData.mobilePhone,
                    extension: formData.extension,
                }
            })

            if (response.status === "success") {
                // Redirect to dashboard based on user type
                const redirectSlug = response.data.user_type?.[0]?.slug || "kamaina"
                const targetPath = redirectSlug === "kamaaina" ? "/kamaina/" : `/${redirectSlug}/`
                window.location.href = targetPath
            }
        } catch (error: any) {
            errorMessage.value =
                error.data?.message || error.message || "Failed to submit professional information"
        } finally {
            isSubmitting.value = false
        }
    }

    const closeHandler = () => {
        emit("close")
    }

    watch(
        () => props.modelValue,
        (newValue) => {
            if (import.meta.client) {
                document.body.style.overflow = newValue ? "hidden" : ""
            }
        }
    )

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
        :closable="false"
        :draggable="false"
        :resizable="false"
        class="citizen-professional-modal"
        :style="{width: '45rem', maxWidth: '720px'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4 bg-white',
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
                        @click="$emit('back')"
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
                        Add professional information
                    </h1>
                    <div aria-hidden="true" class="absolute right-0 h-6 w-6"></div>
                </div>
            </div>
        </template>

        <div class="px-6 pb-8">
            <div class="mx-auto flex w-full max-w-[42rem] flex-col gap-12">
                <div class="flex flex-col gap-5">
                <div class="flex flex-col gap-5">
                    <div class="flex flex-col w-full">
                        <div class="pb-2">
                                <label
                                    for="professionalType"
                                    class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]">
                                    Professional type
                                </label>
                        </div>
                        <Dropdown
                            v-model="formData.professionalType"
                            :options="professionalTypes"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select type"
                            :loading="isLoadingProfessions"
                            :disabled="isLoadingProfessions"
                            class="w-full"
                            :pt="{
                                root: 'w-full h-14',
                                input: 'w-full h-14 px-4 py-4 border border-[#CFDBE8] rounded-lg text-base leading-6 text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            }" />
                    </div>
                </div>

                <div class="flex gap-5">
                    <div class="flex-1 flex flex-col gap-5">
                        <div class="flex flex-col w-full">
                            <div class="pb-2">
                                <label
                                    for="licenseNumber"
                                    class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]">
                                    License number
                                </label>
                            </div>
                            <InputText
                                id="licenseNumber"
                                v-model="formData.licenseNumber"
                                type="text"
                                placeholder="Enter your license number"
                                class="w-full h-14 px-4 py-4 border border-[#CFDBE8] rounded-lg text-base leading-6 text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>
                    </div>

                    <div class="flex-1 flex flex-col gap-5">
                        <div class="flex flex-col w-full">
                            <div class="pb-2">
                                <label
                                    for="brokerId"
                                    class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]">
                                    Broker ID
                                </label>
                            </div>
                            <InputText
                                id="brokerId"
                                v-model="formData.brokerId"
                                type="text"
                                placeholder="Enter your broker ID"
                                class="w-full h-14 px-4 py-4 border border-[#CFDBE8] rounded-lg text-base leading-6 text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-5">
                    <div class="flex flex-col w-full">
                        <div class="pb-2">
                                <label
                                    for="zipCode"
                                    class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]">
                                Zip code
                                </label>
                            </div>
                        <InputText
                            id="zipCode"
                            v-model="formData.zipCode"
                            type="text"
                            placeholder="Enter your zip code"
                            class="w-full h-14 px-4 py-4 border border-[#CFDBE8] rounded-lg text-base leading-6 text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                    </div>
                </div>

                <div class="flex gap-5">
                    <div class="flex-1 flex flex-col gap-5">
                        <div class="flex flex-col w-full">
                            <div class="pb-2">
                                <label
                                    for="mobilePhone"
                                    class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]">
                                    Mobile/Phone number
                                </label>
                            </div>
                            <InputText
                                id="mobilePhone"
                                v-model="formData.mobilePhone"
                                type="tel"
                                placeholder="Enter your mobile/phone number"
                                class="w-full h-14 px-4 py-4 border border-[#CFDBE8] rounded-lg text-base leading-6 text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>
                    </div>

                    <div class="flex-1 flex flex-col gap-5">
                        <div class="flex flex-col w-full">
                            <div class="pb-2">
                                <label
                                    for="extension"
                                    class="text-base leading-6 font-[510] text-[#121A22] font-['sf-pro-Medium'] [font-feature-settings:'dlig'_on]">
                                    Extension
                                </label>
                            </div>
                            <InputText
                                id="extension"
                                v-model="formData.extension"
                                type="text"
                                placeholder="Enter extension"
                                class="w-full h-14 px-4 py-4 border border-[#CFDBE8] rounded-lg text-base leading-6 text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                </div>

                <div
                    v-if="errorMessage"
                    class="text-center">
                    <p class="text-xs text-red-500">{{ errorMessage }}</p>
                </div>

                <button
                    @click="handleNext"
                    :disabled="isSubmitting"
                    type="button"
                    class="w-full px-5 py-3.5 h-[3.25rem] font-bold text-base leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
                    :class="
                        isSubmitting
                            ? 'bg-[#606e83] text-white cursor-not-allowed'
                            : 'bg-[#18222C] hover:bg-[#0F172A] text-white'
                    ">
                    {{ isSubmitting ? "Submitting..." : "Next" }}
                </button>
                </div>

                <div class="text-center">
                    <p class="text-base text-[#121A22] leading-6">
                        <span class="font-medium">By using heyhomex, you agree to the</span>
                        <a
                            href="/terms"
                            class="font-bold hover:underline"
                            >Terms</a
                        >
                        <span class="font-medium">and</span>
                        <a
                            href="/privacy"
                            class="font-bold hover:underline"
                            >Privacy Policy</a
                        ><span class="font-medium">.</span>
                    </p>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-professional-modal .p-dialog {
        border-radius: 0.625rem;
    }

    .citizen-professional-modal .p-dialog-header {
        border: none;
    }

    .citizen-professional-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>

