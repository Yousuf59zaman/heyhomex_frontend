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
                        class="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        active-class="bg-blue-50 text-blue-700"
                    >
                        <Icon v-if="item.iconType === 'lucide'" :name="item.icon" class="w-5 h-5" />
                        <img v-else-if="item.iconType === 'svg'" :src="item.icon" :alt="item.label" class="w-5 h-5" />
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
                        class="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        active-class="bg-blue-50 text-blue-700"
                        @click="$emit('close-menu')"
                    >
                        <Icon v-if="item.iconType === 'lucide'" :name="item.icon" class="w-5 h-5" />
                        <img v-else-if="item.iconType === 'svg'" :src="item.icon" :alt="item.label" class="w-5 h-5" />
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
        iconType: 'svg', // 'lucide' or 'svg'
        path: '/svg/menubar/dashboard.svg'
    },
    {
        id: 'properties',
        label: 'Properties',
        icon: '/svg/menubar/favourite.svg',
        iconType: 'svg',
        path: '/svg/menubar/dashboard.svg'
    },
    {
        id: 'search',
        label: 'Analytics',
        icon: '/svg/menubar/search.svg',
        iconType: 'svg',
        path: '/svg/menubar/favourite.svg'
    },
    {
        id: 'users',
        label: 'Users',
        icon: '/svg/menubar/video.svg',
        iconType: 'svg',
        path: '/svg/menubar/favourite.svg'
    },
    {
        id: 'search',
        label: 'Analytics',
        icon: '/svg/menubar/search.svg',
        iconType: 'svg',
        path: '/svg/menubar/favourite.svg'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: '/svg/menubar/setting.svg',
        iconType: 'svg',
        path: '/svg/menubar/setting.svg'
    }
]);
</script>

<style scoped>
/* Sidebar styles */
</style>