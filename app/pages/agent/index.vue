<script setup>
useHead({ title: "Agent Dashboard" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })


const periodFilter = ref('December')


const kpis = ref([
    {
        id: 'total-leads',
        title: 'Total Leads',
        value: '90',
        icon: '/svg/icons/wid1.svg',
        color: 'blue'
    },
    {
        id: 'new-leads',
        title: 'New Leads',
        value: '40',
        icon: '/svg/icons/wid2.svg',
        color: 'cyan'
    },
    {
        id: 'claimed-leads',
        title: 'Claimed Leads',
        value: '50',
        icon: '/svg/icons/wid1.svg',
        color: 'orange'
    },
    {
        id: 'contacted-leads',
        title: 'Contacted Leads',
        value: '65%',
        icon: '/svg/icons/wid2.svg',
        color: 'teal'
    }
])


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


const handleExportCSV = () => {
    console.log('Export leads as CSV')
}

const handleAddLead = () => {
    console.log('Add new lead')
}
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
                    Add New Lead
                </button>
            </div>
        </div>


        <div class="flex items-center gap-2">
            <select v-model="periodFilter"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer">
                <option value="December">December</option>
                <option value="January">January</option>
                <option value="February">February</option>
            </select>
        </div>


        <CommonAgentDashboardKPICards :kpis="kpis" />


        <CommonAgentLeadsChart :period="periodFilter" />


        <CommonAgentUpcomingAppointments :appointments="upcomingAppointments" />
    </div>
</template>