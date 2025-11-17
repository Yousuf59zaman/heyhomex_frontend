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
        </template>
    </div>
</template>
