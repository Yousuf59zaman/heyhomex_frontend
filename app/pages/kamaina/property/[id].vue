<script setup>
import { useVideoPlayer } from "~/composables/useVideoPlayer"

const { openVideo } = useVideoPlayer()
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const hydrated = ref(false)

const route = useRoute()
const router = useRouter()
const propertyId = route.params.id

const activeTab = ref("Insights")

const propertyData = ref(null)
const pending = ref(false)
const error = ref(null)

const agentData = ref({
    name: "John Doeh",
    initials: "JD",
    avatar: null,
})

const contactForm = ref({
    fullName: "",
    message: "",
})

const tourTime = ref("Today 3:45")

const loadPropertyDetail = async () => {
    pending.value = true
    error.value = null
    try {
        const response = await $fetchCitizen(`/v1/property/${propertyId}`, {
            method: "GET",
        })

        const data = response.data

        propertyData.value = {
            id: data.id,
            name: data.name,
            address: data.address,
            description:
                data.description || data.details || data.short_description || "",
            price: data.price,
            beds: data.beds,
            baths: data.baths,
            sqft: data.square_feet,
            image: data.image_url,
            category: data.category,
            home_type: data.home_type,
            location: data.location,
            is_favorite: data.is_favorite,
            other_images: data.other_images || [],
            insights: data.insights || {},
            amenities: data.amenities || [],
            created_at: data.created_at,
            updated_at: data.updated_at,
        }
    } catch (e) {
        console.log("Error loading property detail:", e.message)
        error.value = e
    } finally {
        pending.value = false
    }
}

const submitContactForm = () => {
    console.log("Contact form submitted:", contactForm.value)
}

const bookTour = () => {
    console.log("Tour booking requested for:", tourTime.value)
}

const propertyImage = computed(
    () =>
        propertyData.value?.image ||
        propertyData.value?.other_images?.[0] ||
        `/images/dashboard/${propertyId || "1"}.png`
)

const allImages = computed(() => {
    if (!propertyData.value) return []
    const images = [propertyData.value.image]
    if (propertyData.value.other_images) {
        images.push(...propertyData.value.other_images)
    }
    return images.filter(Boolean)
})

const sqftValue = computed(() => {
    if (!propertyData.value?.sqft) return ""
    if (typeof propertyData.value.sqft === "string") {
        return propertyData.value.sqft.split("/")[0]
    }
    return propertyData.value.sqft
})

const videos = ref([])
const videosLoading = ref(false)
const videosError = ref(null)

// Load videos from API (without pagination for "videos you might like")
const loadVideos = async () => {
    videosLoading.value = true
    videosError.value = null
    try {
        const response = await $fetchCitizen("/videos/list", {
            method: "GET",
            params: {
                page: 1,
                per_page: 4,
            },
        })

        videos.value = response.data.data.map((video) => ({
            id: video.id,
            title: video.title,
            description: video.title,
            thumbnail: video.video_image || "/images/dashboard/video/1.png",
            duration: video.duration || "0:00",
            channelName: video.channel?.name || "Unknown Channel",
            channelInitial: video.channel?.name?.charAt(0) || "H",
            views: "0 Views",
            timeAgo: new Date(video.created_at).toLocaleDateString(),
            videoUrl: video.video_url,
        }))
    } catch (e) {
        console.log("Error loading videos:", e.message)
        videosError.value = e
        videos.value = []
    } finally {
        videosLoading.value = false
    }
}

const playSidebarVideo = (video) => {
    openVideo(video, [])
}

// Ad configuration - uses dynamic URLs based on current host
const { getDefaultAdConfig } = useAdConfig()
const adConfig = computed(() => getDefaultAdConfig())

