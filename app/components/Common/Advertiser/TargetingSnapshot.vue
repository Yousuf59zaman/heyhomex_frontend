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
        pieChartData: {
            type: Object,
            default: null
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    })

    const colors = ['#FF6B6B', '#3C4B66', '#6B9BD8', '#FFA500', '#10B981', '#8B5CF6']

    // Chart data for targeting snapshot
    const chartData = computed(() => {
        if (!props.pieChartData || !props.pieChartData.data) {
            return {
                labels: ["Kama'aina", 'Investor', 'Military'],
                datasets: [
                    {
                        data: [0, 0, 0],
                        backgroundColor: colors.slice(0, 3),
                        borderWidth: 0,
                        cutout: '75%',
                    },
                ],
            }
        }

        const labels = props.pieChartData.data.map(item => item.user_type_name)
        const data = props.pieChartData.data.map(item => item.total)
        const bgColors = colors.slice(0, labels.length)

        return {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: bgColors,
                    borderWidth: 0,
                    cutout: '75%',
                },
            ],
        }
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
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}`;
                    }
                }
            },
        },
    });

    
    const totalPercentage = computed(() => {
        if (!props.pieChartData || !props.pieChartData.grand_total) return 0
        return props.pieChartData.grand_total
    });

    const legendItems = computed(() => {
        if (!props.pieChartData || !props.pieChartData.data) {
            return [
                { name: "Kama'aina", color: colors[0] },
                { name: 'Investor', color: colors[1] },
                { name: 'Military', color: colors[2] }
            ]
        }

        return props.pieChartData.data.map((item, index) => ({
            name: item.user_type_name,
            color: colors[index % colors.length]
        }))
    })
</script>

<template>
    <div
        class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
                <Skeleton v-if="isLoading" width="10rem" height="1.5rem" />
                <span v-else>Targeting Snapshot</span>
            </h3>
        </div>

        <!-- Chart Container -->
        <div class="relative h-48 mb-6">
            <div v-if="isLoading" class="flex items-center justify-center h-full">
                <Skeleton size="12rem" shape="circle" />
            </div>
            <Doughnut
                v-else
                :data="chartData"
                :options="chartOptions"
                class="w-full h-full" />

            <!-- Center Text -->
            <div
                v-if="!isLoading"
                class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-xs text-gray-500 text-center leading-tight">
                    Total User Based
                </div>
                <div
                    class="text-xs text-gray-500 text-center leading-tight mb-1">
                    on Category
                </div>
                <div class="text-2xl font-bold text-gray-900">
                    {{ totalPercentage }}
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center justify-center flex-wrap gap-4">
            <div 
                v-for="(item, index) in legendItems" 
                :key="index"
                class="flex items-center space-x-2">
                <div 
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: item.color }"></div>
                <span class="text-sm text-gray-600">{{ item.name }}</span>
            </div>
        </div>
    </div>
</template>
