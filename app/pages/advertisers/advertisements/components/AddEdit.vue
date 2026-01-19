<script setup>
const props = defineProps({
    isOpenModal: {
        type: Boolean,
        default: false
    },
    item: {
        type: Object,
        default: () => ({})
    },
    modalTitle: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['close', 'success']);

const visible = computed({
    get: () => props.isOpenModal,
    set: (value) => {
        if (!value) emit('close');
    }
});

const form = ref({
    title: props.item?.title || '',
    description: props.item?.description || '',
    type: props.item?.type || 1,
    media_path: null,
    media_url: props.item?.media_url || '',
    redirect_url: props.item?.redirect_url || '',
    charge_for_impression: props.item?.charge_for_impression ?? true,
    charge_for_click: props.item?.charge_for_click ?? true,
    status: props.item?.status ?? 0,
    starts_at: props.item?.starts_at?.split(' ')[0] || '',
    ends_at: props.item?.ends_at?.split(' ')[0] || '',
    placement: props.item?.placement || 'dashboard',
    height: props.item?.height || 200,
    width: props.item?.width || 1200
});

const errors = ref({});
const isLoading = ref(false);
const response_modal = ref({});
const mediaPreview = ref(props.item?.media_url || null);
const uploadMethod = ref('file'); 

const typeOptions = [
    { value: 1, label: 'Image' },
    { value: 2, label: 'Video' }
];

const placementOptions = [
    { value: 'dashboard', label: 'Dashboard', height: 200, width: 1200 },
    { value: 'search_top', label: 'Search Page Top Bar', height: 150, width: 1000 },
    { value: 'videos_top', label: 'Videos Page Topbar', height: 150, width: 1000 },
    { value: 'videos_first', label: 'Videos Page 1st Video', height: 300, width: 400 }
];

const updateDimensions = () => {
    const selected = placementOptions.find(p => p.value === form.value.placement);
    if (selected) {
        form.value.height = selected.height;
        form.value.width = selected.width;
    }
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.media_path = file;
        mediaPreview.value = URL.createObjectURL(file);
    }
};


watch(() => props.item, (newItem) => {
    if (newItem && Object.keys(newItem).length > 0) {
        // Auto-select placement radio button based on width/height when type === 1
        let selectedPlacement = null;
        if (newItem.type === 1 && newItem.width && newItem.height) {
            const matchingPlacement = placementOptions.find(
                p => p.width === newItem.width && p.height === newItem.height
            );
            if (matchingPlacement) {
                selectedPlacement = matchingPlacement.value;
            }
        }
        
        form.value = {
            title: newItem.title || '',
            description: newItem.description || '',
            type: newItem.type || 1,
            media_path: null,
            media_url: newItem.media_url || '',
            redirect_url: newItem.redirect_url || '',
            charge_for_impression: newItem.charge_for_impression ?? true,
            charge_for_click: newItem.charge_for_click ?? true,
            status: newItem.status ?? 0,
            starts_at: newItem.starts_at?.split(' ')[0] || '',
            ends_at: newItem.ends_at?.split(' ')[0] || '',
            placement: selectedPlacement || '',
            height: newItem.height || null,
            width: newItem.width || null
        };
        
        mediaPreview.value = newItem.media_url || null;
        uploadMethod.value = newItem.media_url ? 'url' : 'file';
    } else {
        form.value = {
            title: '',
            description: '',
            type: 1,
            media_path: null,
            media_url: '',
            redirect_url: '',
            charge_for_impression: true,
            charge_for_click: true,
            status: 0,
            starts_at: '',
            ends_at: '',
            placement: 'dashboard',
            height: 200,
            width: 1200
        };
        mediaPreview.value = null;
        uploadMethod.value = 'file';
    }
    errors.value = {};
}, { deep: true });

