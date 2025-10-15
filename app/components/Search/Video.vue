<script setup>
    // Reactive state
    const searchQuery = ref('Best places to live in Hawaii');
    const viewMode = ref('List View'); // 'List View' or 'Map View'
    const selectedCategory = ref('All Videos');
    const selectedDuration = ref('Any Duration');
    const selectedUploadTime = ref('Any Time');
    const selectedTopic = ref('Hawaii Living');
    const selectedSortBy = ref('Relevance');

    // Filter options for videos
    const categories = ref([
        'All Videos',
        'Real Estate',
        'Tourism',
        'Lifestyle',
    ]);
    const durations = ref([
        'Any Duration',
        'Under 5 minutes',
        '5-15 minutes',
        '15+ minutes',
    ]);
    const uploadTimes = ref([
        'Any Time',
        'Last Hour',
        'Today',
        'This Week',
        'This Month',
        'This Year',
    ]);
    const topics = ref([
        'Hawaii Living',
        'Best Places',
        'Property Tours',
        'Local Culture',
        'Travel Guide',
    ]);
    const sortByOptions = ref([
        'Relevance',
        'Upload Date',
        'View Count',
        'Rating',
        'Duration',
    ]);

    // Mock video data
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
        },
    ]);

    const resultsFound = computed(() => videos.value.length);

    // Methods
    const toggleFavorite = (videoId) => {
        const video = videos.value.find((v) => v.id === videoId);
        if (video) {
            video.isFavorite = !video.isFavorite;
        }
    };

    const handleSearch = () => {
        console.log('Searching for:', searchQuery.value);
    };

    const saveSearch = () => {
        console.log('Saving search...');
    };

    const playVideo = (videoId) => {
        console.log('Playing video:', videoId);
    };

    const clearSearch = () => {
        searchQuery.value = '';
    };
</script>

