<script setup>
    const props = defineProps({
        kpis: {
            type: Array,
            default: () => [
                {
                    id: 'new-leads',
                    title: 'New Leads',
                    value: '12',
                    change: '+15%',
                    changeType: 'positive',
                    icon: '/svg/icons/wid1.svg',
                    color: 'blue',
                },
                {
                    id: 'claimed-leads',
                    title: 'Claimed Leads',
                    value: '08',
                    change: '-5%',
                    changeType: 'negative',
                    icon: '/svg/icons/wid2.svg',
                    color: 'red',
                },
                {
                    id: 'contacted-leads',
                    title: 'Contacted Leads',
                    value: '65%',
                    change: '+12%',
                    changeType: 'positive',
                    icon: '/svg/icons/wid2.svg',
                    color: 'green',
                },
            ],
        },
    });

    const getValueColor = (color) => {
        const colors = {
            blue: '#3B82F6', // Darker blue for text
            red: '#E82124', // Darker red for text
            green: '#242424', // Darker green for text
        };
        return colors[color] || '#374151';
    };
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
            v-for="kpi in kpis"
            :key="kpi.id"
            class="bg-white flex justify-between items-end rounded-xl p-6 border border-gray-100 shadow-sm">
            <!-- Header with Icon and Value -->
            <div class="flex flex-col">
                <!-- Icon -->
                <div class="flex-shrink-0">
                    <div
                        class="w-12 h-12 rounded-full flex items-center justify-start">
                        <img
                            :src="kpi.icon"
                            :alt="kpi.title"
                            class="w-8 h-8" />
                    </div>
                </div>

                <!-- Title -->
                <h3 class="text-gray-700 text-sm font-medium">
                    {{ kpi.title }}
                </h3>
            </div>
            <!-- Large Value -->
            <div class="text-right">
                <div
                    class="text-3xl font-bold"
                    :style="{ color: getValueColor(kpi.color) }">
                    {{ kpi.value }}
                </div>
            </div>
        </div>
    </div>
</template>
