<script setup>
    useHead({ title: 'Admin Panel' });
	definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

    onMounted(() => {
    chartDataPie.value = setChartDataPie();
    chartOptionsPie.value = setChartOptionsPie();
});

// Pie Chart
const chartDataPie = ref();
const chartOptionsPie = ref(null);
const setChartDataPie = () => {
    const documentStyle = getComputedStyle(document.body);

    return {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [540, 325, 702],
                backgroundColor: [documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-orange-500'), documentStyle.getPropertyValue('--p-gray-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-cyan-400'), documentStyle.getPropertyValue('--p-orange-400'), documentStyle.getPropertyValue('--p-gray-400')]
            }
        ]
    };
};
const setChartOptionsPie = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: textColor,
                    font: {
                        size: 14
                    }
                }
            }
        }
    };
};

// Vertical Chart
onMounted(() => {
    chartDataVertical.value = setChartDataVertical();
    chartOptionsVertical.value = setChartOptionsVertical();
});

const chartDataVertical = ref();
const chartOptionsVertical = ref();
const setChartDataVertical = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'My First dataset',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: 'My Second dataset',
                backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
                borderColor: documentStyle.getPropertyValue('--p-gray-500'),
                data: [28, 48, 40, 19, 86, 27, 90]
            }
        ]
    };
};
const setChartOptionsVertical = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

// Line Chart
onMounted(() => {
    chartDataLine.value = setChartDataLine();
    chartOptionsLine.value = setChartOptionsLine();
});

const chartDataLine = ref();
const chartOptionsLine = ref();
        
const setChartDataLine = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'First Dataset',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                tension: 0.4,
                borderColor: documentStyle.getPropertyValue('--p-cyan-500')
            },
            {
                label: 'Second Dataset',
                data: [28, 48, 40, 19, 86, 27, 90],
                fill: false,
                borderDash: [5, 5],
                tension: 0.4,
                borderColor: documentStyle.getPropertyValue('--p-orange-500')
            },
            {
                label: 'Third Dataset',
                data: [12, 51, 62, 33, 21, 62, 45],
                fill: true,
                borderColor: documentStyle.getPropertyValue('--p-gray-500'),
                tension: 0.4,
                backgroundColor: 'rgba(107, 114, 128, 0.2)'
            }
        ]
    };
};
const setChartOptionsLine = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}
</script>
<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="mb-8">
            <div class="relative">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div class="relative flex justify-start">
                    <span class="pr-3 bg-white dark:bg-gray-900 text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Dashboard
                    </span>
                </div>
            </div>
            <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Analytics Overview
            </h1>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Track your platform's performance and user engagement metrics in real-time.
            </p>
        </div>

        <div class="grid grid-cols-1 gap-6">
            <div class="card flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow col-span-1">
                <h3 class="text-lg font-semibold mb-4">Line Chart</h3>
                <div class="h-[400px]">
                    <Chart type="line" :data="chartDataLine" :options="chartOptionsLine" class="w-full h-full" />
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="card flex flex-col justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Chart Distribution</h3>
                    <div class="h-[400px] flex items-center justify-center">
                        <Chart type="pie" 
                            :data="chartDataPie" 
                            :options="chartOptionsPie" 
                            class="w-full h-full max-w-full" 
                        />
                    </div>
                </div>
                
                <div class="card flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Monthly Statistics</h3>
                    <div class="h-[400px]">
                        <Chart type="bar" :data="chartDataVertical" :options="chartOptionsVertical" class="w-full h-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.card {
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
}
</style>