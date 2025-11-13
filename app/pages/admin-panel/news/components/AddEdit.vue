<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object,
    data: Array,
})

const emit = defineEmits(['add_emit', 'close']);

const optionsList = ref([
    { name: 'Yes', value: 1 },
    { name: 'No', value: 0 },
]);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
});

const formData = ref({
    id: null,
    title: '',
    slug: '',
    cat_id: '',
    photo: '',
    thumbnail_image: '',
    news_dtl: '',
    is_external: 0,
    external_url: '',
    on_headline: 0,
    status: 0,
    // SEO Fields
    is_seo: 0,
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
});
const isChecked = ref(false);

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            title: value.title,
            slug: value.slug,
            cat_id: value.cat_id,
            photo: value.photo,
            thumbnail_image: value.thumbnail_image,
            news_dtl: value.news_dtl,
            is_external: value.is_external,
            external_url: value.external_url,
            on_headline: value.on_headline,
            status: value.status,
            // SEO Fields
            is_seo: value.is_seo || 0,
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
        };
        isChecked.value = value.status == 1 ? true : false;
        isCheckedExternal.value = value.is_external == 1 ? true : false;
        isCheckedSEO.value = value.is_seo == 1 ? true : false;
    } else {
        formData.value = {
            id: null,
            title: '',
            slug: '',
            cat_id: '',
            photo: '',
            thumbnail_image: '',
            news_dtl: '',
            is_external: 0,
            external_url: '',
            on_headline: 0,
            status: 0,
            // SEO Fields
            is_seo: 0,
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
        };
        isChecked.value = false;
        isCheckedExternal.value = false;
        isCheckedSEO.value = false;
    }
});

