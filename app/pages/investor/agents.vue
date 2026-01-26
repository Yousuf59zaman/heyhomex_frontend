<script setup>
definePageMeta({
    layout: 'citizen',
    middleware: ['auth-citizen']
})

const route = useRoute()
// const router = useRouter()
const toast = useToast()

const searchQuery = ref(route.query.q || '')
const searchType = ref(route.query.type || 'location')
const agents = ref([])
const apiResponse = ref(null)
const pending = ref(false)
const error = ref(null)

const loadAgents = async () => {
    pending.value = true
    error.value = null
    try {
        const params = {}
        if (searchQuery.value) {
            params.search = searchQuery.value
        }
        
        const response = await $fetchCitizen('/v1/user-types/5/users', {
            method: 'GET',
            params: params
        })
        apiResponse.value = response
        agents.value = (response?.data?.data || []).map((agent) => ({
            id: agent.id,
            name: agent.name,
            photo: agent.profile_pic || '/images/agents/1.png',
            agent_type: agent.user_type?.[0]?.name || 'Agent',
            min_price: parseFloat(agent.user_preference?.range_minimum_price) || 0,
            max_price: parseFloat(agent.user_preference?.range_maximum_price) || 0,
            sales_count: 0,
            rating: agent.rating || 0,
            reviews_count: agent.review || 0,
            isFavorited: false,
        }))
    } catch (e) {
        console.error('Error loading agents:', e)
        error.value = e
    } finally {
        pending.value = false
    }
}

const handleSearch = () => {
    loadAgents()
}

const toggleFavorite = (agent) => {
    const agentItem = agents.value.find((a) => a.id === agent.id)
    if (!agentItem) return

    agentItem.isFavorited = !agentItem.isFavorited
    toast.add({
        severity: agentItem.isFavorited ? 'success' : 'info',
        summary: agentItem.isFavorited ? 'Added to Favorites' : 'Removed from Favorites',
        detail: agentItem.isFavorited
            ? 'Agent has been added to your favorite list'
            : 'Agent has been removed from your favorite list',
        life: 3000,
    })
}

const resultsFound = computed(() => agents.value.length)
const displayQuery = computed(() => searchQuery.value || 'Honolulu')

onMounted(() => {
    loadAgents()
})
</script>

<template>
    <div class="flex flex-col gap-6 w-full max-w-[1316px] mx-auto px-4 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h1 class="text-[32px] font-semibold text-[#2C3E50] leading-[40px]">
                Agent Listing
            </h1>
        </div>

        <!-- Search Section -->
        <div class="flex flex-col gap-3">
            <!-- Search Input -->
            <div class="flex items-center gap-6">
                <div
                    class="bg-white border border-[#D9D9D9] rounded-[8px] px-4 py-3 flex items-center gap-2.5 w-full max-w-[440px]">
                    <Icon name="lucide:search" class="w-5 h-5 text-[#121A22]" />
                    <input v-model="searchQuery" type="text" placeholder="Search agents"
                        class="flex-1 text-[14px] font-semibold text-[#121A22] leading-[20px] outline-none bg-transparent"
                        @keyup.enter="handleSearch" />
                    <button v-if="searchQuery" @click="searchQuery = ''; handleSearch()"
                        class="flex-shrink-0">
                        <Icon name="lucide:x-circle" class="w-5 h-5 text-[#666]" />
                    </button>
                </div>

                <button @click="handleSearch"
                    class="bg-[#18222C] text-white px-3 py-3 rounded-[8px] text-[14px] font-semibold leading-[20px] hover:bg-[#2C3E50] transition-colors">
                    Search agents
                </button>
            </div>
        </div>

        <!-- Results Section -->
        <div class="bg-white rounded-[12px] p-4">
            <!-- Results Header -->
            <div class="mb-4">
                <h2 class="text-[24px] font-semibold text-[#121A22] leading-[32px] mb-3">
                    Real Estate Agents in {{ displayQuery }}
                </h2>
                <p class="text-[14px] text-[#283849] leading-[20px]">
                    {{ resultsFound }} agents found
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="i in 6" :key="i" class="animate-pulse">
                    <div class="bg-gray-200 h-[200px] rounded-[10px] mb-4"></div>
                    <div class="bg-gray-200 h-6 rounded mb-2"></div>
                    <div class="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
            </div>

            <!-- Agents Grid -->
            <div v-else-if="agents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SearchAgent v-for="agent in agents" :key="agent.id" :agent="agent" segment="investor"
                    @toggle-favorite="toggleFavorite" />
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
                <Icon name="lucide:users" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500 text-lg">No agents found</p>
                <p class="text-gray-400 text-sm">Try adjusting your search criteria</p>
            </div>

            <!-- Pagination -->
            <div v-if="false" class="mt-6">
                <Pagination :paginationConfig="paginationConfig" />
            </div>
        </div>
    </div>
</template>
