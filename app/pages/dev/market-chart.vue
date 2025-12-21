<script setup>
    definePageMeta({layout: "guest"})

    const hydrated = ref(false)

    onMounted(() => {
        hydrated.value = true
    })
</script>

<template>
    <div class="min-h-screen bg-gray-100 p-6">
        <div class="mx-auto max-w-4xl">
            <CommonCitizenMarketChart v-if="hydrated" />
        </div>
    </div>
</template>

