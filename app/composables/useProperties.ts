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

export const useProperties = () => {
    const properties = ref<Property[]>([])
    const loading = ref(false)
    const error = ref<Error | null>(null)

    /**
     * Transform API response to match frontend Property interface
     */
    const transformProperty = (
        apiProperty: PropertyApiResponse,
        index: number
    ): Property => {
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
     * Fetch properties from the API
     */
    const fetchProperties = async () => {
        loading.value = true
        error.value = null

        try {
            // Fetch properties using $fetchCMS
            const response = await $fetchCMS<PropertyApiResponse[]>(
                '/property',
                {
                    method: 'GET',
                }
            )

            // Transform the response to match frontend interface
            if (Array.isArray(response)) {
                properties.value = response.map((property, index) =>
                    transformProperty(property, index)
                )
            } else {
                console.error('Unexpected API response format:', response)
                properties.value = []
            }
        } catch (err: any) {
            console.error('Error fetching properties:', err)
            error.value = err
            properties.value = []
        } finally {
            loading.value = false
        }
    }

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
        loading,
        error,
        fetchProperties,
        getPropertiesLimit,
        toggleFavorite,
    }
}
