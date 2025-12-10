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
                    backgroundColor: "#E2E8F0",
                    borderColor: "#E2E8F0",
                    borderWidth: 0,
                    data: config.currentMarket,
                    borderRadius: 14,
                    borderSkipped: false,
                    categoryPercentage: 0.5,
                    barPercentage: 0.9,
                    barThickness: 12,
                },
                {
                    label: "Best FHA Loans",
                    backgroundColor: "#334155",
                    borderColor: "#334155",
                    borderWidth: 0,
                    data: config.bestLoans,
                    borderRadius: 14,
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
                    color: "#9CA3AF",
                    font: {
                        size: 11,
                        family: "Inter, sans-serif",
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
                    color: "#F3F4F6",
                    lineWidth: 1,
                    drawBorder: false,
                },
                ticks: {
                    color: "#9CA3AF",
                    font: {
                        size: 11,
                        family: "Inter, sans-serif",
                    },
                    callback: function (value) {
                        return value + "%"
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

    const handlePeriodChange = () => {
        emit("period-change", selectedPeriod.value)
    }

    watch(
        () => props.initialPeriod,
        (newPeriod) => {
            selectedPeriod.value = newPeriod
        }
    )
</script>

<template>
    <div class="bg-white rounded-lg p-4">
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-2">
            <h2
                class="text-base lg:text-lg font-semibold text-gray-900 leading-tight">
                {{ title }}
            </h2>
            <div class="flex items-center space-x-2">
                <select
                    v-model="selectedPeriod"
                    @change="handlePeriodChange"
                    class="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option
                        v-for="period in periods"
                        :key="period.value"
                        :value="period.value">
                        {{ period.label }}
                    </option>
                </select>
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
                class="absolute bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg z-10 pointer-events-none">
                <div class="text-lg font-bold text-center">
                    {{ tooltipData.value }}
                </div>
                <div
                    class="text-xs text-gray-300 text-center whitespace-nowrap">
                    {{ tooltipData.label }}
                </div>

                <div
                    class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
            </div>
        </div>
    </div>
</template>
