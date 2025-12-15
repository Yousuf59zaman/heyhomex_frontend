<script setup>
useHead({ title: 'Payment - Kamaina Panel' })
definePageMeta({ middleware: ['auth-citizen'], layout: 'citizen' })

const {citizen_user} = citizenAuth()
const router = useRouter()
const route = useRoute()

const isAuthenticated = computed(() => {
    return citizen_user.value && Object.keys(citizen_user.value).length > 0
})

const gateWays = ref([
    {
        id: 1,
        name: 'Stripe',
        gateway: 'stripe',
        icon: '/images/stripe.png',
        description: 'Secure and reliable payment processing.',
        isActive: true
    },
    {
        id: 2,
        name: 'SSLCOMMERZ',
        gateway: 'sslcommerz',
        icon: '/images/sslcommerz.png',
        description: 'Popular payment gateway in Bangladesh.',
        isActive: true
    }
])

const planData = ref(null)
const availablePrices = ref([])
const selectedBillingCycle = ref('monthly')
const isLoadingPlan = ref(false)
const selectedCurrency = ref(route.query.currency || 'USD')

const availableGateways = computed(() => {
    if (selectedCurrency.value === 'BDT') {
        return gateWays.value.filter(g => g.gateway === 'sslcommerz' && g.isActive)
    } else {
        return gateWays.value.filter(g => g.gateway === 'stripe' && g.isActive)
    }
})

// Static plan data (matching subscription page)
const loadPlanData = async (currency = 'USD') => {
    try {
        isLoadingPlan.value = true
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const staticPlans = [
            {
                id: 1,
                name: 'Basic',
                description: 'Perfect for getting started',
                prices: [
                    {
                        id: 1,
                        billing_cycle: 'monthly',
                        price: 299,
                        original_price: 399,
                        discount: 100,
                        final_price: 299,
                        original_final_price: 29.99,
                        original_price_usd: 39.99,
                        original_discount: 10
                    },
                    {
                        id: 2,
                        billing_cycle: 'yearly',
                        price: 2590,
                        original_price: 3590,
                        discount: 1000,
                        final_price: 2590,
                        original_final_price: 259.00,
                        original_price_usd: 359.00,
                        original_discount: 100
                    }
                ],
                feature_items: [
                    { feature: 'Property Listings', description: 'Up to 10' },
                    { feature: 'Video Access', description: 'Limited' },
                    { feature: 'Search Filters', description: 'Basic' },
                    { feature: 'Support', description: 'Email' }
                ]
            },
            {
                id: 2,
                name: 'Pro',
                description: 'Most popular choice',
                prices: [
                    {
                        id: 3,
                        billing_cycle: 'monthly',
                        price: 599,
                        original_price: 799,
                        discount: 200,
                        final_price: 599,
                        original_final_price: 59.99,
                        original_price_usd: 79.99,
                        original_discount: 20
                    },
                    {
                        id: 4,
                        billing_cycle: 'yearly',
                        price: 5190,
                        original_price: 7190,
                        discount: 2000,
                        final_price: 5190,
                        original_final_price: 519.00,
                        original_price_usd: 719.00,
                        original_discount: 200
                    }
                ]
            },
            {
                id: 3,
                name: 'Enterprise',
                description: 'For power users',
                prices: [
                    {
                        id: 5,
                        billing_cycle: 'monthly',
                        price: 999,
                        original_price: 1299,
                        discount: 300,
                        final_price: 999,
                        original_final_price: 99.99,
                        original_price_usd: 129.99,
                        original_discount: 30
                    },
                    {
                        id: 6,
                        billing_cycle: 'yearly',
                        price: 8630,
                        original_price: 11630,
                        discount: 3000,
                        final_price: 8630,
                        original_final_price: 863.00,
                        original_price_usd: 1163.00,
                        original_discount: 300
                    }
                ]
            }
        ]
        
        const planId = route.query['plan-id'] || route.query.planId
        if (planId) {
            const selectedPlan = staticPlans.find(plan => plan.id == planId)
            if (selectedPlan) {
                planData.value = selectedPlan
                availablePrices.value = selectedPlan.prices || []
                
                if (availablePrices.value.length > 0) {
                    const monthlyPrice = availablePrices.value.find(p => p.billing_cycle === 'monthly')
                    const defaultPrice = monthlyPrice || availablePrices.value[0]
                    
                    selectedBillingCycle.value = defaultPrice.billing_cycle
                    paymentData.value = {
                        ...paymentData.value,
                        amount: currency === 'USD' ? parseFloat(defaultPrice.original_final_price) : parseFloat(defaultPrice.final_price),
                        plan_id: parseInt(planId),
                        billing_cycle: defaultPrice.billing_cycle,
                        price_id: defaultPrice.id,
                        currency: currency
                    }
                }
            }
        }
    } catch (e) {
        console.log('Get Plan Data Error:', e.message)
    } finally {
        isLoadingPlan.value = false
    }
}

