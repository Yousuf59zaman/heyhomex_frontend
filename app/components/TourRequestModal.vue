<script setup>
const props = defineProps({
    visible: Boolean,
    property: Object,
    agentId: Number,
    userId: Number,
})

const emit = defineEmits(['update:visible', 'tourBooked'])

const step = ref(1)
const loading = ref(false)
const toast = useToast()

const selectedDates = ref([])
const selectedTimes = ref([])

const tourForm = ref({
    name: '',
    email: '',
    phone: '',
    message: '',
    wantFinancing: false,
})


const availableDates = computed(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        dates.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            date: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            fullDate: date.toISOString().split('T')[0],
        })
    }
    return dates
})

const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
]

const toggleDate = (date) => {
    const index = selectedDates.value.indexOf(date.fullDate)
    if (index > -1) {
        selectedDates.value.splice(index, 1)
    } else {
        if (selectedDates.value.length < 3) {
            selectedDates.value.push(date.fullDate)
        }
    }
}

const isDateSelected = (date) => {
    return selectedDates.value.includes(date.fullDate)
}

const toggleTime = (time) => {
    const index = selectedTimes.value.indexOf(time)
    if (index > -1) {
        selectedTimes.value.splice(index, 1)
    } else {
        if (selectedTimes.value.length < 3) {
            selectedTimes.value.push(time)
        }
    }
}

// const isTimeSelected = (time) => {
//     return selectedTimes.value.includes(time)
// }

const addTimeSlot = () => {
    toast.add({
        severity: 'info',
        summary: 'Feature',
        detail: 'Custom time selection coming soon',
        life: 3000
    })
}

const goToConfirmStep = () => {
    if (selectedDates.value.length === 0 || selectedTimes.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Required',
            detail: 'Please select at least one date and time',
            life: 3000
        })
        return
    }
    step.value = 2
}

const goBackToRequest = () => {
    step.value = 1
}

