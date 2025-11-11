<script setup>
    import Avatar from "primevue/avatar"
    import Menu from "primevue/menu"

    const { citizen_user, logout, isLoadingLogout } = citizenAuth()

    const isScroll = ref(false)
    const menu = ref()
    const profileMenuItems = ref([
        {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => {
                navigateTo('/kamaina/profile')
            }
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => {
                navigateTo('/kamaina/settings')
            }
        },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: async () => {
                await handleLogout()
            }
        }
    ])

    const props = defineProps({
        isMobileMenuOpen: {
            type: Boolean,
            default: false,
        },
    })

    const handleScroll = () => {
        isScroll.value = window.screenY > 0
    }

    const toggleProfileMenu = (event) => {
        menu.value.toggle(event)
    }

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const getUserName = computed(() => {
        if (!citizen_user.value) return 'User'
        
        // Check for name field
        if (citizen_user.value.name) {
            return citizen_user.value.name.split(' ')[0]
        }
        
        // Check for first_name field
        if (citizen_user.value.first_name) {
            return citizen_user.value.first_name
        }
        
        // Check for email
        if (citizen_user.value.email) {
            return citizen_user.value.email.split('@')[0]
        }
        
        return 'User'
    })

    const getUserInitial = computed(() => {
        return getUserName.value.charAt(0).toUpperCase()
    })

    onMounted(() => {
        window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
    })

    defineEmits(["toggle-mobile-menu"])
</script>

<template>
    <header class=" sticky top-0 bg-white z-10 px-4 lg:px-4 py-3 lg:py-6" >
        <!-- Mobile Header -->
        <div class="flex items-center justify-between lg:hidden">
            <!-- Left Side - Hamburger and Logo -->
            <div class="flex items-center space-x-3">
                <!-- Logo -->
                <NuxtLink to="/kamaina">
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
                        alt="Notifications" />
                </button>

                <!-- Profile Avatar -->
                <Button 
                    @click="toggleProfileMenu"
                    class="flex items-center rounded-lg hover:bg-gray-100 p-2">
                    <Avatar
                        :label="getUserInitial"
                        class="avatar-bg"
                        shape="circle" />
                </Button>
                
                <!-- Profile Menu -->
                <Menu 
                    ref="menu" 
                    :model="profileMenuItems" 
                    :popup="true"
                    :pt="{
                        root: 'mt-2 w-48 shadow-lg rounded-lg border border-gray-200',
                        menu: 'p-2',
                        menuitem: 'rounded-md',
                        action: 'px-3 py-2 hover:bg-gray-100 rounded-md transition-colors',
                        separator: 'my-2 border-t border-gray-200'
                    }" />

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
                    <NuxtLink to="/kamaina">
                        <img
                            class="w-8 h-8"
                            src="/svg/dashboard/home_logo.svg"
                            alt="HeyHome Logo" />
                    </NuxtLink>

                    <!-- Welcome Text -->
                    <div>
                        <h1
                            style="letter-spacing: 1px"
                            class="text-[1.655rem] font-extrabold text-[#2C3E50]">
                            Welcome back, {{ getUserName }}!
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
                        alt="Notifications" />
                </button>

                <div class="w-[1px] h-[20px] bg-[#D4D4D4]"></div>

                <!-- Profile Icon with Dropdown -->
                <Button 
                    @click="toggleProfileMenu"
                    :disabled="isLoadingLogout"
                    class="flex items-center rounded-lg hover:bg-gray-100 gap-2">
                    <Avatar
                        :label="getUserInitial"
                        class="avatar-bg"
                        shape="circle" />
                    <span class="text-sm font-medium text-gray-700">{{ getUserName }}</span>
                    <Icon 
                        name="lucide:chevron-down" 
                        class="w-4 h-4 text-gray-500" />
                </Button>
                
                <!-- Profile Menu -->
                <Menu 
                    ref="menu" 
                    :model="profileMenuItems" 
                    :popup="true"
                    :pt="{
                        root: 'mt-2 w-48 shadow-lg rounded-lg border border-gray-200',
                        menu: 'p-2',
                        menuitem: 'rounded-md',
                        action: 'px-3 py-2 hover:bg-gray-100 rounded-md transition-colors',
                        separator: 'my-2 border-t border-gray-200'
                    }" />
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
