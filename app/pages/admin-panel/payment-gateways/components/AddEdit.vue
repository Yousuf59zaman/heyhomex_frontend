<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object,
    data: Array,
})

const emit = defineEmits(['add_emit', 'close']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
});

const formData = ref({
    id: null,
    name: '',
    param: {},
    status: 0,
});
const isChecked = ref(false);

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            name: value.name,
            status: value.status,
            param: value.param || {},
        };
        isChecked.value = value.status == 1 ? true : false;

        // Populate the paramList with the existing key-value pairs
        paramList.value = Object.entries(value.param || {}).map(([key, value]) => ({ key, value }));
        if (paramList.value.length === 0) addParam();

    } else {
        formData.value = {
            id: null,
            name: '',
            param: {},
            status: 0,
        };
        isChecked.value = false;
        paramList.value = [];
    }
    validations_errors.value = {};
});

// Handle dynamic key-value pairs
const paramList = ref([
    { key: '', value: '' }
]);
const addParam = () => {
    paramList.value.push({ key: '', value: '' });
};
const removeParam = (index) => {
    paramList.value.splice(index, 1);
};
watch(paramList, (newList) => {
    const updatedParam = {};
    newList.forEach((entry) => {
        if (entry.key) updatedParam[entry.key] = entry.value;
    });
    formData.value.param = updatedParam;
}, { deep: true });


const handleCheckboxChange = () => {
    formData.value.status = isChecked.value ? 1 : 0;
}
const validations_errors = ref({});
const skip_validations = ref([
    'id',
    'status',
]);

const isLoading = ref(false);
const response_modal = ref({});
const updateHandler = async () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(item => !formData.value[item] && !skip_validations.value.includes(item));
    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        console.log(validations_errors.value);
        return;
    }

    try {
        isLoading.value = true;
        const formDataValue = {
            ...formData.value,
            param: JSON.stringify(formData.value.param),
        };
        const getData = await $fetchAdmin(`admin/payment-gateways/${props.item.id}`, {
            method: 'PUT',
            body: formDataValue,
        });
        response_modal.value = getData;
        if (getData.status == true) {
            emit('add_emit', getData.data);
        }
        if (getData.status == true) {
            response_modal.value = getData;
        }
    } catch (e) {
        console.log('Get Message', e.message);
        // console.log('Get response',e.response);
        if (e.response?.status === 404 || e.response?.status === 422) {
            console.log('here 1', e.response);
            if (e.response?.status === 404 || e.response?.status === 409) {
                // console.log('here 2', e.response._data.data);
                for (const key in e.response._data.data) {
                    if (e.response._data.data.hasOwnProperty(key)) {
                        const value = e.response._data.data[key][0];
                        validations_errors.value[key] = value;
                    }
                }
            }
        } else if (!e.response?.status) {
            response_modal.value = {
                status: false,
                message: 'Something went wrong. Please try again later.',
            }
        } else {
            response_modal.value = {
                status: e.response._data.status,
                message: e.response._data.message,
            }

        }
    } finally {
        isLoading.value = false;
    }
}

const createHandler = async () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(item => !formData.value[item] && !skip_validations.value.includes(item));
    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        console.log(validations_errors.value);
        return;
    }

    try {
        isLoading.value = true;
        const formDataValue = {
            ...formData.value,
            param: JSON.stringify(formData.value.param),
        };
        const getData = await $fetchAdmin(`admin/payment-gateways`, {
            method: 'POST',
            body: formDataValue,
        });
        response_modal.value = getData;
        if (getData.status == true) {
            emit('add_emit', getData.data);
        }
        if (getData.status == true) {
            response_modal.value = getData;
        }
    } catch (e) {
        console.log('Get Message', e.message);
        // console.log('Get response',e.response);
        if (e.response?.status === 404 || e.response?.status === 422) {
            console.log('here 1', e.response);
            if (e.response?.status === 404 || e.response?.status === 409) {
                // console.log('here 2', e.response._data.data);
                for (const key in e.response._data.data) {
                    if (e.response._data.data.hasOwnProperty(key)) {
                        const value = e.response._data.data[key][0];
                        validations_errors.value[key] = value;
                    }
                }
            }
        } else if (!e.response?.status) {
            response_modal.value = {
                status: false,
                message: 'Something went wrong. Please try again later.',
            }
        } else {
            response_modal.value = {
                status: e.response._data.status,
                message: e.response._data.message,
            }

        }
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '50rem' }"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Gateways</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 gap-4">
            <div class="flex items-center gap-4">
                <label class="font-semibold w-24">Name</label>
                <div class="flex-auto">
                    <LazyInputText v-model="formData.name" class="w-full" placeholder="i.e. PayPal"
                        :class="validations_errors.name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.name = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <label class="font-semibold w-24">Variable</label>
                <div class="flex-auto">
                    <div class="custom_table overflow-auto border-b border-gray-200">
                        <table class="table table-auto">
                            <thead class="sticky z-10 top-0">
                                <tr>
                                    <th width="30%">
                                        <div
                                            class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                            <span>Key</span>
                                        </div>
                                    </th>
                                    <th width="60%">
                                        <div
                                            class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                            <span>Value</span>
                                        </div>
                                    </th>
                                    <th width="5%">
                                        <div
                                            class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                            <span>Action</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(entry, index) in paramList" :key="index">
                                    <td>
                                        <LazyInputText v-model="entry.key" class="w-full" placeholder="Enter Key" />
                                    </td>
                                    <td>
                                        <LazyInputText v-model="entry.value" class="w-full" placeholder="Enter Value" />
                                    </td>
                                    <td class="text-center">
                                        <i @click="removeParam(index)"
                                            class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"></i>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-end gap-2 mt-2">
                        <Button class="flex items-center items-center" @click="addParam">
                            <span>Add</span>
                            <i class="fa-solid fa-plus text-white text-md"></i>
                        </Button>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <label class="font-semibold w-24">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="isChecked" @change="handleCheckboxChange"
                        @focus="validations_errors.status = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.status" />
                </div>
            </div>
        </div>

        <template #footer class="flex justify-end gap-2 border-gray-200">
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <Button v-if="isLoading" severity="secondary" style="cursor: not-allowed; width: 80px;">
                    <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8" animationDuration=".5s" />
                </Button>
                <template v-else>
                    <Button type="button" label="Cancel" severity="danger" outlined
                        class="transition-all duration-300 hover:scale-105" @click="$emit('close')">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                        </template>
                    </Button>
                    <Button type="button" :label="modalTitle === 'Create' ? 'Create' : 'Update'" severity="success"
                        raised class="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        @click="modalTitle === 'Create' ? createHandler() : updateHandler()">
                        <template #icon="{ class: iconClass }">
                            <i :class="modalTitle === 'Create' ? 'pi pi-plus-circle mr-2' : 'pi pi-refresh mr-2'"></i>
                        </template>
                    </Button>
                </template>
            </div>
        </template>
    </Dialog>
    <LazyResponseModal :response_modal="response_modal" />
</template>


<style lang="scss" scoped></style>