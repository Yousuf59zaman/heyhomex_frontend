<script setup>
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps({
    period: {
        type: String,
        default: 'Yearly'
    }
});

// Chart data for ad performance
const chartData = ref({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
            label: 'Clicks',
            data: [20, 35, 40, 60, 70, 55, 85, 65, 75, 60, 45, 50],
            borderColor: '#6B9BD8',
            backgroundColor: 'rgba(107, 155, 216, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6B9BD8',
            pointBorderColor: '#6B9BD8',
            pointBorderWidth: 2,
            pointRadius: 4
        },
        {
            label: 'Impressions',
            data: [25, 45, 35, 50, 65, 45, 70, 55, 65, 50, 40, 45],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FF6B6B',
            pointBorderColor: '#FF6B6B',
            pointBorderWidth: 2,
            pointRadius: 4
        }
    ]
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            displayColors: true,
            intersect: false,
            mode: 'index'
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: '#6B7280',
                font: {
                    size: 12
                }
            }
        },
        y: {
            beginAtZero: true,
            max: 100,
            grid: {
                color: '#F3F4F6',
                borderDash: [5, 5]
            },
            ticks: {
                color: '#6B7280',
                font: {
                    size: 12
                },
                callback: function(value) {
                    return value + '%';
                }
            }
        }
    },
    interaction: {
        intersect: false,
        mode: 'index'
    }
});
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Ad Performance Overview</h3>
            <div class="relative">
                <select
                    :value="period"
                    class="appearance-none bg-white px-4 py-2 pr-8 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
        </div>

        <!-- Chart Container -->
        <div class="relative h-64 mb-6">
            <Line
                :data="chartData"
                :options="chartOptions"
                class="w-full h-full" />
        </div>

        <!-- Legend -->
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