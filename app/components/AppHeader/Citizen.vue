<script setup>
    import Avatar from "primevue/avatar"
    import Menu from "primevue/menu"
    const {citizen_user, logout, isLoadingLogout} = citizenAuth()
    const route = useRoute()
    const router = useRouter()

    const isScroll = ref(false)
    const menu = ref()
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
            console.error("Logout error:", error)
        }
    }

    const getUserName = computed(() => {
        if (!citizen_user.value) return "User"
        if (citizen_user.value.data.name) {
            return citizen_user.value.data.name.split(" ")[0]
        }
        if (citizen_user.value.data.first_name) {
            return citizen_user.value.data.first_name
        }

        if (citizen_user.value.data.email) {
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

    const isPropertyDetails = computed(() => {
        return /^\/(military|kamaina|investor)\/property\/[^/]+/.test(route.path)
    })

    const propertyHeaderTitle = "Hey you got this..."

    const propertyBasePath = computed(() => {
        const segment = route.path.split("/")[1]
        return segment ? `/${segment}` : "/"
    })

    const handleBack = () => {
        if (process.client && window.history.length > 1) {
            router.back()
            return
        }
        navigateTo(propertyBasePath.value)
    }

    onMounted(() => {
        window.addEventListener("scroll", handleScroll)
    })

    onUnmounted(() => {
        window.removeEventListener("scroll", handleScroll)
    })

    defineEmits(["toggle-mobile-menu"])
</script>

<template>
    <header
        :class="[
            'sticky top-0 z-10',
            isPropertyDetails ? 'bg-white px-8 pt-5 pb-4' : 'bg-transparent',
        ]">
        <!-- {{ citizen_user.data.name }} -->
        <div v-if="isPropertyDetails" class="w-full max-w-[1316px] mx-auto flex flex-col gap-4">
            <div class="flex items-center gap-4 md:hidden">
                <button
                    type="button"
                    class="bg-[#F0F1F3] p-3 rounded-[30px] flex items-center justify-center"
                    aria-label="Go back"
                    @click="handleBack">
                    <Icon
                        name="lucide:arrow-left"
                        class="w-4 h-4 text-[#2C3E50]" />
                </button>
                <h1
                    class="text-[20px] leading-[28px] font-semibold text-[#2C3E50]">
                    {{ propertyHeaderTitle }}
                </h1>
            </div>

            <div class="hidden md:flex items-center justify-between h-11">
                <div class="flex items-center gap-4">
                    <button
                        type="button"
                        class="bg-[#F0F1F3] w-11 h-11 rounded-[30px] flex items-center justify-center"
                        aria-label="Go back"
                        @click="handleBack">
                        <Icon
                            name="lucide:arrow-left"
                            class="w-5 h-5 text-[#2C3E50]" />
                    </button>
                    <h1
                        class="text-lg sm:text-xl lg:text-[30px] leading-7 sm:leading-8 lg:leading-[40px] font-semibold text-[#2C3E50]">
                        {{ propertyHeaderTitle }}
                    </h1>
                </div>

                <div class="flex items-center gap-4">
                    <button
                        type="button"
                        aria-label="Notifications"
                        class="relative text-gray-400 hover:text-gray-600 transition-colors">
                        <img
                            src="/svg/dashboard/bell-icon.svg"
                            alt=""
                            class="w-6 h-6" />
                        <span
                            class="absolute -top-0.5 right-0 w-2 h-2 bg-[#FF4D4F] rounded-full"></span>
                    </button>

                    <div class="w-px h-6 bg-[#D1D1D5]"></div>

                    <Button
                        @click="toggleProfileMenu"
                        :disabled="isLoadingLogout"
                        class="flex items-center rounded-full hover:bg-gray-100">
                        <Avatar
                            v-if="!getUserProfilePic"
                            :label="getUserInitial"
                            class="avatar-bg"
                            shape="circle" />
                        <Avatar
                            v-else
                            :image="getUserProfilePic"
                            class="avatar-bg"
                            shape="circle" />
                    </Button>

                    <Menu
                        ref="menu"
                        :model="profileMenuItems"
                        :popup="true"
                        :pt="{
                            root: 'mt-2 w-48 shadow-lg rounded-lg border border-gray-200',
                            menu: 'p-2',
                            menuitem: 'rounded-md',
                            action: 'px-3 py-2 hover:bg-gray-100 rounded-md transition-colors',
                            separator: 'my-2 border-t border-gray-200',
                        }" />
                </div>
            </div>
        </div>

        <template v-else  >
            <!-- Mobile Top Bar -->
            <div class="lg:hidden">
                <div
                    class="flex items-center justify-between bg-white border-b border-[#EAECEE] shadow-[0px_4px_32px_0px_rgba(24,34,44,0.06)] px-5 py-4">
                    <NuxtLink :to="propertyBasePath">
                        <img
                            class="w-[26px] h-[26px]"
                            src="/svg/dashboard/home_logo.svg"
                            alt="HeyHome Logo" />
                    </NuxtLink>
                    <div class="flex items-center gap-6">
                        <button
                            type="button"
                            aria-label="Notifications"
                            class="relative">
                            <img
                                src="/svg/dashboard/bell-icon.svg"
                                alt=""
                                class="w-6 h-6" />
                            <span
                                class="absolute -top-0.5 right-0 w-2 h-2 bg-[#FF4D4F] rounded-full"></span>
                        </button>
                        <button
                            type="button"
                            aria-label="Open menu"
                            @click="$emit('toggle-mobile-menu')"
                            class="flex items-center justify-center">
                            <Icon
                                name="lucide:menu"
                                class="w-6 h-6 text-[#283849]" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Desktop Header -->
            <div class="hidden lg:flex items-center justify-between bg-white px-8 pt-5 pb-4">
                <div class="flex flex-col gap-2 items-start">
                    <div class="flex items-center gap-2">
                        <NuxtLink :to="propertyBasePath">
                            <img
                                class="w-10 h-10"
                                src="/svg/dashboard/home_logo.svg"
                                alt="HeyHome Logo" />
                        </NuxtLink>
                        <h1
                            class="text-[32px] leading-[40px] font-semibold text-[#2C3E50]">
                            Welcome back, {{ getUserName }}!
                        </h1>
                    </div>
                    <p class="text-[14px] leading-[1.5] text-[#283849]">
                        Your local community insights are just a click away.
                    </p>
                </div>

                <div class="flex items-center gap-5">
                    <button
                        type="button"
                        aria-label="Notifications"
                        class="relative bg-white w-12 h-12 rounded-[30px] flex items-center justify-center">
                        <span class="relative w-6 h-6">
                            <img
                                src="/svg/dashboard/bell-icon.svg"
                                alt=""
                                class="w-6 h-6" />
                            <span
                                class="absolute top-0 left-[14px] w-2 h-2 bg-[#FF4D4F] rounded-full"></span>
                        </span>
                    </button>

                    <div class="w-px h-6 bg-[#D4D4D4]"></div>

                    <button
                        type="button"
                        @click="toggleProfileMenu"
                        :disabled="isLoadingLogout"
                        class="flex items-center">
                        <Avatar
                            v-if="!getUserProfilePic"
                            :label="getUserInitial"
                            class="avatar-bg"
                            shape="circle" />
                        <Avatar
                            v-else
                            :image="getUserProfilePic"
                            class="avatar-bg"
                            shape="circle" />
                    </button>

                    <Menu
                        ref="menu"
                        :model="profileMenuItems"
                        :popup="true"
                        :pt="{
                            root: 'mt-2 w-48 shadow-lg rounded-lg border border-gray-200',
                            menu: 'p-2',
                            menuitem: 'rounded-md',
                            action: 'px-3 py-2 hover:bg-gray-100 rounded-md transition-colors',
                            separator: 'my-2 border-t border-gray-200',
                        }" />
                </div>
            </div>
        </template>
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
