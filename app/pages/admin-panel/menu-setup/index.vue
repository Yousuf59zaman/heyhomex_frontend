<script setup>
// import menuData from '~/assets/json/menuData.json';
// const data = ref(menuData.data);

const NestedLayer = defineAsyncComponent(() => import( './components/NestedLayer'))
const FloatingActionBtn = defineAsyncComponent(() => import( './components/FloatingActionBtn'))
const TextInput = defineAsyncComponent(() => import( './components/TextInput'))
const SkeletonLoader = defineAsyncComponent(() => import( './components/SkeletonLoader'))
// const Button = defineAsyncComponent(() => import( './components/Button'))
const AddNew = defineAsyncComponent(() => import( './components/AddNew'))
const ContentHeaderSection = defineAsyncComponent(() => import( './components/ContentHeaderSection'))

definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const form = ref({
    id: null,
    node_name: null,
    route_name: null,
    route_location: null,
    pid: null,
    icon: 'fas fa-upload',
    status: false,
    serials: null,
});

const loader = ref(false);
const menuData = ref([]);
const loadData = async () => {
    loader.value = true;
    try {
        const getData = await $fetchAdmin(`admin/tree-entity/build-menu`, {
            method: 'GET',
        });
        menuData.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        loader.value = false;
    }
};

onMounted(() => {
    loadData();
});

const reset = () => {
    Object.assign(form.value, {
        id: null,
        node_name: null,
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
        const getData = await $fetchAdmin(`admin/tree-entity/update-menu`, {
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
                    <div class="w-full flex flex-wrap justify-end gap-4 mb-4">
                        <Button label="Add New" @click="addNew" class="text-xs" />
                    </div>
                    <form @submit.prevent="savemenu">
                        <NestedLayer :menus="menuData" :fromData="form" @deleteMenu="loadData" @updateMenu="loadData" />
                        <FloatingActionBtn :icon="'fa fa-check'" :loader="isLoading" @dataSubmit="savemenu(menuData)" />
                    </form>
                </div>
            </div>
        </div>
        <AddNew :isOpenModal="isOpenModal" @close="cancelModal" @dataSubmit="updateForm($event)" />
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
