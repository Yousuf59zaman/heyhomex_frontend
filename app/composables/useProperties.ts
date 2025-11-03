export interface PropertyApiResponse {
    name: string
    address: string
    price: number
    beds: number
    baths: number
    image: string
    'square-feet': string
}

// Property Interface (used in frontend components)
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
}

// API Response Wrapper
export interface PropertyListResponse {
    status: string
    message?: string
    data: PropertyApiResponse[]
}

/**
 * Transform API response to match frontend Property interface
 */
const transformProperty = (apiProperty: PropertyApiResponse, index: number): Property => {
    return {
        id: index + 1, // Generate ID from index since API doesn't provide one
        title: apiProperty.name,
        address: apiProperty.address,
        price: apiProperty.price,
        beds: apiProperty.beds,
        baths: apiProperty.baths,
        sqft: apiProperty['square-feet'],
        image: apiProperty.image,
        isFavorited: false, // Default to false, can be updated based on user favorites
    }
}

/**
 * Composable for lazy-loading properties with caching
 * Uses Nuxt's useLazyAsyncData for optimal performance
 */
export const useProperties = () => {
    // Use lazy async data for non-blocking fetch with automatic caching
    const { data: rawData, pending, error, refresh } = useLazyAsyncData(
        'properties', // Cache key
        async () => {
            try {
                const response = await $fetchCMS<PropertyApiResponse[]>('/property', {
                    method: 'GET',
                })

                if (Array.isArray(response)) {
                    return response
                } else {
                    console.error('Unexpected API response format:', response)
                    return []
                }
            } catch (err: any) {
                console.error('Error fetching properties:', err)
                throw err
            }
        },
        {
            // Don't fetch on server by default to avoid hydration issues
            server: false,
        }
    )

    // Transform raw data to frontend Property interface
    const properties = computed<Property[]>(() => {
        if (!rawData.value || !Array.isArray(rawData.value)) {
            return []
        }
        return rawData.value.map((property, index) => transformProperty(property, index))
    })

    /**
     * Get a limited number of properties
     */
    const getPropertiesLimit = (limit: number): Property[] => {
        return properties.value.slice(0, limit)
    }

    /**
     * Toggle favorite status for a property
     */
    const toggleFavorite = (propertyId: number) => {
        const property = properties.value.find((p) => p.id === propertyId)
        if (property) {
            property.isFavorited = !property.isFavorited
        }
    }

    return {
        properties,
        pending, // Renamed from loading for consistency with Nuxt conventions
        error,
        refresh, // Method to manually refresh data
        getPropertiesLimit,
        toggleFavorite,
    }
}
