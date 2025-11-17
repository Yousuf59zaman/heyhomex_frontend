<script setup>
    import { useVideoPlayer } from '~/composables/useVideoPlayer';

    definePageMeta({
        layout: 'citizen',
    });

    const demoVideoUrl = 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8';

    const { openVideo } = useVideoPlayer();

    // Get route parameters
    const route = useRoute();
    const propertyId = route.params.id;

    // Active tab state
    const activeTab = ref('Insights');

    // Mock property data (in real app, this would come from API)
    const propertyData = ref({
        id: propertyId,
        title: '123 Aloha Lane - 3BR Full Eligible Home near Pearl Harbor, Honolulu',
        address: '123 Aloha Lane, Honolulu, HI 96818',
        price: 475000,
        beds: 5,
        baths: 3,
        sqft: '1800sqft',
    });

    // Agent data
    const agentData = ref({
        name: 'John Doeh',
        initials: 'JD',
        avatar: null, // Will use initials if no image
    });

    // Contact form data
    const contactForm = ref({
        fullName: '',
        message: '',
    });

    // Tour time
    const tourTime = ref('Today 3:45');

    // Methods
    const submitContactForm = () => {
        // Handle contact form submission
        console.log('Contact form submitted:', contactForm.value);
        // Reset form or show success message
    };

    const bookTour = () => {
        // Handle tour booking
        console.log('Tour booking requested for:', tourTime.value);
        // Show success message or redirect
    };

    const propertyImage = computed(
        () => `/images/dashboard/${propertyId || '1'}.png`
    );

    // Videos data
    const videos = ref([
        {
            id: 1,
            title: 'These are the best Places to Live in Oahu,Hawaii for...',
            description:
                'These are the best Places to Live in Oahu,Hawaii for...',
            thumbnail: '/images/dashboard/video/1.png',
            duration: '10:33',
            channelName: 'Hello Hawaii',
            channelInitial: 'H',
            views: '53K Views',
            timeAgo: '5 Months ago',
            videoUrl: demoVideoUrl,
        },
        {
            id: 2,
            title: 'These are the best Places to Live in Oahu,Hawaii for...',
            description:
                'These are the best Places to Live in Oahu,Hawaii for...',
            thumbnail: '/images/dashboard/video/2.png',
            duration: '5:25',
            channelName: 'Hello Hawaii',
            channelInitial: 'H',
            views: '53K Views',
            timeAgo: '5 Months ago',
            videoUrl: demoVideoUrl,
        },
        {
            id: 3,
            title: 'These are the best Places to Live in Oahu,Hawaii for...',
            description:
                'These are the best Places to Live in Oahu,Hawaii for...',
            thumbnail: '/images/dashboard/video/3.png',
            duration: '5:25',
            channelName: 'Hello Hawaii',
            channelInitial: 'H',
            views: '53K Views',
            timeAgo: '5 Months ago',
            videoUrl: demoVideoUrl,
        },
        {
            id: 4,
            title: 'These are the best Places to Live in Oahu,Hawaii for...',
            description:
                'These are the best Places to Live in Oahu,Hawaii for...',
            thumbnail: '/images/dashboard/video/1.png',
            duration: '5:25',
            channelName: 'Hello Hawaii',
            channelInitial: 'H',
            views: '53K Views',
            timeAgo: '5 Months ago',
            videoUrl: demoVideoUrl,
        },
    ]);

    const playSidebarVideo = (video) => {
        openVideo(video, videos.value);
    };

    // Ad configuration for VAST video advertising
    const adConfig = ref({
        "client": "vast",
        "schedule": [
            {
                "offset": "pre",
                "tag": "http://localhost:3000/ads/pre-roll-ad.xml",
                "type": "linear"
            },
            {
                "offset": "50%",
                "tag": "http://localhost:3000/ads/mid-roll-ad.xml",
                "type": "linear"
            },
            {
                "offset": "post",
                "tag": "http://localhost:3000/ads/post-roll-ad.xml",
                "type": "linear"
            }
        ],
        "skipoffset": 5,
        "admessage": "This ad will end in xx seconds",
        "skipmessage": "Skip ad",
        "vpaidcontrols": true,
        "autoplayadsmuted": false
    });

    // Tab content data
    const tabInsights = ref({
        title: 'Insights',
        subtitle:
            'Real-life suitability for Hawaii residents and local families.',
        downloadButtonText: 'Download Local Living Snapshot',
        items: [
            {
                id: 1,
                label: 'Public School Rating',
                value: '7/10 — Rated "Above Average" by DOE',
            },
            {
                id: 2,
                label: 'Zoning Info',
                value: 'Zoned for Moanalua Middle & High School',
            },
            {
                id: 3,
                label: 'Commute to Work Centers',
                value: '15 min to Downtown Honolulu & 20 min to Kapolei',
            },
            {
                id: 4,
                label: 'Community Vibe',
                value: "Quiet, close-knit 'ohana neighborhood",
            },
            {
                id: 5,
                label: 'Local Culture & Events',
                value: '2 mins to Aloha Stadium Night Market Nearby hula halau',
            },
            {
                id: 6,
                label: 'Ohana-Friendly Features',
                value: 'Fenced yard, in-law suite potential, large lanai',
            },
            {
                id: 7,
                label: 'Nearby Services',
                value: '3 mins to grocery, 5 mins to urgent care & pharmacy',
            },
            {
                id: 8,
                label: 'Energy Cost Estimate',
                value: 'Avg $290/mo (no solar) — Solar setup viable',
            },
        ],
    });

    const tabFeatures = ref({
        title: 'Features & Advantages',
        items: [
            {
                id: 1,
                icon: 'lucide:clock',
                text: '7 Min From Pearl Harbor',
            },
            {
                id: 2,
                icon: 'lucide:shield-check',
                text: 'VA Approved',
            },
            {
                id: 3,
                icon: 'lucide:shield',
                text: 'High Security Zone',
            },
            {
                id: 4,
                icon: 'lucide:graduation-cap',
                text: 'Near Military Schools',
            },
            {
                id: 5,
                icon: 'lucide:building',
                text: 'Close To NEX & Commissary',
            },
        ],
    });

    const tabMaps = ref({
        title: 'Location & Maps',
        placeholder: 'Interactive map will be displayed here',
    });

    // Insights data (for sidebar)
    const insights = ref([
        {
            id: 1,
            label: 'Public School Rating',
            value: '7/10',
            description: '= Above "Great Average" by 60k',
        },
        {
            id: 2,
            label: 'Crime Info',
            value: 'Based at Honolulu & Oahu',
            description: '3 mil-to-island',
        },
        {
            id: 3,
            label: 'Commute to Work Distance',
            value: '13 mile to Downtown Honolulu',
            description: '+ 10 min to Travel',
        },
        {
            id: 4,
            label: 'Local Livability Index',
            value: 'B- (Good)',
            description: 'Other Rank: Senior neighborhoods',
        },
        {
            id: 5,
            label: 'Property Nearby Facilities',
            value: 'Corner to 5th Means & Oui',
            description: '10 steps',
        },
        {
            id: 6,
            label: 'Nearby Services',
            value: '4 close to groceries',
            description: '6 close to retail catch &',
        },
        {
            id: 7,
            label: 'Energy Cost Estimate',
            value: 'Avg $375/mo inc elect',
            description: '+ Solar partial',
        },
    ]);
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Main Content -->
        <div class="flex flex-col lg:flex-row mx-auto p-4 gap-6 max-w-7xl">
            <!-- Left Column - Property Details -->
            <div class="flex-1">
                <!-- Property Images Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <!-- Main Large Image -->
                    <div class="relative h-full order-1">
                        <img
                            :src="propertyImage"
                            :alt="propertyData.title"
                            class="w-full h-48 md:h-64 object-cover rounded-lg" />
                    </div>

                    <!-- Right Side Images Grid - Hidden on mobile, shows on md+ -->
                    <div
                        class="hidden md:grid grid-rows-2 gap-2 h-full order-2">
                        <!-- Top Right Image -->
                        <div class="relative h-full">
                            <img
                                src="/images/dashboard/2.png"
                                alt="Property Image 2"
                                class="w-full h-32 object-cover rounded-lg" />
                        </div>
                        <!-- Bottom Right Image with See All Photos overlay -->
                        <div class="relative h-32">
                            <img
                                src="/images/dashboard/3.png"
                                alt="Property Image 3"
                                class="w-full h-32 object-cover rounded-lg" />
                            <!-- See All Photos Overlay -->
                            <div
                                class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                                <div class="text-white text-center">
                                    <div class="text-sm font-medium">
                                        See All 16 Photos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Image Thumbnails -->
                    <div class="md:hidden flex gap-2 order-3">
                        <div class="relative flex-1">
                            <img
                                src="/images/dashboard/2.png"
                                alt="Property Image 2"
                                class="w-full h-20 object-cover rounded-lg" />
                        </div>
                        <div class="relative flex-1">
                            <img
                                src="/images/dashboard/3.png"
                                alt="Property Image 3"
                                class="w-full h-20 object-cover rounded-lg" />
                            <!-- See All Photos Overlay -->
                            <div
                                class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                                <div class="text-white text-center">
                                    <div class="text-xs font-medium">
                                        See All 16 Photos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Info Section -->
                <div class="mb-6">
                    <!-- Mobile Location -->
                    <div class="flex items-start mb-4 md:hidden">
                        <Icon
                            name="lucide:map-pin"
                            class="w-4 h-4 mt-1 mr-2 text-gray-600" />
                        <span class="text-sm text-gray-600">
                            {{ propertyData.address }}
                        </span>
                    </div>

                    <!-- Property Title and Price -->
                    <div
                        class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div class="flex-1 mb-4 md:mb-0">
                            <!-- Desktop Location -->
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

                    <!-- Action Buttons -->
                    <div
                        class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <h1
                            class="text-xl md:text-md max-w-sm font-bold text-gray-900 mb-2">
                            {{ propertyData.title }}
                        </h1>
                        <button
                            class="w-full md:w-auto bg-gray-900 text-white px-6 py-3 md:py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                            Claim This Home
                        </button>
                        <button
                            class="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors self-center md:self-auto">
                            <Icon
                                name="lucide:heart"
                                class="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div class="bg-white rounded-lg p-3 md:p-3">
                        <!-- Property Stats -->
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
                                    {{ propertyData.sqft.replace('sqft', '') }}
                                </div>
                                <div class="text-xs md:text-sm text-gray-600">
                                    Sqft
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="py-4 md:pt-6">
                            <p
                                class="text-gray-700 leading-relaxed text-sm mb-4">
                                Welcome to your next mission-ready home — a
                                perfect fit for military life on O'ahu. Located
                                just 7 minutes from Pearl Harbor and Hickam Air
                                Force Base, this spacious 3-bedroom, 2-bath
                                residence offers comfort, convenience, and
                                community for you and your family. Step inside
                                to find a thoughtfully designed interior with
                                hardwood flooring, a fully updated kitchen with
                                quartz countertops, and a bright open-concept
                                living space. The central A/C keeps you cool
                                year-round, while the large windows...
                            </p>
                            <button
                                class="text-gray-900 font-medium hover:underline text-sm">
                                See More...
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tab Navigation -->
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

                    <!-- Insights Tab -->
                    <div
                        v-if="activeTab === 'Insights'"
                        class="bg-gray-50 bg-white rounded-lg p-6">
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

                        <!-- Download Button -->
                        <div class="mt-6 text-right">
                            <button
                                class="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                {{ tabInsights.downloadButtonText }}
                            </button>
                        </div>
                    </div>

                    <!-- Features Tab -->
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

                    <!-- Maps Tab -->
                    <div
                        v-if="activeTab === 'Maps'"
                        class="bg-white p-3">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">
                            {{ tabMaps.title }}
                        </h3>
                        <div class="bg-gray-100 rounded-lg p-8 text-center">
                            <p class="text-gray-600">
                                {{ tabMaps.placeholder }}
                            </p>
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
                    <div class="p-4 space-y-4">
                        <div
                            v-for="video in videos"
                            :key="video.id"
                            class="group cursor-pointer"
                            @click="playSidebarVideo(video)">
                            <!-- Video Thumbnail -->
                            <div class="relative w-full h-32 mb-3">
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
                                class="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-md text-sm font-medium transition-colors border-0" />
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
                            class="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-md text-sm font-medium transition-colors border-0" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Video Player Modal with Ads -->
        <ClientOnly>
            <VideoPlayerModal :adConfig="adConfig" />
        </ClientOnly>
    </div>
</template>

<style scoped>
    /* Property details styles */
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Video thumbnail height for full width layout */
    .h-32 {
        height: 8rem; /* 128px */
    }

    /* Ensure proper line height for video titles */
    .leading-tight {
        line-height: 1.25;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
        /* Ensure mobile images don't overflow */
        .order-3 {
            width: 100%;
        }

        /* Adjust video thumbnails for mobile */
        .h-32 {
            height: 6rem; /* 96px on mobile */
        }

        /* Mobile tab button adjustments */
        .overflow-x-auto::-webkit-scrollbar {
            display: none;
        }
        .overflow-x-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    }

    /* Tablet and up styles */
    @media (min-width: 769px) {
        /* Restore full height for larger screens */
        .h-32 {
            height: 8rem; /* 128px */
        }
    }
</style>
