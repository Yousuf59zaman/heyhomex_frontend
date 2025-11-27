<script setup>
    const props = defineProps({
        isOpenModal: Boolean,
        modalTitle: String,
        item: Object,
        data: Array,
    })

    const emit = defineEmits(["add_emit", "close"])

    const visible = ref(props.isOpenModal)
    watch(
        () => props.isOpenModal,
        (newVal) => {
            visible.value = newVal
        }
    )

    const formData = ref({
        id: null,
        title: "",
        slug: "",
        parent_id: "",
        status: 0,
    })
    const isChecked = ref(false)

    watch(
        () => props.item,
        (value) => {
            if (value && Object.keys(value).length > 0) {
                validations_errors.value = {}
                formData.value = {
                    title: value.title,
                    slug: value.slug,
                    parent_id: value.parent_id,
                    status: value.status,
                }
                isChecked.value = value.status == 1 ? true : false
            } else {
                formData.value = {
                    id: null,
                    title: "",
                    slug: "",
                    parent_id: "",
                    status: 0,
                }
                isChecked.value = false
            }
        }
    )

    const handleCheckboxChange = () => {
        formData.value.status = isChecked.value ? 1 : 0
    }
    const validations_errors = ref({})
    const skip_validations = ref(["id", "status", "parent_id"])

    const isLoading = ref(false)
    const response_modal = ref({})
    const updateHandler = async () => {
        validations_errors.value = {}
        const errors = Object.keys(formData.value).filter(
            (item) =>
                !formData.value[item] && !skip_validations.value.includes(item)
        )
        if (errors.length > 0) {
            errors.map((item) => {
                validations_errors.value[item] = `${item.replaceAll(
                    "_",
                    " "
                )} is required`
            })
            console.log(validations_errors.value)
            return
        }

        try {
            isLoading.value = true
            const getData = await $fetchAdmin(
                `admin/faq-categories/${props.item.id}`,
                {
                    method: "PUT",
                    body: formData.value,
                }
            )
            response_modal.value = getData
            if (getData.status == true) {
                emit("add_emit", getData.data)
            }
            if (getData.status == true) {
                response_modal.value = getData
            }
        } catch (e) {
            console.log("Get Message", e.message)
            // console.log('Get response',e.response);
            if (e.response?.status === 404 || e.response?.status === 422) {
                console.log("here 1", e.response)
                if (e.response?.status === 404 || e.response?.status === 409) {
                    // console.log('here 2', e.response._data.data);
                    for (const key in e.response._data.data) {
                        if (e.response._data.data.hasOwnProperty(key)) {
                            const value = e.response._data.data[key][0]
                            validations_errors.value[key] = value
                        }
                    }
                }
            } else if (!e.response?.status) {
                response_modal.value = {
                    status: false,
                    message: "Something went wrong. Please try again later.",
                }
            } else {
                response_modal.value = {
                    status: e.response._data.status,
                    message: e.response._data.message,
                }
            }
        } finally {
            isLoading.value = false
        }
    }

    const createHandler = async () => {
        validations_errors.value = {}
        const errors = Object.keys(formData.value).filter(
            (item) =>
                !formData.value[item] && !skip_validations.value.includes(item)
        )
        if (errors.length > 0) {
            errors.map((item) => {
                validations_errors.value[item] = `${item.replaceAll(
                    "_",
                    " "
                )} is required`
            })
            console.log(validations_errors.value)
            return
        }

        try {
            isLoading.value = true
            const getData = await $fetchAdmin(`admin/faq-categories`, {
                method: "POST",
                body: formData.value,
            })
            response_modal.value = getData
            if (getData.status == true) {
                emit("add_emit", getData.data)
            }
            if (getData.status == true) {
                response_modal.value = getData
            }
        } catch (e) {
            console.log("Get Message", e.message)
            // console.log('Get response',e.response);
            if (e.response?.status === 404 || e.response?.status === 422) {
                console.log("here 1", e.response)
                if (e.response?.status === 404 || e.response?.status === 409) {
                    // console.log('here 2', e.response._data.data);
                    for (const key in e.response._data.data) {
                        if (e.response._data.data.hasOwnProperty(key)) {
                            const value = e.response._data.data[key][0]
                            validations_errors.value[key] = value
                        }
                    }
                }
            } else if (!e.response?.status) {
                response_modal.value = {
                    status: false,
                    message: "Something went wrong. Please try again later.",
                }
            } else {
                response_modal.value = {
                    status: e.response._data.status,
                    message: e.response._data.message,
                }
            }
        } finally {
            isLoading.value = false
        }
    }
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :style="{width: '30rem'}"
        @update:visible="$emit('close')">
        <!-- <pre>{{ formData }}</pre> -->
        <!-- {{ data }} -->
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Category</h4>
            </div>
        </template>
        <div class="grid grid-cols-1 gap-4">
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold w-24"
                        >Title <span class="text-red-600"> *</span></label
                    >
                    <InputText
                        v-model="formData.title"
                        class="w-full"
                        :class="
                            validations_errors.title
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.title = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.title" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold w-24"
                        >Slug <span class="text-red-600"> *</span></label
                    >
                    <InputText
                        v-model="formData.slug"
                        class="w-full"
                        :class="
                            validations_errors.slug
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.slug = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.slug" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold w-24">Parent Category</label>
                    <Select
                        v-model="formData.parent_id"
                        :options="data"
                        optionLabel="title"
                        placeholder="Select"
                        optionValue="id"
                        class="w-full"
                        @focus="validations_errors.parent_id = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.parent_id" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <label class="font-semibold w-24">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch
                        v-model="isChecked"
                        @change="handleCheckboxChange"
                        @focus="validations_errors.status = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.status" />
                </div>
            </div>
        </div>

        <template
            #footer
            class="flex justify-end gap-2 border-gray-200">
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <Button
                    v-if="isLoading"
                    severity="secondary"
                    style="cursor: not-allowed; width: 80px">
                    <ProgressSpinner
                        style="width: 25px; height: 25px"
                        strokeWidth="8"
                        animationDuration=".5s" />
                </Button>
                <template v-else>
                    <Button
                        type="button"
                        label="Cancel"
                        severity="danger"
                        outlined
                        class="transition-all duration-300 hover:scale-105"
                        @click="$emit('close')">
                        <template #icon="{class: iconClass}">
                            <i
                                class="pi pi-times-circle mr-2"
                                :class="iconClass"></i>
                        </template>
                    </Button>
                    <Button
                        type="button"
                        :label="modalTitle === 'Create' ? 'Create' : 'Update'"
                        severity="success"
                        raised
                        class="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        @click="
                            modalTitle === 'Create'
                                ? createHandler()
                                : updateHandler()
                        ">
                        <template #icon="{class: iconClass}">
                            <i
                                :class="
                                    modalTitle === 'Create'
                                        ? 'pi pi-plus-circle mr-2'
                                        : 'pi pi-refresh mr-2'
                                "></i>
                        </template>
                    </Button>
                </template>
            </div>
        </template>
    </Dialog>
    <LazyResponseModal :response_modal="response_modal" />
</template>

<style lang="scss" scoped></style>
