<script setup>
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

const visible = computed({
    get: () => props.isOpenModal,
    set: (value) => {
        if (!value) emit('close');
    }
});

const route = useRoute();
const ledgers = ref([]);
const isLoading = ref(false);
const paginationConfig = ref({
    data: {},
    lang: 'en',
    align: 'center',
    action: ''
});

const filters = ref({
    type: '',
    action: ''
});

const typeOptions = [
    { value: '', label: 'All Types' },
    { value: '1', label: 'Credit' },
    { value: '2', label: 'Debit' }
];

const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: '1', label: 'Deposit' },
    { value: '2', label: 'Click' },
    { value: '3', label: 'Impression' }
];

const loadLedgers = async () => {
    if (!props.advertisement?.id) return;
    
    isLoading.value = true;
    try {
        const params = {
            page: route.query.page || 1
        };

        if (filters.value.type) {
            params.type = filters.value.type;
        }
        if (filters.value.action) {
            params.action = filters.value.action;
        }

        const response = await $fetchCitizen(
            `advertiser/advertisements/${props.advertisement.id}/ledgers`,
            {
                method: 'GET',
                params
            }
        );

        if (response.data) {
            ledgers.value = response.data.data;
            paginationConfig.value.data = response.data.meta;
        }
    } catch (e) {
        console.error('Error loading ledgers:', e.message);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.isOpenModal, (newVal) => {
    if (newVal && props.advertisement?.id) {
        loadLedgers();
    }
});

watch(() => route.query, () => {
    if (props.isOpenModal && props.advertisement?.id) {
        loadLedgers();
    }
});

onMounted(() => {
    if (props.isOpenModal && props.advertisement?.id) {
        loadLedgers();
    }
});

const applyFilters = () => {
    loadLedgers();
};

const close = () => {
    emit('close');
};

const getTypeClass = (type) => {
    return type === 1 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
};

const getActionClass = (action) => {
    const classes = {
        1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        2: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        3: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return classes[action] || classes[3];
};
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '70rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">Transaction Ledger</h4>
            </div>
        </template>
        
        <div class="mb-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Advertisement: <strong>{{ advertisement.title }}</strong>
            </p>
            <div class="mt-2 flex items-center gap-4 text-sm">
                <div class="text-gray-700 dark:text-gray-300">
                    <span class="font-medium">Balance:</span>
                    <span class="text-green-600 dark:text-green-400 font-semibold">
                        ${{ parseFloat(advertisement.remaining_balance || 0).toFixed(2) }}
                    </span>
                </div>
                <div class="text-gray-700 dark:text-gray-300">
                    <span class="font-medium">Clicks:</span> {{ advertisement.total_clicks }}
                </div>
                <div class="text-gray-700 dark:text-gray-300">
                    <span class="font-medium">Impressions:</span> {{ advertisement.total_impressions }}
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 class="font-semibold mb-3">Filters</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold text-sm">Type</label>
                        <Dropdown v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value"
                            placeholder="Select type" class="w-full" />
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold text-sm">Action</label>
                        <Dropdown v-model="filters.action" :options="actionOptions" optionLabel="label"
                            optionValue="value" placeholder="Select action" class="w-full" />
                    </div>
                </div>
                <div class="flex items-end">
                    <Button type="button" label="Apply Filters" severity="info" raised @click="applyFilters"
                        class="w-full">
                        <template #icon>
                            <i class="pi pi-filter mr-2"></i>
                        </template>
                    </Button>
                </div>
            </div>
        </div>

        <!-- Ledger Table -->
        <div class="max-h-[60vh] overflow-y-auto">
            <LoaderDataFetch v-if="isLoading" />

            <div v-else-if="ledgers.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No transactions found for this advertisement.</p>
            </div>

            <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                        </th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                        </th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Action
                        </th>
                        <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount
                        </th>
                        <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Invoice ID
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="ledger in ledgers" :key="ledger.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {{ new Date(ledger.created_at).toLocaleString() }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap">
                            <span :class="getTypeClass(ledger.type)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                {{ ledger.type_label }}
                            </span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap">
                            <span :class="getActionClass(ledger.action)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                {{ ledger.action_label }}
                            </span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-medium" :class="ledger.type === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                            {{ ledger.type === 1 ? '+' : '-' }}${{ parseFloat(ledger.amount).toFixed(5) }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {{ ledger.stripe_invoice_id || '-' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="paginationConfig.data.total > 0" class="mt-4">
            <Pagination :config="paginationConfig" />
        </div>

        <!-- Buttons -->
        <template #footer class="flex justify-end gap-2 border-gray-200">
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <!-- <Button type="button" label="Close" severity="success" raised
                    class="transition-all duration-300 hover:scale-105 hover:shadow-lg" @click="close">
                    <template #icon>
                        <i class="pi pi-check-circle mr-2"></i>
                    </template>
                </Button> -->
                <Button type="button" label="Cancel" severity="danger" outlined
                        class="transition-all duration-300 hover:scale-105"  @click="close">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                        </template>
                    </Button>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
table {
    @apply w-full;
}
</style>
