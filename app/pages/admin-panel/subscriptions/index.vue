<script setup>
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const route = useRoute();
const search = ref('');

const paginationConfig = ref({
    data: [],
    lang: 'en',
    align: 'center',
    action: ''
});
const isLoading = ref(false)
const data = ref([]);
const permissions = ref({});

const loadData = async () => {
    isLoading.value = true;
    permissions.value = {};
    try {
        const getData = await $fetchAdmin(`admin/subscriptions/list`, {
            method: 'GET',
            params: {
                page: route.query.page ? route.query.page : 1,
                length: 10,
                search: search.value,
            },
        });
        data.value = getData.data.data;
        permissions.value = getData.data.permissions;
        paginationConfig.value.data = getData.data.meta;
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
    console.log('to', to);
    loadData();
})

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusColor = (status) => {
    const colors = {
        'active': 'text-green-600',
        'cancelled': 'text-red-600',
        'expired': 'text-gray-500',
        'pending': 'text-yellow-600'
    };
    return colors[status] || 'text-gray-600';
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
                                class="w-full md:w-auto" placeholder="Search by user name or email..." />
                        </div>
                    </div>
                </div>
            </div>

            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">Subscriptions List</h4>
                    </div>
                    <div class="p-4">
                        <div class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <th width="5%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>ID</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>User</span>
                                            </div>
                                        </th>
                                        <th width="20%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Package</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Price</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Status</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Start Date</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>End Date</span>
                                            </div>
                                        </th>
                                        <!-- <th width="10%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Stripe ID</span>
                                            </div>
                                        </th> -->
                                    </tr>
                                </thead>
                                <tbody v-if="isLoading" class="">
                                    <tr v-for="(index) in 10" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="2rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200">
                                            <Skeleton width="10rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200">
                                            <Skeleton width="12rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <div class="flex justify-center items-center gap-2">
                                                <Skeleton width="4rem" class="mb-2"></Skeleton>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <div class="flex justify-center items-center gap-2">
                                                <Skeleton width="5rem" class="mb-2"></Skeleton>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="8rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="8rem" class="mb-2"></Skeleton>
                                        </td>
                                        <!-- <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="6rem" class="mb-2"></Skeleton>
                                        </td> -->
                                    </tr>
                                </tbody>
                                <tbody v-else class="">
                                    <tr v-if="data.length === 0">
                                        <td colspan="8" class="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No subscriptions found
                                        </td>
                                    </tr>
                                    <tr v-for="(item, index) in data" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-center">{{ item.id }}</td>
                                        <td class="text-gray-800 dark:text-gray-200">
                                            <div class="flex flex-col">
                                                <span class="font-medium">{{ item.user?.name || 'N/A' }}</span>
                                                <span class="text-xs text-gray-500">{{ item.user?.email || 'N/A' }}</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200">
                                            <div class="flex flex-col">
                                                <span class="font-medium">{{ item.package?.title || 'N/A' }}</span>
                                                <span class="text-xs text-gray-500 capitalize">{{ item.package?.stripe_product_type }} - {{ item.package?.duration_in_days }} days</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            ${{ item.package?.price || '0.00' }}
                                        </td>
                                        <td class="text-center">
                                            <span :class="getStatusColor(item.status)" class="font-semibold capitalize">
                                                {{ item.status }}
                                            </span>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center text-sm">
                                            {{ formatDate(item.current_period_start) }}
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center text-sm">
                                            {{ formatDate(item.current_period_end) }}
                                        </td>
                                        <!-- <td class="text-gray-800 dark:text-gray-200 text-center text-xs">
                                            <span class="truncate inline-block max-w-[100px]" :title="item.stripe_subscription_id">
                                                {{ item.stripe_subscription_id || 'N/A' }}
                                            </span>
                                        </td> -->
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <LazyPagination v-if="!isLoading" class="px-4" :config="paginationConfig" />
                </div>
            </div>
        </div>
    </div>
</template>
