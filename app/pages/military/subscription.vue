<script setup>
import { loadStripe } from '@stripe/stripe-js'

useHead({ title: "Subscription - Military Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })


const activeTab = ref('subscription')
const completedTabs = ref(new Set(['subscription']))

const switchTab = async (tab) => {
    activeTab.value = tab
    completedTabs.value.add(tab)

    if (tab === 'billing' && !billingHistory.value) {
        await fetchBillingHistory()
    } else if (tab === 'history' && !subscriptionHistory.value) {
        await fetchSubscriptionHistory()
    }
}

const isTabCompleted = (tab) => {
    return completedTabs.value.has(tab)
}


const loading = ref(false)
const loadingPackages = ref(true)
const loadingActiveSubscription = ref(true)
const activeSubscription = ref(null)
const currentPlan = ref(null)
const billingCycle = ref('Free')
const nextBilling = ref('Free')


const billingHistory = ref(null)
const loadingBilling = ref(false)


const subscriptionHistory = ref(null)
const loadingHistory = ref(false)


const showCancelModal = ref(false)


const showChangePasswordModal = ref(false)


const showPaymentModal = ref(false)
const selectedPackage = ref(null)
const paymentProcessing = ref(false)


const showSuccessModal = ref(false)
const subscriptionData = ref(null)


const checkIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M16.6668 5L7.50016 14.1667L3.3335 10' stroke='%23121A22' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
const limitedCheckIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M16.6668 5L7.50016 14.1667L3.3335 10' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
const whiteCheckIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M16.6668 5L7.50016 14.1667L3.3335 10' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"


const packages = ref([])
const features = ref([])


const fetchActiveSubscription = async () => {
    loadingActiveSubscription.value = true
    try {
        const response = await $fetchCitizen('/v1/subscriptions/active', {
            method: 'GET'
        })

        console.log('Active subscription response:', response)


        if (response.status === 'success' && response.data && typeof response.data === 'object' && response.data.id) {
            activeSubscription.value = response.data
            currentPlan.value = response.data.package_id
            billingCycle.value = `${response.data.package.duration_in_days} days`
            nextBilling.value = new Date(response.data.current_period_end).toLocaleDateString()
            console.log('Active subscription set:', activeSubscription.value)
        } else {

            console.log('No active subscription found')
            activeSubscription.value = null
            currentPlan.value = null
            billingCycle.value = 'Free'
            nextBilling.value = 'Free'
        }
    } catch (error) {
        console.error('Error fetching active subscription:', error)

        activeSubscription.value = null
        currentPlan.value = null
        billingCycle.value = 'Free'
        nextBilling.value = 'Free'
    } finally {
        loadingActiveSubscription.value = false
    }
}


const fetchBillingHistory = async () => {
    loadingBilling.value = true
    try {
        const response = await $fetchCitizen('/v1/payments/list', {
            method: 'GET'
        })

        if (response.status === 'success') {
            billingHistory.value = response.data
        }
    } catch (error) {
        console.error('Error fetching billing history:', error)
    } finally {
        loadingBilling.value = false
    }
}


const fetchSubscriptionHistory = async () => {
    loadingHistory.value = true
    try {
        const response = await $fetchCitizen('/v1/subscriptions/list', {
            method: 'GET'
        })

        if (response.status === 'success') {
            subscriptionHistory.value = response.data
        }
    } catch (error) {
        console.error('Error fetching subscription history:', error)
    } finally {
        loadingHistory.value = false
    }
}


const fetchPackages = async () => {
    loadingPackages.value = true
    try {
        const response = await $fetchCMS('/admin/packages/list', {
            method: 'GET'
        })

        if (response.status === 'success' && response.data?.data) {
            packages.value = response.data.data


            const featureMap = new Map()

            packages.value.forEach((pkg, index) => {
                pkg.details.forEach(detail => {
                    if (!featureMap.has(detail.detail_title)) {
                        featureMap.set(detail.detail_title, {
                            name: detail.detail_title,
                            description: detail.description,
                            order: detail.order,
                            packages: new Set()
                        })
                    }
                    featureMap.get(detail.detail_title).packages.add(pkg.id)
                })
            })


            features.value = Array.from(featureMap.entries())
                .map(([name, data]) => {
                    const feature = { name, description: data.description }

                    packages.value.forEach(pkg => {
                        feature[`package_${pkg.id}`] = data.packages.has(pkg.id)
                    })
                    return feature
                })
                .sort((a, b) => {
                    const orderA = packages.value[0]?.details.find(d => d.detail_title === a.name)?.order || 999
                    const orderB = packages.value[0]?.details.find(d => d.detail_title === b.name)?.order || 999
                    return orderA - orderB
                })
        }
    } catch (error) {
        console.error('Error fetching packages:', error)
    } finally {
        loadingPackages.value = false
    }
}


const handleChoosePlan = async (pkg) => {
    if (loading.value) return

    selectedPackage.value = pkg
    showPaymentModal.value = true
}

const handlePaymentSuccess = async (paymentMethodId) => {
    paymentProcessing.value = true
    try {
        const response = await $fetchCitizen('/v1/subscriptions/subscribe', {
            method: 'POST',
            body: {
                package_id: selectedPackage.value.id,
                token: paymentMethodId
            }
        })

        if (response.status === 'success') {
            subscriptionData.value = response.data
            await fetchActiveSubscription()

            showPaymentModal.value = false
            showSuccessModal.value = true
        }
    } catch (error) {
        console.error('Error creating subscription:', error)
        alert('Failed to create subscription. Please try again.')
    } finally {
        paymentProcessing.value = false
    }
}

const closePaymentModal = () => {
    if (!paymentProcessing.value) {
        showPaymentModal.value = false
        selectedPackage.value = null
    }
}

const handleCancelSubscription = () => {
    console.log('handleCancelSubscription called', activeSubscription.value)
    if (!activeSubscription.value) {
        console.log('No active subscription')
        return
    }
    if (activeSubscription.value.status !== 'active') {
        console.log('Subscription status is not active:', activeSubscription.value.status)
        return
    }
    console.log('Opening cancel modal')
    showCancelModal.value = true
}

const confirmCancelSubscription = async () => {
    loading.value = true
    const params = {
        id: activeSubscription.value.id
    }
    try {
        const response = await $fetchCitizen('/v1/subscriptions/unsubscribe', {
            method: 'POST',
            params
        })

        if (response.status === 'success') {
            await fetchActiveSubscription()
            await fetchSubscriptionHistory()
            showCancelModal.value = false
            alert('Subscription cancelled successfully')
        } else {
            throw new Error(response.message || 'Failed to cancel subscription')
        }
    } catch (error) {
        console.error('Error canceling subscription:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel subscription. Please try again.'
        alert(errorMessage)
    } finally {
        loading.value = false
    }
}


const handleChangePassword = () => {
    showChangePasswordModal.value = true
}

const handlePasswordChangeSuccess = () => {
    console.log('Password changed successfully')

}

const handleProfileUpdated = (profileData) => {
    console.log('Profile updated:', profileData)

}

onMounted(async () => {

    await Promise.all([
        fetchActiveSubscription(),
        fetchPackages()
    ])
})
</script>

<template>
    <div class="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
        <!-- Header -->
        <div class="space-y-3 md:space-y-4">
            <h1 class="text-xl md:text-2xl font-semibold text-gray-900">Account Settings</h1>

            <!-- Tabs -->
            <div class="bg-gray-100 rounded-lg p-1.5 flex w-full max-w-full md:max-w-3xl overflow-x-auto">
                <button @click="switchTab('profile')"
                    class="flex-1 px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap"
                    :class="activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-900 hover:bg-gray-200'">
                    Profile
                </button>
                <button @click="switchTab('subscription')"
                    class="flex-1 px-3 md:px-5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                    :class="activeTab === 'subscription' ? 'bg-gray-900 text-white shadow-sm' : 'bg-transparent text-gray-900 hover:bg-gray-200'">
                    Subscription
                </button>
                <button @click="switchTab('billing')"
                    class="flex-1 px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap"
                    :class="activeTab === 'billing' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-900 hover:bg-gray-200'">
                    Billing
                </button>
                <button @click="switchTab('history')"
                    class="flex-1 px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap"
                    :class="activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-900 hover:bg-gray-200'">
                    History
                </button>
            </div>
        </div>

        <!-- Profile Tab Content -->
        <div v-show="activeTab === 'profile'" class="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <CommonCitizenProfileSettings user-role="Military" @change-password="handleChangePassword"
                @profile-updated="handleProfileUpdated" />
        </div>

        <!-- Subscription Tab Content -->
        <div v-show="activeTab === 'subscription'" class="space-y-4 md:space-y-6">

            <div v-if="loadingActiveSubscription" class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="animate-pulse flex space-x-4">
                    <div class="flex-1 space-y-3">
                        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>

            <div v-else class="space-y-2 md:space-y-3">
                <h2 class="text-lg md:text-2xl font-semibold text-gray-900">
                    Current Plan: {{ activeSubscription ? activeSubscription.package.title : 'No Active Subscription' }}
                </h2>

                <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 md:gap-3">
                    <div class="flex items-center gap-1">
                        <p class="text-xs md:text-sm font-medium text-gray-700">Billing cycle:</p>
                        <div class="bg-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                            <p class="text-xs font-medium text-gray-900">{{ billingCycle }}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1">
                        <p class="text-xs md:text-sm font-medium text-gray-700">Next billing:</p>
                        <div class="bg-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                            <p class="text-xs font-medium text-gray-900">{{ nextBilling }}</p>
                        </div>
                    </div>

                    <button v-if="activeSubscription?.status === 'active'" @click="handleCancelSubscription"
                        :disabled="loading"
                        class="sm:ml-auto text-xs md:text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ loading ? 'Processing...' : 'Cancel subscription' }}
                    </button>
                </div>
            </div>

            <!-- Comparison Table -->
            <div v-if="loadingPackages"
                class="bg-white border border-gray-200 rounded-lg p-8 flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p class="text-sm text-gray-600">Loading packages...</p>
                </div>
            </div>

            <div v-else-if="packages.length === 0" class="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-sm text-gray-600">No packages available at the moment.</p>
            </div>

            <div v-else class="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                <div class="min-w-[640px] lg:min-w-0">
                    <!-- Header Row -->
                    <div class="grid border-b border-gray-200"
                        :style="{ gridTemplateColumns: `minmax(200px, 2fr) repeat(${packages.length}, 1fr)` }">
                        <!-- Left Header -->
                        <div
                            class="border-r border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-5 h-[160px] md:h-[200px] lg:h-[218px] flex flex-col justify-center gap-2 md:gap-3">
                            <h3 class="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Compare plans</h3>
                            <p class="text-xs md:text-sm text-gray-700 leading-5">
                                Choose your plan according to your buying needs.
                            </p>
                        </div>

                        <!-- Package Headers -->
                        <div v-for="(pkg, index) in packages" :key="pkg.id" :class="[
                            'px-3 md:px-5 lg:px-7 py-4 md:py-6 lg:py-7 h-[160px] md:h-[200px] lg:h-[218px] flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-7',
                            index < packages.length - 1 ? 'border-r border-gray-200' : ''
                        ]">
                            <div class="flex flex-col items-center gap-1">
                                <div class="py-1">
                                    <p class="text-base md:text-lg lg:text-xl font-bold text-gray-900">{{ pkg.title }}
                                    </p>
                                </div>
                                <p class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                                    ${{ pkg.price }}<span
                                        class="text-sm md:text-base lg:text-lg font-normal text-gray-600">/{{
                                            pkg.duration_in_days }} days</span>
                                </p>
                            </div>

                            <button v-if="activeSubscription?.status === 'active' && currentPlan === pkg.id" disabled
                                class="w-full h-10 md:h-12 lg:h-13 bg-blue-500 text-white font-bold text-xs md:text-sm lg:text-base rounded-xl px-4 md:px-5 py-2 md:py-3 flex items-center justify-center gap-2 cursor-not-allowed">
                                <img :src="whiteCheckIcon" alt="" class="w-4 h-4 md:w-5 md:h-5" />
                                Current Plan
                            </button>
                            <button v-else @click="handleChoosePlan(pkg)"
                                :disabled="loading || paymentProcessing || activeSubscription?.status === 'active'"
                                :class="[
                                    'w-full h-10 md:h-12 lg:h-13 font-bold text-xs md:text-sm lg:text-base rounded-xl px-4 md:px-5 py-2 md:py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                                    index === packages.length - 1
                                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                ]">
                                {{ (loading || paymentProcessing) ? 'Processing...' : (currentPlan === pkg.id ?
                                    'Reactivate Plan' : 'Choose this Plan') }}
                            </button>
                        </div>
                    </div>

                    <!-- Feature Rows -->
                    <div v-for="feature in features" :key="feature.name" class="grid border-b border-gray-200"
                        :style="{ gridTemplateColumns: `minmax(200px, 2fr) repeat(${packages.length}, 1fr)` }">
                        <!-- Feature Name -->
                        <div
                            class="border-r border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-5 h-[64px] md:h-[80px] flex items-center">
                            <div>
                                <p
                                    class="text-xs md:text-sm lg:text-base font-medium text-gray-900 leading-tight md:leading-relaxed">
                                    {{ feature.name }}
                                </p>
                                <p v-if="feature.description" class="text-xs text-gray-500 mt-1">
                                    {{ feature.description }}
                                </p>
                            </div>
                        </div>

                        <!-- Package Checkmarks -->
                        <div v-for="(pkg, index) in packages" :key="pkg.id" :class="[
                            'h-[64px] md:h-[80px] flex items-center justify-center',
                            index < packages.length - 1 ? 'border-r border-gray-200' : ''
                        ]">
                            <img v-if="feature[`package_${pkg.id}`]" :src="checkIcon" alt="Included"
                                class="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Billing Tab Content -->
        <div v-show="activeTab === 'billing'" class="space-y-4">
            <h2 class="text-lg md:text-xl font-semibold text-gray-900">Billing History</h2>

            <div v-if="loadingBilling" class="bg-white border border-gray-200 rounded-lg p-8">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p class="text-sm text-gray-600">Loading billing history...</p>
                </div>
            </div>

            <div v-else-if="!billingHistory || billingHistory.length === 0"
                class="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-sm text-gray-600">No billing history found.</p>
            </div>

            <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="payment in billingHistory" :key="payment.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {{ payment.stripe_invoice_details?.invoice_number || 'N/A' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${{ payment.amount }} {{ payment.currency.toUpperCase() }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="[
                                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                                        payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    ]">
                                        {{ payment.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ new Date(payment.created_at).toLocaleDateString() }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <a v-if="payment.stripe_invoice_details?.invoice_pdf"
                                        :href="payment.stripe_invoice_details.invoice_pdf" target="_blank"
                                        class="text-blue-600 hover:text-blue-900 mr-3">
                                        Download PDF
                                    </a>
                                    <a v-if="payment.stripe_invoice_details?.hosted_invoice_url"
                                        :href="payment.stripe_invoice_details.hosted_invoice_url" target="_blank"
                                        class="text-blue-600 hover:text-blue-900">
                                        View Invoice
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


        <div v-show="activeTab === 'history'" class="space-y-4">
            <h2 class="text-lg md:text-xl font-semibold text-gray-900">Subscription History</h2>

            <div v-if="loadingHistory" class="bg-white border border-gray-200 rounded-lg p-8">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p class="text-sm text-gray-600">Loading subscription history...</p>
                </div>
            </div>

            <div v-else-if="!subscriptionHistory || subscriptionHistory.length === 0"
                class="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p class="text-sm text-gray-600">No subscription history found.</p>
            </div>

            <div v-else class="space-y-4">
                <div v-for="subscription in subscriptionHistory" :key="subscription.id"
                    class="bg-white border border-gray-200 rounded-lg p-6">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-lg font-semibold text-gray-900">{{ subscription.package.title }}</h3>
                                <span :class="[
                                    'px-3 py-1 text-xs font-semibold rounded-full',
                                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                        subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                ]">
                                    {{ subscription.status }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">${{ subscription.package.price }} / {{
                                subscription.package.duration_in_days }} days</p>
                            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div>
                                    <span class="font-medium">Period:</span>
                                    {{ new Date(subscription.current_period_start).toLocaleDateString() }} -
                                    {{ new Date(subscription.current_period_end).toLocaleDateString() }}
                                </div>
                                <div>
                                    <span class="font-medium">Created:</span>
                                    {{ new Date(subscription.created_at).toLocaleDateString() }}
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-gray-500">Subscription ID</p>
                            <p class="text-sm font-mono text-gray-700">{{ subscription.id }}</p>
                        </div>
                    </div>


                    <div v-if="subscription.package.details?.length" class="mt-4 pt-4 border-t border-gray-200">
                        <p class="text-sm font-medium text-gray-700 mb-2">Features:</p>
                        <ul class="space-y-1">
                            <li v-for="detail in subscription.package.details" :key="detail.id"
                                class="text-sm text-gray-600 flex items-start">
                                <img :src="checkIcon" alt="" class="w-4 h-4 mr-2 mt-0.5" />
                                <span>{{ detail.detail_title }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>


        <CommonCitizenChangePasswordModal :is-open="showChangePasswordModal" @close="showChangePasswordModal = false"
            @success="handlePasswordChangeSuccess" />


        <CommonCitizenStripePaymentModal :is-open="showPaymentModal" :package-info="selectedPackage"
            :processing="paymentProcessing" @close="closePaymentModal" @success="handlePaymentSuccess" />


        <CommonCitizenSubscriptionSuccessModal :is-open="showSuccessModal" :subscription-data="subscriptionData"
            @close="showSuccessModal = false" />


        <ConfirmModal :isOpenConModal="showCancelModal" title="Cancel Subscription"
            message="Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."
            @update:isOpenConModal="showCancelModal = $event" @confirm="confirmCancelSubscription" />
    </div>
</template>

<style scoped></style>