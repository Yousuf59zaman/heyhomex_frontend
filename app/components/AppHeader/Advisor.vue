<script setup>
    import Avatar from 'primevue/avatar';

    const props = defineProps({
        isMobileMenuOpen: {
            type: Boolean,
            default: false,
        },
    });

    defineEmits(['toggle-mobile-menu']);
</script>

<template>
    <header class="px-4 lg:px-4 py-3 lg:py-6">
        <!-- Mobile Header -->
        <div class="flex items-center justify-between lg:hidden">
            <!-- Left Side - Logo -->
            <div class="flex items-center space-x-3">
                <!-- Logo -->
                <NuxtLink to="/advisor">
                    <img
                        class="w-8 h-8"
                        src="/svg/dashboard/home_logo.svg"
                        alt="HeyHome Logo" />
                </NuxtLink>
            </div>

            <!-- Right Side - Notification and Profile -->
            <div class="flex items-center space-x-2">
                <!-- Notification Bell Icon -->
                <button
                    class="text-gray-400 hover:text-gray-600 transition-colors">
                    <img
                        src="/svg/dashboard/bell-icon.svg"
                        alt="" />
                </button>

                <!-- Hamburger Menu -->
                <button
                    @click="$emit('toggle-mobile-menu')"
                    class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Icon
                        name="lucide:menu"
                        class="w-6 h-6 text-gray-700" />
                </button>
            </div>
        </div>

        <!-- Desktop Header -->
        <div class="hidden lg:flex items-center justify-between">
            <!-- Left side - Greeting -->
            <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-1">
                    Good Morning, Advisor!
                </h1>
                <p class="text-gray-600">
                    Here's your advertising campaign overview for today.
                </p>
            </div>

            <!-- Right side - Profile and Notifications -->
            <div class="flex items-center space-x-4">
                <!-- Notification Bell -->
                <div class="relative">
                    <button
                        class="text-gray-400 hover:text-gray-600 transition-colors p-2">
                        <img
                            src="/svg/dashboard/bell-icon.svg"
                            alt=""
                            class="w-6 h-6" />
                    </button>
                    <!-- Notification Badge -->
                    <span
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        3
                    </span>
                </div>

                <!-- Profile Avatar -->
                <div class="flex items-center space-x-3">
                    <Avatar
                        label="A"
                        size="normal"
                        shape="circle"
                        class="bg-green-500 text-white" />
                    <div class="hidden xl:block">
                        <p class="text-sm font-medium text-gray-900">
                            Advisor Name
                        </p>
                        <p class="text-xs text-gray-500">Campaign Manager</p>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>