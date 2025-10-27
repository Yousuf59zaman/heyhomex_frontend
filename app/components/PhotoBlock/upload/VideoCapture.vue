<template>
    <div class="web-camera-container border border-[#ccc] dark:border-gray-600 min-h-[100px] pt-4">
        <!-- <div class="camera-button">
            <button type="button" class="button is-rounded" :class="{ 'is-primary' : !isCameraOpen, 'is-danger' : isCameraOpen}" @click="toggleCamera">
                <span v-if="!isCameraOpen">Open Camera</span>
                <span v-else>Close Camera</span>
            </button>
        </div> -->
        
        <div v-show="isCameraOpen && isLoading" class="camera-loading mt-4">
            <ul class="loader-circle">
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
        
        <div v-if="isCameraOpen" v-show="!isLoading" class="relative camera-box mt-4" :style="`width:${width}px;height:${height}px`" :class="{ 'flash' : isShotPhoto }">
            
            <div class="camera-shutter" :style="`width:${width}px;height:${height}px`" :class="{'flash' : isShotPhoto}"></div>
            
            <video v-show="!isPhotoTaken" ref="camera" :width="(width==height?(height*450)/337.5:width)" :height="height" autoplay></video>
            
            <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas" :width="width" :height="height"></canvas>
        </div>
        
        <div v-if="isCameraOpen && !isLoading" class="relative camera-shoot z-50">
            <button type="button" class="button border dark:bg-gray-700 border-[#ddd] dark:border-gray-600 cursor-pointer" @click="takePhoto">
                <!-- <i class="fa fa-camera"></i> -->
                <CameraIcon class="w-6 h-6 text-gray-600 dark:text-gray-200 transition-all" />
            </button>
        </div>
        
        <!-- <div v-if="isPhotoTaken && isCameraOpen" class="camera-download">
            <a id="downloadPhoto" download="my-photo.jpg" class="button" role="button" @click="downloadImage">Download</a>
        </div> -->        
    </div>
    <div v-if="get_capture" class="mt-4">
        <button type="button" class="inline-flex w-full items-center justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:col-start-2 gap-2" @click="submit">
            <i class="fa fa-check"></i>
            <span>Submit</span>
        </button>
    </div>
</template>
<script setup>
    import { CameraIcon } from '@heroicons/vue/20/solid'
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    const isCameraOpen = ref(false)
    const isPhotoTaken = ref(false)
    const isShotPhoto = ref(false)
    const isLoading = ref(false)
    const camera = ref('')
    const canvas = ref('')
    const get_capture = ref('')

    const emit = defineEmits(['createImage','closePopup'])
    const props = defineProps({
        width: Number,
        height: Number
    })

    onMounted( () => {
        toggleCamera()
    })

    onBeforeUnmount( () => {
        stopCamera()
    })

    const toggleCamera = () => {
        if(isCameraOpen.value) {
            stopCamera()
        } else {
            isCameraOpen.value = true
            createCameraElement()
        }
    }
    
    const createCameraElement = () => {
        isLoading.value = true
      
        const constraints = (window.constraints = {
            audio: false,
            video: true
        });


        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                isLoading.value = false
                camera.value.srcObject = stream
            })
            .catch(error => {
                isLoading.value = false;
                alert("May the browser didn't support or there is some errors.");
            })
    }

    const stopCamera = () => {
        isCameraOpen.value = false
        isPhotoTaken.value = false
        isShotPhoto.value = false
        stopCameraStream()
    }
    
    const stopCameraStream = () => {
        if(camera.value){
            let tracks = camera.value.srcObject.getTracks()

            if(tracks.length > 0) {
                tracks.forEach(track => {
                    track.stop()
                })
            }
        }
    }
    
    const takePhoto = () => {
        get_capture.value = ''
        if(!isPhotoTaken.value) {
            isShotPhoto.value = true

            const FLASH_TIMEOUT = 50

            setTimeout(() => {
                isShotPhoto.value = false
            }, FLASH_TIMEOUT)

            const context = canvas.value.getContext('2d')
            context.drawImage(camera.value, 0, 0, props.width, props.height)

            get_capture.value = canvas.value.toDataURL("image/jpeg")
            //console.log(get_capture.value)
            // .replace("image/jpeg", "image/octet-stream"))
        }
        
        isPhotoTaken.value = !isPhotoTaken.value;        
    }
    
    // const downloadImage = () => {
    //   const download = document.getElementById("downloadPhoto");
    //   const canvas = document.getElementById("photoTaken").toDataURL("image/jpeg")
    // .replace("image/jpeg", "image/octet-stream");
    //   download.setAttribute("href", canvas);
    // }

    const submit = () => {
        emit('createImage', get_capture.value)
        emit('closePopup')
    }
</script>
<style lang="scss" scoped>
    .web-camera-container {        
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        // border: 1px solid #ccc;
        border-radius: 4px;
    
        .camera-button {
            margin-bottom: 2rem;
        }
        
        .camera-box {    
            .camera-shutter {
                opacity: 0;
                background-color: #fff;
                position: absolute;
                
                &.flash {
                    opacity: 1;
                }
            }
        }
        
        .camera-shoot {
            margin: 1rem 0;
            
            button {
                height: 60px;
                width: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 100%;
                
                img {
                    height: 35px;
                    object-fit: cover;
                }
            }
        }
        
        .camera-loading {
            overflow: hidden;
            height: 100%;
            position: absolute;
            width: 100%;
            min-height: 150px;
            margin: 3rem 0 0 -1.2rem;
            
            ul {
                height: 100%;
                position: absolute;
                width: 100%;
                z-index: 999999;
                margin: 0;
            }
            
            .loader-circle {
                display: block;
                height: 14px;
                margin: 0 auto;
                top: 50%;
                left: 100%;
                transform: translateY(-50%);
                transform: translateX(-50%);
                position: absolute;
                width: 100%;
                padding: 0;
                
                li {
                    display: block;
                    float: left;
                    width: 10px;
                    height: 10px;
                    line-height: 10px;
                    padding: 0;
                    position: relative;
                    margin: 0 0 0 4px;
                    background: #999;
                    animation: preload 1s infinite;
                    top: -50%;
                    border-radius: 100%;
                    
                    &:nth-child(2) {
                        animation-delay: .2s;
                    }
                    
                    &:nth-child(3) {
                        animation-delay: .4s;
                    }
                }
            }
        }

        @keyframes preload {
            0% {
                opacity: 1
            }
            50% {
                opacity: .4
            }
            100% {
                opacity: 1
            }
        }
    }
</style>