<script setup>
    const props = defineProps({
        activities: {
            type: Array,
            default: () => [
                {
                    id: 1,
                    name: "Emily Santos",
                    avatar: "/images/dashboard/1.png",
                    email: "emily.santos@email.com",
                    phone: "+1 (415) 555-8547",
                    interest: "2BR Condo - HonoluAi",
                    date: "July 22, 2025",
                },
                {
                    id: 2,
                    name: "John Kim",
                    avatar: "/images/dashboard/2.png",
                    email: "john@example.com",
                    phone: "+1 (415) 555-8547",
                    interest: "3BR Villa - Maui",
                    date: "July 22, 2025",
                },
            ],
        },
    })
</script>

<template>
    <div
        class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">
                Recent Activities
            </h3>
            <button class="text-sm text-gray-500 hover:text-gray-700">
                See all
            </button>
        </div>

        <div class="space-y-6 min-h-[320px]">
            <div
                v-for="activity in activities"
                :key="activity.id"
                class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                    <img
                        :src="activity.avatar"
                        :alt="activity.name"
                        class="w-12 h-12 rounded-full object-cover" />
                </div>

                <div class="flex-1 min-w-0">
                    <h4 class="text-base font-semibold text-gray-900 mb-2">
                        {{ activity.name }}
                    </h4>

                    <div class="space-y-1 mb-3">
                        <div class="flex items-center text-sm text-gray-600">
                            <Icon
                                name="lucide:mail"
                                class="w-4 h-4 mr-2" />
                            <span>Email - {{ activity.email }}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <Icon
                                name="lucide:phone"
                                class="w-4 h-4 mr-2" />
                            <span>Phone - {{ activity.phone }}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <Icon
                                name="lucide:map-pin"
                                class="w-4 h-4 mr-2" />
                            <span>Interested In - {{ activity.interest }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col items-end space-y-2 text-sm">
                    <div class="text-xs text-gray-500">
                        {{ activity.date }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
