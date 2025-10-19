<script setup>
    const props = defineProps({
        leads: {
            type: Array,
            default: () => [
                {
                    id: 1,
                    name: 'Annette Black',
                    avatar: '/images/dashboard/1.png',
                    property: '123A Elm Street',
                    status: 'New',
                    statusColor: 'green',
                    contactInfo: '(555) 123-4567',
                    contactType: 'phone',
                },
                {
                    id: 2,
                    name: 'Ralph Edwards',
                    avatar: '/images/dashboard/2.png',
                    property: '450 Pine Avenue',
                    status: 'Claimed',
                    statusColor: 'blue',
                    contactInfo: 'john@example.com',
                    contactType: 'email',
                },
                {
                    id: 3,
                    name: 'Darlene Robertson',
                    avatar: '/images/dashboard/3.png',
                    property: '7C Sunset Blvd',
                    status: 'Claimed',
                    statusColor: 'blue',
                    contactInfo: '(555) 888-9999',
                    contactType: 'phone',
                },
            ],
        },
    });

    const getStatusColor = (color) => {
        const colors = {
            green: 'bg-green-100 text-green-800',
            blue: 'bg-blue-100 text-blue-800',
            yellow: 'bg-yellow-100 text-yellow-800',
            red: 'bg-red-100 text-red-800',
        };
        return colors[color] || 'bg-gray-100 text-gray-800';
    };
</script>

<template>
    <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Lead Table</h3>
            <button class="text-sm text-gray-500 hover:text-gray-700">
                See all
            </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-gray-200">
                        <th
                            class="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Name
                        </th>
                        <th
                            class="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Property
                        </th>
                        <th
                            class="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Status
                        </th>
                        <th
                            class="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Contact Info
                        </th>
                        <th
                            class="text-left py-3 px-4 text-sm font-medium text-gray-600">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="lead in leads"
                        :key="lead.id"
                        class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <!-- Name with Avatar -->
                        <td class="py-4 px-4">
                            <div class="flex items-center space-x-3">
                                <img
                                    :src="lead.avatar"
                                    :alt="lead.name"
                                    class="w-8 h-8 rounded-full object-cover" />
                                <span class="text-sm font-medium text-gray-900">
                                    {{ lead.name }}
                                </span>
                            </div>
                        </td>

                        <!-- Property -->
                        <td class="py-4 px-4">
                            <span class="text-sm text-gray-600">
                                {{ lead.property }}
                            </span>
                        </td>

                        <!-- Status -->
                        <td class="py-4 px-4">
                            <span
                                class="px-2 py-1 text-xs font-medium rounded-full"
                                :class="getStatusColor(lead.statusColor)">
                                {{ lead.status }}
                            </span>
                        </td>

                        <!-- Contact Info -->
                        <td class="py-4 px-4">
                            <div class="flex items-center space-x-2">
                                <Icon
                                    :name="
                                        lead.contactType === 'phone'
                                            ? 'lucide:phone'
                                            : 'lucide:mail'
                                    "
                                    class="w-4 h-4 text-gray-400" />
                                <span class="text-sm text-gray-600">
                                    {{ lead.contactInfo }}
                                </span>
                            </div>
                        </td>

                        <!-- Actions -->
                        <td class="py-4 px-4">
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
