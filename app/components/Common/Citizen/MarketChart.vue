<script setup>
    const emit = defineEmits(["period-change"])

    const props = defineProps({
        title: {
            type: String,
            default: "Current Local Market VS Best Local FHA Loans",
        },
        initialPeriod: {
            type: String,
            default: "weekly",
        },
    })

    const periods = [
        {label: "Weekly", value: "weekly"},
        {label: "Monthly", value: "monthly"},
        {label: "Yearly", value: "yearly"},
    ]

    const selectedPeriod = ref(props.initialPeriod)
    const isDropdownOpen = ref(false)
    const dropdownRef = ref(null)

    const selectedLabel = computed(() => {
        const period = periods.find((p) => p.value === selectedPeriod.value)
        return period ? period.label : "Weekly"
    })

    const toggleDropdown = () => {
        isDropdownOpen.value = !isDropdownOpen.value
    }

    const selectPeriod = (period) => {
        selectedPeriod.value = period.value
        isDropdownOpen.value = false
        emit("period-change", period.value)
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
            isDropdownOpen.value = false
        }
    }

    onMounted(() => {
        document.addEventListener("click", handleClickOutside)
    })

    onUnmounted(() => {
        document.removeEventListener("click", handleClickOutside)
    })
    const showTooltip = ref(false)
    const tooltipStyle = ref({
        left: "0px",
        top: "0px",
        transform: "translateX(-50%)",
    })

    const tooltipData = ref({
        value: "29%",
        label: "Special Loan Eligibility",
    })

    const chartDataConfigs = {
        weekly: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            currentMarket: [40, 32, 22, 21, 20, 22, 32],
            bestLoans: [50, 40, 35, 29, 30, 26, 40],
        },
        monthly: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            currentMarket: [35, 38, 25, 28, 32, 29, 35],
            bestLoans: [45, 42, 38, 35, 40, 38, 42],
        },
        yearly: {
            labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
            currentMarket: [30, 35, 28, 32, 38, 35, 40],
            bestLoans: [40, 45, 38, 42, 48, 45, 50],
        },
    }

    const chartData = computed(() => {
        const config = chartDataConfigs[selectedPeriod.value]
        return {
            labels: config.labels,
            datasets: [
                {
                    label: "Current Market",
                    backgroundColor: "#BEC3C9",
                    borderColor: "#BEC3C9",
                    borderWidth: 0,
                    data: config.currentMarket,
                    borderRadius: {
                        topLeft: 4,
                        topRight: 4,
                        bottomLeft: 0,
                        bottomRight: 0,
                    },
                    borderSkipped: false,
                    categoryPercentage: 0.5,
                    barPercentage: 0.9,
                    barThickness: 12,
                },
                {
                    label: "Best FHA Loans",
                    backgroundColor: "#2C3E50",
                    borderColor: "#2C3E50",
                    borderWidth: 0,
                    data: config.bestLoans,
                    borderRadius: {
                        topLeft: 4,
                        topRight: 4,
                        bottomLeft: 0,
                        bottomRight: 0,
                    },
                    borderSkipped: false,
                    categoryPercentage: 0.5,
                    barPercentage: 0.9,
                    barThickness: 12,
                },
            ],
        }
    })

    const chartOptions = {
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
                enabled: false,
            },
        },
        scales: {
            x: {
                display: true,
                categoryPercentage: 0.7,
                barPercentage: 0.8,
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#7A7A7A",
                    font: {
                        size: 16,
                        family: "sf-pro-Regular, sans-serif",
                        weight: "400",
                    },
                    padding: 12,
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
                    color: "#EAECEE",
                    lineWidth: 1,
                    borderDash: [4, 4],
                    drawBorder: false,
                },
                ticks: {
                    color: "#7A7A7A",
                    font: {
                        size: 14,
                        family: "sf-pro-Regular, sans-serif",
                        weight: "400",
                    },
                    callback: function (value) {
                        return value + "%"
                    },
                    stepSize: 10,
                    padding: 16,
                },
                border: {
                    display: false,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "point",
        },
        onHover: (event, elements, chart) => {
            if (elements.length > 0) {
                const element = elements[0]
                const datasetIndex = element.datasetIndex
                const index = element.index

                if (datasetIndex === 1 && index === 3) {
                    showTooltip.value = true

                    const x = element.element.x
                    const y = element.element.y

                    tooltipStyle.value.left = `${x}px`
                    tooltipStyle.value.top = `${y - 70}px`
                    tooltipStyle.value.transform = "translateX(-50%)"
                } else {
                    showTooltip.value = false
                }
            } else {
                showTooltip.value = false
            }
        },
        animation: {
            duration: 0,
        },
    }

    watch(
        () => props.initialPeriod,
        (newPeriod) => {
            selectedPeriod.value = newPeriod
        }
    )
</script>

<template>
    <div class="bg-white rounded-[10px] p-5">
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
            <h2
                class="text-[20px] leading-[24px] tracking-[0.4px] font-semibold text-[#121A22]">
                {{ title }}
            </h2>
            <div ref="dropdownRef" class="relative w-fit">
                <button
                    type="button"
                    @click="toggleDropdown"
                    class="flex h-[32px] items-center gap-[6px] rounded-[32px] bg-[#EAECEE] px-[16px] text-[12px] leading-[16px] font-normal text-[#2C3E50] transition-all hover:bg-[#DFE2E6] focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20">
                    <span>{{ selectedLabel }}</span>
                    <svg
                        class="size-[16px] transition-transform duration-200"
                        :class="{ 'rotate-180': isDropdownOpen }"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true">
                        <path
                            d="M6 8l4 4 4-4"
                            stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
                <Transition
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-95 -translate-y-1"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 -translate-y-1">
                    <div
                        v-if="isDropdownOpen"
                        class="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[120px] overflow-hidden rounded-[8px] bg-white py-1 shadow-lg ring-1 ring-black/5">
                        <button
                            v-for="period in periods"
                            :key="period.value"
                            type="button"
                            @click="selectPeriod(period)"
                            class="flex w-full items-center px-4 py-2 text-[13px] leading-[18px] transition-colors"
                            :class="
                                selectedPeriod === period.value
                                    ? 'bg-[#2C3E50] text-white font-medium'
                                    : 'text-[#2C3E50] hover:bg-[#F5F6F7]'
                            ">
                            {{ period.label }}
                        </button>
                    </div>
                </Transition>
            </div>
        </div>

        <div class="h-48 sm:h-64 md:h-80 relative">
            <Chart
                type="bar"
                :data="chartData"
                :options="chartOptions"
                class="h-full" />

            <div
                v-if="showTooltip"
                :style="tooltipStyle"
                class="absolute bg-[#2C3E50] text-white px-6 py-4 rounded-[16px] shadow-lg z-10 pointer-events-none">
                <div class="text-[18px] leading-[24px] font-semibold text-center">
                    {{ tooltipData.value }}
                </div>
                <div class="text-[12px] leading-[16px] text-center whitespace-nowrap">
                    {{ tooltipData.label }}
                </div>

                <div
                    class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#2C3E50]"></div>
            </div>
        </div>
    </div>
</template>
