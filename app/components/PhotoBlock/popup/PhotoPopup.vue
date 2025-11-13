<script setup>
    import { ref } from 'vue'
    import PhotoTabs from '../tabs/PhotoTabs'
    import UploadImageBlock from '../upload/ImageBlock.vue'
    import UploadVideoCapture from '../upload/VideoCapture.vue'
    import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

    const open = ref(true)
    const emit = defineEmits(['photoPopupStatusUpdate', 'createImage'])

    const close_popup = () => {
        open.value = false
        emit('photoPopupStatusUpdate', false)
    }
    const sel_tab_index = ref(1)
    const sel_tab_item = (index) => {
        sel_tab_index.value = index
    }
    const create_image = (value) => {
        emit('createImage', value)
    }
</script>
<template>
    <TransitionRoot as="template" :show="open">
        <Dialog as="div" class="relative z-[9999999]" @close="close_popup">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel
                            class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div>
                                <PhotoTabs @selTabIndex="sel_tab_item" />
                                <div class="mt-3 text-center sm:mt-5">
                                    <template v-if="sel_tab_index == 1">
                                        <UploadImageBlock :width="240" :height="240" @createImage="create_image"
                                            @closePopup="close_popup" />
                                    </template>
                                    <template v-else>
                                        <UploadVideoCapture :width="300" :height="225" @createImage="create_image"
                                            @closePopup="close_popup" />
                                    </template>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>