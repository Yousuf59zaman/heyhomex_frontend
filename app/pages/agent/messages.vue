<script setup>
useHead({ title: "Messages - Agent Panel" })
definePageMeta({ middleware: ["auth-citizen"], layout: "agent" })
</script>

<template>
    <div class="space-y-6">

        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-gray-900">Messages</h1>
        </div>


        <div class="bg-white rounded-xl p-12 border border-gray-100 shadow-sm text-center">
            <div class="max-w-md mx-auto">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="lucide:message-square" class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Messages Coming Soon</h3>
                <p class="text-gray-600">
                    The messaging feature will be available soon. You'll be able to communicate with your leads and
                    clients directly from here.
                </p>
            </div>
        </div>
    </div>
</template>
