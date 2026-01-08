<script setup>
const props = defineProps({
    appointments: {
        type: Array,
        default: () => []
    }
})


const getStatusInfo = (status) => {
    const statusMap = {
        'accepted': { text: 'Accepted', color: 'green' },
        'pending': { text: 'Pending', color: 'orange' },
        'confirmed': { text: 'Confirmed', color: 'blue' },
        'requested': { text: 'Requested', color: 'orange' },
        'cancelled': { text: 'Cancelled', color: 'red' },
        'completed': { text: 'Completed', color: 'blue' }
    }
    return statusMap[status] || { text: 'Unknown', color: 'gray' }
}

const getStatusColor = (color) => {
    const colors = {
        green: 'bg-green-100 text-green-700',
        orange: 'bg-orange-100 text-orange-700',
        blue: 'bg-blue-100 text-blue-700',
        red: 'bg-red-100 text-red-700',
        gray: 'bg-gray-100 text-gray-700'
    }
    return colors[color] || 'bg-gray-100 text-gray-700'
}

const formatAppointmentDate = (isoDate) => {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatAppointmentTime = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${startTime}-${endTime}`
}

const handleActionMenu = (appointment) => {
    console.log('Action for appointment:', appointment.id)
}

const handleSeeAll = () => {
    navigateTo('/agent/calendar')
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

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Date & Time</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Property</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact Info</th>
                        <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="appointment in appointments" :key="appointment.id"
                        class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <!-- Status -->
                        <td class="py-4 px-4">
                            <span class="px-3 py-1 text-xs font-medium rounded-md"
                                :class="getStatusColor(getStatusInfo(appointment.appointment_status).color)">
                                {{ getStatusInfo(appointment.appointment_status).text }}
                            </span>
                        </td>

                        <!-- Date & Time -->
                        <td class="py-4 px-4">
                            <div class="text-sm text-gray-900">
                                {{ formatAppointmentDate(appointment.scheduled_at) }}
                                {{ formatAppointmentTime(appointment.scheduled_at, appointment.scheduled_end_at) }}
                            </div>
                        </td>

                        <!-- Name with Avatar -->
                        <td class="py-4 px-4">
                            <div class="flex items-center space-x-3">
                                <img :src="appointment.client_avatar" :alt="appointment.client_name"
                                    class="w-8 h-8 rounded-full object-cover" />
                                <span class="text-sm text-gray-900">{{ appointment.client_name }}</span>
                            </div>
                        </td>

                        <!-- Property -->
                        <td class="py-4 px-4">
                            <span class="text-sm text-gray-600">{{ appointment.property_address }}</span>
                        </td>

                        <!-- Contact Info -->
                        <td class="py-4 px-4">
                            <div class="flex items-center space-x-2">
                                <Icon :name="appointment.contact_type === 'phone' ? 'lucide:phone' : 'lucide:mail'"
                                    class="w-4 h-4 text-gray-400" />
                                <span class="text-sm text-gray-600">{{ appointment.contact_info }}</span>
                            </div>
                        </td>

                        <!-- Action -->
                        <td class="py-4 px-4">
                            <button @click="handleActionMenu(appointment)"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <Icon name="lucide:more-vertical" class="w-5 h-5" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