const handleCheckboxChange = () => {
    formData.value.status = isChecked.value ? 1 : 0;
}
const validations_errors = ref({});
const skip_validations = ref([
    'id',
    'photo',
    'thumbnail_image',
    'status',
    'on_headline',
    'is_external',
    'external_url',
    'is_seo',
    'description',
    'og_title',
    'og_description',
    'og_image',
    'og_image_alt',
    'og_url',
    'og_type',
    'og_locale',
    'twitter_card',
    'twitter_title',
    'twitter_site',
    'twitter_description',
    'twitter_image',
    'twitter_image_alt',
    'twitter_creator',
    'keywords',
    'robots',
    'author',
    'publisher',
    'canonical',
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
        if (formData.value.photo?.includes('http') || formData.value.photo?.includes('https')) {
            delete formData.value.photo;
        }
        if (formData.value.thumbnail_image?.includes('http') || formData.value.thumbnail_image?.includes('https')) {
            delete formData.value.thumbnail_image;
        }
        const getData = await $fetchAdmin(`admin/news/${props.item.id}`, {
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
        const getData = await $fetchAdmin(`admin/news`, {
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

const setImage = (fieldName, imageValue) => {
    formData.value[fieldName] = imageValue;
}
const cancelHandler = () => {
    emit('close');
}
const onChangeHandler = (e) => {
    formData.value.on_headline = e.value;
}
const isCheckedExternal = ref(false);
const handleExternalChange = () => {
    formData.value.is_external = isCheckedExternal.value ? 1 : 0;
}

const isCheckedSEO = ref(false);
const handleSEOChange = () => {
    formData.value.is_seo = isCheckedSEO.value ? 1 : 0;
}
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }}</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- <pre>{{ formData }}</pre> -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Banner Image</label>
                    <div class="w-full ">
                        <PhotoBlockPhoto :getPhoto="formData.photo" @set_photo="(photo) => setImage('photo', photo)" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.photo" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Thumbnail Image</label>
                    <div class="w-full ">
                        <PhotoBlockPhoto :getPhoto="formData.thumbnail_image" @set_photo="(photo) => setImage('thumbnail_image', photo)" />
                    </div>
                    <InputError class="text-sm mt-1" :message="validations_errors.thumbnail_image" />
                </div>
            </div>
            <div></div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Title</label>
                    <InputText v-model="formData.title" class="w-full"
                        :class="validations_errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.title = ''" Placeholder="i.e How to use this website?" />
                    <InputError class="text-sm mt-1" :message="validations_errors.title" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Category</label>
                    <Select v-model="formData.cat_id" :options="data" optionLabel="title" placeholder="Select Category"
                        optionValue="id" class="w-full" @focus="validations_errors.cat_id" />
                    <InputError class="text-sm mt-1" :message="validations_errors.cat_id" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Show in Headline</label>
                    <Select v-model="formData.on_headline" :options="optionsList" optionLabel="name" optionValue="value"
                        @change="onChangeHandler" placeholder="Select" class="w-full" />
                    <InputError class="text-sm mt-1" :message="validations_errors.on_headline" />
                </div>
            </div>

            <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">News Details</label>
                    <Editor v-model="formData.news_dtl" class="w-full" editorStyle="height: 200px" rows="5" cols="30" />
                    <InputError class="text-sm mt-1" :message="validations_errors.news_dtl" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Slug</label>
                    <InputText v-model="formData.slug" class="w-full"
                        :class="validations_errors.slug ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.slug = ''" Placeholder="i.e example-slug" />
                    <InputError class="text-sm mt-1" :message="validations_errors.slug" />
                </div>
            </div>
            <div class="flex items-end justify-start gap-4">
                <label class="font-semibold mr-2 mb-2">Show External URL</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="isCheckedExternal" @change="handleExternalChange"
                        @focus="validations_errors.status = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.is_external" />
                </div>
            </div>
            <div class="flex items-end justify-start gap-4">
                <label class="font-semibold mr-2 mb-2">Add SEO</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="isCheckedSEO" @change="handleSEOChange"
                        @focus="validations_errors.is_seo = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.is_seo" />
                </div>
            </div>
            <div class="flex items-end justify-start gap-4">
                <label class="font-semibold w-14 mb-2">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="isChecked" @change="handleCheckboxChange"
                        @focus="validations_errors.status = ''" />
                    <InputError class="text-sm mt-1" :message="validations_errors.status" />
                </div>
            </div>
            <div v-if="formData.is_external == 1" class="col-span-1 sm:col-span-3 flex items-center-start gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">External URL</label>
                    <InputText v-model="formData.external_url" class="w-full"
                        :class="validations_errors.external_url ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.external_url = ''" Placeholder="i.e https://example.com" />
                    <InputError class="text-sm mt-1" :message="validations_errors.external_url" />
                </div>
            </div>

            <!-- SEO Section -->
            <div v-if="formData.is_seo == 1" class="col-span-1 sm:col-span-3">
                <div class="border-t border-gray-200 pt-4 mt-4 mb-4">
                    <h3 class="text-lg font-semibold mb-4">SEO Settings</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Title</label>
                                <InputText v-model="formData.title" class="w-full" placeholder="Enter page title"
                                    :class="validations_errors.title ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.title = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.title" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">OG Title</label>
                                <InputText v-model="formData.og_title" class="w-full"
                                    placeholder="Enter Open Graph title"
                                    :class="validations_errors.og_title ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.og_title = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.og_title" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Twitter Title</label>
                                <InputText v-model="formData.twitter_title" class="w-full"
                                    placeholder="Enter Twitter card title"
                                    :class="validations_errors.twitter_title ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.twitter_title = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.twitter_title" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Description</label>
                                <Textarea v-model="formData.description" rows="5" class="w-full"
                                    placeholder="Enter page description"
                                    :class="validations_errors.description ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.description = ''" />
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
                                    :class="validations_errors.twitter_description ? 'border-[#f44336!important]' : ''"
                                    rows="5" @focus="validations_errors.twitter_description = ''" />
                                <InputError class="text-sm mt-1"
                                    :message="validations_errors.twitter_description" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">OG URL</label>
                                <InputText v-model="formData.og_url" class="w-full"
                                    placeholder="https://example.com/page"
                                    :class="validations_errors.og_url ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.og_url = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.og_url" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">OG Type</label>
                                <InputText v-model="formData.og_type" class="w-full"
                                    placeholder="website, article, product, etc."
                                    :class="validations_errors.og_type ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.og_type = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.og_type" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Twitter Card</label>
                                <InputText v-model="formData.twitter_card" class="w-full"
                                    placeholder="summary, summary_large_image, etc."
                                    :class="validations_errors.twitter_card ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.twitter_card = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.twitter_card" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">OG Locale</label>
                                <InputText v-model="formData.og_locale" class="w-full"
                                    placeholder="en_US, fr_FR, etc."
                                    :class="validations_errors.og_locale ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.og_locale = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.og_locale" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">OG Image Alt</label>
                                <InputText v-model="formData.og_image_alt" class="w-full"
                                    placeholder="Image description for accessibility"
                                    :class="validations_errors.og_image_alt ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.og_image_alt = ''" />
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
                                <InputText v-model="formData.keywords" class="w-full"
                                    placeholder="keyword1, keyword2, keyword3"
                                    :class="validations_errors.keywords ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.keywords = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.keywords" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Robots</label>
                                <InputText v-model="formData.robots" class="w-full"
                                    placeholder="index, follow, noindex, nofollow"
                                    :class="validations_errors.robots ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.robots = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.robots" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Twitter Site</label>
                                <InputText v-model="formData.twitter_site" class="w-full"
                                    placeholder="@yoursiteusername"
                                    :class="validations_errors.twitter_site ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.twitter_site = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.twitter_site" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Author</label>
                                <InputText v-model="formData.author" class="w-full" placeholder="Author name"
                                    :class="validations_errors.author ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.author = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.author" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Publisher</label>
                                <InputText v-model="formData.publisher" class="w-full"
                                    placeholder="Publisher name or organization"
                                    :class="validations_errors.publisher ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.publisher = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.publisher" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Twitter Creator</label>
                                <InputText v-model="formData.twitter_creator" class="w-full"
                                    placeholder="@contentcreator"
                                    :class="validations_errors.twitter_creator ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.twitter_creator = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.twitter_creator" />
                            </div>
                        </div>
                        <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Canonical</label>
                                <InputText v-model="formData.canonical" class="w-full"
                                    placeholder="https://example.com/canonical-url"
                                    :class="validations_errors.canonical ? 'border-[#f44336!important]' : ''"
                                    autocomplete="off" @focus="validations_errors.canonical = ''" />
                                <InputError class="text-sm mt-1" :message="validations_errors.canonical" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">OG Image</label>
                                <div class="w-full">
                                    <PhotoBlockPhoto :getPhoto="formData.og_image"
                                        @set_photo="(photo) => setImage('og_image', photo)" />
                                </div>
                                <InputError class="text-sm mt-1" :message="validations_errors.og_image" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold">Twitter Image</label>
                                <div class="w-full">
                                    <PhotoBlockPhoto :getPhoto="formData.twitter_image"
                                        @set_photo="(photo) => setImage('twitter_image', photo)" />
                                </div>
                                <InputError class="text-sm mt-1" :message="validations_errors.twitter_image" />
                            </div>
                        </div>
                    </div>
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