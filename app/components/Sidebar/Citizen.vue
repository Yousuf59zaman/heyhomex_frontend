<template>
    <aside class="fixed left-0 top-0 h-full w-[70px] bg-[#F66] border-r border-gray-200 z-40 flex flex-col items-center py-4">
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
                <li>
                    <NuxtLink 
                        to="/admin" 
                        class="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
                        active-class="bg-blue-50 text-blue-700"
                    >
                        <Icon name="lucide:home" class="w-5 h-5" />
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink 
                        to="/admin/properties" 
                        class="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Icon name="lucide:building" class="w-5 h-5" />
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink 
                        to="/admin/analytics" 
                        class="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Icon name="lucide:bar-chart" class="w-5 h-5" />
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink 
                        to="/admin/users" 
                        class="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Icon name="lucide:users" class="w-5 h-5" />
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink 
                        to="/admin/settings" 
                        class="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Icon name="lucide:settings" class="w-5 h-5" />
                    </NuxtLink>
                </li>
            </ul>
        </nav>
    </aside>
</template>

<script setup>
// Sidebar component
</script>

<style scoped>
/* Sidebar styles */
</style>