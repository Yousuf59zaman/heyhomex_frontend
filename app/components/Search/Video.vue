<script setup>
    // Reactive state
    const searchQuery = ref('Best places to live in Hawaii');
    const viewMode = ref('List View'); // 'List View' or 'Map View'
    const selectedCategory = ref('All Videos');
    const selectedDuration = ref('Any Duration');
    const selectedUploadTime = ref('Any Time');
    const selectedTopic = ref('Hawaii Living');
    const selectedSortBy = ref('Relevance');
    
    // Map related state
    const map = ref(null);
    const mapContainer = ref(null);
    const markers = ref([]);
    const hoveredVideo = ref(null);
    const showPopup = ref(false);
    const popupPosition = ref({ x: 0, y: 0 });

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
            location: 'Honolulu',
            coordinates: [21.3099, -157.8581],
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
    
    // Map related methods
    const initializeMap = async () => {
        if (process.client && !map.value) {
            // Dynamic import for client-side only
            const L = await import('leaflet');
            
            // Fix for default markers
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: '/leaflet/marker-icon-2x.png',
                iconUrl: '/leaflet/marker-icon.png',
                shadowUrl: '/leaflet/marker-shadow.png',
            });
            
            // Default coordinates for Hawaii
            const defaultCenter = [21.3099, -157.8581]; // Honolulu coordinates
            const defaultZoom = 8;
            
            map.value = L.map('video-map').setView(defaultCenter, defaultZoom);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map.value);
            
            // Add markers for all videos
            addVideoMarkers(L);
            
            // Fit map to show all markers
            setTimeout(() => fitBoundsToMarkers(), 100);
        }
    };
    
    const addVideoMarkers = (L) => {
        if (!map.value || !L) return;
        
        // Clear existing markers
        markers.value.forEach(marker => map.value.removeLayer(marker.marker));
        markers.value = [];
        
        videos.value.forEach(video => {
            const customIcon = L.divIcon({
                html: `
                    <div class="relative">
                        <div class="bg-red-500 text-white rounded-lg px-2 py-1 text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
                            <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            ${video.duration}
                        </div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-red-500"></div>
                    </div>
                `,
                className: 'custom-video-marker',
                iconSize: [60, 32],
                iconAnchor: [30, 32]
            });
            
            const marker = L.marker(video.coordinates, { icon: customIcon }).addTo(map.value);
            
            // Add event listeners
            marker.on('mouseover', (e) => onMarkerHover(video, e));
            marker.on('mouseout', () => onMarkerLeave());
            marker.on('click', () => playVideo(video.id));
            
            markers.value.push({ marker, video });
        });
    };
    
    const fitBoundsToMarkers = async () => {
        if (!map.value || markers.value.length === 0) return;
        
        const L = await import('leaflet');
        const group = new L.featureGroup(markers.value.map(({ marker }) => marker));
        map.value.fitBounds(group.getBounds().pad(0.1));
    };
    
    const onMarkerHover = (video, event) => {
        hoveredVideo.value = video;
        showPopup.value = true;
        
        // Calculate popup position
        const mapElement = document.getElementById('video-map');
        if (mapElement) {
            const rect = mapElement.getBoundingClientRect();
            popupPosition.value = {
                x: event.containerPoint.x + rect.left,
                y: event.containerPoint.y + rect.top - 10
            };
        }
    };
    
    const onMarkerLeave = () => {
        showPopup.value = false;
        hoveredVideo.value = null;
    };
    
    const onVideoCardHover = (video) => {
        const markerData = markers.value.find(m => m.video.id === video.id);
        if (markerData) {
            markerData.marker.getElement().classList.add('highlighted');
        }
    };
    
    const onVideoCardLeave = () => {
        markers.value.forEach(({ marker }) => {
            marker.getElement().classList.remove('highlighted');
        });
    };
    
    // Initialize map when component is mounted and in map view
    onMounted(() => {
        if (viewMode.value === 'Map View') {
            nextTick(() => initializeMap());
        }
    });
    
    // Watch view mode changes to initialize map
    watch(viewMode, (newMode) => {
        if (newMode === 'Map View') {
            nextTick(() => initializeMap());
        }
    });
    
    // Cleanup map on unmount
    onUnmounted(() => {
        if (map.value) {
            map.value.remove();
            map.value = null;
        }
    });
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
                        @mouseenter="onVideoCardHover(video)"
                        @mouseleave="onVideoCardLeave"
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
                    <div class="w-full h-full relative">
                        <div
                            id="video-map"
                            ref="mapContainer"
                            class="w-full h-full rounded-xl">
                        </div>
                        
                        <!-- Popup overlay for video details on map hover -->
                        <Teleport to="body">
                            <div
                                v-if="showPopup && hoveredVideo"
                                class="fixed z-[10000] pointer-events-none"
                                :style="{
                                    left: popupPosition.x + 'px',
                                    top: popupPosition.y + 'px',
                                    transform: 'translate(-50%, -100%)',
                                }">
                                <CommonCitizenVideoPopup :video="hoveredVideo" />
                            </div>
                        </Teleport>
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
    
    /* Global styles for Leaflet video markers */
    .custom-video-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .custom-video-marker.highlighted {
        transform: scale(1.1);
        z-index: 1000 !important;
    }
    
    .custom-video-marker .bg-red-500 {
        animation: pulse 2s infinite;
        transition: all 0.3s ease;
    }
    
    .custom-video-marker.highlighted .bg-red-500 {
        background-color: #059669 !important; /* emerald-600 */
        animation: none;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.8;
        }
    }
    
    /* Ensure map container has proper styling */
    #video-map {
        border-radius: 0.75rem;
    }
    
    /* Custom leaflet popup styles if needed */
    .leaflet-popup-content-wrapper {
        border-radius: 0.5rem;
    }
</style>