const submitHandler = async () => {
    isLoading.value = true;
    errors.value = {};
    response_modal.value = {};

    try {
        const url = props.modalTitle === 'Create'
            ? 'advertiser/advertisements/store'
            : `advertiser/advertisements/${props.item.id}/update`;

        const formData = new FormData();
        formData.append('title', form.value.title);
        formData.append('description', form.value.description);
        formData.append('type', form.value.type);


        if (form.value.type === 1) {

            if (form.value.media_path) {
                formData.append('ad_image', form.value.media_path);
            }
        } else if (form.value.type === 2) {

            if (uploadMethod.value === 'file' && form.value.media_path) {
                formData.append('media_path', form.value.media_path);
            } else if (uploadMethod.value === 'url' && form.value.media_url) {
                formData.append('media_path', form.value.media_url);
            }
        }

        formData.append('redirect_url', form.value.redirect_url);
        formData.append('charge_for_impression', form.value.charge_for_impression ? 1 : 0);
        formData.append('charge_for_click', form.value.charge_for_click ? 1 : 0);
        formData.append('total_impressions', 0);
        formData.append('total_clicks', 0);
        formData.append('height', form.value.height);
        formData.append('width', form.value.width);
        formData.append('status', '1');
        formData.append('starts_at', form.value.starts_at);
        formData.append('ends_at', form.value.ends_at);

        if (props.modalTitle !== 'Create') {
            formData.append('_method', 'PATCH');
        }

        const response = await $fetchCitizen(url, {
            method: 'POST',
            body: formData
        });

        if (response.status === 'success') {
            response_modal.value = {
                status: true,
                message: props.modalTitle === 'Create' ? 'Advertisement created successfully!' : 'Advertisement updated successfully!'
            };
            emit('success', response.data);
            setTimeout(() => {
                emit('close');
            }, 1500);
        }
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response._data.errors || {};
        } else {
            response_modal.value = {
                status: 'error',
                message: e.response?._data?.message || 'Failed to save advertisement. Please try again.'
            };
        }
        console.error('Error:', e.message);
    } finally {
        isLoading.value = false;
    }
};

