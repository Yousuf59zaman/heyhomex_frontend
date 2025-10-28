<script setup>
    const showingNavigationDropdown = ref(false);
    const dropdownRef = ref(null);
    const { admin_user = {}, logout } = adminAuth();

    onMounted(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.value &&
                !dropdownRef.value.contains(event.target)
            ) {
                showingNavigationDropdown.value = false;
            }
        };

        document.addEventListener('click', handleClickOutside);

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
        });
    });

    const hamburger_button = useState('hamburger_button');
    const isMobile = useState('isMobile');
</script>
<template>
    <!-- <pre>{{ admin_user }}</pre> -->
    <nav class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div class="relative flex h-14 items-center justify-between">
                <div class="flex flex-1 items-center justify-start sm:items-stretch sm:justify-start">
                    <button v-if="!hamburger_button && isMobile" @click="hamburger_button = !hamburger_button"
                        class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none transition duration-150 ease-in-out">
                        <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path :class="{
                                    hidden: hamburger_button,
                                    'inline-flex': !hamburger_button,
                                }" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                            <path :class="{
                                    hidden: !hamburger_button,
                                    'inline-flex': hamburger_button,
                                }" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <!-- Profile dropdown -->
                    <div class="flex items-center justify-center">
                        <div class="relative flex items-center gap-3" ref="dropdownRef">
                            <!-- <ColorMode class="mt-1.5" /> -->
                            <button @click.stop="
                                    showingNavigationDropdown =
                                        !showingNavigationDropdown
                                " class="flex items-center transition-transform duration-200 hover:scale-105">
                                <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                                    shape="circle" class="border-2 border-gray-200 dark:border-gray-700" />
                            </button>
                            <!-- Dropdown menu -->
                            <transition enter-active-class="transition duration-200 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-100 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <div v-if="showingNavigationDropdown" @click.stop
                                    class="absolute right-0 top-12 w-72 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div class="p-4 border-b border-gray-100 dark:border-gray-700">
                                        <div class="flex items-center gap-3">
                                            <Avatar
                                                image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                                                shape="circle"
                                                class="w-12 h-12 border-2 border-gray-200 dark:border-gray-700" />
                                            <div class="flex flex-col">
                                                <span class="font-medium text-gray-900 dark:text-white truncate">
                                                    {{
                                                    admin_user?.data?.name

                                                    }}
                                                </span>
                                                <span class="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {{ admin_user?.data?.email }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-2 border-b border-gray-100 dark:border-gray-700">
                                        <NuxtLink to="/"
                                            class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/20 rounded-lg transition-colors duration-150 flex items-center gap-2">
                                            <i class="fas fa-home"></i>
                                            <span>Switch to Home</span>
                                        </NuxtLink>
                                    </div>
                                    <div class="p-2">
                                        <button @click="logout"
                                            class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150 flex items-center gap-2">
                                            <i class="fas fa-sign-out-alt"></i>
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            </transition>
                        </div>
                        <SidebarAdmin />
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
