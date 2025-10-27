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
    title: '',
    slug: '',
    cat_id: '',
    photo: '',
    description: '',
    client_name: '',
    project_url: '',
    completion_date: '',
    technologies: '',
    status: 0,
});
const isChecked = ref(false);

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            title: value.title || '',
            slug: value.slug || '',
            cat_id: value.cat_id || '',
            photo: value.photo || '',
            description: value.description || '',
            client_name: value.client_name || '',
            project_url: value.project_url || '',
            completion_date: value.completion_date || '',
            technologies: value.technologies || '',
            status: value.status || 0,
        };
        isChecked.value = value.status == 1 ? true : false;
    } else {
        formData.value = {
            id: null,
            title: '',
            slug: '',
            cat_id: '',
            photo: '',
            description: '',
            client_name: '',
            project_url: '',
            completion_date: '',
            technologies: '',
            status: 0,
        };
        isChecked.value = false;
    }
});

const handleCheckboxChange = () => {
    formData.value.status = isChecked.value ? 1 : 0;
}
const validations_errors = ref({});
const skip_validations = ref([
    'id',
    'photo',
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
        const submitData = { ...formData.value };
        if (submitData.photo?.includes('http') || submitData.photo?.includes('https')) {
            delete submitData.photo;
        }
        const getData = await $fetchAdmin(`admin/portfolios/${props.item.id}`, {
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
            if (e.response?.status === 404 || e.response?.status === 409 || e.response?.status === 422) {
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
        const getData = await $fetchAdmin(`admin/portfolios`, {
            method: 'POST',
            body: formData.value,
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
            // console.log('here 1', e.response);
            if (e.response?.status === 404 || e.response?.status === 409 || e.response?.status === 422) {
                // console.log('here 2', e.response._data.errors);
                for (const key in e.response._data.errors) {
                    if (e.response._data.errors.hasOwnProperty(key)) {
                        const value = e.response._data.errors[key][0];
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

const setPhoto = (photo) => {
    formData.value.photo = photo;
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Portfolios</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- <pre>{{ formData }}</pre> -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Upload Image</label>
                    <div class="w-full ">
                        <PhotoBlockPhoto :getPhoto="formData.photo" @set_photo="setPhoto" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.photo" />
                </div>
            </div>
            <div></div>
            <div></div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Title</label>
                    <InputText v-model="formData.title" class="w-full"
                        :class="validations_errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.title = ''" Placeholder="i.e How to use this website?" />
                    <InputError class="text-sm mt-1" :message="validations_errors.title" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Category</label>
                    <Select v-model="formData.cat_id" :options="data" optionLabel="title" placeholder="Select Category"
                        optionValue="id" class="w-full" @focus="validations_errors.cat_id" />
                    <InputError class="text-sm mt-1" :message="validations_errors.cat_id" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Slug</label>
                    <InputText v-model="formData.slug" class="w-full"
                        :class="validations_errors.slug ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.slug = ''" Placeholder="i.e https://example-slug" />
                    <InputError class="text-sm mt-1" :message="validations_errors.slug" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Client Name</label>
                    <InputText v-model="formData.client_name" class="w-full"
                        :class="validations_errors.client_name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.client_name = ''" Placeholder="i.e Jhon Doe" />
                    <InputError class="text-sm mt-1" :message="validations_errors.client_name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Project Url</label>
                    <InputText v-model="formData.project_url" class="w-full"
                        :class="validations_errors.project_url ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.project_url = ''" Placeholder="i.e https://example.com" />
                    <InputError class="text-sm mt-1" :message="validations_errors.project_url" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Completion Date</label>
                    <DatePicker v-model="formData.completion_date" showIcon fluid iconDisplay="input"
                        :manualInput="false" class="w-full"
                        :class="validations_errors.completion_date ? 'border-[#f44336!important]' : ''"
                        autocomplete="off" @focus="validations_errors.completion_date = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.completion_date" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Editor v-model="formData.description" class="w-full" editorStyle="height: 200px" />
                    <InputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Technologies</label>
                    <InputText v-model="formData.technologies" class="w-full"
                        :class="validations_errors.technologies ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.technologies = ''" Placeholder="i.e Vue, React, Laravel" />
                    <InputError class="text-sm mt-1" :message="validations_errors.technologies" />
                </div>
            </div>
            <div class="flex items-end justify-start gap-4">
                <label class="font-semibold w-14 mb-2">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="isChecked" @change="handleCheckboxChange"
                        @focus="validations_errors.status = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.status" />
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