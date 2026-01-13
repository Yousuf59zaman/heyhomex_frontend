<script setup>
useHead({ title: "Calendar - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })

const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const viewMode = ref('Month')
const loading = ref(false)
const loadingUpcoming = ref(false)
const allAppointments = ref([])
const upcomingAppointmentsData = ref([])
const leadStatuses = ref([])
const responseModal = ref({})

const selectedDateFormatted = computed(() => {
    return selectedDate.value.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        weekday: 'long'
    })
})


const fetchLeadStatuses = async () => {
    try {
        const response = await $fetchCMS('admin/lead-statuses/all/active', {
            method: 'GET'
        })
        leadStatuses.value = response.data || []
    } catch (error) {
        console.error('Error fetching lead statuses:', error)
    }
}


const fetchMonthAppointments = async () => {
    loading.value = true
    try {
        const year = currentDate.value.getFullYear()
        const month = currentDate.value.getMonth()
        const startDate = year + '-' + String(month + 1).padStart(2, '0') + '-01'
        const lastDay = new Date(year, month + 1, 0).getDate()
        const endDate = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0')

        const response = await $fetchCitizen('agent/v1/leads/list', {
            method: 'GET',
            params: {
                type: '2',
                start_date: startDate,
                end_date: endDate
            }
        })
        allAppointments.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching appointments:', error)
    } finally {
        loading.value = false
    }
}


const fetchUpcomingAppointments = async () => {
    loadingUpcoming.value = true
    try {
        const now = new Date()
        const currentDateTime = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0')

        const response = await $fetchCitizen('agent/v1/leads/list', {
            method: 'GET',
            params: {
                current_date_time: currentDateTime
            }
        })

        upcomingAppointmentsData.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error)
    } finally {
        loadingUpcoming.value = false
    }
}


const todayAppointments = computed(() => {
    const filtered = allAppointments.value.filter(appointment => {
        if (!appointment.date) return false
        const appointmentDate = appointment.date

        const selectedDateStr = selectedDate.value.getFullYear() + '-' +
            String(selectedDate.value.getMonth() + 1).padStart(2, '0') + '-' +
            String(selectedDate.value.getDate()).padStart(2, '0')
        return appointmentDate === selectedDateStr
    }).sort((a, b) => {
        if (!a.time || !b.time) return 0
        return a.time.localeCompare(b.time)
    })

    return filtered
})


const getAppointmentCount = (dateStr) => {
    return allAppointments.value.filter(apt =>
        apt.date === dateStr && apt.add_to_calendar
    ).length
}


const getPendingAppointmentCount = (dateStr) => {
    return allAppointments.value.filter(apt =>
        apt.date === dateStr && !apt.add_to_calendar
    ).length
}


const getClosedAppointmentCount = (dateStr) => {
    return allAppointments.value.filter(apt =>
        apt.date === dateStr && apt.lead_status?.name.toLowerCase() === 'closed'
    ).length
}

