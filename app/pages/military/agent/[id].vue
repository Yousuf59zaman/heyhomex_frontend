<script setup>
definePageMeta({
    layout: 'citizen',
    middleware: ['auth-citizen']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { citizen_user } = citizenAuth()

const agentId = route.params.id
const agentData = ref(null)
const apiResponse = ref(null)
const propertiesResponse = ref(null)
const properties = ref([])
const pending = ref(true)
const propertiesLoading = ref(false)
const error = ref(null)

const contactForm = ref({
    fullName: '',
    message: '',
})
const contactLoading = ref(false)

const loadAgentDetail = async () => {
    pending.value = true
    error.value = null
    try {
        const response = await $fetchCitizen(`/v1/user/${agentId}`, {
            method: 'GET',
        })
        apiResponse.value = response
        agentData.value = response?.data || null
    } catch (e) {
        console.error('Error loading agent:', e)
        error.value = e
    } finally {
        pending.value = false
    }
}

const toggleFavorite = () => {
    if (!agentData.value) return

    agentData.value.isFavorited = !agentData.value.isFavorited
    toast.add({
        severity: agentData.value.isFavorited ? 'success' : 'info',
        summary: agentData.value.isFavorited ? 'Added to Favorites' : 'Removed from Favorites',
        detail: agentData.value.isFavorited
            ? 'Agent has been added to your favorite list'
            : 'Agent has been removed from your favorite list',
        life: 3000,
    })
}

const togglePropertyFavorite = (property) => {
    const prop = properties.value.find((p) => p.id === property.id)
    if (!prop) return

    prop.isFavorited = !prop.isFavorited
    toast.add({
        severity: prop.isFavorited ? 'success' : 'info',
        summary: prop.isFavorited ? 'Added to Favorites' : 'Removed from Favorites',
        life: 3000,
    })
}

const submitContactForm = async () => {
    if (!contactForm.value.fullName || !contactForm.value.message) {
        toast.add({
            severity: 'warn',
            summary: 'Required Fields',
            detail: 'Please fill in your name and message',
            life: 3000,
        })
        return
    }

    contactLoading.value = true
    try {
        const now = new Date()

        await $fetchCitizen('/v1/leads/store', {
            method: 'POST',
            body: {
                user_id: citizen_user.value?.data?.id,
                property_id: null,
                agent_id: agentId,
                name: contactForm.value.fullName,
                email: citizen_user.value?.data?.email,
                phone: citizen_user.value?.data?.user_info?.mobile || '',
                message: contactForm.value.message,
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().split(' ')[0],
                type: 1,
            },
        })

        toast.add({
            severity: 'success',
            summary: 'Message Sent',
            detail: 'Your message has been sent to the agent',
            life: 3000,
        })

        contactForm.value.fullName = ''
        contactForm.value.message = ''
    } catch (error) {
        console.error('Error sending message:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to send message',
            life: 3000,
        })
    } finally {
        contactLoading.value = false
    }
}

const formatPriceRange = (minPrice, maxPrice) => {
    if (!minPrice && !maxPrice) return 'N/A'
    
    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(1)}M`
        } else if (price >= 1000) {
            return `$${(price / 1000).toFixed(0)}k`
        }
        return `$${price}`
    }
    
    if (minPrice && maxPrice) {
        return `${formatPrice(minPrice)}-${formatPrice(maxPrice)}`
    } else if (minPrice) {
        return `From ${formatPrice(minPrice)}`
    } else {
        return `Up to ${formatPrice(maxPrice)}`
    }
}

const loadAgentProperties = async () => {
    propertiesLoading.value = true
    try {
        const response = await $fetchCitizen(`/v1/agent/${agentId}/properties`, {
            method: 'GET',
        })
        propertiesResponse.value = response
        properties.value = (response?.data || []).map((property) => ({
            id: property.id,
            title: property.name,
            address: property.address,
            price: parseFloat(property.price) || 0,
            beds: property.beds,
            baths: property.baths,
            sqft: property.square_feet,
            image: property.image_url,
            isFavorited: property.is_favorite || false,
        }))
    } catch (e) {
        console.error('Error loading properties:', e)
    } finally {
        propertiesLoading.value = false
    }
}

const agentName = computed(() => agentData.value?.name || 'Agent')
const agentFirstName = computed(() => agentName.value.split(' ')[0] || 'Agent')
const agentPhoto = computed(
    () => agentData.value?.photo || agentData.value?.profile_pic || '/images/agents/1.png'
)
const agentType = computed(
    () => agentData.value?.agent_type || agentData.value?.user_type?.[0]?.name || 'Agent'
)
const agentRating = computed(() => {
    const rating = Number(agentData.value?.rating)
    return Number.isFinite(rating) ? rating : 5.0
})
const agentReviewCount = computed(() => {
    const count = Number(agentData.value?.review)
    return Number.isFinite(count) ? count : 0
})
const agentSalesCount = computed(() => {
    const count = Number(agentData.value?.sales_count)
    return Number.isFinite(count) ? count : 0
})
const agentMinPrice = computed(() => {
    const minPrice = parseFloat(
        agentData.value?.user_preference?.range_minimum_price ??
            agentData.value?.min_price
    )
    return Number.isFinite(minPrice) ? minPrice : 0
})
const agentMaxPrice = computed(() => {
    const maxPrice = parseFloat(
        agentData.value?.user_preference?.range_maximum_price ??
            agentData.value?.max_price
    )
    return Number.isFinite(maxPrice) ? maxPrice : 0
})
const agentBio = computed(
    () => agentData.value?.bio || agentData.value?.user_info?.bio || 'Bio coming soon.'
)

const showFullBio = ref(false)
const bioPreview = computed(() => {
    if (!agentBio.value) return ''
    if (showFullBio.value) return agentBio.value
    const words = agentBio.value.split(' ')
    if (words.length <= 100) return agentBio.value
    return words.slice(0, 100).join(' ') + '...'
})

onMounted(async () => {
    await loadAgentDetail()
    await loadAgentProperties()
})
</script>

<template>
    <div class="min-h-screen bg-[#faf9f8] lg:bg-gray-50">
        <div class="flex flex-col gap-6 w-full max-w-[1316px] mx-auto p-5 md:px-4 md:py-6 lg:p-0">
            <!-- Back Button - Mobile only -->
            <div class="flex items-start gap-4 md:hidden">
                <button type="button"
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f1f3] text-[#121a22]"
                    @click="router.back()">
                    <Icon name="lucide:arrow-left" class="h-4 w-4" />
                </button>
                <p class="text-[20px] leading-7 font-semibold text-[#2c3e50]">
                    Agent Profile
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="pending" class="animate-pulse">
                <div class="bg-gray-200 h-[324px] rounded-[10px] mb-4"></div>
                <div class="bg-gray-200 h-8 rounded w-1/3 mb-2"></div>
                <div class="bg-gray-200 h-6 rounded w-1/4"></div>
            </div>

            <!-- Content -->
            <div v-else-if="agentData" class="flex gap-6 flex-col lg:flex-row">
            <!-- Left Column -->
            <div class="flex-1 flex flex-col gap-6">
                <!-- Agent Hero -->
                <div class="flex flex-col gap-4">
                    <!-- Agent Image -->
                    <div class="relative w-full h-[324px] rounded-[10px] overflow-hidden">
                        <img :src="agentPhoto" :alt="agentName"
                            class="w-full h-full object-cover"
                            @error="$event.target.src = '/images/agents/1.png'" />
                    </div>

                    <!-- Agent Info Header -->
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <h2 class="text-[24px] font-semibold text-[#121A22] leading-[32px] mb-1">
                                {{ agentName }}
                            </h2>
                            <p class="text-[16px] text-[#121A22] leading-[20px] capitalize">
                                {{ agentType }}
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <!-- Rating -->
                            <div class="flex items-center gap-1">
                                <span class="text-[20px] font-bold text-[#283849] leading-[1.5]">
                                    {{ agentRating.toFixed(1) }}
                                </span>
                                <Icon name="fa6-solid:star" class="w-4 h-4 text-[#FFB013]" />
                                <span class="text-[14px] text-[#121A22] leading-[20px]">
                                    ({{ agentReviewCount }})
                                </span>
                            </div>

                            <!-- Favorite Button -->
                            <!-- <button @click="toggleFavorite"
                                class="bg-[#F0F1F3] p-3 rounded-[12px] hover:bg-[#E0E1E3] transition-colors">
                                <Icon :name="agentData.isFavorited ? 'ph:heart-fill' : 'ph:heart'" class="w-6 h-6"
                                    :class="agentData.isFavorited ? 'text-red-500' : 'text-gray-600'" />
                            </button> -->
                        </div>
                    </div>
                </div>

                <!-- Stats Card -->
                <div class="bg-white rounded-[12px] p-4 flex flex-col gap-6">
                    <!-- Price Range and Sales -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-[#FAF9F8] rounded-[12px] px-8 py-4 lg:py-4 text-center">
                            <p class="text-[20px] font-bold text-[#121A22] leading-[28px] capitalize mb-4">
                                {{ formatPriceRange(agentMinPrice, agentMaxPrice) }}
                            </p>
                            <p class="text-[20px] font-medium text-[#121A22] leading-[28px] capitalize">
                                Price Range
                            </p>
                        </div>
                        <div class="bg-[#FAF9F8] rounded-[12px] px-8 py-4 lg:py-4 text-center">
                            <p class="text-[20px] font-bold text-[#121A22] leading-[28px] capitalize mb-4">
                                {{ agentSalesCount }} sold
                            </p>
                            <p class="text-[20px] font-medium text-[#121A22] leading-[28px] capitalize">
                                Last 12 months
                            </p>
                        </div>
                    </div>

                    <!-- About Section -->
                    <div class="flex flex-col gap-3">
                        <h3 class="text-[24px] font-semibold text-[#121A22] leading-[32px]">
                            About {{ agentFirstName }}
                        </h3>
                        <div class="text-[16px] text-[#283849] leading-[24px] whitespace-pre-line">
                            {{ bioPreview }}
                        </div>
                        <button v-if="agentBio && agentBio.split(' ').length > 100"
                            @click="showFullBio = !showFullBio"
                            class="text-[16px] font-bold text-[#2C3E50] leading-[24px] text-left hover:underline">
                            {{ showFullBio ? 'See Less...' : 'See More...' }}
                        </button>
                    </div>
                </div>

                <!-- Properties Listed -->
                <div class="flex flex-col gap-4">
                    <h3 class="text-[24px] font-semibold text-[#121A22] leading-[32px]">
                        Properties listed
                    </h3>

                    <!-- Properties Grid -->
                    <div v-if="propertiesLoading" class="text-center py-12 bg-white rounded-[12px]">
                        <p class="text-gray-500">Loading properties...</p>
                    </div>

                    <div v-else-if="properties.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="property in properties" :key="property.id"
                            class="bg-white border border-[#D9D9D9] rounded-[8px] p-3 cursor-pointer hover:shadow-lg transition-shadow"
                            @click="navigateTo(`/military/property/${property.id}`)">
                            <!-- Property Image -->
                            <div class="relative w-full h-[200px] rounded-[10px] overflow-hidden mb-4">
                                <img :src="property.image || '/images/agents/1.png'" :alt="property.title"
                                    class="w-full h-full object-cover"
                                    @error="$event.target.src = '/images/agents/1.png'" />
                                <!-- Favorite Button -->
                                <button
                                    class="absolute top-2 right-2 bg-white/90 backdrop-blur-[2px] p-2 rounded-lg hover:bg-white transition-colors"
                                    @click.stop="togglePropertyFavorite(property)">
                                    <Icon :name="property.isFavorited ? 'ph:heart-fill' : 'ph:heart'" class="w-5 h-5"
                                        :class="property.isFavorited ? 'text-red-500' : 'text-gray-600'" />
                                </button>
                            </div>

                            <!-- Property Info -->
                            <div class="flex flex-col gap-3">
                                <div class="flex items-center justify-between">
                                    <h4 class="text-[16px] font-bold text-[#283849] leading-[28px] truncate">
                                        {{ property.title }}
                                    </h4>
                                    <span class="text-[20px] font-bold text-[#283849] leading-[1.5] flex-shrink-0">
                                        ${{ property.price?.toLocaleString() }}
                                    </span>
                                </div>
                                <p class="text-[14px] text-[#121A22] leading-[20px] capitalize truncate">
                                    {{ property.address }}
                                </p>

                                <!-- Divider -->
                                <div class="border-t border-[#D9D9D9]"></div>

                                <!-- Property Stats -->
                                <div class="flex items-center gap-3">
                                    <div class="flex-1 bg-[#FAF9F8] rounded-[4px] px-3 py-2.5 flex items-center gap-1 justify-center">
                                        <Icon name="mdi:bed" class="w-4 h-4 text-[#121A22]" />
                                        <span class="text-[12px] text-[#121A22] leading-[16px] capitalize">
                                            {{ property.beds }} Beds
                                        </span>
                                    </div>
                                    <div class="flex-1 bg-[#FAF9F8] rounded-[4px] px-3 py-2.5 flex items-center gap-1 justify-center">
                                        <Icon name="mdi:shower" class="w-4 h-4 text-[#121A22]" />
                                        <span class="text-[12px] text-[#121A22] leading-[16px] capitalize">
                                            {{ property.baths }} Baths
                                        </span>
                                    </div>
                                    <div class="flex-1 bg-[#FAF9F8] rounded-[4px] px-3 py-2.5 flex items-center gap-1 justify-center">
                                        <Icon name="mdi:vector-square" class="w-4 h-4 text-[#121A22]" />
                                        <span class="text-[12px] text-[#121A22] leading-[16px] capitalize truncate">
                                            {{ property.sqft }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- No Properties -->
                    <div v-else class="text-center py-12 bg-white rounded-[12px]">
                        <Icon name="lucide:home" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p class="text-gray-500">No properties listed yet</p>
                    </div>
                </div>
            </div>

                <!-- Right Column - Contact Form -->
                <div class="w-full lg:w-80">
                    <div class="bg-[#f7f7f8] rounded-[12px] p-2 lg:bg-white lg:rounded-xl lg:p-0 overflow-hidden">
                        <div class="bg-white rounded-[8px] p-4 flex flex-col gap-5 lg:bg-transparent lg:rounded-none">
                            <h3
                                class="text-[20px] leading-7 font-semibold text-[#121a22] md:text-[22px] md:leading-8 lg:text-2xl lg:leading-8">
                                Contact {{ agentFirstName }}
                            </h3>

                            <!-- Divider -->
                            <div class="h-px w-full bg-[#EAECEE]"></div>

                            <!-- Contact Form -->
                            <form @submit.prevent="submitContactForm" class="flex flex-col gap-5">
                                <div class="flex flex-col">
                                    <label class="text-sm font-medium text-[#121a22] pb-2">
                                        Full Name
                                    </label>
                                    <InputText v-model="contactForm.fullName" placeholder="Enter your full name"
                                        class="w-full px-4 py-3.5 border border-[#cfdbe8] rounded-lg text-sm text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                </div>

                                <div class="flex flex-col">
                                    <label class="text-sm font-medium text-[#121a22] pb-2">
                                        Message
                                    </label>
                                    <Textarea v-model="contactForm.message" placeholder="Enter your message" rows="5"
                                        class="w-full px-4 py-3.5 border border-[#cfdbe8] rounded-lg text-sm text-[#566573] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                                </div>

                                <Button type="submit" label="Contact Agent" :loading="contactLoading"
                                    class="contact-agent-btn w-full bg-[#18222c] hover:bg-[#121a22] text-white py-3.5 px-6 rounded-xl text-base font-bold transition-colors border border-[#2c3e50]" />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Toast position="top-right" />
    </div>
</template>

<style scoped>
:deep(.contact-agent-btn) {
    background-color: #18222c;
    border-color: #2c3e50;
    color: #ffffff;
}

:deep(.contact-agent-btn:hover) {
    background-color: #121a22;
    border-color: #2c3e50;
    color: #ffffff;
}
</style>
