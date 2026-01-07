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
    period: {
        type: String,
        default: 'December'
    }
})


const chartData = ref({
    labels: ['Dec 1', '', 'Dec 2', '', 'Dec 3', '', 'Dec 4', '', 'Dec 5', '', 'Dec 6', '', 'Dec 7', '', 'Dec 8', '', 'Dec 9', '', 'Dec 10', '', 'Dec 11', '', 'Dec 12', ''],
    datasets: [
        {
            label: 'Leads',
            data: [12, 15, 20, 18, 25, 30, 28, 35, 70, 32, 28, 33, 30, 35, 38, 42, 50, 45, 48, 52, 55, 50, 45, 42],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#3B82F6',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
        }
    ]
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
            <h3 class="text-base font-semibold text-gray-900">Leads</h3>
            <select :value="period"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer">
                <option value="December">December</option>
                <option value="January">January</option>
                <option value="February">February</option>
            </select>
        </div>


        <div class="relative h-64">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
