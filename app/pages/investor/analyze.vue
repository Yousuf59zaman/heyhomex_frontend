<script setup>
useHead({ title: "Analyzing - Investor" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const router = useRouter()


const handleScanComplete = () => {
    router.push("/investor/report")
}
</script>

<template>
    <LoaderSiteAnalyzer @complete="handleScanComplete" />
</template>
