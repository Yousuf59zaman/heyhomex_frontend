<script setup>
useHead({ title: "Kamaina Lifestyle Report" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

// Load properties
const properties = ref([])
const loadingProperties = ref(true)
const router = useRouter()

const loadProperties = async () => {
    loadingProperties.value = true
    try {
        const response = await $fetchCitizen("/v1/property", {
            method: "GET",
            params: {
                category: "for_sale",
                length: 9,
            },
        })

        if (response.status === "success" && response.data?.data) {
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
            }))
        }
    } catch (e) {
        console.error("Error loading properties:", e)
    } finally {
        loadingProperties.value = false
    }
}

const handlePropertyClick = (property) => {
    router.push(`/kamaina/property/${property.id}`)
}

const handleFavoriteToggle = async (property) => {
    const prop = properties.value.find((p) => p.id === property.id)
    if (!prop) return

    const previousState = prop.isFavorited
    prop.isFavorited = !prop.isFavorited

    try {
        await $fetchCitizen(`/v1/favorite-properties/${property.id}/toggle`, {
            method: "POST",
        })
    } catch (e) {
        console.error("Error toggling favorite:", e)
        prop.isFavorited = previousState
    }
}

const handleSeeAllProperties = () => {
    router.push("/kamaina/search")
}

onMounted(() => {
    loadProperties()
})
</script>


