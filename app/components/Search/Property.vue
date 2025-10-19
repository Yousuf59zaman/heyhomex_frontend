<script setup>
    // Get URL parameters
    const route = useRoute();

    // Reactive state - initialize from URL params
    const searchQuery = ref(
        route.query.q || '123 Aloha Lane, Honolulu, HI 96818'
    );
    const viewMode = ref(route.query.view === 'map' ? 'Map View' : 'List View');
    const selectedCategory = ref(route.query.category || 'For Sell');
    const selectedPriceRange = ref(route.query.priceRange || '$250,000');
    const selectedHomeType = ref(route.query.homeType || 'Beds & Baths');
    const selectedOthers = ref(route.query.others || 'More');
    const selectedBedsAndBaths = ref(route.query.bedsAndBaths || '');
    
    // Map related state
    const map = ref(null);
    const mapContainer = ref(null);
    const markers = ref([]);
    const hoveredProperty = ref(null);
    const popupPosition = ref({ x: 0, y: 0 });
    const showPopup = ref(false);

    // Mock property data - using same format as dashboard
    const properties = ref([
        {
            id: 1,
            title: 'Island Bank Hawaii',
            address: '456 Ocean View Dr, Maui, HI 96753',
            price: 431000,
            beds: 3,
            baths: 3,
            sqft: '1734/5000',
            image: '/images/dashboard/1.png',
            isFavorited: false,
            coordinates: [20.7984, -156.3319], // Maui
        },
        {
            id: 2,
            title: 'Hawaii Home Movers',
            address: '123 Aloha Lane, Honolulu, HI 96818',
            price: 475000,
            beds: 5,
            baths: 3,
            sqft: '1753/5000',
            image: '/images/dashboard/2.png',
            isFavorited: false,
            coordinates: [21.3099, -157.8581], // Honolulu
        },
        {
            id: 3,
            title: "Kama'aina Cleaning...",
            address: '89 Sunset Blvd, Kauai, HI 96714',
            price: 231000,
            beds: 2,
            baths: 2,
            sqft: '1200/3000',
            image: '/images/dashboard/3.png',
            isFavorited: false,
            coordinates: [22.0964, -159.5261], // Kauai
        },
        {
            id: 4,
            title: 'Aloha Handyman...',
            address: '22 Coral Ave, Hilo, HI 96720',
            price: 467000,
            beds: 4,
            baths: 3,
            sqft: '1713/5000',
            image: '/images/dashboard/1.png',
            isFavorited: false,
            coordinates: [19.7297, -155.0900], // Hilo, Big Island
        },
    ]);

    const resultsFound = computed(() => properties.value.length);

    // Methods
    const toggleFavorite = (property) => {
        const index = properties.value.findIndex((p) => p.id === property.id);
        if (index !== -1) {
            properties.value[index].isFavorited =
                !properties.value[index].isFavorited;
        }
    };

    const handlePropertyClick = (property) => {
        navigateTo(`/kamaina/property/${property.id}`);
    };

    const handleSearch = () => {
        console.log('Searching for:', searchQuery.value);
    };

    const saveSearch = () => {
        console.log('Saving search...');
    };

    const clearSearch = () => {
        searchQuery.value = '';
    };

    const handleFilterChange = (filters) => {
        console.log('Filters changed:', filters);
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
            
            map.value = L.map('property-map').setView(defaultCenter, defaultZoom);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map.value);
            
            // Add markers for all properties
            addPropertyMarkers(L);
            
            // Fit map to show all markers
            setTimeout(() => fitBoundsToMarkers(), 100);
        }
    };
    
    const addPropertyMarkers = (L) => {
        if (!map.value || !L) return;
        
        // Clear existing markers
        markers.value.forEach(marker => map.value.removeLayer(marker.marker));
        markers.value = [];
        
        properties.value.forEach(property => {
            const customIcon = L.divIcon({
                html: `
                    <div class="relative">
                        <div class="bg-[#F66] text-white rounded-full w-20 h-6 flex items-center justify-center text-sm font-bold shadow-lg ">
                            $${Math.round(property.price / 1000)}k
                        </div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-500"></div>
                    </div>
                `,
                className: 'custom-marker',
                iconSize: [32, 40],
                iconAnchor: [16, 40]
            });
            
            const marker = L.marker(property.coordinates, { icon: customIcon }).addTo(map.value);
            
            // Add event listeners
            marker.on('mouseover', (e) => onMarkerHover(property, e));
            marker.on('mouseout', () => onMarkerLeave());
            marker.on('click', () => handlePropertyClick(property));
            
            markers.value.push({ marker, property });
        });
    };
    
    const fitBoundsToMarkers = async () => {
        if (!map.value || markers.value.length === 0) return;
        
        const L = await import('leaflet');
        const group = new L.featureGroup(markers.value.map(({ marker }) => marker));
        map.value.fitBounds(group.getBounds().pad(0.1));
    };
    
    const onMarkerHover = (property, event) => {
        hoveredProperty.value = property;
        showPopup.value = true;
        
        // Calculate popup position
        const mapElement = document.getElementById('property-map');
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
        hoveredProperty.value = null;
    };
    
    const onPropertyCardHover = (property) => {
        const markerData = markers.value.find(m => m.property.id === property.id);
        if (markerData) {
            markerData.marker.getElement().classList.add('highlighted');
        }
    };
    
    const onPropertyCardLeave = () => {
        markers.value.forEach(({ marker }) => {
            marker.getElement().classList.remove('highlighted');
        });
    };

    // Watch for URL parameter changes
    watch(
        () => route.query,
        (newQuery) => {
            if (newQuery.q !== undefined) {
                searchQuery.value = newQuery.q;
            }
            if (newQuery.view) {
                viewMode.value =
                    newQuery.view === 'map' ? 'Map View' : 'List View';
            }
            if (newQuery.category) {
                selectedCategory.value = newQuery.category;
            }
            if (newQuery.priceRange) {
                selectedPriceRange.value = newQuery.priceRange;
            }
            if (newQuery.homeType) {
                selectedHomeType.value = newQuery.homeType;
            }
            if (newQuery.others) {
                selectedOthers.value = newQuery.others;
            }
            if (newQuery.bedsAndBaths) {
                selectedBedsAndBaths.value = newQuery.bedsAndBaths;
            }
        }
    );
    
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
            <!-- Property Listings Grid -->
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

            <!-- Map Section -->
            <div class="lg:col-span-4">
                <div
                    class="bg-white rounded-xl overflow-hidden h-96 lg:h-[600px] lg:sticky lg:top-6">
                    <div class="w-full h-full relative">
                        <div
                            id="property-map"
                            ref="mapContainer"
                            class="w-full h-full rounded-xl">
                        </div>
                        
                        <!-- Popup overlay for property details on map hover -->
                        <Teleport to="body">
                            <div
                                v-if="showPopup && hoveredProperty"
                                class="fixed z-[10000] pointer-events-none"
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
        </div>

        <!-- List View: Full-width property grid -->
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
        background-color: #059669 !important; /* emerald-600 */
        animation: none;
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
    #property-map {
        border-radius: 0.75rem;
    }
    
    /* Custom leaflet popup styles if needed */
    .leaflet-popup-content-wrapper {
        border-radius: 0.5rem;
    }
</style>
