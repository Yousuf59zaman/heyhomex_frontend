<script setup>
useHead({ title: "Subscription - Advertiser Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "advertiser" })

// Tab Management
const activeTab = ref('subscription')
const completedTabs = ref(new Set(['subscription'])) // Track which tabs have been visited

const switchTab = (tab) => {
    activeTab.value = tab
    completedTabs.value.add(tab)
    
    // TODO: Load tab-specific data when APIs are ready
    if (tab === 'profile') {
        // TODO: Fetch user profile data
    } else if (tab === 'billing') {
        // TODO: Fetch billing history
    }
}

const isTabCompleted = (tab) => {
    return completedTabs.value.has(tab)
}

// Subscription State
const loading = ref(false)
const currentPlan = ref('free') // 'free' or 'premium'
const billingCycle = ref('Free')
const nextBilling = ref('Free')

// Change Password Modal State
const showChangePasswordModal = ref(false)

// Icons as data URIs
const checkIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M16.6668 5L7.50016 14.1667L3.3335 10' stroke='%23121A22' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
const limitedCheckIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M16.6668 5L7.50016 14.1667L3.3335 10' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
const whiteCheckIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M16.6668 5L7.50016 14.1667L3.3335 10' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"

// Features list (will come from API in future)
const features = [
    { name: 'Basic Ad Campaign Management', free: true, premium: true },
    { name: 'Standard Analytics Dashboard', free: true, premium: true },
    { name: 'Click & Impression Tracking', free: true, premium: true },
    { name: 'Basic Targeting Options', free: true, premium: true },
    { name: 'Advanced Analytics & Insights', free: false, premium: true },
    { name: 'A/B Testing Tools', free: false, premium: true },
    { name: 'Custom Audience Targeting', free: false, premium: true },
    { name: 'Priority Ad Placement', free: false, premium: true },
    { name: 'Dedicated Account Manager', free: false, premium: true },
    { name: 'Advanced Reporting & ROI Tracking', free: false, premium: true },
]

// Plan Management
const handleChoosePlan = async (plan) => {
    if (loading.value) return
    
    loading.value = true
    try {
        console.log('Selected plan:', plan)
        // TODO: Call payment API
        // const response = await $fetchCitizen('/subscription/upgrade', {
        //     method: 'POST',
        //     body: { plan }
        // })
        // if (response.success) {
        //     currentPlan.value = plan
        //     // Show success modal or redirect to payment gateway
        // }
    } catch (error) {
        console.error('Error choosing plan:', error)
        // TODO: Show error modal
    } finally {
        loading.value = false
    }
}

const handleCancelSubscription = async () => {
    if (currentPlan.value === 'free') return
    
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    
    loading.value = true
    try {
        console.log('Cancel subscription')
        // TODO: Call cancel subscription API
        // const response = await $fetchCitizen('/subscription/cancel', {
        //     method: 'POST'
        // })
        // if (response.success) {
        //     currentPlan.value = 'free'
        //     billingCycle.value = 'Free'
        //     nextBilling.value = 'Free'
        // }
    } catch (error) {
        console.error('Error canceling subscription:', error)
        // TODO: Show error modal
    } finally {
        loading.value = false
    }
}

// Handle change password
const handleChangePassword = () => {
    showChangePasswordModal.value = true
}

const handlePasswordChangeSuccess = () => {
    console.log('Password changed successfully')
    // TODO: Handle any additional actions after password change
}

const handleProfileUpdated = (profileData) => {
    console.log('Profile updated:', profileData)
    // TODO: Handle any additional actions after profile update
}

// Lifecycle - Fetch current plan on mount
onMounted(async () => {
    // TODO: Fetch current subscription status from API
    // const response = await $fetchCitizen('/subscription/status')
    // currentPlan.value = response.plan
    // billingCycle.value = response.billingCycle
    // nextBilling.value = response.nextBilling
})
</script>

<template>
    <div class="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
        <!-- Header -->
        <div class="space-y-3 md:space-y-4">
            <h1 class="text-xl md:text-2xl font-semibold text-gray-900">Account Settings</h1>
            
            <!-- Tabs -->
            <div class="bg-gray-100 rounded-lg p-1.5 flex w-full max-w-full md:max-w-xl">
                <button
                    @click="switchTab('profile')"
                    class="flex-1 px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200"
                    :class="activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-900 hover:bg-gray-200'">
                    Profile
                </button>
                <button
                    @click="switchTab('subscription')"
                    class="flex-1 px-3 md:px-5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200"
                    :class="activeTab === 'subscription' ? 'bg-gray-900 text-white shadow-sm' : 'bg-transparent text-gray-900 hover:bg-gray-200'">
                    Subscription
                </button>
                <button
                    @click="switchTab('billing')"
                    class="flex-1 px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200"
                    :class="activeTab === 'billing' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-900 hover:bg-gray-200'">
                    Billing
                </button>
            </div>
        </div>

        <!-- Profile Tab Content -->
        <div v-show="activeTab === 'profile'" class="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <CommonCitizenProfileSettings 
                user-role="Advertiser"
                @change-password="handleChangePassword"
                @profile-updated="handleProfileUpdated"
            />
        </div>

        <!-- Subscription Tab Content -->
        <div v-show="activeTab === 'subscription'" class="space-y-4 md:space-y-6">
            <!-- Current Plan Section -->
            <div class="space-y-2 md:space-y-3">
                <h2 class="text-lg md:text-2xl font-semibold text-gray-900">
                    Current Plan: {{ currentPlan === 'free' ? 'Free' : 'Premium' }}
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
                    
                    <button
                        v-if="currentPlan !== 'free'"
                        @click="handleCancelSubscription"
                        :disabled="loading"
                        class="sm:ml-auto text-xs md:text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ loading ? 'Processing...' : 'Cancel subscription' }}
                    </button>
                </div>
            </div>

            <!-- Comparison Table -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                <div class="min-w-[640px] lg:min-w-0">
                    <!-- Header Row -->
                    <div class="grid grid-cols-[minmax(200px,2fr)_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr] border-b border-gray-200">
                        <!-- Left Header -->
                        <div class="border-r border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-5 h-[160px] md:h-[200px] lg:h-[218px] flex flex-col justify-center gap-2 md:gap-3">
                            <h3 class="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Compare plans</h3>
                            <p class="text-xs md:text-sm text-gray-700 leading-5">
                                Choose your plan according to your advertising needs.
                            </p>
                        </div>
                        
                        <!-- Free Plan Header -->
                        <div class="border-r border-gray-200 px-3 md:px-5 lg:px-7 py-4 md:py-6 lg:py-7 h-[160px] md:h-[200px] lg:h-[218px] flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-7">
                            <div class="flex flex-col items-center gap-1">
                                <div class="py-1">
                                    <p class="text-base md:text-lg lg:text-xl font-bold text-gray-900">Free</p>
                                </div>
                                <p class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                                    $0<span class="text-sm md:text-base lg:text-lg font-normal text-gray-600">/month</span>
                                </p>
                            </div>
                            
                            <button
                                v-if="currentPlan === 'free'"
                                disabled
                                class="w-full h-10 md:h-12 lg:h-13 bg-indigo-900 text-white font-bold text-xs md:text-sm lg:text-base rounded-xl px-4 md:px-5 py-2 md:py-3 flex items-center justify-center gap-2 cursor-not-allowed">
                                <img :src="whiteCheckIcon" alt="" class="w-4 h-4 md:w-5 md:h-5" />
                                Current Plan
                            </button>
                            <button
                                v-else
                                @click="handleChoosePlan('free')"
                                :disabled="loading"
                                class="w-full h-10 md:h-12 lg:h-13 bg-gray-100 text-gray-900 font-bold text-xs md:text-sm lg:text-base rounded-xl px-4 md:px-5 py-2 md:py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ loading ? 'Processing...' : 'Downgrade' }}
                            </button>
                        </div>
                        
                        <!-- Premium Plan Header -->
                        <div class="px-3 md:px-5 lg:px-7 py-4 md:py-6 lg:py-7 h-[160px] md:h-[200px] lg:h-[218px] flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-7">
                            <div class="flex flex-col items-center gap-1">
                                <div class="py-1">
                                    <p class="text-base md:text-lg lg:text-xl font-bold text-gray-900">Premium</p>
                                </div>
                                <p class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                                    $50<span class="text-sm md:text-base lg:text-lg font-normal text-gray-600">/month</span>
                                </p>
                            </div>
                            
                            <button
                                v-if="currentPlan === 'premium'"
                                disabled
                                class="w-full h-10 md:h-12 lg:h-13 bg-indigo-900 text-white font-bold text-xs md:text-sm lg:text-base rounded-xl px-4 md:px-5 py-2 md:py-3 flex items-center justify-center gap-2 cursor-not-allowed">
                                <img :src="whiteCheckIcon" alt="" class="w-4 h-4 md:w-5 md:h-5" />
                                Current Plan
                            </button>
                            <button
                                v-else
                                @click="handleChoosePlan('premium')"
                                :disabled="loading"
                                class="w-full h-10 md:h-12 lg:h-13 bg-gray-900 text-white font-bold text-xs md:text-sm lg:text-base rounded-xl px-4 md:px-5 py-2 md:py-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ loading ? 'Processing...' : 'Choose this Plan' }}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Feature Rows -->
                    <div
                        v-for="feature in features"
                        :key="feature.name"
                        class="grid grid-cols-[minmax(200px,2fr)_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr] border-b border-gray-200">
                        <!-- Feature Name -->
                        <div class="border-r border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-5 h-[64px] md:h-[80px] flex items-center">
                            <p class="text-xs md:text-sm lg:text-base font-medium text-gray-900 leading-tight md:leading-relaxed">
                                {{ feature.name }}
                            </p>
                        </div>
                        
                        <!-- Free Plan Checkmark -->
                        <div class="border-r border-gray-200 h-[64px] md:h-[80px] flex items-center justify-center">
                            <img
                                v-if="feature.free"
                                :src="checkIcon"
                                alt="Included"
                                class="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        
                        <!-- Premium Plan Checkmark -->
                        <div class="h-[64px] md:h-[80px] flex items-center justify-center">
                            <img
                                v-if="feature.premium"
                                :src="checkIcon"
                                alt="Included"
                                class="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Billing Tab Content -->
        <div v-show="activeTab === 'billing'" class="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <LazyCommonCitizenBillingHistory v-if="isTabCompleted('billing')" />
        </div>

        <!-- Change Password Modal -->
        <CommonCitizenChangePasswordModal 
            :is-open="showChangePasswordModal"
            @close="showChangePasswordModal = false"
            @success="handlePasswordChangeSuccess"
        />
    </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
