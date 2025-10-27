<template>
    <div class="flex items-center justify-center">
        <div class="relative flex justify-center border border-collapse border-[#ddd] rounded-md"
            :style="`width:${width}px;height:${height}px`">
            <img v-if="Photo" :src="Photo" class="w-full h-full object-contain" />
            <div :class="['absolute inline-flex items-center justify-center cursor-pointer transition-all',Photo?'bg-sky-600 bg-opacity-30 hover:bg-opacity-100 text-white text-[11px] h-6 px-3 bottom-8 gap-2 rounded-2xl':'text-gray-400 w-full h-full left-0 top-0']"
                @click="upload_photo">
                <CloudArrowUpIcon :class="[Photo?'w-4 h-4':'w-12 h-12']" />
                <span v-if="Photo">Upload</span>
            </div>
            <input type="file" ref="photo_input_form" class="hidden" @change="load_image"
                accept="image/jpg,image/jpeg,image/png" />
        </div>
    </div>
    <div v-if="file_size_exceeded"
        class="flex flex-row items-center gap-2 text-red-700 px-3 h-8 bg-red-100 rounded-md err_msg mt-4">
        <i class="fa fa-check-circle"></i>
        <span>File size exceeded. Maxium allowed {{ max_file_size }} MB</span>
    </div>
    <div v-else-if="file_type_invalid"
        class="flex flex-row items-center gap-2 text-red-700 px-3 py-1 mt-2 bg-red-100 rounded-md err_msg mt-4">
        <i class="fa fa-check-circle"></i>
        <span>Only allowed JPG, JPEG, PNG, WEBP</span>
    </div>
    <div v-else class="my-4" align="center">
        <p>JPG, JPEG, PNG, WEBP up to {{ max_file_size }} MB</p>
    </div>
    <div v-if="Photo" class="mt-4">
        <button type="button"
            class="inline-flex w-full items-center justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:col-start-2 gap-2"
            @click="submit">
            <i class="fa fa-check"></i>
            <span>Submit</span>
        </button>
    </div>
</template>
<script setup>
    import { CloudArrowUpIcon } from '@heroicons/vue/20/solid'
    import { ref, watch } from 'vue'
    
    const props = defineProps({
        width: Number,
        height: Number
    })
    const emit = defineEmits(['createImage','closePopup'])
    const max_file_size = ref(2)
    const Photo = ref('')
    const file_size_exceeded = ref(false)
    const photo_input_form = ref('')
    const set_file_name = ref('')
    const allow_file_ext = ref(['image/jpg', 'image/jpeg', 'image/png', 'image/webp'])
    const file_type_invalid = ref(false)

    const upload_photo = () =>{
        photo_input_form.value.click();
    }
    const load_image = (e) => {
        Photo.value = ''
        file_size_exceeded.value = false
        file_type_invalid.value = false
        var files = e.target.files || e.dataTransfer.files
        if (!files.length) return
        // //console.log('File info', files[0])
        
        // Image type checking
        if(allow_file_ext.value.indexOf(files[0].type)==-1) {
            file_type_invalid.value = true
            return false
        }

        // File size checking
        let get_file_size = files[0].size;
        if(get_file_size / 1024 > max_file_size.value * 1024) {
            file_size_exceeded.value = true
            return false
        }
        
        get_file_name(files[0].name)
        CreateImage(files[0])
    }

    const get_file_name = (file) => {
        set_file_name.value = file.split('.').slice(0, -1).join('.')
    }
    
    const CreateImage = (file) => {
        var reader = new FileReader();

        reader.onload = (e) => {
            Photo.value = e.target.result
        }

        reader.readAsDataURL(file)
    }

    const submit = () => {
        emit('createImage', Photo.value)
        emit('closePopup')
    }
</script>