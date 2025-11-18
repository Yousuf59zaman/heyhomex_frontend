
export interface PropertyApiResponse {
    id: number
    name: string
    address: string
    price: number
    beds: number
    baths: number
    image: string
    "square-feet": string
    coordinates: {
        latitude: number
        longitude: number
    }
}

export interface Property {
    id: number
    title: string
    address: string
    price: number
    beds: number
    baths: number
    sqft: string
    image: string
    isFavorited: boolean
    coordinates?: [number, number] | null
}

export interface PropertyDetail {
    id: number
    name: string
    address: string
    price: number
    beds: number
    baths: number
    image: string
    "square-feet": string
    description: string
    year_built: number
    property_type: string
    parking: string
    features: string[]
    nearby_facilities: Array<{
        name: string
        type: string
        distance: string
        drive_time: string
    }>
    location: {
        latitude: number
        longitude: number
        map_url: string
        street_view_url: string
    }
    schools: Array<{
        name: string
        type: string
        rating: string
        distance: string
    }>
    hospitals: Array<{
        name: string
        type: string
        distance: string
        emergency_services: boolean
    }>
    title: string
    is_claimable: boolean
    insights: {
        public_school_rating: string
        zoning_info: string
        commute_to_work: string
        community_vibe: string
        local_culture_events: string
        ohana_friendly_features: string
        nearby_services: string
        energy_cost_estimate: string
    }
    military_info: {
        distance_to_base: string
        bah_eligible: boolean
        military_community: boolean
    }
    images: {
        inside: string[]
        outside: string[]
    }
}

export interface PaginationMeta {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
}

export interface PropertyListResponse {
    status: string
    message?: string
    data: {
        data: PropertyApiResponse[]
        meta: PaginationMeta
    }
}

export interface PropertyDetailResponse {
    status: string
    message?: string
    data: PropertyDetail
}

// composables/useProperties.ts
const transformProperty = (
    apiProperty: PropertyApiResponse
): Property => ({
    id: apiProperty.id,
    title: apiProperty.name,
    address: apiProperty.address,
    price: apiProperty.price,
    beds: apiProperty.beds,
    baths: apiProperty.baths,
    sqft: apiProperty["square-feet"],
    image: apiProperty.image,
    isFavorited: false,
    coordinates: apiProperty.coordinates ? [apiProperty.coordinates.latitude, apiProperty.coordinates.longitude] : null
})

export const useProperties = () => {
    const route = useRoute()
    const router = useRouter()
    
    // Reactive state
    const properties = ref<Property[]>([])
    const paginationConfig = ref({
        data: {},
        lang: 'en',
        align: 'center',
        action: '',
    })
    const pending = ref(false)
    const error = ref<Error | null>(null)
    const search = ref('')
    const status = ref({ key: 'status', value: '' })

    const fetchProperties = async () => {
        pending.value = true
        error.value = null

        try {
            const response = await $fetchCMS<PropertyListResponse>('/property', {
                method: 'POST',
                body: {
                    paginate: true,
                    page: route.query.page || 1,
                    length: 10,
                },
            })

            properties.value = response.data.data.map((property) =>
                transformProperty(property)
            )
            console.log('property value', properties)
            paginationConfig.value.data = response.data.meta

        } catch (err) {
            console.error('Error fetching properties:', err)
            error.value = err instanceof Error ? err : new Error('Unknown error')
            properties.value = []
            paginationConfig.value.data = {}
        } finally {
            pending.value = false
        }
    }

    const fetchPropertyDetail = async (id: number) => {
        pending.value = true
        error.value = null

        try {
            const response = await $fetchCMS<PropertyDetailResponse>(`/property/${id}`, {
                method: 'GET',
            })

            return response.data
        } catch (err) {
            console.error('Error fetching property detail:', err)
            error.value = err instanceof Error ? err : new Error('Unknown error')
            return null
        } finally {
            pending.value = false
        }
    }

    const changePage = async (page: number) => {
        await router.push({ query: { ...route.query, page } })
        await fetchProperties()
    }

    const updateSearch = (value: string) => {
        search.value = value
        fetchProperties()
    }

    const updateStatus = (value: { key: string; value: string }) => {
        status.value = value
        fetchProperties()
    }

    const getPropertiesLimit = (limit: number): Property[] => 
        properties.value.slice(0, limit)

    const toggleFavorite = (propertyId: number): void => {
        const property = properties.value.find((p) => p.id === propertyId)
        if (property) {
            property.isFavorited = !property.isFavorited
        }
    }

    const favoriteProperties = computed<Property[]>(() =>
        properties.value.filter((p) => p.isFavorited)
    )

    return {
        // State
        properties: readonly(properties),
        paginationConfig,
        pending: readonly(pending),
        error: readonly(error),
        search,
        status,
        
        // Computed
        favoriteProperties: readonly(favoriteProperties),
        
        // Methods
        fetchProperties,
        fetchPropertyDetail,
        changePage,
        updateSearch,
        updateStatus,
        getPropertiesLimit,
        toggleFavorite,
    }
}