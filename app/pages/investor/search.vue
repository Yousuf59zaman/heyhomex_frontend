<script setup>
definePageMeta({
    layout: 'citizen',
});

const route = useRoute();
const hydrated = ref(false);
const activeTab = ref('home');

// Videos state
const videos = ref([]);
const videosLoading = ref(false);
const videosError = ref(null);
const videosPaginationConfig = ref({
    data: {},
    lang: "en",
    align: "center",
    action: "",
});

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

// Load videos from API
const loadVideos = async () => {
    videosLoading.value = true;
    videosError.value = null;
    try {
        const response = await $fetchCitizen("/videos/list", {
            method: "GET",
            params: {
                page: route.query.videoPage ? route.query.videoPage : 1,
            }
        });

        videos.value = response.data.data.map((video) => ({
            id: video.id,
            title: video.title,
            channel: video.channel?.name || 'Unknown Channel',
            duration: video.duration || '0:00',
            views: '0 views', // API doesn't provide views
            uploadTime: new Date(video.created_at).toLocaleDateString(),
            thumbnail: '/images/dashboard/1.png', // Default thumbnail
            isFavorite: false,
            category: 'Real Estate',
            location: video.latitude && video.longitude ? 'Custom Location' : 'Unknown',
            coordinates: video.latitude && video.longitude ? [video.latitude, video.longitude] : null,
            videoUrl: video.video_url,
        }));

        videosPaginationConfig.value.data = response.data.meta;
    } catch (e) {
        console.error("Error loading videos:", e.message);
        videosError.value = e;
        videos.value = [];
    } finally {
        videosLoading.value = false;
    }
};

onMounted(() => {
    hydrated.value = true;
});

const handleTabClick = (tab) => {
    const router = useRouter();
    router.replace({ query: {} });

    if (tab === 'home') {
        activeTab.value = 'home';
    } else if (tab === 'videos') {
        activeTab.value = 'videos';
        loadVideos();
    }
};
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
                        @click="handleTabClick('home')"
                        :class="[
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            activeTab === 'home'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900',
                        ]">
                        Home
                    </button>
                    <button
                        @click="handleTabClick('videos')"
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
            <SearchProperty v-if="activeTab === 'home'" segment="investor" />
            <div v-else-if="activeTab === 'videos'">
                <!-- Loading State -->
                <div v-if="videosLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    <div v-for="n in 8" :key="n" class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                        <div class="aspect-video bg-gray-200"></div>
                        <div class="p-4 space-y-3">
                            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="videosError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p class="text-red-600 mb-2">Error loading videos. Please try again later.</p>
                    <p class="text-sm text-red-500">{{ videosError.message }}</p>
                    <button @click="loadVideos" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Retry
                    </button>
                </div>

                <!-- Videos Content -->
                <div v-else>
                    <SearchVideo :videos="videos" :adConfig="adConfig"/>

                    <!-- Pagination -->
                    <LazyPagination
                        v-if="videos.length > 0"
                        class="px-4 mt-6"
                        :config="videosPaginationConfig" />
                </div>
            </div>
        </template>
    </div>
</template>
