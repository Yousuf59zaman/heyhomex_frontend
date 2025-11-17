<script setup>
definePageMeta({
    layout: 'citizen',
});

// Hydration state - starts false, becomes true after client mount
const hydrated = ref(false);

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

// Set hydrated to true when component mounts on client
onMounted(() => {
    hydrated.value = true;
});
</script>

<template>
    <div class="space-y-4 lg:space-y-6">
        <!-- Skeleton BEFORE hydration -->
        <template v-if="!hydrated">
            <!-- Tab Navigation Skeleton -->
            <div class="bg-white rounded-lg p-3 lg:p-4 animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-20 bg-gray-200 rounded-lg"></div>
                    <div class="h-10 w-20 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

            <!-- Search Filters Skeleton -->
            <div class="bg-white rounded-lg p-4 lg:p-6 animate-pulse">
                <div class="space-y-4">
                    <!-- Search Input Skeleton -->
                    <div class="h-12 bg-gray-200 rounded-lg w-full"></div>
                    
                    <!-- Filter Buttons Skeleton -->
                    <div class="flex flex-wrap gap-3">
                        <div class="h-10 w-24 bg-gray-200 rounded-lg"></div>
                        <div class="h-10 w-28 bg-gray-200 rounded-lg"></div>
                        <div class="h-10 w-32 bg-gray-200 rounded-lg"></div>
                        <div class="h-10 w-24 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>

            <!-- Results Header Skeleton -->
            <div class="bg-white rounded-lg p-4 lg:p-6 animate-pulse">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div class="h-6 w-48 bg-gray-200 rounded"></div>
                    <div class="flex items-center gap-4">
                        <div class="h-5 w-32 bg-gray-200 rounded"></div>
                        <div class="flex gap-2">
                            <div class="h-10 w-24 bg-gray-200 rounded-lg"></div>
                            <div class="h-10 w-24 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Property Cards Grid Skeleton -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                <CommonCitizenPropertyCardSkeleton v-for="n in 8" :key="n" />
            </div>
        </template>

        <!-- Real content AFTER hydration -->
        <template v-else>
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
        </template>
    </div>
</template>