const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()


    let startingDayOfWeek = firstDay.getDay()
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)


    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
            date: prevMonthLastDay - i,
            isCurrentMonth: false,
            isToday: false,
            hasEvent: false,
            appointmentCount: 0,
            pendingCount: 0
        })
    }


    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i)
        date.setHours(0, 0, 0, 0)
        const isToday = date.getTime() === today.getTime()


        const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0')
        const appointmentCount = getAppointmentCount(dateStr)
        const pendingCount = getPendingAppointmentCount(dateStr)
        const closedCount = getClosedAppointmentCount(dateStr)
        const hasEvent = appointmentCount > 0 || pendingCount > 0 || closedCount > 0

        days.push({
            date: i,
            isCurrentMonth: true,
            isToday,
            hasEvent,
            appointmentCount,
            pendingCount,
            closedCount,
            fullDate: dateStr
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

const getStatusInfo = (leadStatus) => {
    if (!leadStatus) return { text: 'Unknown', color: 'gray' }

    const statusName = typeof leadStatus === 'string' ? leadStatus : leadStatus.name
    const lowerStatus = statusName.toLowerCase()

    const statusMap = {
        'new': { text: 'New', color: 'orange' },
        'contacted': { text: 'Contacted', color: 'blue' },
        'scheduled': { text: 'Scheduled', color: 'green' },
        'closed': { text: 'Closed', color: 'red' },
        'active': { text: 'Active', color: 'blue' },
        'pending': { text: 'Pending', color: 'orange' }
    }
    return statusMap[lowerStatus] || { text: statusName, color: 'gray' }
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

// const getAppointmentActions = (appointment) => {
//     if (appointment.appointment_status === 'requested') {
//         return ['Accept', 'Decline']
//     }
//     if (appointment.is_added_to_calendar) {
//         return ['Reschedule']
//     }
//     return ['Reschedule', 'Add To Calendar']
// }


const showRescheduleModal = ref(false)
const selectedAppointmentForReschedule = ref(null)
const rescheduleDateTime = ref(null)

// const handleAcceptAppointment = (appointment) => {
//     const index = allAppointments.value.findIndex(apt => apt.id === appointment.id)
//     if (index !== -1) {
//         allAppointments.value[index].appointment_status = 'accepted'
//         allAppointments.value[index].is_request = false
//     }
// }

// const handleDeclineAppointment = (appointment) => {
//     const index = allAppointments.value.findIndex(apt => apt.id === appointment.id)
//     if (index !== -1) {
//         allAppointments.value[index].appointment_status = 'cancelled'
//         setTimeout(() => {
//             allAppointments.value.splice(index, 1)
//         }, 500)
//     }
// }

// const updateAppointmentStatus = async (appointment, newStatusId) => {
//     try {
//         const formData = new FormData()
//         formData.append('_method', 'PATCH')
//         formData.append('status', newStatusId)


//         const scheduledStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'scheduled')
//         const scheduledStatusId = scheduledStatus ? scheduledStatus.id : 3

//         if (newStatusId === scheduledStatusId) {
//             formData.append('add_to_calendar', '1')
//         } else {
//             formData.append('add_to_calendar', '0')
//         }

//         await $fetchCitizen(`agent/v1/leads/${appointment.id}/update`, {
//             method: 'POST',
//             body: formData
//         })

//        
//         await fetchMonthAppointments()
//     } catch (error) {
//         console.error('Error updating appointment status:', error)
//     }
// }

const handleAddToCalendar = async (appointment) => {
    try {
        const isAdding = !appointment.add_to_calendar
        const formData = new FormData()
        formData.append('_method', 'PATCH')
        formData.append('add_to_calendar', isAdding ? '1' : '0')


        if (isAdding) {
            const scheduledStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'scheduled')
            if (scheduledStatus) {
                formData.append('status', scheduledStatus.id)
            }
        } else {
            const activeStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'active')
            if (activeStatus) {
                formData.append('status', activeStatus.id)
            }
        }

        await $fetchCitizen(`agent/v1/leads/${appointment.id}/update`, {
            method: 'POST',
            body: formData
        })


        await fetchMonthAppointments()


        showToast('Calendar updated successfully', 'success')
    } catch (error) {
        console.error('Error toggling calendar:', error)
        showToast('Failed to update calendar', 'error')
    }
}

const updateLeadStatusToActive = async (appointment) => {
    try {
        const activeStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'active')
        if (!activeStatus) return

        const formData = new FormData()
        formData.append('_method', 'PATCH')
        formData.append('status', activeStatus.id)
        formData.append('add_to_calendar', '0')

        await $fetchCitizen(`agent/v1/leads/${appointment.id}/update`, {
            method: 'POST',
            body: formData
        })


        await fetchMonthAppointments()


        showToast('Lead marked as Active', 'success')
    } catch (error) {
        console.error('Error updating lead status:', error)
        showToast('Failed to update status', 'error')
    }
}

