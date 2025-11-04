<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    item: Object,
    positionData: Array,
    isPositionLoading: Boolean
})
const emit = defineEmits(['close', 'dataSubmit']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
    reset();
});

const { $linktypeList } = useNuxtApp();
const linktypeList = $linktypeList();

const form = reactive({
    pid: 0,
    position_id: null,
    menu_name: '',
    path: '',
    sgv_icon: '',
    linktype: '',
    icon: 'fas fa-upload',
    img: '',
    serials: 0,
    status: false
})

const isOpenPicker = ref(false);
const OpenPicker = () => {
    isOpenPicker.value = true;
}
const cancelPicker = () => {
    isOpenPicker.value = false;
}

const loader = ref(false);
const validations_errors = ref({});
const submitHandler = async () => {
    // emit('dataSubmit', form);
    validations_errors.value = {};
    loader.value = true;
    try {
        const getData = await $fetchAdmin(`admin/menu`, {
            method: 'POST',
            body: form
        });
        if (getData.status) {
            emit('dataSubmit', {...getData.data,"child": []});
            emit('close');
        }
    } catch (e) {
        console.log('here 1',e.response);
            if(e.response?.status === 404 || e.response?.status === 409 || e.response?.status === 422){
                console.log('here 2',e.response._data.errors);
                for (const key in e.response._data.errors) {
                    if (e.response._data.errors.hasOwnProperty(key)) {
                        const value = e.response._data.errors[key][0];
                        validations_errors.value[key] = value;
                    }
                }
            }
    } finally {
        loader.value = false;
    }
}

const reset = () => {
    form.pid = 0;
    form.position_id = null;
    form.menu_name = '';
    form.path = '';
    form.sgv_icon = '';
    form.linktype = '';
    form.icon = 'fas fa-upload';
    form.img = '';
    form.serials = 0;
    form.status = false;
    validations_errors.value = {};
}
const setPhoto = (img) => {
    form.img = img;
}
</script>

<template>
    <div>
        <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '30rem' }"
            @update:visible="$emit('close')">
            <template #header>
                <div class="flex items-center justify-center w-full gap-2">
                    <h4 class="text-xl font-semibold">Create Menu</h4>
                </div>
            </template>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-40">Position</label>
                <div class="flex-auto w-full">
                    <Select v-model="form.position_id" :options="positionData" optionLabel="name"
                        placeholder="Select Position" optionValue="id" class="w-full"
                        @focus="validations_errors.menu_name = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.menu_name"
                        :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-40">Link Type</label>
                <div class="flex-auto w-full">
                    <Select v-model="form.linktype" :options="linktypeList" optionLabel="name"
                        placeholder="Select Link Type" optionValue="id" class="w-full"
                        @focus="validations_errors.linktype = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.linktype"
                        :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-40">Name</label>
                <div class="flex-auto w-full">
                    <InputText v-model="form.menu_name" class="w-full"
                        :class="validations_errors.menu_name ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        placeholder="i.e Dashboard" @focus="validations_errors.menu_name = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.menu_name"
                        :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-40">Path</label>
                <div class="flex-auto w-full">
                    <InputText v-model="form.path" class="w-full"
                        :class="validations_errors.path ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        placeholder="i.e /dashboard" @focus="validations_errors.path = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.path" :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-40">SVG Path</label>
                <div class="flex-auto w-full">
                    <InputText v-model="form.sgv_icon" class="w-full"
                        :class="validations_errors.sgv_icon ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        placeholder="i.e /svg/menu/dashboard.svg" @focus="validations_errors.sgv_icon = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.sgv_icon"
                        :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-40">Icon</label>
                <div class="flex-auto w-full">
                    <div class="flex items-center gap-2">
                        <InputText v-model="form.icon"
                            :class="validations_errors.icon ? 'border-[#f44336!important]' : ''" class="w-full"
                            autocomplete="off" disabled @focus="validations_errors.icon = ''" />
                        <i :class="form.icon" class="text-[25px] cursor-pointer text-[#f88900ef]"
                            @click="OpenPicker"></i>
                    </div>
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.icon" :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-40">Image Logo</label>
                <div class="flex-auto w-full">
                    <div class="w-full">
                        <PhotoBlockPhoto :getPhoto="form.img" @set_photo="setPhoto" />
                    </div>
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.img" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-8">
                <label for="email" class="font-semibold w-40">Status</label>
                <div class="flex-auto w-full">
                    <ToggleSwitch v-model="form.status" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end items-center gap-3 border-gray-200">
                    <Button v-if="loader" severity="secondary" style="cursor: not-allowed; width: 80px;">
                        <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8" animationDuration=".5s" />
                    </Button>
                    <template v-else>
                        <Button type="button" label="Cancel" severity="danger" outlined
                            class="transition-all duration-300 hover:scale-105" @click="$emit('close')">
                            <template #icon="{ class: iconClass }">
                                <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                            </template>
                        </Button>
                        <Button type="button" label="Save" severity="success" raised
                            class="transition-all duration-300 hover:scale-105 hover:shadow-lg" @click="submitHandler">
                            <template #icon="{ class: iconClass }">
                                <i class="pi pi-plus-circle mr-2"></i>
                            </template>
                        </Button>
                    </template>
                </div>
            </template>
        </Dialog>
    </div>
    <LazyIconPicker :isOpenPicker="isOpenPicker" :modelValue="form.icon" @close="cancelPicker"
        @update:modelValue="form.icon = $event" />
</template>


<style lang="scss" scoped></style>