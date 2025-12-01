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

    const professionalTypes = [
        {label: "Real Estate Agent", value: "agent"},
        {label: "Real Estate Broker", value: "broker"},
        {label: "Property Manager", value: "property_manager"},
        {label: "Developer", value: "developer"},
        {label: "Investor", value: "investor"},
    ]

    

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
            await new Promise((resolve) => setTimeout(resolve, 1000))

            console.log("Professional info submitted:", formData)
            emit("next", formData)
        } catch (error: any) {
            errorMessage.value =
                error.message || "Failed to submit professional information"
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
        :style="{width: 'min(38rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4 bg-white',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-0',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div class="absolute right-0 top-0 z-50">
                <button
                    @click="closeHandler"
                    class="w-14 h-14 flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-2xl rounded-tr-xl transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-2xl"></i>
                </button>
            </div>
            <div class="w-full px-6 pt-8 pb-0">
                <div class="flex items-center gap-12 w-full">
                    <button
                        @click="$emit('back')"
                        class="flex items-center justify-center shrink-0">
                        <i class="pi pi-chevron-left text-[24px] text-[#121A22]"></i>
                    </button>
                    <h1
                        class="flex-1 text-2xl md:text-3xl lg:text-4xl leading-tight font-medium text-[#121A22] text-center">
                        Add professional information
                    </h1>
                    <div class="w-4 h-6 shrink-0"></div>
                </div>
            </div>
        </template>

        <div class="px-6 pb-8 flex flex-col gap-12">
            <div class="flex flex-col gap-5">
                <div class="flex flex-col gap-5">
                    <div class="flex flex-col w-full">
                        <div class="pb-2">
                            <label
                                for="professionalType"
                                class="text-base font-medium text-[#121A22] leading-6">
                                Professional type
                            </label>
                        </div>
                        <Dropdown
                            v-model="formData.professionalType"
                            :options="professionalTypes"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select type"
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
                                    class="text-base font-medium text-[#121A22] leading-6">
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
                                    class="text-base font-medium text-[#121A22] leading-6">
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
                                class="text-base font-medium text-[#121A22] leading-6">
                                Zip code
                            </label>
                        </div>
                        <InputText
                            id="zipCode"
                            v-model="formData.zipCode"
                            type="text"
                            placeholder="Enter your zip code"
                            class="w-full h-[56px] px-4 py-4 border border-[#CFDBE8] rounded-[8px] text-base leading-[24px] text-[#121A22] placeholder:text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                    </div>
                </div>

                <div class="flex gap-5">
                    <div class="flex-1 flex flex-col gap-5">
                        <div class="flex flex-col w-full">
                            <div class="pb-2">
                                <label
                                    for="mobilePhone"
                                    class="text-base font-medium text-[#121A22] leading-6">
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
                                    class="text-base font-medium text-[#121A22] leading-6">
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
                    class="w-full px-5 py-3.5 h-13 font-bold text-base leading-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
                    :class="
                        isSubmitting
                            ? 'bg-[#606e83] text-white cursor-not-allowed'
                            : 'bg-[#18222C] hover:bg-[#0F172A] text-white'
                    ">
                    {{ isSubmitting ? "Submitting..." : "Next" }}
                </button>
            </div>

            <div class="text-center">
                <p class="text-base text-[#121A22] leading-[24px]">
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
    </Dialog>
</template>

<style scoped>
    .citizen-professional-modal .p-dialog {
        border-radius: 10px;
    }

    .citizen-professional-modal .p-dialog-header {
        border: none;
    }

    .citizen-professional-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
