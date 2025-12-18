<script setup>
import { loadStripe } from '@stripe/stripe-js'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    packageInfo: {
        type: Object,
        default: null
    },
    processing: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'success'])

const config = useRuntimeConfig()
const stripe = ref(null)
const cardElement = ref(null)
const cardError = ref('')
const cardComplete = ref(false)


const initializeStripe = async () => {
    try {
        stripe.value = await loadStripe(config.public.STRIPE_PUBLISHABLE_KEY)

        if (!stripe.value) {
            throw new Error('Failed to load Stripe')
        }

        const elements = stripe.value.elements()
        cardElement.value = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        })

        cardElement.value.mount('#card-element')

        cardElement.value.on('change', (event) => {
            cardError.value = event.error ? event.error.message : ''
            cardComplete.value = event.complete
        })
    } catch (error) {
        console.error('Error initializing Stripe:', error)
        cardError.value = 'Failed to initialize payment system. Please refresh the page.'
    }
}

const handleSubmit = async () => {
    if (!stripe.value || !cardElement.value) {
        cardError.value = 'Payment system not ready. Please try again.'
        return
    }

    try {
        const { error, paymentMethod } = await stripe.value.createPaymentMethod({
            type: 'card',
            card: cardElement.value,
        })

        if (error) {
            cardError.value = error.message
        } else {
            emit('success', paymentMethod.id)
        }
    } catch (error) {
        console.error('Payment error:', error)
        cardError.value = 'An error occurred. Please try again.'
    }
}

const handleClose = () => {
    if (!props.processing) {
        emit('close')
    }
}

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        nextTick(() => {
            initializeStripe()
        })
    } else {

        if (cardElement.value) {
            cardElement.value.destroy()
            cardElement.value = null
        }
        cardError.value = ''
        cardComplete.value = false
    }
})
</script>




<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
            <!-- Overlay -->
            <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="handleClose"></div>

            <!-- Modal -->
            <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8 z-10">

                <button v-if="!processing" @click="handleClose"
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>


                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
                    <p class="text-sm text-gray-600">
                        Subscribe to {{ packageInfo?.title }}
                    </p>
                    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-700 font-medium">Total Amount:</span>
                            <span class="text-2xl font-bold text-gray-900">${{ packageInfo?.price }}</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">
                            Billed every {{ packageInfo?.duration_in_days }} days
                        </p>
                    </div>
                </div>


                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Card Information
                    </label>
                    <div id="card-element"
                        class="p-3 border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    </div>
                    <div v-if="cardError" class="mt-2 text-sm text-red-600">
                        {{ cardError }}
                    </div>
                </div>


                <button @click="handleSubmit" :disabled="processing || !cardComplete"
                    class="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <span v-if="!processing">Pay ${{ packageInfo?.price }}</span>
                    <span v-else class="flex items-center gap-2">
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Processing...
                    </span>
                </button>


                <div class="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clip-rule="evenodd" />
                    </svg>
                    Secured by Stripe
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped>
#card-element {
    min-height: 40px;
}
</style>
