<script setup>
useHead({ title: "Lead Details - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })

const route = useRoute()
const leadId = route.params.id

const leadInfo = ref(null)
const loading = ref(false)
const updating = ref(false)
const showScheduleModal = ref(false)
const showAddNoteModal = ref(false)
const showMessageModal = ref(false)


const fetchLeadDetails = async () => {
    loading.value = true
    try {
        const response = await $fetchCitizen(`agent/v1/leads/${leadId}/show`, {
            method: 'GET'
        })
        leadInfo.value = response.data
    } catch (error) {
        console.error('Error fetching lead details:', error)
        showToast('Error loading lead details', 'error')
    } finally {
        loading.value = false
    }
}


const updateLeadStatus = async (status, addToCalendar = null) => {
    updating.value = true
    try {
        const formData = new FormData()
        formData.append('status', status)
        formData.append('_method', 'PATCH')

        if (addToCalendar !== null) {
            formData.append('add_to_calendar', addToCalendar ? '1' : '0')
        }

        const response = await $fetchCitizen(`agent/v1/leads/${leadId}/update`, {
            method: 'POST',
            body: formData
        })

        leadInfo.value = response.data
        showToast('Lead updated successfully', 'success')
        await fetchLeadDetails()
    } catch (error) {
        console.error('Error updating lead:', error)
        showToast('Error updating lead', 'error')
    } finally {
        updating.value = false
    }
}


const showToast = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}]: ${message}`)

}

const handleScheduleAppointment = () => {
    showScheduleModal.value = true
}

const handleSendMessage = () => {
    showMessageModal.value = true
}

const handleAddNote = () => {
    showAddNoteModal.value = true
}

const handleToggleCalendar = async () => {
    const currentCalendarStatus = leadInfo.value?.add_to_calendar || false
    await updateLeadStatus(leadInfo.value.status, !currentCalendarStatus)
}

const goBack = () => {
    navigateTo('/agent/leads')
}

onMounted(() => {
    fetchLeadDetails()
})
</script>

<template>
    <div class="space-y-6">

        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <!-- Content -->
        <div v-else-if="leadInfo">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Icon name="lucide:arrow-left" class="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 class="text-2xl font-semibold text-gray-900">Lead details</h1>
                </div>
                <div class="flex items-center gap-2">
                    <button v-if="leadInfo.date && leadInfo.time" @click="handleToggleCalendar" :disabled="updating"
                        class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                        {{ leadInfo.add_to_calendar ? 'Remove from Calendar' : 'Add to Calendar' }}
                    </button>
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

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <!-- Lead Information -->
                <div class="lg:col-span-1 space-y-6">
                    <!-- Lead Info Card -->
                    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Lead Information</h3>

                        <div class="space-y-4">
                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Lead Name:</span>
                                <span class="text-sm font-medium text-gray-900">{{ leadInfo.name }}</span>
                            </div>

                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Phone Number:</span>
                                <span class="text-sm font-medium text-gray-900">{{ leadInfo.phone || 'N/A' }}</span>
                            </div>

                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Email Address:</span>
                                <span class="text-sm font-medium text-gray-900">{{ leadInfo.email }}</span>
                            </div>

                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Type:</span>
                                <span class="text-sm font-medium text-gray-900">{{ leadInfo.type_label }}</span>
                            </div>

                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Status:</span>
                                <span class="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700">
                                    {{ leadInfo.lead_status?.name || 'Unknown' }}
                                </span>
                            </div>

                            <div v-if="leadInfo.date && leadInfo.time" class="flex items-center justify-between py-3">
                                <span class="text-sm text-gray-600">Scheduled:</span>
                                <span class="text-sm font-medium text-gray-900">{{ leadInfo.date }} {{ leadInfo.time
                                    }}</span>
                            </div>

                            <div v-if="leadInfo.message" class="py-3">
                                <span class="text-sm text-gray-600">Message:</span>
                                <p class="text-sm text-gray-900 mt-2">{{ leadInfo.message }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Info Card -->
                    <div v-if="leadInfo.customer" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Customer Information</h3>

                        <div class="space-y-4">
                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Email:</span>
                                <span class="text-sm font-medium text-gray-900">{{ leadInfo.customer.email }}</span>
                            </div>

                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Mobile:</span>
                                <span class="text-sm font-medium text-gray-900">
                                    {{ leadInfo.customer.mobile ? `${leadInfo.customer.ccode}
                                    ${leadInfo.customer.mobile}` : 'N/A' }}
                                </span>
                            </div>

                            <div class="flex items-center justify-between py-3 border-b border-gray-100">
                                <span class="text-sm text-gray-600">Verified:</span>
                                <span class="text-sm font-medium text-gray-900">
                                    {{ leadInfo.customer.is_verify ? 'Yes' : 'No' }}
                                </span>
                            </div>

                            <div class="flex items-center justify-between py-3">
                                <span class="text-sm text-gray-600">Joined:</span>
                                <span class="text-sm font-medium text-gray-900">{{
                                    $formatDate(leadInfo.customer.created_at) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Information -->
                <div v-if="leadInfo.property" class="lg:col-span-2 space-y-6">
                    <!-- Property Card -->
                    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <!-- Property Image -->
                        <div class="relative h-64">
                            <img :src="leadInfo.property.image_url" :alt="leadInfo.property.name"
                                class="w-full h-full object-cover" />
                            <div class="absolute top-4 left-4">
                                <span class="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-900">
                                    {{ leadInfo.property.category?.replace('_', ' ') }}
                                </span>
                            </div>
                        </div>

                        <!-- Property Details -->
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-900">${{
                                        Number(leadInfo.property.price).toLocaleString() }}</h2>
                                    <h3 class="text-lg font-semibold text-gray-900 mt-2">{{ leadInfo.property.name }}
                                    </h3>
                                    <p class="text-sm text-gray-600 mt-1">{{ leadInfo.property.address }}</p>
                                </div>
                            </div>

                            <!-- Property Features -->
                            <div class="flex items-center gap-6 py-4 border-y border-gray-100">
                                <div class="flex items-center gap-2">
                                    <Icon name="lucide:bed" class="w-5 h-5 text-gray-400" />
                                    <span class="text-sm text-gray-900">{{ leadInfo.property.beds }} Beds</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Icon name="lucide:bath" class="w-5 h-5 text-gray-400" />
                                    <span class="text-sm text-gray-900">{{ leadInfo.property.baths }} Baths</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Icon name="lucide:maximize" class="w-5 h-5 text-gray-400" />
                                    <span class="text-sm text-gray-900">{{ leadInfo.property.square_feet }} sqft</span>
                                </div>
                            </div>

                            <!-- Description -->
                            <div v-if="leadInfo.property.description" class="mt-4">
                                <h4 class="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                                <p class="text-sm text-gray-600 leading-relaxed">{{ leadInfo.property.description }}</p>
                            </div>

                            <!-- Amenities -->
                            <div v-if="leadInfo.property.amenities?.length" class="mt-6">
                                <h4 class="text-sm font-semibold text-gray-900 mb-3">Amenities</h4>
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div v-for="amenity in leadInfo.property.amenities" :key="amenity.name"
                                        class="flex items-center gap-2 text-sm text-gray-600">
                                        <Icon name="lucide:check" class="w-4 h-4 text-green-600" />
                                        <span>{{ amenity.name }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Location -->
                            <div v-if="leadInfo.property.location" class="mt-6">
                                <h4 class="text-sm font-semibold text-gray-900 mb-3">Location</h4>
                                <div class="flex gap-2">
                                    <a v-if="leadInfo.property.location.map_url"
                                        :href="leadInfo.property.location.map_url" target="_blank"
                                        class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                                        View on Map
                                    </a>
                                    <a v-if="leadInfo.property.location.street_view_url"
                                        :href="leadInfo.property.location.street_view_url" target="_blank"
                                        class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                                        Street View
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center py-12">
            <p class="text-gray-500">Failed to load lead details</p>
            <button @click="goBack" class="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Back to Leads
            </button>
        </div>
    </div>
</template>
