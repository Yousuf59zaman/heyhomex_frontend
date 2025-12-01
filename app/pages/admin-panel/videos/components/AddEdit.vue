<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object,
});

const emit = defineEmits(['add_emit', 'close']);

const visible = ref(props.isOpenModal);
watch(
    () => props.isOpenModal,
    (newVal) => {
        visible.value = newVal;
    }
);

// FORM DATA for your video API
const formData = ref({
    id: null,
    channel_id: '',
    title: '',
    duration: '',
    video_url: '',
    description: '',
});

const validations_errors = ref({});
const skip_validations = ref(['id']); // all others required

// When editing, fill the form with existing item
watch(
    () => props.item,
    (value) => {
        if (value && Object.keys(value).length > 0) {
            validations_errors.value = {};
            formData.value = {
                id: value.id,
                channel_id: value.channel_id,
                title: value.title,
                duration: value.duration,
                video_url: value.video_url,
                description: value.description,
            };
        } else {
            formData.value = {
                id: null,
                channel_id: '',
                title: '',
                duration: '',
                video_url: '',
                description: '',
            };
        }
    },
    { immediate: true }
);

const isLoading = ref(false);
const response_modal = ref({});

// COMMON VALIDATION
const validateForm = () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(
        (key) => !formData.value[key] && !skip_validations.value.includes(key)
    );

    if (errors.length > 0) {
        errors.forEach((field) => {
            validations_errors.value[field] = `${field.replaceAll('_', ' ')} is required`;
        });
        return false;
    }

    return true;
};

// UPDATE
const updateHandler = async () => {
    if (!validateForm()) return;

    try {
        isLoading.value = true;

        const payload = {
            ...formData.value,
            duration: String(formData.value.duration),
            _method: 'PATCH', 
        };

        const getData = await $fetchAdmin(`videos/${props.item.id}/update`, {
            method: 'POST',
            body: payload,
        });

        response_modal.value = {
                status: true,
                message: 'Updated Successfully.',
            };

        if (getData.status === 'success') {
            emit('add_emit', getData.data);
        }
    } catch (e) {
        console.log('Get Message', e.message);

        if (e.response?.status === 404 || e.response?.status === 422 || e.response?.status === 409) {
            if (e.response._data?.data) {
                for (const key in e.response._data.data) {
                    if (Object.prototype.hasOwnProperty.call(e.response._data.data, key)) {
                        const value = e.response._data.data[key][0];
                        validations_errors.value[key] = value;
                    }
                }
            } else {
                response_modal.value = {
                    status: false,
                    message: e.response._data?.message || 'Validation error',
                };
            }
        } else if (!e.response?.status) {
            response_modal.value = {
                status: false,
                message: 'Something went wrong. Please try again later.',
            };
        } else {
            response_modal.value = {
                status: e.response._data.status,
                message: e.response._data.message,
            };
        }
    } finally {
        isLoading.value = false;
    }
};

// CREATE
const createHandler = async () => {
    if (!validateForm()) return;

    try {
        isLoading.value = true;

        const payload = {
            ...formData.value,
            duration: String(formData.value.duration), 
        };

        const getData = await $fetchAdmin(`videos/store`, {
            method: 'POST',
            body: payload,
        });

        response_modal.value = {
                status: true,
                message: 'Created Successfully.',
            };

        if (getData.status === 'success') {
            emit('add_emit', getData.data);
        }
    } catch (e) {
        console.log('Get Message', e.message);

        if (e.response?.status === 404 || e.response?.status === 422 || e.response?.status === 409) {
            if (e.response._data?.data) {
                for (const key in e.response._data.data) {
                    if (Object.prototype.hasOwnProperty.call(e.response._data.data, key)) {
                        const value = e.response._data.data[key][0];
                        validations_errors.value[key] = value;
                    }
                }
            } else {
                response_modal.value = {
                    status: false,
                    message: e.response._data?.message || 'Validation error',
                };
            }
        } else if (!e.response?.status) {
            response_modal.value = {
                status: false,
                message: 'Something went wrong. Please try again later.',
            };
        } else {
            response_modal.value = {
                status: e.response._data.status,
                message: e.response._data.message,
            };
        }
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :style="{ width: '50rem' }"
        @update:visible="$emit('close')"
    >
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">
                    {{ modalTitle }} Video
                </h4>
            </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Channel ID</label>
                    <InputNumber
                        :useGrouping="false"
                        v-model="formData.channel_id"
                        class="w-full"
                        :class="validations_errors.channel_id ? 'border-[#f44336!important]' : ''"
                        autocomplete="off"
                        @focus="validations_errors.channel_id = ''"
                    />
                    <InputError class="text-sm mt-1" :message="validations_errors.channel_id" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Title</label>
                    <InputText
                        v-model="formData.title"
                        class="w-full"
                        placeholder="i.e. Test video"
                        :class="validations_errors.title ? 'border-[#f44336!important]' : ''"
                        autocomplete="off"
                        @focus="validations_errors.title = ''"
                    />
                    <InputError class="text-sm mt-1" :message="validations_errors.title" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Duration (minutes)</label>
                    <InputNumber
                        :useGrouping="false"
                        v-model="formData.duration"
                        class="w-full"
                        :class="validations_errors.duration ? 'border-[#f44336!important]' : ''"
                        autocomplete="off"
                        @focus="validations_errors.duration = ''"
                    />
                    <InputError class="text-sm mt-1" :message="validations_errors.duration" />
                </div>
            </div>

            <div class="flex items-center gap-4 md:col-span-2">
                <div class="flex-auto">
                    <label class="font-semibold">Video URL</label>
                    <InputText
                        v-model="formData.video_url"
                        class="w-full"
                        placeholder="https://..."
                        :class="validations_errors.video_url ? 'border-[#f44336!important]' : ''"
                        autocomplete="off"
                        @focus="validations_errors.video_url = ''"
                    />
                    <InputError class="text-sm mt-1" :message="validations_errors.video_url" />
                </div>
            </div>

            <div class="flex items-center gap-4 md:col-span-2">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Textarea
                        v-model="formData.description"
                        rows="4"
                        class="w-full"
                        :class="validations_errors.description ? 'border-[#f44336!important]' : ''"
                        autocomplete="off"
                        @focus="validations_errors.description = ''"
                    />
                    <InputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <Button
                    v-if="isLoading"
                    severity="secondary"
                    style="cursor: not-allowed; width: 80px;"
                >
                    <ProgressSpinner
                        style="width: 25px; height: 25px"
                        strokeWidth="8"
                        animationDuration=".5s"
                    />
                </Button>
                <template v-else>
                    <Button
                        type="button"
                        label="Cancel"
                        severity="danger"
                        outlined
                        class="transition-all duration-300 hover:scale-105"
                        @click="$emit('close')"
                    >
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                        </template>
                    </Button>
                    <Button
                        type="button"
                        :label="modalTitle === 'Create' ? 'Create' : 'Update'"
                        severity="success"
                        raised
                        class="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        @click="modalTitle === 'Create' ? createHandler() : updateHandler()"
                    >
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
