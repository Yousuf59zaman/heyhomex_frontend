<script setup>
definePageMeta({
    layout: 'citizen',
});

const route = useRoute()
const hydrated = ref(false);
const activeTab = ref('home');
const { $formatdate } = useNuxtApp();

// Videos state
const videos = ref([]);
const videosLoading = ref(false);
const videosError = ref(null);
const videosPaginationConfig = ref({
    data: {},
    lang: "en",
    align: "center",
    action: "",
    queryKey: "videoPage",
});
const videoSearchQuery = ref('');

// Ad configuration - uses dynamic URLs based on current host
const { getDefaultAdConfig } = useAdConfig();
const adConfig = computed(() => getDefaultAdConfig());
const tabButtonBase =
    "flex-1 px-4 py-2 rounded-[8px] text-[14px] leading-[20px] font-bold transition-colors";

// Load videos from API
const loadVideos = async () => {
    videosLoading.value = true;
    videosError.value = null;
    try {
        const params = {
            page: route.query.videoPage ? route.query.videoPage : 1,
        };
        
        if (videoSearchQuery.value) {
            params.search = videoSearchQuery.value;
        }
        
        const response = await $fetchCitizen("/videos/list", {
            method: "GET",
            params: params
        });

        videos.value = response.data.data.map((video) => ({
            id: video.id,
            title: video.title,
            channel: video.channel?.name || 'Unknown Channel',
            duration: video.duration || '0:00',
            views: '0 views',
            uploadTime: $formatdate(video.created_at),
            thumbnail: video.video_image || '/images/dashboard/1.png',
            isFavorite: false,
            category: 'Real Estate',
            location: video.location?.latitude && video.location?.longitude ? 'Custom Location' : 'Unknown',
            coordinates: video.location?.latitude && video.location?.longitude ? [video.location.latitude, video.location.longitude] : null,
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

const handleVideoSearch = (query) => {
    videoSearchQuery.value = query;
    loadVideos();
};

onMounted(() => {
    hydrated.value = true;
});

const handleTabClick = async (tab) => {
    const router = useRouter();
    await router.replace({ query: {} });

    if (tab === 'home') {
        activeTab.value = 'home';
    } else if (tab === 'videos') {
        activeTab.value = 'videos';
        loadVideos();
    }
};

watch(
    () => route.query.videoPage,
    () => {
        if (activeTab.value !== 'videos') return;
        loadVideos();
    }
);
</script>

<template>
    <FeatureDisplay class="mb-4" v-if="hydrated" placement-slug="kamaina-search-top-banner" />
    <div class="flex flex-col gap-4 lg:gap-6 w-full max-w-[1316px] mx-auto">
        <template v-if="!hydrated">
            <div class="flex flex-col gap-4 animate-pulse">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="bg-white rounded-[8px] p-[6px] w-full max-w-[340px] lg:w-[340px]">
                        <div class="flex items-center gap-3">
                            <div class="flex-1 h-[36px] bg-gray-200 rounded-[8px]"></div>
                            <div class="flex-1 h-[36px] bg-gray-200 rounded-[8px]"></div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row items-stretch gap-3 lg:gap-6 w-full lg:w-auto">
                        <div class="flex items-center gap-2 w-full">
                            <div class="relative flex-1 lg:flex-none lg:w-[440px]">
                                <div class="w-full h-[44px] bg-gray-200 rounded-[8px]"></div>
                            </div>
                            <div
                                class="md:hidden w-[44px] h-[44px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center justify-center">
                                <div class="w-4 h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div class="w-full sm:w-auto h-[44px] px-4 bg-gray-200 rounded-[8px]"></div>
                    </div>
                </div>

                <div class="hidden md:flex flex-wrap items-center gap-2">
                    <div
                        class="h-[44px] min-w-[170px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                        <div class="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div
                        class="h-[44px] min-w-[170px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                        <div class="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div
                        class="h-[44px] min-w-[210px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                        <div class="h-4 w-28 bg-gray-200 rounded"></div>
                    </div>
                    <div
                        class="h-[44px] min-w-[170px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                        <div class="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div
                        class="h-[44px] min-w-[150px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                        <div class="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>

                <div class="bg-white rounded-[12px] p-3 sm:p-4 flex flex-col gap-4">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div class="flex flex-col gap-3 flex-1">
                            <div class="h-[28px] lg:h-[32px] w-56 bg-gray-200 rounded"></div>
                            <div class="h-5 w-32 bg-gray-200 rounded"></div>
                        </div>

                        <div
                            class="bg-[#F0F1F3] rounded-[8px] p-[6px] flex items-center gap-1 w-full sm:w-auto sm:self-start">
                            <div class="flex-1 sm:flex-none h-[32px] bg-gray-200 rounded-[8px]"></div>
                            <div class="flex-1 sm:flex-none h-[32px] bg-gray-200 rounded-[8px]"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CommonCitizenPropertyCardSkeleton v-for="n in 9" :key="n" />
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <SearchProperty v-if="activeTab === 'home'" filters-variant="figma">
                <template #tabs>
                    <div class="bg-white rounded-[8px] p-[6px] w-full max-w-[340px] lg:w-[340px]">
                        <div class="flex items-center gap-3">
                            <button @click="handleTabClick('home')" :class="[
                                tabButtonBase,
                                activeTab === 'home'
                                    ? 'bg-[#18222c] text-white'
                                    : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e3e5e8]',
                            ]">
                                Home
                            </button>
                            <button @click="handleTabClick('videos')" :class="[
                                tabButtonBase,
                                activeTab === 'videos'
                                    ? 'bg-[#18222c] text-white'
                                    : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e3e5e8]',
                            ]">
                                Videos
                            </button>
                        </div>
                    </div>
                </template>
            </SearchProperty>
            <div v-else-if="activeTab === 'videos'">
                <!-- Loading State -->
                <div v-if="videosLoading" class="flex flex-col gap-4 animate-pulse">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div class="bg-white rounded-[8px] p-[6px] w-full max-w-[340px] lg:w-[340px]">
                            <div class="flex items-center gap-3">
                                <div class="flex-1 h-[36px] bg-gray-200 rounded-[8px]"></div>
                                <div class="flex-1 h-[36px] bg-gray-200 rounded-[8px]"></div>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row items-stretch gap-3 lg:gap-6 w-full lg:w-auto">
                            <div class="flex items-center gap-2 w-full">
                                <div class="relative flex-1 lg:flex-none lg:w-[440px]">
                                    <div class="w-full h-[44px] bg-gray-200 rounded-[8px]"></div>
                                </div>
                                <div
                                    class="md:hidden w-[44px] h-[44px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center justify-center">
                                    <div class="w-4 h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                            <div class="w-full sm:w-auto h-[44px] px-4 bg-gray-200 rounded-[8px]"></div>
                        </div>
                    </div>

                    <div class="hidden md:flex flex-wrap items-center gap-2">
                        <div
                            class="h-[44px] min-w-[170px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                            <div class="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div
                            class="h-[44px] min-w-[170px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                            <div class="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div
                            class="h-[44px] min-w-[210px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                            <div class="h-4 w-28 bg-gray-200 rounded"></div>
                        </div>
                        <div
                            class="h-[44px] min-w-[170px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                            <div class="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div
                            class="h-[44px] min-w-[150px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center px-3">
                            <div class="h-4 w-16 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    <div class="bg-white rounded-[12px] p-3 sm:p-4 flex flex-col gap-4">
                        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div class="flex flex-col gap-3 flex-1">
                                <div class="h-[28px] lg:h-[32px] w-56 bg-gray-200 rounded"></div>
                                <div class="h-5 w-32 bg-gray-200 rounded"></div>
                            </div>

                            <div
                                class="bg-[#F0F1F3] rounded-[8px] p-[6px] flex items-center gap-1 w-full md:w-auto md:self-start">
                                <div class="flex-1 sm:flex-none h-[32px] bg-gray-200 rounded-[8px]"></div>
                                <div class="flex-1 sm:flex-none h-[32px] bg-gray-200 rounded-[8px]"></div>
                            </div>
                        </div>

                        <div
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                            <div v-for="n in 9" :key="n" class="video-card flex flex-col">
                                <div class="relative h-[200px] rounded-[10px] overflow-hidden bg-gray-200"></div>
                                <div class="flex gap-1 items-start mt-4">
                                    <div class="flex-1 flex gap-4 items-start">
                                        <div class="bg-gray-200 rounded-[10px] w-12 h-12 flex-shrink-0"></div>
                                        <div class="flex-1 flex flex-col gap-2">
                                            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                                            <div class="flex items-center gap-1.5">
                                                <div class="h-3 bg-gray-200 rounded w-16"></div>
                                                <div class="h-3 bg-gray-200 rounded w-10"></div>
                                                <div class="h-3 bg-gray-200 rounded w-14"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="w-5 h-5 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="videosError" class="bg-red-50 border border-red-200 rounded-[8px] p-6 text-center">
                    <p class="text-red-600 mb-2">Error loading videos. Please try again later.</p>
                    <p class="text-sm text-red-500">{{ videosError.message }}</p>
                    <button @click="loadVideos"
                        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition-colors">
                        Retry
                    </button>
                </div>

                <!-- Videos Content -->
                <div v-else class="flex flex-col gap-4">
                    <SearchVideo :videos="videos" filters-variant="figma" @search="handleVideoSearch">
                        <template #tabs>
                            <div class="bg-white rounded-[8px] p-[6px] w-full max-w-[340px] lg:w-[340px]">
                                <div class="flex items-center gap-3">
                                    <button @click="handleTabClick('home')" :class="[
                                        tabButtonBase,
                                        activeTab === 'home'
                                            ? 'bg-[#18222c] text-white'
                                            : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e3e5e8]',
                                    ]">
                                        Home
                                    </button>
                                    <button @click="handleTabClick('videos')" :class="[
                                        tabButtonBase,
                                        activeTab === 'videos'
                                            ? 'bg-[#18222c] text-white'
                                            : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e3e5e8]',
                                    ]">
                                        Videos
                                    </button>
                                </div>
                            </div>
                        </template>
                    </SearchVideo>

                    <!-- Pagination -->
                    <LazyPagination v-if="videos.length > 0" class="px-4" :config="videosPaginationConfig" />
                </div>
            </div>
        </template>
    </div>
</template>
