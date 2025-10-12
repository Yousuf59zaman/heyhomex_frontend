<template>
    <div class="min-h-screen bg-[#FAF9F8]">
        <!-- Mobile Sidebar Overlay -->
        <div 
            v-if="isMobileMenuOpen" 
            class="fixed inset-0 z-40 lg:hidden"
            @click="closeMobileMenu"
        >
            <div class="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>

        <!-- Sidebar -->
        <div class="fixed inset-y-0 left-0 z-50 w-16 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out"
             :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
            <LazySidebarCitizen />
        </div>
        
        <!-- Main Content -->
        <div class="lg:ml-[4.375rem] min-h-screen">
            <!-- Header -->
            <LazyAppHeaderCitizen @toggle-mobile-menu="toggleMobileMenu" />
            
            <!-- Page Content -->
            <main class="p-4 lg:p-6">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
}

// Close mobile menu on window resize
onMounted(() => {
    const handleResize = () => {
        if (window.innerWidth >= 1024) {
            isMobileMenuOpen.value = false
        }
    }
    
    window.addEventListener('resize', handleResize)
    
    onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
    })
})
</script>