const declineLead = async (appointment) => {
    try {
        const closedStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'closed')
        if (!closedStatus) return

        const formData = new FormData()
        formData.append('_method', 'PATCH')
        formData.append('status', closedStatus.id)
        formData.append('add_to_calendar', '0')

        await $fetchCitizen(`agent/v1/leads/${appointment.id}/update`, {
            method: 'POST',
            body: formData
        })


        await fetchMonthAppointments()


        showToast('Lead declined', 'success')
    } catch (error) {
        console.error('Error declining lead:', error)
        showToast('Failed to decline lead', 'error')
    }
}

const showToast = (message, type = 'success') => {
    responseModal.value = {
        status: type === 'success',
        message: message,
        error: type === 'error' ? { message: [message] } : null
    }
}

const handleRescheduleAppointment = (appointment) => {
    selectedAppointmentForReschedule.value = appointment
    if (appointment.date && appointment.time) {
        const dateTimeStr = `${appointment.date}T${appointment.time}`
        rescheduleDateTime.value = new Date(dateTimeStr)
    } else {
        rescheduleDateTime.value = new Date()
    }

    showRescheduleModal.value = true
}

const confirmReschedule = async () => {
    if (!rescheduleDateTime.value || !selectedAppointmentForReschedule.value) return
    try {
        const newDateTime = new Date(rescheduleDateTime.value)
        const newDate = newDateTime.getFullYear() + '-' +
            String(newDateTime.getMonth() + 1).padStart(2, '0') + '-' +
            String(newDateTime.getDate()).padStart(2, '0')

        const newTime = String(newDateTime.getHours()).padStart(2, '0') + ':' +
            String(newDateTime.getMinutes()).padStart(2, '0') + ':00'

        const formData = new FormData()
        formData.append('_method', 'PATCH')
        formData.append('date', newDate)
        formData.append('time', newTime)

        await $fetchCitizen(`agent/v1/leads/${selectedAppointmentForReschedule.value.id}/update`, {
            method: 'POST',
            body: formData
        })
        selectedDate.value = newDateTime
        await fetchMonthAppointments()
        showToast('Appointment rescheduled successfully', 'success')
    } catch (error) {
        console.error('Error rescheduling appointment:', error)
        showToast('Failed to reschedule appointment', 'error')
    } finally {
        showRescheduleModal.value = false
        selectedAppointmentForReschedule.value = null
        rescheduleDateTime.value = null
    }
}

const formatAppointmentTime = (date, time) => {
    if (!date || !time) return 'N/A'


    const timeParts = time.split(':')
    if (timeParts.length < 2) return time

    const hours = parseInt(timeParts[0])
    const minutes = timeParts[1]
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12

    return `${displayHours}:${minutes} ${ampm}`
}

const cancelReschedule = () => {
    showRescheduleModal.value = false
    selectedAppointmentForReschedule.value = null
    rescheduleDateTime.value = null
}


// const handleAppointmentAction = (appointment, action) => {
//     switch (action) {
//         case 'Accept':
//             handleAcceptAppointment(appointment)
//             break
//         case 'Decline':
//             handleDeclineAppointment(appointment)
//             break
//         case 'Reschedule':
//             handleRescheduleAppointment(appointment)
//             break
//         case 'Add To Calendar':
//             handleAddToCalendar(appointment)
//             break
//     }
// }

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

onMounted(() => {
    fetchLeadStatuses()
    fetchMonthAppointments()
    fetchUpcomingAppointments()
})