<template>
    <div class="min-h-screen bg-white">
        <!-- AI Analysis Header -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-8 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="flex items-start gap-4 mb-4">
                    <i class="pi pi-sparkles text-3xl text-blue-600"></i>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">AI-Powered Analysis Complete</h2>
                        <p class="text-lg text-gray-700">
                            After analyzing your data, we have personalized recommendations and property listings tailored to your Kamaʻāina lifestyle preferences.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Header Section -->
        <div class="border-b border-gray-200 py-6 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="mb-4">
                    <span class="inline-block px-4 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-full">
                        Lifestyle Report
                    </span>
                </div>
                <h1 class="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                    KAMAʻĀINA (LOCAL FAMILY) PROFILE
                </h1>
                <p class="text-xl text-gray-900 mb-6">1234 Kalama Street, Kailua, HI</p>
                
                <!-- Tags -->
                <div class="flex flex-wrap gap-4 text-lg">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-gray-700"></i>
                        <span>School district</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-gray-700"></i>
                        <span>Safety</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-gray-700"></i>
                        <span>Community</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-gray-700"></i>
                        <span>Lifestyle fit</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-gray-700"></i>
                        <span>Commute</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-gray-700"></i>
                        <span>Cost of living</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-8 py-12">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-3 space-y-6">
                    <!-- Neighborhood Lifestyle Snapshot -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div class="flex items-start gap-4 mb-6">
                            <i class="pi pi-building text-2xl text-gray-700"></i>
                            <h2 class="text-2xl font-semibold text-gray-900">Neighborhood Lifestyle Snapshot</h2>
                        </div>
                        <ul class="space-y-3 text-lg text-gray-900">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Known for its vibrant community events and family-friendly atmosphere.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Proximity to world-renowned beaches and outdoor activities.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Excellent public and private school options available.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Diverse dining scene from casual eateries to fine dining.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Strong sense of local culture and Hawaiian heritage.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Well-maintained parks and recreational facilities.</span>
                            </li>
                        </ul>
                    </section>

                    <!-- School District Insights -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div class="flex items-start gap-4 mb-6">
                            <i class="pi pi-bookmark text-2xl text-gray-700"></i>
                            <h2 class="text-2xl font-semibold text-gray-900">School District Insights</h2>
                        </div>
                        
                        <div class="space-y-6">
                            <!-- School 1 -->
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-bookmark text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Kailua Elementary School</h3>
                                </div>
                                <div class="flex items-center gap-3 mb-2">
                                    <i class="pi pi-star-fill text-yellow-500"></i>
                                    <span class="text-sm">9/10</span>
                                    <span class="text-sm text-gray-600">•</span>
                                    <span class="text-sm">Public K-5</span>
                                </div>
                                <p class="text-gray-700">Highly-rated for academic excellence and diverse programs.</p>
                            </div>

                            <!-- School 2 -->
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-bookmark text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Kalaheo High School</h3>
                                </div>
                                <div class="flex items-center gap-3 mb-2">
                                    <i class="pi pi-star-fill text-yellow-500"></i>
                                    <span class="text-sm">8/10</span>
                                    <span class="text-sm text-gray-600">•</span>
                                    <span class="text-sm">Public 9-12</span>
                                </div>
                                <p class="text-gray-700">Strong athletic programs and college preparatory courses.</p>
                            </div>

                            <!-- School 3 -->
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-bookmark text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Le Jardin Academy</h3>
                                </div>
                                <div class="flex items-center gap-3 mb-2">
                                    <i class="pi pi-star-fill text-yellow-500"></i>
                                    <span class="text-sm">10/10</span>
                                    <span class="text-sm text-gray-600">•</span>
                                    <span class="text-sm">Private K-12</span>
                                </div>
                                <p class="text-gray-700">International Baccalaureate curriculum with strong arts focus.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Commute & Convenience -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div class="flex items-start gap-4 mb-6">
                            <i class="pi pi-car text-2xl text-gray-700"></i>
                            <h2 class="text-2xl font-semibold text-gray-900">Commute & Convenience</h2>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-car text-gray-700"></i>
                                    <span class="text-lg">Downtown Honolulu</span>
                                </div>
                                <span class="px-4 py-1 text-sm border border-gray-300 rounded-full">35 mins (Car)</span>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-car text-gray-700"></i>
                                    <span class="text-lg">KMCB / Pearl Harbor</span>
                                </div>
                                <span class="px-4 py-1 text-sm border border-gray-300 rounded-full">20 mins (Car)</span>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-map-marker text-gray-700"></i>
                                    <span class="text-lg">Kailua Beach Park</span>
                                </div>
                                <span class="px-4 py-1 text-sm border border-gray-300 rounded-full">5 mins (Bike)</span>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-shopping-cart text-gray-700"></i>
                                    <span class="text-lg">Local Grocery Store</span>
                                </div>
                                <span class="px-4 py-1 text-sm border border-gray-300 rounded-full">3 mins (Walking)</span>
                            </div>
                        </div>
                    </section>

                    <!-- Daily Living & Culture -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div class="flex items-start gap-4 mb-6">
                            <i class="pi pi-shopping-bag text-2xl text-gray-700"></i>
                            <h2 class="text-2xl font-semibold text-gray-900">Daily Living & Culture</h2>
                        </div>
                        
                        <div class="space-y-6">
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-sun text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Lanikai Pillbox Hike</h3>
                                </div>
                                <p class="text-gray-700">Iconic sunrise hike with panoramic views of Mokulua Islands.</p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-shopping-cart text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Kailua Farmers Market</h3>
                                </div>
                                <p class="text-gray-700">Fresh local produce and artisan crafts every Thursday.</p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-image text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Local Art Galleries</h3>
                                </div>
                                <p class="text-gray-700">Discover unique Hawaiian art and cultural pieces.</p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-megaphone text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Annual May Day Lei Festival</h3>
                                </div>
                                <p class="text-gray-700">A celebration of Hawaiian culture with lei making and hula.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Recreation & Outdoor Life -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div class="flex items-start gap-4 mb-6">
                            <i class="pi pi-heart text-2xl text-gray-700"></i>
                            <h2 class="text-2xl font-semibold text-gray-900">Recreation & Outdoor Life</h2>
                        </div>
                        
                        <div class="space-y-6">
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-heart text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Kailua Beach</h3>
                                </div>
                                <p class="text-sm text-gray-600 mb-1">Beach</p>
                                <p class="text-gray-700">Miles of soft white sand, perfect for swimming and windsurfing.</p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-globe text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Maunawili Falls Trail</h3>
                                </div>
                                <p class="text-sm text-gray-600 mb-1">Hiking</p>
                                <p class="text-gray-700">Lush rainforest hike leading to a beautiful waterfall and swimming hole.</p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-star text-xl text-gray-700"></i>
                                    <h3 class="text-xl font-medium text-gray-900">Kalama Beach Park</h3>
                                </div>
                                <p class="text-sm text-gray-600 mb-1">Park</p>
                                <p class="text-gray-700">Oceanfront park with playgrounds, picnic areas, and paddleboarding access.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Lifestyle Fit Score -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div class="flex items-start gap-4 mb-6">
                            <i class="pi pi-star text-2xl text-gray-700"></i>
                            <h2 class="text-2xl font-semibold text-gray-900">Lifestyle Fit Score</h2>
                        </div>
                        
                        <div class="text-center my-8">
                            <div class="text-6xl font-bold text-gray-900">95</div>
                            <div class="text-xl text-gray-600">/100</div>
                        </div>
                        
                        <p class="text-center text-xl text-gray-900">
                            This neighborhood is an excellent match for your family's lifestyle!
                        </p>
                    </section>

                    <!-- Personalized Recommendations -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div class="flex items-start gap-4 mb-6">
                            <i class="pi pi-building text-2xl text-gray-700"></i>
                            <h2 class="text-2xl font-semibold text-gray-900">Personalized Recommendations</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="text-center">
                                <div class="w-full h-32 bg-gray-200 rounded-md mb-4"></div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Lanikai</h3>
                                <p class="text-sm text-gray-700">Exclusive beach community with stunning ocean views.</p>
                            </div>
                            
                            <div class="text-center">
                                <div class="w-full h-32 bg-gray-200 rounded-md mb-4"></div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Waimanalo</h3>
                                <p class="text-sm text-gray-700">Relaxed rural feel with expansive, pristine beaches.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Property Listings -->
                    <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <CommonCitizenPropertyGrid
                            v-if="!loadingProperties"
                            title="Recommended Properties"
                            :properties="properties"
                            @property-click="handlePropertyClick"
                            @favorite-toggle="handleFavoriteToggle"
                            @see-all="handleSeeAllProperties"
                        />
                        
                        <!-- Loading State -->
                        <div v-else>
                            <h2 class="text-[20px] sm:text-[24px] leading-[32px] font-semibold text-[#121A22] mb-4">
                                Recommended Properties
                            </h2>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div v-for="i in 6" :key="i" class="animate-pulse">
                                    <div class="bg-white p-3 rounded-[8px] border border-[#D9D9D9]">
                                        <div class="w-full h-[200px] bg-gray-200 rounded-[10px] mb-4"></div>
                                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Quick Facts -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-6">Quick Facts</h3>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700">Median Home Price</span>
                                <span class="font-semibold">$1.5M</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700">Avg. Household Income</span>
                                <span class="font-semibold">$120K</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700">Population Density</span>
                                <span class="font-semibold">Moderate</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700">Property Tax Rate</span>
                                <span class="font-semibold">0.29%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Agent -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-6">Contact Agent</h3>
                        
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 bg-gray-300 rounded-full"></div>
                            <div>
                                <p class="font-semibold text-gray-900">Jessica Lee</p>
                                <p class="text-sm text-gray-600">Local Real Estate Agent</p>
                            </div>
                        </div>
                        
                        <button class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                            Contact Agent
                        </button>
                    </div>

                    <!-- Share / Export -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-6">Share / Export</h3>
                        
                        <button class="w-full py-3 px-4 border-2 border-blue-600 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2">
                            <i class="pi pi-share-alt"></i>
                            <span>Share / Export</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped>
/* Additional custom styles if needed */
</style>
