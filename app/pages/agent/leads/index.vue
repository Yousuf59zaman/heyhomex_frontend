<script setup>
useHead({ title: "Leads - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })

const searchQuery = ref('')
const statusFilter = ref('All')
const sortBy = ref('All')

const leads = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalItems = ref(0)
const perPage = ref(10)
const totalPages = ref(0)

// Fetch leads from API
const fetchLeads = async () => {
    loading.value = true
    try {
        const response = await $fetchCitizen('v1/leads/list', {
            method: 'GET',
            // params: {
            //     page: currentPage.value,
            //     per_page: perPage.value
            // }
        })

        leads.value = response.data.data
        totalItems.value = response.data.meta.total
        totalPages.value = response.data.meta.last_page
    } catch (error) {
        console.error('Error fetching leads:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchLeads()
})

watch(currentPage, () => {
    fetchLeads()
})

const getLeadStatusInfo = (leadStatus) => {
    if (!leadStatus) {
        return { text: 'Unknown', color: 'gray' }
    }

    const status = leadStatus.name?.toLowerCase() || ''
    const statusMap = {
        'new': { text: 'New', color: 'green' },
        'claimed': { text: 'Claimed', color: 'blue' },
        'contacted': { text: 'Contacted', color: 'yellow' },
        'converted': { text: 'Converted', color: 'green' },
        'lost': { text: 'Lost', color: 'red' }
    }
    return statusMap[status] || { text: leadStatus.name || 'Unknown', color: 'gray' }
}

const getStatusColor = (color) => {
    const colors = {
        green: 'bg-green-100 text-green-700 border border-green-200',
        blue: 'bg-blue-100 text-blue-700 border border-blue-200',
        yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        red: 'bg-red-100 text-red-700 border border-red-200',
        gray: 'bg-gray-100 text-gray-700 border border-gray-200'
    }
    return colors[color] || 'bg-gray-100 text-gray-700 border border-gray-200'
}

const handleAddLead = () => {
    console.log('Add new lead')
}

const handleExportCSV = () => {
    console.log('Export leads as CSV')
}

const handleLeadClick = (leadId) => {
    navigateTo(`/agent/leads/${leadId}`)
}

const handleActionMenu = (lead) => {
    console.log('Action for lead:', lead.id)
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Leads</h1>
            <div class="flex items-center gap-2">
                <button @click="handleExportCSV"
                    class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Export Leads As CSV
                </button>
                <button @click="handleAddLead"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    Add New Lead
                </button>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <!-- Search -->
            <div class="relative flex-1 max-w-md">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search Here..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>

            <!-- Status Filter -->
            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Status:</span>
                <select v-model="statusFilter"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer">
                    <option value="All">All</option>
                    <option value="New">New</option>
                    <option value="Claimed">Claimed</option>
                    <option value="Contacted">Contacted</option>
                </select>
            </div>

            <!-- Sort By -->
            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Sort by:</span>
                <select v-model="sortBy"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer">
                    <option value="All">All</option>
                    <option value="Date">Date</option>
                    <option value="Name">Name</option>
                    <option value="Status">Status</option>
                </select>
            </div>
        </div>

        <!-- Leads Table -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <!-- Table Header -->
            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-base font-semibold text-gray-900">All Leads</h3>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Status
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Name
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Property
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Date
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Contact Info
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="py-8 text-center text-gray-500">
                                Loading leads...
                            </td>
                        </tr>
                        <tr v-else-if="leads.length === 0">
                            <td colspan="6" class="py-8 text-center text-gray-500">
                                No leads found
                            </td>
                        </tr>
                        <tr v-else v-for="lead in leads" :key="lead.id" @click="handleLeadClick(lead.id)"
                            class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                            <td class="py-4 px-6">
                                <span class="px-3 py-1 text-xs font-medium rounded-md"
                                    :class="getStatusColor(getLeadStatusInfo(lead.lead_status).color)">
                                    {{ getLeadStatusInfo(lead.lead_status).text }}
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center space-x-3">
                                    <img :src="lead.customer?.photo || '/images/dashboard/1.png'" :alt="lead.name"
                                        class="w-8 h-8 rounded-full object-cover"
                                        @error="$event.target.src = '/images/dashboard/1.png'" />
                                    <span class="text-sm text-gray-900">{{ lead.name }}</span>
                                </div>
                            </td>

                            <!-- Property -->
                            <td class="py-4 px-6">
                                <span class="text-sm text-gray-600">{{ lead.property?.address || 'N/A' }}</span>
                            </td>

                            <!-- Date -->
                            <td class="py-4 px-6">
                                <span class="text-sm text-gray-600">{{ $formatDate(lead.created_at) }}</span>
                            </td>

                            <!-- Contact Info -->
                            <td class="py-4 px-6">
                                <div class="flex items-center space-x-2">
                                    <Icon :name="lead.phone ? 'lucide:phone' : 'lucide:mail'"
                                        class="w-4 h-4 text-gray-400" />
                                    <span class="text-sm text-gray-600">{{ lead.phone || lead.email }}</span>
                                </div>
                            </td>

                            <!-- Action -->
                            <td class="py-4 px-6">
                                <button @click.stop="handleActionMenu(lead)"
                                    class="text-gray-400 hover:text-gray-600 transition-colors">
                                    <Icon name="lucide:more-vertical" class="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div class="text-sm text-gray-600">
                    Showing {{ leads.length }} of {{ totalItems }}
                </div>
                <div class="flex items-center gap-2">
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <button class="px-3 py-1 text-sm bg-gray-900 text-white rounded">
                        {{ currentPage }}
                    </button>
                    <button @click="currentPage++" :disabled="currentPage >= totalPages"
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
