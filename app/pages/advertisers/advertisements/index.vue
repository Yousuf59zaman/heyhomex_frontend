<script setup>
const AddEdit = defineAsyncComponent(() => import('./components/AddEdit.vue'));
const AttachPlaces = defineAsyncComponent(() => import('./components/AttachPlaces.vue'));
const LedgerModal = defineAsyncComponent(() => import('./components/LedgerModal.vue'));
const PaymentModal = defineAsyncComponent(() => import('./components/PaymentModal.vue'));

definePageMeta({ middleware: ['auth-citizen'], layout: 'advertiser' });

const route = useRoute();
const search = ref('');

const paginationConfig = ref({
    data: [],
    lang: 'en',
    align: 'center',
    action: ''
});
const isLoading = ref(false);
const data = ref([]);
const permissions = ref({});

const loadData = async () => {
    isLoading.value = true;
    permissions.value = {};
    try {
        const getData = await $fetchCitizen(`advertiser/advertisements/list`, {
            method: 'GET',
            params: {
                page: route.query.page ? route.query.page : 1,
            },
        });
        data.value = getData.data.data;
        permissions.value = getData.data.permissions;
        paginationConfig.value.data = getData.data.meta;
        isLoading.value = false;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});

watch(() => route.query, (to) => {
    loadData();
});

const isOpenModal = ref(false);
const item = ref({});
const modalTitle = ref('');

const editHandler = (i) => {
    modalTitle.value = 'Edit';
    isOpenModal.value = true;
    item.value = i;
};

const addNew = () => {
    item.value = {};
    modalTitle.value = 'Create';
    isOpenModal.value = true;
};

const receivedData = (d) => {
    isOpenModal.value = false;
    loadData();
};

const cancelModal = () => {
    item.value = {};
    isOpenModal.value = false;
};

// Delete
const isOpenConModal = ref(false);
const response_modal = ref({});
const deleteId = ref(null);

const openDeleteModal = (id) => {
    deleteId.value = id;
    isOpenConModal.value = true;
};

const deleteHandler = async () => {
    response_modal.value = {};
    try {
        const getData = await $fetchCitizen(`advertiser/advertisements/${deleteId.value}/delete`, {
            method: 'POST',
            body: {
                _method: 'DELETE'
            }
        });
        if (getData.status == true || getData.status == 'success') {
            response_modal.value = getData;
            data.value = data.value.filter(item => item.id !== deleteId.value);
        }
    } catch (e) {
        if (e.response?.status === 404 || e.response?.status === 409) {
            response_modal.value = e.response._data;
        }
    } finally {
        isOpenConModal.value = false;
    }
};

// Toggle Status
const toggleStatus = async (id) => {
    try {
        const response = await $fetchCitizen(`advertiser/advertisements/${id}/toggle-status`, {
            method: 'POST',
            body: {
                _method: 'PATCH'
            }
        });
        if (response.status === 'success') {
            const index = data.value.findIndex(item => item.id === id);
            if (index !== -1) {
                data.value[index] = response.data;
            }
        }
    } catch (e) {
        console.error('Error toggling status:', e.message);
    }
};

// Attach Places
const isOpenAttachModal = ref(false);
const attachItem = ref({});

const openAttachPlaces = (ad) => {
    attachItem.value = ad;
    isOpenAttachModal.value = true;
};

const closeAttachModal = () => {
    attachItem.value = {};
    isOpenAttachModal.value = false;
    loadData();
};

// Ledger
const isOpenLedgerModal = ref(false);
const ledgerItem = ref({});

const openLedger = (ad) => {
    ledgerItem.value = ad;
    isOpenLedgerModal.value = true;
};

const closeLedgerModal = () => {
    ledgerItem.value = {};
    isOpenLedgerModal.value = false;
};

// Payment
const isOpenPaymentModal = ref(false);
const paymentItem = ref({});

const openPayment = (ad) => {
    paymentItem.value = ad;
    isOpenPaymentModal.value = true;
};

const closePaymentModal = () => {
    paymentItem.value = {};
    isOpenPaymentModal.value = false;
    loadData();
};

const resetPagination = () => {
    const query = { ...route.query };
    delete query.page;
    navigateTo({ query }, { replace: true });
};
</script>

