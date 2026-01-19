<script setup>
useHead({ title: 'Notification Details - Military Panel' })
definePageMeta({ middleware: ['auth-citizen'], layout: 'citizen' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const notification = ref(null)
const pending = ref(false)
const error = ref(null)

// Load single notification
const loadNotification = async () => {
    pending.value = true
    error.value = null
    try {
        const response = await $fetchCitizen(`v1/leads/notifications/${route.params.id}`, {
            method: 'GET'
        })

        if (response.status === 'success') {
            notification.value = response.data
            
            // Mark as read if not already read
            if (!notification.value.read_at) {
                await markAsRead()
            }
        }
    } catch (e) {
        error.value = e.message
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load notification',
            life: 3000
        })
    } finally {
        pending.value = false
    }
}

// Mark notification as read
const markAsRead = async () => {
    try {
        const formData = new FormData()
        formData.append('_method', 'PATCH')

        await $fetchCitizen(`v1/leads/notifications/${route.params.id}/read`, {
            method: 'POST',
            body: formData
        })

        // Refresh notification to get updated read_at timestamp
        if (notification.value) {
            notification.value.read_at = new Date().toISOString()
        }
    } catch (e) {
        console.error('Failed to mark notification as read:', e)
    }
}

// Go back to notifications list
const goBack = () => {
    router.push('/military/notifications')
}

// Format date
const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Get notification icon based on type
const getNotificationIcon = (type) => {
    switch (type) {
        case 'new_lead':
            return 'pi-bell'
        case 'lead_updated':
            return 'pi-refresh'
        default:
            return 'pi-info-circle'
    }
}

onMounted(() => {
    loadNotification()
})
</script>

<template>
    <div class="w-full max-w-[1316px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header with Back Button -->
        <div class="flex items-center gap-4 mb-6">
            <button
                type="button"
                class="bg-[#F0F1F3] p-3 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Go back"
                @click="goBack">
                <Icon
                    name="lucide:arrow-left"
                    class="w-5 h-5 text-[#2C3E50]" />
            </button>
            <h1 class="text-2xl font-semibold text-[#2C3E50]">
                Notification Details
            </h1>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Skeleton height="2rem" class="mb-4"></Skeleton>
            <Skeleton height="1rem" class="mb-2"></Skeleton>
            <Skeleton height="1rem" class="mb-2"></Skeleton>
            <Skeleton height="1rem" width="70%"></Skeleton>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div class="flex items-center gap-3 text-red-600">
                <Icon name="lucide:alert-circle" class="w-6 h-6" />
                <div>
                    <p class="font-semibold">Failed to load notification</p>
                    <p class="text-sm">{{ error }}</p>
                </div>
            </div>
        </div>

        <!-- Notification Content -->
        <div v-else-if="notification" class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Notification Header -->
            <div class="p-6 border-b border-gray-200">
                <div class="flex items-start gap-4">
                    <div
                        class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                        :class="notification.read_at ? 'bg-gray-100' : 'bg-blue-50'">
                        <Icon
                            :name="getNotificationIcon(notification.type)"
                            class="w-6 h-6"
                            :class="notification.read_at ? 'text-gray-500' : 'text-blue-600'" />
                    </div>
                    <div class="flex-1">
                        <h2 class="text-xl font-semibold text-[#2C3E50] mb-2">
                            {{ notification.title }}
                        </h2>
                        <div class="flex items-center gap-4 text-sm text-gray-500">
                            <span>{{ formatDate(notification.created_at) }}</span>
                            <span
                                v-if="notification.read_at"
                                class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                Read
                            </span>
                            <span
                                v-else
                                class="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                                Unread
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notification Body -->
            <div class="p-6">
                <div class="prose max-w-none">
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ notification.message }}</p>
                </div>

                <!-- Additional Data (if any) -->
                <div v-if="notification.data" class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 class="text-sm font-semibold text-gray-700 mb-2">Additional Information</h3>
                    <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{ JSON.stringify(notification.data, null, 2) }}</pre>
                </div>
            </div>

            <!-- Footer -->
            <div v-if="notification.read_at" class="p-6 border-t border-gray-200 bg-gray-50">
                <p class="text-sm text-gray-500">
                    Read on {{ formatDate(notification.read_at) }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.prose {
    color: #374151;
}
</style>