const changeBillingCycle = (cycle) => {
    selectedBillingCycle.value = cycle
    const selectedPrice = availablePrices.value.find(p => p.billing_cycle === cycle)
    if (selectedPrice) {
        const amount = selectedCurrency.value === 'USD' ? parseFloat(selectedPrice.original_final_price) : parseFloat(selectedPrice.final_price)
        paymentData.value = {
            ...paymentData.value,
            amount: amount,
            billing_cycle: selectedPrice.billing_cycle,
            price_id: selectedPrice.id
        }
    }
}

onMounted(() => {
    const planId = route.query['plan-id'] || route.query.planId
    if (planId) {
        const urlCurrency = route.query.currency || 'USD'
        selectedCurrency.value = urlCurrency
        
        if (urlCurrency === 'BDT') {
            selectedGateway.value = 'sslcommerz'
        } else {
            selectedGateway.value = 'stripe'
        }
        
        loadPlanData(urlCurrency)
    }
})

const isLoading = ref(false)
const selectedGateway = ref('stripe')
const paymentData = ref({
    amount: null,
    currency: 'USD',
    gateway: 'stripe',
    plan_id: null,
    billing_cycle: 'monthly',
})

const paymentError = ref('')
const paymentSuccess = ref('')
const showPaymentForm = ref(false)
const paymentResponse = ref(null)
const isPaymentProcessing = ref(false)

const getCurrentPrice = () => {
    return availablePrices.value.find(p => p.billing_cycle === selectedBillingCycle.value)
}

const getCurrencySymbol = () => {
    return selectedCurrency.value === 'USD' ? '$' : '৳'
}

const getDisplayPrice = (price) => {
    return selectedCurrency.value === 'USD' ? price.original_final_price : price.final_price
}

const getOriginalPrice = (price) => {
    return selectedCurrency.value === 'USD' ? price.original_price_usd : price.original_price
}

const getDiscountAmount = (price) => {
    return selectedCurrency.value === 'USD' ? price.original_discount : price.discount
}

const processPayment = async () => {
    isLoading.value = true
    paymentError.value = ''
    paymentSuccess.value = ''
    
    try {
        paymentData.value.gateway = selectedGateway.value
        paymentData.value.currency = selectedCurrency.value
        
        // Simulated payment processing - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // For demo purposes, show success and redirect
        paymentSuccess.value = 'Payment initiated successfully! Redirecting...'
        
        setTimeout(() => {
            router.push('/kamaina')
        }, 2000)
        
    } catch (e) {
        paymentError.value = 'Payment failed. Please check your connection and try again.'
        console.log('Payment Error:', e.message)
    } finally {
        isLoading.value = false
    }
}

const selectGateway = (gateway) => {
    selectedGateway.value = gateway
    showPaymentForm.value = false
    paymentResponse.value = null
    paymentError.value = ''
    paymentSuccess.value = ''
    isPaymentProcessing.value = false
}
</script>

