<script setup>
    const router = useRouter()
    const route = useRoute()

    const props = defineProps({
        videos: {
            type: Array,
            default: () => [],
        },
    })

    // Get current section from route (kamaina, investor, military)
    const currentSection = computed(() => {
        const path = route.path
        if (path.includes('/kamaina')) return 'kamaina'
        if (path.includes('/investor')) return 'investor'
        if (path.includes('/military')) return 'military'
        return 'kamaina' // default
    })

    // Reactive state
    const searchQuery = ref("Best places to live in Hawaii")
    const viewMode = ref("List View") // 'List View' or 'Map View'
    const selectedCategory = ref("All Videos")
    const selectedDuration = ref("Any Duration")
    const selectedUploadTime = ref("Any Time")
    const selectedTopic = ref("Hawaii Living")
    const selectedSortBy = ref("Relevance")

    // Map related state
    const map = ref(null)
    const mapContainer = ref(null)
    const markers = ref([])
    const hoveredVideo = ref(null)
    const showPopup = ref(false)
    const popupPosition = ref({x: 0, y: 0})

    // Filter options for videos
    const categories = ref([
        "All Videos",
        "Real Estate",
        "Tourism",
        "Lifestyle",
    ])
    const durations = ref([
        "Any Duration",
        "Under 5 minutes",
        "5-15 minutes",
        "15+ minutes",
    ])
    const uploadTimes = ref([
        "Any Time",
        "Last Hour",
        "Today",
        "This Week",
        "This Month",
        "This Year",
    ])
    const topics = ref([
        "Hawaii Living",
        "Best Places",
        "Property Tours",
        "Local Culture",
        "Travel Guide",
    ])
    const sortByOptions = ref([
        "Relevance",
        "Upload Date",
        "View Count",
        "Rating",
        "Duration",
    ])

    const resultsFound = computed(() => props.videos.length)
    const toggleFavorite = (videoId) => {
        const video = props.videos.find((v) => v.id === videoId)
        if (video) {
            video.isFavorite = !video.isFavorite
        }
    }
    const playVideo = (videoId) => {
        const video = props.videos.find((item) => item.id === videoId)
        if (!video) {
            return
        }

        // Navigate to watch page instead of opening modal
        router.push(`/${currentSection.value}/watch/${videoId}`)
    }
    const clearSearch = () => {
        searchQuery.value = ""
    }

    const initializeMap = async () => {
        if (!process.client) return
        const mapElement = document.getElementById("video-map")
        if (!mapElement) return
        if (map.value) {
            try {
                map.value.remove()
                map.value = null
            } catch (e) {
                console.log("Error removing map:", e)
            }
        }

        const L = await import("leaflet")
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "/leaflet/marker-icon-2x.png",
            iconUrl: "/leaflet/marker-icon.png",
            shadowUrl: "/leaflet/marker-shadow.png",
        })
        const defaultCenter = [21.3099, -157.8581]
        const defaultZoom = 8

        map.value = L.map("video-map").setView(defaultCenter, defaultZoom)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map.value)

        addVideoMarkers(L)
        setTimeout(() => fitBoundsToMarkers(), 100)
    }

    const addVideoMarkers = (L) => {
        if (!map.value || !L) return
        markers.value.forEach((marker) => map.value.removeLayer(marker.marker))
        markers.value = []

        props.videos.forEach((video) => {
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
                className: "custom-video-marker",
                iconSize: [60, 32],
                iconAnchor: [30, 32],
            })

            const marker = L.marker(video.coordinates, {
                icon: customIcon,
            }).addTo(map.value)
            marker.on("mouseover", (e) => onMarkerHover(video, e))
            marker.on("mouseout", () => onMarkerLeave())
            marker.on("click", () => playVideo(video.id))

            markers.value.push({marker, video})
        })
    }

    const fitBoundsToMarkers = async () => {
        if (!map.value || markers.value.length === 0) return

        const L = await import("leaflet")
        const group = new L.featureGroup(
            markers.value.map(({marker}) => marker)
        )
        map.value.fitBounds(group.getBounds().pad(0.1))
    }

    const onMarkerHover = (video, event) => {
        hoveredVideo.value = video
        showPopup.value = true
        const mapElement = document.getElementById("video-map")
        if (mapElement) {
            const rect = mapElement.getBoundingClientRect()
            popupPosition.value = {
                x: event.containerPoint.x + rect.left,
                y: event.containerPoint.y + rect.top - 10,
            }
        }
    }

    const onMarkerLeave = () => {
        setTimeout(() => {
            if (!hoveredVideo.value?.isHoveringPopup) {
                showPopup.value = false
                hoveredVideo.value = null
            }
        }, 100)
    }

    const onPopupHover = () => {
        if (hoveredVideo.value) {
            hoveredVideo.value.isHoveringPopup = true
        }
    }

    const onPopupLeave = () => {
        if (hoveredVideo.value) {
            hoveredVideo.value.isHoveringPopup = false
        }
        showPopup.value = false
        hoveredVideo.value = null
    }

    const onVideoCardHover = (video) => {
        const markerData = markers.value.find((m) => m.video.id === video.id)
        if (markerData) {
            markerData.marker.getElement().classList.add("highlighted")
        }
    }

    const onVideoCardLeave = () => {
        markers.value.forEach(({marker}) => {
            marker.getElement().classList.remove("highlighted")
        })
    }
    watch(viewMode, async (newMode, oldMode) => {
        if (newMode === "Map View") {
            await nextTick()
            setTimeout(() => initializeMap(), 150)
        } else if (oldMode === "Map View" && map.value) {
            try {
                map.value.remove()
                map.value = null
                markers.value = []
            } catch (e) {
                console.log("Error cleaning up map:", e)
            }
        }
    })
    onUnmounted(() => {
        if (map.value) {
            map.value.remove()
            map.value = null
        }
    })
