<script setup>
definePageMeta({
    layout: 'citizen',
});

// Active tab state
const activeTab = ref('home');

const videos = ref([
    {
        id: 1,
        title: 'Military Housing Benefits and VA Loans in Hawaii',
        channel: 'Hawaii Military Housing',
        duration: '10:15',
        views: '125K views',
        uploadTime: '1 week ago',
        thumbnail: '/images/dashboard/1.png',
        isFavorite: false,
        category: 'Military Benefits',
        location: 'Joint Base Pearl Harbor',
        coordinates: [21.3486, -157.9500],
        videoUrl: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
    },
    {
        id: 2,
        title: 'Best Areas for Military Families in Oahu',
        channel: 'Military Relocation Guide',
        duration: '14:30',
        views: '89K views',
        uploadTime: '2 weeks ago',
        thumbnail: '/images/dashboard/2.png',
        category: 'Housing',
        isFavorite: false,
        location: 'Ewa Beach',
        coordinates: [21.3156, -158.0072],
        videoUrl: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
    },
    {
        id: 3,
        title: 'Living Near Schofield Barracks - Complete Guide',
        channel: 'Hawaii Military Life',
        duration: '11:45',
        views: '67K views',
        uploadTime: '3 weeks ago',
        thumbnail: '/images/dashboard/3.png',
        category: 'Lifestyle',
        isFavorite: false,
        location: 'Mililani',
        coordinates: [21.4508, -158.0150],
        videoUrl: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
    },
    {
        id: 4,
        title: 'Marine Corps Base Hawaii Housing Options',
        channel: 'USMC Housing Hawaii',
        duration: '9:20',
        views: '54K views',
        uploadTime: '1 month ago',
        thumbnail: '/images/dashboard/1.png',
        category: 'Military Housing',
        isFavorite: false,
        location: 'Kaneohe',
        coordinates: [21.4180, -157.7395],
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
                <button
                    @click="activeTab = 'home'"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeTab === 'home'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900',
                    ]">
                    Home
                </button>
                <button
                    @click="activeTab = 'videos'"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeTab === 'videos'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900',
                    ]">
                    Videos
                </button>
            </div>
        </div>

        <!-- Content based on active tab -->
        <SearchProperty v-if="activeTab === 'home'" segment="military" />
        <SearchVideo v-else-if="activeTab === 'videos'" :videos="videos" :adConfig="adConfig" />
    </div>
</template>
