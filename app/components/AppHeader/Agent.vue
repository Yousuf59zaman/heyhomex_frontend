<script setup>
import Avatar from "primevue/avatar"
import Menu from "primevue/menu"

const { citizen_user, logout, isLoadingLogout } = citizenAuth()

const isScroll = ref(false)
const menu = ref()
const unreadCount = ref(0)

const profileMenuItems = ref([
    {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: async () => {
            await handleLogout()
        },
    },
])

const props = defineProps({
    isMobileMenuOpen: {
        type: Boolean,
        default: false,
    },
})

// Fetch unread notification count
const fetchUnreadCount = async () => {
    try {
        const response = await $fetchCitizen('agent/v1/leads/notifications', {
            method: 'GET',
            params: { read_status: 'unread', page: 1 }
        })
        if (response.status === 'success') {
            unreadCount.value = response.data.total || 0
        }
    } catch (e) {
        console.error('Failed to fetch unread notifications:', e)
    }
}

const handleScroll = () => {
    isScroll.value = window.scrollY > 0
}

const toggleProfileMenu = (event) => {
    menu.value.toggle(event)
}

const handleLogout = async () => {
    try {
        await logout()
    } catch (error) {
        console.error("Logout error:", error)
    }
}

const getUserName = computed(() => {
    if (!citizen_user.value) return "User"
    if (citizen_user.value.data?.name) {
        return citizen_user.value.data.name.split(" ")[0]
    }
    if (citizen_user.value.data?.first_name) {
        return citizen_user.value.data.first_name
    }

    if (citizen_user.value.data?.email) {
        return citizen_user.value.data.email.split("@")[0]
    }

    return "User"
})

const getUserInitial = computed(() => {
    return getUserName.value.charAt(0).toUpperCase()
})

const getUserProfilePic = computed(() => {
    if (!citizen_user.value?.data) return null
    return citizen_user.value.data.profile_pic || citizen_user.value.data.photo || null
})

onMounted(() => {
    window.addEventListener("scroll", handleScroll)
    fetchUnreadCount()
    // Refresh count every 30 seconds
    setInterval(fetchUnreadCount, 30000)
})

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll)
})

defineEmits(["toggle-mobile-menu"])
</script>

<template>
    <header class="sticky top-0 bg-white z-10 px-4 lg:px-4 py-3 lg:py-6">
        <!-- Mobile Header -->
        <div class="flex items-center justify-between lg:hidden">
            <!-- Left -->
            <div class="flex items-center space-x-3">
                <NuxtLink to="/agent">
                    <img class="w-8 h-8" src="/svg/dashboard/home_logo.svg" alt="HeyHome Logo" />
                </NuxtLink>
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-800">{{
                        getUserName
                        }}</span>
                    <span class="text-xs text-gray-500">Agent</span>
                </div>
            </div>

            <!-- Right Side - Notification and Profile -->
            <div class="flex items-center space-x-2">
                <NuxtLink :to="`/agent/notifications`" type="button"
                    class="text-gray-400 hover:text-gray-600 transition-colors p-2 flex items-center flex-shrink-0 relative">
                    <img src="/svg/dashboard/bell-icon.svg" alt="Notifications" class="w-6 h-6 flex-shrink-0" />
                    <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </NuxtLink>

                <Button @click="toggleProfileMenu" :disabled="isLoadingLogout"
                    class="flex items-center rounded-lg hover:bg-gray-100 p-2">
                    <Avatar v-if="!getUserProfilePic" :label="getUserInitial" class="avatar-bg" size="normal"
                        shape="circle" />
                    <Avatar v-else :image="getUserProfilePic" class="avatar-bg" size="normal" shape="circle" />
                </Button>

                <Menu ref="menu" :model="profileMenuItems" :popup="true" :pt="{
                    root: 'mt-2 w-48 shadow-lg rounded-lg border border-gray-200',
                    menu: 'p-2',
                    menuitem: 'rounded-md',
                    action: 'px-3 py-2 hover:bg-gray-100 rounded-md transition-colors',
                    separator: 'my-2 border-t border-gray-200',
                }" />

                <!-- Hamburger Menu -->
                <button @click="$emit('toggle-mobile-menu')" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Icon name="lucide:menu" class="w-6 h-6 text-gray-700" />
                </button>
            </div>
        </div>

        <!-- Desktop Header -->
        <div class="hidden lg:flex items-center justify-between">
            <!-- Left Side -->
            <div class="flex flex-col">
                <div class="flex items-center space-x-2">
                    <NuxtLink to="/agent">
                        <img class="w-8 h-8" src="/svg/dashboard/home_logo.svg" alt="HeyHome Logo" />
                    </NuxtLink>

                    <!-- Welcome Text -->
                    <div>
                        <h1 style="letter-spacing: 1px" class="text-[1.655rem] font-extrabold text-[#2C3E50]">
                            Welcome back, {{ getUserName }}!
                        </h1>
                    </div>
                </div>
                <p style="letter-spacing: 0.5px" class="text-gray-600 text-[0.775rem] mt-2 font-extralight">
                    Manage your leads, track performance, and grow your
                    business.
                </p>
            </div>

            <!-- Right Side Actions -->
            <div class="flex items-center space-x-2">
                <NuxtLink :to="`/agent/notifications`" class="text-gray-400 hover:text-gray-600 transition-colors relative">
                    <img src="/svg/dashboard/bell-icon.svg" alt="Notifications" />
                    <span v-if="unreadCount > 0" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </NuxtLink>

                <div class="w-[1px] h-[20px] bg-[#D4D4D4]"></div>

                <Button @click="toggleProfileMenu" :disabled="isLoadingLogout"
                    class="flex items-center rounded-lg hover:bg-gray-100 gap-2">
                    <Avatar v-if="!getUserProfilePic" :label="getUserInitial" class="avatar-bg" shape="circle" />
                    <Avatar v-else :image="getUserProfilePic" class="avatar-bg" shape="circle" />
                    <span class="text-sm font-medium text-gray-700">{{
                        getUserName
                        }}</span>
                    <Icon name="lucide:chevron-down" class="w-4 h-4 text-gray-500" />
                </Button>

                <!-- Profile Menu -->
                <Menu ref="menu" :model="profileMenuItems" :popup="true" :pt="{
                    root: 'mt-2 w-48 shadow-lg rounded-lg border border-gray-200',
                    menu: 'p-2',
                    menuitem: 'rounded-md',
                    action: 'px-3 py-2 hover:bg-gray-100 rounded-md transition-colors',
                    separator: 'my-2 border-t border-gray-200',
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

.avatar-bg {
    background-color: #2c3e50;
    color: white;
}
</style>
