<script setup>
definePageMeta({
    layout: 'citizen',
});

const route = useRoute();
const router = useRouter();
const videoId = route.params.id;

const hydrated = ref(false);
const video = ref(null);
const relatedVideos = ref([]);
const loading = ref(true);
const error = ref(null);
const showFullDescription = ref(false);
const playerRef = ref(null);

// Ad configuration - uses dynamic URLs based on current host
const { getDefaultAdConfig } = useAdConfig();
const adConfig = computed(() => getDefaultAdConfig());

// Load video details
const loadVideoDetails = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await $fetchCitizen(`/videos/${videoId}/show`, {
            method: 'GET',
        });

        const data = response.data;
        video.value = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            duration: data.duration || '0:00',
            thumbnail: data.video_image || '/images/dashboard/1.png',
            videoUrl: data.video_url,
            channel: data.channel?.name || 'Unknown Channel',
            channelId: data.channel?.id,
            views: '0 views',
            uploadTime: formatTimeAgo(data.created_at),
            createdAt: data.created_at,
            createdBy: data.created_by,
        };
    } catch (e) {
        console.error('Error loading video details:', e.message);
        error.value = e;
    } finally {
        loading.value = false;
    }
};

// Load related videos
const loadRelatedVideos = async () => {
    try {
        const response = await $fetchCitizen('/videos/list', {
            method: 'GET',
            params: {
                page: 1,
                per_page: 10,
            },
        });

        relatedVideos.value = response.data.data
            .filter((v) => v.id !== parseInt(videoId))
            .map((v) => ({
                id: v.id,
                title: v.title,
                thumbnail: v.video_image || '/images/dashboard/1.png',
                duration: v.duration || '0:00',
                channel: v.channel?.name || 'Unknown Channel',
                views: '0 views',
                uploadTime: formatTimeAgo(v.created_at),
                videoUrl: v.video_url,
            }));
    } catch (e) {
        console.error('Error loading related videos:', e.message);
    }
};

// Format time ago
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

// Navigate to another video
const watchVideo = (id) => {
    router.push(`/kamaina/watch/${id}`);
};

// Share video
const shareVideo = async () => {
    const url = window.location.href;
    if (navigator.share) {
        try {
            await navigator.share({
                title: video.value?.title,
                url: url,
            });
        } catch (e) {
            // Share cancelled by user
        }
    } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
};

// Truncate description
const truncatedDescription = computed(() => {
    if (!video.value?.description) return '';
    if (showFullDescription.value) return video.value.description;
    return video.value.description.length > 200
        ? video.value.description.substring(0, 200) + '...'
        : video.value.description;
});

onMounted(() => {
    hydrated.value = true;
    loadVideoDetails();
    loadRelatedVideos();
});

// Watch for route changes to load new video
watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            loadVideoDetails();
            loadRelatedVideos();
        }
    }
);
</script>

