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
    ArcElement,
} from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const props = defineProps({
    period: {
        type: String,
        default: 'Yearly',
    },
});


const chartData = ref({
    labels: ["Kama'aina", 'Investor', 'Military'],
    datasets: [
        {
            data: [40, 38, 22],
            backgroundColor: [
                '#FF6B6B',
                '#3C4B66',
                '#6B9BD8',
            ],
            borderWidth: 0,
            cutout: '75%',
        },
    ],
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            displayColors: true,
        },
    },
});

const totalPercentage = computed(() => {
    return 78;
});
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
                Ad Performance Overview
            </h3>
            <div class="relative">
                <select :value="period"
                    class="appearance-none bg-white px-4 py-2 pr-8 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
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
        <div class="relative h-72 mb-8">
            <Doughnut :data="chartData" :options="chartOptions" class="w-full h-full" />

            <!-- Center Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-xs text-gray-500 text-center leading-tight">
                    Total User Based
                </div>
                <div class="text-xs text-gray-500 text-center leading-tight mb-2">
                    on Category
                </div>
                <div class="text-3xl font-bold text-gray-900">
                    {{ totalPercentage }}%
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center justify-center space-x-8">
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                <span class="text-sm text-gray-600">Kama'aina</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-[#3C4B66]"></div>
                <span class="text-sm text-gray-600">Investor</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-[#6B9BD8]"></div>
                <span class="text-sm text-gray-600">Military</span>
            </div>
        </div>
    </div>
</template>
