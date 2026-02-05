<script setup>
import Hls from 'hls.js'

const props = defineProps({
    thumbnail: {
        type: String,
        default: null
    },
    videoUrl: {
        type: String,
        default: null
    },
    alt: {
        type: String,
        default: 'Video thumbnail'
    },
    placeholderImage: {
        type: String,
        default: '/images/dashboard/1.png'
    },
    seekTime: {
        type: Number,
        default: 7
    }
})

const videoRefs = new Map()

// Seek to target time (default 5s) or mid-duration if video is shorter
const seekToTarget = (el) => {
    if (!el) return
    const targetTime = el.duration > props.seekTime ? props.seekTime : el.duration / 2
    el.currentTime = targetTime
}

const initHls = (el, src) => {
    if (!el || !src) return

    if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(el)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            el.addEventListener('loadedmetadata', () => seekToTarget(el), { once: true })
        })
        videoRefs.set(el, hls)
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        el.src = src
        el.addEventListener('loadedmetadata', () => seekToTarget(el), { once: true })
    }
}

// Check if thumbnail is valid (not null/empty and not the default placeholder)
const hasValidThumbnail = computed(() => {
    return props.thumbnail && props.thumbnail !== props.placeholderImage
})

// Check if video is an HLS stream
const isHlsVideo = computed(() => {
    return props.videoUrl && props.videoUrl.endsWith('.m3u8')
})

// Check if video is a standard video file
const isStandardVideo = computed(() => {
    return props.videoUrl && !props.videoUrl.endsWith('.m3u8')
})

onBeforeUnmount(() => {
    videoRefs.forEach(hls => hls.destroy())
    videoRefs.clear()
})
</script>

<template>
    <!-- Static thumbnail image -->
    <img 
        v-if="hasValidThumbnail"
        :src="thumbnail"
        :alt="alt"
        class="w-full h-full object-cover"
    />

    <!-- HLS Video preview (for .m3u8 streams when no thumbnail) -->
    <video
        v-else-if="isHlsVideo"
        :ref="el => initHls(el, videoUrl)"
        preload="metadata"
        muted
        playsinline
        class="w-full h-full object-cover bg-black"
    />

    <!-- Standard video preview (for mp4, webm etc when no thumbnail) -->
    <video
        v-else-if="isStandardVideo"
        :src="videoUrl"
        preload="metadata"
        muted
        playsinline
        @loadedmetadata="(e) => seekToTarget(e.target)"
        class="w-full h-full object-cover bg-black"
    />

    <!-- Fallback placeholder -->
    <img 
        v-else
        :src="placeholderImage"
        :alt="alt"
        class="w-full h-full object-cover"
    />
</template>
