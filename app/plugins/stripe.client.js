import { loadStripe } from '@stripe/stripe-js'

export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()
    
    if (import.meta.client && config.public.STRIPE_PUBLISHABLE_KEY) {
        const stripe = await loadStripe(config.public.STRIPE_PUBLISHABLE_KEY)
        
        return {
            provide: {
                stripe
            }
        }
    }
    
    return {
        provide: {
            stripe: null
        }
    }
})
