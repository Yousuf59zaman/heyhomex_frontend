<script setup>
const props = defineProps({
    appointments: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const getStatusInfo = (leadStatus) => {
    if (!leadStatus) {
        return { text: 'Unknown', color: 'gray' }
    }

    const status = leadStatus.name?.toLowerCase() || ''
    const statusMap = {
        'new': { text: 'New', color: 'green' },
        'claimed': { text: 'Claimed', color: 'blue' },
        'contacted': { text: 'Contacted', color: 'yellow' },
        'schedule': { text: 'Scheduled', color: 'purple' },
        'converted': { text: 'Converted', color: 'green' },
        'lost': { text: 'Lost', color: 'red' }
    }
    return statusMap[status] || { text: leadStatus.name || 'Unknown', color: 'gray' }
}

const getStatusColor = (color) => {
    const colors = {
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        purple: 'bg-purple-100 text-purple-700',
        red: 'bg-red-100 text-red-700',
        gray: 'bg-gray-100 text-gray-700'
    }
    return colors[color] || 'bg-gray-100 text-gray-700'
}

const formatAppointmentDate = (date, time) => {
    if (!date) return 'N/A'
    const dateObj = new Date(date)
    const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return time ? `${formatted} ${time}` : formatted
}

const handleActionMenu = (appointment) => {
    console.log('Action for appointment:', appointment.id)
}

const handleSeeAll = () => {
    navigateTo('/agent/leads?type=2')
}

const handleLeadClick = (leadId) => {
    navigateTo(`/agent/leads/${leadId}`)
}
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-semibold text-gray-900">Upcoming Appointments</h3>
            <button @click="handleSeeAll" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                See all
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>

        <!-- Table -->
        <div v-else-if="appointments.length > 0" class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Date & Time</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Property</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact Info</th>
                        <!-- <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Action</th> -->
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="appointment in appointments" :key="appointment.id"
                        @click="handleLeadClick(appointment.id)"
                        class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                        <!-- Status -->
                        <td class="py-4 px-4">
                            <span class="px-3 py-1 text-xs font-medium rounded-md"
                                :class="getStatusColor(getStatusInfo(appointment.lead_status).color)">
                                {{ getStatusInfo(appointment.lead_status).text }}
                            </span>
                        </td>

                        <!-- Date & Time -->
                        <td class="py-4 px-4">
                            <div class="text-sm text-gray-900">
                                {{ formatAppointmentDate(appointment.date, appointment.time) }}
                            </div>
                        </td>

                        <!-- Name with Avatar -->
                        <td class="py-4 px-4">
                            <div class="flex items-center space-x-3">
                                <img :src="appointment.customer?.photo || '/images/dashboard/1.png'"
                                    :alt="appointment.name" class="w-8 h-8 rounded-full object-cover"
                                    @error="$event.target.src = '/images/dashboard/1.png'" />
                                <span class="text-sm text-gray-900">{{ appointment.name }}</span>
                            </div>
                        </td>

                        <!-- Property -->
                        <td class="py-4 px-4">
                            <div class="max-w-xs">
                                <div class="text-sm font-medium text-gray-900 truncate">{{ appointment.property?.name || 'N/A' }}</div>
                                <div class="text-xs text-gray-500 truncate">{{ appointment.property?.address || '' }}</div>
                            </div>
                        </td>

                        <!-- Contact Info -->
                        <td class="py-4 px-4">
                            <div class="flex items-center space-x-2">
                                <Icon :name="appointment.phone ? 'lucide:phone' : 'lucide:mail'"
                                    class="w-4 h-4 text-gray-400" />
                                <span class="text-sm text-gray-600">{{ appointment.phone || appointment.email }}</span>
                            </div>
                        </td>

                        <!-- Action -->
                        <!-- <td class="py-4 px-4">
                            <button @click.stop="handleActionMenu(appointment)"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <Icon name="lucide:more-vertical" class="w-5 h-5" />
                            </button>
                        </td> -->
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Empty State -->
        <div v-else class="py-8 text-center text-gray-500 text-sm">
            No upcoming appointments
        </div>
    </div>
</template>
