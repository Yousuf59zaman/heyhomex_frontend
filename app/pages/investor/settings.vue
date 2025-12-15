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
        path: '#'
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Manage notification preferences',
        icon: 'lucide:bell',
        path: '#'
    },
    {
        id: 'privacy',
        title: 'Privacy & Security',
        description: 'Control your privacy settings',
        icon: 'lucide:shield',
        path: '#'
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
                v-for="section in settingsSections"
                :key="section.id"
                @click="navigateToSection(section)"
                class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-[#333365]/10 rounded-lg group-hover:bg-[#333365]/20 transition-colors">
                        <Icon :name="section.icon" class="w-6 h-6 text-[#333365]" />
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 group-hover:text-[#333365] transition-colors">{{ section.title }}</h3>
                        <p class="text-sm text-gray-600 mt-1">{{ section.description }}</p>
                    </div>
                    <Icon name="lucide:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-[#333365] transition-colors" />
                </div>
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-6 mt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-sm text-gray-600">Email</span>
                    <span class="text-sm font-medium text-gray-900">{{ citizen_user?.data?.email || 'Not set' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-sm text-gray-600">Account Type</span>
                    <span class="text-sm font-medium text-gray-900">{{ citizen_user?.data?.user_type?.[0]?.name || 'Citizen' }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600">Member Since</span>
                    <span class="text-sm font-medium text-gray-900">{{ new Date(citizen_user?.data?.created_at).toLocaleDateString() || 'N/A' }}</span>
                </div>
            </div>
        </div>
    </div>

    <Toast position="top-right" />
</template>
