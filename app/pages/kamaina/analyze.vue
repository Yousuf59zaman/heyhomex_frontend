<script setup>
useHead({ title: "Analyzing - Kamaina" })
definePageMeta({ middleware: ["auth-citizen"], layout: "citizen" })

const router = useRouter()


const handleScanComplete = () => {
    router.push("/kamaina/report")
}
</script>

<template>
    <LoaderSiteAnalyzer @complete="handleScanComplete" />
</template>
