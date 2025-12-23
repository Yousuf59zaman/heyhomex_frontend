<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    subscriptionData: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close'])

const handleClose = () => {
    emit('close')
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>



<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">

            <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="handleClose"></div>


            <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8 z-10">

                <div class="flex justify-center mb-6">
                    <div class="bg-green-100 rounded-full p-3">
                        <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>


                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Subscription Successful!</h2>
                    <p class="text-sm text-gray-600">
                        Your subscription has been activated successfully
                    </p>
                </div>


                <div v-if="subscriptionData" class="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                        <span class="text-sm text-gray-600">Plan</span>
                        <span class="text-sm font-semibold text-gray-900">{{ subscriptionData.package?.title }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                        <span class="text-sm text-gray-600">Amount</span>
                        <span class="text-sm font-semibold text-gray-900">${{ subscriptionData.package?.price }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                        <span class="text-sm text-gray-600">Status</span>
                        <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {{ subscriptionData.status }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                        <span class="text-sm text-gray-600">Started</span>
                        <span class="text-sm font-medium text-gray-900">{{
                            formatDate(subscriptionData.current_period_start) }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-gray-600">Next Billing</span>
                        <span class="text-sm font-medium text-gray-900">{{
                            formatDate(subscriptionData.current_period_end) }}</span>
                    </div>
                </div>


                <button @click="handleClose"
                    class="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors">
                    Got it, thanks!
                </button>
            </div>
        </div>
    </div>
</template>