<template>
    <div class="min-h-screen bg-[#FAF9F8]">
        <!-- Skeleton loading state -->
        <div v-if="!hydrated || loading" class="max-w-[1800px] mx-auto px-4 py-4">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Main content skeleton -->
                <div class="flex-1">
                    <div class="aspect-video bg-gray-200 rounded-xl animate-pulse mb-4"></div>
                    <div class="space-y-3">
                        <div class="h-7 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div class="flex items-center gap-4">
                            <div class="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                            <div class="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                        <div class="h-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
                <!-- Sidebar skeleton -->
                <div class="w-full lg:w-[400px] space-y-4">
                    <div v-for="n in 5" :key="n" class="flex gap-3 animate-pulse">
                        <div class="w-40 h-24 bg-gray-200 rounded"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 bg-gray-200 rounded w-full"></div>
                            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="flex justify-center items-center min-h-[60vh] p-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p class="text-red-600 mb-2">Error loading video. Please try again later.</p>
                <p class="text-sm text-red-500 mb-4">{{ error.message }}</p>
                <button
                    @click="loadVideoDetails"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Retry
                </button>
            </div>
        </div>

        <!-- Main content -->
        <div v-else-if="video" class="max-w-[1800px] mx-auto px-4 py-4">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Left side: Video Player and Info -->
                <div class="flex-1 min-w-0">
                    <!-- Video Player -->
                    <div class="bg-black rounded-xl overflow-hidden mb-4">
                        <div class="aspect-video">
                            <VideoHlsJsPlayer
                                v-if="video"
                                ref="playerRef"
                                :video="video"
                                :autoplay="true" />
                        </div>
                    </div>

                    <!-- Video Title -->
                    <h1 class="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                        {{ video.title }}
                    </h1>

                    <!-- Video Meta and Actions -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <!-- Channel info and views -->
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                                    <span class="text-white font-semibold text-sm">
                                        {{ video.channel?.charAt(0) || 'H' }}
                                    </span>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-900 text-sm">{{ video.channel }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div class="flex items-center gap-2 flex-wrap">
                            <button
                                class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                <Icon name="lucide:thumbs-up" class="w-5 h-5" />
                                <span class="text-sm font-medium">Like</span>
                            </button>
                            <button
                                class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                <Icon name="lucide:thumbs-down" class="w-5 h-5" />
                            </button>
                            <button
                                @click="shareVideo"
                                class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                <Icon name="lucide:share" class="w-5 h-5" />
                                <span class="text-sm font-medium">Share</span>
                            </button>
                            <button
                                class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                <Icon name="lucide:download" class="w-5 h-5" />
                                <span class="text-sm font-medium hidden sm:inline">Download</span>
                            </button>
                        </div>
                    </div>

                    <!-- Video Description -->
                    <div class="bg-gray-100 rounded-xl p-4 mb-6">
                        <div class="flex items-center gap-2 text-sm text-gray-700 mb-2">
                            <span class="font-medium">{{ video.views }}</span>
                            <span>•</span>
                            <span>{{ video.uploadTime }}</span>
                        </div>
                        <p class="text-gray-800 text-sm whitespace-pre-wrap">
                            {{ truncatedDescription }}
                        </p>
                        <button
                            v-if="video.description && video.description.length > 200"
                            @click="showFullDescription = !showFullDescription"
                            class="text-sm font-semibold text-gray-900 mt-2 hover:underline">
                            {{ showFullDescription ? 'Show less' : '...more' }}
                        </button>
                    </div>

                    <!-- Comments Section Placeholder -->
                    <div class="bg-white rounded-xl p-4">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
                        <p class="text-gray-500 text-sm">Comments coming soon...</p>
                    </div>
                </div>

                <!-- Right side: Related Videos -->
                <div class="w-full lg:w-[400px] xl:w-[420px] flex-shrink-0">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Related Videos</h3>
                    <div class="space-y-3">
                        <div
                            v-for="relatedVideo in relatedVideos"
                            :key="relatedVideo.id"
                            @click="watchVideo(relatedVideo.id)"
                            class="flex gap-3 cursor-pointer group">
                            <!-- Thumbnail -->
                            <div class="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    :src="relatedVideo.thumbnail"
                                    :alt="relatedVideo.title"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                <div
                                    class="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                    {{ relatedVideo.duration }}
                                </div>
                            </div>
                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <h4
                                    class="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {{ relatedVideo.title }}
                                </h4>
                                <p class="text-xs text-gray-600 mt-1">{{ relatedVideo.channel }}</p>
                                <div class="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <span>{{ relatedVideo.views }}</span>
                                    <span>•</span>
                                    <span>{{ relatedVideo.uploadTime }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Empty state -->
                        <div v-if="relatedVideos.length === 0" class="text-center py-8">
                            <Icon name="lucide:video-off" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p class="text-gray-500 text-sm">No related videos available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