<template>
    <div class="space-y-4 lg:space-y-6">
        <!-- Filters and Search Section -->
        <div class="bg-white rounded-lg p-3 lg:p-4">
            <div class="flex flex-col lg:flex-row gap-3">
                <!-- Filters Row -->
                <div
                    class="flex flex-wrap lg:flex-nowrap items-center gap-2 flex-1">
                    <!-- Category Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedCategory"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option
                                v-for="category in categories"
                                :key="category"
                                :value="category">
                                {{ category }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Duration Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedDuration"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option
                                v-for="duration in durations"
                                :key="duration"
                                :value="duration">
                                {{ duration }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Upload Time Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedUploadTime"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option
                                v-for="time in uploadTimes"
                                :key="time"
                                :value="time">
                                {{ time }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Topic Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[140px]">
                        <select
                            v-model="selectedTopic"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option
                                v-for="topic in topics"
                                :key="topic"
                                :value="topic">
                                {{ topic }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <!-- Sort By Filter -->
                    <div class="relative w-full sm:w-auto sm:min-w-[120px]">
                        <select
                            v-model="selectedSortBy"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8">
                            <option
                                v-for="option in sortByOptions"
                                :key="option"
                                :value="option">
                                {{ option }}
                            </option>
                        </select>
                        <Icon
                            name="lucide:chevron-down"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="flex items-center gap-2 lg:min-w-[350px]">
                    <div class="relative flex-1">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search videos about Hawaii..."
                            class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            @keyup.enter="handleSearch" />
                        <button
                            v-if="searchQuery"
                            @click="clearSearch"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Icon
                                name="lucide:x"
                                class="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        @click="saveSearch"
                        class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                        Save Search
                    </button>
                </div>
            </div>
        </div>

        <!-- Results Header -->
        <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-lg p-4 lg:p-6">
            <div class="flex items-center gap-4">
                <h2 class="text-lg lg:text-xl font-semibold text-gray-900">
                    {{ searchQuery }}
                </h2>
            </div>

            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                    {{ resultsFound }} Results Found
                </span>

                <div class="flex items-center gap-2">
                    <button
                        :class="[
                            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                            viewMode === 'List View'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900',
                        ]"
                        @click="viewMode = 'List View'">
                        List View
                    </button>

                    <button
                        :class="[
                            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                            viewMode === 'Map View'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900',
                        ]"
                        @click="viewMode = 'Map View'">
                        Map View
                    </button>
                </div>
            </div>
        </div>

        <!-- Map View: 2-column grid + Map -->
        <div
            v-if="viewMode === 'Map View'"
            class="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
            <!-- Video Listings Grid -->
            <div class="lg:col-span-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div
                        v-for="video in videos"
                        :key="video.id"
                        class="video-card bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100"
                        @click="playVideo(video.id)">
                        <!-- Video Thumbnail -->
                        <div class="relative h-48 lg:h-52">
                            <img
                                :src="video.thumbnail"
                                :alt="video.title"
                                class="w-full h-full object-cover" />

                            <!-- Play Button -->
                            <div
                                class="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                                <div
                                    class="bg-red-600 hover:bg-red-700 rounded-full p-3 transition-colors">
                                    <Icon
                                        name="lucide:play"
                                        class="w-6 h-6 text-white ml-1" />
                                </div>
                            </div>

                            <!-- Duration Badge -->
                            <div
                                class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                {{ video.duration }}
                            </div>

                            <!-- Favorite Button -->
                            <button
                                @click.stop="toggleFavorite(video.id)"
                                class="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm">
                                <Icon
                                    name="lucide:heart"
                                    :class="[
                                        'w-4 h-4 transition-colors',
                                        video.isFavorite
                                            ? 'text-red-500 fill-current'
                                            : 'text-gray-600',
                                    ]" />
                            </button>
                        </div>

                        <!-- Video Details -->
                        <div class="p-4 lg:p-5">
                            <div class="mb-3">
                                <h3
                                    class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                                    {{ video.title }}
                                </h3>
                                <p class="text-sm text-gray-600 mb-1">
                                    {{ video.channel }}
                                </p>
                                <div
                                    class="flex items-center text-xs text-gray-500 gap-2">
                                    <span>{{ video.views }}</span>
                                    <span>•</span>
                                    <span>{{ video.uploadTime }}</span>
                                </div>
                            </div>

                            <!-- Video Category Badge -->
                            <div class="mt-2">
                                <span
                                    class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {{ video.category }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Map Section -->
            <div class="lg:col-span-4">
                <div
                    class="bg-white rounded-xl overflow-hidden h-96 lg:h-[600px] lg:sticky lg:top-6">
                    <div class="w-full h-full bg-gray-100 relative">
                        <div
                            class="relative w-full h-full bg-gradient-to-br from-green-50 via-blue-50 to-green-100 overflow-hidden">
                            <!-- Map Grid Background -->
                            <div class="absolute inset-0 opacity-10">
                                <div
                                    class="grid grid-cols-12 grid-rows-12 w-full h-full">
                                    <div
                                        v-for="n in 144"
                                        :key="n"
                                        class="border border-gray-300/50"></div>
                                </div>
                            </div>

                            <!-- Highway Lines -->
                            <svg
                                class="absolute inset-0 w-full h-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none">
                                <!-- Horizontal highways -->
                                <line
                                    x1="0"
                                    y1="25"
                                    x2="100"
                                    y2="25"
                                    stroke="#e5e7eb"
                                    stroke-width="0.5"
                                    opacity="0.6" />
                                <line
                                    x1="0"
                                    y1="45"
                                    x2="100"
                                    y2="45"
                                    stroke="#e5e7eb"
                                    stroke-width="0.3"
                                    opacity="0.4" />
                                <line
                                    x1="0"
                                    y1="65"
                                    x2="100"
                                    y2="65"
                                    stroke="#e5e7eb"
                                    stroke-width="0.5"
                                    opacity="0.6" />

                                <!-- Vertical highways -->
                                <line
                                    x1="30"
                                    y1="0"
                                    x2="30"
                                    y2="100"
                                    stroke="#e5e7eb"
                                    stroke-width="0.4"
                                    opacity="0.5" />
                                <line
                                    x1="60"
                                    y1="0"
                                    x2="60"
                                    y2="100"
                                    stroke="#e5e7eb"
                                    stroke-width="0.3"
                                    opacity="0.4" />
                                <line
                                    x1="80"
                                    y1="0"
                                    x2="80"
                                    y2="100"
                                    stroke="#e5e7eb"
                                    stroke-width="0.4"
                                    opacity="0.5" />
                            </svg>

                            <!-- Video Location Markers -->
                            <div
                                class="absolute top-[20%] left-[25%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="video-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    <Icon
                                        name="lucide:play-circle"
                                        class="w-4 h-4 inline mr-1" />
                                    4
                                </div>
                            </div>

                            <div
                                class="absolute top-[35%] left-[45%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="video-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    <Icon
                                        name="lucide:play-circle"
                                        class="w-4 h-4 inline mr-1" />
                                    7
                                </div>
                            </div>

                            <div
                                class="absolute top-[55%] left-[65%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="video-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    <Icon
                                        name="lucide:play-circle"
                                        class="w-4 h-4 inline mr-1" />
                                    3
                                </div>
                            </div>

                            <div
                                class="absolute top-[70%] left-[35%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="video-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    <Icon
                                        name="lucide:play-circle"
                                        class="w-4 h-4 inline mr-1" />
                                    5
                                </div>
                            </div>

                            <div
                                class="absolute top-[40%] left-[75%] transform -translate-x-1/2 -translate-y-1/2">
                                <div
                                    class="video-marker bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                                    <Icon
                                        name="lucide:play-circle"
                                        class="w-4 h-4 inline mr-1" />
                                    2
                                </div>
                            </div>

                            <!-- Location Labels -->
                            <div
                                class="absolute top-4 left-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Honolulu
                            </div>

                            <div
                                class="absolute top-6 right-8 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Maui
                            </div>

                            <div
                                class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Kauai
                            </div>

                            <div
                                class="absolute bottom-8 left-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Hilo
                            </div>

                            <div
                                class="absolute top-1/2 right-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm">
                                Big Island
                            </div>

                            <!-- Map Controls -->
                            <div class="absolute bottom-4 right-4">
                                <div
                                    class="bg-white rounded-lg shadow-md p-2 flex flex-col gap-2">
                                    <button
                                        class="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <Icon
                                            name="lucide:plus"
                                            class="w-4 h-4 text-gray-600" />
                                    </button>
                                    <div class="w-full h-px bg-gray-200"></div>
                                    <button
                                        class="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <Icon
                                            name="lucide:minus"
                                            class="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- List View: Full-width video grid -->
        <div
            v-else
            class="space-y-6">
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                <div
                    v-for="video in videos"
                    :key="video.id"
                    class="video-card bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100"
                    @click="playVideo(video.id)">
                    <!-- Video Thumbnail -->
                    <div class="relative h-48 lg:h-52">
                        <img
                            :src="video.thumbnail"
                            :alt="video.title"
                            class="w-full h-full object-cover" />

                        <!-- Play Button -->
                        <div
                            class="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                            <div
                                class="bg-red-600 hover:bg-red-700 rounded-full p-3 transition-colors">
                                <Icon
                                    name="lucide:play"
                                    class="w-6 h-6 text-white ml-1" />
                            </div>
                        </div>

                        <!-- Duration Badge -->
                        <div
                            class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                            {{ video.duration }}
                        </div>

                        <!-- Favorite Button -->
                        <button
                            @click.stop="toggleFavorite(video.id)"
                            class="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm">
                            <Icon
                                name="lucide:heart"
                                :class="[
                                    'w-4 h-4 transition-colors',
                                    video.isFavorite
                                        ? 'text-red-500 fill-current'
                                        : 'text-gray-600',
                                ]" />
                        </button>
                    </div>

                    <!-- Video Details -->
                    <div class="p-4 lg:p-5">
                        <div class="mb-3">
                            <h3
                                class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                                {{ video.title }}
                            </h3>
                            <p class="text-sm text-gray-600 mb-1">
                                {{ video.channel }}
                            </p>
                            <div
                                class="flex items-center text-xs text-gray-500 gap-2">
                                <span>{{ video.views }}</span>
                                <span>•</span>
                                <span>{{ video.uploadTime }}</span>
                            </div>
                        </div>

                        <!-- Video Category Badge -->
                        <div class="mt-2">
                            <span
                                class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {{ video.category }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    select {
        background-image: none;
    }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .video-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .video-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    @keyframes markerPulse {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
        }
        70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
        }
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }
    }

    .video-marker {
        animation: markerPulse 2s infinite;
    }
</style>
