<script setup>
useHead({ title: "Listings - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })


const searchQuery = ref('')
const statusFilter = ref('All')
const sortBy = ref('All')

// const isLoading = ref(false)


const listings = ref([
    {
        id: 1,
        property_status: 'active',
        property_image: '/images/dashboard/property1.jpg',
        property_title: 'Modern City Apartment',
        property_location: 'Hawaii',
        property_price: 120000,
        created_at: '2026-01-01T10:00:00Z',
        updated_at: '2026-01-05T15:30:00Z'
    },
    {
        id: 2,
        property_status: 'active',
        property_image: '/images/dashboard/property1.jpg',
        property_title: 'Beachfront Villa',
        property_location: 'Hawaii',
        property_price: 250000,
        created_at: '2026-01-02T10:00:00Z',
        updated_at: '2026-01-05T15:30:00Z'
    },
    {
        id: 3,
        property_status: 'active',
        property_image: '/images/dashboard/property1.jpg',
        property_title: 'Downtown Condo',
        property_location: 'Hawaii',
        property_price: 180000,
        created_at: '2026-01-03T10:00:00Z',
        updated_at: '2026-01-05T15:30:00Z'
    },
    {
        id: 4,
        property_status: 'pending',
        property_image: '/images/dashboard/property1.jpg',
        property_title: 'Luxury Penthouse',
        property_location: 'Hawaii',
        property_price: 350000,
        created_at: '2026-01-04T10:00:00Z',
        updated_at: '2026-01-05T15:30:00Z'
    },
    {
        id: 5,
        property_status: 'active',
        property_image: '/images/dashboard/property1.jpg',
        property_title: 'Suburban House',
        property_location: 'Hawaii',
        property_price: 145000,
        created_at: '2026-01-05T10:00:00Z',
        updated_at: '2026-01-05T15:30:00Z'
    },
    {
        id: 6,
        property_status: 'sold',
        property_image: '/images/dashboard/property1.jpg',
        property_title: 'Ocean View Apartment',
        property_location: 'Hawaii',
        property_price: 195000,
        created_at: '2025-12-28T10:00:00Z',
        updated_at: '2026-01-03T15:30:00Z'
    }
])


const currentPage = ref(1)
// const itemsPerPage = ref(10)
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

const handleAddListing = () => {
    console.log('Add new listing')
}

const handleActionMenu = (listing) => {
    console.log('Action for listing:', listing.id)
}
</script>

<template>
    <div class="space-y-6">

        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Listings</h1>
            <div class="flex items-center gap-2">
                <button @click="handleAddListing"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                    Add New Listing
                </button>
            </div>
        </div>


        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">

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
                    <option value="Active">Active</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
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
        </div>


        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-base font-semibold text-gray-900">All Listings</h3>
            </div>


            <div class="overflow-x-auto">
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
