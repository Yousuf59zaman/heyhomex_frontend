<script setup>
useHead({ title: "Investor Strategy Report" })
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
    router.push(`/investor/property/${property.id}`)
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
    router.push("/investor/search")
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
                            After analyzing your data, we have personalized investment recommendations and property listings tailored to your investment strategy.
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
                        <i class="pi pi-chart-line text-white"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900">InvestIQ</h1>
                </div>

                <div class="mb-4">
                    <span
                        class="inline-block px-4 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-full">
                        User Type: Long-Term Investor (VRBO/Airbnb Permitted Zones)
                    </span>
                </div>

                <h2 class="text-4xl font-bold text-gray-900 mb-4">
                    Investment Strategy Report: Hawaiʻi Residential Real Estate
                </h2>

                <!-- Key Priorities Tags -->
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-medium">Key Priorities:</span>
                    <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Cap rate</span>
                    <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Rental demand</span>
                    <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Appreciation</span>
                    <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Turnover stability</span>
                    <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Neighborhood regulations</span>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-8 py-12">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-3 space-y-6">
                    <!-- Executive Summary -->
                    <section class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Executive Summary</h3>
                        <ul class="space-y-3 text-gray-900">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Strategic investment in Hawaiʻi residential properties focuses on high-demand
                                    rental markets.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Emphasis on long-term rental income, with short-term (VRBO/Airbnb) flexibility in
                                    compliant zones.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Key areas identified offer strong potential for sustained capital
                                    appreciation.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Rigorous risk analysis performed for short-term rental restrictions and tourism
                                    cycle impacts.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Personalized recommendations based on a robust Investment Fit Score of
                                    89/100.</span>
                            </li>
                        </ul>
                    </section>

                    <!-- Investor Profile & Priorities -->
                    <section class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Investor Profile & Priorities</h3>
                        <p class="mb-2">
                            <span class="font-semibold">Risk Tolerance: </span>
                            <span>Moderate to High (seeking growth with controlled exposure)</span>
                        </p>
                        <p class="mb-4">
                            <span class="font-semibold">Target ROI: </span>
                            <span>8-12% annually (blended rental income + appreciation)</span>
                        </p>

                        <p class="font-semibold mb-2">Investment Goals:</p>
                        <div class="flex flex-wrap gap-2">
                            <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Passive income
                                generation</span>
                            <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Capital preservation &
                                growth</span>
                            <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Diversification</span>
                            <span class="px-3 py-1 text-xs border border-gray-300 rounded-full">Future retirement
                                planning</span>
                        </div>
                    </section>

                    <!-- ROI Drivers -->
                    <section class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">ROI Drivers</h3>

                        <h4 class="text-lg font-medium text-gray-900 mb-3">Long-Term Rental Market Insights</h4>
                        <ul class="space-y-2 text-gray-900 mb-6">
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Oahuʻs average long-term rental rates increased by 4% in the last year.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Vacancy rates remain low (2.5%) in key urban and suburban areas due to strong
                                    demand from local residents and military personnel.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Tenant demographics show a preference for properties with modern amenities and
                                    access to local services.</span>
                            </li>
                            <li class="flex gap-3">
                                <span>•</span>
                                <span>Consistent tenant base minimizes turnover costs and ensures stable income
                                    streams.</span>
                            </li>
                        </ul>

                        <div class="border-t border-gray-200 pt-6">
                            <h4 class="text-lg font-medium text-gray-900 mb-3">Short-Term Rental (STR) Regulatory
                                Landscape</h4>
                            <ul class="space-y-2 text-gray-900">
                                <li class="flex gap-3">
                                    <span>•</span>
                                    <span>Designated STR permitted zones on Oahu offer attractive yields, especially for
                                        tourism-focused properties.</span>
                                </li>
                                <li class="flex gap-3">
                                    <span>•</span>
                                    <span>New county regulations (Bill 41, Bill 89) restrict STRs to resort-zoned areas
                                        and specific zones, crucial for compliance.</span>
                                </li>
                                <li class="flex gap-3">
                                    <span>•</span>
                                    <span>Average daily rates (ADR) for compliant STRs are significantly higher than
                                        long-term rentals.</span>
                                </li>
                                <li class="flex gap-3">
                                    <span>•</span>
                                    <span>Tourism cycles, while volatile, historically rebound strongly, offering
                                        high-yield opportunities during peak seasons.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <!-- Property Performance Outlook -->
                    <section class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Property Performance Outlook</h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-arrow-up text-green-600"></i>
                                    <p class="text-lg font-semibold">Occupancy Rate: 92%</p>
                                </div>
                                <p class="text-sm text-gray-600">Projected to remain high due to sustained demand.</p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-arrow-up text-green-600"></i>
                                    <p class="text-lg font-semibold">Rental Premium: +15%</p>
                                </div>
                                <p class="text-sm text-gray-600">Properties in permitted zones command higher rents.</p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-arrow-up text-green-600"></i>
                                    <p class="text-lg font-semibold">Resale Value: Strong</p>
                                </div>
                                <p class="text-sm text-gray-600">Consistent appreciation driven by limited inventory.
                                </p>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-minus text-gray-600"></i>
                                    <p class="text-lg font-semibold">Construction Scarcity: High</p>
                                </div>
                                <p class="text-sm text-gray-600">New development remains constrained, supporting
                                    existing property values.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Risk Analysis -->
                    <section class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Risk Analysis</h3>

                        <div class="space-y-4">
                            <div>
                                <h4 class="text-lg font-medium text-gray-900 mb-2">Short-Term Rental (STR) Regulatory
                                    Changes</h4>
                                <p class="text-gray-700">Ongoing legislative shifts can impact the legality and
                                    profitability of STRs. Compliance requires diligent monitoring and adherence to
                                    county ordinances, particularly in non-resort zones.</p>
                            </div>

                            <div>
                                <h4 class="text-lg font-medium text-gray-900 mb-2">Tourism Cycles & Economic Sensitivity
                                </h4>
                                <p class="text-gray-700">Revenue from STRs is directly tied to tourism numbers, which
                                    can be influenced by global economic conditions, travel restrictions, and natural
                                    events. Diversification or a hybrid rental model can mitigate this risk.</p>
                            </div>

                            <div>
                                <h4 class="text-lg font-medium text-gray-900 mb-2">Insurance & Property Management Costs
                                </h4>
                                <p class="text-gray-700">STR properties often incur higher insurance premiums and
                                    require more intensive property management compared to long-term rentals, impacting
                                    net operating income. Secure adequate coverage and professional management.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Investment Fit Score -->
                    <section class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Investment Fit Score</h3>

                        <div class="text-6xl font-bold text-gray-900 mb-4">89/100</div>
                        <p class="text-sm text-gray-600 mb-6">This score reflects the overall alignment of potential
                            properties with your investment profile and priorities.</p>

                        <div class="space-y-3 border-t border-gray-200 pt-4">
                            <div class="flex justify-between items-center">
                                <span class="font-medium">Alignment with Goals</span>
                                <span>95</span>
                            </div>
                            <div class="flex justify-between items-center border-t border-gray-200 pt-3">
                                <span class="font-medium">Market Potential</span>
                                <span>90</span>
                            </div>
                            <div class="flex justify-between items-center border-t border-gray-200 pt-3">
                                <span class="font-medium">Risk Mitigation</span>
                                <span>80</span>
                            </div>
                            <div class="flex justify-between items-center border-t border-gray-200 pt-3">
                                <span class="font-medium">Regulatory Compliance</span>
                                <span>92</span>
                            </div>
                        </div>
                    </section>

                    <!-- Personalized Investor Recommendations -->
                    <!-- <section class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-6">Personalized Investor Recommendations</h3>

                        <div class="space-y-6">
                            <div class="flex gap-4">
                                <div class="w-20 h-20 bg-gray-200 rounded flex-shrink-0"></div>
                                <div>
                                    <h4 class="text-lg font-medium text-gray-900 mb-1">Keolu Hills, Kailua</h4>
                                    <p class="text-sm text-gray-700">Established residential area with strong long-term
                                        rental demand. Proximity to military bases and family-friendly amenities ensures
                                        tenant stability. Limited STR options, but excellent for steady income.</p>
                                </div>
                            </div>

                            <div class="flex gap-4 border-t border-gray-200 pt-6">
                                <div class="w-20 h-20 bg-gray-200 rounded flex-shrink-0"></div>
                                <div>
                                    <h4 class="text-lg font-medium text-gray-900 mb-1">Enchanted Lake, Kailua</h4>
                                    <p class="text-sm text-gray-700">Highly sought-after community with waterfront
                                        properties. Offers a blend of high-end long-term rentals and potential for
                                        permitted STRs. Strong appreciation history.</p>
                                </div>
                            </div>

                            <div class="flex gap-4 border-t border-gray-200 pt-6">
                                <div class="w-20 h-20 bg-gray-200 rounded flex-shrink-0"></div>
                                <div>
                                    <h4 class="text-lg font-medium text-gray-900 mb-1">Maunawili, Kailua</h4>
                                    <p class="text-sm text-gray-700">Secluded, upscale neighborhood offering larger lots
                                        and luxury homes. Excellent for discerning long-term tenants seeking privacy and
                                        natural beauty. Potential for high-yield, compliant STRs.</p>
                                </div>
                            </div>
                        </div>
                    </section> -->

                    <!-- Property Listings -->
                    <section class="bg-white border border-gray-200 rounded p-6">
                        <CommonCitizenPropertyGrid
                            v-if="!loadingProperties"
                            title="Investment Opportunities"
                            :properties="properties"
                            @property-click="handlePropertyClick"
                            @favorite-toggle="handleFavoriteToggle"
                            @see-all="handleSeeAllProperties"
                        />
                        
                        <!-- Loading State -->
                        <div v-else>
                            <h2 class="text-[20px] sm:text-[24px] leading-[32px] font-semibold text-[#121A22] mb-4">
                                Investment Opportunities
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
                    <div class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-6">Quick Facts</h3>

                        <div class="space-y-4">
                            <div class="flex items-start gap-3">
                                <i class="pi pi-dollar text-gray-700 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm text-gray-600">Average Cap Rate</p>
                                    <p class="font-semibold">5.8%</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <i class="pi pi-chart-line text-gray-700 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm text-gray-600">Projected Appreciation</p>
                                    <p class="font-semibold">6.5% / year</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <i class="pi pi-home text-gray-700 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm text-gray-600">Long-Term Vacancy</p>
                                    <p class="font-semibold">2.5%</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <i class="pi pi-shield text-gray-700 mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm text-gray-600">STR Compliance</p>
                                    <p class="font-semibold">High (in selected zones)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Need Assistance -->
                    <div class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-6">Need Assistance?</h3>

                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 bg-gray-300 rounded-full relative">
                                <div
                                    class="absolute bottom-0 right-0 w-4 h-4 bg-black border-2 border-white rounded-full">
                                </div>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">Elara Vance</p>
                                <p class="text-sm text-gray-600">Senior Investment Advisor</p>
                            </div>
                        </div>

                        <button
                            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                            Contact Advisor
                        </button>
                    </div>

                    <!-- Report Actions -->
                    <div class="bg-white border border-gray-200 rounded p-6">
                        <h3 class="text-xl font-semibold text-gray-900 mb-6">Report Actions</h3>

                        <div class="space-y-3">
                            <button
                                class="w-full py-3 px-4 border-2 border-blue-600 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2">
                                <i class="pi pi-download"></i>
                                <span>Export PDF</span>
                            </button>

                            <button
                                class="w-full py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
                                <i class="pi pi-share-alt"></i>
                                <span>Share Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped>
/* Additional custom styles if needed */
</style>
