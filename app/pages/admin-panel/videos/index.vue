<script setup>
const AddEdit = defineAsyncComponent(() => import('./components/AddEdit.vue'));
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const route = useRoute();
const router = useRouter();

// LIST STATE
const isLoading = ref(false);
const data = ref([]);
const permissions = ref({});
const search = ref('');

// PAGINATION
const paginationConfig = ref({
    data: [],
    lang: 'en',
    align: 'center',
    action: ''
});

// LOAD LIST
const loadData = async () => {
    isLoading.value = true;
    permissions.value = {};
    try {
        const page = route.query.page ? route.query.page : 1;
        const queryStr = `?page=${page}${search.value ? `&search=${encodeURIComponent(search.value)}` : ''}`;
        const getData = await $fetchAdmin(`videos/list${queryStr}`, {
            method: 'GET',
        });

        // API shape you gave:
        // { status: "success", message: "...", data: { data: [...], meta: {...}, permissions: {...} } }
        if (getData.status === 'success') {
            data.value = getData.data.data;
            permissions.value = getData.data.permissions || {};
            paginationConfig.value.data = getData.data.meta;
        }
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});

watch(
    () => route.query,
    () => {
        loadData();
    }
);

// MODAL (ADD / EDIT)
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

// When AddEdit emits new/updated data
const receivedData = (d) => {
    isOpenModal.value = false;
    if (modalTitle.value === 'Create') {
        // newly created video should appear at top
        data.value.unshift(d);
    } else {
        // update in list
        data.value = data.value.map((item) => (item.id === d.id ? d : item));
    }
};

const cancelModal = () => {
    item.value = {};
    isOpenModal.value = false;
};

// DELETE
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
        const getData = await $fetchAdmin(`videos/${deleteId.value}/delete`, {
            method: 'DELETE',
        });

        if (getData.status === 'success') {
            response_modal.value = {
                status: true,
                message: 'Deleted Successfully.',
            };
            data.value = data.value.filter((item) => item.id !== deleteId.value);
        }
    } catch (e) {
        if (e.response?.status === 404 || e.response?.status === 409) {
            response_modal.value = e.response._data;
        }
    } finally {
        isOpenConModal.value = false;
    }
};

// RESET PAGINATION WHEN FILTERS CHANGE
const resetPagination = () => {
    const query = { ...route.query };
    delete query.page;
    router.push({ query });
};

const onSearchChange = () => {
    loadData();
    resetPagination();
};
</script>

<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="h-full w-full overflow-auto">
            <div class="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-4">
                <div class="w-full md:w-auto flex flex-wrap gap-4">
                    <div class="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
                        <div class="flex items-center gap-2 w-full md:w-auto">
                            <label for="search" class="text-gray-800 dark:text-gray-200">Search (Title)</label>
                            <InputText
                                type="text"
                                v-model="search"
                                @input="onSearchChange"
                                @keyup.enter="onSearchChange"
                                class="w-full md:w-auto"
                            />
                        </div>
                    </div>
                </div>

                <Skeleton v-if="isLoading" width="8rem" height="2.5rem" borderRadius="10px"></Skeleton>
                <!-- <Button
                    v-else-if="permissions?.add"
                    label="Create Video"
                    @click="addNew"
                    class="text-xs"
                /> -->
                <Button
                   
                    label="Create Video"
                    @click="addNew"
                    class="text-xs"
                />
            </div>

            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">
                            Videos
                        </h4>
                    </div>

                    <div class="p-4">
                        <div class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <th width="20%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Title</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Channel</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Duration</span>
                                            </div>
                                        </th>
                                        <th width="25%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Video URL</span>
                                            </div>
                                        </th>
                                        <!-- <th width="15%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Created By</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Created At</span>
                                            </div>
                                        </th> -->
                                        <!-- <th width="10%" v-if="(permissions.edit || permissions.delete) || isLoading">
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Action</span>
                                            </div>
                                        </th> -->
                                        <th width="10%" >
                                            <div class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Action</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>

                                <!-- Skeleton rows -->
                                <tbody v-if="isLoading">
                                    <tr v-for="index in 10" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200">
                                            <Skeleton width="8rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="6rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="4rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200">
                                            <Skeleton width="10rem" class="mb-2"></Skeleton>
                                        </td>
                                        <!-- <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="8rem" class="mb-2"></Skeleton>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton width="8rem" class="mb-2"></Skeleton>
                                        </td> -->
                                        <td>
                                            <div class="flex justify-center items-center gap-2">
                                                <Skeleton size="1.5rem"></Skeleton>
                                                <Skeleton size="1.5rem"></Skeleton>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>

                                <!-- Actual data -->
                                <tbody v-else>
                                    <tr v-for="(item, index) in data" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200">
                                            {{ item.title }}
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            {{ item.channel?.name || '-' }}
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            {{ item.duration }} min
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200">
                                            <a
                                                :href="item.video_url"
                                                target="_blank"
                                                class="text-blue-500 hover:underline break-all"
                                            >
                                                {{ item.video_url }}
                                            </a>
                                        </td>
                                        <!-- <td class="text-gray-800 dark:text-gray-200 text-center">
                                            <div class="flex flex-col text-xs">
                                                <span>{{ item.created_by?.email || '-' }}</span>
                                                <span>{{ item.created_by?.mobile || '' }}</span>
                                            </div>
                                        </td>
                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                            {{ item.created_at }}
                                        </td> -->
                                        <!-- <td v-if="permissions.edit || permissions.delete">
                                            <div class="flex justify-center items-center gap-2">
                                                <i
                                                    v-if="permissions.edit"
                                                    @click="editHandler(item)"
                                                    class="fa-solid fa-pen-to-square text-gray-800 dark:text-gray-200 hover:text-green-500 cursor-pointer transition duration-150 ease-in-out"
                                                ></i>
                                                <i
                                                    v-if="permissions.delete"
                                                    @click="openDeleteModal(item.id)"
                                                    class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"
                                                ></i>
                                            </div>
                                        </td> -->
                                        <td >
                                            <div class="flex justify-center items-center gap-2">
                                                <i
                                                    
                                                    @click="editHandler(item)"
                                                    class="fa-solid fa-pen-to-square text-gray-800 dark:text-gray-200 hover:text-green-500 cursor-pointer transition duration-150 ease-in-out"
                                                ></i>
                                                <i
                                                   
                                                    @click="openDeleteModal(item.id)"
                                                    class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"
                                                ></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Add / Edit Modal -->
                    <AddEdit
                        :isOpenModal="isOpenModal"
                        :item="item"
                        :modalTitle="modalTitle"
                        @close="cancelModal"
                        @add_emit="receivedData"
                    />

                    <!-- Pagination -->
                    <LazyPagination v-if="!isLoading" class="px-4" :config="paginationConfig" />

                    <!-- Delete Confirm Modal -->
                    <LazyConfirmModal
                        :isOpenConModal="isOpenConModal"
                        @confirm="deleteHandler"
                        @update:isOpenConModal="isOpenConModal = $event"
                    />

                    <!-- Response Modal -->
                    <LazyResponseModal :response_modal="response_modal" />
                </div>
            </div>
        </div>
    </div>
</template>
