<script setup>
useHead({ title: "Agent Dashboard" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })


const currentDate = new Date()
const startDate = ref(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0])
const endDate = ref(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0])
const showDateRange = ref(false)

const dashboardData = ref(null)
const upcomingAppointments = ref([])
const loading = ref(false)
const loadingAppointments = ref(false)


const fetchDashboardData = async () => {
    loading.value = true
    try {
        const params = {}


        if (showDateRange.value) {
            params.start_date = startDate.value
            params.end_date = endDate.value
        }

        const response = await $fetchCitizen('agent/v1/leads/dashboard', {
            method: 'GET',
            params
        })
        dashboardData.value = response.data
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
    } finally {
        loading.value = false
    }
}


const fetchUpcomingAppointments = async () => {
    loadingAppointments.value = true
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
        upcomingAppointments.value = response.data.data || []
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error)
    } finally {
        loadingAppointments.value = false
    }
}


const kpis = computed(() => {
    if (!dashboardData.value) return []

    const data = showDateRange.value ? dashboardData.value.date_range : dashboardData.value.all_time
    if (!data) return []

    return [
        {
            id: 'total-leads',
            title: 'Total Leads',
            value: data.total_leads?.toString() || '0',
            icon: '/svg/icons/wid1.svg',
            color: 'blue'
        },
        {
            id: 'new-leads',
            title: 'New Leads',
            value: data.new_leads?.toString() || '0',
            icon: '/svg/icons/wid2.svg',
            color: 'cyan'
        },
        {
            id: 'claimed-leads',
            title: 'Claimed Leads',
            value: data.claimed_leads?.toString() || '0',
            icon: '/svg/icons/wid1.svg',
            color: 'orange'
        },
        {
            id: 'claimed-ratio',
            title: 'Claimed Ratio',
            value: `${data.claimed_ratio_percentage || 0}%`,
            icon: '/svg/icons/wid2.svg',
            color: 'teal'
        }
    ]
})


const chartData = computed(() => {
    return dashboardData.value?.line_chart || []
})


const handleDateRangeChange = () => {
    fetchDashboardData()
}


const handleExportCSV = () => {
    console.log('Export leads as CSV')
}


const handleAddLead = () => {
    navigateTo('/agent/leads')
}

onMounted(() => {
    fetchDashboardData()
    fetchUpcomingAppointments()
})
</script>

<template>
    <div class="space-y-6">

        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">Agent Dashboard</h1>
                <p class="text-sm text-gray-600 mt-1">Manage Your Leads and Close Deals Faster</p>
            </div>
            <div class="flex items-center gap-2">
                <button @click="handleExportCSV"
                    class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Export Leads As CSV
                </button>
                <button @click="handleAddLead"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    View All Leads
                </button>
            </div>
        </div>


        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
                <input v-model="showDateRange" type="checkbox" id="dateRangeToggle" @change="fetchDashboardData"
                    class="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900">
                <label for="dateRangeToggle" class="text-sm text-gray-600">Custom Date Range</label>
            </div>
            <div v-if="showDateRange" class="flex items-center gap-2">
                <label class="text-sm text-gray-600">From:</label>
                <input v-model="startDate" type="date" @change="handleDateRangeChange"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            </div>
            <div v-if="showDateRange" class="flex items-center gap-2">
                <label class="text-sm text-gray-600">To:</label>
                <input v-model="endDate" type="date" @change="handleDateRangeChange"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            </div>
            <div v-if="!showDateRange" class="text-sm text-gray-500">
                Showing all-time statistics
            </div>
        </div>


        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        <!-- Dashboard Content -->
        <template v-else-if="dashboardData">
            <CommonAgentDashboardKPICards :kpis="kpis" />

            <CommonAgentLeadsChart :chartData="chartData" :dateRange="{ startDate, endDate }" />

            <CommonAgentUpcomingAppointments :appointments="upcomingAppointments" :loading="loadingAppointments" />
        </template>


        <div v-else class="text-center py-12">
            <p class="text-gray-500">Failed to load dashboard data</p>
        </div>
    </div>
</template>