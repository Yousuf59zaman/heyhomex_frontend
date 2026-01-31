<script setup>
const router = useRouter()
const route = useRoute()
const toast = useToast()

const props = defineProps({
    videos: {
        type: Array,
        default: () => [],
    },
    filtersVariant: {
        type: String,
        default: "figma",
    },
})

const emit = defineEmits(['favoriteToggle', 'search'])


const currentSection = computed(() => {
    const path = route.path
    if (path.includes('/kamaina')) return 'kamaina'
    if (path.includes('/investor')) return 'investor'
    if (path.includes('/military')) return 'military'
    return 'kamaina' 
})


const searchQuery = ref(route.query.q || "")
const viewMode = ref(route.query.view === "map" ? "Map View" : "List View")
const selectedCategory = ref(route.query.category || "")
const selectedPriceRange = ref(route.query.priceRange || "")
const selectedHomeType = ref(route.query.homeType || "")
const selectedOthers = ref(route.query.others || "More")
const selectedBedsAndBaths = ref(route.query.bedsAndBaths || "")
const searchPlaceholder = "123 Aloha Lane, Honolulu, HI 96818"
const displayQuery = computed(() => searchQuery.value || searchPlaceholder)


const map = ref(null)
const mapContainer = ref(null)
const markers = ref([])
const hoveredVideo = ref(null)
const showPopup = ref(false)
const popupPosition = ref({ x: 0, y: 0 })
const zoomHintVisible = ref(true)
let zoomHintTimeout = null

const resultsFound = computed(() => props.videos.length)

const toggleFavorite = async (videoId) => {
    const video = props.videos.find((v) => v.id === videoId)
    if (!video) return

    const previousState = video.isFavorite
    video.isFavorite = !video.isFavorite

    try {
        const response = await $fetchCitizen(`/v1/favorite-videos/${videoId}/toggle`, {
            method: "POST",
        })

        if (response.status === "success") {
            video.isFavorite = response.data.is_favorite

            toast.add({
                severity: response.data.is_favorite ? 'success' : 'info',
                summary: response.data.is_favorite ? 'Added to Favorites' : 'Removed from Favorites',
                detail: response.data.is_favorite
                    ? 'Video has been added to your favorite list'
                    : 'Video has been removed from your favorite list',
                life: 3000
            })

            emit('favoriteToggle', { videoId, isFavorite: response.data.is_favorite })
        } else {
            video.isFavorite = previousState
        }
    } catch (e) {
        console.error("Error toggling favorite:", e.message)
        video.isFavorite = previousState
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update favorite status',
            life: 3000
        })
    }
}
const playVideo = (videoId) => {
    const video = props.videos.find((item) => item.id === videoId)
    if (!video) {
        return
    }

  
    router.push(`/${currentSection.value}/watch/${videoId}`)
}
const handleSearch = () => {
    // Emit search event with the current search query
    emit('search', searchQuery.value)
}

const clearSearch = () => {
    if (!searchQuery.value) return
    searchQuery.value = ""
    handleSearch()
}

const handleFilterChange = (filters) => {
    console.log("Filters changed:", filters)
}

const showZoomHint = () => {
    zoomHintVisible.value = true
    if (zoomHintTimeout) {
        clearTimeout(zoomHintTimeout)
    }
    zoomHintTimeout = setTimeout(() => {
        zoomHintVisible.value = false
        zoomHintTimeout = null
    }, 2500)
}

const hideZoomHint = () => {
    zoomHintVisible.value = false
    if (zoomHintTimeout) {
        clearTimeout(zoomHintTimeout)
        zoomHintTimeout = null
    }
}

const handleMapWheel = (event) => {
    if (!map.value) return
    const zoomModifier = event.ctrlKey || event.metaKey
    if (zoomModifier) {
        event.preventDefault()
        hideZoomHint()
        const wheelPoint = map.value.mouseEventToLatLng(event)
        const zoomDelta = map.value.options.zoomDelta || 1
        const zoomChange = event.deltaY < 0 ? zoomDelta : -zoomDelta
        const targetZoom = map.value.getZoom() + zoomChange
        map.value.setZoomAround(wheelPoint, targetZoom)
    } else {
        showZoomHint()
    }
}

