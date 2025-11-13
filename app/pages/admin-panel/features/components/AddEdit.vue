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
    description: '',
    icon: 'fas fa-upload',
    color: '0077ff',
    status: 0,
});
const isChecked = ref(false);

watch(() => props.item, (value) => {
    if (value) {
        validations_errors.value = {};
        formData.value = {
            name: value.name || '',
            description: value.description || '',
            icon: value.icon || 'fas fa-upload',
            color: value.color || '0077ff',
            status: value.status || 0,
        };
        isChecked.value = value.status == 1 ? true : false;
    }
});

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
        const getData = await $fetchAdmin(`admin/features/${props.item.id}`, {
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
        if (e.response?.status === 404 || e.response?.status === 422) {
            if (e.response?.status === 404 || e.response?.status === 409) {
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
        const getData = await $fetchAdmin(`admin/features`, {
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
        if (e.response?.status === 404 || e.response?.status === 422) {
            if (e.response?.status === 404 || e.response?.status === 409) {
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
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '40rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Feature</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 gap-4">
            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-28">Name</label>
                <div class="flex-auto">
                    <InputText v-model="formData.name" class="w-full" placeholder="i.e Facebook"
                        :class="validations_errors.name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.name = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-28">Description</label>
                <div class="flex-auto">
                    <Textarea v-model="formData.description" class="w-full" placeholder="i.e https://www.example.com" rows="3"
                        :class="validations_errors.description ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.description = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-28">Icon</label>
                <div class="grid grid-cols-2 gap-4 w-full">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <i @click="OpenPicker" :class="formData.icon + ' text-[40px] cursor-pointer'"
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
            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-28">Status</label>
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
    <IconPicker :isOpenPicker="isOpenPicker" :modelValue="formData.icon" @close="cancelPicker"
        @update:modelValue="formData.icon = $event" />
</template>


<style lang="scss" scoped></style>