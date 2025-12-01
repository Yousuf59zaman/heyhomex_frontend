<script setup lang="ts">
    interface Props {
        modelValue: boolean
    }
    const props = defineProps<Props>()

    interface UuidState {
        uuid: string
    }

    const setUuid = useState<UuidState>("uuid", () => ({
        uuid: "",
    }))

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        'next': [email: string]
        'back': []
        'close': []
    }>()

    interface ValidationErrors {
        [key: string]: string
    }

    interface FormData {
        email: string
    }

    const visible = ref<boolean>(props.modelValue)
    const validations_errors = ref<ValidationErrors>({})
    const skip_validations = ref<string[]>([])

    const formData = ref<FormData>({
        email: "",
    })

    const isLoading = ref<boolean>(false)

    watch(
        () => props.modelValue,
        (newVal: boolean): void => {
            visible.value = newVal
            if (newVal && setUuid.value?.uuid) {
                setUuid.value = {uuid: ""}
            }
        }
    )

    watch(visible, (newVal: boolean): void => {
        emit("update:modelValue", newVal)
        if (!newVal) emit("close")
    })

    const handleBack = (): void => {
        emit("back")
    }

    const handleSubmit = async (): Promise<void> => {
        validations_errors.value = {}
        const errors = (Object.keys(formData.value) as Array<keyof FormData>).filter(
            (item) =>
                !formData.value[item] && !skip_validations.value.includes(item)
        )

        if (errors.length > 0) {
            errors.forEach((item) => {
                validations_errors.value[item] = `Email is required`
            })
            console.log(validations_errors.value)
            return
        }

        try {
            isLoading.value = true
            const response: any = await $fetchCMS(`/reg-otp-flow`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {...formData.value},
            })

            if (response?.status === "success") {
                setUuid.value = {
                    ...(setUuid.value || {}),
                    uuid: response.data?.uuid,
                }
                emit("next", formData.value.email)
            } else {
                validations_errors.value.email =
                    response?.message || "Unable to send OTP. Please try again."
            }
        } catch (e: any) {
            console.log(
                "Get Message",
                e instanceof Error ? e.message : String(e)
            )
            const status = e?.response?.status
            if (status === 422 || status === 409) {
                const errorsData = e.response?._data.errors || {}
                console.log("Errors Data", errorsData)
                for (const key in errorsData) {
                    if (errorsData.hasOwnProperty(key)) {
                        validations_errors.value[key] = errorsData[key][0]
                    }
                }
            } else if (status === 404) {
                validations_errors.value.email =
                    e.response?._data?.message || "Resource not found."
            } else {
                validations_errors.value.email =
                    e.response?._data?.message || "Something went wrong. Please try again."
            }
        } finally {
            isLoading.value = false
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
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :draggable="false"
        :resizable="false"
        class="citizen-send-otp-modal"
        :style="{width: 'min(45rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-[10px] shadow-2xl m-4',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-8',
        }">
        <template #header>
            <div class="absolute right-[0px] top-[0] z-50">
                <button
                    @click="closeHandler"
                    class="w-[56px] h-[56px] flex items-center justify-center bg-[#8B8B8B] text-white cursor-pointer rounded-bl-[15px] rounded-tr-[10px] transition-all duration-300 focus:outline-none">
                    <i class="pi pi-times text-2xl"></i>
                </button>
            </div>
            <div class="w-full px-6 pt-4">
                <div class="flex items-center justify-center relative">
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

                    <h2 class="text-2xl md:text-3xl lg:text-4xl leading-tight font-medium text-[#121A22]">
                        Add your email
                    </h2>
                </div>
            </div>
        </template>

        <!-- Content -->
        <div class="px-6 pt-8 pb-2 space-y-12">
            <div class="flex flex-col gap-2">
                <label
                    for="email"
                    class="text-base font-medium text-[#121A22]"
                    >Email Address</label
                >
                <InputText
                    id="email"
                    v-model="formData.email"
                    type="email"
                    placeholder="Enter your email address"
                    @keyup.enter="handleSubmit"
                    :pt="{
                        root: 'w-full h-14 px-4 border border-[#cfdbe8] rounded-[8px] text-sm md:text-base text-[#566573] placeholder:text-[#566573] focus:ring-2 focus:ring-[#18222c]/20 focus:border-[#18222c] transition-colors',
                    }" />
                <span
                    v-if="validations_errors.email"
                    class="text-xs text-red-500">
                    {{ validations_errors.email }}
                </span>
            </div>

            <button
                @click="handleSubmit"
                :disabled="isLoading"
                type="button"
                class="w-full h-[52px] px-6 font-bold rounded-[12px] transition-colors duration-200 flex items-center justify-center gap-2"
                :class="
                    isLoading
                        ? 'bg-[#606e83] text-white cursor-not-allowed'
                        : 'bg-[#18222c] hover:bg-[#101822] text-white'
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
        </div>
    </Dialog>
</template>

<style scoped>
    .citizen-send-otp-modal .p-dialog {
        border-radius: 10px;
    }

    .citizen-send-otp-modal .p-dialog-header {
        border: none;
    }

    .citizen-send-otp-modal .p-dialog-content {
        border: none;
        padding-top: 0;
    }
</style>
