<script setup>
    
    useHead({
        title: "HeyHome - Your Home Starts Here",
        meta: [
            {
                name: "description",
                content:
                    "Where your next chapter begins — Kama'aina, Military, or Investor, your path starts with purpose",
            },
        ],
    });
</script>

<template>
    <!-- <ClientOnly fallbackTag="div">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>

        <AuthCitizenAuthModal />

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
    </ClientOnly> -->

     <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>

                <!-- Global Auth Modal -->
        <AuthCitizenAuthModal />
</template>

<style lang="scss" scoped></style>
