<script setup>

const props = defineProps({
    segment: {
        type: String,
        default: "kamaina",
        validator: (value) =>
            ["military", "investor", "kamaina"].includes(value),
    },
    filtersVariant: {
        type: String,
        default: "default",
    },
})


const route = useRoute()
const toast = useToast()


const searchQuery = ref(
    route.query.q || ""
)
const viewMode = ref(route.query.view === "map" ? "Map View" : "List View")
const selectedCategory = ref(route.query.category || "")
const selectedPriceRange = ref(route.query.priceRange || "")
const selectedHomeType = ref(route.query.homeType || "")
const selectedOthers = ref(route.query.others || "More")
const selectedBedsAndBaths = ref(route.query.bedsAndBaths || "")


const map = ref(null)
const mapContainer = ref(null)
const markers = ref([])
const hoveredProperty = ref(null)
const popupPosition = ref({ x: 0, y: 0 })
const showPopup = ref(false)
const zoomHintVisible = ref(true)


const properties = ref([])
const pending = ref(false)
const error = ref(null)
const paginationConfig = ref({
    data: {},
    lang: "en",
    align: "center",
    action: "",
})

let zoomHintTimeout = null


const loadData = async () => {
    pending.value = true
    error.value = null
    try {
        const params = {
            page: route.query.page ? route.query.page : 1,
        }

        // Only add filter params if they have values
        if (selectedCategory.value) {
            params.category = selectedCategory.value
        }
        if (selectedPriceRange.value) {
            params.price_range = selectedPriceRange.value
        }
        if (selectedHomeType.value) {
            params.home_type = selectedHomeType.value
        }
        if (searchQuery.value) {
            params.search = searchQuery.value
        }

        const response = await $fetchCitizen("/v1/property", {
            method: "GET",
            params,
        })


        properties.value = response.data.data.map((property) => ({
            id: property.id,
            title: property.name,
            address: property.address,
            price: property.price,
            beds: property.beds,
            baths: property.baths,
            sqft: property.square_feet,
            image: property.image_url,
            isFavorited: property.is_favorite || false,
            coordinates: property.location
                ? [
                    parseFloat(property.location.latitude),
                    parseFloat(property.location.longitude),
                ]
                : null,
        }))
        paginationConfig.value.data = response.data.meta
    } catch (e) {
        console.log("Error loading properties:", e.message)
        error.value = e
        properties.value = []
    } finally {
        pending.value = false
    }
}


const propertiesWithCoordinates = computed(() => {
    return properties.value.filter(
        (property) => property.coordinates !== null
    )
})

const resultsFound = computed(() => properties.value.length)
const searchPlaceholder = "123 Aloha Lane, Honolulu, HI 96818"
const displayQuery = computed(() => searchQuery.value || searchPlaceholder)


const toggleFavorite = async (property) => {
    const prop = properties.value.find((p) => p.id === property.id)
    if (!prop) return

    const previousState = prop.isFavorited
    prop.isFavorited = !prop.isFavorited

    try {
        const response = await $fetchCitizen(`/v1/favorite-properties/${property.id}/toggle`, {
            method: "POST",
        })

        if (response.status === "success") {
            prop.isFavorited = response.data.is_favorite
            toast.add({
                severity: response.data.is_favorite ? "success" : "info",
                summary: response.data.is_favorite ? "Added to Favorites" : "Removed from Favorites",
                detail: response.data.is_favorite
                    ? "Property has been added to your favorite list"
                    : "Property has been removed from your favorite list",
                life: 3000,
            })
        } else {
            prop.isFavorited = previousState
        }
    } catch (e) {
        console.error("Error toggling favorite:", e.message)
        prop.isFavorited = previousState
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update favorite status",
            life: 3000,
        })
    }
}

const handlePropertyClick = (property) => {
    const segment = props.segment || route.path.split("/")[1] || "kamaina"
    navigateTo(`/${segment}/property/${property.id}`)
}

const handleSearch = () => {
    console.log("Searching for:", searchQuery.value)
    loadData()
}

const clearSearch = () => {
    if (!searchQuery.value) return
    searchQuery.value = ""
    loadData()
}

const saveSearch = () => {
    console.log("Saving search...")
}


