<script setup>
definePageMeta({ layout: 'admin' })

const route = useRoute()
const toast = useToast()

// Filter states
const filters = ref({
    title: '',
    approved_admin_status: '',
    type: '',
    start_date: '',
    end_date: ''
})

// Data states
const advertisements = ref([])
const pending = ref(false)
const error = ref(null)

// Pagination
const paginationConfig = ref({
    data: {},
    lang: 'en',
    align: 'center',
    action: ''
})

// Type options
const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Image', value: '1' },
    { label: 'Video', value: '2' }
]

// Approval status options
const approvalStatusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: '0' },
    { label: 'Approved', value: '1' }
]

// Load advertisements
const loadAdvertisements = async () => {
    pending.value = true
    error.value = null
    try {
        const params = {
            page: route.query.page || 1
        }

        // Add filters if they have values
        if (filters.value.title) params.title = filters.value.title
        if (filters.value.approved_admin_status !== '') params.approved_admin_status = filters.value.approved_admin_status
        if (filters.value.type) params.type = filters.value.type
        if (filters.value.start_date) params.start_date = filters.value.start_date
        if (filters.value.end_date) params.end_date = filters.value.end_date

        const response = await $fetchAdmin('admin/advertisements/list', {
            method: 'GET',
            params
        })

        if (response.status === 'success') {
            advertisements.value = response.data.data
            paginationConfig.value.data = response.data
        }
    } catch (e) {
        error.value = e.message
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load advertisements',
            life: 3000
        })
    } finally {
        pending.value = false
    }
}

// Toggle approval status
const toggleApproval = async (ad) => {
    const newStatus = ad.approved_admin_status ? 0 : 1
    
    try {
        const formData = new FormData()
        formData.append('approved_admin_status', newStatus)

        const response = await $fetchAdmin(`admin/advertisements/${ad.id}/toggle-approval`, {
            method: 'POST',
            body: formData
        })

        if (response.status === 'success') {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: newStatus ? 'Advertisement approved successfully' : 'Advertisement approval revoked',
                life: 3000
            })
            
            // Update local data
            const index = advertisements.value.findIndex(a => a.id === ad.id)
            if (index !== -1) {
                advertisements.value[index] = response.data
            }
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update approval status',
            life: 3000
        })
    }
}

// Apply filters
const applyFilters = () => {
    navigateTo({ query: { ...filters.value, page: 1 } })
    loadAdvertisements()
}

