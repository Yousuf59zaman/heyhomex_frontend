// Property API Response Interface (from backend)
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
