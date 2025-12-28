<script setup>
const props = defineProps({
    placementSlug: {
        type: String,
        required: true
    },
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: 'auto'
    },
    className: {
        type: String,
        default: ''
    }
});

const advertisements = ref([]);
const currentAdIndex = ref(0);
const isLoading = ref(false);
const hasTrackedImpression = ref(false);

const currentAd = computed(() => {
    return advertisements.value[currentAdIndex.value] || null;
});

const loadAdvertisements = async () => {
    isLoading.value = true;
    try {
        // First get the placement ID by slug
        const placementsResponse = await $fetchCitizen('advertiser/advertisements/ads-places/list', {
            method: 'GET'
        });

        const placement = placementsResponse.data?.data?.find(
            p => p.slug === props.placementSlug
        );

        if (!placement) {
            console.warn('Placement not found:', props.placementSlug);
            return;
        }

        // Then fetch advertisements for this placement
        const adsResponse = await $fetchCitizen(
            `advertiser/advertisements/by-place/${placement.id}`,
            {
                method: 'GET'
            }
        );

        if (adsResponse.data?.data) {
            advertisements.value = adsResponse.data.data.filter(ad => ad.is_active);
            
            // Start rotation if multiple ads
            if (advertisements.value.length > 1) {
                startRotation();
            }
        }
    } catch (e) {
        console.error('Error loading advertisements:', e.message);
    } finally {
        isLoading.value = false;
    }
};

const trackImpression = async (adId) => {
    try {
        await $fetchCitizen(`advertiser/advertisements/${adId}/impression`, {
            method: 'POST'
        });
    } catch (e) {
        console.error('Error tracking impression:', e.message);
    }
};

const trackClick = async (adId) => {
    try {
        await $fetchCitizen(`advertiser/advertisements/${adId}/click`, {
            method: 'POST'
        });
    } catch (e) {
        console.error('Error tracking click:', e.message);
    }
};

const handleAdClick = async () => {
    if (!currentAd.value) return;

    // Track click
    await trackClick(currentAd.value.id);

    // Redirect to URL
    if (currentAd.value.redirect_url) {
        window.open(currentAd.value.redirect_url, '_blank');
    }
};

const startRotation = () => {
    setInterval(() => {
        currentAdIndex.value = (currentAdIndex.value + 1) % advertisements.value.length;
        hasTrackedImpression.value = false;
    }, 10000); // Rotate every 10 seconds
};

// Track impression when ad is visible
const adElement = ref(null);
const observer = ref(null);

onMounted(() => {
    loadAdvertisements();

    // Setup intersection observer for impression tracking
    if (process.client) {
        observer.value = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && currentAd.value && !hasTrackedImpression.value) {
                        trackImpression(currentAd.value.id);
                        hasTrackedImpression.value = true;
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (adElement.value) {
            observer.value.observe(adElement.value);
        }
    }
});

onBeforeUnmount(() => {
    if (observer.value && adElement.value) {
        observer.value.unobserve(adElement.value);
    }
});

watch(currentAd, () => {
    hasTrackedImpression.value = false;
});
</script>

<template>
    <div 
        v-if="currentAd" 
        ref="adElement"
        :class="className"
        :style="{ width, height }"
        class="advertisement-container"
    >
        <div 
            class="advertisement-content cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden rounded-lg shadow-sm"
            @click="handleAdClick"
        >
            <!-- Image Ad -->
            <img 
                v-if="currentAd.type === 1" 
                :src="currentAd.media_url" 
                :alt="currentAd.title"
                class="w-full h-full object-cover"
            />

            <!-- Video Ad -->
            <video 
                v-else-if="currentAd.type === 2"
                :src="currentAd.media_url"
                class="w-full h-full object-cover"
                autoplay
                loop
                muted
            />

            <!-- Ad Label -->
            <div class="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Ad
            </div>

            <!-- Ad Title Overlay -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h4 class="text-white text-sm font-semibold">{{ currentAd.title }}</h4>
                <p v-if="currentAd.description" class="text-white text-xs opacity-90 mt-1">
                    {{ currentAd.description.substring(0, 50) }}{{ currentAd.description.length > 50 ? '...' : '' }}
                </p>
            </div>
        </div>

        <!-- Rotation Indicator -->
        <div v-if="advertisements.length > 1" class="flex justify-center gap-1 mt-2">
            <div 
                v-for="(ad, index) in advertisements" 
                :key="ad.id"
                :class="index === currentAdIndex ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'"
                class="w-2 h-2 rounded-full transition-colors"
            />
        </div>
    </div>
</template>

<style scoped>
.advertisement-container {
    position: relative;
    display: block;
}

.advertisement-content {
    background-color: #e5e7eb;
}

.dark .advertisement-content {
    background-color: #374151;
}
</style>
