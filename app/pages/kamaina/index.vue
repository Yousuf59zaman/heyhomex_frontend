<template>
    <div class="space-y-6 bg-[#FAF9F8]">
        <!-- Search and Filter Section -->
        <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div class="flex items-center justify-between gap-4">
                <!-- Left side - Search Input -->
                <div class="flex items-center gap-3 flex-1">
                    <div class="relative flex-1 max-w-md">
                        <Icon
                            name="lucide:search"
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search & filter..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button
                        class="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Use Search
                    </button>
                </div>

                <!-- Right side - Filters -->
                <div class="flex items-center gap-3">
                    <!-- Property Type Filter -->
                    <select
                        class="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Property Type: All</option>
                        <option>Single Family</option>
                        <option>Condo</option>
                        <option>Townhouse</option>
                    </select>

                    <!-- Price Range Filter -->
                    <select
                        class="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Price Range: All</option>
                        <option>Under $500K</option>
                        <option>$500K - $1M</option>
                        <option>Over $1M</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Top Section: Chart and Saved List -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            <!-- Left Column - Market Chart (3/4 width) -->
            <div class="lg:col-span-3">
                <div
                    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                    <div class="flex items-center justify-between mb-4 lg:mb-6">
                        <h2
                            class="text-base lg:text-lg font-semibold text-gray-900">
                            Current Local Market VS Best Local FHA Loans
                        </h2>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600">See All</span>
                            <Icon
                                name="lucide:chevron-right"
                                class="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <!-- Chart Area -->
                    <div
                        class="h-64 lg:h-80 relative bg-gray-50 rounded-lg overflow-hidden">
                        <!-- Y-axis labels -->
                        <div
                            class="absolute left-0 top-0 h-full flex flex-col justify-between py-4 text-xs text-gray-500 w-8">
                            <span>7M</span>
                            <span>6M</span>
                            <span>5M</span>
                            <span>4M</span>
                            <span>3M</span>
                            <span>2M</span>
                            <span>1M</span>
                            <span>0</span>
                        </div>

                        <!-- Chart bars -->
                        <div
                            class="flex items-end justify-around h-full px-6 lg:px-12 py-4">
                            <!-- April -->
                            <div
                                class="flex flex-col items-center space-y-1 lg:space-y-2 flex-1">
                                <div
                                    class="w-4 lg:w-8 bg-blue-500 rounded-t-sm"
                                    style="
                                        height: 120px;
                                        max-height: 180px;
                                    "></div>
                                <span class="text-xs text-gray-500 font-medium"
                                    >Apr</span
                                >
                            </div>
                            <!-- May -->
                            <div
                                class="flex flex-col items-center space-y-1 lg:space-y-2 flex-1">
                                <div
                                    class="w-4 lg:w-8 bg-blue-500 rounded-t-sm"
                                    style="
                                        height: 80px;
                                        max-height: 120px;
                                    "></div>
                                <span class="text-xs text-gray-500 font-medium"
                                    >May</span
                                >
                            </div>
                            <!-- June -->
                            <div
                                class="flex flex-col items-center space-y-1 lg:space-y-2 flex-1">
                                <div
                                    class="w-4 lg:w-8 bg-blue-500 rounded-t-sm"
                                    style="
                                        height: 100px;
                                        max-height: 160px;
                                    "></div>
                                <span class="text-xs text-gray-500 font-medium"
                                    >Jun</span
                                >
                            </div>
                            <!-- July -->
                            <div
                                class="flex flex-col items-center space-y-1 lg:space-y-2 flex-1">
                                <div
                                    class="w-4 lg:w-8 bg-blue-500 rounded-t-sm"
                                    style="
                                        height: 90px;
                                        max-height: 140px;
                                    "></div>
                                <span class="text-xs text-gray-500 font-medium"
                                    >Jul</span
                                >
                            </div>
                            <!-- August -->
                            <div
                                class="flex flex-col items-center space-y-1 lg:space-y-2 flex-1">
                                <div
                                    class="w-4 lg:w-8 bg-blue-500 rounded-t-sm"
                                    style="
                                        height: 130px;
                                        max-height: 200px;
                                    "></div>
                                <span class="text-xs text-gray-500 font-medium"
                                    >Aug</span
                                >
                            </div>
                            <!-- September -->
                            <div
                                class="flex flex-col items-center space-y-1 lg:space-y-2 flex-1">
                                <div
                                    class="w-4 lg:w-8 bg-blue-500 rounded-t-sm"
                                    style="
                                        height: 70px;
                                        max-height: 110px;
                                    "></div>
                                <span class="text-xs text-gray-500 font-medium"
                                    >Sep</span
                                >
                            </div>
                            <!-- October -->
                            <div
                                class="flex flex-col items-center space-y-1 lg:space-y-2 flex-1">
                                <div
                                    class="w-4 lg:w-8 bg-blue-500 rounded-t-sm"
                                    style="
                                        height: 60px;
                                        max-height: 90px;
                                    "></div>
                                <span class="text-xs text-gray-500 font-medium"
                                    >Oct</span
                                >
                            </div>
                        </div>

                        <!-- Chart Legend -->
                        <div
                            class="absolute top-3 right-3 lg:top-6 lg:right-6 bg-gray-900 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-lg text-sm font-medium">
                            <div class="text-base lg:text-lg font-bold">
                                21%
                            </div>
                            <div class="text-xs text-gray-300">
                                Interest rate
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Saved List (1/4 width) -->
            <div class="lg:col-span-1">
                <div
                    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                    <div class="flex items-center justify-between mb-4 lg:mb-6">
                        <h2
                            class="text-base lg:text-lg font-semibold text-gray-900">
                            Saved List
                        </h2>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600">See All</span>
                            <Icon
                                name="lucide:chevron-right"
                                class="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <!-- Home/Videos Toggle -->
                    <div class="flex bg-gray-100 rounded-lg p-1 mb-4">
                        <button
                            @click="switchTab('Home')"
                            :class="[
                                'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all',
                                activeTab === 'Home'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900',
                            ]">
                            Home
                        </button>
                        <button
                            @click="switchTab('Videos')"
                            :class="[
                                'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all',
                                activeTab === 'Videos'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900',
                            ]">
                            Videos
                        </button>
                    </div>

                    <!-- Saved Items -->
                    <div class="space-y-3">
                        <!-- Home Tab Content -->
                        <template v-if="activeTab === 'Home'">
                            <!-- Saved Item 1 -->
                            <div
                                class="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <img
                                        src="/images/home/home_logo.png"
                                        alt="Property"
                                        class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                    <div class="flex-1 min-w-0">
                                        <h4
                                            class="font-medium text-gray-900 text-sm leading-tight">
                                            Island Bank Hawaii
                                        </h4>
                                        <p class="text-xs text-gray-500 mt-0.5">
                                            📍 123 Aloha Lane, Honolulu, HI
                                            96814
                                        </p>
                                    </div>
                                    <button
                                        class="p-1 hover:bg-gray-200 rounded transition-colors">
                                        <Icon
                                            name="lucide:heart"
                                            class="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <!-- Saved Item 2 -->
                            <div
                                class="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <img
                                        src="/images/home/home_logo.png"
                                        alt="Property"
                                        class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                    <div class="flex-1 min-w-0">
                                        <h4
                                            class="font-medium text-gray-900 text-sm leading-tight">
                                            Island Bank Hawaii
                                        </h4>
                                        <p class="text-xs text-gray-500 mt-0.5">
                                            📍 456 Kamehameha Hwy, Honolulu, HI
                                            96817
                                        </p>
                                    </div>
                                    <button
                                        class="p-1 hover:bg-gray-200 rounded transition-colors">
                                        <Icon
                                            name="lucide:heart"
                                            class="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <!-- Saved Item 3 -->
                            <div
                                class="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <img
                                        src="/images/home/home_logo.png"
                                        alt="Property"
                                        class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                    <div class="flex-1 min-w-0">
                                        <h4
                                            class="font-medium text-gray-900 text-sm leading-tight">
                                            Island Bank Hawaii
                                        </h4>
                                        <p class="text-xs text-gray-500 mt-0.5">
                                            📍 789 Pali Hwy, Honolulu, HI 96813
                                        </p>
                                    </div>
                                    <button
                                        class="p-1 hover:bg-gray-200 rounded transition-colors">
                                        <Icon
                                            name="lucide:heart"
                                            class="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </template>

                        <!-- Videos Tab Content -->
                        <template v-else-if="activeTab === 'Videos'">
                            <!-- Video Item 1 -->
                            <div
                                class="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <div
                                        class="relative w-12 h-12 flex-shrink-0">
                                        <img
                                            src="/images/home/home_logo.png"
                                            alt="Video"
                                            class="w-12 h-12 rounded-lg object-cover" />
                                        <div
                                            class="absolute inset-0 flex items-center justify-center">
                                            <Icon
                                                name="lucide:play"
                                                class="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4
                                            class="font-medium text-gray-900 text-sm leading-tight">
                                            Hawaii Property Tour
                                        </h4>
                                        <p class="text-xs text-gray-500 mt-0.5">
                                            🎥 Virtual tour • 5:30
                                        </p>
                                    </div>
                                    <button
                                        class="p-1 hover:bg-gray-200 rounded transition-colors">
                                        <Icon
                                            name="lucide:heart"
                                            class="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <!-- Video Item 2 -->
                            <div
                                class="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <div
                                        class="relative w-12 h-12 flex-shrink-0">
                                        <img
                                            src="/images/home/home_logo.png"
                                            alt="Video"
                                            class="w-12 h-12 rounded-lg object-cover" />
                                        <div
                                            class="absolute inset-0 flex items-center justify-center">
                                            <Icon
                                                name="lucide:play"
                                                class="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4
                                            class="font-medium text-gray-900 text-sm leading-tight">
                                            Neighborhood Guide
                                        </h4>
                                        <p class="text-xs text-gray-500 mt-0.5">
                                            🎥 Area overview • 3:45
                                        </p>
                                    </div>
                                    <button
                                        class="p-1 hover:bg-gray-200 rounded transition-colors">
                                        <Icon
                                            name="lucide:heart"
                                            class="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Homes in Your Favorite Areas Section -->
        <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">
                    Homes in Your Favorite Areas!
                </h2>
                <button
                    class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    See all
                </button>
            </div>

            <!-- Horizontal Property Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Property Card 1 -->
                <div
                    class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
                    <div class="relative">
                        <img
                            src="/images/home/home_logo.png"
                            alt="Property"
                            class="w-full h-32 object-cover" />
                        <button
                            class="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                            <Icon
                                name="lucide:heart"
                                class="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                    </div>
                    <div class="p-3">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h3
                                    class="font-semibold text-gray-900 text-sm leading-tight">
                                    Hawaii Home Movers
                                </h3>
                                <p class="text-xs text-gray-500 mt-0.5">
                                    📍 123 Aloha Lane, Honolulu, HI 96814
                                </p>
                            </div>
                        </div>
                        <p class="text-blue-600 font-bold text-lg mb-2">
                            $475,000
                        </p>
                        <div
                            class="flex items-center justify-between text-xs text-gray-600">
                            <div class="flex items-center space-x-3">
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:bed"
                                        class="w-3 h-3 mr-1" />
                                    3 beds
                                </span>
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:bath"
                                        class="w-3 h-3 mr-1" />
                                    2 bath
                                </span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:maximize"
                                        class="w-3 h-3 mr-1" />
                                    1,200 sqft
                                </span>
                                <span class="text-green-600 font-medium"
                                    >✓ Verified</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Card 2 -->
                <div
                    class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
                    <div class="relative">
                        <img
                            src="/images/home/home_logo.png"
                            alt="Property"
                            class="w-full h-32 object-cover" />
                        <button
                            class="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                            <Icon
                                name="lucide:heart"
                                class="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                    </div>
                    <div class="p-3">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h3
                                    class="font-semibold text-gray-900 text-sm leading-tight">
                                    Hawaii Home Movers
                                </h3>
                                <p class="text-xs text-gray-500 mt-0.5">
                                    📍 456 Kamehameha Hwy, Honolulu, HI 96817
                                </p>
                            </div>
                        </div>
                        <p class="text-blue-600 font-bold text-lg mb-2">
                            $475,000
                        </p>
                        <div
                            class="flex items-center justify-between text-xs text-gray-600">
                            <div class="flex items-center space-x-3">
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:bed"
                                        class="w-3 h-3 mr-1" />
                                    2 beds
                                </span>
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:bath"
                                        class="w-3 h-3 mr-1" />
                                    1 bath
                                </span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:maximize"
                                        class="w-3 h-3 mr-1" />
                                    980 sqft
                                </span>
                                <span class="text-green-600 font-medium"
                                    >✓ Verified</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Card 3 -->
                <div
                    class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
                    <div class="relative">
                        <img
                            src="/images/home/home_logo.png"
                            alt="Property"
                            class="w-full h-32 object-cover" />
                        <button
                            class="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                            <Icon
                                name="lucide:heart"
                                class="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                    </div>
                    <div class="p-3">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h3
                                    class="font-semibold text-gray-900 text-sm leading-tight">
                                    Hawaii Home Movers
                                </h3>
                                <p class="text-xs text-gray-500 mt-0.5">
                                    📍 789 Pali Hwy, Honolulu, HI 96813
                                </p>
                            </div>
                        </div>
                        <p class="text-blue-600 font-bold text-lg mb-2">
                            $475,000
                        </p>
                        <div
                            class="flex items-center justify-between text-xs text-gray-600">
                            <div class="flex items-center space-x-3">
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:bed"
                                        class="w-3 h-3 mr-1" />
                                    4 beds
                                </span>
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:bath"
                                        class="w-3 h-3 mr-1" />
                                    3 bath
                                </span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="flex items-center">
                                    <Icon
                                        name="lucide:maximize"
                                        class="w-3 h-3 mr-1" />
                                    1,800 sqft
                                </span>
                                <span class="text-green-600 font-medium"
                                    >✓ Verified</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Videos you might like! Section -->
        <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">
                    Videos you might like!
                </h2>
                <button
                    class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    See all
                </button>
            </div>

            <!-- Video Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Video Card 1 - Hawaiian Airlines -->
                <div
                    class="bg-gradient-to-r from-blue-400 to-teal-400 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div class="relative h-32 flex items-center justify-center">
                        <div class="text-center text-white z-10">
                            <h3 class="font-bold text-lg mb-1">HAWAIIAN</h3>
                            <p class="text-sm opacity-90">AIRLINES</p>
                        </div>
                        <!-- Play button overlay -->
                        <div
                            class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                                class="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                <Icon
                                    name="lucide:play"
                                    class="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <!-- Background pattern -->
                        <div class="absolute top-2 right-2 opacity-20">
                            <Icon
                                name="lucide:plane"
                                class="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <!-- Video Card 2 - Livestrand House -->
                <div
                    class="bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div class="relative h-32 flex items-center justify-center">
                        <div class="text-center text-white z-10">
                            <h3 class="font-bold text-lg mb-1">LIVESTRAND</h3>
                            <p class="text-sm opacity-90">HOUSE</p>
                        </div>
                        <!-- Play button overlay -->
                        <div
                            class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                                class="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                <Icon
                                    name="lucide:play"
                                    class="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <!-- Background pattern -->
                        <div class="absolute top-2 right-2 opacity-20">
                            <Icon
                                name="lucide:home"
                                class="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <!-- Video Card 3 - Which One Are You -->
                <div
                    class="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div class="relative h-32 flex items-center justify-center">
                        <div class="text-center text-white z-10">
                            <h3 class="font-bold text-lg mb-1">WHICH</h3>
                            <p class="text-sm opacity-90">ONE ARE YOU?</p>
                        </div>
                        <!-- Play button overlay -->
                        <div
                            class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                                class="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                <Icon
                                    name="lucide:play"
                                    class="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <!-- Background pattern -->
                        <div class="absolute top-2 right-2 opacity-20">
                            <Icon
                                name="lucide:users"
                                class="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    definePageMeta({
        layout: 'citizen',
    });

    // Reactive state for the saved list toggle
    const activeTab = ref('Home');

    // Function to switch between Home and Videos
    const switchTab = (tab) => {
        activeTab.value = tab;
    };
</script>

<style scoped>
    /* Dashboard styles */
</style>
