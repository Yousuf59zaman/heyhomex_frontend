<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object
})

const emit = defineEmits(['add_emit', 'close']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
});

const formData = ref({
    id: null,
    title: '',
    stripe_product_type: 'recurring',
    duration_in_days: null,
    price: null,
    status: 0,
    details: []
});
const isChecked = ref(false);

const productTypes = [
    { label: 'Recurring', value: 'recurring' },
    { label: 'One Time', value: 'one_time' }
];

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            id: value.id,
            title: value.title,
            stripe_product_type: value.stripe_product_type || 'recurring',
            duration_in_days: value.duration_in_days,
            price: parseFloat(value.price),
            status: value.status,
            details: value.details && value.details.length > 0 
                ? value.details.map(detail => ({
                    id: detail.id,
                    detail_title: detail.detail_title,
                    description: detail.description || '',
                    order: detail.order
                }))
                : []
        };
        isChecked.value = value.status == 1 || value.status == true ? true : false;
    } else {
        formData.value = {
            id: null,
            title: '',
            stripe_product_type: 'recurring',
            duration_in_days: null,
            price: null,
            status: 0,
            details: []
        };
        isChecked.value = false;
    }
});

const handleCheckboxChange = () => {
    formData.value.status = isChecked.value ? 1 : 0;
}

// Package Details Management
const addDetail = () => {
    formData.value.details.push({
        detail_title: '',
        description: '',
        order: formData.value.details.length + 1
    });
};

const removeDetail = (index) => {
    formData.value.details.splice(index, 1);
    // Reorder the remaining details
    formData.value.details.forEach((detail, idx) => {
        detail.order = idx + 1;
    });
};

const validations_errors = ref({});
const skip_validations = ref([
    'id',
    'status',
    'price'
]);

const isLoading = ref(false);
const response_modal = ref({});

