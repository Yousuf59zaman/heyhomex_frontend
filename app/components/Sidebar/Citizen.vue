<template>
    <!-- Desktop Sidebar -->
    <aside v-if="!isMobile" class="h-full w-[69px] bg-[#FF6666] flex flex-col items-center py-4">
        <!-- Logo Section -->
        <div class="mb-8">
            <img 
                src="/images/home/home_logo.png" 
                alt="HeyHome Logo" 
                class="h-8 w-8 rounded"
            />
        </div>

        <!-- Navigation Icons -->
        <nav class="flex-1">
            <ul class="space-y-4">
                <li v-for="item in navigationItems" :key="item.id">
                    <NuxtLink 
                        :to="item.path" 
                        class="sidebar-link flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200"
                        active-class="sidebar-link-active"
                    >
                        <Icon v-if="item.iconType === 'lucide'" :name="item.icon" class="w-5 h-5" />
                        <img 
                            v-else-if="item.iconType === 'svg'" 
                            :src="item.icon" 
                            :alt="item.label" 
                            class="sidebar-icon w-5 h-5"
                        />
                    </NuxtLink>
                </li>
            </ul>
        </nav>
    </aside>

    <!-- Mobile Sidebar Menu -->
    <aside v-else class="h-full w-64 bg-white flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <div class="flex items-center space-x-3">
                <img 
                    src="/images/home/home_logo.png" 
                    alt="HeyHome Logo" 
                    class="h-8 w-8 rounded"
                />
                <span class="text-lg font-semibold text-gray-900">HeyHome</span>
            </div>
            <button 
                @click="$emit('close-menu')"
                class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Icon name="lucide:x" class="w-5 h-5 text-gray-600" />
            </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 py-6">
            <ul class="space-y-2">
                <li v-for="item in navigationItems" :key="item.id">
                    <NuxtLink 
                        :to="item.path" 
                        class="mobile-sidebar-link flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-all duration-200"
                        active-class="mobile-sidebar-link-active"
                        @click="$emit('close-menu')"
                    >
                        <Icon v-if="item.iconType === 'lucide'" :name="item.icon" class="w-5 h-5" />
                        <img 
                            v-else-if="item.iconType === 'svg'" 
                            :src="item.icon" 
                            :alt="item.label" 
                            class="mobile-sidebar-icon w-5 h-5"
                        />
                        <span class="font-medium">{{ item.label }}</span>
                    </NuxtLink>
                </li>
            </ul>
        </nav>

        <!-- User Profile Section -->
        <div class="p-4 border-t border-gray-200">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-medium">U</span>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">Priad</p>
                    <p class="text-xs text-gray-500">Citizen</p>
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
const props = defineProps({
    isMobile: {
        type: Boolean,
        default: false
    }
});

defineEmits(['close-menu']);

// Navigation items data
const navigationItems = ref([
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '/svg/menubar/dashboard.svg',
        iconType: 'svg',
        path: '/kamaina'
    },
    {
        id: 'properties',
        label: 'Properties',
        icon: '/svg/menubar/search.svg',
        iconType: 'svg',
        path: '/kamaina/search'
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: '/svg/menubar/video.svg',
        iconType: 'svg',
        path: '/kamaina/seatchvideo'
    },
    {
        id: 'users',
        label: 'Users',
        icon: '/svg/menubar/favourite.svg',
        iconType: 'svg',
        path: '/users'
    },
    {
        id: 'reports',
        label: 'Reports',
        icon: '/svg/menubar/search.svg',
        iconType: 'svg',
        path: '/reports'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: '/svg/menubar/setting.svg',
        iconType: 'svg',
        path: '/settings'
    }
]);
</script>

<style scoped>
/* Desktop Sidebar Styles */
.sidebar-link {
    position: relative;
}

/* Default state - semi-transparent white icons */
.sidebar-link .sidebar-icon {
    filter: brightness(0) invert(1) opacity(0.6);
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
    color: #4B5563;
}

/* Default state - gray icons */
.mobile-sidebar-link .mobile-sidebar-icon {
    filter: brightness(0) saturate(100%) invert(38%) sepia(8%) saturate(645%) hue-rotate(182deg) brightness(93%) contrast(88%);
    transition: all 0.2s ease;
}

/* Hover state */
.mobile-sidebar-link:hover {
    background-color: #F3F4F6;
    color: #111827;
}

.mobile-sidebar-link:hover .mobile-sidebar-icon {
    filter: brightness(0) saturate(100%) invert(7%) sepia(7%) saturate(2353%) hue-rotate(183deg) brightness(96%) contrast(92%);
}

/* Active state - blue background with blue icons */
.mobile-sidebar-link-active {
    background-color: #EFF6FF !important;
    color: #2563EB !important;
}

.mobile-sidebar-link-active .mobile-sidebar-icon {
    filter: brightness(0) saturate(100%) invert(36%) sepia(88%) saturate(2527%) hue-rotate(213deg) brightness(95%) contrast(91%) !important;
}
</style>