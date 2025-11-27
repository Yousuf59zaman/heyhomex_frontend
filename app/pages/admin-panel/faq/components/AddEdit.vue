<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object,
    data: Array,
})
const { $typetList } = useNuxtApp();
const typetList = $typetList();

const emit = defineEmits(['add_emit', 'close']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
});

const formData = ref({
    id: null,
    title: '',
    type: '',
    cat_id: '',
    embed_url: '',
    attachment: '',
    description: '',
    status: 0,
});
const isChecked = ref(false);

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            title: value.title,
            description: value.description,
            type: value.type,
            cat_id: value.cat_id,
            status: value.status,
        };
        isChecked.value = value.status == 1 ? true : false;
    } else {
        formData.value = {
            id: null,
            title: '',
            type: '',
            cat_id: '',
            embed_url: '',
            attachment: '',
            description: '',
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
    'status',
    'embed_url',
    'attachment',
    'description',
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
        const getData = await $fetchAdmin(`admin/faqs/${props.item.id}`, {
            method: 'PUT',
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
        const getData = await $fetchAdmin(`admin/faqs`, {
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

const setPhoto = (photo) => {
    formData.value.attachment = photo;
}

const isLoadingPdf = ref(false);
const previewPdf = ref(false)
const previewFile = () => {
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB

    if (fileInput.files.length === 0) {
        previewPdf.value = false;
        filePreview.innerText = 'No file selected';
        filePreview.style.color = 'black';
        return;
    }

    const file = fileInput.files[0];

    // Show loader if the file is too large
    if (file.size > MAX_SIZE) {
        isLoadingPdf.value = true;
        previewPdf.value = false;
        filePreview.innerText = 'Upload file is larger than 25MB';
        filePreview.style.color = 'red';
        setTimeout(() => {
            isLoadingPdf.value = false;
        }, 1000);
        return;
    }

    // Start file processing (loading preview)
    isLoadingPdf.value = true;
    const reader = new FileReader();

    reader.onload = (e) => {
        formData.value.attachment = e.target.result;
        setTimeout(() => {
            isLoadingPdf.value = false;  // Hide loader after file processing is done
        }, 500); // Simulating some delay, adjust as necessary
    };

    reader.readAsDataURL(file);

    const fileURL = URL.createObjectURL(file); // Faster than reading as base64
    previewPdf.value = true;
    filePreview.style.color = 'black';

    requestAnimationFrame(() => {
        if (file.type.includes('image')) {
            filePreview.innerHTML = `<img src="${fileURL}" alt="preview" class="w-full h-[300px] object-cover">`;
        } else if (file.type.includes('pdf')) {
            filePreview.innerHTML = `<embed src="${fileURL}" type="application/pdf" width="100%" height="300px">`;
        } else {
            previewPdf.value = false;
            filePreview.innerText = `File name: ${file.name}\nPreview not available for ${file.type}`;
        }
    });
};

const reset = () => {
    previewPdf.value = false;
    formData.value.embed_url = '';
    formData.value.attachment = '';
    formData.value.description = '';
}

const cancelHandler = () => {
    emit('close');
    reset();
}

const handleType = () => {
    reset();
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '50rem' }"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Faq</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 gap-4">
            <!-- <pre>{{ formData }}</pre> -->
            <div class="flex items-center gap-4">
               
                <div class="flex-auto">
                    <label class="font-semibold w-32">Title <span class="text-red-600"> *</span></label>
                    <InputText v-model="formData.title" class="w-full"
                        :class="validations_errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.title = ''" Placeholder="i.e How to use this website?" />
                    <InputError class="text-sm mt-1" :message="validations_errors.title" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                
                <div class="flex-auto">
                    <label class="font-semibold w-32">Category <span class="text-red-600"> *</span></label>
                    <Select v-model="formData.cat_id" :options="data" optionLabel="title" placeholder="Select Category"
                        optionValue="id" class="w-full" @focus="validations_errors.cat_id" />
                    <InputError class="text-sm mt-1" :message="validations_errors.cat_id" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                
                <div class="flex-auto">
                    <label class="font-semibold w-32">Type <span class="text-red-600"> *</span></label>
                    <Select v-model="formData.type" :options="typetList" optionLabel="name" placeholder="Select Type"
                        optionValue="id" class="w-full" @focus="validations_errors.type" @change="handleType" />
                    <InputError class="text-sm mt-1" :message="validations_errors.type" />
                </div>
            </div>

            <div v-if="formData.type == 1" class="flex items-center gap-4">
                
                <div class="flex-auto">
                    <label class="font-semibold w-32">Description <span class="text-red-600"> *</span></label>
                    <Editor v-model="formData.description" class="w-full" editorStyle="height: 200px" rows="5"
                        cols="30" />
                    <InputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div v-if="formData.type == 2" class="flex items-center gap-4">
                <label class="font-semibold w-32">Image Upload</label>
                <div class="flex-auto">
                    <div class="w-[250px] ">
                        <PhotoBlockPhoto :getPhoto="formData.attachment" @set_photo="setPhoto" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.attachment" />
                </div>
            </div>
            <div v-if="formData.type == 3" class="flex items-center gap-4">
                <label class="font-semibold w-32">File Upload</label>
                <div class="flex-auto">
                    <div class="file_upload p-5 relative w-full border-4 border-dotted border-gray-300 rounded-lg">
                        <svg v-if="!previewPdf" class="text-sky-500 w-24 mx-auto mb-4"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>

                        <div class="input_field flex flex-col w-full text-center">
                            <div id="filePreview"
                                :class="{ 'border-4 border-dotted border-gray-300 rounded-lg mt-3 p-2': previewPdf }"
                                class="title text-sky-500 uppercase w-full">
                                <!-- Display loader if the file is too large or being processed -->
                                <div v-if="isLoadingPdf"
                                    class="loader absolute inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                                    <svg class="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                                            fill="none">
                                        </circle>
                                        <path fill="currentColor" d="M4 12a8 8 0 118 8"></path>
                                    </svg>
                                </div>
                            </div>

                            <label class="mt-4">
                                <input id="fileInput" class="text-sm cursor-pointer w-36 hidden" type="file"
                                    :onchange="previewFile">
                                <div
                                    class="text bg-sky-600 text-white border border-gray-300 rounded font-semibold cursor-pointer px-4 py-2 hover:bg-sky-500">
                                    {{ !previewPdf ? 'Choose File' : 'Change File' }}
                                </div>
                            </label>
                        </div>
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.attachment" />
                </div>
            </div>
            <div v-if="formData.type == 4" class="flex items-center gap-4">
                <label class="font-semibold w-32">Embed URL</label>
                <div class="flex-auto">
                    <InputText v-model="formData.embed_url" class="w-full"
                        :class="validations_errors.embed_url ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.embed_url = ''"
                        Placeholder="i.e https://www.youtube.com/watch?v=P-I4Bay5SXo" />
                    <InputError class="text-sm mt-1" :message="validations_errors.embed_url" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <label class="font-semibold w-32">Status</label>
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