<script setup>
useHead({ title: "Calendar - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })


const currentDate = ref(new Date(2026, 0, 3))
const selectedDate = ref(new Date(2026, 0, 3))
const viewMode = ref('Month')


const selectedDateFormatted = computed(() => {
    return selectedDate.value.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
})


const upcomingAppointments = ref([
    {
        id: 1,
        appointment_status: 'accepted',
        scheduled_at: '2026-01-03T10:00:00Z',
        scheduled_end_at: '2026-01-03T11:00:00Z',
        client_name: 'Annette Black',
        client_avatar: '/images/dashboard/1.png',
        property_address: '123A Elm Street',
        contact_info: '(555) 123-4567',
        contact_type: 'phone',
        created_at: '2026-01-01T10:00:00Z',
        updated_at: '2026-01-02T15:30:00Z'
    },
    {
        id: 2,
        appointment_status: 'pending',
        scheduled_at: '2026-01-03T10:00:00Z',
        scheduled_end_at: '2026-01-03T11:00:00Z',
        client_name: 'Ralph Edwards',
        client_avatar: '/images/dashboard/2.png',
        property_address: '450 Pine Avenue',
        contact_info: 'jane@example.com',
        contact_type: 'email',
        created_at: '2026-01-02T10:00:00Z',
        updated_at: '2026-01-02T15:30:00Z'
    },
    {
        id: 3,
        appointment_status: 'pending',
        scheduled_at: '2026-01-03T10:00:00Z',
        scheduled_end_at: '2026-01-03T11:00:00Z',
        client_name: 'Darlene Robertson',
        client_avatar: '/images/dashboard/3.png',
        property_address: '7C Sunset Blvd',
        contact_info: '(555) 888-9999',
        contact_type: 'phone',
        created_at: '2026-01-02T10:00:00Z',
        updated_at: '2026-01-02T15:30:00Z'
    }
])


const allAppointments = ref([
    {
        id: 1,
        appointment_status: 'confirmed',
        scheduled_at: '2026-01-03T08:00:00Z',
        scheduled_end_at: '2026-01-03T09:00:00Z',
        client_name: 'John Johnson',
        property_address: '56 Easton Melalin Suite 157',
        client_phone: '(555) 123-4567',
        is_request: false,
        is_added_to_calendar: true,
        created_at: '2026-01-01T10:00:00Z',
        updated_at: '2026-01-01T15:30:00Z'
    },
    {
        id: 2,
        appointment_status: 'confirmed',
        scheduled_at: '2026-01-03T10:00:00Z',
        scheduled_end_at: '2026-01-03T11:00:00Z',
        client_name: 'Bill Johnson',
        property_address: '56 Easton Melalin Suite 157',
        client_phone: '(555) 123-4567',
        is_request: false,
        is_added_to_calendar: false,
        created_at: '2026-01-02T10:00:00Z',
        updated_at: '2026-01-02T15:30:00Z'
    },
    {
        id: 3,
        appointment_status: 'requested',
        scheduled_at: '2026-01-03T13:00:00Z',
        scheduled_end_at: '2026-01-03T14:00:00Z',
        client_name: 'Sarah Williams',
        property_address: '56 Easton Melalin Suite 157',
        client_phone: '(555) 123-4567',
        is_request: true,
        is_added_to_calendar: false,
        created_at: '2026-01-03T10:00:00Z',
        updated_at: '2026-01-03T10:00:00Z'
    },
    {
        id: 4,
        appointment_status: 'confirmed',
        scheduled_at: '2026-01-05T09:00:00Z',
        scheduled_end_at: '2026-01-05T10:00:00Z',
        client_name: 'Michael Brown',
        property_address: '789 Oak Street',
        client_phone: '(555) 234-5678',
        is_request: false,
        is_added_to_calendar: true,
        created_at: '2026-01-02T10:00:00Z',
        updated_at: '2026-01-02T15:30:00Z'
    },
    {
        id: 5,
        appointment_status: 'accepted',
        scheduled_at: '2026-01-05T14:00:00Z',
        scheduled_end_at: '2026-01-05T15:00:00Z',
        client_name: 'Emily Davis',
        property_address: '321 Maple Avenue',
        client_phone: '(555) 345-6789',
        is_request: false,
        is_added_to_calendar: false,
        created_at: '2026-01-03T10:00:00Z',
        updated_at: '2026-01-04T15:30:00Z'
    },
    {
        id: 6,
        appointment_status: 'requested',
        scheduled_at: '2026-01-07T11:00:00Z',
        scheduled_end_at: '2026-01-07T12:00:00Z',
        client_name: 'James Wilson',
        property_address: '654 Pine Road',
        client_phone: '(555) 456-7890',
        is_request: true,
        is_added_to_calendar: false,
        created_at: '2026-01-05T10:00:00Z',
        updated_at: '2026-01-05T10:00:00Z'
    }
])


const todayAppointments = computed(() => {
    return allAppointments.value.filter(appointment => {
        const appointmentDate = new Date(appointment.scheduled_at)
        return appointmentDate.getDate() === selectedDate.value.getDate() &&
            appointmentDate.getMonth() === selectedDate.value.getMonth() &&
            appointmentDate.getFullYear() === selectedDate.value.getFullYear()
    }).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
})


const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []


    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
            date: prevMonthLastDay - i,
            isCurrentMonth: false,
            isToday: false
        })
    }


    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i)
        const isToday = date.toDateString() === new Date(2026, 0, 3).toDateString()


        const hasAppointments = allAppointments.value.some(appointment => {
            const appointmentDate = new Date(appointment.scheduled_at)
            return appointmentDate.getDate() === i &&
                appointmentDate.getMonth() === month &&
                appointmentDate.getFullYear() === year
        })

        days.push({
            date: i,
            isCurrentMonth: true,
            isToday,
            hasEvent: hasAppointments
        })
    }


    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: i,
            isCurrentMonth: false,
            isToday: false
        })
    }

    return days
})