</script>

<template>
    <div class="space-y-4 lg:space-y-6">
        <div class="bg-white rounded-lg p-3 lg:p-4">
            <div class="flex flex-col lg:flex-row gap-3">
                <div
                    class="flex flex-wrap lg:flex-nowrap items-center gap-2 flex-1">
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
                <div class="flex items-center gap-2 lg:min-w-[350px]">
                    <div class="relative flex-1">
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search videos about Hawaii..."
                        class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <button
                        v-if="searchQuery"
                        @click="clearSearch"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <Icon
                            name="lucide:x"
                            class="w-4 h-4" />
                    </button>
                </div>
                <!-- Save Search button -->
                <button
                        class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                    Save Search
                </button>
                </div>
            </div>
        </div>
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
            <div class="lg:col-span-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        v-for="video in videos"
                        :key="video.id"
                        class="video-card flex flex-col"
                        @mouseenter="onVideoCardHover(video)"
                        @mouseleave="onVideoCardLeave">
                        <!-- Thumbnail -->
                        <div class="relative h-[200px] rounded-[10px] overflow-hidden cursor-pointer group" @click="playVideo(video.id)">
                            <img
                                :src="video.thumbnail"
                                :alt="video.title"
                                class="w-full h-full object-cover" />
                            <div
                                class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div
                                    class="bg-red-600 group-hover:bg-red-700 flex items-center justify-center rounded-full w-10 h-10 transition-colors">
                                    <Icon
                                        name="lucide:play"
                                        class="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div
                                class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                {{ video.duration }}
                            </div>
                            <button
                                @click.stop="toggleFavorite(video.id)"
                                class="absolute top-2 left-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors">
                                <Icon
                                    name="lucide:heart"
                                    :class="[
                                        'w-5 h-5',
                                        video.isFavorite ? 'text-[#2C3E50] fill-current' : 'text-[#2C3E50] fill-none',
                                    ]" />
                            </button>
                        </div>

                        <!-- Video Details -->
                        <div class="flex gap-1 items-start mt-4">
                            <div class="flex-1 flex gap-4 items-start">
                                <!-- Channel Avatar -->
                                <div class="bg-[#283849] rounded-[10px] w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    <p class="text-white text-sm font-semibold text-center leading-[16px]">
                                        Hello
                                    </p>
                                </div>
                                
                                <!-- Title and Metadata -->
                                <div class="flex-1 flex flex-col gap-1">
                                    <h3
                                        class="text-[#283849] text-base font-semibold leading-[1.5] line-clamp-2 cursor-pointer hover:text-[#121a22]"
                                        @click="playVideo(video.id)">
                                        {{ video.title }}
                                    </h3>
                                    <div
                                        class="flex items-center text-xs text-[#283849] gap-1.5">
                                        <span>{{ video.channel }}</span>
                                        <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                        <span>{{ video.views }}</span>
                                        <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                        <span>{{ video.uploadTime }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- More Options Button -->
                            <button
                                class="w-5 h-5 flex items-center justify-center flex-shrink-0"
                                @click.stop>
                                <Icon
                                    name="lucide:more-vertical"
                                    class="w-5 h-5 text-[#283849]" />
                            </button>
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
                            class="w-full h-full rounded-xl"></div>

                        <!-- Popup overlay for video details on map hover -->
                        <Teleport to="body">
                            <div
                                v-if="showPopup && hoveredVideo"
                                class="fixed z-[10000]"
                                :style="{
                                    left: popupPosition.x + 'px',
                                    top: popupPosition.y + 'px',
                                    transform: 'translate(-50%, -100%)',
                                }"
                                @mouseenter="onPopupHover"
                                @mouseleave="onPopupLeave">
                                <CommonCitizenVideoPopup
                                    :video="hoveredVideo" />
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
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-4">
                <div
                    v-for="video in videos"
                    :key="video.id"
                    class="video-card flex flex-col">
                    <!-- Thumbnail -->
                    <div class="relative h-[200px] rounded-[10px] overflow-hidden cursor-pointer group" @click="playVideo(video.id)">
                        <img
                            :src="video.thumbnail"
                            :alt="video.title"
                            class="w-full h-full object-cover" />

                        <div
                            class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div
                                class="bg-red-600 group-hover:bg-red-700 flex items-center justify-center rounded-full w-10 h-10 transition-colors">
                                <Icon
                                    name="lucide:play"
                                    class="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <div
                            class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                            {{ video.duration }}
                        </div>
                        <button
                            @click.stop="toggleFavorite(video.id)"
                            class="absolute top-2 left-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors">
                            <Icon
                                name="lucide:heart"
                                :class="[
                                    'w-5 h-5',
                                    video.isFavorite ? 'text-[#2C3E50] fill-current' : 'text-[#2C3E50] fill-none',
                                ]" />
                        </button>
                    </div>

                    <!-- Video Details -->
                    <div class="flex gap-1 items-start mt-4">
                        <div class="flex-1 flex gap-4 items-start">
                            <!-- Channel Avatar -->
                            <div class="bg-[#283849] rounded-[10px] w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                <p class="text-white text-sm font-semibold text-center leading-[16px]">
                                    Hello
                                </p>
                            </div>
                            
                            <!-- Title and Metadata -->
                            <div class="flex-1 flex flex-col gap-1">
                                <h3
                                    class="text-[#283849] text-base font-semibold leading-[1.5] line-clamp-2 cursor-pointer hover:text-[#121a22]"
                                    @click="playVideo(video.id)">
                                    {{ video.title }}
                                </h3>
                                <div
                                    class="flex items-center text-xs text-[#283849] gap-1.5">
                                    <span>{{ video.channel }}</span>
                                    <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                    <span>{{ video.views }}</span>
                                    <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                    <span>{{ video.uploadTime }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- More Options Button -->
                        <button
                            class="w-5 h-5 flex items-center justify-center flex-shrink-0"
                            @click.stop>
                            <Icon
                                name="lucide:more-vertical"
                                class="w-5 h-5 text-[#283849]" />
                        </button>
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

    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }

    .video-card {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
        background-color: #059669 !important;
        /* emerald-600 */
        animation: none;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }

        50% {
            opacity: 0.8;
        }
    }

    #video-map {
        border-radius: 0.75rem;
    }

    .leaflet-popup-content-wrapper {
        border-radius: 0.5rem;
    }
</style>
