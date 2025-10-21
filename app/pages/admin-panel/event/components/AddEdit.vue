<script setup>
const props = defineProps({
    isOpenModal: Boolean,
    modalTitle: String,
    item: Object,
    data: Array,
})

const myDialog = ref(null)
const showDialog = () => {
    myDialog.value.maximized = true
}

const { $truncateText, $viewFormatDateTime, $submitDateTimeFormat, $submitDateTimeAmPmFormat } = useNuxtApp();
const emit = defineEmits(['add_emit', 'close']);

const visible = ref(props.isOpenModal);
watch(() => props.isOpenModal, (newVal) => {
    visible.value = newVal;
});

const formData = ref({
    id: null,
    slug: '',
    photo: '',
    title: '',
    description: '',
    category_id: '',
    status: 0,
});

const validations_errors = ref({ });
const skip_validations = ref([
    'id',
    'status',
]);

const isLoading = ref(false);
const response_modal = ref({});

watch(() => props.item, (value) => {
    if (value && Object.keys(value).length > 0) {
        validations_errors.value = {};
        formData.value = {
            slug: value.slug ,
            photo: value.photo,
            title: value.title,
            description: value.description,
            category_id: value.category_id,
            status: value.status === 1,
            details: value.details
                ? value.details.map(item => ({
                    ...item,
                    start_date: $submitDateTimeAmPmFormat(item.start_date),
                    end_date: $submitDateTimeAmPmFormat(item.end_date),
                    status: item.status === 1
                }))
                : [],
        };
    } else {
        formData.value = {
            id: null,
            slug: '',
            photo: '',
            title: '',
            description: '',
            category_id: '',
            status: 0,
            details: [],
        };
    }
});

