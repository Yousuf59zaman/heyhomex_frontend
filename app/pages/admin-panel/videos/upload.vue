<script setup>
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });

const uploadUrl = 'https://dev-video.heyhomex.orangebd.com/';
</script>

<template>
    <div class="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900">
        <div class="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6">
            <section
                class="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-sky-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-slate-900 shadow-sm">
                <div class="p-6 sm:px-8 sm:py-6">
                    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div class="max-w-2xl">
                          
                            <h1
                                class="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                                Upload Video
                            </h1>
                            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                                Upload new videos, manage quality presets, and keep your content organized in the
                                embedded uploader below.
                            </p>
                        </div>
                     
                    </div>
                </div>
                <div
                    class="pointer-events-none absolute -right-24 -top-16 h-48 w-48 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-500/20"></div>
                <div
                    class="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-indigo-200/60 blur-3xl dark:bg-indigo-500/20"></div>
            </section>

            <section class="mt-4">
                <div
                    class="flex h-screen min-h-[50vh] flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-xl dark:border-gray-700/70 dark:bg-gray-900">
                   
                    <iframe
                        :src="uploadUrl"
                        title="HeyHomex Video Upload"
                        class="h-full w-full flex-1 min-h-0 bg-white"
                        loading="lazy"
                        allow="clipboard-write; clipboard-read"></iframe>
                </div>
            </section>
        </div>
    </div>
</template>
