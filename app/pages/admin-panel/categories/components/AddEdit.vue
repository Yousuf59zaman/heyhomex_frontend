<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object,
    data: Array,
});

const emit = defineEmits(['add_emit', 'close']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
});

const formData = ref({
    id: null,
    name: '',
    slug: '',
    description: '',
    is_active: 1,
    category_image: null
});

const isChecked = ref(false);
const imagePreview = ref(null);
const fileInput = ref(null);

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            id: value.id || null,
            name: value.name || '',
            slug: value.slug || '',
            description: value.description || '',
            is_active: value.is_active ?? 1,
            category_image: null
        };
        isChecked.value = value.is_active == 1 ? true : false;
        imagePreview.value = value.category_image || null;
    } else {
        formData.value = {
            id: null,
            name: '',
            slug: '',
            description: '',
            is_active: 1,
            category_image: null
        };
        isChecked.value = true;
        imagePreview.value = null;
    }
}, { immediate: true });

// Auto-generate slug from name
watch(() => formData.value.name, (newName) => {
    if (!props.item || !props.item.id) { // Only auto-generate for new categories
        formData.value.slug = newName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    }
});

const validations_errors = ref({});
const skip_validations = ref([
    'id',
    'description',
    'is_active',
    'category_image'
]);

const isLoading = ref(false);
const response_modal = ref({});

const handleCheckboxChange = () => {
    formData.value.is_active = isChecked.value ? 1 : 0;
};

// Handle image selection
const onFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        formData.value.category_image = file;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const removeImage = () => {
    formData.value.category_image = null;
    imagePreview.value = props.item?.category_image || null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const updateHandler = async () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(item => !formData.value[item] && !skip_validations.value.includes(item));
    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        return;
    }

    try {
        isLoading.value = true;
        const submitFormData = new FormData();
        submitFormData.append('name', formData.value.name.trim());
        submitFormData.append('slug', formData.value.slug.trim());
        submitFormData.append('is_active', formData.value.is_active ? '1' : '0');
        submitFormData.append('_method', 'PATCH');

        if (formData.value.description) {
            submitFormData.append('description', formData.value.description.trim());
        }

        if (formData.value.category_image instanceof File) {
            submitFormData.append('category_image', formData.value.category_image);
        }
        
        const getData = await $fetchAdmin(`categories/${props.item.id}/update`, {
            method: 'POST',
            body: submitFormData
        });
        
        response_modal.value = getData;
        if (getData.status == true || getData.status == 'success') {
            emit('add_emit', getData.data);
        }
    } catch (e) {
        console.log('Get Message', e.message);
        if (e.response?.status === 422) {
            if (e.response?._data?.errors) {
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
};

const createHandler = async () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(item => !formData.value[item] && !skip_validations.value.includes(item));
    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        return;
    }

    try {
        isLoading.value = true;
        const submitFormData = new FormData();
        submitFormData.append('name', formData.value.name.trim());
        submitFormData.append('slug', formData.value.slug.trim());
        submitFormData.append('is_active', formData.value.is_active ? '1' : '0');

        if (formData.value.description) {
            submitFormData.append('description', formData.value.description.trim());
        }

        if (formData.value.category_image instanceof File) {
            submitFormData.append('category_image', formData.value.category_image);
        }
        
        const getData = await $fetchAdmin(`categories/store`, {
            method: 'POST',
            body: submitFormData,
        });
        
        response_modal.value = getData;
        if (getData.status == true || getData.status == 'success') {
            emit('add_emit', getData.data);
        }
    } catch (e) {
        console.log('Get Message', e.message);
        if (e.response?.status === 422) {
            if (e.response?._data?.errors) {
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
};
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '40rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Video Category</h4>
            </div>
        </template>
        <form class="grid grid-cols-1 gap-4">
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Name <span class="text-red-500">*</span></label>
                    <InputText v-model="formData.name" class="w-full" placeholder="e.g., Action Movies"
                        :class="validations_errors.name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.name = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Slug <span class="text-red-500">*</span></label>
                    <InputText v-model="formData.slug" class="w-full" placeholder="e.g., action-movies"
                        :class="validations_errors.slug ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.slug = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.slug" />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        URL-friendly version of the name
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Textarea v-model="formData.description" class="w-full" 
                        placeholder="Enter category description" rows="4"
                        :class="validations_errors.description ? 'border-[#f44336!important]' : ''" 
                        autocomplete="off"
                        @focus="validations_errors.description = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Category Image</label>
                    
                    <!-- Image Preview -->
                    <div v-if="imagePreview" class="mb-3">
                        <div class="relative inline-block">
                            <img 
                                :src="imagePreview" 
                                alt="Preview" 
                                class="w-40 h-40 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                                @click="removeImage"
                                type="button"
                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <i class="pi pi-times text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Upload Button -->
                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="onFileSelect"
                    />
                    <Button 
                        @click="triggerFileInput"
                        type="button"
                        label="Choose Image"
                        icon="pi pi-upload"
                        outlined
                        class="p-button-outlined"
                    />
                    <InputError class="text-sm mt-1" :message="validations_errors.category_image" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <label class="font-semibold">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="isChecked" @change="handleCheckboxChange"
                        @focus="validations_errors.is_active = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.is_active" />
                </div>
            </div>
        </form>

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