<script setup>
const AddEdit = defineAsyncComponent(() => import('./components/AddEdit.vue'));
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const { $optionsList, $typetList } = useNuxtApp();

const optionsList = $optionsList();
const typetList = $typetList();

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
const permissions = ref({});
const loadData = async () => {
    isLoading.value = true;
    permissions.value = {};
    try {
        const getData = await $fetchAdmin(`admin/news/all`, {
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
        let getResponse = getData.data.data;
        permissions.value = getData.data.permissions;
        const grouped = {};
        getResponse.forEach(faq => {
            const categoryId = faq.category ? faq.category.id : null;
            const categoryName = faq.category ? faq.category.title : "Uncategorized";
            const categoryKey = categoryId ? `${categoryId}-${categoryName}` : `null-${categoryName}`;

            if (!grouped[categoryKey]) {
                grouped[categoryKey] = {
                    id: categoryId,
                    title: categoryName,
                    items: []
                };
            }

            grouped[categoryKey].items.push(faq);
        });
        // Convert grouped object into an array
        data.value = Object.values(grouped);

        paginationConfig.value.data = getData.data.meta;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isLoading.value = false;
    }
};

const dataFaqCategories = ref([]);
const loadFaqCategories = async () => {
    isLoading.value = true;
    try {
        const getData = await $fetchAdmin(`admin/news-categories`, {
            method: 'GET',
        });
        dataFaqCategories.value = getData.data.data;
    } catch (e) {
        console.log('Get MessdataFaqCategoriesage', e.message);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
    loadFaqCategories();
});
watch(() => route.query, (to) => {
    console.log('to', to);
    loadData();
})


const isOpenModal = ref(false);
const item = ref({});
const modalTitle = ref('');
const editHandler = (i) => {
    modalTitle.value = 'Edit';
    isOpenModal.value = true;
    item.value = i
    console.log('editHandler', item);
}

const addNew = () => {
    item.value = {};
    modalTitle.value = 'Create';
    isOpenModal.value = true;
}

const receivedData = (d) => {
    console.log('receivedData', d);
    isOpenModal.value = false;

    const categoryId = d.category ? d.category.id : null;
    const categoryName = d.category ? d.category.title : "Uncategorized";

    // Find the current category of the item
    let oldCategoryIndex = data.value.findIndex(cat => cat.items.some(item => item.id === d.id));

    // Find the new category
    let newCategoryIndex = data.value.findIndex(cat => cat.id === categoryId);

    if (modalTitle.value === 'Create') {
        // If new category doesn't exist, create it
        if (newCategoryIndex === -1) {
            data.value.push({
                id: categoryId,
                title: categoryName,
                items: [d]
            });
        } else {
            data.value[newCategoryIndex].items.push(d);
        }
    } else {
        // If the item is being updated and has moved to a new category
        if (oldCategoryIndex !== -1 && oldCategoryIndex !== newCategoryIndex) {
            // Remove the item from the old category
            data.value[oldCategoryIndex].items = data.value[oldCategoryIndex].items.filter(item => item.id !== d.id);

            // If the old category is now empty, remove it
            if (data.value[oldCategoryIndex].items.length === 0) {
                data.value.splice(oldCategoryIndex, 1);
            }

            // Add the item to the new category
            if (newCategoryIndex === -1) {
                // If new category doesn't exist, create it
                data.value.push({
                    id: categoryId,
                    title: categoryName,
                    items: [d]
                });
            } else {
                data.value[newCategoryIndex].items.push(d);
            }
        } else if (newCategoryIndex !== -1) {
            // Just update the item in the same category
            data.value[newCategoryIndex].items = data.value[newCategoryIndex].items.map(item =>
                item.id === d.id ? d : item
            );
        }
    }
};


const cancelModal = () => {
    item.value = {};
    isOpenModal.value = false;
    console.log('isOpenModal', isOpenModal.value);
}

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
        const getData = await $fetchAdmin(`admin/news/${deleteId.value}`, {
            method: 'DELETE',
        });
        if (getData.status == true) {
            response_modal.value = getData;

            let categoryIndex = data.value.findIndex(cat => cat.items.some(item => item.id === deleteId.value));
            data.value[categoryIndex].items = data.value[categoryIndex].items.filter(item => item.id !== deleteId.value);
            if (data.value[categoryIndex].items.length === 0) {
                data.value.splice(categoryIndex, 1);
            }
        }
    } catch (e) {
        // console.log('here 1',e.response);
        if (e.response?.status === 404 || e.response?.status === 409) {
            // console.log('here 2',e.response._data);
            response_modal.value = e.response._data;
        }
    } finally {
        isOpenConModal.value = false;
    }
};