// Clear filters
const clearFilters = () => {
    filters.value = {
        title: '',
        approved_admin_status: '',
        type: '',
        start_date: '',
        end_date: ''
    }
    navigateTo({ query: { page: 1 } })
    loadAdvertisements()
}

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// Format currency
const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`
}

// Watch for route query changes
watch(() => route.query, () => {
    loadAdvertisements()
}, { deep: true })

// Load on mount
onMounted(() => {
    // Initialize filters from query
    if (route.query.title) filters.value.title = route.query.title
    if (route.query.approved_admin_status !== undefined) filters.value.approved_admin_status = route.query.approved_admin_status
    if (route.query.type) filters.value.type = route.query.type
    if (route.query.start_date) filters.value.start_date = route.query.start_date
    if (route.query.end_date) filters.value.end_date = route.query.end_date
    
    loadAdvertisements()
})
</script>

<template>
    <div class="space-y-6 w-full max-w-[1316px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Advertisement Approval</h1>
                <p class="text-sm text-gray-500 mt-1">Review and approve advertisements</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <!-- Title Search -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        v-model="filters.title"
                        type="text"
                        placeholder="Search by title..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @keyup.enter="applyFilters"
                    />
                </div>

                <!-- Approval Status -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                    <select
                        v-model="filters.approved_admin_status"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option v-for="option in approvalStatusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <!-- Type -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        v-model="filters.type"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <!-- Start Date -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        v-model="filters.start_date"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- End Date -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        v-model="filters.end_date"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <!-- Filter Actions -->
            <div class="flex gap-2 mt-4">
                <button
                    @click="applyFilters"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Apply Filters
                </button>
                <button
                    @click="clearFilters"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Clear Filters
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
            <p class="text-gray-500 mt-2">Loading advertisements...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p class="text-red-800 font-medium">Failed to load advertisements</p>
            <p class="text-red-600 text-sm mt-1">{{ error }}</p>
            <button
                @click="loadAdvertisements"
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
                Try Again
            </button>
        </div>

        <!-- Advertisements List -->
        <div v-else-if="advertisements.length > 0" class="space-y-4">
            <div
                v-for="ad in advertisements"
                :key="ad.id"
                class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
                <div class="flex gap-6">
                    <!-- Media Preview -->
                    <div class="flex-shrink-0">
                        <div class="w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                            <img
                                v-if="ad.type === 1"
                                :src="ad.media_path"
                                :alt="ad.title"
                                class="w-full h-full object-cover"
                            />
                            <video
                                v-else
                                :src="ad.media_path"
                                class="w-full h-full object-cover"
                                muted
                            ></video>
                        </div>
                        <span
                            class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded"
                            :class="ad.type === 1 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
                        >
                            {{ ad.type_name }}
                        </span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ ad.title }}</h3>
                                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ ad.description }}</p>
                                
                                <!-- User Info -->
                                <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <Icon name="lucide:user" class="w-4 h-4" />
                                    <span>{{ ad.user.name }}</span>
                                    <span v-if="ad.user.email" class="text-gray-400">•</span>
                                    <span v-if="ad.user.email">{{ ad.user.email }}</span>
                                </div>

                                <!-- Stats Grid -->
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div>
                                        <div class="text-xs text-gray-500">Impressions</div>
                                        <div class="text-sm font-semibold">{{ ad.total_impressions.toLocaleString() }}</div>
                                    </div>
                                    <div>
                                        <div class="text-xs text-gray-500">Clicks</div>
                                        <div class="text-sm font-semibold">{{ ad.total_clicks.toLocaleString() }}</div>
                                    </div>
                                    <div>
                                        <div class="text-xs text-gray-500">Balance</div>
                                        <div class="text-sm font-semibold" :class="ad.remaining_balance < 0 ? 'text-red-600' : 'text-green-600'">
                                            {{ formatCurrency(ad.remaining_balance) }}
                                        </div>
                                    </div>
                                    <div>
                                        <div class="text-xs text-gray-500">Status</div>
                                        <span
                                            class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                                            :class="ad.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
                                        >
                                            {{ ad.status_name }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Dates -->
                                <div class="flex items-center gap-4 text-xs text-gray-500">
                                    <div class="flex items-center gap-1">
                                        <Icon name="lucide:calendar" class="w-3 h-3" />
                                        <span>Start: {{ formatDate(ad.starts_at) }}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <Icon name="lucide:calendar" class="w-3 h-3" />
                                        <span>End: {{ formatDate(ad.ends_at) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Approval Toggle -->
                            <div class="flex flex-col items-center gap-2">
                                <span
                                    class="px-3 py-1 text-sm font-medium rounded-full"
                                    :class="ad.approved_admin_status 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'"
                                >
                                    {{ ad.approved_admin_status_name }}
                                </span>
                                <button
                                    @click="toggleApproval(ad)"
                                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                                    :class="ad.approved_admin_status 
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'"
                                >
                                    {{ ad.approved_admin_status ? 'Revoke' : 'Approve' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Icon name="lucide:file-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No advertisements found</h3>
            <p class="text-gray-500">Try adjusting your filters or check back later</p>
        </div>

        <!-- Pagination -->
        <div v-if="advertisements.length > 0 && paginationConfig.data.last_page > 1" class="mt-6">
            <Pagination :config="paginationConfig" />
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
