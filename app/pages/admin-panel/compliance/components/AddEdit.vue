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
    images: '',
    description: '',
    title: '',
    slug: '',
    status: 0,
    icon: 'fas fa-upload',
    color: '0077ff',
    totalPrice: '',
    details: [],
});

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            images: value.images || '',
            description: value.description || '',
            title: value.title || '',
            slug: value.slug || '',
            status: value.status === 1,
            icon: value.icon || 'fas fa-upload',
            color: value.color || '0077ff',
            totalPrice: value.totalPrice || '',
            details: value.details || []
                ? value.details.map(item => ({
                    ...item,
                    status: item.status === 1
                }))
                : []
        };
    } else {
        formData.value = {
            id: null,
            images: '',
            description: '',
            title: '',
            slug: '',
            status: 0,
            icon: 'fas fa-upload',
            color: '0077ff',
            totalPrice: '',
            details: [],
        };
    } 
});

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
        if (formData.value.images.includes('http') || formData.value.images.includes('https')) {
            delete formData.value.images;
        }
        let submitData = {
            ...formData.value,
            status: formData.value.status ? 1 : 0,
            details: formData.value.details.map(item => ({
                ...item,
                status: item.status ? 1 : 0
            }))
        };
        const getData = await $fetchAdmin(`admin/compliances/${props.item.id}`, {
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
            details: formData.value.details.map(item => ({
                ...item,
                status: item.status ? 1 : 0
            }))
        };
        const getData = await $fetchAdmin(`admin/compliances`, {
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

const setOGImage = (value) => {
    formData.value.images = value;
}

const addDetails = () => {
    formData.value.details.push({
        title: '',
        details: '',
        price: '',
        status: 0
    })
}
const removeParam = (index) => {
    formData.value.details.splice(index, 1);
};
// Icon picker
const isOpenPicker = ref(false);
const OpenPicker = () => {
    isOpenPicker.value = true;
}
const cancelPicker = () => {
    isOpenPicker.value = false;
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Compliance</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="col-span-1 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Image</label>
                    <div class="w-full">
                        <PhotoBlockPhoto :getPhoto="formData.images" @set_photo="setOGImage" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.images" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-2 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Textarea v-model="formData.description" class="w-full" placeholder="i.e. Write your description here"
                        :class="validations_errors.description ? 'border-[#f44336!important]' : ''" rows="7"
                        @focus="validations_errors.description = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Title</label>
                    <InputText v-model="formData.title" class="w-full" placeholder="i.e. Web Development"
                        :class="validations_errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.title = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.title" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Slug</label>
                    <InputText v-model="formData.slug" class="w-full" placeholder="i.e. web-development"
                        :class="validations_errors.slug ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.slug = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.slug" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Total Price</label>
                    <InputNumber v-model="formData.totalPrice" class="w-full" :useGrouping="false"
                        :minFractionDigits="2" :maxFractionDigits="2"
                        :class="validations_errors.totalPrice ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.totalPrice = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.totalPrice" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-2 flex items-center gap-4">
                <label class="font-semibold min-w-28">Icon</label>
                <div class="grid grid-cols-2 gap-4 w-full">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <!-- {{ formData.icon }} -->
                            <i @click="OpenPicker" class="text-[30px] cursor-pointer" :class="formData.icon"
                                :style="{ color: `#${formData.color}` }"></i>
                        </div>
                        <InputError class="text-sm mt-1" :message="validations_errors.icon" :text_size="'text-sm'" />
                    </div>
                    <div class="flex items-center gap-4">
                        <label class="font-semibold">Icon Color</label>
                        <div class="flex-auto">
                            <ColorPicker v-model="formData.color" class="w-full" />
                            <InputError class="text-sm mt-1" :message="validations_errors.color" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-1 flex items-center gap-4">
                <label class="font-semibold">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="formData.status" @focus="validations_errors.status = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.status" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                <div class="flex-auto">
                    <div class="flex items-center gap-3">
                        <label class="font-semibold">Details</label>
                        <InputError class="text-sm mt-1" :message="validations_errors.details" />
                    </div>
                    <!-- <pre>{{ formData.details }}</pre> -->
                    <template v-if="formData.details?.length > 0">
                        <Accordion class="border border-gray-300 rounded-lg shadow-lg bg-white mt-3 mb-4">
                            <AccordionPanel v-for="(item, index) in formData.details" :key="index" :value="index">
                                <AccordionHeader>
                                    <div class="flex justify-between w-full">
                                        <span>
                                            {{ item.title }}
                                        </span>
                                        <span class="px-2">
                                            <i @click="removeParam(index)"
                                                class="fa-solid fa-trash cursor-pointer transition duration-150 ease-in-out"></i>
                                        </span>
                                    </div>
                                </AccordionHeader>
                                <AccordionContent class="border-t border-gray-300 pt-4">
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div class="flex items-center gap-4">
                                            <div class="flex-auto">
                                                <label class="font-semibold">Title</label>
                                                <InputText v-model="formData.details[index].title" class="w-full" />
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-4">
                                            <div class="flex-auto">
                                                <label class="font-semibold">Price</label>
                                                <InputNumber v-model="formData.details[index].price" class="w-full"
                                                    :useGrouping="false" :minFractionDigits="2"
                                                    :maxFractionDigits="2" />
                                            </div>
                                        </div>
                                        <div class="flex items-start gap-2 flex-col">
                                            <label class="font-semibold">Status</label>
                                            <div class="flex-auto">
                                                <ToggleSwitch v-model="formData.details[index].status" class="w-full"
                                                    @focus="validations_errors.status = ''" />
                                            </div>
                                        </div>
                                        <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                                            <div class="flex-auto">
                                                <label class="font-semibold">Details</label>
                                                <Editor v-model="formData.details[index].details" class="w-full"
                                                    editorStyle="height: 200px" />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>
                    </template>

                    <div class="flex justify-end gap-2 mt-2">
                        <Button class="flex items-center items-center" @click="addDetails">
                            <!-- <span>Add</span> -->
                            <i class="fa-solid fa-plus text-white text-md"></i>
                        </Button>
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
    <IconPicker :isOpenPicker="isOpenPicker" :modelValue="formData.icon" @close="cancelPicker"
        @update:modelValue="formData.icon = $event" />
</template>


<style lang="scss" scoped></style>