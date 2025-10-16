<script setup>
    definePageMeta({
        layout: 'citizen',
    });

    // Active tab state
    const activeTab = ref('home'); 
</script>

<template>
    <div class="space-y-4 lg:space-y-6">
        <!-- Tab Navigation -->
        <div class="bg-white rounded-lg p-3 lg:p-4">
            <div class="flex items-center gap-3">
                <button
                    @click="activeTab = 'home'"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeTab === 'home'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                    ]">
                    Home
                </button>
                <button
                    @click="activeTab = 'videos'"
                    :class="[
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeTab === 'videos'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                    ]">
                    Videos
                </button>
            </div>
        </div>

        <!-- Content based on active tab -->
        <SearchProperty v-if="activeTab === 'home'" />
        <SearchVideo v-else-if="activeTab === 'videos'" />
    </div>
</template>