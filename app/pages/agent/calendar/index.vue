<script setup>
import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns'


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


const showGoogleSyncDropdown = ref({})
const isGoogleSynced = ref(false)
const showGoogleEventModal = ref(false)
const selectedAppointmentForGoogle = ref(null)
const googleEventStart = ref(null)
const googleEventEnd = ref(null)
const checkingGoogleSync = ref(false)


const showRescheduleModal = ref(false)
const selectedAppointmentForReschedule = ref(null)
const rescheduleDateTime = ref(null)
const isRescheduleCalendarOpen = ref(false)


const formatDateYMD = (dateObj) => {
    return dateObj.getFullYear() + '-' +
        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
        String(dateObj.getDate()).padStart(2, '0')
}


const getCurrentDateTimeString = () => {
    const now = new Date()
    return now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0')
}


const showToast = (message, type = 'success') => {
    responseModal.value = {
        status: type === 'success',
        message,
        error: type === 'error' ? { message: [message] } : null
    }
}


const selectedDateFormatted = computed(() => {
    return selectedDate.value.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        weekday: 'long'
    })
})


const monthName = computed(() => {
    return currentDate.value.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })
})


const weekTitle = computed(() => {
    const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate.value, { weekStartsOn: 1 })
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
})


const dayTitle = computed(() => {
    return format(currentDate.value, 'MMMM d, yyyy')
})


