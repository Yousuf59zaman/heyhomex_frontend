<script setup>
    import { ref} from 'vue'
    import PhotoPopupBlock from './popup/PhotoPopup'
    const emit = defineEmits(['set_photo'])
    const props = defineProps({
        getPhoto: String
    })
    const max_file_size = ref('2')
    const file_size_exceeded = ref(false)    
    const set_file_name = ref('')
    const file_type_invalid = ref(false)
    const Photo_popup_open = ref(false)
    const formData = ref({
        photo: ''
    })

    const Photo_popup_status_update = (status) => {
        Photo_popup_open.value = status
    }

    const get_file_name = (file) => {
        set_file_name.value = file.split('.').slice(0, -1).join('.')
    }
    
    const create_image = (value) => {        
        formData.value.photo = value
        emit('set_photo', value)
    }
</script>
<template>
    <div class="photo_upload_block border border-gray-300 rounded-md p-3">
        <div class="flex items-center justify-center gap-2 signature_upload_block">
            <div v-if="getPhoto" class="flex items-center justify-center signature_area">
                <img class="object-cover rounded-md" :src="getPhoto" />
                <!-- <div v-if="preloader" class="flex items-center gap-1 preloader">
                    <i class="fa fa-cog fa-spin"></i>
                    <span>Wait</span>
                </div> -->
            </div>
            <div v-else>
                <!-- <label class="block text-sm font-medium text-gray-700">Signature</label> -->
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6">
                    <div class="space-y-1 text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none"
                            viewBox="0 0 48 48" aria-hidden="true">
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div class="flex text-sm text-gray-600">
                            <label for="file-upload"
                                class="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                <span @click="Photo_popup_status_update(true)"><i class="fa-solid fa-upload"></i> Upload
                                    a file</span>

                            </label>
                            <!-- <p class="pl-1">or drag and drop</p> -->
                        </div>
                        <!-- <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p> -->
                    </div>
                </div>
            </div>
        </div>

        <template v-if="getPhoto">
            <div class="flex items-center justify-center bg-sky-600 text-white rounded-xl mt-3 gap-1 py-1 text-[11px] cursor-pointer"
                @click="Photo_popup_status_update(true)">
                <i class="fa fa-repeat"></i>
                <span>Change Photo</span>
            </div>
            <!-- <input type="file" ref="photo_input_form" class="hidden" @change="load_image" accept="image/jpg,image/jpeg,image/png" capture="environment" /> -->
        </template>
        <div v-if="file_size_exceeded"
            class="flex flex-row items-center gap-2 text-red-700 px-3 py-1 mt-2 bg-red-100 rounded-md err_msg">
            <i class="fa fa-check-circle"></i>
            <span>File size exceeded. Maxium allowed {{ max_file_size }} MB</span>
        </div>
        <div v-else-if="file_type_invalid"
            class="flex flex-row items-center gap-2 text-red-700 px-3 py-1 mt-2 bg-red-100 rounded-md err_msg">
            <i class="fa fa-check-circle"></i>
            <span>Only allowed JPG, JPEG, PNG, WEBP</span>
        </div>
        <div v-else class="my-2" align="center">
            <p>JPG, JPEG, PNG, WEBP up to {{ max_file_size }} MB</p>
        </div>
        <PhotoPopupBlock v-if="Photo_popup_open" @PhotoPopupStatusUpdate="Photo_popup_status_update"
            @createImage="create_image" />
    </div>
</template>
<style lang="scss" scoped>
.photo_upload_block {
    &>.photo_area {
        position: relative;
        width: 100px;
        height: 90px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 50%;
        cursor: pointer;

        &>.change_photo_btn,
        &>.preloader {
            position: absolute;
            display: none;
            font-size: 8px;
            background-color: #16a34a;
            color: #fff;
            border-radius: 25px;
            padding: 2px 5px;
            z-index: 1;

            &.preloader {
                display: flex;
            }
        }

        &>i {
            font-size: 48px;
            color: #bac6bd;
        }

        &>img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        &:hover {
            &>.change_photo_btn {
                display: flex;
            }
        }
    }
}

.signature_upload_block {
    &>.signature_area {
        position: relative;
        position: relative;
        max-width: 100%;
        height: 90px;
        cursor: pointer;

        &>.change_photo_btn,
        &>.preloader {
            position: absolute;
            display: none;
            font-size: 10px;
            background-color: #1676a3;
            color: #fff;
            border-radius: 25px;
            padding: 3px 10px;

            &.preloader {
                display: flex;
            }
        }

        &>i {
            font-size: 48px;
            color: #bac6bd;
        }

        &>img {
            width: 100%;
            height: 100%;
            border-radius: 5px;
            object-fit: cover;
        }

        &:hover {
            &>.change_photo_btn {
                display: flex;
            }
        }
    }
}
</style>