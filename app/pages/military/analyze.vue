<script setup>
useHead({ title: "Analyzing - Military" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const router = useRouter()

const handleScanComplete = () => {
    router.push("/military/report")
}
</script>

<template>
    <LoaderSiteAnalyzer @complete="handleScanComplete" />
</template>