const submitTourRequest = async () => {
    if (!tourForm.value.name || !tourForm.value.email || !tourForm.value.phone) {
        toast.add({
            severity: 'warn',
            summary: 'Required Fields',
            detail: 'Please fill in all required fields',
            life: 3000
        })
        return
    }

    loading.value = true
    try {
        const [date] = selectedDates.value
        const [time] = selectedTimes.value


        const convertTo24Hour = (time12h) => {
            const [time, modifier] = time12h.split(' ')
            let [hours, minutes] = time.split(':')
            if (hours === '12') {
                hours = '00'
            }
            if (modifier === 'PM') {
                hours = parseInt(hours, 10) + 12
            }
            return `${hours}:${minutes}:00`
        }

        const response = await $fetchCitizen('/v1/leads/store', {
            method: 'POST',
            body: {
                user_id: props.userId,
                property_id: props.property?.id,
                agent_id: props.agentId,
                name: tourForm.value.name,
                email: tourForm.value.email,
                phone: tourForm.value.phone,
                message: tourForm.value.message || 'Tour request',
                date: date,
                time: convertTo24Hour(time),
                type: 2,
            },
        })

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Tour request submitted successfully',
            life: 3000
        })

        emit('tourBooked', response.data)
        closeModal()
    } catch (error) {
        console.error('Error submitting tour request:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to submit tour request',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

const closeModal = () => {
    step.value = 1
    selectedDates.value = []
    selectedTimes.value = []
    tourForm.value = {
        name: '',
        email: '',
        phone: '',
        message: '',
        wantFinancing: false,
    }
    emit('update:visible', false)
}
</script>

<template>
    <Dialog :visible="visible" modal :closable="true" @update:visible="closeModal"
        :style="{ width: '90vw', maxWidth: '450px' }" :contentStyle="{ padding: 0 }">
        <template #header>
            <div class="flex items-center justify-between w-full pr-2">
                <h2 class="text-lg font-semibold text-gray-900">
                    {{ step === 1 ? 'Request a tour' : 'Confirm your tour' }}
                </h2>
            </div>
        </template>

        <!-- Step 1: Request a tour -->
        <div v-if="step === 1" class="p-6 space-y-5">

            <div class="flex gap-3">
                <img v-if="property?.image" :src="property.image" :alt="property.name"
                    class="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div v-else class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon name="lucide:home" class="w-8 h-8 text-gray-400" />
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 text-sm truncate">{{ property?.address || 'Property' }}</h3>
                    <p class="text-xs text-gray-600">{{ property?.beds }} bd | {{ property?.baths }} ba | {{
                        property?.sqft }} sqft</p>
                </div>
            </div>


            <div class="flex gap-2">
                <Icon name="lucide:home" class="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-gray-700 leading-relaxed">
                    Go on a personalized tour of this home by connecting with a local buyer's agent who advertises on
                    HeyHome
                </p>
            </div>


            <div>
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Select up to 3 times</h4>


                <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button v-for="date in availableDates" :key="date.fullDate" type="button" @click="toggleDate(date)"
                        :class="[
                            'flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg border-2 transition-all',
                            isDateSelected(date)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        ]">
                        <span class="text-xs font-medium text-gray-600">{{ date.day }}</span>
                        <span class="text-xs text-gray-500">{{ date.month }} {{ date.date }}</span>
                    </button>
                </div>


                <Dropdown v-model="selectedTimes[0]" :options="timeSlots" placeholder="Select a time"
                    class="w-full mb-3" />


                <div class="flex gap-2">
                    <button v-for="i in 2" :key="i" type="button" @click="addTimeSlot"
                        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                        <Icon name="lucide:plus-circle" class="w-4 h-4" />
                        <span>Add a time</span>
                    </button>
                </div>
            </div>


            <Button label="Next" :loading="loading" @click="goToConfirmStep"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold" />
        </div>


        <div v-if="step === 2" class="p-6 space-y-5">

            <div class="flex gap-3">
                <img v-if="property?.image" :src="property.image" :alt="property.name"
                    class="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div v-else class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon name="lucide:home" class="w-8 h-8 text-gray-400" />
                </div>
            </div>

            <h3 class="text-base font-semibold text-gray-900">How can we reach out to confirm the tour?</h3>


            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <InputText v-model="tourForm.name" placeholder="Enter your name"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <InputText v-model="tourForm.email" type="email" placeholder="Enter your email"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <InputText v-model="tourForm.phone" type="tel" placeholder="Enter your phone"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <Textarea v-model="tourForm.message" placeholder="Enter your message" rows="3"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none" />
                </div>
            </div>


            <div class="flex items-start gap-2">
                <Checkbox v-model="tourForm.wantFinancing" binary inputId="financing" class="mt-0.5" />
                <label for="financing" class="text-sm text-gray-700 cursor-pointer">
                    I want financing information
                </label>
            </div>


            <div class="flex gap-3">
                <Button label="Back" outlined @click="goBackToRequest" class="flex-1 py-2.5 rounded-lg" />
                <Button label="Request tour" :loading="loading" @click="submitTourRequest"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold" />
            </div>


            <p class="text-xs text-gray-500 leading-relaxed">
                By pressing Request tour, you agree that HeyHome and its affiliates may call/text you about your
                inquiry,
                which may involve use of automated means and prerecorded/artificial voices. You don't need to consent as
                a
                condition of buying any property, goods or services. Message/data rates may apply. You also agree to our
                Terms of Use. HeyHome does not endorse any real estate professionals. We may share information about
                your
                recent and future site activity with your agent to help them understand what you're looking for in a
                home.
            </p>
        </div>

        <Toast position="top-right" />
    </Dialog>
</template>

<style scoped>
:deep(.p-dialog-header) {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

:deep(.p-dialog-content) {
    padding: 0 !important;
}

:deep(.p-dropdown) {
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
}

:deep(.p-inputtext) {
    width: 100%;
}

:deep(.p-checkbox .p-checkbox-box) {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.25rem;
}
</style>
