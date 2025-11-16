<script setup>
definePageMeta({
    layout: 'citizen',
});
// const { getDefaultAdConfig } = useJWPlayerAds();
// const adConfig = getDefaultAdConfig();

// Active tab state
const activeTab = ref('home');

const videos = ref([
    {
        id: 1,
        title: 'These are the best Places to Live in Oahu, Hawaii for...',
        channel: 'Hawaii Living Guide',
        duration: '8:25',
        views: '245K views',
        uploadTime: '2 weeks ago',
        thumbnail: '/images/dashboard/1.png',
        isFavorite: false,
        category: 'Real Estate',
        location: 'Honolulu',
        coordinates: [21.3099, -157.8581],
        videoUrl: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
    },
    {
        id: 2,
        title: 'Best Places to Live in Oahu Hawaii',
        channel: 'Hawaii Home Movers',
        duration: '12:45',
        views: '45K views',
        uploadTime: '2 weeks ago',
        thumbnail: '/images/dashboard/2.png',
        category: 'Real Estate',
        isFavorite: false,
        location: 'Maui',
        coordinates: [20.7984, -156.3319],
        videoUrl: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
    },
    {
        id: 3,
        title: 'Living in Hawaii - The Complete Guide',
        channel: "Kama'aina Cleaning Services",
        duration: '8:30',
        views: '23K views',
        uploadTime: '1 month ago',
        thumbnail: '/images/dashboard/3.png',
        category: 'Tourism',
        isFavorite: false,
        location: 'Kauai',
        coordinates: [22.0964, -159.5261],
        videoUrl: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
    },
    {
        id: 4,
        title: 'Hawaii Real Estate Market 2024',
        channel: 'Aloha Handyman Services',
        duration: '15:20',
        views: '67K views',
        uploadTime: '3 days ago',
        thumbnail: '/images/dashboard/1.png',
        category: 'Real Estate',
        isFavorite: false,
        location: 'Hilo',
        coordinates: [19.7297, -155.0900],
        videoUrl: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
    },
]);
const adConfig = ref({
    "client": "vast",
    "schedule": [
        {
            "offset": "pre",
            "tag": "http://localhost:3000/ads/pre-roll-ad.xml",
            "type": "linear"
        },
        {
            "offset": "50%",
            "tag": "http://localhost:3000/ads/mid-roll-ad.xml",
            "type": "linear"
        },
        {
            "offset": "post",
            "tag": "http://localhost:3000/ads/post-roll-ad.xml",
            "type": "linear"
        }
    ],
    "skipoffset": 5,
    "admessage": "This ad will end in xx seconds",
    "skipmessage": "Skip ad",
    "vpaidcontrols": true,
    "autoplayadsmuted": false
});
</script>

<template>
    <div class="space-y-4 lg:space-y-6">
        <!-- Tab Navigation -->
        <div class="bg-white rounded-lg p-3 lg:p-4">
            <div class="flex items-center gap-3">
                <button @click="activeTab = 'home'" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === 'home'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                ]">
                    Home
                </button>
                <button @click="activeTab = 'videos'" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === 'videos'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                ]">
                    Videos
                </button>
            </div>
        </div>

        <!-- Content based on active tab -->
        <SearchProperty v-if="activeTab === 'home'" />
        <SearchVideo v-else-if="activeTab === 'videos'" :videos="videos" :adConfig="adConfig"/>
    </div>
</template>
