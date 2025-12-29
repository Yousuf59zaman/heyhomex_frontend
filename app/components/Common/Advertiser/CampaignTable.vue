<script setup>
    const props = defineProps({
        campaigns: {
            type: Array,
            default: () => []
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    })

    const getStatusColor = (status) => {
        if (status === 1 || status === "Active") {
            return "bg-green-100 text-green-700 border-green-200"
        } else if (status === 0 || status === "Inactive") {
            return "bg-red-100 text-red-700 border-red-200"
        } else if (status === "Paused") {
            return "bg-yellow-100 text-yellow-700 border-yellow-200"
        }
        return "bg-gray-100 text-gray-700 border-gray-200"
    }

    const getStatusLabel = (status) => {
        if (status === 1) return "Active"
        if (status === 0) return "Inactive"
        return status
    }
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
                <Skeleton v-if="isLoading" width="10rem" height="1.5rem" />
                <span v-else>Current Campaigns</span>
            </h3>
            <NuxtLink to="/advertisers/advertisements" class="text-sm text-gray-500 hover:text-gray-700">
                See all
            </NuxtLink>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
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
                            Balance
                        </th>
                        <th
                            class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody v-if="isLoading">
                    <tr
                        v-for="i in 4"
                        :key="i"
                        class="border-b border-gray-100">
                        <td class="py-4 px-2">
                            <Skeleton width="10rem" height="1rem" />
                        </td>
                        <td class="py-4 px-2">
                            <Skeleton width="4rem" height="1.5rem" borderRadius="0.375rem" />
                        </td>
                        <td class="py-4 px-2">
                            <Skeleton width="3rem" height="1rem" />
                        </td>
                        <td class="py-4 px-2">
                            <Skeleton width="4rem" height="1rem" />
                        </td>
                        <td class="py-4 px-2">
                            <Skeleton width="3rem" height="1rem" />
                        </td>
                        <td class="py-4 px-2">
                            <Skeleton width="4rem" height="1rem" />
                        </td>
                        <td class="py-4 px-2">
                            <Skeleton width="1.5rem" height="1.5rem" />
                        </td>
                    </tr>
                </tbody>

                <tbody v-else>
                    <tr
                        v-if="campaigns.length === 0"
                        class="border-b border-gray-100">
                        <td colspan="7" class="py-8 text-center text-gray-500">
                            No campaigns found. Create your first advertisement to get started!
                        </td>
                    </tr>
                    <tr
                        v-for="campaign in campaigns"
                        :key="campaign.id"
                        class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-4 px-2">
                            <div class="flex items-center gap-3">
                                <div class="flex-shrink-0">
                                    <img 
                                        v-if="campaign.media_url" 
                                        :src="campaign.media_url" 
                                        :alt="campaign.title" 
                                        class="w-10 h-10 object-cover rounded-md" 
                                    />
                                    <div 
                                        v-else 
                                        class="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                                        <i class="fa fa-image text-gray-400"></i>
                                    </div>
                                </div>
                                <div class="text-sm font-medium text-gray-900">
                                    {{ campaign.title }}
                                </div>
                            </div>
                        </td>

                        <td class="py-4 px-2">
                            <span
                                class="px-2 py-1 text-xs font-medium rounded-md border"
                                :class="getStatusColor(campaign.status)">
                                {{ getStatusLabel(campaign.status_label || campaign.status) }}
                            </span>
                        </td>

                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">{{
                                campaign.total_clicks || 0
                            }}</span>
                        </td>

                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">{{
                                (campaign.total_impressions || 0).toLocaleString()
                            }}</span>
                        </td>

                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">${{
                                parseFloat(campaign.cpc || 0).toFixed(2)
                            }}</span>
                        </td>

                        <td class="py-4 px-2">
                            <span class="text-sm text-gray-900">${{
                                parseFloat(campaign.remaining_balance || 0).toFixed(2)
                            }}</span>
                        </td>

                        <td class="py-4 px-2">
                            <NuxtLink
                                :to="`/advertisers/advertisements?id=${campaign.id}`"
                                title="View Details"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <Icon
                                    name="lucide:more-horizontal"
                                    class="w-4 h-4" />
                            </NuxtLink>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