const updateHandler = async () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(item => !formData.value[item] && !skip_validations.value.includes(item));
    
    // Add date validation for each detail
    const dateErrors = formData.value.details.some((item, index) => {
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);
        if (endDate <= startDate) {
            validations_errors.value[`details.${index}.end_date`] = 'End date must be after start date';
            return true;
        }
        return false;
    });

    if (dateErrors) {
        return;
    }

    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        console.log(validations_errors.value);
        return;
    }

    try {
        isLoading.value = true;
        let submitData = {
            ...formData.value,
            status: formData.value.status ? 1 : 0,
            details: formData.value.details.map(item => ({
                year_id: item.year_id,
                venue: item.venue,
                start_date: $submitDateTimeFormat(item.start_date),
                end_date: $submitDateTimeFormat(item.end_date),
                status: item.status ? 1 : 0
            })),
        };
        const getData = await $fetchAdmin(`admin/events/${props.item.id}`, {
            method: 'PUT',
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

const createHandler = async () => {
    validations_errors.value = {};
    const errors = Object.keys(formData.value).filter(item =>
        !formData.value[item] && !skip_validations.value.includes(item)
    );

    // Add date validation for each detail
    const dateErrors = formData.value.details.some((item, index) => {
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);
        if (endDate <= startDate) {
            validations_errors.value[`details.${index}.end_date`] = 'End date must be after start date';
            return true;
        }
        return false;
    });

    if (dateErrors) {
        return;
    }

    // handle top-level validation messages
    if (errors.length > 0) {
        errors.forEach(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
    }

    // if any errors, return early
    if (Object.keys(validations_errors.value).length > 0) {
        console.log(validations_errors.value);
        return;
    }

    if (errors.length > 0) {
        errors.map(item => {
            validations_errors.value[item] = `${item.replaceAll('_', ' ')} is required`;
        });
        console.log(validations_errors.value);
        return;
    }

    try {
        isLoading.value = true;
        let submitData = {
            ...formData.value,
            status: formData.value.status ? 1 : 0,
            details: formData.value.details.map(item => ({
                year_id: item.year_id,
                venue: item.venue,
                start_date: $submitDateTimeFormat(item.start_date),
                end_date: $submitDateTimeFormat(item.end_date),
                status: item.status ? 1 : 0
            })),
        };
        const getData = await $fetchAdmin(`admin/events`, {
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

// Details
const yearData = ref([]);
const loadYearData = async () => {
    try {
        const getData = await $fetchAdmin(`admin/years/all`, {
            method: 'POST',
        });
        yearData.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    }
};
const categoryData = ref([]);
const loadcategoryData = async () => {
    try {
        const getData = await $fetchAdmin(`admin/event-categories/all`, {
            method: 'POST',
        });
        categoryData.value = getData.data.data;
    } catch (e) {
        console.log('Get Message', e.message);
    }
};

onMounted(() => {
    loadYearData();
    loadcategoryData();
});
const openDetails = ref(false);
const featureIndex = ref(null);
const year_id = ref('');
const venue = ref('');
const start_date = ref('');
const end_date = ref('');
const status = ref(false);
const dp_start_date = ref(null);
const dp_end_date = ref(null);
const addDetails = () => {
    validations_errors.value = {};
    openDetails.value = true;
    featureIndex.value = null;
    year_id.value = '';
    venue.value = '';
    start_date.value = '';
    end_date.value = '';
    status.value = false;
}
const editDetails = (index) => {
    validations_errors.value = {};
    console.log(index);
    openDetails.value = true;
    featureIndex.value = index;
    year_id.value = formData.value.details[index].year_id;
    venue.value = formData.value.details[index].venue;
    start_date.value = formData.value.details[index].start_date;
    end_date.value = formData.value.details[index].end_date;
    status.value = formData.value.details[index].status;
}
const saveDetails = () => {
    validations_errors.value = {};
    const fields = { year_id, venue, start_date, end_date };
    
    // Validate required fields
    Object.entries(fields).forEach(([key, value]) => {
        if (!value.value) {
            validations_errors.value[key] = '* required';
        } else {
            delete validations_errors.value[key];
        }
    });

    // Add date validation
    if (start_date.value && end_date.value) {
        const startDate = new Date(start_date.value);
        const endDate = new Date(end_date.value);
        if (endDate <= startDate) {
            validations_errors.value.end_date = 'End date must be after start date';
        }
    }

    if (Object.keys(validations_errors.value).length) {
        console.log(validations_errors.value);
        return;
    }

    if (featureIndex.value !== null) {
        formData.value.details[featureIndex.value].year_id = year_id.value;
        formData.value.details[featureIndex.value].venue = venue.value;
        formData.value.details[featureIndex.value].start_date = start_date.value;
        formData.value.details[featureIndex.value].end_date = end_date.value;
        formData.value.details[featureIndex.value].status = status.value;
    } else {
        formData.value.details.push({
            year_id: year_id.value,
            venue: venue.value,
            start_date: start_date.value,
            end_date: end_date.value,
            status: status.value,
        });
    }
    openDetails.value = false;
    featureIndex.value = null;
    year_id.value = '';
    venue.value = '';
    start_date.value = '';
    end_date.value = '';
    status.value = false;
};
const closeDetails = () => {
    openDetails.value = false;
    featureIndex.value = null;
    year_id.value = '';
    venue.value = '';
    start_date.value = '';
    end_date.value = '';
    status.value = false;
}
const removeDetails = (index) => {
    formData.value.details.splice(index, 1);
};


const submitStartDate = () => {
    dp_start_date.value.overlayVisible = false;
    // if (start_date.value) {
    //     if (featureIndex.value !== null) {
    //         formData.value.details[featureIndex.value].start_date = start_date.value;
    //     }
    //     dpstart_date.value.overlayVisible = false;
    // } else {
    //     validations_errors.value.start_date = 'Start date is required';
    // }
};
const clearStartDate = () => {
    dp_start_date.value.overlayVisible = false;
    start_date.value = null;
    validations_errors.value.start_date = '';
    dp_start_date.value.overlayVisible = false;
};

const submitEndDate = () => {
    dp_end_date.value.overlayVisible = false;
};
const clearEndDate = () => {
    dp_end_date.value.overlayVisible = false;
    end_date.value = null;
    validations_errors.value.end_date = '';
    dp_end_date.value.overlayVisible = false;
};
const setPhoto = (value) => {
    console.log(value);
    formData.value.photo = value;
}
</script>

<template>
    <Dialog ref="myDialog" v-model:visible="visible" modal :closable="false" maximizable @show="showDialog"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- <pre>{{ data }}</pre> -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Events</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="col-span-1 sm:col-span-2 flex items-start gap-4">
                <PhotoBlockPhoto :getPhoto="formData.photo" @set_photo="setPhoto" />
            </div>
            <div class="col-span-1 sm:col-span-2 flex items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold">Title</label>
                        <LazyInputText v-model="formData.title" class="w-full" placeholder="i.e. Event Title"
                            :class="validations_errors.title ? 'border-[#f44336!important]' : ''" autocomplete="off"
                            @focus="validations_errors.title = ''" />
                        <LazyInputError class="text-sm mt-1" :message="validations_errors.title" />
                    </div>
                </div>
                <div class="flex-auto">
                    <label class="font-semibold">Slug</label>
                    <LazyInputText v-model="formData.slug" class="w-full" placeholder="i.e. event-slug"
                        :class="validations_errors.slug ? 'border-[#f44336!important]' : ''" autocomplete="off"
                        @focus="validations_errors.slug = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.slug" />
                </div>
            </div>
            <div class="col-span-1 flex items-start gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Category</label>
                    <Select v-model="formData.category_id" :options="categoryData" optionLabel="title"
                        placeholder="Select" optionValue="id" class="w-full"
                        @focus="validations_errors.category_id = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.category_id" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Editor v-model="formData.description" class="w-full" placeholder="i.e. Event Description" editorStyle="height: 200px" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.description" />
                </div>
            </div>
            <div class="col-span-1 flex items-end gap-4">
                <label class="font-semibold mb-2">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="formData.status" @focus="validations_errors.status = ''" />
                    <LazyInputError class="text-sm mt-1" :message="validations_errors.status" />
                </div>
            </div>
            <div class="col-span-1 sm:col-span-3 flex items-center gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-1 w-full gap-4 sm:gap-10">
                    <div class="flex items-start gap-4">
                        <div class="flex-auto">
                            <div class="flex items-center justify-between gap-3 pb-2 mb-6 border-b">
                                <label class="font-semibold">Details</label>
                                <i @click="addDetails"
                                    class="fa-solid fa-plus cursor-pointer transition duration-150 ease-in-out bg-sky-200 dark:bg-sky-900 hover:dark:bg-sky-400 text-sky-500 dark:text-sky-200 hover:text-sky-800 p-2 text-[12px] h-[26px] w-[26px] flex items-center justify-center rounded-full"></i>
                            </div>
                            <!-- <pre>{{ formData.details }}</pre> -->
                            <div class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                                <div v-for="(item, index) in formData.details" :key="index"
                                    class="rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-4 bg-white relative group transition-all duration-300">

                                    <!-- Action buttons - Visible on hover -->
                                    <div
                                        class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                        <button @click="editDetails(index)"
                                            class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                            title="Edit Details">
                                            <i class="fas fa-edit text-emerald-600 text-sm"></i>
                                        </button>
                                        <button @click="removeDetails(index)"
                                            class="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                            title="Delete Details">
                                            <i class="fas fa-trash-alt text-red-600 text-sm"></i>
                                        </button>
                                    </div>

                                    <!-- Details Content -->
                                    <div class="space-y-3">
                                        <!-- Year -->
                                        <div class="flex items-start gap-3">
                                            <div class="p-2 rounded-lg bg-indigo-50">
                                                <i class="fas fa-calendar-alt text-indigo-600"></i>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Year</p>
                                                <p class="font-semibold text-gray-900">{{ yearData.find((year) =>
                                                    year.id === item.year_id)?.year }}</p>
                                            </div>
                                        </div>

                                        <!-- Venue -->
                                        <div class="flex items-start gap-3">
                                            <div class="p-2 rounded-lg bg-emerald-50">
                                                <i class="fas fa-map-marker-alt text-emerald-600"></i>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Venue</p>
                                                <p class="font-medium text-gray-800 line-clamp-2">{{
                                                    $truncateText(item.venue, 50) }}</p>
                                            </div>
                                        </div>

                                        <!-- Start Date -->
                                        <div class="flex items-start gap-3">
                                            <div class="p-2 rounded-lg bg-blue-50">
                                                <i class="fas fa-hourglass-start text-blue-600"></i>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Start Date</p>
                                                <p class="font-medium text-gray-800">{{
                                                    $viewFormatDateTime(item.start_date) }}</p>
                                            </div>
                                        </div>

                                        <!-- End Date -->
                                        <div class="flex items-start gap-3">
                                            <div class="p-2 rounded-lg bg-purple-50">
                                                <i class="fas fa-hourglass-end text-purple-600"></i>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    End Date</p>
                                                <p class="font-medium text-gray-800">{{
                                                    $viewFormatDateTime(item.end_date) }}</p>
                                            </div>
                                        </div>

                                        <!-- Status -->
                                        <div class="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                                            <div class="p-2 rounded-lg"
                                                :class="item.status ? 'bg-green-50' : 'bg-gray-50'">
                                                <i class="fas fa-circle-check"
                                                    :class="item.status ? 'text-green-600' : 'text-gray-400'"></i>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span
                                                    class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status:</span>
                                                <span v-if="item.status"
                                                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                                <span v-else
                                                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Inactive
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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

    <Drawer class="!w-full md:!w-[30rem]" v-model:visible="openDetails" position="right" :showCloseIcon="false"
        :dismissable="false">
        <div class="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <div class="flex items-start gap-2">
                        <label class="font-semibold">Year Id</label>
                        <LazyInputError class="text-sm mt-1" :message="validations_errors.year_id" />
                    </div>
                    <Select v-model="year_id" :options="yearData" optionLabel="year" placeholder="Select"
                        optionValue="id" class="w-full" @focus="validations_errors.year_id = ''" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <div class="flex items-start gap-2">
                        <label class="font-semibold">Venue</label>
                        <LazyInputError class="text-sm mt-1" :message="validations_errors.venue" />
                    </div>
                    <Textarea v-model="venue" class="w-full"
                        :class="validations_errors.venue ? 'border-[#f44336!important]' : ''"
                        @focus="validations_errors.venue = ''" rows="4" :useGrouping="false" />
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-start gap-4">
                    <div class="flex-auto">
                        <div class="flex items-start gap-2">
                            <label class="font-semibold">Start Date</label>
                        </div>
                        <DatePicker ref="dp_start_date" v-model="start_date" class="w-full" showIcon
                            :manualInput="false" showTime
                            :class="validations_errors.start_date ? 'border-[#f44336!important]' : ''"
                            @focus="validations_errors.start_date = ''" rows="4" :useGrouping="false">
                            <template #footer>
                                <div class="flex justify-between items-center px-4 py-2 border-t">
                                    <Button label="Clear" @click="clearStartDate" class="p-button-text p-button-sm" />
                                    <Button label="Done" @click="submitStartDate"
                                        class="p-button-sm p-button-primary" />
                                </div>
                            </template>
                        </DatePicker>

                        <LazyInputError class="text-sm mt-1" :message="validations_errors.start_date" />
                    </div>
                </div>
                <div class="flex items-start gap-4">
                    <div class="flex-auto">
                        <div class="flex items-start gap-2">
                            <label class="font-semibold">End Date</label>
                        </div>
                        <DatePicker ref="dp_end_date" v-model="end_date" class="w-full" showIcon :manualInput="false"
                            showTime :class="validations_errors.end_date ? 'border-[#f44336!important]' : ''"
                            @focus="validations_errors.end_date = ''" rows="4" :useGrouping="false">
                            <template #footer>
                                <div class="flex justify-between items-center px-4 py-2 border-t">
                                    <Button label="Clear" @click="clearEndDate" class="p-button-text p-button-sm" />
                                    <Button label="Done" @click="submitEndDate" class="p-button-sm p-button-primary" />
                                </div>
                            </template>
                        </DatePicker>
                        <LazyInputError class="text-sm mt-1" :message="validations_errors.end_date" />
                    </div>
                </div>
            </div>
            <div class="flex items-start gap-2 flex-col">
                <label class="font-semibold">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch v-model="status" class="w-full" @focus="validations_errors.status = ''" />
                </div>
            </div>
        </div>
        <template #footer class="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <div class="flex justify-end items-center gap-3">
                <Button type="button" label="Cancel" severity="danger" outlined
                    class="transition-all duration-300 hover:scale-105" @click="closeDetails">
                    <template #icon="{ class: iconClass }">
                        <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                    </template>
                </Button>

                <Button type="button" label="Save" severity="success" raised
                    class="transition-all duration-300 hover:scale-105 hover:shadow-lg" @click="saveDetails">
                    <template #icon="{ class: iconClass }">
                        <i class="pi pi-check-circle mr-2" :class="iconClass"></i>
                    </template>
                </Button>
            </div>
        </template>
    </Drawer>
    <LazyResponseModal :response_modal="response_modal" />
</template>


<style lang="scss" scoped>
.group:hover {
    transform: translateY(-2px);
}
</style>