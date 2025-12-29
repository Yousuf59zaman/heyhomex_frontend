<script setup>
    import {
        Chart as ChartJS,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
    } from "chart.js"
    import {Line} from "vue-chartjs"

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    )

    const props = defineProps({
        period: {
            type: String,
            default: "yearly",
        },
        lineGraphData: {
            type: Object,
            default: null
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits(['period-change'])

    const chartData = computed(() => {
        if (!props.lineGraphData || !props.lineGraphData.data) {
            return {
                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ],
                datasets: [
                    {
                        label: "Clicks",
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        borderColor: "#6B9BD8",
                        backgroundColor: "rgba(107, 155, 216, 0.1)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#6B9BD8",
                        pointBorderColor: "#6B9BD8",
                        pointBorderWidth: 2,
                        pointRadius: 4,
                    },
                    {
                        label: "Impressions",
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        borderColor: "#FF6B6B",
                        backgroundColor: "rgba(255, 107, 107, 0.1)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#FF6B6B",
                        pointBorderColor: "#FF6B6B",
                        pointBorderWidth: 2,
                        pointRadius: 4,
                    },
                ],
            }
        }

        let labels = []
        let clicksData = []
        let impressionsData = []

        // Handle different view types
        if (props.lineGraphData.view_type === 'weekly') {
            labels = props.lineGraphData.data.map(item => item.day_short)
            clicksData = props.lineGraphData.data.map(item => item.clicks)
            impressionsData = props.lineGraphData.data.map(item => item.impressions)
        } else if (props.lineGraphData.view_type === 'monthly') {
            labels = props.lineGraphData.data.map(item => item.month_name.substring(0, 3))
            clicksData = props.lineGraphData.data.map(item => item.clicks)
            impressionsData = props.lineGraphData.data.map(item => item.impressions)
        } else if (props.lineGraphData.view_type === 'yearly') {
            labels = props.lineGraphData.data.map(item => item.year_label || item.year.toString())
            clicksData = props.lineGraphData.data.map(item => item.clicks)
            impressionsData = props.lineGraphData.data.map(item => item.impressions)
        }

        return {
            labels: labels,
            datasets: [
                {
                    label: "Clicks",
                    data: clicksData,
                    borderColor: "#6B9BD8",
                    backgroundColor: "rgba(107, 155, 216, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#6B9BD8",
                    pointBorderColor: "#6B9BD8",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                },
                {
                    label: "Impressions",
                    data: impressionsData,
                    borderColor: "#FF6B6B",
                    backgroundColor: "rgba(255, 107, 107, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#FF6B6B",
                    pointBorderColor: "#FF6B6B",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                },
            ],
        }
    })

    const maxYValue = computed(() => {
        if (!props.lineGraphData || !props.lineGraphData.data) return 100
        
        const allValues = props.lineGraphData.data.flatMap(item => [item.clicks, item.impressions])
        const maxValue = Math.max(...allValues, 10)
        return Math.ceil(maxValue * 1.2 / 10) * 10
    })

    const chartOptions = computed(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "white",
                bodyColor: "white",
                cornerRadius: 8,
                displayColors: true,
                intersect: false,
                mode: "index",
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#6B7280",
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                beginAtZero: true,
                max: maxYValue.value,
                grid: {
                    color: "#F3F4F6",
                    borderDash: [5, 5],
                },
                ticks: {
                    color: "#6B7280",
                    font: {
                        size: 12,
                    },
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "index",
        },
    }))
</script>

<template>
    <div
        class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
                <Skeleton v-if="isLoading" width="12rem" height="1.5rem" />
                <span v-else>Ad Performance Overview</span>
            </h3>
            <div v-if="!isLoading" class="relative">
                <select
                    :value="period"
                    @change="emit('period-change', $event.target.value)"
                    class="appearance-none bg-white px-4 py-2 pr-8 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
                <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        class="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
            <Skeleton v-else width="8rem" height="2.5rem" borderRadius="0.5rem" />
        </div>

        <div class="relative h-64 mb-6">
            <div v-if="isLoading" class="flex items-center justify-center h-full">
                <Skeleton width="100%" height="100%" />
            </div>
            <Line
                v-else
                :data="chartData"
                :options="chartOptions"
                class="w-full h-full" />
        </div>

        <div class="flex items-center justify-start space-x-6">
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-[#6B9BD8]"></div>
                <span class="text-sm text-gray-600">Clicks</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                <span class="text-sm text-gray-600">Impressions</span>
            </div>
        </div>
    </div>
</template>
