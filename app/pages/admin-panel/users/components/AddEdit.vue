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
    photo: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '',
    gender: '',
    nationality_id: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    user_type: '',
});

const isChecked = ref(false);
watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            photo: value.photo || '',
            first_name: value.user_info?.first_name || '',
            middle_name: value.user_info?.middle_name || '',
            last_name: value.user_info?.last_name || '',
            dob: value.user_info?.dob || '',
            gender: value.user_info?.gender || '',
            nationality_id: value.user_info?.nationality_id || '',
            email: value.email || '',
            mobile: value.mobile || '',
            password: '',
            password_confirmation: '',
            user_type: Number(value.user_type) || '',
        };
        isChecked.value = value.status == 1 ? true : false;
    } else {
        formData.value = {
            id: null,
            photo: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            dob: '',
            gender: '',
            nationality_id: '', 
            email: '',
            mobile: '',
            password: '',
            password_confirmation: '',
            user_type: '',
        };
        isChecked.value = false;
    }
}, { immediate: true });

const isGenderLoading = ref(false)
const genderList = ref([]);
const loadGenderData = async () => {
    isGenderLoading.value = true;
    try {
        const getData = await $fetchAdmin(`admin/genders/all`, {
            method: 'POST',
        });
        genderList.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isGenderLoading.value = false;
    }
};

const isNationalityLoading = ref(false)
const nationalityList = ref([]);
const loadNationalityData = async () => {
    isNationalityLoading.value = true;
    try {
        const getData = await $fetchAdmin(`admin/countries/all`, {
            method: 'POST',
        });
        nationalityList.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isNationalityLoading.value = false;
    }
};

const isRoleLoading = ref(false)
const RoleList = ref([]);
const loadRoleData = async () => {
    isRoleLoading.value = true;
    try {
        const getData = await $fetchAdmin(`admin/roles/all`, {
            method: 'POST',
        });
        RoleList.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isRoleLoading.value = false;
    }
};
onMounted(() => {
    loadGenderData();
    loadNationalityData();
    loadRoleData();
});

const validations_errors = ref({});
const skip_validations = ref([
    'id',
    'middle_name',
    'photo',
    'status',
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
        const submitData = {
            ...formData.value,
            ccode: nationalityList.value.find(item => item.id == formData.value.nationality_id).num_code,
        }
        if (submitData.photo?.includes('http') || submitData.photo?.includes('https')) {
            delete submitData.photo;
        }
        const getData = await $fetchAdmin(`admin/users/${props.item.id}`, {
            method: 'PUT',
            body: submitData
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
        const submitData = {
            ...formData.value,
            ccode: nationalityList.value.find(item => item.id == formData.value.nationality_id).num_code,
        }
        const getData = await $fetchAdmin(`admin/users`, {
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

const setPhoto = (photo) => {
    formData.value.photo = photo;
}
const handleCheckboxChange = () => {
    formData.value.status = isChecked.value ? 1 : 0;
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
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <pre>{{ formData }}</pre>
        <!-- <pre>{{ data }}</pre> -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} User</h4>
            </div>
        </template>
        <form class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Upload Profile Image</label>
                    <div class="w-[250px]">
                        <PhotoBlockPhoto :getPhoto="formData.photo" @set_photo="setPhoto" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.photo" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">First Name</label>
                    <InputText v-model="formData.first_name" class="w-full" placeholder="i.e. John"
                        :class="validations_errors.first_name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.first_name = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.first_name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Middle Name</label>
                    <InputText v-model="formData.middle_name" class="w-full" placeholder="i.e. Doe"
                        :class="validations_errors.middle_name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.middle_name = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.middle_name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Last Name</label>
                    <InputText v-model="formData.last_name" class="w-full" placeholder="i.e. Smith"
                        :class="validations_errors.last_name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.last_name = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.last_name" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Date of Birth</label>
                    <DatePicker v-model="formData.dob" showIcon fluid iconDisplay="input" :manualInput="false"
                        class="w-full" :class="validations_errors.dob ? 'border-[#f44336!important]' : ''"
                        autocomplete="off" @focus="validations_errors.dob = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.dob" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Gender</label>
                    <Select v-model="formData.gender" :options="genderList" optionLabel="gender_name"
                        placeholder="Select Gender" optionValue="id" class="w-full"
                        @focus="validations_errors.gender = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.gender" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Nationality</label>
                    <Select v-model="formData.nationality_id" :options="nationalityList" filter
                        optionLabel="nationality" placeholder="Select Nationality" optionValue="id" class="w-full"
                        @focus="validations_errors.nationality_id = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.nationality_id" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-2 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Email</label>
                    <InputText v-model="formData.email" class="w-full" type="email" placeholder="i.e. john@example.com"
                        :class="validations_errors.email ? 'border-[#f44336!important]' : ''" autocomplete="username"
                        @focus="validations_errors.email = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.email" />
                </div>
            </div>
            <div class="col-span-1 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Mobile</label>
                    <InputText v-model="formData.mobile" class="w-full" type="number" placeholder="i.e. 1234567890"
                        :class="validations_errors.mobile ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.mobile = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.mobile" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Password</label>
                    <InputText v-model="formData.password" class="w-full" type="password"
                        :class="validations_errors.password ? 'border-[#f44336!important]' : ''" autocomplete="new-password"
                        @focus="validations_errors.password = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.password" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Confirm Password</label>
                    <InputText v-model="formData.password_confirmation" class="w-full" type="password"
                        :class="validations_errors.password_confirmation ? 'border-[#f44336!important]' : ''"
                        autocomplete="new-password" @focus="validations_errors.password_confirmation = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.password_confirmation" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">User Type</label>
                    <Select v-model="formData.user_type" :options="RoleList" filter optionLabel="role_name"
                        placeholder="Select User Type" optionValue="id" class="w-full"
                        @focus="validations_errors.user_type = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.user_type" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <label class="font-semibold">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="isChecked" @change="handleCheckboxChange"
                        @focus="validations_errors.status = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.status" />
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