const handleFilterChange = (filters) => {
    console.log("Filters changed:", filters)
    loadData()
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
    const mapElement = document.getElementById("property-map")
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
    const mapElement = document.getElementById("property-map")
    if (mapElement) {
        mapElement.removeEventListener("wheel", handleMapWheel, {
            capture: true,
        })
    }
}

const initializeMap = async () => {
    if (!process.client) return

    // Check if map container exists in DOM
    const mapElement = document.getElementById("property-map")
    if (!mapElement) return

    // Remove existing map if it exists
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
    const defaultZoom = 14

    map.value = L.map("property-map").setView(
        defaultCenter,
        defaultZoom
    )


    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map.value)

    map.value.scrollWheelZoom.disable()
    detachMapWheelListener()
    attachMapWheelListener()


    addPropertyMarkers(L)


    setTimeout(() => fitBoundsToMarkers(), 100)
}

const addPropertyMarkers = (L) => {
    if (!map.value || !L) return


    markers.value.forEach((marker) => map.value.removeLayer(marker.marker))
    markers.value = []

    propertiesWithCoordinates.value.forEach((property) => {
        const customIcon = L.divIcon({
            html: `
                    <div class="relative">
                        <div class="bg-[#F66] text-white rounded-full w-20 h-6 flex items-center justify-center text-sm font-bold shadow-lg ">
                            $${Math.round(property.price / 1000)}k
                        </div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-500"></div>
                    </div>
                `,
            className: "custom-marker",
            iconSize: [32, 40],
            iconAnchor: [16, 40],
        })

        const marker = L.marker(property.coordinates, {
            icon: customIcon,
        }).addTo(map.value)


        marker.on("mouseover", (e) => onMarkerHover(property, e))
        marker.on("mouseout", () => onMarkerLeave())
        marker.on("click", () => handlePropertyClick(property))

        markers.value.push({ marker, property })
    })
}

const fitBoundsToMarkers = async () => {
    if (!map.value || markers.value.length === 0) return

    const L = await import("leaflet")
    const group = new L.featureGroup(
        markers.value.map(({ marker }) => marker)
    )
    // Fit bounds with minimal padding and maxZoom 14 for ~100km range view
    map.value.fitBounds(group.getBounds().pad(0.02), { maxZoom: 14, minZoom: 10 })
}

const onMarkerHover = (property, event) => {
    hoveredProperty.value = property
    showPopup.value = true


    const mapElement = document.getElementById("property-map")
    if (mapElement) {
        const rect = mapElement.getBoundingClientRect()
        popupPosition.value = {
            x: event.containerPoint.x + rect.left,
            y: event.containerPoint.y + rect.top - 10,
        }
    }
}

const onMarkerLeave = () => {
    showPopup.value = false
    hoveredProperty.value = null
}

const onPropertyCardHover = (property) => {
    const markerData = markers.value.find(
        (m) => m.property.id === property.id
    )
    if (markerData) {
        markerData.marker.getElement().classList.add("highlighted")
    }
}

const onPropertyCardLeave = () => {
    markers.value.forEach(({ marker }) => {
        marker.getElement().classList.remove("highlighted")
    })
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
        loadData()
    }
)


onMounted(() => {
    loadData()
})

watch(viewMode, async (newMode) => {
    if (newMode === "Map View") {
        showZoomHint()
        await nextTick()
        setTimeout(() => initializeMap(), 100)
    } else {
        hideZoomHint()
        detachMapWheelListener()
    }
})
 
watch(pending, async (newState) => {
    if (viewMode.value !== "Map View") return
    if (newState) {
        detachMapWheelListener()
        if (map.value) {
            map.value.remove()
            map.value = null
        }
    } else {
        await nextTick()
        setTimeout(() => initializeMap(), 100)
    }
})

watch(
    () => route.query.page,
    async () => {
        if (viewMode.value === "Map View" && map.value) {
            await nextTick()
            map.value?.invalidateSize()
            setTimeout(() => fitBoundsToMarkers(), 100)
        }
    }
)