<template>
    <!-- No Plan Selected Message -->
    <div v-if="!route.query['plan-id'] && !route.query.planId"
        class="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4">
        <div class="max-w-md mx-auto text-center">
            <div class="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="lucide:alert-triangle" class="text-red-600 text-3xl" />
                </div>

                <h1 class="text-3xl font-bold text-gray-800 mb-4">No Plan Selected</h1>

                <p class="text-gray-600 text-lg mb-6">
                    Please select a subscription plan before proceeding to payment.
                </p>

                <div class="space-y-4">
                    <button @click="router.push('/kamaina/subscription')"
                        class="w-full px-6 py-3 text-white rounded-lg font-medium transition-all"
                        style="background: linear-gradient(123deg, #FF6666 10%, #FF4444 90%)">
                        <Icon name="lucide:list" class="inline-block mr-2" />
                        View Plans & Pricing
                    </button>
                    
                    <button @click="router.push('/kamaina')"
                        class="w-full text-gray-600 hover:text-gray-800 font-medium py-3 transition-colors">
                        <Icon name="lucide:home" class="inline-block mr-2" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment UI -->
    <div v-else class="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-12 px-4">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">Payment</h1>
                    <p class="text-gray-600 text-lg">Complete your subscription</p>
                </div>
                <NuxtLink to="/kamaina/subscription" class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    <Icon name="lucide:arrow-left" class="w-4 h-4" />
                    Back to Plans
                </NuxtLink>
            </div>

            <!-- Payment Summary Card -->
            <div v-if="!isLoadingPlan" class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                <div class="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-white mb-1">Payment Summary</h2>
                            <p class="text-red-100 text-sm">Review your subscription details</p>
                        </div>
                        <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="lucide:receipt" class="text-white text-xl" />
                        </div>
                    </div>
                </div>

                <div class="p-8">
                    <!-- Plan Information -->
                    <div v-if="planData" class="mb-8">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Icon name="lucide:star" class="text-red-600 text-lg" />
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">{{ planData.name }}</h3>
                                <p class="text-gray-600 text-sm">{{ planData.description }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Billing Cycle Selection -->
                    <div v-if="availablePrices.length > 1 && !showPaymentForm" class="mb-8">
                        <div class="flex items-center gap-2 mb-4">
                            <Icon name="lucide:calendar" class="text-red-600" />
                            <h4 class="text-lg font-semibold text-gray-800">Choose Billing Cycle</h4>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <button
                                v-for="price in availablePrices"
                                :key="price.id"
                                @click="changeBillingCycle(price.billing_cycle)"
                                :class="[
                                    'flex-1 p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg',
                                    selectedBillingCycle === price.billing_cycle
                                        ? 'border-red-500 bg-red-50 shadow-lg transform scale-105'
                                        : 'border-gray-200 hover:border-red-300 bg-white hover:bg-gray-50'
                                ]"
                            >
                                <div class="text-center">
                                    <div class="flex items-center justify-center gap-2 mb-2">
                                        <Icon :class="[
                                            'text-lg',
                                            selectedBillingCycle === price.billing_cycle ? 'text-red-600' : 'text-gray-400'
                                        ]" name="lucide:clock" />
                                        <span :class="[
                                            'font-semibold text-lg capitalize',
                                            selectedBillingCycle === price.billing_cycle ? 'text-red-700' : 'text-gray-700'
                                        ]">{{ price.billing_cycle }}</span>
                                    </div>
                                    <div class="mb-2">
                                        <span class="text-gray-500 line-through text-sm">{{ getCurrencySymbol() }}{{ getOriginalPrice(price) }}</span>
                                        <span :class="[
                                            'ml-2 font-bold text-xl',
                                            selectedBillingCycle === price.billing_cycle ? 'text-red-600' : 'text-gray-800'
                                        ]">{{ getCurrencySymbol() }}{{ getDisplayPrice(price) }}</span>
                                    </div>
                                    <div v-if="getDiscountAmount(price) > 0" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Icon name="lucide:tag" class="mr-1" />
                                        Save {{ getCurrencySymbol() }}{{ getDiscountAmount(price) }}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Price Display -->
                    <div class="mb-6">
                        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm mb-1">Total Amount</p>
                                    <div class="flex items-baseline gap-2">
                                        <span v-if="getCurrentPrice() && getOriginalPrice(getCurrentPrice()) !== getDisplayPrice(getCurrentPrice())" 
                                              class="text-lg text-gray-500 line-through">{{ getCurrencySymbol() }}{{ getOriginalPrice(getCurrentPrice()) }}</span>
                                        <span class="text-4xl font-bold text-gray-800">{{ getCurrencySymbol() }}{{ paymentData.amount }}</span>
                                        <span class="text-gray-600 text-lg">{{ selectedCurrency }}</span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 font-medium">
                                        <Icon name="lucide:refresh-cw" class="mr-2" />
                                        {{ paymentData.billing_cycle }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Discount Badge -->
                    <div v-if="getCurrentPrice() && getDiscountAmount(getCurrentPrice()) > 0" class="text-center mb-6">
                        <div class="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg">
                            <Icon name="lucide:check-circle" class="mr-2" />
                            You're saving {{ getCurrencySymbol() }}{{ getDiscountAmount(getCurrentPrice()) }}!
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="isLoadingPlan" class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 p-8">
                <div class="animate-pulse space-y-4">
                    <div class="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div class="h-20 bg-gray-200 rounded"></div>
                    <div class="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>

            <!-- Payment Gateways -->
            <div v-if="!isLoadingPlan" class="bg-white rounded-2xl shadow-lg p-8">
                <div v-if="!showPaymentForm">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Select Payment Gateway</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div v-for="gateway in availableGateways" :key="gateway.id"
                            @click="selectGateway(gateway.gateway)"
                            :class="[
                                'flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg',
                                selectedGateway === gateway.gateway ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            ]">
                            <div class="flex-shrink-0 mr-4">
                                <div class="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center">
                                    <img :src="gateway.icon" alt="Gateway Icon" class="w-full p-1" />
                                </div>
                            </div>
                            <div class="flex-1">
                                <h4 class="text-lg font-semibold text-gray-800 mb-1">{{ gateway.name }}</h4>
                                <p class="text-gray-600 text-sm">{{ gateway.description }}</p>
                            </div>
                            <div class="flex-shrink-0 ml-4">
                                <div :class="[
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                    selectedGateway === gateway.gateway ? 'border-red-600' : 'border-gray-300'
                                ]">
                                    <div v-if="selectedGateway === gateway.gateway"
                                        class="w-3 h-3 bg-red-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Currency Info -->
                    <div v-if="selectedCurrency === 'BDT'" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div class="flex items-center">
                            <Icon name="lucide:info" class="text-blue-600 mr-2" />
                            <p class="text-blue-800 text-sm">
                                <strong>BDT Payment:</strong> SSLCOMMERZ is the recommended payment gateway for Bangladeshi Taka transactions.
                            </p>
                        </div>
                    </div>
                    
                    <div v-else class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div class="flex items-center">
                            <Icon name="lucide:info" class="text-green-600 mr-2" />
                            <p class="text-green-800 text-sm">
                                <strong>USD Payment:</strong> Stripe provides secure international payment processing.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Payment Button -->
                <div v-if="!showPaymentForm" class="text-center">
                    <button 
                        @click="processPayment" 
                        :disabled="isLoading || isLoadingPlan || (!planData && route.query['plan-id'])" 
                        class="px-8 py-4 text-white text-lg font-semibold rounded-lg transition-all disabled:opacity-50"
                        style="background: linear-gradient(123deg, #FF6666 10%, #FF4444 90%)"
                    >
                        <div v-if="isLoading" class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Processing...
                        </div>
                        <div v-else class="flex items-center justify-center">
                            <Icon name="lucide:credit-card" class="mr-2" />
                            Pay {{ getCurrencySymbol() }}{{ paymentData.amount }} - {{ paymentData.billing_cycle }}
                        </div>
                    </button>
                </div>

                <!-- Success Message -->
                <div v-if="paymentSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center">
                        <Icon name="lucide:check-circle" class="text-green-600 mr-2" />
                        <p class="text-green-800 text-sm">{{ paymentSuccess }}</p>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="paymentError" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div class="flex items-center">
                        <Icon name="lucide:alert-triangle" class="text-red-600 mr-2" />
                        <p class="text-red-800 text-sm">{{ paymentError }}</p>
                    </div>
                </div>

                <!-- Security Notice -->
                <div class="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center">
                        <Icon name="lucide:shield" class="text-green-600 mr-2" />
                        <p class="text-green-800 text-sm">
                            <strong>Secure Payment:</strong> Your payment information is encrypted and secure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
