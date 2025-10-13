<template>
    <div class="min-h-screen bg-[#FAF9F8]">
        <!-- Mobile Menu Overlay -->
        <div
            v-if="isMobileMenuOpen"
            class="fixed inset-0 z-40 lg:hidden"
            @click="closeMobileMenu">
            <div class="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <!-- Mobile Menu Sidebar -->
        <div
            class="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden"
            :class="isMobileMenuOpen ? '-translate-x-0' : 'translate-x-full'">
            <LazySidebarCitizen :is-mobile="true" @close-menu="closeMobileMenu" />
        </div>

        <!-- Desktop Sidebar -->
        <div class="hidden lg:block fixed inset-y-0 left-0 z-50 w-16 bg-white border-r border-gray-200">
            <LazySidebarCitizen :is-mobile="false" />
        </div>

        <!-- Main Content -->
        <div class="lg:ml-[4.375rem] min-h-screen">
            <!-- Header -->
            <LazyAppHeaderCitizen 
                @toggle-mobile-menu="toggleMobileMenu" 
                :is-mobile-menu-open="isMobileMenuOpen" 
            />

            <!-- Page Content -->
            <main class="px-4 lg:px-6">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
    const isMobileMenuOpen = ref(false);

    const toggleMobileMenu = () => {
        isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const closeMobileMenu = () => {
        isMobileMenuOpen.value = false;
    };

    // Close mobile menu on window resize
    onMounted(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                isMobileMenuOpen.value = false;
            }
        };

        window.addEventListener('resize', handleResize);

        onUnmounted(() => {
            window.removeEventListener('resize', handleResize);
        });
    });
</script>
