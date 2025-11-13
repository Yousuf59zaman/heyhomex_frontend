<script setup>
    const hamburger_button = useState('hamburger_button', () => true);
</script>

<template>
    <ClientOnly fallbackTag="div">
        <!-- This is admin panel section  -->
        <div
            class="relative transition-all duration-500 ease-in-out min-h-screen"
            :class="
                hamburger_button ? 'ml-0 md:ml-[250px]' : 'ml-0 md:ml-[70px]'
            ">
            <AppHeaderAdmin />
            <slot />
        </div>

        <!-- loader until full js bundle loads -->
        <template #fallback>
            <div class="flex items-center justify-center w-screen h-screen">
                <div class="flex justify-center card">
                    <ProgressSpinner
                        style="width: 50px; height: 50px"
                        strokeWidth="8"
                        fill="transparent"
                        animationDuration=".5s"
                        aria-label="Custom ProgressSpinner" />
                </div>
            </div>
        </template>
    </ClientOnly>
</template>

<style lang="scss" scoped></style>
