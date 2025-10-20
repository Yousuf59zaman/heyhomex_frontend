<script setup>
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// Chart data for targeting snapshot
const chartData = ref({
    labels: ['Kama\'aina', 'Investor', 'Military'],
    datasets: [{
        data: [40, 38, 22],
        backgroundColor: [
            '#FF6B6B',  // Kama'aina - Red/Pink
            '#3C4B66',  // Investor - Dark Navy
            '#6B9BD8'   // Military - Blue
        ],
        borderWidth: 0,
        cutout: '75%'
    }]
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
            displayColors: true
        }
    }
});

// Fixed 78% display
const totalPercentage = computed(() => {
    return 78;
});
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Targeting Snapshot</h3>
        </div>

        <!-- Chart Container -->
        <div class="relative h-48 mb-6">
            <Doughnut
                :data="chartData"
                :options="chartOptions"
                class="w-full h-full" />
            
            <!-- Center Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-xs text-gray-500 text-center leading-tight">Total User Based</div>
                <div class="text-xs text-gray-500 text-center leading-tight mb-1">on Category</div>
                <div class="text-2xl font-bold text-gray-900">{{ totalPercentage }}%</div>
            </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center justify-center space-x-6">
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