<script setup>
useHead({ title: 'Notification Details - Military Panel' })
definePageMeta({ middleware: ['auth-citizen'], layout: 'citizen' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const notification = ref(null)
const pending = ref(false)
const error = ref(null)


const loadNotification = async () => {
    pending.value = true
    error.value = null
    try {
        const response = await $fetchCitizen(`v1/leads/notifications/${route.params.id}`, {
            method: 'GET'
        })

        if (response.status === 'success') {
            notification.value = response.data
            
          
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


const markAsRead = async () => {
    try {
        const formData = new FormData()
        formData.append('_method', 'PATCH')

        await $fetchCitizen(`v1/leads/notifications/${route.params.id}/read`, {
            method: 'POST',
            body: formData
        })

   
        if (notification.value) {
            notification.value.read_at = new Date().toISOString()
        }
    } catch (e) {
        console.error('Failed to mark notification as read:', e)
    }
}


const goBack = () => {
    router.push('/military/notifications')
}


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

       
        <div v-if="pending" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Skeleton height="2rem" class="mb-4"></Skeleton>
            <Skeleton height="1rem" class="mb-2"></Skeleton>
            <Skeleton height="1rem" class="mb-2"></Skeleton>
            <Skeleton height="1rem" width="70%"></Skeleton>
        </div>

      
        <div v-else-if="error" class="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div class="flex items-center gap-3 text-red-600">
                <Icon name="lucide:alert-circle" class="w-6 h-6" />
                <div>
                    <p class="font-semibold">Failed to load notification</p>
                    <p class="text-sm">{{ error }}</p>
                </div>
            </div>
        </div>

      
        <div v-else-if="notification" class="bg-white rounded-lg shadow-sm border border-gray-200">
         
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
                            {{ notification.data?.title || 'Notification' }}
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

           
            <div class="p-6">
                <div class="prose max-w-none">
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ notification.data?.message || 'No message available' }}</p>
                </div>

              
                <div v-if="notification.data?.agent_name" class="mt-6 space-y-2">
                    <div class="flex items-center gap-2 text-sm">
                        <span class="text-gray-500">From:</span>
                        <span class="text-gray-700 font-medium">{{ notification.data.agent_name }}</span>
                    </div>
                </div>
            </div>

            
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