<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="h-full w-full overflow-auto">
            <div class="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-4">
                <div class="w-full md:w-auto flex flex-wrap gap-4">
                    <div class="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
                        <div class="flex items-center gap-2 w-full md:w-auto">
                            <label for="search" class="text-gray-800 dark:text-gray-200">Search</label>
                            <InputText type="text" v-model="search" @input="loadData" @keyup.enter="loadData"
                                class="w-full md:w-auto" />
                        </div>
                    </div>
                </div>
                <Skeleton v-if="isLoading" width="11rem" height="2.5rem" borderRadius="10px"></Skeleton>
                <Button v-else label="Create Advertisement" @click="addNew" class="text-xs" />
            </div>
            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">My Advertisements
                        </h4>
                    </div>
                    <div class="p-4">
                        <div class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <th width="30%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Advertisement</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Type</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Stats</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Balance</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Status</span>
                                            </div>
                                        </th>
                                        <th width="20%" >
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Action</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody v-if="isLoading">
                                    <tr v-for="(index) in 5" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex items-center gap-2">
                                                <Skeleton size="4rem"></Skeleton>
                                                <div class="flex flex-col">
                                                    <Skeleton width="10rem" class="mb-2"></Skeleton>
                                                    <Skeleton width="8rem"></Skeleton>
                                                </div>
                                            </div>
                                        </td>
                                        <td><div class="flex justify-center"><Skeleton width="4rem"></Skeleton></div></td>
                                        <td><Skeleton width="6rem"></Skeleton></td>
                                        <td><Skeleton width="5rem"></Skeleton></td>
                                        <td><div class="flex justify-center"><Skeleton size="1.5rem"></Skeleton></div></td>
                                        <td><div class="flex justify-center gap-2">
                                            <Skeleton size="1.5rem"></Skeleton>
                                            <Skeleton size="1.5rem"></Skeleton>
                                            <Skeleton size="1.5rem"></Skeleton>
                                            <Skeleton size="1.5rem"></Skeleton>
                                        </div></td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr v-for="(item, index) in data" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex items-center gap-2">
                                                <div class="flex-shrink-0">
                                                    <img v-if="item.media_url" :src="item.media_url" :alt="item.title" 
                                                         class="w-16 h-16 object-cover rounded-md" />
                                                    <div v-else class="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                        <i class="fa fa-image text-gray-400 text-2xl"></i>
                                                    </div>
                                                </div>
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-semibold">{{ item.title }}</span>
                                                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.description?.substring(0, 40) }}{{ item.description?.length > 40 ? '...' : '' }}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">{{ item.type_label }}</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex flex-col">
                                                <span class="text-xs font-semibold">{{ item.total_clicks }} clicks</span>
                                                <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.total_impressions }} views</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex flex-col">
                                                <span class="text-xs font-semibold">${{ parseFloat(item.remaining_balance).toFixed(2) }}</span>
                                                <span class="text-xs text-gray-500 dark:text-gray-400">CPC: ${{ item.cpc }} | CPM: ${{ item.cpm }}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <button @click="toggleStatus(item.id)" class="flex items-center justify-center">
                                                    <span v-if="item.status == 1" class="text-green-600"><i class="fa fa-power-off" aria-hidden="true"></i></span>
                                                    <span v-else class="text-red-500"><i class="fa fa-power-off" aria-hidden="true"></i></span>
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center gap-2">
                                                                <i @click="openPayment(item)" title="Add Payment"
                                                    class="fa-solid fa-dollar-sign text-green-500 hover:text-green-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                                <i @click="openAttachPlaces(item)" title="Manage Placements"
                                                    class="fa-solid fa-map-location-dot text-purple-600 hover:text-purple-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                                <i @click="openLedger(item)" title="View Ledger"
                                                    class="fa-solid fa-receipt text-blue-600 hover:text-blue-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                                <i @click="editHandler(item)" title="Edit"
                                                    class="fa-solid fa-pen-to-square text-gray-800 dark:text-gray-200 hover:text-green-500 cursor-pointer transition duration-150 ease-in-out"></i>
                                                <i @click="openDeleteModal(item.id)" title="Delete"
                                                    class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Add/Edit Modal -->
                    <AddEdit :isOpenModal="isOpenModal" :item="item" :modalTitle="modalTitle"
                        @close="cancelModal" @add_emit="receivedData" />
                    
                    <!-- Attach Places Modal -->
                    <AttachPlaces :isOpenModal="isOpenAttachModal" :advertisement="attachItem" 
                        @close="closeAttachModal" />
                    
                    <!-- Ledger Modal -->
                    <LedgerModal :isOpenModal="isOpenLedgerModal" :advertisement="ledgerItem" 
                        @close="closeLedgerModal" />
                    
                    <!-- Payment Modal -->
                    <PaymentModal :isOpenModal="isOpenPaymentModal" :advertisement="paymentItem" 
                        @close="closePaymentModal" />
                    
                    <LazyPagination v-if="!isLoading" class="px-4" :config="paginationConfig" />
                    <LazyConfirmModal :isOpenConModal="isOpenConModal" @confirm="deleteHandler"
                        @update:isOpenConModal="isOpenConModal = $event" />
                    <LazyResponseModal :response_modal="response_modal" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
table {
    @apply w-full;
}
</style>
