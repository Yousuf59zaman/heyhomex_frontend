<script setup>
useHead({ title: "Listings - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })

const citizen_user = citizenUser()

// const searchQuery = ref('')
// const statusFilter = ref('All')
// const sortBy = ref('All')

const isLoading = ref(false)
const listings = ref([])
const error = ref(null)

const loadListings = async () => {
    isLoading.value = true
    error.value = null
    try {
        const agentId = citizen_user.value?.data?.id
        if (!agentId) {
            throw new Error('Agent ID not found')
        }
        
        const response = await $fetchCitizen(`/v1/agent/${agentId}/properties`, {
            method: 'GET'
        })
        
        if (response.status === 'success') {
            listings.value = response.data.map(property => ({
                id: property.id,
                property_status: property.category || 'active',
                property_image: property.image_url,
                property_title: property.name,
                property_location: property.address,
                property_price: parseFloat(property.price),
                beds: property.beds,
                baths: property.baths,
                square_feet: property.square_feet,
                created_at: property.created_at,
                updated_at: property.updated_at
            }))
        }
    } catch (e) {
        console.error('Error loading listings:', e.message)
        error.value = e
        listings.value = []
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadListings()
})

const currentPage = ref(1)
const totalItems = computed(() => listings.value.length)


const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price)
}

const getStatusInfo = (status) => {
    const statusMap = {
        'for_sale': { text: 'For Sale', color: 'green' },
        'for_rent': { text: 'For Rent', color: 'blue' },
        'active': { text: 'Active', color: 'green' },
        'pending': { text: 'Pending', color: 'yellow' },
        'sold': { text: 'Sold', color: 'blue' },
        'inactive': { text: 'Inactive', color: 'red' }
    }
    return statusMap[status] || { text: 'Unknown', color: 'gray' }
}

const getStatusColor = (color) => {
    const colors = {
        green: 'bg-green-100 text-green-700 border border-green-200',
        blue: 'bg-blue-100 text-blue-700 border border-blue-200',
        yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        red: 'bg-red-100 text-red-700 border border-red-200',
        gray: 'bg-gray-100 text-gray-700 border border-gray-200'
    }
    return colors[color] || 'bg-gray-100 text-gray-700 border border-gray-200'
}

// const handleAddListing = () => {
//     console.log('Add new listing')
// }

// const handleActionMenu = (listing) => {
//     console.log('Action for listing:', listing.id)
// }
</script>

<template>
    <div class="space-y-6">
        <!-- <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Listings</h1>
            <div class="flex items-center gap-2">
                <button @click="handleAddListing"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    Add New Listing
                </button>
            </div>
        </div> -->


        <!-- <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            <div class="relative flex-1 max-w-md">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search Here..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>


            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Status:</span>
                <select v-model="statusFilter"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer">
                    <option value="All">All</option>
                    <option value="for_sale">For Sale</option>
                    <option value="for_rent">For Rent</option>
                </select>
            </div>


            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Sort by:</span>
                <select v-model="sortBy"
                    class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer">
                    <option value="All">All</option>
                    <option value="Price">Price</option>
                    <option value="Date">Date</option>
                    <option value="Location">Location</option>
                </select>
            </div>
        </div> -->


        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-base font-semibold text-gray-900">All Listings</h3>
            </div>


            <div v-if="isLoading" class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Status
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Property Image
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Property Title
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Location
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Price
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="n in 5" :key="n" class="border-b border-gray-100 animate-pulse">
                            <td class="py-4 px-6">
                                <div class="h-6 w-20 bg-gray-200 rounded"></div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="w-20 h-14 bg-gray-200 rounded-lg"></div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="h-4 w-32 bg-gray-200 rounded"></div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="h-4 w-24 bg-gray-200 rounded"></div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="h-4 w-20 bg-gray-200 rounded"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else-if="error" class="px-6 py-12 text-center">
                <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p class="text-gray-600 mb-4">Failed to load listings</p>
                <button @click="loadListings" 
                    class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Retry
                </button>
            </div>

            <div v-else-if="listings.length === 0" class="px-6 py-12 text-center">
                <Icon name="lucide:home" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-600 mb-2">No listings found</p>
                <p class="text-sm text-gray-500">Add your first listing to get started</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Status
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Property Image
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Property Title
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Location
                            </th>
                            <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Price
                            </th>
                            <!-- <th class="text-left py-3 px-6 text-sm font-medium text-gray-600">
                                Action
                            </th> -->
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="listing in listings" :key="listing.id"
                            class="border-b border-gray-100 hover:bg-gray-50 transition-colors">

                            <td class="py-4 px-6">
                                <span class="px-3 py-1 text-xs font-medium rounded-md"
                                    :class="getStatusColor(getStatusInfo(listing.property_status).color)">
                                    {{ getStatusInfo(listing.property_status).text }}
                                </span>
                            </td>


                            <td class="py-4 px-6">
                                <img :src="listing.property_image" :alt="listing.property_title"
                                    class="w-20 h-14 object-cover rounded-lg"
                                    @error="$event.target.src = '/svg/not-found-img.svg'" />
                            </td>


                            <td class="py-4 px-6">
                                <span class="text-sm text-gray-900">{{ listing.property_title }}</span>
                            </td>


                            <td class="py-4 px-6">
                                <span class="text-sm text-gray-600">{{ listing.property_location }}</span>
                            </td>


                            <td class="py-4 px-6">
                                <span class="text-sm font-medium text-gray-900">{{ formatPrice(listing.property_price)
                                }}</span>
                            </td>


                            <!-- <td class="py-4 px-6">
                                <button @click="handleActionMenu(listing)"
                                    class="text-gray-400 hover:text-gray-600 transition-colors">
                                    <Icon name="lucide:more-vertical" class="w-5 h-5" />
                                </button>
                            </td> -->
                        </tr>
                    </tbody>
                </table>
            </div>


            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div class="text-sm text-gray-600">
                    Showing {{ totalItems }} of {{ totalItems }}
                </div>
                <div class="flex items-center gap-2">
                    <button :disabled="currentPage === 1"
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <button class="px-3 py-1 text-sm bg-gray-900 text-white rounded">
                        {{ currentPage }}
                    </button>
                    <button :disabled="true"
                        class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
