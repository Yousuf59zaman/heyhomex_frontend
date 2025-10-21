<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object,
    data: Array,
})

const myDialog = ref(null)
const showDialog = () => {
    myDialog.value.maximized = true
}

const { $typePackageList, $truncateText } = useNuxtApp();
const typePackageList = $typePackageList();

const emit = defineEmits(['add_emit', 'close']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
});

const formData = ref({
    id: null,
    slug: '',
    name: '',
    description: '',
    status: 0,
    features: [],
    prices: [],
});

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            slug: value.slug,
            name: value.name,
            description: value.description,
            status: value.status === 1,
            features: value.features
                ? value.features.map(item => ({
                    ...item,
                    is_included: item.is_included === 1
                }))
                : [],
            prices: value.prices
                ? value.prices.map(item => ({
                    ...item,
                    billing_cycle: item.billing_cycle,
                    price: item.price,
                    discount: item.discount,
                    final_price: item.final_price,
                }))
                : [],
        };
    } else {
        formData.value = {
            id: null,
            slug: '',
            name: '',
            description: '',
            status: 0,
            features: [],
            prices: [],
        };
    }
});

const validations_errors = ref({ prices: [] });
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
        let submitData = {
            ...formData.value,
            status: formData.value.status ? 1 : 0,
            features: formData.value.features.map(item => ({
                // ...item,
                feature: item.feature,
                description: item.description,
                is_included: item.is_included ? 1 : 0
            })),
            prices: formData.value.prices.map(item => ({
                // ...item,
                billing_cycle: item.billing_cycle,
                price: item.price,
                discount: item.discount,
                final_price: item.final_price,
            }))
        };
        const getData = await $fetchAdmin(`admin/plans/${props.item.id}`, {
            method: 'PUT',
            body: submitData,
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
    // validate top-level fields
    const errors = Object.keys(formData.value).filter(item =>
        !formData.value[item] && !skip_validations.value.includes(item)
    );

    // validate nested fields: prices -> billing_cycle
    formData.value.prices.forEach((item, index) => {
        if (!item.billing_cycle) {
            validations_errors.value[`prices[${index}].billing_cycle`] = '* required';
        }
    });

    // handle top-level validation messages
    if (errors.length > 0) {
        errors.forEach(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
    }

    // if any errors, return early
    if (Object.keys(validations_errors.value).length > 0) {
        console.log(validations_errors.value);
        return;
    }

    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        console.log(validations_errors.value);
        return;
    }

    try {
        isLoading.value = true;
        let submitData = {
            ...formData.value,
            status: formData.value.status ? 1 : 0,
            features: formData.value.features.map(item => ({
                ...item,
                is_included: item.is_included ? 1 : 0
            })),
            prices: formData.value.prices.map(item => ({
                ...item,
                billing_cycle: item.billing_cycle,
                price: item.price,
                discount: item.discount,
                final_price: item.final_price,
            }))
        };
        const getData = await $fetchAdmin(`admin/plans`, {
            method: 'POST',
            body: submitData,
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

// Feature
const openFeature = ref(false);
const featureIndex = ref(null);
const feature = ref('');
const description = ref('');
const is_included = ref(false);
const addFeature = () => {
    openFeature.value = true;
    featureIndex.value = null;
    feature.value = '';
    description.value = '';
    is_included.value = false;
}
const editFeature = (index) => {
    openFeature.value = true;
    featureIndex.value = index;
    feature.value = formData.value.features[index].feature;
    description.value = formData.value.features[index].description;
    is_included.value = formData.value.features[index].is_included;
}
const saveFeature = () => {
    validations_errors.value = {};
    const fields = { feature, description };
    Object.entries(fields).forEach(([key, value]) => {
        if (!value.value) {
            validations_errors.value[key] = '* required';
        } else {
            delete validations_errors.value[key];
        }
    });
    if (Object.keys(validations_errors.value).length) {
        console.log(validations_errors.value);
        return;
    }

    if (featureIndex.value !== null) {
        formData.value.features[featureIndex.value].feature = feature.value;
        formData.value.features[featureIndex.value].description = description.value;
        formData.value.features[featureIndex.value].is_included = is_included.value;
    } else {
        formData.value.features.push({
            feature: feature.value,
            description: description.value,
            is_included: is_included.value,
        });
    }
    openFeature.value = false;
    featureIndex.value = null;
    feature.value = '';
    description.value = '';
    is_included.value = false;
};
const closeFeature = () => {
    openFeature.value = false;
    featureIndex.value = null;
    feature.value = '';
    description.value = '';
    is_included.value = false;
}
const removeFeature = (index) => {
    formData.value.features.splice(index, 1);
};

// Price
const openPrice = ref(false);
const priceIndex = ref(null);
const billing_cycle = ref('');
const price = ref(0);
const discount = ref(0);
const final_price = ref(0);
const addPrice = () => {
    openPrice.value = true;
    priceIndex.value = null;
    billing_cycle.value = '';
    price.value = 0;
    discount.value = 0;
    final_price.value = 0;
}
const editPrice = (index) => {
    openPrice.value = true;
    priceIndex.value = index;
    billing_cycle.value = formData.value.prices[index].billing_cycle;
    price.value = formData.value.prices[index].price;
    discount.value = formData.value.prices[index].discount;
    final_price.value = formData.value.prices[index].final_price;
}
const savePrice = () => {
    validations_errors.value = {};
    const fields = { billing_cycle, price, discount, final_price };
    Object.entries(fields).forEach(([key, value]) => {
        if (!value.value) {
            validations_errors.value[key] = '* required';
        } else {
            delete validations_errors.value[key];
        }
    });
    if (Object.keys(validations_errors.value).length) {
        console.log(validations_errors.value);
        return;
    }

    if (priceIndex.value !== null) {
        formData.value.prices[priceIndex.value].billing_cycle = billing_cycle.value;
        formData.value.prices[priceIndex.value].price = price.value;
        formData.value.prices[priceIndex.value].discount = discount.value;
        formData.value.prices[priceIndex.value].final_price = final_price.value;
    } else {
        formData.value.prices.push({
            billing_cycle: billing_cycle.value,
            price: price.value,
            discount: discount.value,
            final_price: final_price.value,
        });
    }
    openPrice.value = false;
    priceIndex.value = null;
    billing_cycle.value = '';
    price.value = 0;
    discount.value = 0;
    final_price.value = 0;
};
const closePrice = () => {
    openPrice.value = false;
    priceIndex.value = null;
    billing_cycle.value = '';
    price.value = 0;
    discount.value = 0;
    final_price.value = 0;
}
const removePrice = (index) => {
    formData.value.prices.splice(index, 1);
};
</script>

<template>
    <Dialog ref="myDialog" v-model:visible="visible" modal :closable="false" maximizable @show="showDialog"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Plans</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="col-span-1 sm:col-span-2 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Slug</label>
                    <LazyInputText v-model="formData.slug" class="w-full" placeholder="i.e. web-development"
                        :class="validations_errors.slug ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.slug = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.slug" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Name</label>
                    <LazyInputText v-model="formData.name" class="w-full" placeholder="i.e. Web Development"
                        :class="validations_errors.name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.name = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.name" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-2 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Textarea v-model="formData.description" class="w-full" placeholder="i.e. Write your description here"
                        :class="validations_errors.description ? 'border-[#f44336!important]' : ''" rows="2"
                        @focus="validations_errors.description = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div class="col-span-1 flex items-end gap-4">
                <label class="font-semibold mb-2">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="formData.status" @focus="validations_errors.status = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.status" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 w-full gap-4 sm:gap-10">
                    <div class="flex items-start gap-4">
                        <div class="flex-auto">
                            <div class="flex items-center justify-between gap-3 pb-2 mb-6 border-b">
                                <label class="font-semibold">Features</label>
                                <i @click="addFeature"
                                    class="fa-solid fa-plus cursor-pointer transition duration-150 ease-in-out bg-sky-200 dark:bg-sky-900 hover:dark:bg-sky-400 text-sky-500 dark:text-sky-200 hover:text-sky-800 p-2 text-[12px] h-[26px] w-[26px] flex items-center justify-center rounded-full"></i>
                            </div>
                            <!-- <pre>{{ formData.features }}</pre> -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div v-for="(item, index) in formData.features" :key="index"
                                    class="rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-4 bg-white relative group transition-all duration-300">

                                    <!-- Action buttons - Visible on hover -->
                                    <div
                                        class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                        <button @click="editFeature(index)"
                                            class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                            title="Edit Feature">
                                            <i class="fas fa-edit text-emerald-600 text-sm"></i>
                                        </button>
                                        <button @click="removeFeature(index)"
                                            class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                            title="Delete Feature">
                                            <i class="fas fa-trash-alt text-red-600 text-sm"></i>
                                        </button>
                                    </div>

                                    <!-- Feature Content -->
                                    <div class="space-y-4">
                                        <!-- Feature Name -->
                                        <div class="flex items-start gap-3">
                                            <div class="p-2 rounded-lg bg-violet-50 mt-1">
                                                <i class="fas fa-list text-violet-600"></i>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-500">Feature</p>
                                                <p class="font-medium text-gray-900">{{ $truncateText(item.feature, 20)
                                                    }}</p>
                                            </div>
                                        </div>

                                        <!-- Feature Description -->
                                        <div class="flex items-start gap-3">
                                            <div class="p-2 rounded-lg bg-blue-50 mt-1">
                                                <i class="fas fa-chart-bar text-blue-600"></i>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-500">Description</p>
                                                <p class="font-medium text-gray-900 line-clamp-2">{{
                                                    $truncateText(item.description, 50) }}</p>
                                            </div>
                                        </div>

                                        <!-- Feature Status -->
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 rounded-lg bg-gray-50">
                                                <i class="fas fa-toggle-on text-gray-600"></i>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm text-gray-500">Status:</span>
                                                <span v-if="item.is_included == 1"
                                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <i class="fas fa-check mr-1"></i>
                                                    Included
                                                </span>
                                                <span v-else
                                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    <i class="fas fa-times mr-1"></i>
                                                    Not Included
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="flex-auto">
                            <div class="flex items-center justify-between gap-3 pb-2 mb-6 border-b">
                                <label class="font-semibold">Prices</label>
                                <i @click="addPrice"
                                    class="fa-solid fa-plus cursor-pointer transition duration-150 ease-in-out bg-sky-200 dark:bg-sky-900 hover:dark:bg-sky-400 text-sky-500 dark:text-sky-200 hover:text-sky-800 p-2 text-[12px] h-[26px] w-[26px] flex items-center justify-center rounded-full"></i>
                            </div>
                            <!-- <pre>{{ formData.prices }}</pre> -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div v-for="(item, index) in formData.prices" :key="index"
                                    class="rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-4 bg-white relative group transition-all duration-300">
                                    <!-- Action buttons - Only visible on hover -->
                                    <div
                                        class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                        <button @click="editPrice(index)"
                                            class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                            title="Edit Price">
                                            <i class="fas fa-edit text-emerald-600 text-sm"></i>
                                        </button>
                                        <button @click="removePrice(index)"
                                            class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                            title="Delete Price">
                                            <i class="fas fa-trash-alt text-red-600 text-sm"></i>
                                        </button>
                                    </div>

                                    <!-- Price Content -->
                                    <div class="space-y-4">
                                        <!-- Billing Cycle -->
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 rounded-lg bg-blue-50">
                                                <i class="fas fa-clock text-blue-600"></i>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-500">Billing Cycle</p>
                                                <p class="font-medium text-gray-900">{{ item.billing_cycle }}</p>
                                            </div>
                                        </div>

                                        <!-- Price -->
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 rounded-lg bg-emerald-50">
                                                <i class="fas fa-wallet text-emerald-600"></i>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-500">Price</p>
                                                <p class="font-medium text-gray-900">${{ item.price }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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

    <Drawer v-model:visible="openFeature" position="right" :showCloseIcon="false" :dismissable="false">
        <div class="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <div class="flex items-start gap-2">
                        <label class="font-semibold">Feature</label>
                        <LazyInputError class="text-sm mt-1" :message="validations_errors.feature" />
                    </div>
                    <LazyInputText v-model="feature" class="w-full" placeholder="i.e. Unlimited Bandwidth"
                        :class="validations_errors.feature ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.feature = ''" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <div class="flex items-start gap-2">
                        <label class="font-semibold">Description</label>
                        <LazyInputError class="text-sm mt-1" :message="validations_errors.description" />
                    </div>
                    <Textarea v-model="description" class="w-full" placeholder="i.e. Write your description here"
                        :class="validations_errors.description ? 'border-[#f44336!important]' : ''" @focus="validations_errors.description = ''" rows="4"
                        :useGrouping="false" />
                </div>
            </div>
            <div class="flex items-start gap-2 flex-col">
                <label class="font-semibold">Is Included</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="is_included" class="w-full" @focus="validations_errors.status = ''" />
                </div>
            </div>
        </div>
        <template #footer class="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <div class="flex justify-end items-center gap-3">
                <Button type="button" label="Cancel" severity="danger" outlined
                    class="transition-all duration-300 hover:scale-105" @click="closeFeature">
                    <template #icon="{ class: iconClass }">
                        <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                    </template>
                </Button>

                <Button type="button" label="Save" severity="success" raised
                    class="transition-all duration-300 hover:scale-105 hover:shadow-lg" @click="saveFeature">
                    <template #icon="{ class: iconClass }">
                        <i class="pi pi-check-circle mr-2" :class="iconClass"></i>
                    </template>
                </Button>
            </div>
        </template>
    </Drawer>
    <Drawer v-model:visible="openPrice" position="right" :showCloseIcon="false" :dismissable="false">
        <div class="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div class="flex-auto">
                <label class="font-semibold">Price</label>
                <Select v-model="billing_cycle" :options="typePackageList" class="w-full" optionLabel="name"
                    :class="validations_errors.billing_cycle ? 'border-[#f44336!important]' : ''"
                    @focus="validations_errors.billing_cycle = ''" optionValue="key"
                    placeholder="Select Billing Cycle" />
                <LazyInputError class="text-sm mt-1" :message="validations_errors.billing_cycle" />
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Price</label>
                    <InputNumber v-model="price" class="w-full"
                        :class="validations_errors.price ? 'border-[#f44336!important]' : ''"
                        @focus="validations_errors.price = ''" :useGrouping="false" :minFractionDigits="2"
                        :maxFractionDigits="2" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.price" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Discount</label>
                    <InputNumber v-model="discount" class="w-full"
                        :class="validations_errors.discount ? 'border-[#f44336!important]' : ''"
                        @focus="validations_errors.discount = ''" :useGrouping="false" :minFractionDigits="2"
                        :maxFractionDigits="2" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.discount" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Final Price</label>
                    <InputNumber v-model="final_price" class="w-full"
                        :class="validations_errors.final_price ? 'border-[#f44336!important]' : ''"
                        @focus="validations_errors.final_price = ''" :useGrouping="false" :minFractionDigits="2"
                        :maxFractionDigits="2" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.final_price" />
                </div>
            </div>
        </div>
        <template #footer class="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <div class="flex justify-end items-center gap-3">
                <Button type="button" label="Cancel" severity="danger" outlined
                    class="transition-all duration-300 hover:scale-105" @click="closePrice">
                    <template #icon="{ class: iconClass }">
                        <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                    </template>
                </Button>

                <Button type="button" label="Save" severity="success" raised
                    class="transition-all duration-300 hover:scale-105 hover:shadow-lg" @click="savePrice">
                    <template #icon="{ class: iconClass }">
                        <i class="pi pi-check-circle mr-2" :class="iconClass"></i>
                    </template>
                </Button>
            </div>
        </template>
    </Drawer>

    <LazyResponseModal :response_modal="response_modal" />
</template>


<style lang="scss" scoped>
.group:hover {
    transform: translateY(-2px);
}
</style>