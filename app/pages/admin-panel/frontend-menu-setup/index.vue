<script setup>
// import menuData from '~/assets/json/menuData.json';
// const data = ref(menuData.data);
// import Button from './components/Button';

const NestedLayer = defineAsyncComponent(() => import('./components/NestedLayer'));
const TextInput = defineAsyncComponent(() => import('./components/TextInput'));
const SkeletonLoader = defineAsyncComponent(() => import('./components/SkeletonLoader'));
const AddNew = defineAsyncComponent(() => import('./components/AddNew'));
const ContentHeaderSection = defineAsyncComponent(() => import('./components/ContentHeaderSection'));

definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const form = ref({
    id: null,
    menu_name: null,
    route_name: null,
    route_location: null,
    pid: null,
    icon: 'fas fa-upload',
    status: false,
    serials: null,
});

const position_id = ref(null);
const isPositionLoading = ref(false)
const positionData = ref([]);
const permissions = ref({});
const loadPositionData = async () => {
    isPositionLoading.value = true;
    permissions.value = {};
    try {
        const getData = await $fetchAdmin(`admin/positions/all`, {
            method: 'POST',
            body: {
                status: 1,
            },
        });
        positionData.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isPositionLoading.value = false;
    }
};

const loader = ref(false);
const menuData = ref([]);
const loadData = async () => {
    loader.value = true;
    try {
        const getData = await $fetchAdmin(`admin/menu/build-menu`, {
            method: 'POST',
            body: {
                position_id: position_id.value,
                status: 1,
            }
        });
        menuData.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        loader.value = false;
    }
};

onMounted(() => {
    loadPositionData();
    loadData();
});

const reset = () => {
    Object.assign(form.value, {
        id: null,
        menu_name: null,
        route_name: null,
        route_location: null,
        pid: null,
        icon: 'fas fa-upload',
        status: false,
        serials: null,
    });
};

const store = () => {
    console.log('Storing form data:', form.value);
};
const updateForm = (e) => {
    menuData.value.push(e);
    console.log('e:', e);
};

const isLoading = ref(false);
const response_modal = ref({});
const savemenu = async (adata) => {
    // console.log('Saving menu:', adata);
    isLoading.value = true;
    try {
        const getData = await $fetchAdmin(`admin/menu/update-menu`, {
            method: 'POST',
            body: adata
        });
        if (getData.status == true) {
            response_modal.value = getData;
        }
    } catch (e) {
        // console.log('here 1',e.response);
        if (e.response?.status === 404 || e.response?.status === 409) {
            // console.log('here 2',e.response._data);
            response_modal.value = e.response._data;
        }
    } finally {
        isLoading.value = false;
    }
};

const isOpenModal = ref(false);
const cancelModal = () => {
    isOpenModal.value = false;
    console.log('isOpenModal', isOpenModal.value);
}
const addNew = () => {
    isOpenModal.value = true;
}
</script>

<template>
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-3">
        <div class="container m-auto grid grid-cols-1">
            <div v-if="loader" class="container m-auto grid grid-cols-1">
                <SkeletonLoader />
            </div>
            <div v-else class=" flex justify-center">
                <LoaderDataFetch v-if="loader" class="w-full min-h-[calc(100vh-80px)]" />
                <div v-else class="w-full bg-white dark:bg-gray-800 rounded-md shadow p-5">
                    <div class="w-full flex flex-wrap justify-between gap-4 mb-4">
                        <div v-if="isPositionLoading" class="flex-auto">
                            <Skeleton height="40px" width="100%" borderRadius="8px" class="min-w-[200px]" />
                        </div>
                        <div v-else class="flex-auto">
                            <Select v-model="position_id" :options="positionData" optionLabel="name" @change="loadData"
                                placeholder="Select Position" optionValue="id" class="w-full min-w-[200px]" />
                        </div>
                        <div class="flex items-center">
                            <Button label="Add New Menu" @click="addNew" class="text-xs" />
                        </div>
                    </div>
                    <form @submit.prevent="savemenu">
                        <template v-if="!position_id">
                            <div class="flex flex-col items-center justify-center py-16">
                                <div class="mb-4 flex items-center justify-center rounded-full bg-blue-50 border border-blue-100 shadow-sm"
                                    style="width: 72px; height: 72px;">
                                    <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <rect x="4" y="7" width="16" height="10" rx="2" stroke-width="2" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 10h8M9 13h6" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 17v2" />
                                        <circle cx="12" cy="19.5" r="0.5" fill="currentColor" />
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-semibold text-gray-700 mb-2">Please select a position</h2>
                                <p class="text-gray-500">To view or manage menu items, choose a position from the
                                    dropdown above.</p>
                            </div>
                        </template>
                        <template v-else-if="Array.isArray(menuData) && menuData.length === 0">
                            <div class="flex flex-col items-center justify-center py-16">
                                <div class="mb-4">
                                    <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke-width="2" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 12h8M12 8v8" />
                                    </svg>
                                </div>
                                <h2 class="text-2xl font-semibold text-gray-700 mb-2">No menu data found</h2>
                                <p class="text-gray-500">There are no menu items for the selected position.<br>Add a new
                                    menu item to get started!</p>
                                <Button label="Add New Menu" @click="addNew" class="mt-6" icon="pi pi-plus-circle" />
                            </div>
                        </template>
                        <template v-else>
                            <NestedLayer :child="menuData" :fromData="form" @deleteMenu="loadData"
                                @updateMenu="loadData" />
                            <LazyFloatingActionBtn :icon="'fa fa-check'" :loader="isLoading"
                                @dataSubmit="savemenu(menuData)" />
                        </template>
                    </form>
                </div>
            </div>
        </div>
        <AddNew :isOpenModal="isOpenModal" @close="cancelModal" @dataSubmit="updateForm($event)"
            :positionData="positionData" :isPositionLoading="isPositionLoading" />
        <LazyResponseModal :response_modal="response_modal" />
    </div>
</template>

<style lang="scss" scoped>
$checkbox_size: 20;

.nested_drag {
    min-height: 50px;
    outline: 1px dashed;

    &>li .nested_drag {
        margin-left: 25px
    }
}

.office_layer_map_block {
    display: block;
    position: relative;
    padding-bottom: 50px;
    width: 100%;

    .office_layer_setup_block {
        display: block;

        &>div {
            display: flex;
            gap: 10px;
            align-items: center;

            .checkbox_block {
                display: inline-block;
                width: #{$checkbox_size}px;
                height: #{$checkbox_size}px;
                line-height: #{$checkbox_size}px;
                text-align: center;
                font-size: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.4s;

                &>i {
                    display: none;
                    opacity: 0;
                    line-height: #{$checkbox_size}px;
                    transition: all 0.4s;
                }

                &:hover {
                    color: #ccc;
                    border-color: #ccc;

                    &>i.checked {
                        display: block;
                        opacity: 1;
                    }
                }

                &.active {
                    color: #006699;
                    border-color: #006699;

                    &>i.checked {
                        display: block;
                        opacity: 1;
                    }

                    &:hover {
                        color: #CD0000;
                        border-color: #CD0000;

                        &>i.checked {
                            display: none;
                            opacity: 0
                        }

                        &>i.remove {
                            display: block;
                            opacity: 1;
                        }
                    }
                }
            }

            .info_block {
                &.active {
                    font-weight: 600;
                }
            }
        }
    }
}
</style>
