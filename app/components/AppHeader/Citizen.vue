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
            <!-- Left Side - Hamburger and Logo -->
            <div class="flex items-center space-x-3">
                <!-- Logo -->
                <img
                    class="w-8 h-8"
                    src="/svg/dashboard/home_logo.svg"
                    alt="HeyHome Logo" />
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
            <!-- Left Side - Welcome Message -->
            <div class="flex flex-col">
                <div class="flex items-center space-x-2">
                    <!-- User Avatar -->
                    <img
                        class="w-10"
                        src="/svg/dashboard/home_logo.svg"
                        alt="" />

                    <!-- Welcome Text -->
                    <div>
                        <h1
                            style="letter-spacing: 1px"
                            class="text-[1.655rem] font-extrabold text-[#2C3E50]">
                            Welcome back, Priad!
                        </h1>
                    </div>
                </div>
                <p
                    style="letter-spacing: 0.5px"
                    class="text-gray-600 text-[0.775rem] mt-2 font-extralight">
                    Your local community insights are just a click away.
                </p>
            </div>

            <!-- Right Side Actions -->
            <div class="flex items-center space-x-2">
                <!-- Notification Bell Icon -->
                <button
                    class="text-gray-400 hover:text-gray-600 transition-colors">
                    <img
                        src="/svg/dashboard/bell-icon.svg"
                        alt="" />
                </button>

                <div class="w-[1px] h-[20px] bg-[#D4D4D4]"></div>

                <!-- Profile Icon -->
                <Button class="flex items-center rounded-lg hover:bg-gray-100">
                    <Avatar
                        label="U"
                        class="avatar-bg"
                        shape="circle" />
                </Button>
            </div>
        </div>
    </header>
</template>

<style scoped>
    :deep(.p-button) {
        background-color: #faf9f8;
        border: none;
        padding: 5px;
    }
    :deep(.p-button:hover) {
        background-color: #faf9f8;
        outline: none;
        border: none;
        padding: 5px;
    }
</style>
