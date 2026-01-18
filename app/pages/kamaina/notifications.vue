<script setup>
useHead({ title: 'Notifications - Kamaina Panel' })
definePageMeta({ middleware: ['auth-citizen'], layout: 'citizen' })

const route = useRoute()
const toast = useToast()

const notifications = ref([])
const pending = ref(false)
const error = ref(null)
const activeTab = ref('all') // 'all', 'unread', 'read'

const paginationConfig = ref({
    data: {},
    lang: 'en',
    align: 'center',
    action: ''
})

// Load notifications
const loadNotifications = async () => {
    pending.value = true
    error.value = null
    try {
        const params = {
            page: route.query.page || 1
        }

        // Add read_status filter based on active tab
        if (activeTab.value === 'read') {
            params.read_status = 'read'
        } else if (activeTab.value === 'unread') {
            params.read_status = 'unread'
        }

        const response = await $fetchCitizen('v1/leads/notifications', {
            method: 'GET',
            params
        })

        if (response.status === 'success') {
            notifications.value = response.data.data
            paginationConfig.value.data = response.data
        }
    } catch (e) {
        error.value = e.message
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load notifications',
            life: 3000
        })
    } finally {
        pending.value = false
    }
}

// Mark single notification as read
const markAsRead = async (notificationId) => {
    try {
        const formData = new FormData()
        formData.append('_method', 'PATCH')

        const response = await $fetchCitizen(`v1/leads/notifications/${notificationId}/read`, {
            method: 'POST',
            body: formData
        })

        if (response.status === 'success') {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Notification marked as read',
                life: 2000
            })
            loadNotifications()
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to mark notification as read',
            life: 3000
        })
    }
}

// Mark all notifications as read
const markAllAsRead = async () => {
    try {
        const formData = new FormData()
        formData.append('_method', 'PATCH')

        const response = await $fetchCitizen('v1/leads/notifications/read-all', {
            method: 'POST',
            body: formData
        })

        if (response.status === 'success') {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'All notifications marked as read',
                life: 2000
            })
            loadNotifications()
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to mark all notifications as read',
            life: 3000
        })
    }
}

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Get notification icon
const getNotificationIcon = (notification) => {
    const type = notification.data?.type
    if (type === 'lead_updated') return 'pi-refresh'
    return 'pi-bell'
}

// Get notification color
const getNotificationColor = (notification) => {
    const type = notification.data?.type
    if (type === 'lead_updated') return 'text-orange-500'
    return 'text-gray-500'
}

// Watch for tab changes
watch(activeTab, () => {
    navigateTo({ query: { ...route.query, page: 1 } })
    loadNotifications()
})

// Watch for page changes
watch(() => route.query.page, () => {
    loadNotifications()
})

// Load on mount
onMounted(() => {
    loadNotifications()
})
</script>

<template>
    <div class="space-y-6 mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
                <p class="text-sm text-gray-500 mt-1">Stay updated with your lead activities</p>
            </div>
            
            <Button
                v-if="notifications.length > 0"
                @click="markAllAsRead"
                label="Mark All as Read"
                icon="pi pi-check"
                severity="secondary"
                outlined
                size="small"
                class="transition-all duration-300 hover:scale-105"
            />
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
            <nav class="flex space-x-8">
                <button
                    @click="activeTab = 'all'"
                    :class="[
                        'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === 'all'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]">
                    All Notifications
                </button>
                <button
                    @click="activeTab = 'unread'"
                    :class="[
                        'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === 'unread'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]">
                    Unread
                </button>
                <button
                    @click="activeTab = 'read'"
                    :class="[
                        'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                        activeTab === 'read'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]">
                    Read
                </button>
            </nav>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="space-y-4">
            <div v-for="n in 5" :key="n" class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-start gap-4">
                    <Skeleton shape="circle" size="3rem" />
                    <div class="flex-1 space-y-2">
                        <Skeleton width="60%" height="1.5rem" />
                        <Skeleton width="100%" height="1rem" />
                        <Skeleton width="40%" height="0.875rem" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p class="text-red-800 font-medium">Failed to load notifications</p>
            <p class="text-red-600 text-sm mt-1">{{ error }}</p>
            <Button
                @click="loadNotifications"
                label="Try Again"
                icon="pi pi-refresh"
                severity="danger"
                outlined
                class="mt-4"
            />
        </div>

        <!-- Empty State -->
        <div v-else-if="!notifications.length" class="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Icon name="lucide:bell-off" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p class="text-gray-500">You'll see notifications here when there are updates to your leads</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="space-y-3">
            <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="[
                    'bg-white rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer',
                    notification.read_at ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
                ]"
                @click="navigateTo(`/kamaina/notifications/${notification.id}`)">
                <div class="p-4">
                    <div class="flex items-start gap-4">
                        <!-- Icon -->
                        <div :class="[
                            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                            notification.read_at ? 'bg-gray-100' : 'bg-blue-100'
                        ]">
                            <i :class="[
                                'pi text-xl',
                                getNotificationIcon(notification),
                                getNotificationColor(notification)
                            ]"></i>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1">
                                    <h3 class="text-sm font-semibold text-gray-900">
                                        {{ notification.data?.title || 'New Notification' }}
                                    </h3>
                                    <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {{ notification.data?.message }}
                                    </p>
                                    <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span>{{ notification.data?.agent_name || 'System' }}</span>
                                        <span>•</span>
                                        <span>{{ formatDate(notification.created_at) }}</span>
                                    </div>
                                </div>

                                <!-- Unread Badge -->
                                <div v-if="!notification.read_at" class="flex-shrink-0">
                                    <span class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="notifications.length > 0 && paginationConfig.data.last_page > 1" class="mt-6">
            <Pagination :config="paginationConfig" />
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