watch(currentDate, () => {
    fetchMonthAppointments()
})

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
                        <tr v-if="loadingUpcoming">
                            <td colspan="6" class="py-8 text-center text-gray-500">
                                Loading...
                            </td>
                        </tr>
                        <tr v-else-if="upcomingAppointmentsData.length === 0">
                            <td colspan="6" class="py-8 text-center text-gray-500">
                                No upcoming appointments
                            </td>
                        </tr>
                        <tr v-else v-for="appointment in upcomingAppointmentsData" :key="appointment.id"
                            @click="navigateTo(`/agent/leads/${appointment.id}`)"
                            class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                            <td class="py-4 px-6">
                                <span class="px-3 py-1 text-xs font-medium rounded-md"
                                    :class="getStatusColor(getStatusInfo(appointment.lead_status).color)">
                                    {{ getStatusInfo(appointment.lead_status).text }}
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-sm text-gray-900">
                                    {{ formatAppointmentTime(appointment.date, appointment.time) }}
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center space-x-3">
                                    <img :src="appointment.customer?.photo || '/images/dashboard/1.png'"
                                        :alt="appointment.name" class="w-8 h-8 rounded-full object-cover"
                                        @error="$event.target.src = '/images/dashboard/1.png'" />
                                    <span class="text-sm text-gray-900">{{ appointment.name }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="max-w-xs truncate">
                                    <div class="text-sm font-medium text-gray-900">{{ appointment.property?.name ||
                                        'N/A' }}</div>
                                    <div class="text-xs text-gray-500">{{ appointment.property?.address || '' }}</div>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center space-x-2">
                                    <Icon :name="appointment.phone ? 'lucide:phone' : 'lucide:mail'"
                                        class="w-4 h-4 text-gray-400" />
                                    <span class="text-sm text-gray-600">{{ appointment.phone || appointment.email
                                        }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <button @click.stop="handleActionMenu(appointment)"
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
                        <div v-if="day.hasEvent && day.isCurrentMonth" class="mt-2 space-y-1">
                            <div v-if="day.appointmentCount > 0"
                                class="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded text-center">
                                {{ day.appointmentCount }} appointment{{ day.appointmentCount > 1 ? 's' : '' }}
                            </div>
                            <div v-if="day.pendingCount > 0"
                                class="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded text-center">
                                {{ day.pendingCount }} pending
                            </div>
                            <div v-if="day.closedCount > 0"
                                class="text-[10px] bg-gray-500 text-white px-1.5 py-0.5 rounded text-center">
                                {{ day.closedCount }} closed
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
                            <div class="flex items-center justify-between mb-2">
                                <div class="text-sm font-semibold text-gray-900">
                                    {{ formatAppointmentTime(appointment.date, appointment.time) }}
                                </div>
                                <span class="px-2 py-1 text-xs font-medium rounded-md"
                                    :class="getStatusColor(getStatusInfo(appointment.lead_status).color)">
                                    {{ getStatusInfo(appointment.lead_status).text }}
                                </span>
                            </div>
                            <div class="text-sm font-medium text-gray-900 mb-1">{{ appointment.name }}</div>
                            <div class="text-xs text-gray-600 mb-0.5">{{ appointment.property?.name || 'N/A' }}</div>
                            <div class="text-xs text-gray-600 mb-0.5">{{ appointment.property?.address || '' }}</div>
                            <div class="text-xs text-gray-600">{{ appointment.phone || appointment.email }}</div>
                        </div>

                        <!-- Conditional Buttons -->
                        <div v-if="appointment.lead_status?.name.toLowerCase() === 'new' && !appointment.add_to_calendar"
                            class="flex gap-2">
                            <button @click="updateLeadStatusToActive(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700">
                                Active
                            </button>
                            <button @click="declineLead(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-red-600 text-white hover:bg-red-700">
                                Decline
                            </button>
                        </div>
                        <div v-else-if="appointment.lead_status?.name.toLowerCase() === 'closed'" class="flex gap-2">
                            <button disabled
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed">
                                Closed
                            </button>
                            <button @click="updateLeadStatusToActive(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700">
                                Active
                            </button>
                        </div>
                        <div v-else class="flex gap-2">
                            <button @click="handleRescheduleAppointment(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-900 text-white hover:bg-gray-800">
                                Reschedule
                            </button>
                            <button @click="handleAddToCalendar(appointment)" :class="[
                                'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                                appointment.add_to_calendar
                                    ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            ]">
                                {{ appointment.add_to_calendar ? 'Remove from Calendar' : 'Add to Calendar' }}
                            </button>
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
                            selectedAppointmentForReschedule.name }}</span>
                    </p>
                    <p class="text-xs text-gray-500">
                        {{ selectedAppointmentForReschedule.property?.address ||
                            selectedAppointmentForReschedule.property?.name || 'N/A' }}
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


        <ResponseModal :response_modal="responseModal" />
    </div>
</template>
