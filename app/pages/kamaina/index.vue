<template>
    <div class="space-y-6">
        <!-- Search and Filter Section -->
        <div>
            <!-- Mobile Layout -->
            <div class="block lg:hidden">
                <!-- Search Input Row -->
                <div class="flex items-center gap-3 mb-3">
                    <div class="relative flex-1">
                        <Icon
                            name="lucide:search"
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Here..."
                            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <!-- Filter Button -->
                    <button
                        class="px-2 py-2  border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <Icon
                            name="lucide:sliders-horizontal"
                            class=" h-4 text-gray-600" />
                    </button>
                </div>

                <!-- Map Search Button Row -->
                <div class="w-full">
                    <button
                        class="w-full bg-[#121A22] text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Map Search
                    </button>
                </div>
            </div>

            <!-- Desktop Layout -->
            <div
                class="hidden lg:flex lg:items-center lg:justify-between mb-10 gap-4">
                <!-- Left side - Search Input -->
                <div class="flex items-center gap-3 flex-1">
                    <div class="relative flex-1 max-w-sm">
                        <Icon
                            name="lucide:search"
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Here..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button
                        class="bg-[#121A22] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                        Map Search
                    </button>
                </div>

                <!-- Right side - Filters -->
                <div class="flex items-center gap-3">
                    <!-- Property Type Filter -->
                    <select
                        class="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Property Type: All</option>
                        <option>Single Family</option>
                        <option>Condo</option>
                        <option>Townhouse</option>
                    </select>

                    <!-- Price Range Filter -->
                    <select
                        class="border border-gray-300 rounded-lg px-5 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Price Range: All</option>
                        <option>Under $500K</option>
                        <option>$500K - $1M</option>
                        <option>Over $1M</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Top Section: Chart and Saved List -->
        <div class="flex flex-col lg:grid lg:grid-cols-11 gap-4 lg:gap-2">
            <!-- Left Column - Market Chart (3/4 width) -->
            <div class="order-1 lg:order-1 lg:col-span-6">
                <div class="bg-white rounded-lg p-4">
                    <div
                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-2">
                        <h2
                            class="text-base lg:text-lg font-semibold text-gray-900 leading-tight">
                            Current Local Market VS Best Local FHA Loans
                        </h2>
                        <div class="flex items-center space-x-2">
                            <select
                                v-model="selectedPeriod"
                                class="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <!-- Chart Area -->
                    <div class="h-48 sm:h-64 md:h-80 relative">
                        <Chart
                            type="bar"
                            :data="chartData"
                            :options="chartOptions"
                            class="h-full" />

                        <!-- Hover Tooltip -->
                        <div
                            v-if="showTooltip"
                            :style="tooltipStyle"
                            class="absolute bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg z-10 pointer-events-none">
                            <div class="text-lg font-bold text-center">29%</div>
                            <div
                                class="text-xs text-gray-300 text-center whitespace-nowrap">
                                Special Loan Eligibility
                            </div>
                            <!-- Tooltip arrow -->
                            <div
                                class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Saved List (1/4 width) -->
            <div class="order-2 lg:order-2 lg:col-span-5">
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <div class="flex items-center justify-between mb-4 lg:mb-6">
                        <h2
                            class="text-base lg:text-lg font-semibold text-gray-900">
                            Saved List
                        </h2>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600">Sell All</span>
                        </div>
                    </div>

                    <!-- Home/Videos Toggle -->
                    <div class="flex bg-gray-100 rounded-lg mb-4">
                        <button
                            @click="switchTab('Home')"
                            :class="[
                                'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all',
                                activeTab === 'Home'
                                    ? 'bg-[#2C3E50] text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900',
                            ]">
                            Home
                        </button>
                        <button
                            @click="switchTab('Videos')"
                            :class="[
                                'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all',
                                activeTab === 'Videos'
                                    ? 'bg-[#2C3E50] text-white shadow-sm'
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
                                class="bg-[#FAF9F8] rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <img
                                        src="/images/dashboard/1.png"
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
                                            class="w-4 h-4 text-[#2C3E50]" />
                                    </button>
                                </div>
                            </div>

                            <!-- Saved Item 2 -->
                            <div
                                class="bg-[#FAF9F8] rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <img
                                        src="/images/dashboard/2.png"
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
                                            class="w-4 h-4 text-[#2C3E50]" />
                                    </button>
                                </div>
                            </div>

                            <!-- Saved Item 3 -->
                            <div
                                class="bg-[#FAF9F8] rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                                <div class="flex items-start space-x-3">
                                    <img
                                        src="/images/dashboard/3.png"
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
                                            class="w-4 h-4 text-[#2C3E50]" />
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
        <div class="rounded-lg shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <h2
                    class="text-base sm:text-lg tracking-wider font-semibold text-gray-900">
                    Homes in Your Favorite Areas!
                </h2>
                <button
                    class="text-sm text-[#2C3E50] hover:text-blue-700 font-medium">
                    See all
                </button>
            </div>

            <!-- Horizontal Property Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Property Card 1 -->
                <div
                    @click="navigateToProperty('1')"
                    class="bg-white p-2 rounded-xl border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
                    <div class="relative">
                        <img
                            src="/images/dashboard/1.png"
                            alt="Hawaii Home Movers Property"
                            class="w-full rounded-lg h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                            @click.stop
                            class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Icon
                                name="lucide:heart"
                                class="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                    <div class="p-3 sm:p-4">
                        <div
                            class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-0">
                            <div class="flex-1">
                                <h3
                                    class="font-semibold tracking-wide text-gray-900 text-sm sm:text-base mb-1">
                                    Hawaii Home Movers
                                </h3>
                                <p
                                    class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                    123 Aloha Lane, Honolulu, HI 96818
                                </p>
                            </div>
                            <p
                                class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 self-start">
                                $475,000
                            </p>
                        </div>
                        <div
                            class="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card.bed.svg"
                                    alt="" />
                                <span class="font-medium">5 Beds</span>
                            </div>
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card-bath.svg"
                                    alt="" />
                                <span class="font-medium">3 Baths</span>
                            </div>
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card-cube.svg"
                                    alt="" />
                                <span class="font-medium">1733/5000</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Card 2 -->
                <div
                    @click="navigateToProperty('2')"
                    class="bg-white p-2 rounded-xl border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
                    <div class="relative">
                        <img
                            src="/images/dashboard/2.png"
                            alt="Hawaii Home Movers Property"
                            class="w-full rounded-lg h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                            @click.stop
                            class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Icon
                                name="lucide:heart"
                                class="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                    <div class="p-3 sm:p-4">
                        <div
                            class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-0">
                            <div class="flex-1">
                                <h3
                                    class="font-semibold tracking-wide text-gray-900 text-sm sm:text-base mb-1">
                                    Hawaii Home Movers
                                </h3>
                                <p
                                    class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                    123 Aloha Lane, Honolulu, HI 96818
                                </p>
                            </div>
                            <p
                                class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 self-start">
                                $475,000
                            </p>
                        </div>
                        <div
                            class="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card.bed.svg"
                                    alt="" />
                                <span class="font-medium">5 Beds</span>
                            </div>
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card-bath.svg"
                                    alt="" />
                                <span class="font-medium">3 Baths</span>
                            </div>
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card-cube.svg"
                                    alt="" />
                                <span class="font-medium">1733/5000</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Property Card 3 -->
                <div
                    @click="navigateToProperty('3')"
                    class="bg-white p-2 rounded-xl border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
                    <div class="relative">
                        <img
                            src="/images/dashboard/3.png"
                            alt="Hawaii Home Movers Property"
                            class="w-full rounded-lg h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                            @click.stop
                            class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Icon
                                name="lucide:heart"
                                class="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                    <div class="p-3 sm:p-4">
                        <div
                            class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-0">
                            <div class="flex-1">
                                <h3
                                    class="font-semibold tracking-wide text-gray-900 text-sm sm:text-base mb-1">
                                    Hawaii Home Movers
                                </h3>
                                <p
                                    class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                    123 Aloha Lane, Honolulu, HI 96818
                                </p>
                            </div>
                            <p
                                class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 self-start">
                                $475,000
                            </p>
                        </div>
                        <div
                            class="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card.bed.svg"
                                    alt="" />
                                <span class="font-medium">5 Beds</span>
                            </div>
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card-bath.svg"
                                    alt="" />
                                <span class="font-medium">3 Baths</span>
                            </div>
                            <div class="flex items-center">
                                <img
                                    class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                    src="/svg/dashboard/card-cube.svg"
                                    alt="" />
                                <span class="font-medium">1733/5000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Videos you might like! Section -->
        <div class="rounded-lg mb-10">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-base sm:text-lg font-semibold text-gray-900">
                    Videos you might like!
                </h2>
                <button
                    class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    See all
                </button>
            </div>

            <!-- Video Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Video Card 1 - Hawaiian Airlines -->
                <div
                    class="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div class="relative h-40 sm:h-48 md:h-52">
                        <!-- Video thumbnail -->
                        <img
                            src="/images/dashboard/video/1.png"
                            alt="Hawaiian Airlines Video Thumbnail"
                            class="w-full h-full object-cover" />
                        <!-- Video overlay with title -->
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-3 sm:pb-4">
                            <div class="text-center text-white z-10">
                                <h3 class="font-bold text-base sm:text-lg mb-1">
                                    HAWAIIAN
                                </h3>
                                <p class="text-xs sm:text-sm opacity-90">
                                    AIRLINES
                                </p>
                            </div>
                        </div>
                        <!-- Play button overlay -->
                        <div
                            class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                                class="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
                                <Icon
                                    name="lucide:play"
                                    class="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                            </div>
                        </div>
                        <!-- Duration badge -->
                        <div
                            class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            3:45
                        </div>
                    </div>
                </div>

                <!-- Video Card 2 - Livestrand House -->
                <div
                    class="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div class="relative h-40 sm:h-48 md:h-52">
                        <!-- Video thumbnail -->
                        <img
                            src="/images/dashboard/video/2.png"
                            alt="Livestrand House Video Thumbnail"
                            class="w-full h-full object-cover" />
                        <!-- Video overlay with title -->
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-3 sm:pb-4">
                            <div class="text-center text-white z-10">
                                <h3 class="font-bold text-base sm:text-lg mb-1">
                                    LIVESTRAND
                                </h3>
                                <p class="text-xs sm:text-sm opacity-90">
                                    HOUSE
                                </p>
                            </div>
                        </div>
                        <!-- Play button overlay -->
                        <div
                            class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                                class="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
                                <Icon
                                    name="lucide:play"
                                    class="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                            </div>
                        </div>
                        <!-- Duration badge -->
                        <div
                            class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            5:12
                        </div>
                    </div>
                </div>

                <!-- Video Card 3 - Which One Are You -->
                <div
                    class="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div class="relative h-40 sm:h-48 md:h-52">
                        <!-- Video thumbnail -->
                        <img
                            src="/images/dashboard/video/3.png"
                            alt="Which One Are You Video Thumbnail"
                            class="w-full h-full object-cover" />
                        <!-- Video overlay with title -->
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-3 sm:pb-4">
                            <div class="text-center text-white z-10">
                                <h3 class="font-bold text-base sm:text-lg mb-1">
                                    WHICH
                                </h3>
                                <p class="text-xs sm:text-sm opacity-90">
                                    ONE ARE YOU?
                                </p>
                            </div>
                        </div>
                        <!-- Play button overlay -->
                        <div
                            class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                                class="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
                                <Icon
                                    name="lucide:play"
                                    class="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                            </div>
                        </div>
                        <!-- Duration badge -->
                        <div
                            class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                            2:58
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

    // Chart related state
    const selectedPeriod = ref('weekly');
    const showTooltip = ref(false);
    const tooltipStyle = ref({
        left: '0px',
        top: '0px',
        transform: 'translateX(-50%)',
    });

    // Chart data
    const chartData = ref({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Current Market',
                backgroundColor: '#E2E8F0', // Light gray for background bars
                borderColor: '#E2E8F0',
                borderWidth: 0,
                data: [40, 32, 22, 21, 20, 22, 32],
                borderRadius: 14,
                borderSkipped: false,
                categoryPercentage: 0.5, // Controls space between categories (reduced for more gap)
                barPercentage: 0.9,
                barThickness: 12,
            },
            {
                label: 'Best FHA Loans',
                backgroundColor: '#334155', // Dark color for foreground bars
                borderColor: '#334155',
                borderWidth: 0,
                data: [50, 40, 35, 29, 30, 26, 40],
                borderRadius: 14,
                borderSkipped: false,
                categoryPercentage: 0.5, // Controls space between categories (reduced for more gap)
                barPercentage: 0.9,
                barThickness: 12,
            },
        ],
    });

    // Chart options
    const chartOptions = ref({
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                bottom: 10,
                left: 10,
                right: 10,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false, // Disable default tooltip
            },
        },
        scales: {
            x: {
                display: true,
                categoryPercentage: 0.7, // Controls space between categories
                barPercentage: 0.8, // Controls space between bars in same category
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9CA3AF',
                    font: {
                        size: 11,
                        family: 'Inter, sans-serif',
                    },
                    padding: 8,
                },
                border: {
                    display: false,
                },
            },
            y: {
                display: true,
                beginAtZero: true,
                max: 50,
                grid: {
                    color: '#F3F4F6',
                    lineWidth: 1,
                    drawBorder: false,
                },
                ticks: {
                    color: '#9CA3AF',
                    font: {
                        size: 11,
                        family: 'Inter, sans-serif',
                    },
                    callback: function (value) {
                        return value + '%';
                    },
                    stepSize: 10,
                    padding: 12,
                },
                border: {
                    display: false,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'point',
        },
        onHover: (event, elements, chart) => {
            if (elements.length > 0) {
                const element = elements[0];
                const datasetIndex = element.datasetIndex;
                const index = element.index;

                // Only show tooltip for the dark bars (dataset index 1) and specific bar (index 3 for Thu with 29%)
                if (datasetIndex === 1 && index === 3) {
                    showTooltip.value = true;

                    // Calculate tooltip position relative to chart
                    const x = element.element.x;
                    const y = element.element.y;

                    tooltipStyle.value.left = `${x}px`;
                    tooltipStyle.value.top = `${y - 70}px`;
                    tooltipStyle.value.transform = 'translateX(-50%)';
                } else {
                    showTooltip.value = false;
                }
            } else {
                showTooltip.value = false;
            }
        },
        animation: {
            duration: 0, // Disable animation for smoother tooltip
        },
    });

    // Function to switch between Home and Videos
    const switchTab = (tab) => {
        activeTab.value = tab;
    };

    // Function to navigate to property details
    const navigateToProperty = (propertyId) => {
        navigateTo(`/kamaina/property/${propertyId}`);
    };

    // Watch for period changes
    watch(selectedPeriod, (newPeriod) => {
        // Update chart data based on selected period
        if (newPeriod === 'monthly') {
            chartData.value.labels = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
            ];
            chartData.value.datasets[0].data = [35, 38, 25, 28, 32, 29, 35];
            chartData.value.datasets[1].data = [45, 42, 38, 35, 40, 38, 42];
        } else if (newPeriod === 'yearly') {
            chartData.value.labels = [
                '2019',
                '2020',
                '2021',
                '2022',
                '2023',
                '2024',
                '2025',
            ];
            chartData.value.datasets[0].data = [30, 35, 28, 32, 38, 35, 40];
            chartData.value.datasets[1].data = [40, 45, 38, 42, 48, 45, 50];
        } else {
            // weekly (default)
            chartData.value.labels = [
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
                'Sun',
            ];
            chartData.value.datasets[0].data = [40, 32, 22, 21, 20, 22, 32];
            chartData.value.datasets[1].data = [50, 40, 35, 29, 30, 26, 40];
        }
    });
</script>

<style scoped>
    /* Dashboard styles */
</style>
