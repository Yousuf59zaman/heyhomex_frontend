<script setup>
    const props = defineProps({
        isOpenModal: Boolean,
        modalTitle: String,
        item: Object,
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
        channel_id: "",
        title: "",
        duration: "",
        video_url: "",
        description: "",
        video_image: null,
        tag_ids: [],
        latitude: null,
        longitude: null,
    })

    const thumbnailFile = ref(null)
    const thumbnailPreview = ref("")
    const thumbnailInput = ref(null)
    const tags = ref([])
    const tagsLoading = ref(false)

    const validations_errors = ref({})
    const skip_validations = ref(["id", "video_image", "tag_ids", "latitude", "longitude"])

    watch(
        () => props.item,
        (value) => {
            if (value && Object.keys(value).length > 0) {
                validations_errors.value = {}
                formData.value = {
                    id: value.id,
                    channel_id: value.channel_id,
                    title: value.title,
                    duration: value.duration,
                    video_url: value.video_url,
                    description: value.description,
                    video_image: null,
                    tag_ids: value.tags ? value.tags.map(tag => tag.id) : [],
                    latitude: value.latitude || null,
                    longitude: value.longitude || null,
                }
                thumbnailPreview.value = value.video_image || ""
                thumbnailFile.value = null
            } else {
                formData.value = {
                    id: null,
                    channel_id: "",
                    title: "",
                    duration: "",
                    video_url: "",
                    description: "",
                    video_image: null,
                    tag_ids: [],
                    latitude: null,
                    longitude: null,
                }
                thumbnailPreview.value = ""
                thumbnailFile.value = null
            }
        },
        {immediate: true}
    )

    // Load tags from API
    const loadTags = async () => {
        tagsLoading.value = true
        try {
            const response = await $fetchAdmin('/admin/tags/all', {
                method: 'POST'
            })
            
            if (response.status) {
                tags.value = response.data.data || []
            }
        } catch (e) {
            console.error('Error loading tags:', e.message)
            tags.value = []
        } finally {
            tagsLoading.value = false
        }
    }

    onMounted(() => {
        loadTags()
    })

    const isLoading = ref(false)
    const response_modal = ref({})

    const handleThumbnailClick = () => {
        thumbnailInput.value?.click()
    }

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ]
        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a valid image file (JPG, JPEG, PNG, WEBP)")
            return
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            alert("File size must be less than 2MB")
            return
        }

        thumbnailFile.value = file

        const reader = new FileReader()
        reader.onload = (e) => {
            thumbnailPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
    }

    const removeThumbnail = () => {
        thumbnailFile.value = null
        thumbnailPreview.value = ""
        if (thumbnailInput.value) {
            thumbnailInput.value.value = ""
        }
    }

    const validateForm = () => {
        validations_errors.value = {}
        const errors = Object.keys(formData.value).filter(
            (key) =>
                !formData.value[key] && !skip_validations.value.includes(key)
        )

        if (errors.length > 0) {
            errors.forEach((field) => {
                validations_errors.value[field] = `${field.replaceAll(
                    "_",
                    " "
                )} is required`
            })
            return false
        }

        return true
    }

    const updateHandler = async () => {
        if (!validateForm()) return

        try {
            isLoading.value = true

            const formDataToSend = new FormData()
            formDataToSend.append("channel_id", formData.value.channel_id)
            formDataToSend.append("title", formData.value.title)
            formDataToSend.append("duration", String(formData.value.duration))
            formDataToSend.append("video_url", formData.value.video_url)
            formDataToSend.append("description", formData.value.description)

            // Add tags
            if (formData.value.tag_ids && formData.value.tag_ids.length > 0) {
                formData.value.tag_ids.forEach(tagId => {
                    formDataToSend.append("tag_ids[]", tagId)
                })
            }

            if (thumbnailFile.value) {
                formDataToSend.append("image", thumbnailFile.value)
            }

            formDataToSend.append("_method", "PATCH")

            const getData = await $fetchAdmin(
                `videos/${props.item.id}/update`,
                {
                    method: "POST",
                    body: formDataToSend,
                }
            )

            response_modal.value = getData

            if (getData.status === "success") {
                emit("add_emit", getData.data)
            }
        } catch (e) {
            console.log("Get Message", e.message)

            if (
                e.response?.status === 404 ||
                e.response?.status === 422 ||
                e.response?.status === 409
            ) {
                if (e.response._data?.data) {
                    for (const key in e.response._data.data) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                e.response._data.data,
                                key
                            )
                        ) {
                            const value = e.response._data.data[key][0]
                            validations_errors.value[key] = value
                        }
                    }
                } else {
                    response_modal.value = {
                        status: false,
                        message:
                            e.response._data?.message || "Validation error",
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
        if (!validateForm()) return

        try {
            isLoading.value = true

            const formDataToSend = new FormData()
            formDataToSend.append("channel_id", formData.value.channel_id)
            formDataToSend.append("title", formData.value.title)
            formDataToSend.append("duration", String(formData.value.duration))
            formDataToSend.append("video_url", formData.value.video_url)
            formDataToSend.append("description", formData.value.description)

            // Add latitude and longitude if provided
            if (formData.value.latitude !== null && formData.value.latitude !== '') {
                formDataToSend.append("latitude", String(formData.value.latitude))
            }
            if (formData.value.longitude !== null && formData.value.longitude !== '') {
                formDataToSend.append("longitude", String(formData.value.longitude))
            }

            // Add tags
            if (formData.value.tag_ids && formData.value.tag_ids.length > 0) {
                formData.value.tag_ids.forEach(tagId => {
                    formDataToSend.append("tag_ids[]", tagId)
                })
            }

            if (thumbnailFile.value) {
                formDataToSend.append("image", thumbnailFile.value)
            }

            const getData = await $fetchAdmin(`videos/store`, {
                method: "POST",
                body: formDataToSend,
            })

            response_modal.value = getData

            if (getData.status === "success") {
                emit("add_emit", getData.data)
            }
        } catch (e) {
            console.log("Get Message", e.message)

            if (
                e.response?.status === 404 ||
                e.response?.status === 422 ||
                e.response?.status === 409
            ) {
                if (e.response._data?.data) {
                    for (const key in e.response._data.data) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                e.response._data.data,
                                key
                            )
                        ) {
                            const value = e.response._data.data[key][0]
                            validations_errors.value[key] = value
                        }
                    }
                } else {
                    response_modal.value = {
                        status: false,
                        message:
                            e.response._data?.message || "Validation error",
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
        :style="{width: '50rem'}"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Video</h4>
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
                        :class="
                            validations_errors.channel_id
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.channel_id = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.channel_id" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Title</label>
                    <InputText
                        v-model="formData.title"
                        class="w-full"
                        placeholder="i.e. Test video"
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
                    <label class="font-semibold">Duration (minutes)</label>
                    <InputNumber
                        :useGrouping="false"
                        v-model="formData.duration"
                        class="w-full"
                        :class="
                            validations_errors.duration
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.duration = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.duration" />
                </div>
            </div>

            <div class="flex items-center gap-4 md:col-span-2">
                <div class="flex-auto">
                    <label class="font-semibold">Video URL</label>
                    <InputText
                        v-model="formData.video_url"
                        class="w-full"
                        placeholder="https://..."
                        :class="
                            validations_errors.video_url
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.video_url = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.video_url" />
                </div>
            </div>

            <div class="flex items-center gap-4 md:col-span-2">
                <div class="flex-auto">
                    <label class="font-semibold">Description</label>
                    <Textarea
                        v-model="formData.description"
                        rows="4"
                        class="w-full"
                        :class="
                            validations_errors.description
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.description = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.description" />
                </div>
            </div>

            <div class="flex items-center gap-4 md:col-span-2">
                <div class="flex-auto">
                    <label class="font-semibold">Tags</label>
                    <MultiSelect
                        v-model="formData.tag_ids"
                        :options="tags"
                        optionLabel="tag_title"
                        optionValue="id"
                        placeholder="Select tags"
                        :loading="tagsLoading"
                        :maxSelectedLabels="3"
                        class="w-full" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.tag_ids" />
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Latitude (Optional)</label>
                    <InputNumber
                        v-model="formData.latitude"
                        mode="decimal"
                        :minFractionDigits="0"
                        :maxFractionDigits="8"
                        :useGrouping="false"
                        class="w-full"
                        placeholder="e.g., 21.4225"
                        :class="
                            validations_errors.latitude
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.latitude = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.latitude" />
                    <small class="text-gray-500">Enter the latitude coordinate for map display</small>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Longitude (Optional)</label>
                    <InputNumber
                        v-model="formData.longitude"
                        mode="decimal"
                        :minFractionDigits="0"
                        :maxFractionDigits="8"
                        :useGrouping="false"
                        class="w-full"
                        placeholder="e.g., -157.8584"
                        :class="
                            validations_errors.longitude
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.longitude = ''" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.longitude" />
                    <small class="text-gray-500">Enter the longitude coordinate for map display</small>
                </div>
            </div>

            <div class="flex items-center gap-4 md:col-span-2">
                <div class="flex-auto">
                    <label class="font-semibold">Video Thumbnail</label>
                    <div class="mt-2 flex items-start gap-4">
                        <div
                            class="relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                            :class="
                                thumbnailPreview ? 'w-40 h-24' : 'w-full h-32'
                            "
                            @click="handleThumbnailClick">
                            <img
                                v-if="thumbnailPreview"
                                :src="thumbnailPreview"
                                class="w-full h-full object-cover rounded-lg"
                                alt="Thumbnail preview" />
                            <div
                                v-else
                                class="flex flex-col items-center justify-center gap-2 text-gray-500">
                                <i class="pi pi-cloud-upload text-3xl"></i>
                                <p class="text-sm">Click to upload thumbnail</p>
                                <p class="text-xs text-gray-400">
                                    JPG, PNG, WEBP (Max 2MB)
                                </p>
                            </div>
                        </div>
                        <div
                            v-if="thumbnailPreview"
                            class="flex-1">
                            <p class="text-sm text-gray-600 mb-2">
                                {{ thumbnailFile?.name || "Current thumbnail" }}
                            </p>
                            <Button
                                type="button"
                                label="Remove"
                                severity="danger"
                                size="small"
                                outlined
                                @click.stop="removeThumbnail">
                                <template #icon="{class: iconClass}">
                                    <i
                                        class="pi pi-times mr-2"
                                        :class="iconClass"></i>
                                </template>
                            </Button>
                        </div>
                    </div>
                    <input
                        ref="thumbnailInput"
                        type="file"
                        class="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        @change="handleThumbnailChange" />
                    <InputError
                        class="text-sm mt-1"
                        :message="validations_errors.video_image" />
                </div>
            </div>
        </div>

        <template #footer>
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
