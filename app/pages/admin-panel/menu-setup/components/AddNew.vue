<script setup>
const TextInput = defineAsyncComponent(() => import('../components/TextInput'));
const props = defineProps({
    isOpenModal: Boolean,
    item: Object
})
const emit = defineEmits(['close', 'dataSubmit']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
    reset();
});

const form = reactive({
    pid: 0,
    node_name: '',
    route_name: '',
    route_location: '',
    icon: 'fas fa-upload',
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
        const getData = await $fetchAdmin(`admin/tree-entity`, {
            method: 'POST',
            body: form
        });
        if (getData.status) {
            emit('dataSubmit', {...getData.data,"menus": []});
            emit('close');
        }
    } catch (e) {
        console.log('here 1',e.response);
            if(e.response?.status === 404 || e.response?.status === 409){
                console.log('here 2',e.response._data.data);
                for (const key in e.response._data.data) {
                    if (e.response._data.data.hasOwnProperty(key)) {
                        const value = e.response._data.data[key][0];
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
    form.node_name = '';
    form.route_name = '';
    form.route_location = '';
    form.icon = 'fas fa-upload';
    form.serials = 0;
    form.status = false;
    validations_errors.value = {};
}
</script>

<template>
    <div>
        <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '30rem' }" @update:visible="$emit('close')">
            <template #header>
                <div class="flex items-center justify-center w-full gap-2">
                    <h4 class="text-xl font-semibold">Create Menu</h4>
                </div>
            </template>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-24">Name</label>
                <div class="flex-auto">
                    <LazyInputText v-model="form.node_name" class="w-full" :class="validations_errors.node_name ? 'border-[#f44336!important]' : ''" autocomplete="off" @focus="validations_errors.node_name = ''" placeholder="i.e. Portfolio Categories"/>
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.node_name" :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-24">Route</label>
                <div class="flex-auto">
                    <LazyInputText v-model="form.route_name" class="w-full" :class="validations_errors.route_name ? 'border-[#f44336!important]' : ''" autocomplete="off" @focus="validations_errors.route_name = ''" placeholder="i.e. /admin-panel/portfolio-categories"/>
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.route_name" :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-24">Api Route Permission</label>
                <div class="flex-auto">
                    <LazyInputText v-model="form.route_location" class="w-full" :class="validations_errors.route_location ? 'border-[#f44336!important]' : ''" autocomplete="off" @focus="validations_errors.route_location = ''" placeholder="i.e. portfolio-categories"/>
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.route_location" :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-24">Icon</label>
                <div class="flex-auto">
                    <div class="flex items-center gap-2">
                        <LazyInputText v-model="form.icon" :class="validations_errors.icon ? 'border-[#f44336!important]' : ''" class="w-full" autocomplete="off" disabled @focus="validations_errors.icon = ''"/>
                        <i :class="form.icon" class="text-[25px] cursor-pointer text-[#f88900ef]" @click="OpenPicker"></i>
                    </div>
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.icon" :text_size="'text-sm'" />
                </div>
            </div>
            <div class="flex items-center gap-4 mb-8">
                <label for="email" class="font-semibold w-24">Status</label>
                <ToggleSwitch v-model="form.status" />
            </div>
            
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
                    <Button type="button" label="Save" severity="success" 
                        raised class="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        @click="submitHandler">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-plus-circle mr-2"></i>
                        </template>
                    </Button>
                </template>
            </div>
        </Dialog>
    </div>
    <LazyIconPicker :isOpenPicker="isOpenPicker" :modelValue="form.icon" @close="cancelPicker" @update:modelValue="form.icon = $event"/>
</template>


<style lang="scss" scoped></style>