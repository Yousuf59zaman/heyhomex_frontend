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
    email: '',
    password: '',
    password_confirmation: '',
});
const isChecked = ref(false);

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            name: value.name  ,
            email: value.email || '',
            password: '',
            password_confirmation: '',
        };
    } else {
        formData.value = {
            id: null,
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        };
    }
});

const validations_errors = ref({});
const skip_validations = ref([
    'id',
]);

const isLoading = ref(false);
const response_modal = ref({});
const updateHandler = async () => {
    if (formData.value.password != formData.value.password_confirmation) {
        validations_errors.value['password_confirmation'] = 'Password and Confirm Password does not match';
        return;
    }
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
        const getData = await $fetchAdmin(`admin/auth-client/${props.item.id}`, {
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
    if (formData.value.password != formData.value.password_confirmation) {
        validations_errors.value['password_confirmation'] = 'Password and Confirm Password does not match';
        return;
    }
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
        const getData = await $fetchAdmin(`admin/auth-client`, {
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

// Validate password and confirm password
watch(() => formData.value.password_confirmation, (value) => {
    if (!value) {
        validations_errors.value.password_confirmation = '';
        return;
    }

    if (value !== formData.value.password) {
        validations_errors.value.password_confirmation = '✘ Password and Confirm Password must be the same.';
    } else {
        validations_errors.value.password_confirmation = '';
    }
});

// Validate password rules
watch(() => formData.value.password, (value) => {
    const errors = [];

    if (!value || typeof value !== 'string') {
        validations_errors.value.password = '';
        return;
    }

    if (value.length < 8) {
        errors.push('✘ Password must be at least 8 characters long.<br>');
    }
    if (!/[a-z]/.test(value)) {
        errors.push('✘ Password must contain at least one lowercase letter.<br>');
    }
    if (!/[A-Z]/.test(value)) {
        errors.push('✘ Password must contain at least one uppercase letter.<br>');
    }
    if (!/[0-9]/.test(value)) {
        errors.push('✘ Password must contain at least one numeric character.<br>');
    }

    validations_errors.value.password = errors.join('');

    // Recheck password confirmation validity
    if (formData.value.password_confirmation && formData.value.password !== formData.value.password_confirmation) {
        validations_errors.value.password_confirmation = '✘ Password and Confirm Password must be the same.';
    }
});
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '40rem' }"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Auth Client</h4>
            </div>
        </template>
        <form class="grid grid-cols-1 gap-4">
            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-32">Name</label>
                <div class="flex-auto">
                    <LazyInputText v-model="formData.name" class="w-full" placeholder="i.e John Doe"
                        :class="validations_errors.name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.name = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-32">Email</label>
                <div class="flex-auto">
                    <LazyInputText v-model="formData.email" class="w-full" placeholder="i.e. john@example.com"
                        :class="validations_errors.email ? 'border-[#f44336!important]' : ''" autocomplete="username"
                        @focus="validations_errors.email = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.email" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-32">Password</label>
                <div class="flex-auto">
                    <LazyInputText v-model="formData.password" class="w-full" type="password"
                        :class="validations_errors.password ? 'border-[#f44336!important]' : ''" autocomplete="new-password"
                        @focus="validations_errors.password = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.password" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <label class="font-semibold min-w-32">Confirm Password</label>
                <div class="flex-auto">
                    <LazyInputText v-model="formData.password_confirmation" class="w-full" type="password"
                        :class="validations_errors.password_confirmation ? 'border-[#f44336!important]' : ''"
                        autocomplete="new-password" @focus="validations_errors.password_confirmation = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.password_confirmation" />
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