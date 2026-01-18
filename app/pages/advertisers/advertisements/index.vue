<script setup>
const AddEdit = defineAsyncComponent(() => import('./components/AddEdit.vue'));
const AttachPlaces = defineAsyncComponent(() => import('./components/AttachPlaces.vue'));
const AttachVideos = defineAsyncComponent(() => import('./components/AttachVideos.vue'));
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
            response_modal.value = {
                status: true,
                message: 'Advertisement deleted successfully.'
            };
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

// Attach Videos
const isOpenAttachVideosModal = ref(false);
const attachVideosItem = ref({});

const openAttachVideos = (ad) => {
    attachVideosItem.value = ad;
    isOpenAttachVideosModal.value = true;
};

const closeAttachVideosModal = () => {
    attachVideosItem.value = {};
    isOpenAttachVideosModal.value = false;
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

const getStatusColor = (status) => {
    if (status === 1 || status === "Active") {
        return "bg-green-100 text-green-700 border-green-200"
    } else if (status === 0 || status === "Inactive") {
        return "bg-red-100 text-red-700 border-red-200"
    }
    return "bg-gray-100 text-gray-700 border-gray-200"
}

const getStatusLabel = (status) => {
    if (status === 1) return "Active"
    if (status === 0) return "Inactive"
    return status
}
</script>

<template>
    <div class="space-y-6 mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <!-- Header with Create Button -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">My Advertisements</h1>
                <p class="text-sm text-gray-500 mt-1">Manage and track your advertising campaigns</p>
            </div>
            <button
                v-if="!isLoading"
                @click="addNew"
                class="px-4 py-2 bg-[#18222C] hover:bg-[#0F172A] text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                <Icon name="lucide:plus" class="w-4 h-4" />
                Create Advertisement
            </button>
            <Skeleton v-else width="11rem" height="2.5rem" borderRadius="0.5rem" />
        </div>

        <!-- Campaign Table Card -->
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">
                    All Campaigns
                </h3>
                <div class="flex items-center gap-2">
                    <InputText 
                        type="text" 
                        v-model="search" 
                        @input="loadData" 
                        @keyup.enter="loadData"
                        placeholder="Search campaigns..."
                        class="text-sm" />
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200">
                            <th class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                                Campaign Name
                            </th>
                            <th class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                                Status
                            </th>
                            <th class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                                Clicks
                            </th>
                            <th class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                                Impressions
                            </th>
                            <th class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                                CPC
                            </th>
                            <th class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                                Balance
                            </th>
                            <th class="text-left py-3 px-2 text-sm font-medium text-gray-600">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody v-if="isLoading">
                        <tr
                            v-for="i in 5"
                            :key="i"
                            class="border-b border-gray-100">
                            <td class="py-4 px-2">
                                <div class="flex items-center gap-3">
                                    <Skeleton size="2.5rem" shape="square" />
                                    <Skeleton width="10rem" height="1rem" />
                                </div>
                            </td>
                            <td class="py-4 px-2">
                                <Skeleton width="4rem" height="1.5rem" borderRadius="0.375rem" />
                            </td>
                            <td class="py-4 px-2">
                                <Skeleton width="3rem" height="1rem" />
                            </td>
                            <td class="py-4 px-2">
                                <Skeleton width="4rem" height="1rem" />
                            </td>
                            <td class="py-4 px-2">
                                <Skeleton width="3rem" height="1rem" />
                            </td>
                            <td class="py-4 px-2">
                                <Skeleton width="4rem" height="1rem" />
                            </td>
                            <td class="py-4 px-2">
                                <div class="flex items-center gap-2">
                                    <Skeleton size="1.5rem" v-for="j in 5" :key="j" />
                                </div>
                            </td>
                        </tr>
                    </tbody>

                    <tbody v-else>
                        <tr
                            v-if="data.length === 0"
                            class="border-b border-gray-100">
                            <td colspan="7" class="py-8 text-center text-gray-500">
                                <div class="flex flex-col items-center justify-center">
                                    <Icon name="lucide:megaphone" class="w-12 h-12 text-gray-300 mb-3" />
                                    <p class="text-base font-medium text-gray-700">No campaigns found</p>
                                    <p class="text-sm text-gray-500 mt-1">Create your first advertisement to get started!</p>
                                </div>
                            </td>
                        </tr>
                        <tr
                            v-for="campaign in data"
                            :key="campaign.id"
                            class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td class="py-4 px-2">
                                <div class="flex items-center gap-3">
                                    <div class="flex-shrink-0">
                                        <img 
                                            v-if="campaign.media_url" 
                                            :src="campaign.media_url" 
                                            :alt="campaign.title" 
                                            class="w-10 h-10 object-cover rounded-md" 
                                        />
                                        <div 
                                            v-else 
                                            class="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                                            <Icon name="lucide:image" class="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ campaign.title }}
                                    </div>
                                </div>
                            </td>

                            <td class="py-4 px-2">
                                <span
                                    class="px-2 py-1 text-xs font-medium rounded-md border"
                                    :class="getStatusColor(campaign.status)">
                                    {{ getStatusLabel(campaign.status_label || campaign.status) }}
                                </span>
                            </td>

                            <td class="py-4 px-2">
                                <span class="text-sm text-gray-900">{{
                                    campaign.total_clicks || 0
                                }}</span>
                            </td>

                            <td class="py-4 px-2">
                                <span class="text-sm text-gray-900">{{
                                    (campaign.total_impressions || 0).toLocaleString()
                                }}</span>
                            </td>

                            <td class="py-4 px-2">
                                <span class="text-sm text-gray-900">${{
                                    parseFloat(campaign.cpc || 0).toFixed(2)
                                }}</span>
                            </td>

                            <td class="py-4 px-2">
                                <span class="text-sm text-gray-900">${{
                                    parseFloat(campaign.remaining_balance || 0).toFixed(2)
                                }}</span>
                            </td>

                            <td class="py-4 px-2">
                                <div class="flex items-center gap-3">
                                    <button
                                        @click="toggleStatus(campaign.id)"
                                        :title="campaign.status === 1 ? 'Active - Click to deactivate' : 'Inactive - Click to activate'"
                                        class="text-gray-400 hover:text-gray-600 transition-colors">
                                        <Icon 
                                            :name="campaign.status === 1 ? 'lucide:toggle-right' : 'lucide:toggle-left'" 
                                            :class="campaign.status === 1 ? 'text-green-600' : 'text-red-500'"
                                            class="w-5 h-5" />
                                    </button>
                                    <button
                                        @click="openAttachVideos(campaign)"
                                        title="Attach Videos"
                                        class="text-gray-400 hover:text-blue-600 transition-colors">
                                        <Icon name="lucide:video" class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="openPayment(campaign)"
                                        title="Add Payment"
                                        class="text-gray-400 hover:text-green-600 transition-colors">
                                        <Icon name="lucide:dollar-sign" class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="openAttachPlaces(campaign)"
                                        title="Manage Placements"
                                        class="text-gray-400 hover:text-purple-600 transition-colors">
                                        <Icon name="lucide:map-pin" class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="openLedger(campaign)"
                                        title="View Ledger"
                                        class="text-gray-400 hover:text-blue-600 transition-colors">
                                        <Icon name="lucide:receipt" class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="editHandler(campaign)"
                                        title="Edit"
                                        class="text-gray-400 hover:text-gray-900 transition-colors">
                                        <Icon name="lucide:edit" class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="openDeleteModal(campaign.id)"
                                        title="Delete"
                                        class="text-gray-400 hover:text-red-600 transition-colors">
                                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <LazyPagination v-if="!isLoading && data.length > 0" class="mt-4" :config="paginationConfig" />
        </div>

        <!-- Modals -->
        <AddEdit 
            :isOpenModal="isOpenModal" 
            :item="item" 
            :modalTitle="modalTitle"
            @close="cancelModal" 
            @add_emit="receivedData" />
        
        <AttachPlaces 
            :isOpenModal="isOpenAttachModal" 
            :advertisement="attachItem" 
            @close="closeAttachModal" />
        
        <AttachVideos 
            :isOpenModal="isOpenAttachVideosModal" 
            :advertisement="attachVideosItem" 
            @close="closeAttachVideosModal" />
        
        <LedgerModal 
            :isOpenModal="isOpenLedgerModal" 
            :advertisement="ledgerItem" 
            @close="closeLedgerModal" />
        
        <PaymentModal 
            :isOpenModal="isOpenPaymentModal" 
            :advertisement="paymentItem" 
            @close="closePaymentModal" />
        
        <LazyConfirmModal 
            :isOpenConModal="isOpenConModal" 
            @confirm="deleteHandler"
            @update:isOpenConModal="isOpenConModal = $event" />
        
        <LazyResponseModal :response_modal="response_modal" />
    </div>
</template>

<style scoped>
/* Match dashboard table styles */
table {
    width: 100%;
    border-collapse: collapse;
}

th {
    font-weight: 500;
    text-align: left;
}

tbody tr {
    transition: background-color 0.15s ease;
}

tbody tr:hover {
    background-color: rgb(249 250 251);
}

button:focus {
    outline: none;
}
</style>
