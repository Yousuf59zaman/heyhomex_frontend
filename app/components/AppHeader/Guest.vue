<script setup>
    const {admin_user = {}} = adminAuth()
    const {citizen_user = {}} = citizenAuth()
    // const { $citizenModals } = useNuxtApp()
    const isScroll = ref(false)
    const isMobileMenuOpen = ref(false)
    const isOpenStartModal = ref(false)
    const initialStep = ref(0)

    const citizenProfile = computed(() => {
        const rawCitizen =
            citizen_user && citizen_user.value !== undefined
                ? citizen_user.value
                : citizen_user
        return rawCitizen?.data ?? rawCitizen
    })

    const hasCitizenDashboardAccess = computed(() => {
        const profile = citizenProfile.value
        const slug = profile?.user_type?.[0]?.slug
        const onboardingStatus = profile?.user_onboard_profile_status
        const onboardingComplete =
            onboardingStatus === undefined || onboardingStatus === null
                ? true
                : onboardingStatus !== 0

        return Boolean(slug && onboardingComplete)
    })

    const handleScroll = () => {
        isScroll.value = window.scrollY > 0
    }

    const toggleMobileMenu = () => {
        isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const handleGetStarted = () => {
        initialStep.value = 0
        isOpenStartModal.value = true
        isMobileMenuOpen.value = false
    }

    const handleSignIn = () => {
        initialStep.value = 6
        isOpenStartModal.value = true
        isMobileMenuOpen.value = false
    }

    const handleDashboardRedirect = (userData) => {
        const profile = (userData?.data ?? userData) || citizenProfile.value
        const redirectSlug = profile?.user_type?.[0]?.slug

        if (!redirectSlug) return

        const targetPath =
            redirectSlug === "kamaaina" ? "/kamaina/" : `/${redirectSlug}/`
        window.location.href = targetPath
    }

    onMounted(() => {
        window.addEventListener("scroll", handleScroll)
    })

    onUnmounted(() => {
        window.removeEventListener("scroll", handleScroll)
    })
</script>

<template>
    <!-- {{ citizen_user }} -->
    <nav
        :class="[
            'sticky top-0 bg-[#121A22] w-full transition-all duration-300 z-50',
            isScroll ? 'py-1 shadow-md' : 'py-1',
        ]">
        <div
            class="relative flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12">
            <!-- Left Spacer-->
            <div class="md:w-[200px]">
                <img
                    class="hidden sm:block lg:hidden"
                    src="/images/home/home_logo.png"
                    alt="" />
            </div>

            <!-- Logo Section-->
            <div
                :class="[
                    'absolute left-1/2 -translate-x-1/2 transition-transform duration-300',
                    isScroll ? 'scale-90' : 'scale-100',
                ]">
                <div class="flex items-center space-x-3">
                    <NuxtLink to="/#">
                        <ApplicationLogo
                            :width="'100%'"
                            :height="'1.625rem'"
                            class="filter brightness-0 invert" />
                    </NuxtLink>
                </div>
            </div>

            <!-- Right Section -->
            <div class="ml-auto flex items-center">
                <!-- Desktop Menu -->
                <div
                    v-if="admin_user"
                    class="hidden md:flex items-center space-x-4">
                    <NuxtLink
                        to="/admin-panel"
                        class="py-[0.5rem] px-[1.5rem] text-black text-[0.875rem] bg-white border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        Admin Panel
                    </NuxtLink>
                </div>
                <div
                    v-else-if="hasCitizenDashboardAccess"
                    style="cursor: pointer"
                    class="hidden cursor-pointer md:flex items-center space-x-4">
                    <div
                        @click="handleDashboardRedirect(citizen_user)"
                        class="py-[0.5rem] px-[1.5rem] text-black text-[0.875rem] bg-white border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        Citizen Panel
                    </div>
                </div>
                <div
                    v-else
                    class="hidden md:flex items-center space-x-4">
                    <button
                        @click="handleSignIn"
                        class="text-white text-[0.875rem] hover:text-gray-300 transition-colors">
                        Sign In
                    </button>
                    <div class="bg-white w-[1px] h-[1.25rem]"></div>
                    <button
                        @click="handleGetStarted"
                        class="py-[0.5rem] px-[1.5rem] text-black text-[0.875rem] bg-white border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        Get Started
                    </button>
                </div>

                <!-- Mobile Hamburger Button -->
                <button
                    @click="toggleMobileMenu"
                    class="md:hidden text-white p-2 focus:outline-none"
                    aria-label="Toggle menu">
                    <svg
                        v-if="!isMobileMenuOpen"
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg
                        v-else
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Menu Dropdown -->
        <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
            <!-- Guest Mobile Menu -->
            <div
                v-if="isMobileMenuOpen && !admin_user && !hasCitizenDashboardAccess"
                class="md:hidden bg-[#1a2530] border-t border-gray-700">
                <div class="px-4 py-4 space-y-3">
                    <button
                        @click="handleSignIn"
                        class="block w-full text-left text-white text-base py-2 px-3 rounded-lg hover:bg-[#2a3540] transition-colors">
                        Sign In
                    </button>
                    <button
                        @click="handleGetStarted"
                        class="block w-full text-center py-[0.625rem] px-[1.5rem] text-base text-black bg-white border rounded-lg hover:bg-gray-100 transition-colors">
                        Get Started
                    </button>
                </div>
            </div>

            <!-- Admin Mobile Menu -->
            <div
                v-else-if="isMobileMenuOpen && admin_user"
                class="md:hidden bg-[#1a2530] border-t border-gray-700">
                <div class="px-4 py-4 space-y-3">
                    <NuxtLink
                        to="/admin-panel"
                        @click="toggleMobileMenu"
                        class="block w-full text-center py-[0.625rem] px-[1.5rem] text-base text-black bg-white border rounded-lg hover:bg-gray-100 transition-colors">
                        Admin Panel
                    </NuxtLink>
                </div>
            </div>

            <!-- Citizen Mobile Menu -->
            <div
                v-else-if="isMobileMenuOpen && hasCitizenDashboardAccess"
                class="md:hidden bg-[#1a2530] border-t border-gray-700">
                <div class="px-4 py-4 space-y-3">
                    <button
                        @click="handleDashboardRedirect(citizen_user)"
                        class="block w-full text-center py-[0.625rem] px-[1.5rem] text-base text-black bg-white border rounded-lg hover:bg-gray-100 transition-colors">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </transition>
    </nav>

    <AuthCitizenAuthModals
        v-model:isOpenStartModal="isOpenStartModal"
        :initialStep="initialStep" />
</template>

<style></style>
