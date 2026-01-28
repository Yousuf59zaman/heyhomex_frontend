<script setup>
const hydrated = ref(false)

const showAuthModal = ref(false)

const handleLetsBegin = () => {
    showAuthModal.value = true
}

const handleModalClose = () => {
    showAuthModal.value = false
}

onMounted(() => {
    hydrated.value = true
})
</script>

<template>
    <div class="relative min-h-screen overflow-hidden">
        <!-- YouTube Video Background -->
        <iframe 
            class="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src="https://www.youtube.com/embed/xXvd5PRnjrA?autoplay=1&mute=1&loop=1&playlist=xXvd5PRnjrA&controls=0&showinfo=0&rel=0&playsinline=1&cc_load_policy=0&enablejsapi=1&modestbranding=1&iv_load_policy=3"
            frameborder="0"
            allow="autoplay; encrypted-media"
            style="position: absolute; top: 50%; left: 50%; width: 100vw; height: 100vh; transform: translate(-50%, -50%) scale(1.5); object-fit: cover;"
        ></iframe>
        <!-- <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div> -->

        <!-- Skeleton BEFORE hydration -->
        <div v-if="!hydrated"
            class="relative z-10 flex flex-col justify-center lg:justify-end min-h-screen px-4 sm:px-6 lg:px-8 lg:pb-28 animate-pulse">
            <div class="max-w-2xl mx-auto text-center sm:text-left lg:mx-0 lg:max-w-4xl">
                <div class="h-8 sm:h-10 w-3/4 bg-gray-700 rounded mb-4"></div>

                <div class="w-2/3 h-[1px] mb-4 bg-gray-600"></div>

                <div class="h-5 w-5/6 bg-gray-600 rounded mb-8"></div>

                <div
                    class="hidden sm:flex items-center gap-6 sm:max-w-xl bg-gray-800/50 rounded-xl shadow-lg overflow-hidden pl-[15px] pr-[10px] py-[10px]">
                    <div class="flex-1 h-6 bg-gray-700 rounded"></div>
                    <div class="w-px h-6 bg-gray-700/60"></div>
                    <div class="w-28 h-11 bg-gray-700 rounded-lg"></div>
                </div>

                <div class="flex sm:hidden flex-col gap-3 w-full mt-6">
                    <div class="h-12 bg-gray-700 rounded-xl"></div>
                    <div class="h-12 bg-gray-800 rounded-xl"></div>
                </div>
            </div>
        </div>

        <!-- Real content AFTER hydration -->
        <div v-else
            class="relative z-10 flex flex-col justify-center lg:justify-end min-h-screen px-4 sm:px-6 lg:px-8 lg:pb-28 transition-opacity duration-500">
            <div class="max-w-2xl mx-auto text-center sm:text-left lg:mx-0 lg:max-w-4xl">
                <h1 class="text-4xl font-bold tracking-wider text-white mb-4 sm:text-5xl lg:text-[2.5rem]">
                    Home Starts Here
                </h1>

                <div class="max-w-2xl sm:max-w-xl h-[1px] mb-4 bg-gray-600"></div>

                <p class="text-[14px] leading-[20px] text-white mb-8 sm:text-[16px] sm:leading-[24px] max-w-md">
                    Where your next chapter begins — Kama‘aina, Military, or
                    Investor, your path starts with purpose
                </p>

                <div
                    class="hidden sm:flex items-center gap-6 sm:max-w-xl bg-white rounded-xl shadow-lg overflow-hidden pl-[15px] pr-[10px] py-[10px]">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <svg class="w-6 h-6 text-[#566573] shrink-0" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        <input type="text" placeholder="Enter an address,neighborhood,city or zip code"
                            aria-label="Search location"
                            class="flex-1 min-w-0 bg-transparent focus:outline-none text-sm leading-6 text-[#121a22] placeholder:text-[#566573]" />
                    </div>

                    <div class="w-px h-6 bg-[#CFDBE8]"></div>

                    <button @click="handleLetsBegin"
                        class="px-6 py-3 bg-[#18222c] hover:bg-[#121a22] text-white text-sm font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18222c]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-label="Begin search">
                        Let’s Begin
                    </button>
                </div>

                <div class="flex sm:hidden flex-col gap-3 w-full">
                    <div class="relative">
                        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#566573]" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Enter an address, neighborhood , City..."
                            aria-label="Search location"
                            class="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#18222c]/20 text-[#121a22] placeholder:text-[#566573] text-sm" />
                    </div>

                    <button @click="handleLetsBegin"
                        class="w-full py-4 bg-[#18222c] hover:bg-[#121a22] text-white font-semibold rounded-xl shadow-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18222c]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-label="Begin search">
                        Let’s Begin
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
