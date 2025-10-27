<script setup>
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });
const { $optionsListAcIn, $viewFormatDate } = useNuxtApp();

const optionsList = $optionsListAcIn();
const route = useRoute();
const status = ref(optionsList[0]);
const search = ref('');

const paginationConfig = ref({
    data: [],
    lang: 'en',
    align: 'center',
    action: ''
});
const isLoading = ref(false)
const data = ref([]);
const loadData = async () => {
    isLoading.value = true;
    try {
        const getData = await $fetchAdmin(`admin/subscribes/all`, {
            method: 'POST',
            body: {
                paginate: true,
                page: route.query.page ? route.query.page : 1,
                length: 10,
                search: search.value,
                status: status.value.key == 'status' ? status.value.value : '',
                trashed: status.value.key == 'trashed' ? 'only' : '',
            },
        });
        data.value = getData.data.data;
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

const resetPagination = () => {
    const query = { ...route.query };
    delete query.page;
    navigateTo({ query }, { replace: true });
};
const onChangeHandler = () => {
    loadData();
    resetPagination();
}
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
                        <div class="flex items-center gap-3 w-full md:w-auto">
                            <label for="status" class="text-gray-800 dark:text-gray-200">Status</label>
                            <Select v-model="status" :options="optionsList" optionLabel="name" @change="onChangeHandler"
                                placeholder="Select" class="w-full md:w-auto" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">Subscribers</h4>
                    </div>
                    <div class="p-4">
                        <div class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <th width="50%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Title</span>
                                            </div>
                                        </th>
                                        <th width="20%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Subscribed</span>
                                            </div>
                                        </th>
                                        <th width="20%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Expires</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Status</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody v-if="isLoading">
                                    <tr v-for="(index) in 10" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex items-center gap-2">
                                                <div class="flex flex-col gap-2">
                                                    <Skeleton width="8rem" height="1.2rem"></Skeleton>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <Skeleton width="6rem" height="1.2rem"></Skeleton>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <Skeleton width="6rem" height="1.2rem"></Skeleton>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <Skeleton size="1.5rem"></Skeleton>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else class="">
                                    <tr v-for="(item, index) in data" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex justify-start gap-2">
                                                <span class="text-sm">{{ item?.email }}</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex justify-center gap-2">
                                                <span class="text-sm">{{ item.subscribed_at ? $viewFormatDate(item.subscribed_at) : '-' }}</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex justify-center gap-2">
                                                <span class="text-sm">{{ item.expires_at ? $viewFormatDate(item.expires_at) : '-' }}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <span v-if="item.is_active == 1" class="text-green-600"><i
                                                        class="fa fa-power-off" aria-hidden="true"></i></span>
                                                <span v-else class="text-red-500"><i class="fa fa-power-off"
                                                        aria-hidden="true"></i></span>
                                            </div>
                                        </td>
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