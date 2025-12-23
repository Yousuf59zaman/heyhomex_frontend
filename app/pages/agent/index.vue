<script setup>
    definePageMeta({middleware: ["auth-citizen"], layout: "agent"})

    // KPI data
    const kpis = ref([
        {
            id: 'new-leads',
            title: 'New Leads',
            value: '12',
            change: '+15%',
            changeType: 'positive',
            icon: '/svg/icons/wid1.svg',
            color: 'blue'
        },
        {
            id: 'claimed-leads',
            title: 'Claimed Leads',
            value: '08',
            change: '-5%',
            changeType: 'negative',
            icon: '/svg/icons/wid2.svg',
            color: 'red'
        },
        {
            id: 'contacted-leads',
            title: 'Contacted Leads',
            value: '65%',
            change: '+12%',
            changeType: 'positive',
            icon: '/svg/icons/wid1.svg',
            color: 'green'
        }
    ]);

    // Recent activities data
    const activities = ref([
        {
            id: 1,
            type: 'lead-completed',
            title: 'Lead Follow-Up Completed',
            description: 'You called Emily Santos regarding 123 Elm Street.',
            date: 'July 25, 2025',
            status: 'Contacted',
            statusColor: 'green'
        },
        {
            id: 2,
            type: 'lead-assigned',
            title: 'New Lead Assigned',
            description: 'John Kim was assigned to you for 450 Pine Avenue.',
            date: 'July 24, 2025',
            status: 'New',
            statusColor: 'blue'
        },
        {
            id: 3,
            type: 'email-sent',
            title: 'Email Sent',
            description: 'John Kim was assigned to you for 450 Pine Avenue.',
            date: 'July 24, 2025',
            status: 'New',
            statusColor: 'blue'
        }
    ]);

    // Lead table data
    const leads = ref([
        {
            id: 1,
            name: 'Annette Black',
            avatar: '/images/dashboard/1.png',
            property: '123A Elm Street',
            status: 'New',
            statusColor: 'green',
            contactInfo: '(555) 123-4567',
            contactType: 'phone'
        },
        {
            id: 2,
            name: 'Ralph Edwards',
            avatar: '/images/dashboard/2.png',
            property: '450 Pine Avenue',
            status: 'Claimed',
            statusColor: 'blue',
            contactInfo: 'john@example.com',
            contactType: 'email'
        },
        {
            id: 3,
            name: 'Darlene Robertson',
            avatar: '/images/dashboard/3.png',
            property: '7C Sunset Blvd',
            status: 'Claimed',
            statusColor: 'blue',
            contactInfo: '(555) 888-9999',
            contactType: 'phone'
        }
    ]);

    // Chart period
    const chartPeriod = ref('Yearly');
</script>

<template>
    <div class="space-y-6">
        <!-- KPI Cards -->
        <CommonAgentKPICards :kpis="kpis" />

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left Column - Performance Chart -->
            <div class="lg:col-span-5">
                <CommonAgentPerformanceChart :period="chartPeriod" />
            </div>

            <!-- Right Column - Recent Activities -->
            <div class="lg:col-span-7">
                <CommonAgentRecentActivities :activities="activities" />
            </div>
        </div>

        <!-- Lead Table -->
        <CommonAgentLeadTable :leads="leads" />
    </div>
</template>