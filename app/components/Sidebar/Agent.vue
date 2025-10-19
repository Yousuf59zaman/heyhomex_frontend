<script setup>
    const props = defineProps({
        isMobile: {
            type: Boolean,
            default: false,
        },
    });

    defineEmits(['close-menu']);

    // Get current route
    const route = useRoute();

    // Agent theme color (different from citizen)
    const sidebarBackgroundColor = '#2C3E50'; // Professional dark blue-gray

    // Navigation items for agent
    const navigationItems = ref([
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '/svg/menubar/dashboard.svg',
            iconType: 'svg',
            path: '/agent',
        },
        {
            id: 'leads',
            label: 'Leads',
            icon: 'lucide:users',
            iconType: 'lucide',
            path: '/agent/leads',
        },
        {
            id: 'properties',
            label: 'Properties',
            icon: '/svg/menubar/search.svg',
            iconType: 'svg',
            path: '/agent/properties',
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: 'lucide:bar-chart-3',
            iconType: 'lucide',
            path: '/agent/analytics',
        },
        {
            id: 'clients',
            label: 'Clients',
            icon: 'lucide:user-check',
            iconType: 'lucide',
            path: '/agent/clients',
        },
        {
            id: 'calendar',
            label: 'Calendar',
            icon: 'lucide:calendar',
            iconType: 'lucide',
            path: '/agent/calendar',
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: 'lucide:file-text',
            iconType: 'lucide',
            path: '/agent/reports',
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: '/svg/menubar/setting.svg',
            iconType: 'svg',
            path: '/agent/settings',
        },
    ]);
</script>

<template>
    <!-- Desktop Sidebar -->
    <aside
        v-if="!isMobile"
        class="h-full w-[69px] flex flex-col items-center py-4"
        :style="{ backgroundColor: sidebarBackgroundColor }">
        <!-- Logo Section -->
        <div class="mb-8">
            <img
                src="/images/home/home_logo.png"
                alt="HeyHome Logo"
                class="h-8 w-8 rounded" />
        </div>

        <!-- Navigation Icons -->
        <nav class="flex-1">
            <ul class="space-y-4">
                <li
                    v-for="item in navigationItems"
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
        </nav>
    </aside>

    <!-- Mobile Sidebar Menu -->
    <aside
        v-else
        class="h-full w-64 flex flex-col"
        :style="{ backgroundColor: sidebarBackgroundColor }">
        <!-- Header -->
        <div
            class="flex items-center justify-between p-4 border-b border-white/20">
            <div class="flex items-center space-x-3">
                <img
                    src="/images/home/home_logo.png"
                    alt="HeyHome Logo"
                    class="h-8 w-8 rounded" />
                <span class="text-lg font-semibold text-white"
                    >HeyHome Agent</span
                >
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
                        class="mobile-sidebar-link flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-all duration-200"
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
                    <span class="text-white text-sm font-medium">A</span>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-white">Agent Name</p>
                    <p class="text-xs text-white/70">Real Estate Agent</p>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped>
    /* Desktop Sidebar Styles */
    .sidebar-link {
        position: relative;
        color: white; /* Make Lucide icons white by default */
    }

    /* Default state - fully white icons */
    .sidebar-link .sidebar-icon {
        filter: brightness(0) invert(1) opacity(1);
        transition: all 0.2s ease;
    }

    /* Hover state - fully opaque white icons with background */
    .sidebar-link:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    .sidebar-link:hover .sidebar-icon {
        filter: brightness(0) invert(1) opacity(1);
        transform: scale(1.05);
    }

    /* Active state - white background with black icons */
    .sidebar-link-active {
        background-color: white !important;
        color: black !important; /* Make Lucide icons black when active */
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
</style>
