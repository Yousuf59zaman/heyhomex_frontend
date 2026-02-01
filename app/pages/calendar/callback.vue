<script setup>
// import { config } from 'process'
const config = useRuntimeConfig();
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })
useHead({ title: "Calendar Sync - Agent Panel" })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { citizen_user, logout, isLoadingLogout } = citizenAuth()



const processing = ref(true)
const success = ref(false)
const errorMessage = ref('')


const GOOGLE_CLIENT_ID = config.public.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = config.public.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = config.public.GOOGLE_REDIRECT_URI || 'https://dev.heyhomex.orangebd.com/calendar/callback'

onMounted(async () => {
    try {
        console.log('OAuth callback route:', route.query)

        const code = route.query.code
        const error = route.query.error

        if (error) {
            throw new Error(error === 'access_denied' ? 'Google access was denied' : 'Authorization failed')
        }

        if (!code) {
            throw new Error('Missing authorization code from Google. Please try again.')
        }


        const tokenResponse = await $fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code: code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }).toString()
        })

        console.log('Token exchange response:', tokenResponse)

        if (!tokenResponse.access_token) {
            throw new Error('Failed to obtain access token from Google')
        }


        const expiresInSeconds = parseInt(tokenResponse.expires_in)
        const expirationDate = new Date(Date.now() + (expiresInSeconds * 1000))
        const expiresAt = expirationDate.toISOString()

        console.log('Token expires in seconds:', expiresInSeconds)
        console.log('Token expiration date:', expiresAt)


        const userId = citizen_user.value.data.id;
        console.log('coming is using id', userId)

        if (!userId) {
            throw new Error('User not authenticated. Please log in and try again.')
        }


        const formData = new FormData()
        formData.append('user_id', userId)
        formData.append('access_token', tokenResponse.access_token)
        formData.append('refresh_token', tokenResponse.refresh_token)
        formData.append('expires_in', expiresAt)

        const response = await $fetchCitizen('v1/google/token/add', {
            method: 'POST',
            body: formData
        })

        if (response && response.message) {
            success.value = true

            localStorage.setItem('google_calendar_synced', 'true')

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: response.message,
                life: 3000
            })

            setTimeout(() => {
                router.push('/agent/calendar')
            }, 2000)
        } else {
            throw new Error('Invalid response from server')
        }
    } catch (error) {
        console.error('Error processing Google Calendar callback:', error)
        errorMessage.value = error.data?.error_description || error.response?.data?.message || error.message || 'Failed to connect Google Calendar'
        success.value = false

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage.value,
            life: 5000
        })

        // setTimeout(() => {
        //     router.push('/agent/calendar')
        // }, 3000)
    } finally {
        processing.value = false
    }
})
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div class="max-w-md w-full">
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">

                <div v-if="processing" class="space-y-4">
                    <div class="w-16 h-16 mx-auto">
                        <svg class="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Connecting to Google Calendar</h2>
                    <p class="text-gray-600">Please wait while we sync your calendar...</p>
                </div>


                <div v-else-if="success" class="space-y-4">
                    <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="lucide:check" class="w-10 h-10 text-green-600" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Successfully Connected!</h2>
                    <p class="text-gray-600">Your Google Calendar has been synced successfully.</p>
                    <p class="text-sm text-gray-500">Redirecting to calendar...</p>
                </div>


                <div v-else class="space-y-4">
                    <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <Icon name="lucide:x" class="w-10 h-10 text-red-600" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Connection Failed</h2>
                    <p class="text-gray-600">{{ errorMessage }}</p>
                    <p class="text-sm text-gray-500">Redirecting to calendar...</p>

                    <button @click="router.push('/agent/calendar')"
                        class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Calendar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>