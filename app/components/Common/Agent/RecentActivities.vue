<script setup>
    const props = defineProps({
        activities: {
            type: Array,
            default: () => [
                {
                    id: 1,
                    type: 'lead-completed',
                    title: 'Lead Follow-Up Completed',
                    description:
                        'You called Emily Santos regarding 123 Elm Street.',
                    date: 'July 25, 2025',
                    status: 'Contacted',
                    statusColor: 'green',
                },
                {
                    id: 2,
                    type: 'lead-assigned',
                    title: 'New Lead Assigned',
                    description:
                        'John Kim was assigned to you for 450 Pine Avenue.',
                    date: 'July 24, 2025',
                    status: 'New',
                    statusColor: 'blue',
                },
                {
                    id: 3,
                    type: 'email-sent',
                    title: 'Email Sent',
                    description:
                        'John Kim was assigned to you for 450 Pine Avenue.',
                    date: 'July 24, 2025',
                    status: 'New',
                    statusColor: 'blue',
                },
            ],
        },
    });

    const getActivityIcon = (type) => {
        const icons = {
            'lead-completed': 'lucide:user',
            'lead-assigned': 'lucide:target',
            'email-sent': 'lucide:message-square',
        };
        return icons[type] || 'lucide:activity';
    };

    const getStatusColor = (status) => {
        if (status === 'Contacted') {
            return 'bg-green-100 text-green-700 border-green-200';
        } else if (status === 'New') {
            return 'bg-blue-100 text-blue-700 border-blue-200';
        }
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };
</script>

<template>
    <div
        class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
                Recent Activities
            </h3>
            <button class="text-sm text-gray-500 hover:text-gray-700">
                See all
            </button>
        </div>

        <!-- Activities List -->
        <div class="space-y-6 min-h-[320px]">
            <div
                v-for="activity in activities"
                :key="activity.id"
                class="flex items-start space-x-4">
                <!-- Icon -->
                <div class="flex-shrink-0 mt-1">
                    <div
                        class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon
                            :name="getActivityIcon(activity.type)"
                            class="w-5 h-5 text-gray-600" />
                    </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <h4 class="text-base font-semibold text-gray-900 mb-2">
                        {{ activity.title }}
                    </h4>

                    <!-- Description -->
                    <p class="text-sm text-gray-600 mb-3">
                        {{ activity.description }}
                    </p>
                </div>

                <!-- Right Side Info -->
                <div class="flex flex-col items-end space-y-2 text-sm">
                    <!-- Date -->
                    <div class="flex items-center text-gray-500">
                        <!-- <Icon name="lucide:calendar" /> -->
                        <img
                            src="/svg/icons/dates.svg"
                            class="w-4 h-4 mr-1"
                            alt="" />
                        <span class="text-xs">Date: {{ activity.date }}</span>
                    </div>

                    <!-- Status -->
                    <div class="flex items-center text-gray-500">
                        <!-- <Icon name="lucide:circle" class="w-4 h-4 mr-1" /> -->
                        <img
                            src="/svg/icons/status.svg"
                            class="w-4 h-4 mr-1"
                            alt="" />
                        <span class="text-xs mr-2">Status:</span>
                        <span
                            class="px-2 py-1 text-xs font-medium rounded-md border"
                            :class="getStatusColor(activity.status)">
                            {{ activity.status }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
