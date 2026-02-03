<script setup>
useHead({ title: "Military Relocation Report" })
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
    router.push(`/military/property/${property.id}`)
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
    router.push("/military/search")
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
                            After analyzing your data, we have personalized recommendations and property listings tailored to your military relocation needs.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Header Section -->
        <div class="border-b border-gray-200 py-6 px-8">
            <div class="max-w-7xl mx-auto">
                <!-- Logo -->
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-9 h-9 bg-gray-400 rounded flex items-center justify-center">
                        <i class="pi pi-compass text-white"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900">ReloReport</h1>
                </div>

                <div class="mb-4">
                    <h2 class="text-3xl font-bold text-gray-900">Lifestyle Report — MILITARY RELOCATION PROFILE</h2>
                    <p class="text-lg text-gray-900 mt-2">Oahu, Hawaii (MCBH, Hickam, Schofield)</p>
                </div>

                <p class="text-sm text-gray-600 text-right mb-4">Active Duty Family with Young Children</p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 text-xs border border-black rounded flex items-center gap-1">
                        <i class="pi pi-shield"></i>
                        Safety
                    </span>
                    <span class="px-3 py-1 text-xs border border-black rounded flex items-center gap-1">
                        <i class="pi pi-clock"></i>
                        Commute Time
                    </span>
                    <span class="px-3 py-1 text-xs border border-black rounded flex items-center gap-1">
                        <i class="pi pi-users"></i>
                        Kid-Friendly
                    </span>
                    <span class="px-3 py-1 text-xs border border-black rounded flex items-center gap-1">
                        <i class="pi pi-wallet"></i>
                        Budget Predictability
                    </span>
                    <span class="px-3 py-1 text-xs border border-black rounded flex items-center gap-1">
                        <i class="pi pi-home"></i>
                        Base Access
                    </span>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-8 py-12">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-3 space-y-6">
                    <!-- Military-Ready Neighborhood Snapshot -->
                    <section class="bg-white rounded shadow-sm p-8">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Military-Ready Neighborhood Snapshot</h3>
                        <p class="text-gray-900 mb-4">
                            Kailua, on Oahuʻs Windward Coast, consistently ranks high for military families seeking a
                            blend of community, convenience, and stunning natural beauty. Its proximity to MCBH Kaneohe
                            Bay makes it a top choice, offering a laid-back lifestyle with essential amenities.
                        </p>
                        <ul class="space-y-2 text-gray-900">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Strong military presence and supportive community network.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Diverse housing options, from single-family homes to townhouses.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Vibrant local economy with shops, restaurants, and services.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Excellent recreational opportunities: beaches, hiking, parks.</span>
                            </li>
                        </ul>
                    </section>

                    <!-- Commute Times to Bases -->
                    <section class="bg-white rounded shadow-sm p-8">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Commute Times to Bases</h3>

                        <div class="space-y-4">
                            <div class="flex justify-between items-center border-b border-gray-200 pb-4">
                                <span class="font-medium text-gray-900">MCBH Kaneohe Bay</span>
                                <span class="text-gray-900">15-25 min</span>
                            </div>

                            <div class="flex justify-between items-center border-b border-gray-200 pb-4">
                                <span class="font-medium text-gray-900">Hickam / Pearl Harbor</span>
                                <span class="text-gray-900">30-45 min</span>
                            </div>

                            <div class="flex justify-between items-center">
                                <span class="font-medium text-gray-900">Schofield Barracks</span>
                                <span class="text-gray-900">40-60 min</span>
                            </div>
                        </div>
                    </section>

                    <!-- Safety & Stability -->
                    <section class="bg-white rounded shadow-sm p-8">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Safety & Stability</h3>
                        <p class="text-gray-900 mb-4">
                            Kailua boasts a lower crime rate compared to the Honolulu metro average, contributing to a
                            secure environment for families. The strong sense of community and active neighborhood watch
                            programs enhance local stability.
                        </p>
                        <ul class="space-y-2 text-gray-900">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Low property and violent crime rates, frequently ranked among Oahuʻs safest
                                    communities.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Strong community engagement with local events and support groups.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Well-developed infrastructure and emergency services.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Proximity to Tripler Army Medical Center provides robust healthcare access.</span>
                            </li>
                        </ul>
                    </section>

                    <!-- Education & Childcare -->
                    <section class="bg-white rounded shadow-sm p-8">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Education & Childcare</h3>
                        <p class="text-gray-900 mb-4">
                            **Notes:** Kailua falls within the Hawaii Department of Education system, offering several
                            highly-rated public schools. On-base childcare options are also available, and private
                            schools offer diverse educational philosophies.
                        </p>

                        <h4 class="text-lg font-medium text-gray-900 mb-3">Key Benefits:</h4>
                        <ul class="space-y-2 text-gray-900">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Access to well-regarded public schools like Kailua Elementary and Kailua High
                                    School.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Multiple private school choices including Le Jardin Academy.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>On-base childcare facilities (e.g., CDC at MCBH) often prioritized for active duty
                                    families.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Numerous accredited private preschools and daycares.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Extracurricular activities and youth sports leagues are abundant.</span>
                            </li>
                        </ul>
                    </section>

                    <!-- PCS-Friendly Features -->
                    <section class="bg-white rounded shadow-sm p-8">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-4">PCS-Friendly Features</h3>
                        <ul class="space-y-2 text-gray-900">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Dedicated military housing assistance offices simplify the home search.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Extensive military spouse employment resources and networking events.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Access to comprehensive on-base services: commissaries, exchanges, MWR.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Local businesses offering military discounts and appreciation programs.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Vibrant online and in-person military spouse support networks.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Streamlined vehicle registration and driverʻs license transfer processes for
                                    service members.</span>
                            </li>
                        </ul>
                    </section>

                    <!-- Personalized Recommendations -->
                    <section class="bg-white rounded shadow-sm p-8">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
                        <p class="text-gray-900 mb-4">
                            Based on your priorities as an Active Duty Family with Young Children, Kailua presents an
                            excellent fit. Its combination of safety, community, and access to essential services aligns
                            perfectly with your relocation needs.
                        </p>
                        <ul class="space-y-2 text-gray-900">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span><strong>Explore Kailua Beach Park:</strong> Ideal for family outings, swimming,
                                    and outdoor activities.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span><strong>Connect with MCBH Family Services:</strong> They offer resources for
                                    housing, childcare, and spouse employment.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span><strong>Visit local schools:</strong> Arrange tours for Kailua Elementary or other
                                    preferred institutions.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span><strong>Join local community groups:</strong> Enhance your integration into the
                                    Kailua neighborhood.</span>
                            </li>
                        </ul>
                    </section>

                    <!-- Property Listings -->
                    <section class="bg-white rounded shadow-sm p-8">
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
                    <!-- Lifestyle Fit Score -->
                    <div class="bg-white rounded shadow-sm border border-black p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Lifestyle Fit Score</h3>

                        <div class="border border-black w-28 h-28 mx-auto flex items-center justify-center mb-4">
                            <div class="text-center">
                                <div class="text-5xl font-bold text-gray-900">93</div>
                                <div class="text-xl text-gray-900">/100</div>
                            </div>
                        </div>

                        <p class="text-sm text-center text-gray-900">
                            This score reflects the alignment of Oahuʻs lifestyle with your familyʻs priorities.
                        </p>
                    </div>

                    <!-- Quick Facts -->
                    <div class="bg-white rounded shadow-sm border border-black p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Quick Facts</h3>

                        <div class="space-y-4">
                            <div class="flex items-start gap-3 border-b border-gray-200 pb-3">
                                <i class="pi pi-users text-gray-700 mt-1"></i>
                                <div class="flex-1 flex justify-between">
                                    <span class="text-sm text-gray-900">Population</span>
                                    <span class="font-medium text-sm">39,000</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3 border-b border-gray-200 pb-3">
                                <i class="pi pi-home text-gray-700 mt-1"></i>
                                <div class="flex-1 flex justify-between">
                                    <span class="text-sm text-gray-900">Median Home Price</span>
                                    <span class="font-medium text-sm">$1,200,000</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3 border-b border-gray-200 pb-3">
                                <i class="pi pi-building text-gray-700 mt-1"></i>
                                <div class="flex-1 flex justify-between">
                                    <span class="text-sm text-gray-900">Average Rent (3-bed)</span>
                                    <span class="font-medium text-sm">$3,500</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3 border-b border-gray-200 pb-3">
                                <i class="pi pi-chart-line text-gray-700 mt-1"></i>
                                <div class="flex-1">
                                    <div class="flex justify-between mb-1">
                                        <span class="text-sm text-gray-900">Cost of Living Index</span>
                                    </div>
                                    <span class="font-medium text-sm">185 (US Avg: 100)</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3 border-b border-gray-200 pb-3">
                                <i class="pi pi-sun text-gray-700 mt-1"></i>
                                <div class="flex-1 flex justify-between">
                                    <span class="text-sm text-gray-900">Annual Sunny Days</span>
                                    <span class="font-medium text-sm">271</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3 border-b border-gray-200 pb-3">
                                <i class="pi pi-users text-gray-700 mt-1"></i>
                                <div class="flex-1 flex justify-between">
                                    <span class="text-sm text-gray-900">Childcare Options</span>
                                    <span class="font-medium text-sm">High</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <i class="pi pi-shopping-cart text-gray-700 mt-1"></i>
                                <div class="flex-1 flex justify-between">
                                    <span class="text-sm text-gray-900">Local Eateries</span>
                                    <span class="font-medium text-sm">80+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact an Expert -->
                    <div class="bg-white rounded shadow-sm border border-black p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Contact an Expert</h3>
                        <p class="text-gray-900 mb-6">
                            Ready to take the next step? Our relocation specialists are here to help.
                        </p>

                        <div class="space-y-3">
                            <button
                                class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                                <i class="pi pi-phone"></i>
                                <span>Call Us Today</span>
                            </button>

                            <button
                                class="w-full py-3 px-4 border-2 border-blue-600 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2">
                                <i class="pi pi-envelope"></i>
                                <span>Email a Specialist</span>
                            </button>
                        </div>
                    </div>

                    <!-- Share & Export Options -->
                    <div class="bg-white rounded shadow-sm border border-black p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Share & Export Options</h3>

                        <div
                            class="border border-gray-200 rounded p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                            <div class="flex items-center gap-3">
                                <i class="pi pi-share-alt"></i>
                                <span class="text-sm">Share Report</span>
                            </div>
                            <i class="pi pi-ellipsis-v text-gray-600"></i>
                        </div>

                        <div class="mt-4">
                            <button class="w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
                                <i class="pi pi-download text-gray-700"></i>
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped></style>
