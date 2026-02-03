<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
    config: Object
})

const route = useRoute()
const router = useRouter()

// Data Accessor
const data = computed(() => props.config?.data || {})

// Helper to extract page number from URL (e.g. "...?page=2" -> 2)
const getPageFromUrl = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('page');
    } catch (e) {
        // Fallback for relative paths if needed, though Laravel usually sends absolute
        return url.split('page=')[1]; 
    }
}

const changePage = async (url) => {
    if (!url) return;
    
    const page = getPageFromUrl(url);
    if (!page) return;

    // Use the route's existing query params but update 'page'
    // This preserves other filters like 'search', 'sort', etc.
    await navigateTo({
        query: {
            ...route.query,
            page: page
        }
    })
}
</script>

<template>
    <div v-if="data.links && data.links.length > 3" class="flex items-center justify-between border-t border-gray-200 py-3">
        
        <!-- Mobile View (Simple Next/Prev) -->
        <div class="flex flex-1 justify-between sm:hidden">
            <template v-for="(link, index) in data.links" :key="index">
                <!-- Previous Button (First Link) -->
                <div v-if="index === 0" 
                     @click="changePage(link.url)"
                     :class="['relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer', !link.url ? 'opacity-50 cursor-not-allowed' : '']">
                    Previous
                </div>
                
                <!-- Next Button (Last Link) -->
                <div v-if="index === data.links.length - 1" 
                     @click="changePage(link.url)"
                     :class="['relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer', !link.url ? 'opacity-50 cursor-not-allowed' : '']">
                    Next
                </div>
            </template>
        </div>

        <!-- Desktop View -->
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            
            <!-- Info Text: "Showing 1 to 10 of 20 results" -->
            <div>
                <p class="text-sm text-gray-700 dark:text-gray-200">
                    Showing
                    <span class="font-medium">{{ data.from }}</span>
                    to
                    <span class="font-medium">{{ data.to }}</span>
                    of
                    <span class="font-medium">{{ data.total }}</span>
                    results
                </p>
            </div>

            <!-- Page Buttons -->
            <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    
                    <div 
                        v-for="(link, index) in data.links" 
                        :key="index"
                        @click="changePage(link.url)"
                        v-html="link.label"
                        :class="[
                            // Base Styles
                            'relative inline-flex items-center px-4 py-2 text-sm font-medium focus:z-20 cursor-pointer border',
                            
                            // Active State
                            link.active 
                                ? 'z-10 bg-sky-50 border-sky-500 text-sky-600 dark:bg-gray-800' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
                            
                            // Disabled State (null url)
                            !link.url ? 'opacity-60 cursor-not-allowed hover:bg-white' : '',

                            // Rounded Corners for Ends
                            index === 0 ? 'rounded-l-md' : '',
                            index === data.links.length - 1 ? 'rounded-r-md' : ''
                        ]"
                    >
                    </div>

                </nav>
            </div>
        </div>
    </div>
</template>
