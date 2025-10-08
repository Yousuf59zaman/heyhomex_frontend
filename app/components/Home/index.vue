<script setup></script>

<template>
    <div
        class="relative bg-cover bg-center bg-no-repeat"
        :style="{ backgroundImage: 'url(/images/home/background.png)' }"
        style="overflow: none">
        <!-- Linear Gradient Overlay - Choose your style below -->

        <div
            class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>

        <!-- Content -->
        <div
            class="relative z-10 flex flex-col justify-center lg:justify-end min-h-screen px-4 sm:px-6 lg:px-8 lg:pb-28">
            <div
                class="max-w-2xl mx-auto text-center sm:text-left lg:mx-0 lg:max-w-4xl">
                <h1
                    class="text-4xl font-bold tracking-wider text-white mb-4 sm:text-5xl lg:text-[2.5rem]">
                    Home Starts Here
                </h1>

                <p
                    class="text-lg text-white/90 mb-8 sm:text-xl lg:text-[1rem] max-w-md">
                    Where your next chapter begins — Kama'aina, Military, or
                    Investor, your path starts with purpose
                </p>

                <!-- Desktop View -->
                <div
                    class="hidden sm:flex items-center gap-0 sm:max-w-2xl bg-white rounded-[.75rem] shadow-lg p-1">
                    <div class="flex-1 relative">
                        <svg
                            class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter an address, neighborhood, city or zip code"
                            class="w-full pl-12 pr-4 py-3 bg-transparent  focus:outline-none text-gray-800 placeholder-gray-400 text-sm" />
                    </div>

                    <button
                        class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-[.75rem] transition-colors duration-200 whitespace-nowrap">
                        Let's Begin
                    </button>
                </div>

                <!-- Mobile View -->
                <div class="flex sm:hidden flex-col gap-3 w-full">
                    <div class="relative">
                        <svg
                            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter an address, neighborhood , City..."
                            class="w-full pl-12 pr-4 py-4 bg-white rounded-[.75rem] shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 placeholder-gray-400 text-sm" />
                    </div>

                    <button
                        class="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-[.75rem] shadow-lg transition-colors duration-200">
                        Let's Begin
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
