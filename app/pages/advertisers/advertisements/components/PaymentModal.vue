<script setup>
import { loadStripe } from '@stripe/stripe-js'

const props = defineProps({
    isOpenModal: {
        type: Boolean,
        default: false
    },
    advertisement: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);

const config = useRuntimeConfig();

const visible = computed({
    get: () => props.isOpenModal,
    set: (value) => {
        if (!value) emit('close');
    }
});

const form = ref({
    amount: ''
});

const errors = ref({});
const isLoading = ref(false);
const response_modal = ref({});

// Stripe integration
const stripe = ref(null);
const cardElement = ref(null);
const cardError = ref('');
const cardComplete = ref(false);

const initializeStripe = async () => {
    try {
        stripe.value = await loadStripe(config.public.STRIPE_PUBLISHABLE_KEY);

        if (!stripe.value) {
            throw new Error('Failed to load Stripe');
        }

        const elements = stripe.value.elements();
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
        });

        cardElement.value.mount('#card-element');

        cardElement.value.on('change', (event) => {
            cardError.value = event.error ? event.error.message : '';
            cardComplete.value = event.complete;
        });
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        cardError.value = 'Failed to initialize payment system. Please refresh the page.';
    }
};

const submitHandler = async () => {
    if (!stripe.value || !cardElement.value) {
        cardError.value = 'Payment system not ready. Please try again.';
        return;
    }

    if (!form.value.amount || parseFloat(form.value.amount) < 1) {
        errors.value.amount = ['Amount must be at least $1.00'];
        return;
    }

    isLoading.value = true;
    errors.value = {};
    response_modal.value = {};
    cardError.value = '';

    try {

        const { error, paymentMethod } = await stripe.value.createPaymentMethod({
            type: 'card',
            card: cardElement.value,
        });

        if (error) {
            cardError.value = error.message;
            isLoading.value = false;
            return;
        }


        const response = await $fetchCitizen('advertiser/advertisements/deposit', {
            method: 'POST',
            body: {
                advertisement_id: props.advertisement.id,
                amount: parseFloat(form.value.amount),
                payment_method_id: paymentMethod.id // Stripe payment method token
            }
        });

        if (response.status === 'success') {
            response_modal.value = response;
            setTimeout(() => {
                emit('close');
            }, 2000);
        }
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response._data.errors || {};
        } else {
            response_modal.value = {
                status: 'error',
                message: e.response?._data?.message || 'Payment failed. Please try again.'
            };
        }
        console.error('Error:', e.message);
    } finally {
        isLoading.value = false;
    }
};

const cancel = () => {
    emit('close');
};

watch(() => props.isOpenModal, (newVal) => {
    if (newVal) {
        nextTick(() => {
            initializeStripe();
        });
    } else {

        if (cardElement.value) {
            cardElement.value.destroy();
            cardElement.value = null;
        }
        cardError.value = '';
        cardComplete.value = false;
        errors.value = {};
        form.value.amount = '';
    }
});
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '40rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">Add Payment</h4>
            </div>
        </template>

        <div class="mb-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Advertisement: <strong>{{ advertisement.title }}</strong>
            </p>
            <div class="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Current Balance:</span>
                    <span class="text-lg font-bold text-blue-900 dark:text-blue-200">
                        ${{ parseFloat(advertisement.remaining_balance || 0).toFixed(2) }}
                    </span>
                </div>
            </div>
        </div>

        <form @submit.prevent="submitHandler" class="grid grid-cols-1 gap-4">
            <!-- Amount -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Amount to Add</label>
                    <div class="relative">
                        <span
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                        <InputText v-model="form.amount" type="number" step="0.01" min="1" class="w-full pl-7"
                            placeholder="0.00" :class="errors.amount ? 'border-[#f44336!important]' : ''"
                            @focus="errors.amount = ''" />
                    </div>
                    <InputError class="text-sm mt-1" v-if="errors.amount" :message="errors.amount[0]" />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum amount: $1.00</p>
                </div>
            </div>

            <!-- Stripe Card Element -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Card Information</label>
                    <div id="card-element"
                        class="p-3 border border-gray-300 dark:border-gray-600 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    </div>
                    <div v-if="cardError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                        {{ cardError }}
                    </div>
                    <div class="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <i class="pi pi-lock"></i>
                        Secured by Stripe
                    </div>
                </div>
            </div>

            <!-- Info -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-4 border border-gray-200 dark:border-gray-700">
                <div class="flex gap-2">
                    <i class="pi pi-info-circle text-gray-400 mt-0.5"></i>
                    <div>
                        <h3 class="text-sm font-medium text-gray-800 dark:text-gray-300">Payment Information</h3>
                        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <ul class="list-disc pl-5 space-y-1">
                                <li>Funds will be added immediately to your advertisement balance</li>
                                <li>CPC: ${{ advertisement.cpc }} per click</li>
                                <li>CPM: ${{ advertisement.cpm }} per 1000 impressions</li>
                                <li>Secure payment processing via Stripe</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        <template #footer class="flex justify-end gap-2 border-gray-200">
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <Button v-if="isLoading" severity="secondary" style="cursor: not-allowed; width: 80px;">
                    <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8" animationDuration=".5s" />
                </Button>
                <template v-else>
                    <Button type="button" label="Cancel" severity="danger" outlined
                        class="transition-all duration-300 hover:scale-105" @click="cancel">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                        </template>
                    </Button>
                    <Button type="button" label="Add Payment" severity="success" raised
                        :disabled="!cardComplete || !form.amount"
                        class="transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        @click="submitHandler">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-credit-card mr-2"></i>
                        </template>
                    </Button>
                </template>
            </div>
        </template>

        <!-- Response Modal -->
        <ResponseModal v-if="response_modal.status" :message="response_modal" @close="response_modal = {}" />
    </Dialog>
</template>

<style scoped>
#card-element {
    min-height: 40px;
}
</style>
