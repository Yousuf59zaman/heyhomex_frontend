<script setup>
definePageMeta({
    layout: 'citizen',
    middleware: ['auth-citizen']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const agentId = route.params.id
const pending = ref(false)

const contactForm = ref({
    fullName: '',
    message: '',
})
const contactLoading = ref(false)

// Mock data - API not implemented yet
const agentData = ref({
    id: 1,
    name: 'John Watters',
    photo: '/images/agents/1.png',
    agent_type: 'Top Agents',
    min_price: 500000,
    max_price: 3800000,
    sales_count: 283,
    rating: 5.0,
    reviews_count: 48,
    bio: `Aloha! I'm John Watters, a dedicated real estate professional with Top Agents, specializing in Hawaii's unique and dynamic property market. Whether you're searching for your dream home with ocean views, looking to invest in island paradise, or ready to sell your property, I'm here to guide you through every step of the journey.\n\nWhat sets Hawaii real estate apart is the incredible blend of natural beauty, diverse communities, and lifestyle opportunities—from beachfront condos to mountain retreats. I bring local market expertise, a commitment to personalized service, and a genuine passion for helping clients find not just a house, but a home that fits their vision of island living.`,
    isFavorited: false,
})

const properties = ref([
    {
        id: 1,
        title: 'Island Bank Hawaii',
        address: '456 Ocean View Dr, Maui, HI 96753',
        price: 431000,
        beds: 3,
        baths: 3,
        sqft: '1733/5000',
        image: '/images/agents/1.png',
        isFavorited: false,
    },
    {
        id: 2,
        title: 'Hawaii Home Movers',
        address: '123 Aloha Lane, Honolulu, HI 96818',
        price: 475000,
        beds: 5,
        baths: 3,
        sqft: '1733/5000',
        image: '/images/agents/1.png',
        isFavorited: false,
    },
    {
        id: 3,
        title: 'Seabreeze Living Co.',
        address: '201 Sea Shore Rd, Kahului, HI 96732',
        price: 429000,
        beds: 3,
        baths: 2,
        sqft: '1733/5000',
        image: '/images/agents/1.png',
        isFavorited: false,
    },
    {
        id: 4,
        title: 'Volcano View Cabin',
        address: '12 Lava Ridge, Volcano, HI 96785',
        price: 289000,
        beds: 5,
        baths: 3,
        sqft: '1733/5000',
        image: '/images/agents/1.png',
        isFavorited: false,
    },
])

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

const submitContactForm = () => {
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
    
    // Simulate API call
    setTimeout(() => {
        toast.add({
            severity: 'success',
            summary: 'Message Sent',
            detail: 'Your message has been sent to the agent (Demo)',
            life: 3000,
        })
        contactForm.value.fullName = ''
        contactForm.value.message = ''
        contactLoading.value = false
    }, 1000)
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

const showFullBio = ref(false)
const bioPreview = computed(() => {
    if (!agentData.value?.bio) return ''
    if (showFullBio.value) return agentData.value.bio
    const words = agentData.value.bio.split(' ')
    if (words.length <= 100) return agentData.value.bio
    return words.slice(0, 100).join(' ') + '...'
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
                        <img :src="agentData.photo || '/images/agents/1.png'" :alt="agentData.name"
                            class="w-full h-full object-cover"
                            @error="$event.target.src = '/images/agents/1.png'" />
                    </div>

                    <!-- Agent Info Header -->
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <h2 class="text-[24px] font-semibold text-[#121A22] leading-[32px] mb-1">
                                {{ agentData.name }}
                            </h2>
                            <p class="text-[16px] text-[#121A22] leading-[20px] capitalize">
                                {{ agentData.agent_type }}
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <!-- Rating -->
                            <div class="flex items-center gap-1">
                                <span class="text-[20px] font-bold text-[#283849] leading-[1.5]">
                                    {{ agentData.rating.toFixed(1) }}
                                </span>
                                <Icon name="fa6-solid:star" class="w-4 h-4 text-[#FFB013]" />
                                <span class="text-[14px] text-[#121A22] leading-[20px]">
                                    ({{ agentData.reviews_count }})
                                </span>
                            </div>

                            <!-- Favorite Button -->
                            <button @click="toggleFavorite"
                                class="bg-[#F0F1F3] p-3 rounded-[12px] hover:bg-[#E0E1E3] transition-colors">
                                <Icon :name="agentData.isFavorited ? 'ph:heart-fill' : 'ph:heart'" class="w-6 h-6"
                                    :class="agentData.isFavorited ? 'text-red-500' : 'text-gray-600'" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Card -->
                <div class="bg-white rounded-[12px] p-4 flex flex-col gap-6">
                    <!-- Price Range and Sales -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-[#FAF9F8] rounded-[12px] px-8 py-4 lg:py-4 text-center">
                            <p class="text-[20px] font-bold text-[#121A22] leading-[28px] capitalize mb-4">
                                {{ formatPriceRange(agentData.min_price, agentData.max_price) }}
                            </p>
                            <p class="text-[20px] font-medium text-[#121A22] leading-[28px] capitalize">
                                Price Range
                            </p>
                        </div>
                        <div class="bg-[#FAF9F8] rounded-[12px] px-8 py-4 lg:py-4 text-center">
                            <p class="text-[20px] font-bold text-[#121A22] leading-[28px] capitalize mb-4">
                                {{ agentData.sales_count }} sold
                            </p>
                            <p class="text-[20px] font-medium text-[#121A22] leading-[28px] capitalize">
                                Last 12 months
                            </p>
                        </div>
                    </div>

                    <!-- About Section -->
                    <div class="flex flex-col gap-3">
                        <h3 class="text-[24px] font-semibold text-[#121A22] leading-[32px]">
                            About {{ agentData.name.split(' ')[0] }}
                        </h3>
                        <div class="text-[16px] text-[#283849] leading-[24px] whitespace-pre-line">
                            {{ bioPreview }}
                        </div>
                        <button v-if="agentData.bio && agentData.bio.split(' ').length > 100"
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
                    <div v-if="properties.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="property in properties" :key="property.id"
                            class="bg-white border border-[#D9D9D9] rounded-[8px] p-3 cursor-pointer hover:shadow-lg transition-shadow"
                            @click="navigateTo(`/kamaina/property/${property.id}`)">
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
                                Contact {{ agentData.name.split(' ')[0] }}
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
