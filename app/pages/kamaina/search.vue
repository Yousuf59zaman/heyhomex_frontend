<script setup>
definePageMeta({
    layout: 'citizen',
});

const route = useRoute()
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

// Ad configuration - uses dynamic URLs based on current host
const { getDefaultAdConfig } = useAdConfig();
const adConfig = computed(() => getDefaultAdConfig());

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
            views: '0 views', 
            uploadTime: new Date(video.created_at).toLocaleDateString(),
            thumbnail: video.video_image || '/images/dashboard/1.png', 
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
    <div class="flex flex-col gap-4 lg:gap-6 w-full max-w-[1316px]">
        <template v-if="!hydrated">
            <div class="bg-white rounded-[8px] p-[6px] w-full max-w-[340px] animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="h-10 flex-1 bg-gray-200 rounded-[8px]"></div>
                    <div class="h-10 flex-1 bg-gray-200 rounded-[8px]"></div>
                </div>
            </div>
            <div class="bg-white rounded-[12px] p-3 lg:p-4 animate-pulse">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-3">
                        <div class="h-8 w-3/4 bg-gray-200 rounded"></div>
                        <div class="h-5 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div class="flex items-center gap-3 w-full lg:w-auto">
                        <div class="h-10 flex-1 lg:flex-none lg:w-24 bg-gray-200 rounded-[8px]"></div>
                        <div class="h-10 flex-1 lg:flex-none lg:w-24 bg-gray-200 rounded-[8px]"></div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CommonCitizenPropertyCardSkeleton v-for="n in 9" :key="n" />
            </div>
        </template>
        <template v-else>
            <div v-if="activeTab === 'videos'" class="bg-white rounded-[8px] p-[6px] w-full max-w-[340px]">
                <div class="flex items-center gap-3">
                    <button
                        @click="handleTabClick('home')"
                        :class="[
                            'flex-1 px-4 py-2 rounded-[8px] text-[14px] leading-[20px] font-bold transition-colors',
                            activeTab === 'home'
                                ? 'bg-[#18222C] text-white'
                                : 'bg-[#F0F1F3] text-[#121A22] hover:bg-[#E3E5E8]',
                        ]">
                        Home
                    </button>
                    <button
                        @click="handleTabClick('videos')"
                        :class="[
                            'flex-1 px-4 py-2 rounded-[8px] text-[14px] leading-[20px] font-bold transition-colors',
                            activeTab === 'videos'
                                ? 'bg-[#18222C] text-white'
                                : 'bg-[#F0F1F3] text-[#121A22] hover:bg-[#E3E5E8]',
                        ]">
                        Videos
                    </button>
                </div>
            </div>
            <SearchProperty v-if="activeTab === 'home'" filters-variant="figma">
                <template #tabs>
                    <div class="bg-white rounded-[8px] p-[6px] w-full max-w-[340px]">
                        <div class="flex items-center gap-3">
                            <button
                                @click="handleTabClick('home')"
                                :class="[
                                    'flex-1 px-4 py-2 rounded-[8px] text-[14px] leading-[20px] font-bold transition-colors',
                                    activeTab === 'home'
                                        ? 'bg-[#18222C] text-white'
                                        : 'bg-[#F0F1F3] text-[#121A22] hover:bg-[#E3E5E8]',
                                ]">
                                Home
                            </button>
                            <button
                                @click="handleTabClick('videos')"
                                :class="[
                                    'flex-1 px-4 py-2 rounded-[8px] text-[14px] leading-[20px] font-bold transition-colors',
                                    activeTab === 'videos'
                                        ? 'bg-[#18222C] text-white'
                                        : 'bg-[#F0F1F3] text-[#121A22] hover:bg-[#E3E5E8]',
                                ]">
                                Videos
                            </button>
                        </div>
                    </div>
                </template>
            </SearchProperty>
            <div v-else-if="activeTab === 'videos'">
                <!-- Loading State -->
                <div v-if="videosLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div v-for="n in 8" :key="n" class="bg-white rounded-[8px] border border-[#D9D9D9] overflow-hidden animate-pulse">
                        <div class="aspect-video bg-gray-200"></div>
                        <div class="p-4 space-y-3">
                            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="videosError" class="bg-red-50 border border-red-200 rounded-[8px] p-6 text-center">
                    <p class="text-red-600 mb-2">Error loading videos. Please try again later.</p>
                    <p class="text-sm text-red-500">{{ videosError.message }}</p>
                    <button @click="loadVideos" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-[8px] hover:bg-red-700 transition-colors">
                        Retry
                    </button>
                </div>

                <!-- Videos Content -->
                <div v-else class="flex flex-col gap-4">
                    <SearchVideo :videos="videos" />

                    <!-- Pagination -->
                    <LazyPagination
                        v-if="videos.length > 0"
                        class="px-4"
                        :config="videosPaginationConfig" />
                </div>
            </div>
        </template>
    </div>
</template>
