<script setup>
useHead({ title: "Lead Details - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })

const route = useRoute()
// const leadId = route.params.id


const leadInfo = ref({
    client_name: 'John Doe',
    client_phone: '+1 (555) 123-4567',
    client_email: 'john.doe@example.com',
    client_location: 'Hawaii',
    property_id: 'heyhomex12345',
    property_title: 'Luxury Condo at City Center',
    property_location: 'Downtown Metropolis',
    budget_min: 800000,
    budget_max: 1200000,
    lead_status: 'contacted',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-03T15:30:00Z'
})


const activities = ref([
    {
        id: 1,
        activity_type: 'message',
        activity_title: 'Message',
        activity_description: 'Sent follow-up email about property details, including floor plans and virtual tour link, as requested during initial contact.',
        created_at: '2026-01-03T13:00:00Z'
    },
    {
        id: 2,
        activity_type: 'note',
        activity_title: 'Note',
        activity_description: 'Client expressed strong interest in 3-bedroom units with city views. Budget is flexible for the right property. Needs to discuss financing options.',
        created_at: '2026-01-03T07:00:00Z'
    },
    {
        id: 3,
        activity_type: 'message',
        activity_title: 'Message',
        activity_description: 'Sent follow-up email about property details, including floor plans and virtual tour link, as requested during initial contact.',
        created_at: '2026-01-01T10:00:00Z'
    }
])


const handleScheduleAppointment = () => {
    console.log('Schedule appointment')
}

const handleSendMessage = () => {
    console.log('Send message')
}

const handleAddNote = () => {
    console.log('Add note')
}

const goBack = () => {
    navigateTo('/agent/leads')
}
</script>

<template>
    <div class="space-y-6">

        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Icon name="lucide:arrow-left" class="w-5 h-5 text-gray-600" />
                </button>
                <h1 class="text-2xl font-semibold text-gray-900">Lead details</h1>
            </div>
            <div class="flex items-center gap-2">
                <button @click="handleScheduleAppointment"
                    class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Schedule Appointment
                </button>
                <button @click="handleSendMessage"
                    class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Message
                </button>
                <button @click="handleAddNote"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    Add Note
                </button>
            </div>
        </div>


        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div class="space-y-6">

                <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-6">Lead Information</h3>

                    <div class="space-y-4">

                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-sm text-gray-600">Lead Name:</span>
                            <span class="text-sm font-medium text-gray-900">{{ leadInfo.client_name }}</span>
                        </div>


                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-sm text-gray-600">Phone Number:</span>
                            <span class="text-sm font-medium text-gray-900">{{ leadInfo.client_phone }}</span>
                        </div>


                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-sm text-gray-600">Email Address:</span>
                            <span class="text-sm font-medium text-gray-900">{{ leadInfo.client_email }}</span>
                        </div>


                        <div class="flex items-center justify-between py-3">
                            <span class="text-sm text-gray-600">Lead Location</span>
                            <span class="text-sm font-medium text-gray-900">{{ leadInfo.client_location }}</span>
                        </div>
                    </div>
                </div>


                <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-6">Property Interest</h3>

                    <div class="space-y-4">

                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-sm text-gray-600">Property ID:</span>
                            <span class="text-sm font-medium text-gray-900">{{ leadInfo.property_id }}</span>
                        </div>


                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-sm text-gray-600">Property Title:</span>
                            <span class="text-sm font-medium text-gray-900">{{ leadInfo.property_title }}</span>
                        </div>


                        <div class="flex items-center justify-between py-3 border-b border-gray-100">
                            <span class="text-sm text-gray-600">Location:</span>
                            <span class="text-sm font-medium text-gray-900">{{ leadInfo.property_location }}</span>
                        </div>


                        <div class="flex items-center justify-between py-3">
                            <span class="text-sm text-gray-600">Budget Range:</span>
                            <span class="text-sm font-medium text-gray-900">{{ $formatBudgetRange(leadInfo) }}</span>
                        </div>
                    </div>
                </div>
            </div>


            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h3>

                <div class="space-y-5">
                    <div v-for="activity in activities" :key="activity.id"
                        class="border-b border-gray-100 pb-5 last:border-0">

                        <div class="flex items-start gap-2 mb-2">
                            <Icon
                                :name="activity.activity_type === 'message' ? 'lucide:message-square' : 'lucide:file-text'"
                                class="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-semibold text-gray-900">{{ activity.activity_title
                                    }}</span>
                                    <span class="text-xs text-gray-500">{{ $formatRelativeTime(activity.created_at)
                                    }}</span>
                                </div>
                            </div>
                        </div>


                        <p class="text-sm text-gray-600 leading-relaxed pl-6">
                            {{ activity.activity_description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
