<template>
    <div
        class="bg-white p-3 rounded-[8px] border border-[#D9D9D9] shadow-sm overflow-hidden animate-pulse">
        <div class="relative">
            <div class="w-full rounded-[10px] h-[200px] bg-gray-200"></div>
            <div
                class="absolute top-2 right-2 w-9 h-9 bg-gray-300 rounded-[8px]"></div>
        </div>

        <div class="mt-4 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
                <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                <div class="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-px bg-gray-200"></div>
            <div class="flex items-center gap-2">
                <div class="flex-1 h-8 bg-gray-200 rounded-[4px]"></div>
                <div class="flex-1 h-8 bg-gray-200 rounded-[4px]"></div>
                <div class="flex-1 h-8 bg-gray-200 rounded-[4px]"></div>
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