const monthName = computed(() => {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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

const getAppointmentActions = (appointment) => {
    if (appointment.appointment_status === 'requested') {
        return ['Accept', 'Decline']
    }
    if (appointment.is_added_to_calendar) {
        return ['Reschedule']
    }
    return ['Reschedule', 'Add To Calendar']
}


const showRescheduleModal = ref(false)
const selectedAppointmentForReschedule = ref(null)
const rescheduleDateTime = ref(null)

const handleAcceptAppointment = (appointment) => {
    const index = allAppointments.value.findIndex(apt => apt.id === appointment.id)
    if (index !== -1) {
        allAppointments.value[index].appointment_status = 'accepted'
        allAppointments.value[index].is_request = false
    }
}

const handleDeclineAppointment = (appointment) => {
    const index = allAppointments.value.findIndex(apt => apt.id === appointment.id)
    if (index !== -1) {
        allAppointments.value[index].appointment_status = 'cancelled'
        setTimeout(() => {
            allAppointments.value.splice(index, 1)
        }, 500)
    }
}

const handleAddToCalendar = (appointment) => {
    const index = allAppointments.value.findIndex(apt => apt.id === appointment.id)
    if (index !== -1) {
        allAppointments.value[index].is_added_to_calendar = true
    }
}

const handleRescheduleAppointment = (appointment) => {
    selectedAppointmentForReschedule.value = appointment
    rescheduleDateTime.value = new Date(appointment.scheduled_at)
    showRescheduleModal.value = true
}

const confirmReschedule = () => {
    if (!rescheduleDateTime.value || !selectedAppointmentForReschedule.value) return

    const index = allAppointments.value.findIndex(
        apt => apt.id === selectedAppointmentForReschedule.value.id
    )

    if (index !== -1) {
        const originalStart = new Date(allAppointments.value[index].scheduled_at)
        const originalEnd = new Date(allAppointments.value[index].scheduled_end_at)
        const duration = originalEnd - originalStart

        const newStart = new Date(rescheduleDateTime.value)
        const newEnd = new Date(newStart.getTime() + duration)

        allAppointments.value[index].scheduled_at = newStart.toISOString()
        allAppointments.value[index].scheduled_end_at = newEnd.toISOString()
        allAppointments.value[index].updated_at = new Date().toISOString()
        selectedDate.value = newStart
    }

    showRescheduleModal.value = false
    selectedAppointmentForReschedule.value = null
    rescheduleDateTime.value = null
}

const formatAppointmentTime = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${startTime}-${endTime}`
}

const cancelReschedule = () => {
    showRescheduleModal.value = false
    selectedAppointmentForReschedule.value = null
    rescheduleDateTime.value = null
}


const handleAppointmentAction = (appointment, action) => {
    switch (action) {
        case 'Accept':
            handleAcceptAppointment(appointment)
            break
        case 'Decline':
            handleDeclineAppointment(appointment)
            break
        case 'Reschedule':
            handleRescheduleAppointment(appointment)
            break
        case 'Add To Calendar':
            handleAddToCalendar(appointment)
            break
    }
}

const previousMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const handleActionMenu = (appointment) => {
    console.log('Action for appointment:', appointment.id)
}

const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
        const year = currentDate.value.getFullYear()
        const month = currentDate.value.getMonth()
        selectedDate.value = new Date(year, month, day.date)
    }
}
</script>

<template>
    <div class="space-y-6">

        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Calendar</h1>
        </div>


        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-base font-semibold text-gray-900">Upcoming Appointments</h3>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">Date & Time</th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">Name</th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">Property</th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">Contact Info</th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="appointment in upcomingAppointments" :key="appointment.id"
                            class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td class="py-4 px-6">
                                <span class="px-3 py-1 text-xs font-medium rounded-md"
                                    :class="getStatusColor(getStatusInfo(appointment.appointment_status).color)">
                                    {{ getStatusInfo(appointment.appointment_status).text }}
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-sm text-gray-900">
                                    {{ $formatDate(appointment.scheduled_at) }}
                                    {{ formatAppointmentTime(appointment.scheduled_at, appointment.scheduled_end_at) }}
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center space-x-3">
                                    <img :src="appointment.client_avatar" :alt="appointment.client_name"
                                        class="w-8 h-8 rounded-full object-cover" />
                                    <span class="text-sm text-gray-900">{{ appointment.client_name }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <span class="text-sm text-gray-600">{{ appointment.property_address }}</span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center space-x-2">
                                    <Icon :name="appointment.contact_type === 'phone' ? 'lucide:phone' : 'lucide:mail'"
                                        class="w-4 h-4 text-gray-400" />
                                    <span class="text-sm text-gray-600">{{ appointment.contact_info }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
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


        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">

                <div class="flex items-center justify-between mb-6">
                    <div class="text-sm text-gray-500">Today</div>
                    <div class="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button v-for="mode in ['Day', 'Week', 'Month']" :key="mode" @click="viewMode = mode" :class="[
                            'px-4 py-1.5 text-sm transition-colors border-r border-gray-200 last:border-r-0',
                            viewMode === mode
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                        ]">
                            {{ mode }}
                        </button>
                    </div>
                </div>


                <div class="flex items-center justify-between mb-6">
                    <button @click="previousMonth" class="p-2 hover:bg-gray-100 rounded transition-colors">
                        <Icon name="lucide:chevron-left" class="w-5 h-5" />
                    </button>
                    <h3 class="text-lg font-semibold text-gray-900">{{ monthName }}</h3>
                    <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded transition-colors">
                        <Icon name="lucide:chevron-right" class="w-5 h-5" />
                    </button>
                </div>


                <div class="grid grid-cols-7 gap-px bg-gray-200">

                    <div v-for="day in ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']" :key="day"
                        class="bg-gray-50 p-3 text-center">
                        <span class="text-xs font-medium text-gray-600">{{ day }}</span>
                    </div>


                    <div v-for="(day, index) in calendarDays" :key="index" @click="handleDateClick(day)" :class="[
                        'bg-white p-3 min-h-[80px] relative cursor-pointer hover:bg-gray-50 transition-colors',
                        !day.isCurrentMonth && 'text-gray-400',
                        day.isToday && 'bg-blue-50',
                        day.isCurrentMonth && day.date === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && 'ring-2 ring-blue-500 ring-inset'
                    ]">
                        <div :class="[
                            'text-sm font-medium',
                            day.isToday && 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center'
                        ]">
                            {{ day.date }}
                        </div>
                        <div v-if="day.hasEvent" class="mt-2">
                            <div class="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded text-center">
                                {{allAppointments.filter(apt => {
                                    const aptDate = new Date(apt.scheduled_at)
                                    return aptDate.getDate() === day.date &&
                                        aptDate.getMonth() === currentDate.getMonth() &&
                                        aptDate.getFullYear() === currentDate.getFullYear()
                                }).length}} appointment{{allAppointments.filter(apt => {
                                    const aptDate = new Date(apt.scheduled_at)
                                    return aptDate.getDate() === day.date &&
                                        aptDate.getMonth() === currentDate.getMonth() &&
                                        aptDate.getFullYear() === currentDate.getFullYear()
                                }).length > 1 ? 's' : ''}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ selectedDateFormatted }}</h3>


                <div v-if="todayAppointments.length === 0" class="text-center py-12">
                    <Icon name="lucide:calendar-x" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p class="text-sm text-gray-500">No appointments scheduled for this date</p>
                </div>


                <div v-else class="space-y-5">
                    <div v-for="appointment in todayAppointments" :key="appointment.id"
                        class="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                        <div class="mb-3">
                            <div class="text-sm font-semibold text-gray-900 mb-2">
                                {{ formatAppointmentTime(appointment.scheduled_at, appointment.scheduled_end_at) }}
                            </div>
                            <div class="text-sm font-medium text-gray-900 mb-1">{{ appointment.client_name }}</div>
                            <div class="text-xs text-gray-600 mb-0.5">{{ appointment.property_address }}</div>
                            <div class="text-xs text-gray-600">{{ appointment.client_phone }}</div>
                        </div>

                        <div class="flex gap-2">
                            <button v-for="action in getAppointmentActions(appointment)" :key="action"
                                @click="handleAppointmentAction(appointment, action)" :class="[
                                    'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                                    action === 'Accept'
                                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                                        : action === 'Decline'
                                            ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                ]">
                                {{ action }}
                            </button>
                        </div>

                        <div v-if="appointment.is_request" class="text-xs text-gray-500 text-center mt-3">
                            End of schedule
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div v-if="showRescheduleModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="cancelReschedule">
            <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
                    <button @click="cancelReschedule" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <Icon name="lucide:x" class="w-5 h-5" />
                    </button>
                </div>

                <div v-if="selectedAppointmentForReschedule" class="mb-4">
                    <p class="text-sm text-gray-600 mb-2">
                        Rescheduling appointment with <span class="font-medium text-gray-900">{{
                            selectedAppointmentForReschedule.client_name }}</span>
                    </p>
                    <p class="text-xs text-gray-500">
                        {{ selectedAppointmentForReschedule.property_address }}
                    </p>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Select New Date & Time
                    </label>
                    <Calendar v-model="rescheduleDateTime" showTime hourFormat="12" :showIcon="true"
                        :minDate="new Date()" dateFormat="M dd, yy" class="w-full" />
                </div>

                <div class="flex gap-3">
                    <button @click="cancelReschedule"
                        class="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button @click="confirmReschedule" :disabled="!rescheduleDateTime"
                        class="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Confirm Reschedule
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