const todayAppointments = computed(() => {
    const selectedDateStr = formatDateYMD(selectedDate.value)

    return allAppointments.value
        .filter(appointment => {
            if (!appointment.date) return false

           
            if (appointment.lead_status?.name.toLowerCase() === 'closed') return false

            return appointment.date === selectedDateStr
        })
        .sort((a, b) => {
            if (!a.time || !b.time) return 0
            return a.time.localeCompare(b.time)
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

        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const lastDay = new Date(year, month + 1, 0).getDate()
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

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
        const currentDateTime = getCurrentDateTimeString()

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


const getAppointmentCount = (dateStr) => {
    return allAppointments.value.filter(apt => {
        if (apt.lead_status?.name.toLowerCase() === 'closed') return false
        return apt.date === dateStr && apt.add_to_calendar
    }).length
}


const getPendingAppointmentCount = (dateStr) => {
    return allAppointments.value.filter(apt => {
        if (apt.lead_status?.name.toLowerCase() === 'closed') return false
        return apt.date === dateStr && !apt.add_to_calendar
    }).length
}


const getAppointmentsForDate = (dateStr) => {
    return allAppointments.value
        .filter(apt => {
            if (apt.lead_status?.name.toLowerCase() === 'closed') return false
            return apt.date === dateStr
        })
        .sort((a, b) => {
            if (!a.time || !b.time) return 0
            return a.time.localeCompare(b.time)
        })
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
        const dateObj = new Date(year, month, i)
        dateObj.setHours(0, 0, 0, 0)

        const isToday = dateObj.getTime() === today.getTime()
        const dateStr = formatDateYMD(dateObj)

        const appointmentCount = getAppointmentCount(dateStr)
        const pendingCount = getPendingAppointmentCount(dateStr)

        const hasEvent = appointmentCount > 0 || pendingCount > 0

        days.push({
            date: i,
            isCurrentMonth: true,
            isToday,
            hasEvent,
            appointmentCount,
            pendingCount,
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


const weekDays = computed(() => {
    const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
        const dateObj = addDays(weekStart, i)
        const dateStr = formatDateYMD(dateObj)
        const isToday = dateObj.getTime() === today.getTime()

        days.push({
            date: dateObj.getDate(),
            fullDate: dateStr,
            dateObj,
            isToday,
            appointments: getAppointmentsForDate(dateStr),
            appointmentCount: getAppointmentCount(dateStr),
            pendingCount: getPendingAppointmentCount(dateStr)
        })
    }

    return days
})


const dayHours = computed(() => {
    const hours = []
    const dateStr = formatDateYMD(currentDate.value)
    const appointments = getAppointmentsForDate(dateStr)

    for (let i = 0; i < 24; i++) {
        const hourAppointments = appointments.filter(apt => {
            if (!apt.time) return false
            const hour = parseInt(apt.time.split(':')[0], 10)
            return hour === i
        })

        hours.push({
            hour: i,
            label: format(new Date(2000, 0, 1, i), 'ha'),
            appointments: hourAppointments
        })
    }

    return hours
})



const getStatusInfo = (leadStatus) => {
    if (!leadStatus) return { text: 'Unknown', color: 'gray' }

    const statusName = typeof leadStatus === 'string' ? leadStatus : leadStatus.name
    const lowerStatus = statusName.toLowerCase()

    const statusMap = {
        new: { text: 'New', color: 'orange' },
        contacted: { text: 'Contacted', color: 'blue' },
        scheduled: { text: 'Appointment', color: 'blue' },
        closed: { text: 'Closed', color: 'red' },
        active: { text: 'Accepted', color: 'green' },
        pending: { text: 'Pending', color: 'orange' }
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


const checkGoogleSync = () => {
    try {
        const synced = localStorage.getItem('google_calendar_synced')
        isGoogleSynced.value = synced === 'true'
    } catch (error) {
        console.error('Error checking Google sync status:', error)
        isGoogleSynced.value = false
    }
}


const syncWithGoogle = async () => {
    try {
        // const redirectUri = `${window.location.origin}/agent/calendar/callback`
        // const redirectUri = `http://localhost:3000/calendar/callback`
        const redirectUri = config.public.GOOGLE_REDIRECT_URI
        
        const response = await $fetchCitizen('v1/google/auth', {
            method: 'GET',
            params: {
                redirect_uri: redirectUri
            }
        })
        
        if (response.auth_url) {
            window.location.href = response.auth_url
        } else {
            showToast('Failed to get authorization URL', 'error')
        }
    } catch (error) {
        console.error('Error initiating Google sync:', error)
        showToast('Failed to initiate Google sync', 'error')
    }
}

// Open modal to add event to Google Calendar
const addToGoogleCalendar = (appointment) => {
    selectedAppointmentForGoogle.value = appointment
    
    // Set default start time from appointment
    const startDate = new Date(`${appointment.date} ${appointment.time}`)
    googleEventStart.value = startDate
    
    // Set default end time (1 hour later)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
    googleEventEnd.value = endDate
    
    showGoogleEventModal.value = true
    closeGoogleSyncDropdown(appointment.id)
}

// Confirm and submit Google Calendar event
const confirmAddToGoogleCalendar = async () => {
    if (!selectedAppointmentForGoogle.value || !googleEventStart.value || !googleEventEnd.value) {
        showToast('Please select both start and end times', 'error')
        return
    }
    
    try {
        const appointment = selectedAppointmentForGoogle.value
        
        // Format datetime as 'YYYY-MM-DD HH:mm:ss'
        const formatDateTime = (date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        }
        
        const startDateTime = formatDateTime(googleEventStart.value)
        const endDateTime = formatDateTime(googleEventEnd.value)

        const formData = new FormData()
        formData.append('title', appointment.property?.name || 'Appointment')
        formData.append('description', appointment.notes || `Appointment with ${appointment.name}`)
        formData.append('start', startDateTime)
        formData.append('end', endDateTime)
        formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
        formData.append('lead_id', appointment.id)

        const response = await $fetchCitizen('agent/v1/calendar/add/event', {
            method: 'POST',
            body: formData
        })

        if (response) {
            appointment.google_event_id = response.id
            
            // Update lead to mark as scheduled and add to calendar
            const scheduledStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'scheduled')
            const updateFormData = new FormData()
            updateFormData.append('_method', 'PATCH')
            updateFormData.append('add_to_calendar', '1')
            if (scheduledStatus) {
                updateFormData.append('status', scheduledStatus.id)
            }

            await $fetchCitizen(`agent/v1/leads/${appointment.id}/update`, {
                method: 'POST',
                body: updateFormData
            })
            
            showToast('Event added to Google Calendar and marked as scheduled', 'success')
            showGoogleEventModal.value = false
            selectedAppointmentForGoogle.value = null
            fetchMonthAppointments() // Refresh to get updated data
        }
    } catch (error) {
        console.error('Error adding to Google Calendar:', error)
        showToast(error.response?.data?.message || 'Failed to add event to Google Calendar', 'error')
    }
}

// Delete event from Google Calendar
const deleteFromGoogleCalendar = async (appointment) => {
    if (!appointment.google_event_id) return
    
    try {
        await $fetchCitizen(`agent/v1/calendar/delete/event/${appointment.google_event_id}`, {
            method: 'DELETE'
        })

        appointment.google_event_id = null

        // Update lead to mark as active and remove from calendar
        const activeStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'active')
        const updateFormData = new FormData()
        updateFormData.append('_method', 'PATCH')
        updateFormData.append('add_to_calendar', '0')
        if (activeStatus) {
            updateFormData.append('status', activeStatus.id)
        }

        await $fetchCitizen(`agent/v1/leads/${appointment.id}/update`, {
            method: 'POST',
            body: updateFormData
        })

        showToast('Event removed from Google Calendar and marked as accepted', 'success')
        closeGoogleSyncDropdown(appointment.id)
        fetchMonthAppointments() // Refresh to get updated data
    } catch (error) {
        console.error('Error deleting from Google Calendar:', error)
        showToast(error.response?.data?.message || 'Failed to remove event from Google Calendar', 'error')
    }
}

// Toggle Google sync dropdown
const toggleGoogleSyncDropdown = (appointmentId) => {
    Object.keys(showGoogleSyncDropdown.value).forEach(key => {
        if (key !== appointmentId.toString()) {
            showGoogleSyncDropdown.value[key] = false
        }
    })
    showGoogleSyncDropdown.value[appointmentId] = !showGoogleSyncDropdown.value[appointmentId]
}

const closeGoogleSyncDropdown = (appointmentId) => {
    showGoogleSyncDropdown.value[appointmentId] = false
}

// Toggle Add / Remove from calendar
const handleAddToCalendar = async (appointment) => {
    try {
        const isAdding = !appointment.add_to_calendar
        const formData = new FormData()

        formData.append('_method', 'PATCH')
        formData.append('add_to_calendar', isAdding ? '1' : '0')

        if (isAdding) {
            const scheduledStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'scheduled')
            if (scheduledStatus) formData.append('status', scheduledStatus.id)
        } else {
            const activeStatus = leadStatuses.value.find(s => s.name.toLowerCase() === 'active')
            if (activeStatus) formData.append('status', activeStatus.id)
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

// Mark lead as Active
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

// Decline lead (mark Closed)
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

/**
 * ==============================
 * Time & Date Utilities
 * ==============================
 */

// Check if appointment time already passed
const hasAppointmentTimePassed = (appointment) => {
    if (!appointment.date || !appointment.time) return false

    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    return appointmentDateTime < new Date()
}

// Full datetime formatter
const formatAppointmentTime = (date, time) => {
    if (!date || !time) return 'N/A'

    const dateTime = new Date(`${date}T${time}`)
    if (!Number.isNaN(dateTime.getTime())) {
        return format(dateTime, 'MMM d, yyyy h:mma')
    }

    const dateOnly = new Date(date)
    if (!Number.isNaN(dateOnly.getTime())) {
        return `${format(dateOnly, 'MMM d, yyyy')} ${time}`
    }

    return 'N/A'
}

// Only time formatter (12h)
const formatTimeOnly = (time) => {
    if (!time) return 'N/A'

    const [hourStr, minute] = time.split(':')
    const hours = parseInt(hourStr, 10)
    if (Number.isNaN(hours)) return 'N/A'

    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12

    return `${displayHours}:${minute}${ampm}`
}

/**
 * ==============================
 * Reschedule Flow
 * ==============================
 */

const handleRescheduleAppointment = (appointment) => {
    selectedAppointmentForReschedule.value = appointment
    isRescheduleCalendarOpen.value = false

    if (appointment.date && appointment.time) {
        rescheduleDateTime.value = new Date(`${appointment.date}T${appointment.time}`)
    } else {
        rescheduleDateTime.value = new Date()
    }

    showRescheduleModal.value = true
}

const confirmReschedule = async () => {
    if (!rescheduleDateTime.value || !selectedAppointmentForReschedule.value) return

    try {
        const newDateTime = new Date(rescheduleDateTime.value)

        const newDate = formatDateYMD(newDateTime)
        const newTime = String(newDateTime.getHours()).padStart(2, '0') + ':' +
            String(newDateTime.getMinutes()).padStart(2, '0') + ':00'

        const formData = new FormData()
        formData.append('_method', 'PATCH')
        formData.append('date', newDate)
        formData.append('time', newTime)

        await $fetchCitizen(
            `agent/v1/leads/${selectedAppointmentForReschedule.value.id}/update`,
            { method: 'POST', body: formData }
        )

        selectedDate.value = newDateTime
        await fetchMonthAppointments()

        showToast('Appointment rescheduled successfully', 'success')
    } catch (error) {
        console.error('Error rescheduling appointment:', error)
        showToast('Failed to reschedule appointment', 'error')
    } finally {
        cancelReschedule()
    }
}

const cancelReschedule = () => {
    showRescheduleModal.value = false
    selectedAppointmentForReschedule.value = null
    rescheduleDateTime.value = null
    isRescheduleCalendarOpen.value = false
}

/**
 * ==============================
 * Calendar Navigation
 * ==============================
 */

const previousPeriod = () => {
    if (viewMode.value === 'Month') {
        currentDate.value = new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() - 1,
            1
        )
    } else if (viewMode.value === 'Week') {
        currentDate.value = addDays(currentDate.value, -7)
    } else if (viewMode.value === 'Day') {
        currentDate.value = addDays(currentDate.value, -1)
    }
}

const nextPeriod = () => {
    if (viewMode.value === 'Month') {
        currentDate.value = new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth() + 1,
            1
        )
    } else if (viewMode.value === 'Week') {
        currentDate.value = addDays(currentDate.value, 7)
    } else if (viewMode.value === 'Day') {
        currentDate.value = addDays(currentDate.value, 1)
    }
}

const handleDateClick = (day) => {
    if (!day.isCurrentMonth && viewMode.value === 'Month') return

    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    selectedDate.value = new Date(year, month, day.date)
}

const handleWeekDayClick = (day) => {
    selectedDate.value = day.dateObj
    currentDate.value = day.dateObj
}

const handleDayHourClick = (hour) => {
    // Optional: could open a create appointment modal at this time
    console.log('Clicked hour:', hour)
}

// Get current view title
const currentViewTitle = computed(() => {
    if (viewMode.value === 'Month') return monthName.value
    if (viewMode.value === 'Week') return weekTitle.value
    return dayTitle.value
})

/**
 * ==============================
 * Lifecycle & Watchers
 * ==============================
 */

onMounted(() => {
    fetchLeadStatuses()
    fetchMonthAppointments()
    fetchUpcomingAppointments()
    checkGoogleSync()
})

watch(currentDate, () => {
    fetchMonthAppointments()
})
</script>


<template>
    <div class="space-y-6">

        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Calendar</h1>
            
            <!-- Google Calendar Sync Button -->
            <button 
                v-if="!isGoogleSynced"
                @click="syncWithGoogle"
                :disabled="checkingGoogleSync"
                class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                <Icon name="logos:google-icon" class="w-5 h-5" />
                {{ checkingGoogleSync ? 'Checking...' : 'Connect Google Calendar' }}
            </button>
            <div v-else class="flex items-center gap-2 text-sm text-green-600">
                <Icon name="lucide:check-circle" class="w-5 h-5" />
                <span>Google Calendar Connected</span>
            </div>
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
                    <button @click="previousPeriod" class="p-2 hover:bg-gray-100 rounded transition-colors">
                        <Icon name="lucide:chevron-left" class="w-5 h-5" />
                    </button>
                    <h3 class="text-lg font-semibold text-gray-900">{{ currentViewTitle }}</h3>
                    <button @click="nextPeriod" class="p-2 hover:bg-gray-100 rounded transition-colors">
                        <Icon name="lucide:chevron-right" class="w-5 h-5" />
                    </button>
                </div>

                <!-- Month View -->
                <div v-if="viewMode === 'Month'" class="grid grid-cols-7 gap-px bg-gray-200">

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
                                class="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded text-center">
                                {{ day.pendingCount }} Accepted
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Week View -->
                <div v-else-if="viewMode === 'Week'" class="space-y-2">
                    <div class="grid grid-cols-8 gap-px bg-gray-200">
                        <!-- Time column header -->
                        <div class="bg-gray-50 p-2"></div>
                        <!-- Day headers -->
                        <div v-for="day in weekDays" :key="day.fullDate"
                            class="bg-gray-50 p-2 text-center">
                            <div class="text-xs font-medium text-gray-600">
                                {{ format(day.dateObj, 'EEE') }}
                            </div>
                            <div :class="[
                                'text-lg font-semibold mt-1',
                                day.isToday ? 'w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto' : 'text-gray-900'
                            ]">
                                {{ day.date }}
                            </div>
                        </div>
                    </div>

                    <!-- Time slots -->
                    <div class="grid grid-cols-8 gap-px bg-gray-200 max-h-[500px] overflow-y-auto">
                        <template v-for="hour in 24" :key="hour">
                            <!-- Time label -->
                            <div class="bg-white p-2 text-xs text-gray-500 text-right">
                                {{ format(new Date(2000, 0, 1, hour - 1), 'ha') }}
                            </div>
                            <!-- Day columns -->
                            <div v-for="day in weekDays" :key="`${day.fullDate}-${hour}`"
                                @click="handleWeekDayClick(day)"
                                class="bg-white p-2 min-h-[60px] cursor-pointer hover:bg-gray-50 transition-colors relative">
                                <template v-for="apt in day.appointments" :key="apt.id">
                                    <div v-if="apt.time && parseInt(apt.time.split(':')[0]) === hour - 1"
                                        class="text-xs p-1 mb-1 rounded cursor-pointer"
                                        :class="apt.add_to_calendar ? 'bg-blue-100 border-l-2 border-blue-500' : 'bg-green-100 border-l-2 border-green-500'"
                                        @click.stop="navigateTo(`/agent/leads/${apt.id}`)">
                                        <div class="font-medium truncate">{{ formatTimeOnly(apt.time) }}</div>
                                        <div class="truncate">{{ apt.name }}</div>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Day View -->
                <div v-else-if="viewMode === 'Day'" class="space-y-2">
                    <div class="border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
                        <div v-for="hourSlot in dayHours" :key="hourSlot.hour"
                            @click="handleDayHourClick(hourSlot)"
                            class="grid grid-cols-12 gap-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                            <!-- Time column -->
                            <div class="col-span-2 p-4 text-sm text-gray-500 text-right border-r border-gray-100">
                                {{ hourSlot.label }}
                            </div>
                            <!-- Appointments column -->
                            <div class="col-span-10 p-4 min-h-[80px]">
                                <div v-if="hourSlot.appointments.length === 0" class="text-xs text-gray-400">
                                    <!-- Empty slot -->
                                </div>
                                <div v-else class="space-y-2">
                                    <div v-for="apt in hourSlot.appointments" :key="apt.id"
                                        @click.stop="navigateTo(`/agent/leads/${apt.id}`)"
                                        class="p-3 rounded-lg border-l-4 cursor-pointer"
                                        :class="apt.add_to_calendar 
                                            ? 'bg-blue-50 border-blue-500 hover:bg-blue-100' 
                                            : 'bg-green-50 border-green-500 hover:bg-green-100'">
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex-1">
                                                <div class="font-medium text-gray-900">{{ apt.name }}</div>
                                                <div class="text-sm text-gray-600 mt-1">
                                                    {{ formatTimeOnly(apt.time) }}
                                                </div>
                                            </div>
                                            <span class="px-2 py-1 text-xs font-medium rounded-md ml-2"
                                                :class="getStatusColor(getStatusInfo(apt.lead_status).color)">
                                                {{ getStatusInfo(apt.lead_status).text }}
                                            </span>
                                        </div>
                                        <div class="text-sm text-gray-700 mb-1">
                                            {{ apt.property?.name || 'N/A' }}
                                        </div>
                                        <div class="text-xs text-gray-600">
                                            {{ apt.property?.address || '' }}
                                        </div>
                                        <div class="flex items-center space-x-2 mt-2">
                                            <Icon :name="apt.phone ? 'lucide:phone' : 'lucide:mail'"
                                                class="w-3 h-3 text-gray-400" />
                                            <span class="text-xs text-gray-600">{{ apt.phone || apt.email }}</span>
                                        </div>
                                    </div>
                                </div>
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
                                    {{ formatTimeOnly(appointment.time) }}
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
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-900 text-white hover:bg-gray-800">
                                Active
                            </button>
                            <button @click="declineLead(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                                Decline
                            </button>
                        </div>
                        <div v-else-if="appointment.lead_status?.name.toLowerCase() === 'closed'" class="flex gap-2">
                            <button disabled
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed">
                                Closed
                            </button>
                        </div>
                        <div v-else-if="hasAppointmentTimePassed(appointment)" class="flex gap-2">
                            <button @click="handleRescheduleAppointment(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-900 text-white hover:bg-gray-800">
                                Reschedule
                            </button>
                            <button @click="declineLead(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                                Close
                            </button>
                        </div>
                        <div v-else class="flex gap-2">
                            <button @click="handleRescheduleAppointment(appointment)"
                                class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-900 text-white hover:bg-gray-800">
                                Reschedule
                            </button>
                            <div class="relative flex-1">
                                <button @click="toggleGoogleSyncDropdown(appointment.id)" :class="[
                                    'w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1',
                                    appointment.add_to_calendar
                                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                ]">
                                    {{ appointment.add_to_calendar ? 'Remove from Calendar' : 'Add to Calendar' }}
                                    <Icon name="lucide:chevron-down" class="w-3 h-3" />
                                </button>
                                
                                <!-- Dropdown Menu -->
                                <div v-if="showGoogleSyncDropdown[appointment.id]" 
                                    class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div class="py-1">
                                        <!-- <button 
                                            @click="handleAddToCalendar(appointment)"
                                            class="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                            <Icon name="lucide:calendar" class="w-4 h-4" />
                                            {{ appointment.add_to_calendar ? 'Remove from Local' : 'Add to Local' }}
                                        </button> -->
                                        
                                        <!-- Google Calendar Options (only if synced) -->
                                        <template v-if="isGoogleSynced">
                                            <button 
                                                v-if="!appointment.google_event_id"
                                                @click="addToGoogleCalendar(appointment)"
                                                class="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                                <Icon name="logos:google-icon" class="w-4 h-4" />
                                                Add to Google Calendar
                                            </button>
                                            <button 
                                                v-else
                                                @click="deleteFromGoogleCalendar(appointment)"
                                                class="w-full px-4 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                                                Remove from Google
                                            </button>
                                        </template>
                                        
                                        <!-- Connect Google Calendar prompt (if not synced) -->
                                        <button 
                                            v-else
                                            @click="syncWithGoogle"
                                            class="w-full px-4 py-2 text-xs text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                                            <Icon name="logos:google-icon" class="w-4 h-4" />
                                            Connect Google Calendar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- Google Calendar Event Modal -->
        <div v-if="showGoogleEventModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="showGoogleEventModal = false">
            <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Add to Google Calendar</h3>
                    <button @click="showGoogleEventModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <Icon name="lucide:x" class="w-5 h-5" />
                    </button>
                </div>

                <div v-if="selectedAppointmentForGoogle" class="mb-4">
                    <p class="text-sm text-gray-600 mb-2">
                        Adding appointment: <span class="font-medium text-gray-900">{{
                            selectedAppointmentForGoogle.property?.name || 'Appointment' }}</span>
                    </p>
                    <p class="text-xs text-gray-500">
                        With: {{ selectedAppointmentForGoogle.name }}
                    </p>
                </div>

                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Start Date & Time <span class="text-red-500">*</span>
                        </label>
                        <Calendar 
                            v-model="googleEventStart" 
                            showTime 
                            hourFormat="12" 
                            :showIcon="true"
                            dateFormat="M dd, yy" 
                            class="w-full"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            End Date & Time <span class="text-red-500">*</span>
                        </label>
                        <Calendar 
                            v-model="googleEventEnd" 
                            showTime 
                            hourFormat="12" 
                            :showIcon="true"
                            dateFormat="M dd, yy" 
                            class="w-full"
                            :minDate="googleEventStart"
                        />
                    </div>
                </div>

                <div class="flex gap-3">
                    <button @click="showGoogleEventModal = false"
                        class="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button 
                        @click="confirmAddToGoogleCalendar" 
                        :disabled="!googleEventStart || !googleEventEnd"
                        class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Add to Google Calendar
                    </button>
                </div>
            </div>
        </div>


        <div v-if="showRescheduleModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click.self="cancelReschedule">
            <div
                class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh]"
                :class="isRescheduleCalendarOpen && 'transform -translate-y-10'">
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
                    <div class="reschedule-calendar">
                        <Calendar v-model="rescheduleDateTime" showTime hourFormat="12" :showIcon="true"
                            :minDate="new Date()" dateFormat="M dd, yy" class="w-full"
                            appendTo="self"
                            @show="isRescheduleCalendarOpen = true"
                            @hide="isRescheduleCalendarOpen = false" />
                    </div>
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

<style scoped>
    .reschedule-calendar :deep(.p-datepicker-panel) {
        top: calc(100% + 0.25rem) !important;
        left: 0 !important;
        z-index: 50;
        max-height: 50vh;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
    }
</style>