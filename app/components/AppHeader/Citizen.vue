<template>
    <header class=" border-b border-gray-200 px-4 lg:px-7 py-3 lg:py-6">
        <div class="flex items-center justify-between">
            <!-- Left Side - Welcome Message -->
            <div class="flex flex-col">
                <div class="flex items-center space-x-2">
                    <!-- User Avatar -->
                    <img
                        class="w-10"
                        src="/images/home/home_logo.png"
                        alt="" />

                    <!-- Welcome Text -->
                    <div>
                        <h1 style=" letter-spacing: 1px;" class="text-3xl font-extrabold text-[#2C3E50]">
                            Welcome back, Priad!
                        </h1>
                    </div>
                </div>
                <p style="letter-spacing: 1px;" class="text-[#283849] text-sm mt-2 font-extralight">Your local community insights are just a click away.</p>
            </div>

            <!-- Right Side Actions -->
            <div class="flex items-center space-x-4">


                <!-- Notification Bell Icon -->
                <button
                    class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <img src="/svg/dashboard/bell-icon.svg" alt="">
                </button>
                <!-- Refresh Icon -->
                <button
                    class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Icon
                        name="lucide:refresh-cw"
                        class="w-5 h-5" />
                </button>

                
            </div>
        </div>
    </header>
</template>

<script setup>
    // Define emits
    defineEmits(['toggle-mobile-menu']);
</script>

<style scoped>
    /* Header styles */
</style>
