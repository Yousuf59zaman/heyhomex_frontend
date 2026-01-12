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
    Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const props = defineProps({
    chartData: {
        type: Array,
        default: () => []
    },
    dateRange: {
        type: Object,
        default: () => ({ startDate: '', endDate: '' })
    }
})

// Process chart data from API
const processedChartData = computed(() => {
    if (!props.chartData || props.chartData.length === 0) {
        return {
            labels: [],
            datasets: [{
                label: 'Leads',
                data: [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#3B82F6',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        }
    }

    const labels = props.chartData.map(item => {
        const date = new Date(item.date)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const data = props.chartData.map(item => item.count)

    return {
        labels,
        datasets: [{
            label: 'Leads',
            data,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#3B82F6',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
        }]
    }
})

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            displayColors: false,
            padding: 12,
            callbacks: {
                title: function (context) {
                    return context[0].label
                },
                label: function (context) {
                    return context.parsed.y + ' leads'
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#9CA3AF',
                font: {
                    size: 11
                }
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                color: '#F3F4F6',
                drawBorder: false
            },
            ticks: {
                color: '#9CA3AF',
                font: {
                    size: 11
                },
                stepSize: 20
            }
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
})
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">

        <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-semibold text-gray-900">Leads Activity</h3>
            <div class="text-sm text-gray-600">
                {{ dateRange.startDate }} to {{ dateRange.endDate }}
            </div>
        </div>


        <div v-if="processedChartData.labels.length === 0" class="relative h-64 flex items-center justify-center">
            <p class="text-gray-500 text-sm">No data available for the selected period</p>
        </div>
        <div v-else class="relative h-64">
            <Line :data="processedChartData" :options="chartOptions" />
        </div>
    </div>
</template>
