<script setup>
    definePageMeta({middleware: ["auth-citizen"], layout: "advertiser"})

    const isLoading = ref(true)
    const dashboardData = ref(null)
    const pieChartData = ref(null)
    const lineGraphData = ref(null)
    const campaignsData = ref([])

    // KPI data
    const kpis = computed(() => {
        if (!dashboardData.value) {
            return [
                {
                    id: 'clicks',
                    title: 'Total Clicks',
                    value: '0',
                    icon: '/svg/icons/click.svg',
                    color: 'blue'
                },
                {
                    id: 'impressions',
                    title: 'Total Impressions',
                    value: '0',
                    icon: '/svg/icons/wid2.svg',
                    color: 'red'
                },
                {
                    id: 'average-cpc',
                    title: 'Average CPC',
                    value: '$0.00',
                    icon: '/svg/icons/cpc.svg',
                    color: 'gray'
                },
                {
                    id: 'average-cpm',
                    title: 'Average CPM',
                    value: '$0.00',
                    icon: '/svg/icons/cost.svg',
                    color: 'green'
                },
                {
                    id: 'total-credits',
                    title: 'Total Credits',
                    value: '0',
                    icon: '/svg/icons/cost.svg',
                    color: 'gray'
                },
                {
                    id: 'total-expense',
                    title: 'Total Expense',
                    value: '$0.00',
                    icon: '/svg/icons/cost.svg',
                    color: 'red'
                },
                {
                    id: 'remaining-balance',
                    title: 'Remaining Balance',
                    value: '$0.00',
                    icon: '/svg/icons/cost.svg',
                    color: 'green'
                }
            ]
        }

        const data = dashboardData.value
        const currency = data.currency?.toUpperCase() || 'USD'
        
        return [
            {
                id: 'clicks',
                title: 'Total Clicks',
                value: Number(data.total_clicks || 0).toLocaleString(),
                icon: '/svg/icons/click.svg',
                color: 'blue'
            },
            {
                id: 'impressions',
                title: 'Total Impressions',
                value: Number(data.total_impressions || 0).toLocaleString(),
                icon: '/svg/icons/wid2.svg',
                color: 'red'
            },
            {
                id: 'average-cpc',
                title: 'Average CPC',
                value: `$${parseFloat(data.cpc || 0).toFixed(2)}`,
                icon: '/svg/icons/cpc.svg',
                color: 'gray'
            },
            {
                id: 'average-cpm',
                title: 'Average CPM',
                value: `$${parseFloat(data.cpm || 0).toFixed(2)}`,
                icon: '/svg/icons/cost.svg',
                color: 'green'
            },
            {
                id: 'total-credits',
                title: 'Total Credits',
                value: `$${parseFloat(data.total_credits || 0).toFixed(2)}`,
                icon: '/svg/icons/cost.svg',
                color: 'gray'
            },
            {
                id: 'total-expense',
                title: 'Total Expense',
                value: `$${parseFloat(data.total_expense || 0).toFixed(2)}`,
                icon: '/svg/icons/cost.svg',
                color: 'red'
            },
            {
                id: 'remaining-balance',
                title: 'Remaining Balance',
                value: `$${parseFloat(data.remaining_balance || 0).toFixed(2)}`,
                icon: '/svg/icons/cost.svg',
                color: 'green'
            }
        ]
    })

    // Recent activities data (keeping static for now)
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
    ])

    // Chart period
    const chartPeriod = ref('Yearly')

    // Load dashboard analytics
    const loadDashboardData = async () => {
        try {
            const response = await $fetchCitizen('advertiser/advertisements/analytics/dashboard', {
                method: 'GET'
            })
            if (response.status === 'success') {
                dashboardData.value = response.data
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        }
    }

    // Load pie chart data
    const loadPieChartData = async () => {
        try {
            const response = await $fetchCitizen('advertiser/advertisements/analytics/pie-chart', {
                method: 'GET'
            })
            if (response.status === 'success') {
                pieChartData.value = response.data
            }
        } catch (error) {
            console.error('Error loading pie chart data:', error)
        }
    }

    // Load line graph data
    const loadLineGraphData = async () => {
        try {
            const response = await $fetchCitizen('advertiser/advertisements/analytics/line-graph', {
                method: 'GET'
            })
            if (response.status === 'success') {
                lineGraphData.value = response.data
            }
        } catch (error) {
            console.error('Error loading line graph data:', error)
        }
    }

    // Load campaigns list
    const loadCampaigns = async () => {
        try {
            const response = await $fetchCitizen('advertiser/advertisements/list', {
                method: 'GET',
                params: {
                    per_page: 4
                }
            })
            if (response.status === 'success') {
                campaignsData.value = response.data.data
            }
        } catch (error) {
            console.error('Error loading campaigns:', error)
        }
    }

    // Load all data on mount
    onMounted(async () => {
        isLoading.value = true
        await Promise.all([
            loadDashboardData(),
            loadPieChartData(),
            loadLineGraphData(),
            loadCampaigns()
        ])
        isLoading.value = false
    })
</script>

<template>
    <div class="space-y-6">
        <!-- KPI Cards -->
        <CommonAdvertiserKPICards :kpis="kpis" :isLoading="isLoading" />

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left Column - Performance Chart -->
            <div class="lg:col-span-7">
                <CommonAdvertiserPerformanceChart 
                    :period="chartPeriod" 
                    :lineGraphData="lineGraphData"
                    :isLoading="isLoading" />
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
                <CommonAdvertiserTargetingSnapshot 
                    :pieChartData="pieChartData"
                    :isLoading="isLoading" />
            </div>

            <!-- Right Column - Campaign Table -->
            <div class="lg:col-span-8">
                <CommonAdvertiserCampaignTable 
                    :campaigns="campaignsData" 
                    :isLoading="isLoading" />
            </div>
        </div>
    </div>
</template>