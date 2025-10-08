<script setup>
    const backgroundStyle = {
        backgroundImage: "url(/images/home/background.png)",
    };
</script>

<template>
    <div
        class="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
        :style="backgroundStyle">
        <!-- Gradient Overlay -->
        <div
            class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

        <!-- Content -->
        <div
            class="relative z-10 flex flex-col justify-center lg:justify-end min-h-screen px-4 sm:px-6 lg:px-8 lg:pb-28">
            <div
                class="max-w-2xl mx-auto text-center sm:text-left lg:mx-0 lg:max-w-4xl">
                <!-- Heading -->
                <h1
                    class="text-4xl font-bold tracking-wider text-white mb-4 sm:text-5xl lg:text-[2.5rem]">
                    Home Starts Here
                </h1>

                <div class="max-w-2xl sm:max-w-xl h-[1px] mb-4 bg-gray-600"></div>

                <!-- Subtitle -->
                <p
                    class="text-lg text-white/90 mb-8 sm:text-xl lg:text-base max-w-md">
                    Where your next chapter begins — Kama'aina, Military, or
                    Investor, your path starts with purpose
                </p>

                <!-- Desktop Search -->
                <div
                    class="hidden sm:flex items-center gap-3 sm:max-w-xl bg-white rounded-xl shadow-lg p-1">
                    <div class="flex-1 relative">
                        <svg
                            class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>



                        <input
                            type="text"
                            placeholder="Enter an address, neighborhood, city or zip code"
                            aria-label="Search location"
                            class="w-full pl-12 pr-4 text-[#566573] py-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm" />
                    </div>

                    <div class="bg-[#FFFFFF33] w-[1px] h-[1.25rem]"></div>

                    <button
                        class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors duration-200 whitespace-nowrap"
                        aria-label="Begin search">
                        Let's Begin
                    </button>
                </div>

                <!-- Mobile Search -->
                <div class="flex sm:hidden flex-col gap-3 w-full">
                    <div class="relative">
                        <svg
                            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter an address, neighborhood , City..."
                            aria-label="Search location"
                            class="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 placeholder-gray-400 text-sm" />
                    </div>

                    <button
                        class="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-lg transition-colors duration-200"
                        aria-label="Begin search">
                        Let's Begin
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
