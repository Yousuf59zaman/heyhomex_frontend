<script setup>
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const form = ref({
    cpc_value: '',
    cpm_value: ''
});

const errors = ref({});
const isLoading = ref(false);
const response_modal = ref({});
const permissions = ref({});

const loadSettings = async () => {
    isLoading.value = true;
    try {
        const getData = await $fetchAdmin('admin/ads-settings', {
            method: 'GET'
        });
        
        if (getData.data?.data) {
            form.value.cpc_value = getData.data.data.cpc_value;
            form.value.cpm_value = getData.data.data.cpm_value;
            permissions.value = getData.data.permissions;
        }
    } catch (e) {
        console.error('Error loading settings:', e.message);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadSettings();
});

const submitHandler = async () => {
    isLoading.value = true;
    errors.value = {};
    response_modal.value = {};
    
    try {
        const response = await $fetchAdmin('admin/ads-settings', {
            method: 'POST',
            body: {
                cpc_value: form.value.cpc_value,
                cpm_value: form.value.cpm_value
            }
        });

        if (response.status === 'success') {
            response_modal.value = {
                status: true,
                message: 'Ad settings updated successfully.'
            };
            form.value.cpc_value = response.data.cpc_value;
            form.value.cpm_value = response.data.cpm_value;
        }
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response._data.errors || {};
        }
        console.error('Error:', e.message);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="h-full w-full overflow-auto">
            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">Ad Settings
                        </h4>
                        <p class="text-xs text-gray-600 dark:text-gray-400 pb-2 px-4">
                            Configure the cost per click (CPC) and cost per mille/thousand impressions (CPM) values
                        </p>
                    </div>
                    
                    <LoaderDataFetch v-if="isLoading && !form.cpc_value" />
                    
                    <form v-else @submit.prevent="submitHandler" class="p-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- CPC Value -->
                            <div class="flex items-center gap-4">
                                <div class="flex-auto">
                                    <label class="font-semibold">CPC Value (Cost Per Click)</label>
                                    <div class="mt-1 relative rounded-md">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 dark:text-gray-400 text-sm">$</span>
                                        </div>
                                        <input 
                                            id="cpc_value" 
                                            v-model="form.cpc_value" 
                                            type="number" 
                                            step="0.00001"
                                            class="pl-7 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-200" 
                                            placeholder="0.05"
                                            :class="errors.cpc_value ? '!border-[#f44336]' : ''"
                                            @focus="errors.cpc_value = ''"
                                        />
                                    </div>
                                    <InputError v-if="errors.cpc_value" :message="errors.cpc_value[0]" class="text-sm mt-1" />
                                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Amount per click (e.g., 0.05 = $0.05)
                                    </p>
                                </div>
                            </div>

                            <!-- CPM Value -->
                            <div class="flex items-center gap-4">
                                <div class="flex-auto">
                                    <label class="font-semibold">CPM Value (Per 1000 Impressions)</label>
                                    <div class="mt-1 relative rounded-md">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 dark:text-gray-400 text-sm">$</span>
                                        </div>
                                        <input 
                                            id="cpm_value" 
                                            v-model="form.cpm_value" 
                                            type="number" 
                                            step="0.00001"
                                            class="pl-7 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-colors duration-200" 
                                            placeholder="0.001"
                                            :class="errors.cpm_value ? '!border-[#f44336]' : ''"
                                            @focus="errors.cpm_value = ''"
                                        />
                                    </div>
                                    <InputError v-if="errors.cpm_value" :message="errors.cpm_value[0]" class="text-sm mt-1" />
                                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Amount per 1000 views (e.g., 0.001 = $0.001)
                                    </p>
                                </div>
                            </div>
                        </div>

                        
                        <!-- Info Box -->
                        <div class="col-span-1 md:col-span-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fa fa-info-circle text-blue-400 text-lg"></i>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        About Ad Pricing
                                    </h3>
                                    <div class="mt-1 text-xs text-blue-700 dark:text-blue-400">
                                        <ul class="list-disc pl-4 space-y-1">
                                            <li>CPC: Charge per click</li>
                                            <li>CPM: Charge per 1000 impressions</li>
                                            <li>Global rates for all ads</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="col-span-1 md:col-span-2 flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
                            <Button v-if="isLoading" severity="secondary" style="cursor: not-allowed; width: 100px;">
                                <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8" animationDuration=".5s" />
                            </Button>
                            <Button v-else type="submit" label="Save Settings" severity="success" raised 
                                class="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                <template #icon="{ class: iconClass }">
                                    <i class="pi pi-check-circle mr-2" :class="iconClass"></i>
                                </template>
                            </Button>
                        </div>
                    </form>
                    <LazyResponseModal :response_modal="response_modal" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
}
</style>
