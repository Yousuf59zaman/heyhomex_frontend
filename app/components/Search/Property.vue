<script setup>
   
    const props = defineProps({
        segment: {
            type: String,
            default: "kamaina",
            validator: (value) =>
                ["military", "investor", "kamaina"].includes(value),
        },
    })

  
    const route = useRoute()

  
    const searchQuery = ref(
        route.query.q || "123 Aloha Lane, Honolulu, HI 96818"
    )
    const viewMode = ref(route.query.view === "map" ? "Map View" : "List View")
    const selectedCategory = ref(route.query.category || "For Sell")
    const selectedPriceRange = ref(route.query.priceRange || "$250,000")
    const selectedHomeType = ref(route.query.homeType || "Beds & Baths")
    const selectedOthers = ref(route.query.others || "More")
    const selectedBedsAndBaths = ref(route.query.bedsAndBaths || "")

   
    const map = ref(null)
    const mapContainer = ref(null)
    const markers = ref([])
    const hoveredProperty = ref(null)
    const popupPosition = ref({x: 0, y: 0})
    const showPopup = ref(false)

   
    const properties = ref([])
    const pending = ref(false)
    const error = ref(null)
    const paginationConfig = ref({
        data: {},
        lang: "en",
        align: "center",
        action: "",
    })

  
    const loadData = async () => {
        pending.value = true
        error.value = null
        try {
            const response = await $fetchCMS("/property", {
                method: "POST",
                body: {
                    paginate: true,
                    page: route.query.page ? route.query.page : 1,
                    length: 8,
                    search: searchQuery.value,
                    category: selectedCategory.value,
                    price_range: selectedPriceRange.value,
                    home_type: selectedHomeType.value,
                },
            })

         
            properties.value = response.data.data.map((property) => ({
                id: property.id,
                title: property.name,
                address: property.address,
                price: property.price,
                beds: property.beds,
                baths: property.baths,
                sqft: property["square-feet"],
                image: property.image,
                isFavorited: false,
                coordinates: property.coordinates
                    ? [
                          property.coordinates.latitude,
                          property.coordinates.longitude,
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

 
    const toggleFavorite = (property) => {
        const prop = properties.value.find((p) => p.id === property.id)
        if (prop) {
            prop.isFavorited = !prop.isFavorited
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

    const saveSearch = () => {
        console.log("Saving search...")
    }


    const handleFilterChange = (filters) => {
        console.log("Filters changed:", filters)
        loadData()
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
        const defaultZoom = 8

        map.value = L.map("property-map").setView(
            defaultCenter,
            defaultZoom
        )

      
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map.value)

      
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

            markers.value.push({marker, property})
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
        markers.value.forEach(({marker}) => {
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
            await nextTick()
            setTimeout(() => initializeMap(), 100)
        }
    })

    watch(properties, async () => {
        if (viewMode.value === "Map View" && map.value) {
            const L = await import("leaflet")
            addPropertyMarkers(L)
            setTimeout(() => fitBoundsToMarkers(), 100)
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
       
        <CommonCitizenSearchAdvancedFilterSection
            v-model="searchQuery"
            v-model:category="selectedCategory"
            v-model:price-range="selectedPriceRange"
            v-model:home-type="selectedHomeType"
            v-model:others="selectedOthers"
            v-model:beds-and-baths="selectedBedsAndBaths"
            @search="handleSearch"
            @save-search="saveSearch"
            @filter-change="handleFilterChange" />

       
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

      
        <div v-if="pending">
           
            <div
                v-if="viewMode === 'Map View'"
                class="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
                <div class="lg:col-span-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        <CommonCitizenPropertyCardSkeleton
                            v-for="n in 4"
                            :key="n" />
                    </div>
                </div>
                <div class="lg:col-span-4">
                    <div
                        class="h-96 lg:h-[600px] bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
         
            <div
                v-else
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                <CommonCitizenPropertyCardSkeleton
                    v-for="n in 8"
                    :key="n" />
            </div>
        </div>

      
        <div
            v-else-if="error"
            class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p class="text-red-600 mb-2">
                Error loading properties. Please try again later.
            </p>
            <p class="text-sm text-red-500">{{ error.message }}</p>
        </div>

     
        <div
            v-else-if="viewMode === 'Map View'"
            class="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
           
            <div class="lg:col-span-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div
                        v-for="property in properties"
                        :key="property.id"
                        @mouseenter="onPropertyCardHover(property)"
                        @mouseleave="onPropertyCardLeave">
                        <CommonCitizenPropertyCard
                            :property="property"
                            @click="handlePropertyClick"
                            @favorite="toggleFavorite" />
                    </div>
                </div>
            </div>

         
            <div class="lg:col-span-4">
                <div
                    class="bg-white rounded-xl overflow-hidden h-96 lg:h-[600px] lg:sticky lg:top-6">
                    <div class="w-full h-full relative">
                        <div
                            id="property-map"
                            ref="mapContainer"
                            class="w-full h-full rounded-xl"></div>

                      
                        <Teleport to="body">
                            <div
                                v-if="showPopup && hoveredProperty"
                                class="fixed z-[10000] pointer-events-none"
                                :style="{
                                    left: popupPosition.x + 'px',
                                    top: popupPosition.y + 'px',
                                    transform: 'translate(-50%, -100%)',
                                }">
                                <CommonCitizenMapPopup
                                    :property="hoveredProperty" />
                            </div>
                        </Teleport>
                    </div>
                </div>
            </div>
        </div>

       
        <div
            v-else
            class="space-y-6">
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                <CommonCitizenPropertyCard
                    v-for="property in properties"
                    :key="property.id"
                    :property="property"
                    @click="handlePropertyClick"
                    @favorite="toggleFavorite" />
            </div>

           
            <LazyPagination
                v-if="!pending && properties.length > 0"
                class="px-4"
                :config="paginationConfig" />
        </div>
    </div>
</template>

<style scoped>
    select {
        background-image: none;
    }
</style>

<style>
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
