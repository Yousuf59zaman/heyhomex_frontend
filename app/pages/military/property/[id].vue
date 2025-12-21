<script setup>
    import {useVideoPlayer} from "~/composables/useVideoPlayer"

    const demoVideoUrl =
        "https://content.jwplatform.com/manifests/yp34SRmf.m3u8"

    const {openVideo} = useVideoPlayer()
    definePageMeta({middleware: ["auth-citizen"], layout: "citizen"})

    const hydrated = ref(false)

    const route = useRoute()
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
                loan_eligibility: data.loan_eligibility || {},
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
                videoUrl: video.video_url || demoVideoUrl,
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

    // Ad configuration for VAST video advertising
    const adConfig = ref({
        client: "vast",
        schedule: [
            {
                offset: "pre",
                tag: "http://localhost:3000/ads/pre-roll-ad.xml",
                type: "linear",
            },
            {
                offset: "50%",
                tag: "http://localhost:3000/ads/mid-roll-ad.xml",
                type: "linear",
            },
            {
                offset: "post",
                tag: "http://localhost:3000/ads/post-roll-ad.xml",
                type: "linear",
            },
        ],
        skipoffset: 5,
        admessage: "This ad will end in xx seconds",
        skipmessage: "Skip ad",
        vpaidcontrols: true,
        autoplayadsmuted: false,
    })

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
            return {title: "Features & Amenities", items: []}
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

    const tabLoanEligibility = computed(() => {
        if (!propertyData.value?.loan_eligibility) {
            return {
                title: "Loan Eligibility",
                subtitle: "Military loan benefits and eligibility information.",
                items: [],
            }
        }

        const loan = propertyData.value.loan_eligibility
        const items = []

        // Dynamically map all loan eligibility fields
        Object.keys(loan).forEach((key, index) => {
            if (loan[key] && typeof loan[key] === "object" && loan[key].name) {
                items.push({
                    id: index + 1,
                    label: loan[key].name,
                    value: loan[key].value,
                })
            }
        })

        return {
            title: "Loan Eligibility",
            subtitle: "Military loan benefits and eligibility information.",
            items,
        }
    })

    const tabMaps = computed(() => {
        return {
            title: "Location & Maps",
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
            .map((src) => ({item: src, thumbnail: src}))
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

    // Set hydrated to true after component is mounted on client
    onMounted(() => {
        hydrated.value = true
        loadPropertyDetail()
        loadVideos()
    })
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Skeleton BEFORE hydration -->
        <div
            v-if="!hydrated"
            class="flex flex-col lg:flex-row mx-auto p-4 gap-6 max-w-7xl animate-pulse">
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
                            <div
                                class="flex-1 h-24 bg-gray-200 rounded-lg"></div>
                            <div
                                class="flex-1 h-24 bg-gray-200 rounded-lg"></div>
                            <div
                                class="flex-1 h-24 bg-gray-200 rounded-lg"></div>
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
                        <div
                            v-for="n in 3"
                            :key="n">
                            <div class="h-32 bg-gray-200 rounded mb-2"></div>
                            <div
                                class="h-4 w-full bg-gray-200 rounded mb-2"></div>
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
                            <div
                                class="w-10 h-10 bg-gray-200 rounded-full"></div>
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
        <div
            v-else-if="pending"
            class="flex flex-col lg:flex-row mx-auto p-4 gap-6 max-w-7xl animate-pulse">
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
        <div
            v-else-if="error"
            class="flex justify-center items-center min-h-screen p-4">
            <div
                class="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                <p class="text-red-600 mb-2">
                    Error loading property details. Please try again later.
                </p>
                <p class="text-sm text-red-500">{{ error.message }}</p>
            </div>
        </div>

        <!-- Real content AFTER hydration and data loaded -->
        <div
            v-else-if="propertyData"
            class="flex flex-col lg:flex-row mx-auto p-4 gap-6 max-w-7xl">
            <div class="flex-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div class="relative h-full order-1">
                        <img
                            :src="propertyImage"
                            :alt="propertyData.title || propertyData.name"
                            class="w-full h-48 md:h-64 object-cover rounded-lg" />
                    </div>

                    <div
                        class="hidden md:grid grid-rows-2 gap-1 h-full order-2">
                        <div class="relative h-full">
                            <img
                                :src="allImages[1] || propertyImage"
                                alt="Property Image 2"
                                class="w-full h-32 object-cover rounded-lg" />
                        </div>

                        <div class="relative h-32">
                            <img
                                :src="allImages[2] || propertyImage"
                                alt="Property Image 3"
                                class="w-full h-32 object-cover rounded-lg" />

                            <div
                                class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                                <div class="text-white text-center">
                                    <div class="text-sm font-medium">
                                        <button
                                            type="button"
                                            class="text-white text-center px-4 py-2 rounded font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-white"
                                            @click="openGalleryAt(0)"
                                            aria-label="Open photo gallery">
                                            See All
                                            {{ allImages.length }} Photos
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="md:hidden flex gap-2 order-3">
                        <div class="relative flex-1">
                            <img
                                :src="allImages[1] || propertyImage"
                                alt="Property Image 2"
                                class="w-full h-20 object-cover rounded-lg" />
                        </div>
                        <div class="relative flex-1">
                            <img
                                :src="allImages[2] || propertyImage"
                                alt="Property Image 3"
                                class="w-full h-20 object-cover rounded-lg" />

                            <div
                                class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                                <div class="text-white text-center">
                                    <div class="text-xs font-medium">
                                        <button
                                            type="button"
                                            class="text-white text-center px-3 py-1 rounded font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-white"
                                            @click="openGalleryAt(0)"
                                            aria-label="Open photo gallery">
                                            See All
                                            {{ allImages.length }} Photos
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <div class="flex items-start mb-4 md:hidden">
                        <Icon
                            name="lucide:map-pin"
                            class="w-4 h-4 mt-1 mr-2 text-gray-600" />
                        <span class="text-sm text-gray-600">
                            {{ propertyData.address }}
                        </span>
                    </div>

                    <div
                        class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div class="flex-1 mb-4 md:mb-0">
                            <div class="hidden md:flex items-start mb-2">
                                <Icon
                                    name="lucide:map-pin"
                                    class="w-4 h-4 mt-1 mr-2 text-gray-600" />
                                <span class="text-sm text-gray-600">
                                    {{ propertyData.address }}
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-col md:items-end">
                            <div
                                class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                ${{ propertyData.price.toLocaleString() }}
                            </div>
                        </div>
                    </div>

                    <div
                        class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <h1
                            class="text-xl md:text-md max-w-sm font-bold text-gray-900 mb-2">
                            {{ propertyData.title || propertyData.name }}
                        </h1>
                        <div class="flex items-center gap-3">
                            <button
                                class="flex-1 md:flex-none md:w-auto bg-gray-900 text-white px-6 py-3 md:py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                Claim This Home
                            </button>
                            <button
                                class="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
                                <Icon
                                    name="lucide:heart"
                                    class="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-3 md:p-3">
                        <div
                            class="flex justify-between items-center space-x-2 md:space-x-4">
                            <div
                                class="flex-1 flex flex-col items-center bg-gray-100 rounded-lg p-3 md:p-4">
                                <img
                                    src="/svg/dashboard/card.bed.svg"
                                    alt="Beds"
                                    class="w-6 h-6 md:w-8 md:h-8 mb-2" />
                                <div
                                    class="text-lg md:text-xl font-bold text-gray-900">
                                    {{ propertyData.beds }}
                                </div>
                                <div class="text-xs md:text-sm text-gray-600">
                                    Beds
                                </div>
                            </div>
                            <div
                                class="flex-1 flex flex-col items-center bg-gray-100 rounded-lg p-3 md:p-4">
                                <img
                                    src="/svg/dashboard/card-bath.svg"
                                    alt="Baths"
                                    class="w-6 h-6 md:w-8 md:h-8 mb-2" />
                                <div
                                    class="text-lg md:text-xl font-bold text-gray-900">
                                    {{ propertyData.baths }}
                                </div>
                                <div class="text-xs md:text-sm text-gray-600">
                                    Baths
                                </div>
                            </div>
                            <div
                                class="flex-1 flex flex-col items-center bg-gray-100 rounded-lg p-3 md:p-4">
                                <img
                                    src="/svg/dashboard/card-cube.svg"
                                    alt="SqFt"
                                    class="w-6 h-6 md:w-8 md:h-8 mb-2" />
                                <div
                                    class="text-lg md:text-xl font-bold text-gray-900">
                                    {{
                                        propertyData.sqft &&
                                        typeof propertyData.sqft === "string"
                                            ? propertyData.sqft.split("/")[0]
                                            : propertyData.sqft || ""
                                    }}
                                </div>
                                <div class="text-xs md:text-sm text-gray-600">
                                    Sqft
                                </div>
                            </div>
                        </div>

                        <div class="py-4 md:pt-6">
                            <p
                                class="text-gray-700 leading-relaxed text-sm mb-4">
                                {{ propertyData.description }}
                            </p>
                            <button
                                v-if="
                                    propertyData.description &&
                                    propertyData.description.length > 300
                                "
                                class="text-gray-900 font-medium hover:underline text-sm">
                                See More...
                            </button>
                        </div>
                    </div>
                </div>

                <div class="pt-4">
                    <div
                        class="flex rounded-lg mb-2 bg-white space-x-2 md:space-x-6 px-3 md:px-3 py-3 overflow-x-auto">
                        <button
                            :class="[
                                'whitespace-nowrap pb-2 px-3 py-2 rounded-md font-medium text-xs md:text-sm transition-colors hover:bg-black hover:text-white flex-shrink-0',
                                activeTab === 'Insights'
                                    ? 'bg-black  text-white'
                                    : ' text-gray-500 ',
                            ]"
                            @click="activeTab = 'Insights'">
                            Insights
                        </button>
                        <button
                            :class="[
                                'whitespace-nowrap pb-2 px-3 py-2 rounded-md font-medium text-xs md:text-sm transition-colors hover:bg-black hover:text-white flex-shrink-0',
                                activeTab === 'Loan'
                                    ? 'bg-black  text-white'
                                    : ' text-gray-500 ',
                            ]"
                            @click="activeTab = 'Loan'">
                            Loan Eligibility
                        </button>
                        <button
                            :class="[
                                'whitespace-nowrap pb-2 px-3 py-2 rounded-md font-medium text-xs md:text-sm transition-colors hover:bg-black hover:text-white flex-shrink-0',
                                activeTab === 'Features'
                                    ? 'bg-black  text-white'
                                    : 'text-gray-500 ',
                            ]"
                            @click="activeTab = 'Features'">
                            Features
                        </button>
                        <button
                            :class="[
                                'whitespace-nowrap pb-2 px-3 py-2 rounded-md font-medium text-xs md:text-sm transition-colors hover:bg-black hover:text-white flex-shrink-0',
                                activeTab === 'Maps'
                                    ? 'bg-black  text-white'
                                    : 'text-gray-500 ',
                            ]"
                            @click="activeTab = 'Maps'">
                            Maps
                        </button>
                    </div>

                    <div
                        v-if="activeTab === 'Insights'"
                        class="bg-white rounded-lg p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">
                            {{ tabInsights.title }}
                        </h3>
                        <p class="text-gray-600 mb-6 text-sm">
                            {{ tabInsights.subtitle }}
                        </p>

                        <div class="space-y-4">
                            <div
                                v-for="item in tabInsights.items"
                                :key="item.id"
                                class="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0">
                                <span class="text-gray-700 font-medium text-sm">
                                    {{ item.label }}
                                </span>
                                <span class="text-gray-900 text-sm text-right">
                                    {{ item.value }}
                                </span>
                            </div>
                        </div>

                        <div class="mt-6 text-right">
                            <button
                                class="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                {{ tabInsights.downloadButtonText }}
                            </button>
                        </div>
                    </div>

                    <div
                        v-if="activeTab === 'Loan'"
                        class="bg-white rounded-lg p-6">
                        <h3 class="text-2xl font-semibold text-[#121a22] mb-5">
                            VA Loan Estimate
                        </h3>
                        
                        <div class="bg-[#f7f7f8] rounded-lg p-5 mb-5">
                            <div class="space-y-6">
                                <div
                                    v-for="item in tabLoanEligibility.items"
                                    :key="item.id"
                                    class="flex items-start justify-between">
                                    <span class="text-[#283849] font-medium text-base">
                                        {{ item.label }}
                                    </span>
                                    <span
                                        class="text-[#283849] text-xl font-bold italic text-right">
                                        {{ item.value }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            class="w-full bg-[#18222c] hover:bg-[#121a22] text-white py-3.5 px-5 rounded-xl text-sm font-bold transition-colors">
                            Check Your Eligibility
                        </button>
                    </div>

                    <div
                        v-if="activeTab === 'Features'"
                        class="bg-white p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">
                            {{ tabFeatures.title }}
                        </h3>
                        <div class="space-y-3">
                            <div
                                v-for="feature in tabFeatures.items"
                                :key="feature.id"
                                class="flex items-center space-x-3">
                                <Icon
                                    :name="feature.icon"
                                    class="w-5 h-5 text-gray-600" />
                                <span class="text-gray-900 font-medium">
                                    {{ feature.text }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="activeTab === 'Maps'"
                        class="bg-white p-3">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">
                            {{ tabMaps.title }}
                        </h3>
                        <div
                            v-if="tabMaps.mapUrl"
                            class="space-y-4">
                            <div class="rounded-lg overflow-hidden">
                                <iframe
                                    :src="tabMaps.mapUrl"
                                    width="100%"
                                    height="400"
                                    style="border: 0"
                                    allowfullscreen=""
                                    loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
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
                        </div>
                        <div
                            v-else
                            class="bg-gray-100 rounded-lg p-8 text-center">
                            <p class="text-gray-600">Map data not available</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Sidebar -->
            <div class="w-full lg:w-80 mt-6 lg:mt-0">
                <!-- Videos Section -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                    <div class="px-4 py-3 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">
                            Videos you might like!
                        </h3>
                    </div>
                    <div
                        class="p-4 space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:flex lg:flex-col lg:space-y-4">
                        <div
                            v-for="video in videos"
                            :key="video.id"
                            class="group cursor-pointer"
                            @click="playSidebarVideo(video)">
                            <!-- Video Thumbnail -->
                            <div
                                class="relative w-full h-32 md:h-48 lg:h-32 mb-3">
                                <img
                                    :src="video.thumbnail"
                                    :alt="video.title"
                                    class="w-full h-full object-cover rounded-md" />

                                <!-- Duration Badge -->
                                <div
                                    class="absolute bottom-2 right-2 bg-black/90 text-white px-2 py-1 rounded text-xs font-medium">
                                    {{ video.duration }}
                                </div>

                                <!-- Channel Avatar with "Hello" -->
                                <div
                                    class="absolute bottom-2 left-2 flex items-center gap-1">
                                    <div
                                        class="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
                                        <span
                                            class="text-white text-xs font-medium"
                                            >{{ video.channelInitial }}</span
                                        >
                                    </div>
                                    <span
                                        class="text-white text-xs font-medium bg-black/70 px-1.5 py-0.5 rounded"
                                        >Hello</span
                                    >
                                </div>
                            </div>

                            <!-- Video Info -->
                            <div class="px-1">
                                <h4
                                    class="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
                                    {{ video.title }}
                                </h4>
                                <div class="text-xs text-gray-500">
                                    {{ video.channelName }} •
                                    {{ video.views }} • {{ video.timeAgo }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Agent Highlight -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                    <div class="px-4 py-3 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">
                            Agent Highlight
                        </h3>
                    </div>
                    <div class="p-4">
                        <!-- Agent Info -->
                        <div class="flex items-center space-x-3 mb-4">
                            <Avatar
                                :image="agentData.avatar"
                                :label="agentData.initials"
                                class="w-10 h-10"
                                shape="circle" />
                            <div>
                                <p class="font-medium text-gray-900 text-sm">
                                    {{ agentData.name }}
                                </p>
                            </div>
                        </div>

                        <!-- Contact Form -->
                        <form
                            @submit.prevent="submitContactForm"
                            class="space-y-4">
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <InputText
                                    v-model="contactForm.fullName"
                                    placeholder="Enter your full name"
                                    class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <Textarea
                                    v-model="contactForm.message"
                                    placeholder="Enter your message"
                                    rows="4"
                                    class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                            </div>

                            <Button
                                type="submit"
                                label="Contact Agent"
                                class="w-full bg-[#18222c] hover:bg-[#121a22] text-white py-2.5 rounded-md text-sm font-medium transition-colors border-0" />
                        </form>
                    </div>
                </div>

                <!-- Request a Tour -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="px-4 py-3 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">
                            Request a Tour
                        </h3>
                    </div>
                    <div class="p-4">
                        <div class="text-center mb-4">
                            <p class="text-sm text-gray-600 mb-2">
                                Request a tour at
                            </p>
                            <p class="text-lg font-semibold text-gray-900">
                                {{ tourTime }}
                            </p>
                        </div>

                        <Button
                            @click="bookTour"
                            label="Book a Tour"
                            class="w-full bg-[#18222c] hover:bg-[#121a22] text-white py-2.5 rounded-md text-sm font-medium transition-colors border-0" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Video Player Modal with Ads -->
        <ClientOnly>
            <VideoPlayerModal :adConfig="adConfig" />

            <!-- Fullscreen Gallery -->
            <Galleria 
                v-model:visible="showGallery" 
                v-model:activeIndex="galleryActiveIndex"
                :value="galleryItems" 
                :responsiveOptions="galleryResponsiveOptions" 
                :numVisible="9" 
                containerStyle="max-width: 100%" 
                :circular="true" 
                :fullScreen="true" 
                :showItemNavigators="true"
                :showThumbnails="true"
                :closeOnEscape="true">
                <template #item="slotProps">
                    <img 
                        :src="slotProps.item.item" 
                        :alt="'Property Image'" 
                        class="w-full h-auto max-h-[85vh] object-contain" 
                        @click.stop />
                </template>
                <template #thumbnail="slotProps">
                    <img 
                        :src="slotProps.item.thumbnail" 
                        :alt="'Thumbnail'" 
                        class="w-16 h-16 object-cover cursor-pointer" />
                </template>
            </Galleria>
        </ClientOnly>
    </div>
</template>

<style scoped>
    :deep(.p-galleria){
        border : none;
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
