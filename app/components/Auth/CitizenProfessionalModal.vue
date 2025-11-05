<script setup lang="ts">

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'next': [data: any]
    'back': []
    'close': []
}>()

const props = defineProps<{
    modelValue: boolean
}>()


const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => {
        emit('update:modelValue', value)
     
        if (!value) {
            emit('close')
        }
    },
})


const formData = reactive({
    professionalType: '',
    licenseNumber: '',
    brokerId: '',
    zipCode: '',
    mobilePhone: '',
    extension: '',
})

const errorMessage = ref('')
const isSubmitting = ref(false)


const professionalTypes = [
    { label: 'Real Estate Agent', value: 'agent' },
    { label: 'Real Estate Broker', value: 'broker' },
    { label: 'Property Manager', value: 'property_manager' },
    { label: 'Developer', value: 'developer' },
    { label: 'Investor', value: 'investor' },
]


const closeModal = () => {
    emit('update:modelValue', false)
    emit('close')
    setTimeout(() => {
        resetForm()
    }, 300)
}

const handleBack = () => {
    emit('back')
}

const resetForm = () => {
    formData.professionalType = ''
    formData.licenseNumber = ''
    formData.brokerId = ''
    formData.zipCode = ''
    formData.mobilePhone = ''
    formData.extension = ''
    errorMessage.value = ''
}

const handleNext = async () => {
    errorMessage.value = ''

   
    if (!formData.professionalType) {
        errorMessage.value = 'Please select a professional type'
        return
    }

    if (!formData.licenseNumber) {
        errorMessage.value = 'Please enter your license number'
        return
    }

    if (!formData.zipCode) {
        errorMessage.value = 'Please enter your zip code'
        return
    }

    if (!formData.mobilePhone) {
        errorMessage.value = 'Please enter your mobile/phone number'
        return
    }

    isSubmitting.value = true

    try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Professional info submitted:', formData)
        emit('next', formData)
    } catch (error: any) {
        errorMessage.value = error.message || 'Failed to submit professional information'
    } finally {
        isSubmitting.value = false
    }
}


watch(
    () => props.modelValue,
    (newValue) => {
        if (import.meta.client) {
            document.body.style.overflow = newValue ? 'hidden' : ''
        }
    }
)


onUnmounted(() => {
    if (import.meta.client) {
        document.body.style.overflow = ''
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
        class="citizen-professional-modal"
        :style="{ width: 'min(45rem, 95vw)', maxWidth: '95vw' }"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl m-4',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div class="w-full text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <h1 class="text-2xl sm:text-3xl max-w-sm mx-auto font-semibold text-[#121A22] mb-2 leading-tight">
                    Add professional information
                </h1>
                <p class="text-sm text-[#121A22]">
                    Tell us about your professional background
                </p>
            </div>
        </template>

   
        <div class="px-6 pb-6 space-y-4">
         
            <div class="space-y-2">
                <label for="professionalType" class="block text-sm font-medium text-gray-700">
                    Professional type
                </label>
                <Dropdown
                    v-model="formData.professionalType"
                    :options="professionalTypes"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select type"
                    class="w-full"
                    :pt="{
                        root: 'w-full',
                        input: 'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    }" />
            </div>

           
            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-2">
                    <label for="licenseNumber" class="block text-sm font-medium text-gray-700">
                        License number
                    </label>
                    <InputText
                        id="licenseNumber"
                        v-model="formData.licenseNumber"
                        type="text"
                        placeholder="Enter your license number"
                        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>

                <div class="space-y-2">
                    <label for="brokerId" class="block text-sm font-medium text-gray-700">
                        Broker ID
                    </label>
                    <InputText
                        id="brokerId"
                        v-model="formData.brokerId"
                        type="text"
                        placeholder="Enter your broker ID"
                        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>
            </div>

           
            <div class="space-y-2">
                <label for="zipCode" class="block text-sm font-medium text-gray-700">
                    Zip code
                </label>
                <InputText
                    id="zipCode"
                    v-model="formData.zipCode"
                    type="text"
                    placeholder="Enter your zip code"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>

           
            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-2">
                    <label for="mobilePhone" class="block text-sm font-medium text-gray-700">
                        Mobile/Phone number
                    </label>
                    <InputText
                        id="mobilePhone"
                        v-model="formData.mobilePhone"
                        type="tel"
                        placeholder="Enter your mobile/phone number"
                        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>

                <div class="space-y-2">
                    <label for="extension" class="block text-sm font-medium text-gray-700">
                        Extension
                    </label>
                    <InputText
                        id="extension"
                        v-model="formData.extension"
                        type="text"
                        placeholder="Enter extension"
                        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                </div>
            </div>

           
            <div v-if="errorMessage" class="text-center">
                <p class="text-xs text-red-500">{{ errorMessage }}</p>
            </div>

          
            <button
                @click="handleNext"
                :disabled="isSubmitting"
                type="button"
                class="w-full px-6 py-3.5 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center mt-6">
                {{ isSubmitting ? 'Submitting...' : 'Next' }}
            </button>

            
            <div class="text-center pt-2">
                <p class="text-xs text-gray-600">
                    By using heyhomex, you agree to the
                    <a href="/terms" class="text-gray-900 font-medium hover:underline">Terms</a>
                    and
                    <a href="/privacy" class="text-gray-900 font-medium hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.citizen-professional-modal .p-dialog {
    border-radius: 1rem;
}

.citizen-professional-modal .p-dialog-header {
    border: none;
}

.citizen-professional-modal .p-dialog-content {
    border: none;
    padding-top: 0;
}
</style>
