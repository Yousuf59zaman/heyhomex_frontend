<script setup>
    const props = defineProps({
        campaigns: {
            type: Array,
            default: () => [
                {
                    id: 1,
                    name: 'Home Buyers FL',
                    status: 'Running',
                    statusColor: 'green',
                    clicks: 456,
                    impressions: 10000,
                    cpc: '$0.23',
                    budget: 456,
                },
                {
                    id: 2,
                    name: 'Military Offers',
                    status: 'Paused',
                    statusColor: 'yellow',
                    clicks: 110,
                    impressions: 2500,
                    cpc: '$0.28',
                    budget: 456,
                },
                {
                    id: 3,
                    name: 'Eco-Friendly Homes',
                    status: 'Running',
                    statusColor: 'green',
                    clicks: 309,
                    impressions: 1200,
                    cpc: '$0.17',
                    budget: 456,
                },
                {
                    id: 4,
                    name: 'Investor Gold Leads',
                    status: 'Running',
                    statusColor: 'green',
                    clicks: 456,
                    impressions: 1600,
                    cpc: '$0.20',
                    budget: 456,
                },
            ],
        },
    });

    const getStatusColor = (status) => {
        if (status === 'Running') {
            return 'bg-green-100 text-green-700 border-green-200';
        } else if (status === 'Paused') {
            return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
                Current Campaigns
            </h3>
            <button class="text-sm text-gray-500 hover:text-gray-700">
                See all
            </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="w-full">
                <!-- Header -->
                <thead>
                    <tr class="border-b border-gray-200">
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            Campaign Name
                        </th>
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            Status
                        </th>
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            Clicks
                        </th>
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            Impressions
                        </th>
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            CPC
                        </th>
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            Budget
                        </th>
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            Action
                        </th>
                    </tr>
                </thead>

                <!-- Body -->
                <tbody>
                    <tr
                        v-for="campaign in campaigns"
                        :key="campaign.id"
                        class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <!-- Campaign Name -->
                        <td class="py-4 px-2">
                            <div class="text-sm font-medium text-gray-900">
                                {{ campaign.name }}
                            </div>
                        </td>

                        <!-- Status -->
                        <td class="py-4 px-2">
                            <span
                                class="px-2 py-1 text-xs font-medium rounded-md border"
                                :class="getStatusColor(campaign.status)">
                                {{ campaign.status }}
                            </span>
                        </td>

                        <!-- Clicks -->
                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">{{
                                campaign.clicks
                            }}</span>
                        </td>

                        <!-- Impressions -->
                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">{{
                                campaign.impressions.toLocaleString()
                            }}</span>
                        </td>

                        <!-- CPC -->
                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">{{
                                campaign.cpc
                            }}</span>
                        </td>

                        <!-- Budget -->
                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">{{
                                campaign.budget
                            }}</span>
                        </td>

                        <!-- Action -->
                        <td class="py-4 px-2">
                            <button
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <Icon
                                    name="lucide:more-horizontal"
                                    class="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
