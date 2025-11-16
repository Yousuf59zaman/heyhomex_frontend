<script setup>
    // const AddEdit = defineAsyncComponent(()=> import('./components/AddEdit.vue'));
    definePageMeta({layout:'admin'})

    const {$optionsList} = useNuxtApp()
    
    const optionsList = $optionsList();
    const route = useRoute();
    const status = ref(optionsList[0]);
    const search = ref('')


    const paginationConfig = ref({
        data : [],
        lang : 'en',
        align : 'center',
        action : ''
    })

    const isLoading = ref(false)
    const data = ref([])
    const permissions = ref({})
    const loadData = async () => {
        isLoading.value = true;
        permissions.value = {};
        console.log('hitting apiu')
        try{
            const getData = await $fetchAdmin('admin/packages/list'  , {
                method : 'GET',
                body : {
                    paginate : true,
                    page : route.query.page ? route.query.page : 1,
                    search : search.value,
                    status : status.value.key == 'status' ? status.value.key : '',
                    trashed : status.value.key == 'trashed' ? 'only' : ''
                }
            });
            console.log('response coming :' ,  getData.data)
        }
        catch(e){

        }
        finally{

        }
    }

    onMounted(()=>{
        loadData()
    })
</script>

<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="h-full w-full overflow-auto">
            <div class="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-4">
                <div class="w-full md:w-auto flex flex-wrap gap-4">
                    <div class="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
                        <div class="flex items-center gap-2 w-full md:w-auto">
                            <label for="search" class="text-gray-800 dark:text-gray-200">Search</label>
                            <LazyInputText type="text" 
                                class="w-full md:w-auto" />
                        </div>
                        <div class="flex items-center gap-3 w-full md:w-auto">
                            <label for="status" class="text-gray-800 dark:text-gray-200">Status</label>
                            <Select  optionLabel="name" 
                                placeholder="Select" class="w-full md:w-auto" />
                        </div>
                    </div>
                </div>
                <Skeleton v-if="isLoading" width="7rem" height="2.5rem" borderRadius="10px"></Skeleton>
                <Button v-else-if="permissions?.add" label="Create Compliance" @click="addNew" class="text-xs" />
            </div>

            <!-- <LoaderDataFetch v-if="isLoading" class="w-full min-h-[calc(100vh-150px)]" /> -->
            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">Compliances</h4>
                    </div>
                    <div class="p-4">
                        <div class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <th width="80%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Title</span>
                                            </div>
                                        </th>
                                        <th width="5%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Status</span>
                                            </div>
                                        </th>
                                        <th width="10%" v-if="(permissions.edit || permissions.delete) || isLoading">
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
                                            <div class="flex items-center gap-2">
                                                <Skeleton size="5rem"></Skeleton>
                                                <div class="flex flex-col ">
                                                    <Skeleton width="10rem" class="mb-2"></Skeleton>
                                                    <Skeleton width="8rem" class="mb-2"></Skeleton>
                                                    <Skeleton width="5rem" class="mb-2"></Skeleton>
                                                </div>
                                            </div>
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
                                <tbody v-else class="">
                                    <tr v-for="(item, index) in data" :key="index">
                                        <td class="text-gray-800 dark:text-gray-200 text-start">
                                            <div class="flex items-center gap-2">
                                                <img :src="item.images ? item.images : '/svg/not-found-img.svg'"
                                                    class="w-24 h-24 object-cover rounded-md" />
                                                <div class="flex flex-col gap-1 ">
                                                    <span class="text-sm font-semibold">{{ item.title }}</span>
                                                    <span class="text-sm">{{ item.description }}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="flex justify-center items-center">
                                                <span v-if="item.status == 1" class="text-green-600"><i
                                                        class="fa fa-power-off" aria-hidden="true"></i></span>
                                                <span v-else class="text-red-500"><i class="fa fa-power-off"
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
                                                <i @click="editHandler(item)" v-if="permissions.edit"
                                                    class="fa-solid fa-pen-to-square text-gray-800 dark:text-gray-200 hover:text-green-500 cursor-pointer transition duration-150 ease-in-out"></i>
                                                <i @click="openDeleteModal(item.id)" v-if="permissions.delete"
                                                    class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- <AddEdit :isOpenModal="isOpenModal" :item="item" :modalTitle="modalTitle" :data="data"
                        @close="cancelModal" @add_emit="receivedData" />
                    <LazyPagination v-if="!isLoading" class="px-4" :config="paginationConfig" />
                    <LazyConfirmModal :isOpenConModal="isOpenConModal" @confirm="deleteHandler"
                        @update:isOpenConModal="isOpenConModal = $event" />
                    <LazyResponseModal :response_modal="response_modal" /> -->
                </div>
            </div>
        </div>
    </div>
</template>


<style lang="scss" scoped>

</style>