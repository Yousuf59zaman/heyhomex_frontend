<script setup>
useHead({ title: "Settings - Investor Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const { citizen_user } = citizenAuth()
const toast = useToast()

const settingsSections = ref([
    {
        id: 'subscription',
        title: 'Subscription',
        description: 'Manage your subscription plan',
        icon: 'lucide:credit-card',
        path: '/investor/subscription'
    },
    {
        id: 'profile',
        title: 'Profile Settings',
        description: 'Update your personal information',
        icon: 'lucide:user',
        path: '/investor/subscription?tab=profile'
    }
])

const navigateToSection = (section) => {
    if (section.path !== '#') {
        navigateTo(section.path)
    } else {
        toast.add({
            severity: 'info',
            summary: 'Coming Soon',
            detail: `${section.title} will be available soon`,
            life: 3000
        })
    }
}
</script>

<template>
    <div class="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl md:text-2xl font-semibold text-gray-900">Settings</h1>
                <p class="text-sm text-gray-600 mt-1">Manage your account preferences and settings</p>
            </div>
            <NuxtLink to="/investor" class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
                Back to Dashboard
            </NuxtLink>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Side - Account Information -->
            <div class="lg:col-span-1">
                <div class="bg-white border border-gray-200 rounded-lg p-8">
                    <div class="flex flex-col items-center">
                        <!-- Profile Image -->
                        <div class="relative mb-4">
                            <img
                                v-if="citizen_user?.data?.profile_pic"
                                :src="citizen_user.data.profile_pic"
                                alt="Profile"
                                class="w-32 h-32 rounded-full object-cover border-4 border-[#333365] shadow-lg"
                                @error="$event.target.style.display='none'" />
                            <div
                                v-if="!citizen_user?.data?.profile_pic"
                                class="w-32 h-32 rounded-full bg-gradient-to-br from-[#333365] to-[#4A4A8F] flex items-center justify-center shadow-lg">
                                <Icon name="lucide:user" class="w-16 h-16 text-white" />
                            </div>
                        </div>
                        
                        <!-- User Name -->
                        <h2 class="text-2xl font-bold text-gray-900 mb-1 text-center">
                            {{ citizen_user?.data?.name || 'User' }}
                        </h2>
                        <p class="text-sm text-[#333365] font-medium mb-6">
                            {{ citizen_user?.data?.user_type?.[0]?.name || 'Citizen' }}
                        </p>
                    </div>
                    
                    <!-- Account Details -->
                    <div class="space-y-4 pt-6 border-t border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-[#333365]/10 flex items-center justify-center flex-shrink-0">
                                <Icon name="lucide:mail" class="w-5 h-5 text-[#333365]" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-500 mb-0.5">Email Address</p>
                                <p class="text-sm font-medium text-gray-900 truncate">
                                    {{ citizen_user?.data?.email || 'Not set' }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-[#333365]/10 flex items-center justify-center flex-shrink-0">
                                <Icon name="lucide:calendar" class="w-5 h-5 text-[#333365]" />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-gray-500 mb-0.5">Member Since</p>
                                <p class="text-sm font-medium text-gray-900">
                                    {{ new Date(citizen_user?.data?.user_info?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || 'N/A' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side - Settings Options -->
            <div class="lg:col-span-1">
                <div class="grid grid-cols-1 gap-4">
                    <div
                        v-for="section in settingsSections"
                        :key="section.id"
                        @click="navigateToSection(section)"
                        class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-[#333365]/30 transition-all duration-200 cursor-pointer group">
                        <div class="flex items-center gap-4">
                            <div class="p-4 bg-[#333365]/10 rounded-xl group-hover:bg-[#333365] group-hover:scale-110 transition-all duration-200">
                                <Icon 
                                    :name="section.icon" 
                                    class="w-7 h-7 text-[#333365] group-hover:text-white transition-colors" />
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-[#333365] transition-colors mb-1">{{ section.title }}</h3>
                                <p class="text-sm text-gray-600">{{ section.description }}</p>
                            </div>
                            <Icon 
                                name="lucide:chevron-right" 
                                class="w-6 h-6 text-gray-400 group-hover:text-[#333365] group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Toast position="top-right" />
</template>