const restoreHandler = async (id) => {
    response_modal.value = {};
    try {
        const getData = await $fetchAdmin(`admin/news-categories/restore/${id}`, {
            method: 'POST',
        });
        if (getData.status == true) {
            response_modal.value = getData;
            data.value = data.value.filter(item => item.id !== id);
        }
    } catch (e) {
        // console.log('here 1',e.response);
        if (e.response?.status === 404 || e.response?.status === 409) {
            // console.log('here 2',e.response._data);
            response_modal.value = e.response._data;
        }
    } finally {
        isOpenConModal.value = false;
    }
}

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
                <Skeleton v-if="isLoading" width="7rem" height="2.5rem" borderRadius="10px"></Skeleton>
                <Button v-else-if="permissions?.add" label="Create" @click="addNew" class="text-xs" />
            </div>

            <!-- <LoaderDataFetch v-if="isLoading" class="w-full min-h-[calc(100vh-150px)]" /> -->
            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">News & Blogs</h4>
                    </div>
                    <div class="p-4">
                        <div class="custom_table overflow-auto border-b border-gray-200">
                            <!-- <pre>{{ data }}</pre> -->
                            <Accordion v-if="isLoading" :value="1"
                                class="border border-gray-300 rounded-lg shadow-lg bg-white">
                                <AccordionPanel v-for="(index) in 5" :value="index">
                                    <AccordionHeader>
                                        <Skeleton width="5rem" class="mb-2"></Skeleton>
                                    </AccordionHeader>
                                    <AccordionContent class="border-t border-gray-300 pt-4">
                                        <div class="custom_table overflow-auto border-b border-gray-200">
                                            <table class="table table-auto">
                                                <thead class="sticky z-10 top-0">
                                                    <tr>
                                                        <th width="5%">
                                                            <div
                                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>SL</span>
                                                            </div>
                                                        </th>
                                                        <th width="10%">
                                                            <div
                                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>Question</span>
                                                            </div>
                                                        </th>
                                                        <th width="10%">
                                                            <div
                                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>Type</span>
                                                            </div>
                                                        </th>
                                                        <th width="5%">
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
                                                <tbody class="">
                                                    <tr v-for="(index) in 3" :key="index">
                                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                                            <div class="flex justify-center items-center gap-2">
                                                                <div class="flex justify-center items-center gap-2">
                                                                    <Skeleton width="2rem" class="mb-2"></Skeleton>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td class="text-gray-800 dark:text-gray-200">
                                                            <Skeleton width="5rem" class="mb-2"></Skeleton>
                                                        </td>
                                                        <td class="text-gray-800 dark:text-gray-200 text-center">
                                                            <div class="flex justify-center items-center gap-2">
                                                                <Skeleton width="5rem" class="mb-2"></Skeleton>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div class="flex justify-center items-center gap-2">
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
                                            </table>
                                        </div>
                                    </AccordionContent>
                                </AccordionPanel>
                            </Accordion>
                            <Accordion v-else :value="0" class="border border-gray-300 rounded-lg shadow-lg bg-white">
                                <AccordionPanel v-for="(item, index) in data" :value="index">
                                    <AccordionHeader>{{ item.title }}</AccordionHeader>
                                    <AccordionContent class="border-t border-gray-300 pt-4">
                                        <div class="custom_table overflow-auto border-b border-gray-200">
                                            <table class="table table-auto">
                                                <thead class="sticky z-10 top-0">
                                                    <tr>
                                                        <th width="5%">
                                                            <div
                                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>SL</span>
                                                            </div>
                                                        </th>
                                                        <th width="10%">
                                                            <div
                                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>Question</span>
                                                            </div>
                                                        </th>
                                                        <th width="10%">
                                                            <div
                                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>Type</span>
                                                            </div>
                                                        </th>
                                                        <th width="5%">
                                                            <div
                                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>Status</span>
                                                            </div>
                                                        </th>
                                                        <th width="10%" v-if="permissions.edit || permissions.delete">
                                                            <div
                                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                                <span>Action</span>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody class="">
                                                    <tr v-for="(item, index) in item.items" :key="index">
                                                        <td class="text-gray-800 dark:text-gray-200 text-center">{{
                                                            index + 1 }}</td>
                                                        <td class="text-gray-800 dark:text-gray-200">{{ item.title }}
                                                        </td>
                                                        <td class="text-gray-800 dark:text-gray-200 text-center">{{
                                                            item.type ? typetList.find(i => i.id == item.type).name :
                                                            'None'}}</td>
                                                        <td>
                                                            <div class="flex justify-center items-center">
                                                                <span v-if="item.status == 1" class="text-green-600"><i
                                                                        class="fa fa-power-off"
                                                                        aria-hidden="true"></i></span>
                                                                <span v-else class="text-red-500"><i
                                                                        class="fa fa-power-off"
                                                                        aria-hidden="true"></i></span>
                                                            </div>
                                                        </td>
                                                        <td v-if="permissions.edit || permissions.delete">
                                                            <div v-if="status.key == 'trashed' && permissions.delete"
                                                                class="flex justify-center items-center gap-2">
                                                                <i @click="restoreHandler(item.id)"
                                                                    class="fa-solid fa-trash-restore text-green-500 hover:text-green-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                                            </div>
                                                            <div v-else class="flex justify-center items-center gap-2">
                                                                <i @click="editHandler(item) && permissions.edit"
                                                                    class="fa-solid fa-pen-to-square text-gray-800 dark:text-gray-200 hover:text-green-500 cursor-pointer transition duration-150 ease-in-out"></i>
                                                                <i @click="openDeleteModal(item.id) && permissions.delete"
                                                                    class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </AccordionContent>
                                </AccordionPanel>
                            </Accordion>
                        </div>
                    </div>
                    <AddEdit :isOpenModal="isOpenModal" :item="item" :modalTitle="modalTitle" :data="dataFaqCategories"
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