const attachMapWheelListener = () => {
    const mapElement = document.getElementById("video-map")
    mapElement && mapElement.removeEventListener("wheel", handleMapWheel, {
        capture: true,
    })
    if (mapElement) {
        mapElement.addEventListener("wheel", handleMapWheel, {
            passive: false,
            capture: true,
        })
    }
}

const detachMapWheelListener = () => {
    const mapElement = document.getElementById("video-map")
    if (mapElement) {
        mapElement.removeEventListener("wheel", handleMapWheel, {
            capture: true,
        })
    }
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

    map.value.scrollWheelZoom.disable()
    detachMapWheelListener()
    attachMapWheelListener()

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

        markers.value.push({ marker, video })
    })
}

const fitBoundsToMarkers = async () => {
    if (!map.value || markers.value.length === 0) return

    const L = await import("leaflet")
    const group = new L.featureGroup(
        markers.value.map(({ marker }) => marker)
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
    markers.value.forEach(({ marker }) => {
        marker.getElement().classList.remove("highlighted")
    })
}

const refreshMapBounds = async () => {
    if (viewMode.value !== "Map View" || !map.value) return
    await nextTick()
    map.value?.invalidateSize()
    setTimeout(() => fitBoundsToMarkers(), 100)
}

watch(
    () => route.query,
    (newQuery) => {
        if (newQuery.q !== undefined) {
            searchQuery.value = newQuery.q
        }
        if (newQuery.view) {
            viewMode.value =
                newQuery.view === "map" ? "Map View" : "List View"
        }
        if (newQuery.category) {
            selectedCategory.value = newQuery.category
        }
        if (newQuery.priceRange) {
            selectedPriceRange.value = newQuery.priceRange
        }
        if (newQuery.homeType) {
            selectedHomeType.value = newQuery.homeType
        }
        if (newQuery.others) {
            selectedOthers.value = newQuery.others
        }
        if (newQuery.bedsAndBaths) {
            selectedBedsAndBaths.value = newQuery.bedsAndBaths
        }
    }
)

watch(viewMode, async (newMode, oldMode) => {
    if (newMode === "Map View") {
        showZoomHint()
        await nextTick()
        setTimeout(() => initializeMap(), 150)
    } else if (oldMode === "Map View" && map.value) {
        hideZoomHint()
        detachMapWheelListener()
        try {
            map.value.remove()
            map.value = null
            markers.value = []
        } catch (e) {
            console.log("Error cleaning up map:", e)
        }
    }
})

watch(
    () => route.query.page,
    async () => {
        await refreshMapBounds()
    }
)

watch(
    () => route.query.videoPage,
    async () => {
        await refreshMapBounds()
    }
)

watch(
    () => props.videos,
    async () => {
        if (viewMode.value !== "Map View" || !map.value) return
        const L = await import("leaflet")
        addVideoMarkers(L)
        setTimeout(() => fitBoundsToMarkers(), 100)
    }
)
onUnmounted(() => {
    detachMapWheelListener()
    if (map.value) {
        map.value.remove()
        map.value = null
    }
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Row 1: Tabs (left) + Search bar & Save Search (right) -->
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="w-full lg:w-auto">
                <slot name="tabs" />
            </div>
            <div class="flex flex-col sm:flex-row items-stretch gap-3 lg:gap-6 w-full lg:w-auto">
                <div class="flex items-center gap-2 w-full">
                    <div class="relative flex-1 lg:flex-none lg:w-[440px]">
                        <Icon name="lucide:search"
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6C6C6C]" />
                        <input v-model="searchQuery" type="text" :placeholder="searchPlaceholder"
                            class="w-full h-[44px] pl-10 pr-9 text-[14px] leading-[20px] text-[#121A22] bg-white border border-[#D9D9D9] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20 focus:border-[#2C3E50]/30"
                            @keyup.enter="handleSearch" />
                        <button v-if="searchQuery" @click="clearSearch"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6C6C] hover:text-[#283849]">
                            <Icon name="lucide:x" class="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    <button type="button"
                        class="md:hidden w-[44px] h-[44px] border border-[#D4D4D4] rounded-[8px] bg-white flex items-center justify-center text-[#121A22]">
                        <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
                    </button>
                </div>
                <button @click="handleSearch"
                    class="w-full sm:w-auto h-[44px] px-4 bg-[#18222C] text-white rounded-[8px] text-[14px] leading-[20px] font-semibold hover:bg-[#1f2b36] transition-colors whitespace-nowrap">
                    Search
                </button>
            </div>
        </div>

       
        <CommonCitizenSearchAdvancedFilterSection v-model:category="selectedCategory"
            v-model:price-range="selectedPriceRange" v-model:home-type="selectedHomeType"
            v-model:others="selectedOthers" v-model:beds-and-baths="selectedBedsAndBaths"
            :variant="props.filtersVariant" :hide-search="true" @filter-change="handleFilterChange" />

       
        <div class="bg-white rounded-[12px] p-3 sm:p-4 flex flex-col gap-4">
            <div class="relative z-1 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="flex flex-col gap-3 flex-1">
                    <h2
                        class="text-[20px] lg:text-[24px] leading-[28px] lg:leading-[32px] font-semibold text-[#121A22]">
                        {{ displayQuery }}
                    </h2>
                    <span class="text-[14px] leading-[20px] text-[#283849]">
                        {{ resultsFound }} Results Found
                    </span>
                </div>

                <div class="bg-[#F0F1F3] rounded-[8px] p-[6px] flex items-center gap-1 w-full md:w-auto md:self-start">
                    <button :class="[
                        'flex-1 sm:flex-none px-5 py-1.5 text-[14px] leading-[20px] font-medium rounded-[8px] transition-colors text-center',
                        viewMode === 'List View'
                            ? 'bg-[#18222C] text-white border border-[#121A22]'
                            : 'text-[#121A22]',
                    ]" @click="viewMode = 'List View'">
                        List View
                    </button>

                    <button :class="[
                        'flex-1 sm:flex-none px-5 py-1.5 text-[14px] leading-[20px] font-medium rounded-[8px] transition-colors text-center',
                        viewMode === 'Map View'
                            ? 'bg-[#18222C] text-white border border-[#121A22]'
                            : 'text-[#121A22]',
                    ]" @click="viewMode = 'Map View'">
                        Map View
                    </button>
                </div>
            </div>

            <!-- Map View: Full-width map on top + cards below  -->
            <div v-if="viewMode === 'Map View'" class="flex flex-col gap-4">
                <div class="w-full">
                    <div class="relative z-0 bg-white rounded-xl overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px]">
                        <div class="w-full h-full relative">
                            <div id="video-map" ref="mapContainer" class="w-full h-full rounded-xl relative">
                                <div v-if="zoomHintVisible"
                                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max bg-[rgba(24,34,44,0.85)] text-white text-[26px] px-4 py-1.5 rounded-full pointer-events-none tracking-[0.02em] shadow-[0_6px_18px_rgba(0,0,0,0.3)] z-[9999]">
                                    use ctrl + scroll to zoom the map
                                </div>
                            </div>

                            <Teleport to="body">
                                <div v-if="showPopup && hoveredVideo" class="fixed z-[10000]" :style="{
                                    left: popupPosition.x + 'px',
                                    top: popupPosition.y + 'px',
                                    transform: 'translate(-50%, -100%)',
                                }" @mouseenter="onPopupHover" @mouseleave="onPopupLeave">
                                    <CommonCitizenVideoPopup :video="hoveredVideo" />
                                </div>
                            </Teleport>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="video in videos" :key="video.id" class="video-card flex flex-col"
                        @mouseenter="onVideoCardHover(video)" @mouseleave="onVideoCardLeave">
                        <div class="relative h-[200px] rounded-[10px] overflow-hidden cursor-pointer group"
                            @click="playVideo(video.id)">
                            <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" />
                            <div
                                class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div
                                    class="bg-red-600 group-hover:bg-red-700 flex items-center justify-center rounded-full w-10 h-10 transition-colors">
                                    <Icon name="lucide:play" class="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                {{ video.duration }}
                            </div>
                            <button @click.stop="toggleFavorite(video.id)"
                                class="absolute top-2 right-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors">
                                <Icon :name="video.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'"
                                    class="w-5 h-5 text-[#283849]" />
                            </button>
                        </div>

                        <div class="flex gap-1 items-start mt-4">
                            <div class="flex-1 flex gap-4 items-start">
                                <div
                                    class="bg-[#283849] rounded-[10px] w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    <p class="text-white text-sm font-semibold text-center leading-[16px]">Hello</p>
                                </div>
                                <div class="flex-1 flex flex-col gap-1">
                                    <h3 class="font-['sf-pro-Medium'] text-[#283849] text-[16px] leading-[24px] font-[590] line-clamp-2 cursor-pointer hover:text-[#121a22]"
                                        @click="playVideo(video.id)">
                                        {{ video.title }}
                                    </h3>
                                    <div
                                        class="flex items-center gap-1.5 font-['sf-pro-Medium'] text-[12px] leading-[18px] font-normal text-[#283849]">
                                        <span>{{ video.channel }}</span>
                                        <!-- <div class="bg-[#d4d4d4] h-3 w-px"></div> -->
                                        <!-- <span>{{ video.views }}</span> -->
                                        <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                        <span>{{ video.uploadTime }}</span>
                                    </div>
                                </div>
                            </div>
                            <button class="w-5 h-5 flex items-center justify-center flex-shrink-0" @click.stop>
                                <Icon name="lucide:more-vertical" class="w-5 h-5 text-[#283849]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- List View: Full-width video grid -->
            <div v-else class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                    <div v-for="video in videos" :key="video.id" class="video-card flex flex-col">
                        <!-- Thumbnail -->
                        <div class="relative h-[200px] rounded-[10px] overflow-hidden cursor-pointer group"
                            @click="playVideo(video.id)">
                            <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" />

                            <div
                                class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div
                                    class="bg-red-600 group-hover:bg-red-700 flex items-center justify-center rounded-full w-10 h-10 transition-colors">
                                    <Icon name="lucide:play" class="w-5 h-5 text-white" />
                                </div>
                            </div>

                            <div class="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                {{ video.duration }}
                            </div>
                            <button @click.stop="toggleFavorite(video.id)"
                                class="absolute top-2 right-2 flex items-center justify-center p-2 rounded-[8px] bg-white/90 backdrop-blur-[2px] shadow-sm transition-colors">
                                <Icon :name="video.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'"
                                    class="w-5 h-5 text-[#283849]" />
                            </button>
                        </div>

                        <!-- Video Details -->
                        <div class="flex gap-1 items-start mt-4">
                            <div class="flex-1 flex gap-4 items-start">
                                <!-- Channel Avatar -->
                                <div
                                    class="bg-[#283849] rounded-[10px] w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    <p class="text-white text-sm font-semibold text-center leading-[16px]">
                                        Hello
                                    </p>
                                </div>

                                <!-- Title and Metadata -->
                                <div class="flex-1 flex flex-col gap-1">
                                    <h3 class="font-['sf-pro-Medium'] text-[#283849] text-[16px] leading-[24px] font-[590] line-clamp-2 cursor-pointer hover:text-[#121a22]"
                                        @click="playVideo(video.id)">
                                        {{ video.title }}
                                    </h3>
                                    <div
                                        class="flex items-center gap-1.5 font-['sf-pro-Medium'] text-[12px] leading-[18px] font-normal text-[#283849]">
                                        <span>{{ video.channel }}</span>
                                        <!-- <div class="bg-[#d4d4d4] h-3 w-px"></div> -->
                                        <!-- <span>{{ video.views }}</span> -->
                                        <div class="bg-[#d4d4d4] h-3 w-px"></div>
                                        <span>{{ video.uploadTime }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- More Options Button -->
                            <button class="w-5 h-5 flex items-center justify-center flex-shrink-0" @click.stop>
                                <Icon name="lucide:more-vertical" class="w-5 h-5 text-[#283849]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Toast position="top-right" />
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
