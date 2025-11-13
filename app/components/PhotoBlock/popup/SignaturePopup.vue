<template>
    <TransitionRoot as="template" :show="open">
      <Dialog as="div" class="relative z-50" @close="close_popup">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>
  
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <!-- <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                    <CheckIcon class="h-6 w-6 text-sky-600" aria-hidden="true" />
                  </div> -->
                  <SignatureTabs @selTabIndex="sel_tab_item" />
                  <div class="mt-3 text-center sm:mt-5">
                        <template v-if="sel_tab_index==1">
                            <UploadImageBlock :width="360" :height="180" @createImage="create_image" @closePopup="close_popup" />
                        </template>
                        <template v-else>
                            <CanvasSignatureBlock :width="360" :height="180" @createImage="create_image" @closePopup="close_popup" />
                        </template>
                  </div>
                </div>
                <!-- <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button type="button" class="inline-flex w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:col-start-2" @click="close_popup">OK</button>
                  <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" @click="close_popup" ref="cancelButtonRef">Cancel</button>
                </div> -->
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
</template>
  
<script setup>   
    import { ref} from 'vue'
    import SignatureTabs from '../tabs/SignatureTabs'
    import UploadImageBlock from '../upload/ImageBlock'
    import CanvasSignatureBlock from '../canvas/SignatureBlock'
    import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
    import { CheckIcon } from '@heroicons/vue/24/outline'
    
    const open = ref(true)
    const emit = defineEmits(['signaturePopupStatusUpdate','createImage'])
    
    const close_popup = () => {
        open.value = false
        emit('signaturePopupStatusUpdate', false)
    }
    const sel_tab_index = ref(0)
    const sel_tab_item = (index) => {
        sel_tab_index.value = index
    }
    const create_image = (value) => {
        emit('createImage', value)
    }
</script>