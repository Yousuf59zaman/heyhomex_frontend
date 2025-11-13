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
    description: '',
    og_title: '',
    og_description: '',
    og_image: '',
    og_image_alt: '',
    og_url: '',
    og_type: '',
    og_locale: '',
    twitter_card: '',
    twitter_title: '',
    twitter_site: '',
    twitter_description: '',
    twitter_image: '',
    twitter_image_alt: '',
    twitter_creator: '',
    keywords: '',
    robots: '',
    author: '',
    publisher: '',
    canonical: '',
    slug: '',
    status: 0,
});
const isChecked = ref(false);

watch(() => props.item, (value) => {
    if (value) {
        validations_errors.value = {};
        formData.value = {
            title: value.title || '',
            description: value.description || '',
            og_title: value.og_title || '',
            og_description: value.og_description || '',
            og_image: value.og_image || '',
            og_image_alt: value.og_image_alt || '',
            og_url: value.og_url || '',
            og_type: value.og_type || '',
            og_locale: value.og_locale || '',
            twitter_card: value.twitter_card || '',
            twitter_title: value.twitter_title || '',
            twitter_site: value.twitter_site || '',
            twitter_description: value.twitter_description || '',
            twitter_image: value.twitter_image || '',
            twitter_image_alt: value.twitter_image_alt || '',
            twitter_creator: value.twitter_creator || '',
            keywords: value.keywords || '',
            robots: value.robots || '',
            author: value.author || '',
            publisher: value.publisher || '',
            canonical: value.canonical || '',
            slug: value.slug || '',
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
        if (formData.value.og_image?.includes('http') || formData.value.og_image?.includes('https')) {
            delete formData.value.og_image;
        }
        if (formData.value.twitter_image?.includes('http') || formData.value.twitter_image?.includes('https')) {
            delete formData.value.twitter_image;
        }
        const getData = await $fetchAdmin(`admin/metas/${props.item.id}`, {
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
        const getData = await $fetchAdmin(`admin/metas`, {
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

const setOGImage = (value) => {
    formData.value.og_image = value;
}
const setTwitterImage = (value) => {
    formData.value.twitter_image = value;
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Meta</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Title</label>
                    <InputText v-model="formData.title" class="w-full" placeholder="Enter page title"
                        :class="validations_errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.title = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.title" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">OG Title</label>
                    <InputText v-model="formData.og_title" class="w-full" placeholder="Enter Open Graph title"
                        :class="validations_errors.og_title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.og_title = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.og_title" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Twitter Title</label>
                    <InputText v-model="formData.twitter_title" class="w-full"
                        placeholder="Enter Twitter card title"
                        :class="validations_errors.twitter_title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.twitter_title = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.twitter_title" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Textarea v-model="formData.description" rows="5" class="w-full"
                        placeholder="Enter page description"
                        :class="validations_errors.description ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.description = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">OG Description</label>
                    <Textarea v-model="formData.og_description" rows="5" class="w-full"
                        placeholder="Enter Open Graph description"
                        :class="validations_errors.og_description ? 'border-[#f44336!important]' : ''"
                        autocomplete="off" @focus="validations_errors.og_description = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.og_description" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Twitter Description</label>
                    <Textarea v-model="formData.twitter_description" class="w-full"
                        placeholder="Enter Twitter card description"
                        :class="validations_errors.twitter_description ? 'border-[#f44336!important]' : ''" rows="5"
                        @focus="validations_errors.twitter_description = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.twitter_description" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">OG URL</label>
                    <InputText v-model="formData.og_url" class="w-full" placeholder="https://example.com/page"
                        :class="validations_errors.og_url ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.og_url = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.og_url" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">OG Type</label>
                    <InputText v-model="formData.og_type" class="w-full"
                        placeholder="website, article, product, etc."
                        :class="validations_errors.og_type ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.og_type = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.og_type" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Twitter Card</label>
                    <InputText v-model="formData.twitter_card" class="w-full"
                        placeholder="summary, summary_large_image, etc."
                        :class="validations_errors.twitter_card ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.twitter_card = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.twitter_card" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">OG Locale</label>
                    <InputText v-model="formData.og_locale" class="w-full" placeholder="en_US, fr_FR, etc."
                        :class="validations_errors.og_locale ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.og_locale = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.og_locale" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">OG Image Alt</label>
                    <InputText v-model="formData.og_image_alt" class="w-full"
                        placeholder="Image description for accessibility"
                        :class="validations_errors.og_image_alt ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.og_image_alt = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.og_image_alt" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Twitter Image Alt</label>
                    <InputText v-model="formData.twitter_image_alt" class="w-full"
                        placeholder="Image description for accessibility"
                        :class="validations_errors.twitter_image_alt ? 'border-[#f44336!important]' : ''"
                        autocomplete="off" @focus="validations_errors.twitter_image_alt = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.twitter_image_alt" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Keywords</label>
                    <InputText v-model="formData.keywords" class="w-full" placeholder="keyword1, keyword2, keyword3"
                        :class="validations_errors.keywords ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.keywords = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.keywords" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Robots</label>
                    <InputText v-model="formData.robots" class="w-full"
                        placeholder="index, follow, noindex, nofollow"
                        :class="validations_errors.robots ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.robots = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.robots" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Twitter Site</label>
                    <InputText v-model="formData.twitter_site" class="w-full" placeholder="@yoursiteusername"
                        :class="validations_errors.twitter_site ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.twitter_site = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.twitter_site" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-2 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Slug</label>
                    <InputText v-model="formData.slug" class="w-full" placeholder="page-url-slug"
                        :class="validations_errors.slug ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.slug = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.slug" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Twitter Creator</label>
                    <InputText v-model="formData.twitter_creator" class="w-full" placeholder="@contentcreator"
                        :class="validations_errors.twitter_creator ? 'border-[#f44336!important]' : ''"
                        autocomplete="off" @focus="validations_errors.twitter_creator = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.twitter_creator" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Author</label>
                    <InputText v-model="formData.author" class="w-full" placeholder="Author name"
                        :class="validations_errors.author ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.author = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.author" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Publisher</label>
                    <InputText v-model="formData.publisher" class="w-full"
                        placeholder="Publisher name or organization"
                        :class="validations_errors.publisher ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.publisher = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.publisher" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Canonical</label>
                    <InputText v-model="formData.canonical" class="w-full"
                        placeholder="https://example.com/canonical-url"
                        :class="validations_errors.canonical ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.canonical = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.canonical" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">OG Image</label>
                    <div class="w-full ">
                        <PhotoBlockPhoto :getPhoto="formData.og_image" @set_photo="setOGImage" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.og_image" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Twitter Image</label>
                    <div class="w-full ">
                        <PhotoBlockPhoto :getPhoto="formData.twitter_image" @set_photo="setTwitterImage" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.twitter_image" />
                </div>
            </div>
            <div> </div>
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