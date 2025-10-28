<script setup>
useHead({ title: 'Admin Panel' });
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

</script>
<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="mb-8">
            <div class="relative">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
            </div>
            <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Admin Panel
            </h1>
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