const updateHandler = async () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(item => 
        !formData.value[item] && 
        !skip_validations.value.includes(item) && 
        item !== 'details'
    );
    
    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        console.log(validations_errors.value);
        return;
    }

    // Validate details
    if (formData.value.details.length === 0) {
        validations_errors.value['details'] = 'At least one package detail is required';
        return;
    }

    for (let i = 0; i < formData.value.details.length; i++) {
        if (!formData.value.details[i].detail_title) {
            validations_errors.value[`details_${i}_detail_title`] = 'Detail title is required';
            return;
        }
    }

    try {
        isLoading.value = true;
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.value.title);
        formDataToSend.append('stripe_product_type', formData.value.stripe_product_type);
        formDataToSend.append('duration_in_days', formData.value.duration_in_days);
        formDataToSend.append('price', formData.value.price);
        formDataToSend.append('status', formData.value.status ? 1 : 0);
        
        // Add details to formData
        formData.value.details.forEach((detail, index) => {
            formDataToSend.append(`details[${index}][detail_title]`, detail.detail_title);
            if (detail.description) {
                formDataToSend.append(`details[${index}][description]`, detail.description);
            }
            formDataToSend.append(`details[${index}][order]`, detail.order);
        });
        
        formDataToSend.append('_method', 'PATCH');
        
        const getData = await $fetchAdmin(`admin/packages/${props.item.id}/update`, {
            method: 'POST',
            body: formDataToSend,
        });
        console.log('coming get data' , getData);
        response_modal.value = getData.data;
        if (getData) {
            emit('add_emit', getData.data);
        }
    } catch (e) {
        console.log('Get Message', e.message);
        if (e.response?.status === 404 || e.response?.status === 422) {
            console.log('here 1', e.response);
            if (e.response?.status === 404 || e.response?.status === 409 || e.response?.status === 422) {
                for (const key in e.response._data.data) {
                    if (e.response._data.data.hasOwnProperty(key)) {
                        const value = e.response._data.data[key][0];
                        validations_errors.value[key] = value;
                    }
                }
            }
        } else if (!e.response?.status) {
            response_modal.value = {
                status: 'error',
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
    const errors = Object.keys(formData.value).filter(item => 
        !formData.value[item] && 
        !skip_validations.value.includes(item) && 
        item !== 'details'
    );
    
    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        console.log(validations_errors.value);
        return;
    }

    // Validate details
    if (formData.value.details.length === 0) {
        validations_errors.value['details'] = 'At least one package detail is required';
        return;
    }

    for (let i = 0; i < formData.value.details.length; i++) {
        if (!formData.value.details[i].detail_title) {
            validations_errors.value[`details_${i}_detail_title`] = 'Detail title is required';
            return;
        }
    }

    try {
        isLoading.value = true;
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.value.title);
        formDataToSend.append('stripe_product_type', formData.value.stripe_product_type);
        formDataToSend.append('duration_in_days', formData.value.duration_in_days);
        formDataToSend.append('price', formData.value.price);
        formDataToSend.append('status', formData.value.status);
        
        // Add details to formData
        formData.value.details.forEach((detail, index) => {
            formDataToSend.append(`details[${index}][detail_title]`, detail.detail_title);
            if (detail.description) {
                formDataToSend.append(`details[${index}][description]`, detail.description);
            }
            formDataToSend.append(`details[${index}][order]`, detail.order);
        });
        
        const getData = await $fetchAdmin(`admin/packages/store`, {
            method: 'POST',
            body: formDataToSend,
        });
        response_modal.value = getData;
        if (getData.status == 'success') {
            emit('add_emit', getData.data);
        }
    } catch (e) {
        console.log('Get Message', e.message);
        if (e.response?.status === 404 || e.response?.status === 422) {
            console.log('here 1', e.response);
            if (e.response?.status === 404 || e.response?.status === 409 || e.response?.status === 422) {
                for (const key in e.response._data.data) {
                    if (e.response._data.data.hasOwnProperty(key)) {
                        const value = e.response._data.data[key][0];
                        validations_errors.value[key] = value;
                    }
                }
            }
        } else if (!e.response?.status) {
            response_modal.value = {
                status: 'error',
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
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Package</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 gap-4">
            <!-- Basic Package Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Package Title <span class="text-red-500">*</span></label>
                        <InputText v-model="formData.title" class="w-full"
                            :class="validations_errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                            @focus="validations_errors.title = ''" placeholder="i.e. Premium Package" />
                        <InputError class="text-sm mt-1" :message="validations_errors.title" />
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Product Type <span class="text-red-500">*</span></label>
                        <Select v-model="formData.stripe_product_type" :options="productTypes" optionLabel="label"
                            optionValue="value" class="w-full"
                            :class="validations_errors.stripe_product_type ? 'border-[#f44336!important]' : ''"
                            @focus="validations_errors.stripe_product_type = ''" />
                        <InputError class="text-sm mt-1" :message="validations_errors.stripe_product_type" />
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Duration (Days) <span class="text-red-500">*</span></label>
                        <InputNumber :useGrouping="false" v-model="formData.duration_in_days" class="w-full"
                            :class="validations_errors.duration_in_days ? 'border-[#f44336!important]' : ''"
                            autocomplete="off" @focus="validations_errors.duration_in_days = ''"
                            placeholder="i.e. 30" />
                        <InputError class="text-sm mt-1" :message="validations_errors.duration_in_days" />
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Price ($) <span class="text-red-500">*</span></label>
                        <InputNumber v-model="formData.price" mode="decimal" :minFractionDigits="2"
                            :maxFractionDigits="2" class="w-full"
                            :class="validations_errors.price ? 'border-[#f44336!important]' : ''" autocomplete="off"
                            @focus="validations_errors.price = ''" placeholder="i.e. 15.00" />
                        <InputError class="text-sm mt-1" :message="validations_errors.price" />
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <label class="font-semibold w-24">Status</label>
                    <div class="flex-auto">
                        <ToggleSwitch v-model="isChecked" @change="handleCheckboxChange"
                            @focus="validations_errors.status = ''" />
                        <InputError class="text-sm mt-1" :message="validations_errors.status" />
                    </div>
                </div>
            </div>

            <!-- Package Details Section -->
            <div class="mt-4">
                <div class="flex justify-between items-center mb-3">
                    <h5 class="text-md font-semibold text-gray-800 dark:text-gray-200">Package Details <span
                            class="text-red-500">*</span></h5>
                    <Button type="button" label="Add Detail" severity="info" size="small" @click="addDetail">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-plus mr-2" :class="iconClass"></i>
                        </template>
                    </Button>
                </div>
                <InputError v-if="validations_errors.details" class="text-sm mb-2"
                    :message="validations_errors.details" />

                <div v-if="formData.details.length === 0" class="text-center py-4 text-gray-500 border border-dashed rounded-lg">
                    No package details added yet. Click "Add Detail" to add features.
                </div>

                <div v-else class="space-y-3">
                    <div v-for="(detail, index) in formData.details" :key="index"
                        class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <div class="flex justify-between items-start mb-3">
                            <h6 class="font-semibold text-gray-700 dark:text-gray-300">Detail #{{ index + 1 }}</h6>
                            <Button type="button" severity="danger" text rounded @click="removeDetail(index)">
                                <template #icon>
                                    <i class="pi pi-trash"></i>
                                </template>
                            </Button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div class="md:col-span-4">
                                <label class="font-semibold text-sm">Detail Title <span
                                        class="text-red-500">*</span></label>
                                <InputText v-model="detail.detail_title" class="w-full"
                                    :class="validations_errors[`details_${index}_detail_title`] ? 'border-[#f44336!important]' : ''"
                                    @focus="validations_errors[`details_${index}_detail_title`] = ''"
                                    placeholder="i.e. Access to all features" />
                                <InputError class="text-sm mt-1"
                                    :message="validations_errors[`details_${index}_detail_title`]" />
                            </div>
                            <div class="md:col-span-4">
                                <label class="font-semibold text-sm">Description (Optional)</label>
                                <InputText v-model="detail.description" class="w-full"
                                    placeholder="i.e. Get 24/7 premium support" />
                            </div>
                            <div class="md:col-span-4">
                                <label class="font-semibold text-sm">Order</label>
                                <InputNumber :useGrouping="false" v-model="detail.order" class="w-full" disabled />
                            </div>
                        </div>
                    </div>
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
