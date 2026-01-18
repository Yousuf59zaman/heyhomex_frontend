<script setup>
const props = defineProps({
    isOpenModal: {
        type: Boolean,
        default: false
    },
    advertisement: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['close', 'success']);

const isLoading = ref(false);
const videos = ref([]);
const attachedVideoIds = ref([]);
const selectedVideos = ref([]);
const response_modal = ref({});

const visible = computed({
    get: () => props.isOpenModal,
    set: (value) => {
        if (!value) {
            emit('close');
        }
    }
});

const loadVideos = async () => {
    isLoading.value = true;
    try {
        const response = await $fetchCitizen('advertiser/advertisements/videos/list', {
            method: 'GET'
        });
        if (response.status === 'success') {
            videos.value = response.data.data;
            
            // Mark currently attached videos
            if (props.advertisement.videos && props.advertisement.videos.length > 0) {
                attachedVideoIds.value = props.advertisement.videos.map(v => v.id);
                selectedVideos.value = props.advertisement.videos.map(v => ({
                    video_id: v.id,
                    display_time: v.display_time || 10,
                    display_order: v.display_order || 1,
                    is_active: v.is_active !== undefined ? (v.is_active ? 1 : 0) : 1
                }));
            }
        }
    } catch (error) {
        console.error('Error loading videos:', error);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.isOpenModal, (newVal) => {
    if (newVal) {
        loadVideos();
    }
});

const isVideoSelected = (videoId) => {
    return selectedVideos.value.some(v => v.video_id === videoId);
};

const toggleVideo = (video) => {
    const index = selectedVideos.value.findIndex(v => v.video_id === video.id);
    if (index > -1) {
        selectedVideos.value.splice(index, 1);
    } else {
        selectedVideos.value.push({
            video_id: video.id,
            display_time: 10,
            display_order: selectedVideos.value.length + 1,
            is_active: 1
        });
    }
};

const getVideoSettings = (videoId) => {
    return selectedVideos.value.find(v => v.video_id === videoId);
};

const updateVideoSettings = (videoId, field, value) => {
    const video = selectedVideos.value.find(v => v.video_id === videoId);
    if (video) {
        video[field] = value;
    }
};

const saveAttachments = async () => {
    console.log('Saving attachments:', selectedVideos.value);
    isLoading.value = true;
    response_modal.value = {};
    
    try {
        const selectedVideoIds = selectedVideos.value.map(v => v.video_id);
        
        // Find videos to detach (were attached but now not selected)
        const videosToDetach = attachedVideoIds.value.filter(id => !selectedVideoIds.includes(id));
        
        // Detach videos that were removed
        if (videosToDetach.length > 0) {
            for (const videoId of videosToDetach) {
                await $fetchCitizen(
                    `advertiser/advertisements/${props.advertisement.id}/detach-video/${videoId}`,
                    {
                        method: 'POST',
                        body: {
                            _method: 'DELETE'
                        }
                    }
                );
            }
        }
        
        // Attach/Update selected videos
        if (selectedVideos.value.length > 0) {
            const formData = new FormData();
            
            selectedVideos.value.forEach((video, index) => {
                formData.append(`videos[${index}][video_id]`, video.video_id);
                formData.append(`videos[${index}][display_time]`, video.display_time);
                formData.append(`videos[${index}][display_order]`, video.display_order);
                formData.append(`videos[${index}][is_active]`, video.is_active);
            });

            await $fetchCitizen(
                `advertiser/advertisements/${props.advertisement.id}/attach-video`,
                {
                    method: 'POST',
                    body: formData
                }
            );
        }
        console.log('Attachments saved successfully.');
        
        // Success message
        let message = 'Videos updated successfully!';
        if (videosToDetach.length > 0 && selectedVideos.value.length === 0) {
            message = 'All videos detached successfully!';
        } else if (videosToDetach.length > 0 && selectedVideos.value.length > 0) {
            message = 'Videos attached and detached successfully!';
        } else if (selectedVideos.value.length > 0) {
            message = 'Videos attached successfully!';
        }
        
        response_modal.value = {
            status: true,
            message: message
        };
        
        emit('success');
        setTimeout(() => {
            emit('close');
        }, 1500);
    } catch (error) {
        console.error('Error updating videos:', error);
        response_modal.value = {
            status: 'error',
            message: error.response?._data?.message || 'Error updating videos. Please try again.'
        };
    } finally {
        isLoading.value = false;
    }
};

const closeModal = () => {
    emit('close');
};
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :draggable="false"
        :style="{width: '45rem', maxWidth: '720px'}"
        :pt="{
            root: 'border-0 rounded-xl shadow-2xl m-4 bg-white',
            header: 'border-0 pb-0 pt-6 px-6',
            content: 'border-0 pt-4 pb-6 px-6 overflow-y-auto',
        }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <h2 class="text-xl font-semibold text-gray-900">Attach Videos to Advertisement</h2>
                    <p class="text-sm text-gray-500 mt-1">{{ advertisement.title }}</p>
                </div>
                <button
                    @click="closeModal"
                    class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Icon name="lucide:x" class="w-5 h-5 text-gray-500" />
                </button>
            </div>
        </template>

        <div v-if="isLoading" class="space-y-4">
            <div v-for="n in 3" :key="n" class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center gap-4 flex-1">
                    <Skeleton shape="circle" size="3rem" />
                    <div class="flex-1 space-y-2">
                        <Skeleton width="70%" height="1.5rem" />
                        <Skeleton width="40%" height="1rem" />
                    </div>
                </div>
                <div class="space-y-2">
                    <Skeleton width="150px" height="2.5rem" />
                    <Skeleton width="150px" height="2.5rem" />
                    <Skeleton width="150px" height="2.5rem" />
                </div>
            </div>
        </div>

        <div v-else>
            <!-- Selected Videos Count -->
            <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-blue-900">
                        <Icon name="lucide:info" class="w-4 h-4 inline mr-1" />
                        {{ selectedVideos.length }} video(s) selected
                    </p>
                    <button
                        v-if="selectedVideos.length > 0"
                        @click="selectedVideos = []"
                        class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Clear All
                    </button>
                </div>
            </div>

            <!-- Videos Grid -->
            <div v-if="videos.length === 0" class="text-center py-12">
                <Icon name="lucide:video-off" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">No videos available</p>
            </div>

            <div v-else class="space-y-4">
                <div
                    v-for="video in videos"
                    :key="video.id"
                    class="border rounded-lg p-4 transition-all"
                    :class="isVideoSelected(video.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                    <div class="flex gap-4">
                        <!-- Video Thumbnail -->
                        <div class="flex-shrink-0">
                            <div class="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                    v-if="video.video_image"
                                    :src="video.video_image"
                                    :alt="video.title"
                                    class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full flex items-center justify-center">
                                    <Icon name="lucide:video" class="w-8 h-8 text-gray-400" />
                                </div>
                                <div class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                    {{ video.duration }}s
                                </div>
                            </div>
                        </div>

                        <!-- Video Info -->
                        <div class="flex-1">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h4 class="font-medium text-gray-900">{{ video.title }}</h4>
                                    <p class="text-sm text-gray-500 mt-1">{{ video.description }}</p>
                                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span>
                                            <Icon name="lucide:calendar" class="w-3 h-3 inline mr-1" />
                                            {{ new Date(video.created_at).toLocaleDateString() }}
                                        </span>
                                        <span v-if="video.channel">
                                            <Icon name="lucide:tv" class="w-3 h-3 inline mr-1" />
                                            {{ video.channel.name }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Select Checkbox -->
                                <div class="flex items-center gap-2">
                                    <Checkbox
                                        :modelValue="isVideoSelected(video.id)"
                                        @update:modelValue="toggleVideo(video)"
                                        binary />
                                </div>
                            </div>

                            <!-- Video Settings (shown when selected) -->
                            <div v-if="isVideoSelected(video.id)" class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p class="text-xs font-medium text-gray-700 mb-3">Display Settings</p>
                                <div class="display-settings-grid grid grid-cols-3 gap-4 items-end">
                                    <div>
                                        <label class="text-xs text-gray-600 mb-1 block">Display Time (seconds)</label>
                                        <InputNumber
                                            :modelValue="getVideoSettings(video.id)?.display_time"
                                            @update:modelValue="updateVideoSettings(video.id, 'display_time', $event)"
                                            :min="1"
                                            :max="60"
                                            showButtons
                                            class="w-full"
                                            inputClass="text-sm h-[42px]" />
                                    </div>
                                    <div class="flex flex-col">
                                        <label class="text-xs text-gray-600 mb-1.5 block">Display Order</label>
                                        <InputNumber
                                            :modelValue="getVideoSettings(video.id)?.display_order"
                                            @update:modelValue="updateVideoSettings(video.id, 'display_order', $event)"
                                            :min="1"
                                            showButtons
                                            class="w-full"
                                            inputClass="text-sm h-[42px]" />
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-600 mb-1 block">Status</label>
                                        <ToggleButton
                                            :modelValue="getVideoSettings(video.id)?.is_active === 1"
                                            @update:modelValue="updateVideoSettings(video.id, 'is_active', $event ? 1 : 0)"
                                            onLabel="Active"
                                            offLabel="Inactive"
                                            class="w-full h-[42px] text-xs font-medium" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <!-- <button
                    @click="closeModal"
                    class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                    Cancel
                </button> -->
                 <Button type="button" label="Cancel" severity="danger" outlined
                        class="transition-all duration-300 hover:scale-105"   @click="closeModal">
                        <template #icon="{ class: iconClass }">
                            <i class="pi pi-times-circle mr-2" :class="iconClass"></i>
                        </template>
                    </Button>
                <button
                    @click="saveAttachments"
                    :disabled="isLoading"
                    class="px-4 py-2 bg-[#18222C] hover:bg-[#0F172A] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                    <Icon v-else name="lucide:save" class="w-4 h-4" />
                    {{ isLoading ? 'Saving...' : 'Save Attachments' }}
                </button>
            </div>
        </div>

        <LazyResponseModal :response_modal="response_modal" />
    </Dialog>
</template>

<style scoped>
:deep(.p-dialog-content) {
    max-height: calc(90vh - 180px);
}

:deep(.display-settings-grid .p-inputnumber-input),
:deep(.display-settings-grid .p-inputnumber-button-group),
:deep(.display-settings-grid .p-togglebutton) {
    height: 42px;
}

:deep(.display-settings-grid .p-togglebutton) {
    border-radius: 0.5rem;
}
</style>
