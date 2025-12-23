<script setup>
    const {citizen_user} = citizenAuth()

    defineEmits(["close-menu"])

    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false,
        },
    })

    const route = useRoute()

    const getUserName = computed(() => {
        if (!citizen_user.value) return "User"

        if (citizen_user.value.data?.name) {
            return citizen_user.value.data.name.split(" ")[0]
        }

        if (citizen_user.value.data?.first_name) {
            return citizen_user.value.data.first_name
        }

        if (citizen_user.value.data?.email) {
            return citizen_user.value.data.email.split("@")[0]
        }

        return "User"
    })

    const getUserInitial = computed(() => {
        return getUserName.value.charAt(0).toUpperCase()
    })

    const getUserType = computed(() => {
        if (!citizen_user.value) return "Citizen"

        if (
            citizen_user.value.data?.user_type &&
            citizen_user.value.data.user_type.length > 0
        ) {
            const userType = citizen_user.value.data.user_type[0]

            return (
                userType.name ||
                userType.slug?.charAt(0).toUpperCase() +
                    userType.slug?.slice(1) ||
                "Citizen"
            )
        }

        return "Citizen"
    })

    const sidebarColor = computed(() => {
        const currentPath = route.path
        if (currentPath.includes("kamaina")) {
            return "#FF6666"
        } else if (currentPath.includes("military")) {
            return "#6E9EF3"
        } else if (currentPath.includes("investor")) {
            return "#333365"
        }
        return "#FF6666"
    })

    const getBasePath = computed(() => {
        const currentPath = route.path
        if (currentPath.includes("kamaina")) return "/kamaina"
        else if (currentPath.includes("military")) return "/military"
        else return "/investor"
    })

    // Main navigation items (above separator line) - order matches Figma design
    const mainNavigationItems = computed(() => [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "/svg/menubar/dashboard.svg",
            iconType: "svg",
            path: getBasePath.value,
        },
        {
            id: "favourites",
            label: "Favourites",
            icon: "/svg/menubar/favourite.svg",
            iconType: "svg",
            path: `${getBasePath.value}/favorites`,
        },
        {
            id: "Search",
            label: "Search",
            icon: "/svg/menubar/search.svg",
            iconType: "svg",
            path: `${getBasePath.value}/search`,
        },
        {
            id: "videos",
            label: "Videos",
            icon: "/svg/menubar/video.svg",
            iconType: "svg",
            path: `${getBasePath.value}/videos`,
        },
        {
            id: "reports",
            label: "Reports",
            icon: "/svg/menubar/search.svg",
            iconType: "svg",
            path: `#`,
        },
    ])

    // Settings item (below separator line)
    const settingsItem = computed(() => ({
        id: "settings",
        label: "Settings",
        icon: "/svg/menubar/setting.svg",
        iconType: "svg",
        path: `${getBasePath.value}/settings`,
    }))

    // All navigation items for mobile (combined, no separator)
    const navigationItems = computed(() => [
        ...mainNavigationItems.value,
        settingsItem.value,
    ])
</script>