watch(properties, async () => {
    if (viewMode.value === "Map View" && map.value) {
        const L = await import("leaflet")
        addPropertyMarkers(L)
        setTimeout(() => fitBoundsToMarkers(), 100)
    }
})


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
                <button @click="saveSearch"
                    class="w-full sm:w-auto h-[44px] px-4 bg-[#18222C] text-white rounded-[8px] text-[14px] leading-[20px] font-semibold hover:bg-[#1f2b36] transition-colors whitespace-nowrap">
                    Save Search
                </button>
            </div>
        </div>

        <!-- Row 2: Filter section (no search bar) -->
        <CommonCitizenSearchAdvancedFilterSection v-model:category="selectedCategory"
            v-model:price-range="selectedPriceRange" v-model:home-type="selectedHomeType"
            v-model:others="selectedOthers" v-model:beds-and-baths="selectedBedsAndBaths"
            :variant="props.filtersVariant" :hide-search="true" @filter-change="handleFilterChange" />

        <!-- Row 3: Results header + cards -->
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

                <div class="bg-[#F0F1F3] rounded-[8px] p-[6px] flex items-center gap-1 w-full sm:w-auto sm:self-start">
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

            <div v-if="pending">
                <div v-if="viewMode === 'Map View'" class="flex flex-col gap-4">
                    <div class="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-200 rounded-xl animate-pulse"></div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CommonCitizenPropertyCardSkeleton v-for="n in 6" :key="n" />
                    </div>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                    <CommonCitizenPropertyCardSkeleton v-for="n in 9" :key="n" />
                </div>
            </div>

            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p class="text-red-600 mb-2">
                    Error loading properties. Please try again later.
                </p>
                <p class="text-sm text-red-500">{{ error.message }}</p>
            </div>

            <div v-else-if="viewMode === 'Map View'" class="flex flex-col gap-4">
                <div class="w-full">
                    <div class="relative z-0 bg-white rounded-xl overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px]">
                        <div class="w-full h-full relative">
                            <div id="property-map" ref="mapContainer" class="w-full h-full rounded-xl relative">
                                <div v-if="zoomHintVisible" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    w-max bg-[rgba(24,34,44,0.85)] text-white text-[26px]
                                    px-4 py-1.5 rounded-full pointer-events-none
                                    tracking-[0.02em] shadow-[0_6px_18px_rgba(0,0,0,0.3)]
                                    z-[9999]">
                                    use ctrl + scroll to zoom the map
                                </div>

                            </div>

                            <Teleport to="body">
                                <div v-if="showPopup && hoveredProperty" class="fixed z-[10] pointer-events-none"
                                    :style="{
                                        left: popupPosition.x + 'px',
                                        top: popupPosition.y + 'px',
                                        transform: 'translate(-50%, -100%)',
                                    }">
                                    <CommonCitizenMapPopup :property="hoveredProperty" />
                                </div>
                            </Teleport>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="property in properties" :key="property.id" @mouseenter="onPropertyCardHover(property)"
                        @mouseleave="onPropertyCardLeave">
                        <CommonCitizenPropertyCard :property="property" @click="handlePropertyClick"
                            @favorite="toggleFavorite" />
                    </div>
                </div>

                <LazyPagination v-if="!pending && properties.length > 0" class="px-4" :config="paginationConfig" />
            </div>

            <div v-else class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                    <CommonCitizenPropertyCard v-for="property in properties" :key="property.id" :property="property"
                        @click="handlePropertyClick" @favorite="toggleFavorite" />
                </div>

                <LazyPagination v-if="!pending && properties.length > 0" class="px-4" :config="paginationConfig" />
            </div>
        </div>
    </div>

    <Toast position="top-right" />
</template>

<style scoped>
select {
    background-image: none;
}
/* Global styles for Leaflet markers */
.custom-marker {
    background: transparent !important;
    border: none !important;
}

.custom-marker.highlighted {
    transform: scale(1.2);
    z-index: 1000 !important;
}

.custom-marker .bg-red-500 {
    animation: pulse 2s infinite;
}

.custom-marker.highlighted .bg-red-500 {
    background-color: #059669 !important;
    animation: none;
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


#property-map {
    border-radius: 0.75rem;
}

.leaflet-popup-content-wrapper {
    border-radius: 0.5rem;
}
</style>
