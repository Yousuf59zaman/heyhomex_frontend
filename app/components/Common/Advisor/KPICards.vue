<script setup>
    const props = defineProps({
        kpis: {
            type: Array,
            default: () => [
                {
                    id: 'clicks',
                    title: 'Clicks',
                    value: '1,233',
                    icon: '/svg/icons/click.svg',
                    color: 'blue',
                },
                {
                    id: 'impressions',
                    title: 'Impressions',
                    value: '12,450',
                    icon: '/svg/icons/wid2.svg',
                    color: 'red',
                },
                {
                    id: 'average-cpc',
                    title: 'Average CPC',
                    value: '$0.26',
                    icon: '/svg/icons/cpc.svg',
                    color: 'gray',
                },
                {
                    id: 'cost',
                    title: 'Cost',
                    value: '$324.60',
                    icon: '/svg/icons/cost.svg',
                    color: 'green',
                },
            ],
        },
    });

    const getIconFilter = (color) => {
        const filters = {
            blue: 'invert(35%) sepia(100%) saturate(1000%) hue-rotate(200deg) brightness(1.1)',
            red: 'invert(25%) sepia(100%) saturate(1000%) hue-rotate(350deg) brightness(1.1)',
            gray: 'invert(40%) sepia(0%) saturate(0%) brightness(1.2)',
            green: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(90deg) brightness(1.1)',
        };
        return filters[color] || 'none';
    };

    const getValueColor = (color) => {
        const colors = {
            blue: 'text-blue-500',
            red: 'text-red-500',
            gray: 'text-gray-800',
            green: 'text-gray-800',
        };
        return colors[color] || 'text-gray-900';
    };
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div
            v-for="kpi in kpis"
            :key="kpi.id"
            class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <!-- Icon -->
            <div
                class="flex items-center justify-center w-12 h-12 rounded-full mb-4">
                <img
                    :src="kpi.icon"
                    :alt="kpi.title"
                    class="w-8 h-8 filter" />
            </div>

            <!-- Title -->
            <h3 class="text-sm font-medium text-gray-600 mb-2">
                {{ kpi.title }}
            </h3>

            <!-- Value -->
            <div
                class="text-2xl font-bold mb-1"
                :class="getValueColor(kpi.color)">
                {{ kpi.value }}
            </div>
        </div>
    </div>
</template>