<template>
    <!-- Desktop Sidebar -->
    <aside
        v-if="!isMobile"
        class="h-full w-[69px] flex flex-col items-center py-7"
        :style="{backgroundColor: sidebarColor}">
        <div class="mb-6 subscription-glow">
            <NuxtLink :to="`${getBasePath}/subscription`">
                <div class="glow-ring"></div>
                <img
                    src="/svg/dashboard/home_logo.svg"
                    alt="HeyHome Logo"
                    class="h-8 w-8 rounded cursor-pointer hover:opacity-80 transition-opacity relative z-10" />
            </NuxtLink>
        </div>

        <!-- Navigation Icons -->
        <nav class="flex-1 flex flex-col">
            <ul class="space-y-2.5">
                <li
                    v-for="item in mainNavigationItems"
                    :key="item.id">
                    <NuxtLink
                        :to="item.path"
                        class="sidebar-link flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200"
                        active-class="sidebar-link-active">
                        <Icon
                            v-if="item.iconType === 'lucide'"
                            :name="item.icon"
                            class="w-5 h-5" />
                        <img
                            v-else-if="item.iconType === 'svg'"
                            :src="item.icon"
                            :alt="item.label"
                            class="sidebar-icon w-5 h-5" />
                    </NuxtLink>
                </li>
            </ul>

            <!-- Separator Line -->
            <div class="my-3 mx-auto w-10 h-px bg-white/30"></div>

            <!-- Settings -->
            <NuxtLink
                :to="settingsItem.path"
                class="sidebar-link flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 mx-auto"
                active-class="sidebar-link-active">
                <img
                    :src="settingsItem.icon"
                    :alt="settingsItem.label"
                    class="sidebar-icon w-5 h-5" />
            </NuxtLink>
        </nav>
    </aside>

    <!-- Mobile Sidebar Menu -->
    <aside
        v-else
        class="h-full w-64 flex flex-col"
        :style="{backgroundColor: sidebarColor}">
        <div
            class="flex items-center justify-between p-4 border-b border-white/20">
            <div class="flex items-center space-x-3">
                <img
                    src="/images/home/home_logo.png"
                    alt="HeyHome Logo"
                    class="h-8 w-8 rounded" />
                <span class="text-lg font-semibold text-white">HeyHome</span>
            </div>
            <button
                @click="$emit('close-menu')"
                class="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <Icon
                    name="lucide:x"
                    class="w-5 h-5 text-white" />
            </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 py-6">
            <ul class="space-y-2">
                <li
                    v-for="item in navigationItems"
                    :key="item.id">
                    <NuxtLink
                        :to="item.path"
                        class="mobile-sidebar-link flex items-center space-x-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200"
                        active-class="mobile-sidebar-link-active"
                        @click="$emit('close-menu')">
                        <Icon
                            v-if="item.iconType === 'lucide'"
                            :name="item.icon"
                            class="w-5 h-5" />
                        <img
                            v-else-if="item.iconType === 'svg'"
                            :src="item.icon"
                            :alt="item.label"
                            class="mobile-sidebar-icon w-5 h-5" />
                        <span class="font-medium">{{ item.label }}</span>
                    </NuxtLink>
                </li>
            </ul>
        </nav>

        <!-- User Profile Section -->
        <div class="p-4 border-t border-white/20">
            <div class="flex items-center space-x-3">
                <div
                    class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-medium">{{
                        getUserInitial
                    }}</span>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-white">
                        {{ getUserName }}
                    </p>
                    <p class="text-xs text-white/70">{{ getUserType }}</p>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped>
    .sidebar-link {
        position: relative;
    }

    .sidebar-link .sidebar-icon {
        filter: brightness(0) invert(1) opacity(0.8);
        transition: all 0.2s ease;
    }

    .sidebar-link:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    .sidebar-link:hover .sidebar-icon {
        filter: brightness(0) invert(1) opacity(1);
        transform: scale(1.05);
    }

    .sidebar-link-active {
        background-color: white !important;
    }

    .sidebar-link-active .sidebar-icon {
        filter: brightness(0) !important;
        opacity: 1 !important;
        -webkit-filter: brightness(0) !important;
    }

    /* Ensure hover doesn't override active state */
    .sidebar-link-active:hover .sidebar-icon {
        filter: brightness(0) !important;
        -webkit-filter: brightness(0) !important;
        transform: scale(1);
    }

    /* Mobile Sidebar Styles */
    .mobile-sidebar-link {
        color: #ffffff;
    }

    /* Default state - white icons */
    .mobile-sidebar-link .mobile-sidebar-icon {
        filter: brightness(0) saturate(100%) invert(100%);
        transition: all 0.2s ease;
    }

    /* Hover state */
    .mobile-sidebar-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    .mobile-sidebar-link:hover .mobile-sidebar-icon {
        filter: brightness(0) saturate(100%) invert(100%);
    }

    .mobile-sidebar-link-active {
        background-color: rgba(255, 255, 255, 0.2) !important;
        color: #ffffff !important;
    }

    .mobile-sidebar-link-active .mobile-sidebar-icon {
        filter: brightness(0) saturate(100%) invert(100%) !important;
    }

    /* Subscription button glow effect */
    .subscription-glow {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .glow-ring {
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
        animation: pulse-ring 1.5s ease-in-out infinite;
        z-index: 1;
    }

    @keyframes pulse-ring {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.7;
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8),
                        0 0 15px 3px rgba(255, 255, 255, 0.6),
                        0 0 25px 5px rgba(255, 255, 255, 0.4);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 1;
            box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.5),
                        0 0 25px 8px rgba(255, 255, 255, 0.8),
                        0 0 40px 12px rgba(255, 255, 255, 0.6),
                        0 0 55px 15px rgba(255, 255, 255, 0.4);
        }
    }
</style>