const cancel = () => {
    emit('close');
};
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '50rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Advertisement</h4>
            </div>
        </template>
        <form @submit.prevent="submitHandler" class="grid grid-cols-1 gap-4">
            <!-- Title -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Title</label>
                    <InputText v-model="form.title" class="w-full" placeholder="Enter advertisement title"
                        :class="errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="errors.title = ''" />
                    <InputError class="text-sm mt-1" v-if="errors.title" :message="errors.title[0]" />
                </div>
            </div>

            <!-- Description -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Textarea v-model="form.description" class="w-full" rows="3" placeholder="Enter description"
                        :class="errors.description ? 'border-[#f44336!important]' : ''"
                        @focus="errors.description = ''" />
                    <InputError class="text-sm mt-1" v-if="errors.description" :message="errors.description[0]" />
                </div>
            </div>

            <!-- Type -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Type</label>
                    <Dropdown v-model="form.type" :options="typeOptions" optionLabel="label" optionValue="value"
                        placeholder="Select type" class="w-full"
                        :class="errors.type ? 'border-[#f44336!important]' : ''" @focus="errors.type = ''" />
                    <InputError class="text-sm mt-1" v-if="errors.type" :message="errors.type[0]" />
                </div>
            </div>

            <!-- Media Upload -->
            <div class="flex flex-col gap-4">
                <div v-if="form.type === 2" class="flex items-center gap-4">
                    <label class="font-semibold">Media Source</label>
                    <div class="flex gap-2">
                        <Button type="button" :severity="uploadMethod === 'file' ? 'primary' : 'secondary'"
                            :outlined="uploadMethod !== 'file'"
                            @click="uploadMethod = 'file'; form.media_url = ''; errors.media_url = ''; errors.media_path = ''"
                            size="small">
                            <i class="pi pi-upload mr-2"></i>
                            Upload File
                        </Button>
                        <Button type="button" :severity="uploadMethod === 'url' ? 'primary' : 'secondary'"
                            :outlined="uploadMethod !== 'url'"
                            @click="uploadMethod = 'url'; form.media_path = null; mediaPreview = null; errors.media_url = ''; errors.media_path = ''"
                            size="small">
                            <i class="pi pi-link mr-2"></i>
                            Add URL
                        </Button>
                    </div>
                </div>

                <!-- File Upload Option -->
                <div v-if="form.type === 1 || (form.type === 2 && uploadMethod === 'file')"
                    class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">{{ form.type === 1 ? 'Image' : 'Video' }} File</label>
                        <input type="file" id="media_path" @change="handleFileChange"
                            :accept="form.type === 1 ? 'image/*' : 'video/*'"
                            class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300" />
                        <div v-if="mediaPreview" class="mt-2">
                            <img v-if="form.type === 1" :src="mediaPreview" alt="Preview" class="h-32 w-auto rounded" />
                            <video v-else :src="mediaPreview" class="h-32 w-auto rounded" controls></video>
                        </div>
                        <InputError class="text-sm mt-1" v-if="errors.media_path || errors.ad_image"
                            :message="errors.media_path?.[0] || errors.ad_image?.[0]" />
                    </div>
                </div>

                <!-- URL Input Option (Video Only) -->
                <div v-if="form.type === 2 && uploadMethod === 'url'" class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Video URL</label>
                        <InputText v-model="form.media_url" class="w-full" type="url"
                            placeholder="https://example.com/video.mp4"
                            :class="errors.media_url ? 'border-[#f44336!important]' : ''" autocomplete="off"
                            @focus="errors.media_url = ''" @input="mediaPreview = form.media_url" />
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Enter the full URL of the {{ form.type === 1 ? 'image' : 'video' }}
                        </p>
                        <div v-if="form.media_url && mediaPreview" class="mt-2">
                            <img v-if="form.type === 1" :src="mediaPreview" alt="Preview" class="h-32 w-auto rounded"
                                @error="mediaPreview = null" />
                            <video v-else :src="mediaPreview" class="h-32 w-auto rounded" controls
                                @error="mediaPreview = null"></video>
                        </div>
                        <InputError class="text-sm mt-1" v-if="errors.media_url" :message="errors.media_url[0]" />
                    </div>
                </div>
            </div>

            <!-- Redirect URL -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Redirect URL</label>
                    <InputText v-model="form.redirect_url" class="w-full" type="url" placeholder="https://example.com"
                        :class="errors.redirect_url ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="errors.redirect_url = ''" />
                    <InputError class="text-sm mt-1" v-if="errors.redirect_url" :message="errors.redirect_url[0]" />
                </div>
            </div>

            <!-- Ad Placement & Dimensions (Only for Image type) -->
            <div v-if="form.type === 1" class="flex flex-col gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Ad Placement</label>
                    <div class="flex flex-col gap-3 mt-2">
                        <div v-for="option in placementOptions" :key="option.value" class="flex items-center">
                            <RadioButton 
                                v-model="form.placement" 
                                :inputId="option.value" 
                                :value="option.value" 
                                @change="updateDimensions" 
                            />
                            <label :for="option.value" class="ml-2 cursor-pointer">
                                {{ option.label }} ({{ option.height }}px × {{ option.width }}px)
                            </label>
                        </div>
                    </div>
                    <InputError class="text-sm mt-1" v-if="errors.placement" :message="errors.placement[0]" />
                </div>
                
                <!-- Display current dimensions -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Height (pixels)</label>
                        <InputNumber v-model="form.height" class="w-full" :min="1" :disabled="true"
                            :class="errors.height ? 'border-[#f44336!important]' : ''" />
                        <InputError class="text-sm mt-1" v-if="errors.height" :message="errors.height[0]" />
                    </div>
                    <div class="flex-auto">
                        <label class="font-semibold">Width (pixels)</label>
                        <InputNumber v-model="form.width" class="w-full" :min="1" :disabled="true"
                            :class="errors.width ? 'border-[#f44336!important]' : ''" />
                        <InputError class="text-sm mt-1" v-if="errors.width" :message="errors.width[0]" />
                    </div>
                </div>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Start Date</label>
                        <InputText v-model="form.starts_at" class="w-full" type="date"
                            :class="errors.starts_at ? 'border-[#f44336!important]' : ''"
                            @focus="errors.starts_at = ''" />
                        <InputError class="text-sm mt-1" v-if="errors.starts_at" :message="errors.starts_at[0]" />
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">End Date</label>
                        <InputText v-model="form.ends_at" class="w-full" type="date"
                            :class="errors.ends_at ? 'border-[#f44336!important]' : ''" @focus="errors.ends_at = ''" />
                        <InputError class="text-sm mt-1" v-if="errors.ends_at" :message="errors.ends_at[0]" />
                    </div>
                </div>
            </div>

            <!-- Charge Options -->
            <div class="flex items-center gap-4">
                <label class="font-semibold">Charge For Impressions (CPM)</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="form.charge_for_impression" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <label class="font-semibold">Charge For Clicks (CPC)</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="form.charge_for_click" />
                </div>
            </div>

            <!-- Status -->
            <!-- <div class="flex items-center gap-4">
                <label class="font-semibold">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="form.status" :binary="true" />
                </div>
            </div> -->
        </form>

        <template #footer class="flex justify-end gap-2 border-gray-200">
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <Button v-if="isLoading" severity="secondary" style="cursor: not-allowed; width: 80px;">
                    <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8" animationDuration=".5s" />
                </Button>
                <template v-else>
                    <Button type="button" label="Cancel" severity="danger" outlined
                        class="transition-all duration-300 hover:scale-105" @click="cancel">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                        </template>
                    </Button>
                    <Button type="button" :label="modalTitle === 'Create' ? 'Create' : 'Update'" severity="success"
                        raised class="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        @click="submitHandler">
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