const tabInsights = computed(() => {
    if (!propertyData.value?.insights) {
        return {
            title: "Insights",
            subtitle:
                "Real-life suitability for Hawaii residents and local families.",
            downloadButtonText: "Download Local Living Snapshot",
            items: [],
        }
    }

    const insights = propertyData.value.insights
    const items = []

    // Dynamically map all insights from API
    Object.keys(insights).forEach((key, index) => {
        if (
            insights[key] &&
            typeof insights[key] === "object" &&
            insights[key].name
        ) {
            items.push({
                id: index + 1,
                label: insights[key].name,
                value: insights[key].value,
            })
        }
    })

    return {
        title: "Insights",
        subtitle:
            "Real-life suitability for Hawaii residents and local families.",
        downloadButtonText: "Download Local Living Snapshot",
        items,
    }
})

const tabFeatures = computed(() => {
    if (!propertyData.value?.amenities) {
        return { title: "Features & Amenities", items: [] }
    }

    return {
        title: "Features & Amenities",
        items: propertyData.value.amenities.map((amenity, index) => ({
            id: index + 1,
            icon: amenity.icon || "lucide:check-circle",
            text: amenity.name,
        })),
    }
})

const tabMaps = computed(() => {
    return {
        title: "Map",
        mapUrl: propertyData.value?.location?.map_url || null,
        streetViewUrl:
            propertyData.value?.location?.street_view_url || null,
    }
})

const showGallery = ref(false)
const galleryActiveIndex = ref(0)

