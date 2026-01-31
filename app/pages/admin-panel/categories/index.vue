<script setup>
const AddEdit = defineAsyncComponent(() => import('./components/AddEdit.vue'));
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

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
        const params = new URLSearchParams();
        
        if (search.value) params.append('name', search.value);
        params.append('page', route.query.page ? route.query.page : 1);

        const getData = await $fetchAdmin(`categories/drop-down?${params.toString()}`, {
            method: 'GET'
        });
        data.value = getData.data?.data || getData.data || getData;
        permissions.value = getData.data?.permissions || {};
        paginationConfig.value.data = getData.data?.meta || {};
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
    console.log('to', to);
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
    console.log('receivedData', d);
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
        const getData = await $fetchAdmin(`categories/${deleteId.value}/delete`, {
            method: 'DELETE'
        });
       
        response_modal.value = getData;
        data.value = data.value.filter(item => item.id !== deleteId.value);
       
    } catch (e) {
        if (e.response?.status === 404 || e.response?.status === 409) {
            response_modal.value = e.response._data;
        }
    } finally {
        isOpenConModal.value = false;
    }
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
                <Skeleton v-if="isLoading" width="9rem" height="2.5rem" borderRadius="10px"></Skeleton>
                <Button label="Create Category" @click="addNew" class="text-xs" />
            </div>
            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">Video Categories
                        </h4>
                    </div>
                    <div class="p-4">
                        <div class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <th width="10%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>ID</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Image</span>
                                            </div>
                                        </th>
                                        <th width="30%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Name</span>
                                            </div>
                                        </th>
                                        <th width="25%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Description</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Status</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Action</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody v-if="isLoading">
                                    <tr v-for="(index) in 10" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <Skeleton width="3rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <Skeleton width="4rem" height="4rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex flex-col">
                                                <Skeleton width="12rem" class="mb-2"></Skeleton>
                                                <Skeleton width="8rem" class="mb-2"></Skeleton>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <Skeleton width="15rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <Skeleton size="1.5rem"></Skeleton>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center gap-2">
                                                <Skeleton size="1.5rem"></Skeleton>
                                                <Skeleton size="1.5rem"></Skeleton>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr v-for="(item, index) in data" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <span class="text-sm font-semibold">{{ item.id }}</span>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <img 
                                                v-if="item.category_image"
                                                :src="item.category_image"
                                                alt="Category"
                                                class="w-16 h-16 object-cover rounded"
                                            />
                                            <div v-else class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                <i class="pi pi-image text-gray-400 text-2xl"></i>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex flex-col">
                                                <span class="text-sm font-semibold">{{ item.name }}</span>
                                                <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.slug }}</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <span class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ item.description || 'N/A' }}</span>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <span v-if="item.is_active == 1" class="text-green-600"><i
                                                        class="fa fa-power-off" aria-hidden="true"></i></span>
                                                <span v-else class="text-red-500"><i class="fa fa-power-off"
                                                        aria-hidden="true"></i></span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center gap-2">
                                                <i @click="editHandler(item)" 
                                                    class="fa-solid fa-pen-to-square text-gray-800 dark:text-gray-200 hover:text-green-500 cursor-pointer transition duration-150 ease-in-out"></i>
                                                <i @click="openDeleteModal(item.id)" 
                                                    class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <AddEdit :isOpenModal="isOpenModal" :item="item" :modalTitle="modalTitle" :data="data"
                        @close="cancelModal" @add_emit="receivedData" />
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
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>