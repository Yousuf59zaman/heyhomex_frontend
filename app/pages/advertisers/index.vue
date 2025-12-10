<script setup>
    definePageMeta({middleware: ["auth-citizen"], layout: "agent"})

    // KPI data
    const kpis = ref([
        {
            id: 'clicks',
            title: 'Clicks',
            value: '1,233',
            icon: '/svg/icons/click.svg',
            color: 'blue'
        },
        {
            id: 'impressions',
            title: 'Impressions',
            value: '12,450',
            icon: '/svg/icons/wid2.svg',
            color: 'red'
        },
        {
            id: 'average-cpc',
            title: 'Average CPC',
            value: '$0.26',
            icon: '/svg/icons/cpc.svg',
            color: 'gray'
        },
        {
            id: 'cost',
            title: 'Cost',
            value: '$324.60',
            icon: '/svg/icons/cost.svg',
            color: 'green'
        }
    ]);

    // Recent activities data
    const activities = ref([
        {
            id: 1,
            name: 'Emily Santos',
            avatar: '/images/dashboard/1.png',
            email: 'emily.santos@email.com',
            phone: '+1 (415) 555-8547',
            interest: '2BR Condo - HonoluAi',
            date: 'July 22, 2025'
        },
        {
            id: 2,
            name: 'John Kim',
            avatar: '/images/dashboard/2.png',
            email: 'john@example.com',
            phone: '+1 (415) 555-8547',
            interest: '3BR Villa - Maui',
            date: 'July 22, 2025'
        }
    ]);

    // Campaign data
    const campaigns = ref([
        {
            id: 1,
            name: 'Home Buyers FL',
            status: 'Running',
            statusColor: 'green',
            clicks: 456,
            impressions: 10000,
            cpc: '$0.23',
            budget: 456
        },
        {
            id: 2,
            name: 'Military Offers',
            status: 'Paused',
            statusColor: 'yellow',
            clicks: 110,
            impressions: 2500,
            cpc: '$0.28',
            budget: 456
        },
        {
            id: 3,
            name: 'Eco-Friendly Homes',
            status: 'Running',
            statusColor: 'green',
            clicks: 309,
            impressions: 1200,
            cpc: '$0.17',
            budget: 456
        },
        {
            id: 4,
            name: 'Investor Gold Leads',
            status: 'Running',
            statusColor: 'green',
            clicks: 456,
            impressions: 1600,
            cpc: '$0.20',
            budget: 456
        }
    ]);

    // Chart period
    const chartPeriod = ref('Yearly');
</script>

<template>
    <div class="space-y-6">
        <!-- KPI Cards -->
        <CommonAdvertiserKPICards :kpis="kpis" />

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left Column - Performance Chart -->
            <div class="lg:col-span-7">
                <CommonAdvertiserPerformanceChart :period="chartPeriod" />
            </div>

            <!-- Right Column - Recent Activities -->
            <div class="lg:col-span-5">
                <CommonAdvertiserRecentActivities :activities="activities" />
            </div>
        </div>

        <!-- Second Row Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left Column - Targeting Snapshot -->
            <div class="lg:col-span-4">
                <CommonAdvertiserTargetingSnapshot />
            </div>

            <!-- Right Column - Campaign Table -->
            <div class="lg:col-span-8">
                <CommonAdvertiserCampaignTable :campaigns="campaigns" />
            </div>
        </div>
    </div>
</template>