const galleryResponsiveOptions = ref([
    {
        breakpoint: '1500px',
        numVisible: 5
    },
    {
        breakpoint: '1024px',
        numVisible: 3
    },
    {
        breakpoint: '768px',
        numVisible: 2
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
])

const galleryItems = computed(() =>
    allImages.value
        .filter(Boolean)
        .map((src) => ({ item: src, thumbnail: src }))
)

const openGalleryAt = (index = 0) => {
    galleryActiveIndex.value = index
    showGallery.value = true

    // Add click outside handler after gallery opens
    nextTick(() => {
        const galleryMask = document.querySelector('.p-galleria-mask')
        if (galleryMask) {
            galleryMask.addEventListener('click', (e) => {
                if (e.target === galleryMask) {
                    showGallery.value = false
                }
            })
        }
    })
}

const goBack = () => {
    router.back()
}

// Set hydrated to true after component is mounted on client
onMounted(() => {
    hydrated.value = true
    loadPropertyDetail()
    loadVideos()
})
</script>

<template>
    <div class="min-h-screen bg-[#faf9f8] lg:bg-gray-50">
        <!-- Skeleton BEFORE hydration -->
        <div v-if="!hydrated"
            class="flex flex-col lg:flex-row w-full max-w-[1316px] mx-auto p-5 md:px-4 md:py-6 lg:p-0 gap-6 animate-pulse">
            <div class="flex-1">
                <!-- Property Images Skeleton -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div class="h-48 md:h-64 bg-gray-200 rounded-lg"></div>
                    <div class="hidden md:grid grid-rows-2 gap-2">
                        <div class="h-32 bg-gray-200 rounded-lg"></div>
                        <div class="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>

                <!-- Property Info Skeleton -->
                <div class="mb-6">
                    <div class="flex items-start mb-4">
                        <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                    <div class="flex justify-between mb-4">
                        <div class="h-8 w-1/3 bg-gray-200 rounded"></div>
                        <div class="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div class="h-6 w-full bg-gray-200 rounded mb-4"></div>
                    <div class="bg-white rounded-lg p-4">
                        <div class="flex justify-between gap-4 mb-4">
                            <div class="flex-1 h-24 bg-gray-200 rounded-lg"></div>
                            <div class="flex-1 h-24 bg-gray-200 rounded-lg"></div>
                            <div class="flex-1 h-24 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div class="space-y-2">
                            <div class="h-4 w-full bg-gray-200 rounded"></div>
                            <div class="h-4 w-full bg-gray-200 rounded"></div>
                            <div class="h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                <!-- Tabs Skeleton -->
                <div class="pt-4">
                    <div class="flex gap-4 bg-white rounded-lg p-3 mb-2">
                        <div class="h-10 w-24 bg-gray-200 rounded"></div>
                        <div class="h-10 w-24 bg-gray-200 rounded"></div>
                        <div class="h-10 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div class="bg-white rounded-lg p-6 space-y-4">
                        <div class="h-6 w-40 bg-gray-200 rounded"></div>
                        <div class="h-4 w-full bg-gray-200 rounded"></div>
                        <div class="h-4 w-full bg-gray-200 rounded"></div>
                        <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>

            <!-- Sidebar Skeleton -->
            <div class="w-full lg:w-80">
                <!-- Videos Skeleton -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                    <div class="px-4 py-3 border-b">
                        <div class="h-6 w-40 bg-gray-200 rounded"></div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div v-for="n in 3" :key="n">
                            <div class="h-32 bg-gray-200 rounded mb-2"></div>
                            <div class="h-4 w-full bg-gray-200 rounded mb-2"></div>
                            <div class="h-3 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                <!-- Agent Skeleton -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                    <div class="px-4 py-3 border-b">
                        <div class="h-6 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div class="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div class="h-10 bg-gray-200 rounded"></div>
                        <div class="h-24 bg-gray-200 rounded"></div>
                        <div class="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>

                <!-- Tour Skeleton -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="px-4 py-3 border-b">
                        <div class="h-6 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div class="h-4 w-full bg-gray-200 rounded"></div>
                        <div class="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="pending"
            class="flex flex-col lg:flex-row w-full max-w-[1316px] mx-auto p-5 md:px-4 md:py-6 lg:p-0 gap-6 animate-pulse">
            <!-- Same skeleton as before hydration -->
            <div class="flex-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div class="h-48 md:h-64 bg-gray-200 rounded-lg"></div>
                    <div class="hidden md:grid grid-rows-2 gap-2">
                        <div class="h-32 bg-gray-200 rounded-lg"></div>
                        <div class="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex justify-center items-center min-h-screen p-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                <p class="text-red-600 mb-2">
                    Error loading property details. Please try again later.
                </p>
                <p class="text-sm text-red-500">{{ error.message }}</p>
            </div>
        </div>

        <!-- Real content AFTER hydration and data loaded -->
        <div v-else-if="propertyData"
            class="flex flex-col lg:flex-row w-full max-w-[1316px] mx-auto p-5 md:px-4 md:py-6 lg:p-0 gap-6">
            <div class="flex-1 max-w-[872px]">
                <div class="flex items-start gap-4 md:hidden mb-6">
                    <button type="button"
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f1f3] text-[#121a22]"
                        @click="goBack">
                        <Icon name="lucide:arrow-left" class="h-4 w-4" />
                    </button>
                    <p class="text-[20px] leading-7 font-semibold text-[#2c3e50]">
                        Your next "big thing" is right here
                    </p>
                </div>
                <!-- Image Grid - Figma layout (Desktop) -->
                <div
                    class="hidden md:grid items-stretch gap-3 lg:gap-4 mb-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-[488px_320px] md:h-[320px]">
                    <!-- Main large image -->
                    <div class="relative w-full h-full overflow-hidden rounded-[18px]">
                        <img :src="propertyImage" :alt="propertyData.title || propertyData.name"
                            class="absolute inset-0 w-full h-full object-cover" />
                    </div>

                    <!-- Right column with 2 stacked images -->
                    <div class="grid h-full min-h-0 grid-rows-[1fr_1fr] gap-3 lg:gap-4">
                        <div class="relative h-full min-h-0 overflow-hidden rounded-[18px]">
                            <img :src="allImages[1] || propertyImage" alt="Property Image 2"
                                class="absolute inset-0 w-full h-full object-cover" />
                        </div>

                        <div class="relative h-full min-h-0 overflow-hidden rounded-[18px]">
                            <img :src="allImages[2] || propertyImage" alt="Property Image 3"
                                class="absolute inset-0 w-full h-full object-cover" />

                            <div class="absolute inset-0 bg-black/50 rounded-[18px]"></div>
                            <div
                                class="absolute inset-0 backdrop-blur-[1px] bg-white/[0.14] flex items-center justify-center rounded-[16px] cursor-pointer"
                                @click="openGalleryAt(0)">
                                <p class="text-white font-bold text-base">
                                    See All {{ allImages.length }} Photos
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mobile Image Grid -->
                <div class="flex md:hidden lg:hidden flex-col gap-4 md:gap-5 mb-6">
                    <div class="relative w-full h-[222px] md:h-[280px]">
                        <img :src="propertyImage" :alt="propertyData.title || propertyData.name"
                            class="w-full h-full object-cover rounded-[12px] md:rounded-[16px]" />
                    </div>
                    <div class="flex gap-4">
                        <div class="relative flex-1 h-[120px] md:h-[70px]">
                            <img :src="allImages[1] || propertyImage" alt="Property Image 2"
                                class="w-full h-full object-cover rounded-[10px] md:rounded-[14px]" />
                        </div>
                        <div class="relative flex-1 h-[120px] md:h-[70px]">
                            <img :src="allImages[2] || propertyImage" alt="Property Image 3"
                                class="w-full h-full object-cover rounded-[18px]" />
                            <div class="absolute inset-0 bg-black/50 rounded-[18px]"></div>
                            <div
                                class="absolute inset-0 backdrop-blur-[1px] bg-white/[0.14] flex items-center justify-center rounded-[12px] cursor-pointer"
                                @click="openGalleryAt(0)">
                                <p class="text-white font-bold text-sm leading-5">
                                    See All {{ allImages.length }} Photos
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Info Section -->
                <div class="flex flex-col gap-4 mb-6">
                    <!-- Location Badge -->
                    <div class="flex items-center gap-3">
                        <div class="bg-white lg:bg-[#f6f6fa] p-2 rounded-full">
                            <Icon
                                name="lucide:map-pin"
                                class="w-5 h-5 text-[#121a22]" />
                        </div>
                        <span class="text-sm leading-5 text-[#121a22] capitalize">
                            {{ propertyData.address }}
                        </span>
                        <!-- Price on same line - Desktop only -->
                        <span class="hidden md:block ml-auto text-[24px] leading-8 font-semibold text-[#121a22] lg:text-[28px] lg:leading-10 lg:shrink-0">
                            ${{ propertyData.price.toLocaleString() }}
                        </span>
                    </div>

                    <!-- Title with Action Buttons on same row -->
                    <div class="flex items-center justify-between gap-4">
                        <h1 class="text-[20px] leading-7 font-semibold text-[#121a22] md:text-[24px] md:leading-8 lg:text-2xl lg:leading-8">
                            {{ propertyData.title || propertyData.name }}
                        </h1>
                        <div class="flex items-center gap-3 shrink-0">
                            <button
                                class="bg-[#18222c] text-white h-[44px] px-5 rounded-xl text-sm font-bold leading-[1.46] hover:bg-[#111922] transition-colors">
                                Claim This Home
                            </button>
                            <button
                                class="h-[44px] w-[44px] flex-shrink-0 bg-white border border-[#e5e7eb] rounded-xl flex items-center justify-center hover:bg-[#f9fafb] transition-colors">
                                <Icon
                                    name="lucide:heart"
                                    class="w-5 h-5 text-[#6b7280]" />
                            </button>
                        </div>
                    </div>

                    <!-- Price - Mobile only (below title row) -->
                    <p class="md:hidden text-[20px] leading-7 font-semibold text-[#121a22]">
                        ${{ propertyData.price.toLocaleString() }}
                    </p>

                    <!-- Divider -->
                    <div class="hidden lg:block h-px w-full bg-[#EAECEE]"></div>

                    <div class="bg-white rounded-xl p-4 flex flex-col gap-6">
                        <div class="flex flex-col sm:flex-row gap-3">
                            <div class="flex-1 bg-[#FAF9F8] rounded-xl px-8 py-4 lg:py-5 flex items-center justify-center">
                                <div class="flex flex-col items-center justify-center gap-4">
                                    <img src="/svg/dashboard/card.bed.svg" alt="Beds" class="w-8 h-8" />
                                    <p class="capitalize text-[20px] leading-[28px] font-medium text-[#121A22]">
                                        {{ propertyData.beds }} Beds
                                    </p>
                                </div>
                            </div>
                            <div class="flex-1 bg-[#FAF9F8] rounded-xl px-8 py-4 lg:py-5 flex items-center justify-center">
                                <div class="flex flex-col items-center justify-center gap-4">
                                    <img src="/svg/dashboard/card-bath.svg" alt="Baths" class="w-8 h-8" />
                                    <p class="capitalize text-[20px] leading-[28px] font-medium text-[#121A22]">
                                        {{ propertyData.baths }} Baths
                                    </p>
                                </div>
                            </div>
                            <div class="flex-1 bg-[#FAF9F8] rounded-xl px-8 py-4 lg:py-5 flex items-center justify-center">
                                <div class="flex flex-col items-center justify-center gap-4">
                                    <img src="/svg/dashboard/card-cube.svg" alt="Sqft" class="w-8 h-8" />
                                    <p class="capitalize text-[20px] leading-[28px] font-medium text-[#121A22]">
                                        {{ sqftValue }}Sqft
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3">
                            <p class="text-[#283849] text-base leading-6">
                                {{ propertyData.description }}
                            </p>
                            <button v-if="
                                propertyData.description &&
                                propertyData.description.length > 300
                            " type="button" class="text-[#2C3E50] font-bold text-base">
                                See More...
                            </button>
                        </div>
                    </div>
                </div>

                <div class="pt-4 flex flex-col gap-6">
                    <div class="flex items-center gap-3 rounded-lg bg-white p-1.5 overflow-hidden">
                        <button :class="[
                            'whitespace-nowrap rounded-xl font-bold text-sm leading-[1.46] transition-colors flex-1 lg:flex-none px-5 lg:px-4 py-3 text-center',
                            activeTab === 'Insights'
                                ? 'bg-[#18222c] text-white hover:bg-[#111922] lg:px-5'
                                : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e6e8eb]',
                        ]" @click="activeTab = 'Insights'">
                            Insights
                        </button>
                        <button :class="[
                            'whitespace-nowrap rounded-xl font-bold text-sm leading-[1.46] transition-colors flex-1 lg:flex-none px-5 lg:px-4 py-3 text-center',
                            activeTab === 'Features'
                                ? 'bg-[#18222c] text-white hover:bg-[#111922] lg:px-5'
                                : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e6e8eb]',
                        ]" @click="activeTab = 'Features'">
                            Features
                        </button>
                        <button :class="[
                            'whitespace-nowrap rounded-xl font-bold text-sm leading-[1.46] transition-colors flex-1 lg:flex-none px-5 lg:px-4 py-3 text-center',
                            activeTab === 'Maps'
                                ? 'bg-[#18222c] text-white hover:bg-[#111922] lg:px-5'
                                : 'bg-[#f0f1f3] text-[#121a22] hover:bg-[#e6e8eb]',
                        ]" @click="activeTab = 'Maps'">
                            Map
                        </button>
                    </div>

                    <div v-if="activeTab === 'Insights'" class="bg-white rounded-xl p-4 flex flex-col gap-5">
                        <div class="flex flex-col gap-3">
                            <h3
                                class="text-[20px] leading-7 font-semibold text-[#121A22] md:text-[22px] md:leading-8 lg:text-2xl lg:leading-8">
                                {{ tabInsights.title }}
                            </h3>
                            <p class="text-sm text-[#283849] leading-5">
                                {{ tabInsights.subtitle }}
                            </p>
                        </div>

                        <div class="bg-[#FAF9F8] rounded-[10px] p-4 lg:p-5 flex flex-col gap-4">
                            <template v-for="(item, index) in tabInsights.items" :key="item.id">
                                <div
                                    class="flex flex-col gap-3 text-[#283849] text-sm leading-5 lg:flex-row lg:items-start lg:justify-between lg:text-base lg:leading-6">
                                    <p class="font-medium w-full lg:flex-1 lg:pr-4">
                                        {{ item.label }}
                                    </p>
                                    <p class="font-bold w-full lg:w-[340px] lg:text-right">
                                        {{ item.value }}
                                    </p>
                                </div>
                                <div v-if="
                                    index !== tabInsights.items.length - 1
                                " class="h-px w-full bg-[#EAECEE]"></div>
                            </template>
                        </div>

                        <div class="flex justify-end">
                            <button
                                class="bg-[#121A22] text-white px-4 py-3 rounded-[12px] lg:rounded-lg text-sm font-bold leading-5">
                                {{ tabInsights.downloadButtonText }}
                            </button>
                        </div>
                    </div>

                    <div v-if="activeTab === 'Features'" class="bg-white rounded-xl p-4 flex flex-col gap-5">
                        <h3
                            class="text-[20px] leading-7 font-semibold text-[#121a22] md:text-[22px] md:leading-8 lg:text-2xl lg:leading-8">
                            Features & Advantages
                        </h3>
                        <div class="flex flex-col gap-3">
                            <div v-for="feature in tabFeatures.items" :key="feature.id"
                                class="bg-[#faf9f8] rounded-xl p-5 flex items-center gap-4">
                                <Icon :name="feature.icon" class="w-8 h-8 text-[#283849] flex-shrink-0" />
                                <span class="text-[#283849] font-medium text-lg">
                                    {{ feature.text }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div v-if="activeTab === 'Maps'" class="bg-white p-3">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">
                            {{ tabMaps.title }}
                        </h3>
                        <div v-if="tabMaps.mapUrl" class="space-y-4">
                            <div class="rounded-lg overflow-hidden">
                                <iframe :src="tabMaps.mapUrl" width="100%" height="400" style="border: 0"
                                    allowfullscreen="" loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                            <!-- Street View Button Commented Out
                            <div
                                v-if="tabMaps.streetViewUrl"
                                class="text-center">
                                <a
                                    :href="tabMaps.streetViewUrl"
                                    target="_blank"
                                    class="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    View Street View
                                </a>
                            </div>
                            -->
                        </div>
                        <div v-else class="bg-gray-100 rounded-lg p-8 text-center">
                            <p class="text-gray-600">Map data not available</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Sidebar -->
            <div class="w-full lg:w-[360px] xl:w-[420px] mt-6 lg:mt-0 flex flex-col gap-6">
                <!-- Videos Section -->
                <div class="bg-white rounded-xl p-4 flex flex-col gap-6">
                    <h3
                        class="text-[20px] leading-7 font-semibold text-[#121a22] md:text-[22px] md:leading-8 lg:text-2xl lg:leading-8">
                        Videos you might like!
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div v-for="video in videos" :key="video.id" class="flex flex-col gap-4 cursor-pointer"
                            @click="playSidebarVideo(video)">
                            <!-- Video Thumbnail -->
                            <div
                                class="relative w-full h-[200px] md:h-[180px] lg:h-[200px] rounded-[10px] overflow-hidden">
                                <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" />
                                <!-- Duration Badge -->
                                <div
                                    class="absolute bottom-2 right-2 bg-black/90 text-white px-2 py-1 rounded text-xs font-medium">
                                    {{ video.duration }}
                                </div>
                            </div>

                            <!-- Video Info -->
                            <div class="flex items-start gap-4">
                                <!-- Hello Badge -->
                                <div
                                    class="bg-[#283849] w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0">
                                    <span class="text-white text-sm font-semibold">Hello</span>
                                </div>
                                <!-- Title and Meta -->
                                <div class="flex-1 flex flex-col gap-1">
                                    <p class="text-base font-semibold text-[#283849] leading-6 line-clamp-2">
                                        {{ video.title }}
                                    </p>
                                    <div class="flex items-center gap-1.5 text-xs text-[#283849]">
                                        <span>{{ video.channelName }}</span>
                                        <div class="w-px h-3 bg-[#d4d4d4]"></div>
                                        <span>{{ video.views }}</span>
                                        <div class="w-px h-3 bg-[#d4d4d4]"></div>
                                        <span>{{ video.timeAgo }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Agent Highlight -->
                <div class="bg-[#f7f7f8] rounded-[12px] p-2 lg:bg-white lg:rounded-xl lg:p-0 overflow-hidden">
                    <div class="bg-white rounded-[8px] p-4 flex flex-col gap-5 lg:bg-transparent lg:rounded-none">
                        <h3
                            class="text-[20px] leading-7 font-semibold text-[#121a22] md:text-[22px] md:leading-8 lg:text-2xl lg:leading-8">
                            Agent Highlight
                        </h3>

                        <!-- Divider -->
                        <div class="h-px w-full bg-[#EAECEE]"></div>

                        <!-- Agent Info -->
                        <div class="flex items-center gap-3">
                            <Avatar :image="agentData.avatar" :label="agentData.initials" class="w-10 h-10"
                                shape="circle" />
                            <p class="text-base font-semibold text-[#000121]">
                                {{ agentData.name }}
                            </p>
                        </div>

                        <!-- Contact Form -->
                        <form @submit.prevent="submitContactForm" class="flex flex-col gap-5">
                            <div class="flex flex-col">
                                <label class="text-sm font-medium text-[#121a22] pb-2">
                                    Full Name
                                </label>
                                <InputText v-model="contactForm.fullName" placeholder="Enter  your full name"
                                    class="w-full px-4 py-3.5 border border-[#cfdbe8] rounded-lg text-sm text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>

                            <div class="flex flex-col">
                                <label class="text-sm font-medium text-[#121a22] pb-2">
                                    Message
                                </label>
                                <Textarea v-model="contactForm.message" placeholder="Enter your message" rows="5"
                                    class="w-full px-4 py-3.5 border border-[#cfdbe8] rounded-lg text-sm text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                            </div>

                            <Button type="submit" label="Contact Agent"
                                class="w-full bg-[#18222c] hover:bg-[#121a22] text-white py-3.5 px-6 rounded-xl text-base font-bold transition-colors border border-[#2c3e50]" />
                        </form>
                    </div>
                </div>

                <!-- Request a Tour -->
                <div class="bg-white rounded-xl p-4 flex flex-col gap-5">
                    <h3
                        class="text-[20px] leading-7 font-semibold text-[#121a22] md:text-[22px] md:leading-8 lg:text-2xl lg:leading-8">
                        Request a Tour
                    </h3>
                    <div class="bg-[#FAF9F8] rounded-[12px] p-4 text-center">
                        <p class="text-sm text-[#283849] mb-2">
                            Request a tour at
                        </p>
                        <p class="text-lg font-semibold text-[#121A22]">
                            {{ tourTime }}
                        </p>
                    </div>
                    <button type="button" @click="bookTour"
                        class="w-full bg-[#18222c] hover:bg-[#121a22] text-white py-3.5 px-6 rounded-xl text-base font-bold transition-colors">
                        Book a Tour
                    </button>
                </div>
            </div>
        </div>
        <!-- Video Player Modal with Ads -->
        <ClientOnly>
            <VideoPlayerModal :adConfig="adConfig" />

            <!-- Fullscreen Gallery -->
            <Galleria v-model:visible="showGallery" v-model:activeIndex="galleryActiveIndex" :value="galleryItems"
                :responsiveOptions="galleryResponsiveOptions" :numVisible="9" containerStyle="max-width: 100%"
                :circular="true" :fullScreen="true" :showItemNavigators="true" :showThumbnails="true"
                :closeOnEscape="true">
                <template #item="slotProps">
                    <img :src="slotProps.item.item" :alt="'Property Image'"
                        class="w-full h-auto max-h-[85vh] object-contain" @click.stop />
                </template>
                <template #thumbnail="slotProps">
                    <img :src="slotProps.item.thumbnail" :alt="'Thumbnail'"
                        class="w-16 h-16 object-cover cursor-pointer" />
                </template>
            </Galleria>
        </ClientOnly>
    </div>
</template>
<style scoped>
:deep(.p-galleria) {
    border: none;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.h-32 {
    height: 8rem;
}

.leading-tight {
    line-height: 1.25;
}

@media (max-width: 768px) {
    .order-3 {
        width: 100%;
    }

    .h-32 {
        height: 6rem;
    }

    .overflow-x-auto::-webkit-scrollbar {
        display: none;
    }

    .overflow-x-auto {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
}

@media (min-width: 769px) {
    .h-32 {
        height: 8rem;
    }
}
</style>
