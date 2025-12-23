<template>
    <div
        class="bg-white p-2 rounded-xl border border-gray-300 shadow-sm overflow-hidden animate-pulse">
        <div class="relative">
            <div class="w-full rounded-lg h-40 sm:h-48 bg-gray-200"></div>
            <div
                class="absolute top-3 right-3 w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>

        <div class="p-3 sm:p-4">
            <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-0">
                <div class="flex-1">
                    <div
                        class="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2"></div>

                    <div
                        class="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2 sm:mb-3"></div>
                </div>

                <div
                    class="h-6 sm:h-7 bg-gray-200 rounded w-24 mb-2 sm:mb-3"></div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1">
                    <div
                        class="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
                    <div class="h-3 bg-gray-200 rounded w-14"></div>
                </div>
                <div class="flex items-center space-x-1">
                    <div
                        class="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
                    <div class="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div class="flex items-center space-x-1">
                    <div
                        class="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
                    <div class="h-3 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>
