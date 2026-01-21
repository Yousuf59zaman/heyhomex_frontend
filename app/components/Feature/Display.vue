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

const features = ref([]);
const currentAdIndex = ref(0);
const isLoading = ref(false);
const hasTrackedImpression = ref(false);

const currentAd = computed(() => {
    return features.value[currentAdIndex.value] || null;
});

const loadFeatures = async () => {
    isLoading.value = true;
    try {

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


        const adsResponse = await $fetchCitizen(
            `advertiser/advertisements/by-place/${placement.id}`,
            {
                method: 'GET'
            }
        );
            console.log("ciming aDS",adsResponse.data.data);
        if (adsResponse.data?.data) {
            features.value = adsResponse.data.data.filter(ad => ad.is_active);
            

            if (features.value.length > 1) {
                startRotation();
            }
        }
    } catch (e) {
        console.error('Error loading features:', e.message);
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


    await trackClick(currentAd.value.id);


    if (currentAd.value.redirect_url) {
        window.open(currentAd.value.redirect_url, '_blank');
    }
};

const startRotation = () => {
    setInterval(() => {
        currentAdIndex.value = (currentAdIndex.value + 1) % features.value.length;
        hasTrackedImpression.value = false;
    }, 10000);
};


const adElement = ref(null);
const observer = ref(null);

const setupIntersectionObserver = () => {
    if (!process.client) return;


    if (observer.value && adElement.value) {
        observer.value.unobserve(adElement.value);
    }


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


    nextTick(() => {
        if (adElement.value) {
            observer.value.observe(adElement.value);
        }
    });
};

onMounted(async () => {
    await loadFeatures();


    setupIntersectionObserver();
});

onBeforeUnmount(() => {
    if (observer.value && adElement.value) {
        observer.value.unobserve(adElement.value);
    }
});

watch(currentAd, async (newAd, oldAd) => {
    hasTrackedImpression.value = false;


    if (newAd && process.client) {
        await nextTick();


        if (adElement.value) {
            const rect = adElement.value.getBoundingClientRect();
            const isVisible = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );

            if (isVisible) {
                trackImpression(newAd.id);
                hasTrackedImpression.value = true;
            }
        }
    }
});
</script>

<template>
    <div v-if="currentAd" ref="adElement" :class="className" :style="{ width, height }" class="feature-container">
        <div class="feature-content cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden rounded-lg shadow-sm"
            @click="handleAdClick">

            <img v-if="currentAd.type === 1" :src="currentAd.media_path" :alt="currentAd.title"
                class="w-full h-full object-cover" />


            <video v-else-if="currentAd.type === 2" :src="currentAd.media_path" class="w-full h-full object-cover"
                autoplay loop muted />


            <!-- <div v-if="currentAd.type == 1" class="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Ads
            </div> -->


            <!-- <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h4 class="text-white text-sm font-semibold">{{ currentAd.title }}</h4>
                <p v-if="currentAd.description" class="text-white text-xs opacity-90 mt-1">
                    {{ currentAd.description.substring(0, 50) }}{{ currentAd.description.length > 50 ? '...' : '' }}
                </p>
            </div> -->
        </div>


        <div v-if="features.length > 1" class="flex justify-center gap-1 mt-2">
            <div v-for="(ad, index) in features" :key="ad.id"
                :class="index === currentAdIndex ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'"
                class="w-2 h-2 rounded-full transition-colors" />
        </div>
    </div>
</template>

<style scoped>
.feature-container {
    position: relative;
    display: block;
}

.feature-content {
    background-color: #e5e7eb;
}

.dark .feature-content {
    background-color: #374151;
}
</style>
