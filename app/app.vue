<script setup>
useHead({
    title: 'HeyHome - Your Home Starts Here',
    meta: [
        {
            name: 'description',
            content:
                "Where your next chapter begins — Kama'aina, Military, or Investor, your path starts with purpose",
        },
    ],
});

const app_key = useCookie('app_key', {
    default: () => [],
    watch: true
})
const { setAppKey } = useAppKey()
const cookie = useCookie($XCMS_TOKEN);
const auth = ref([]);
let retryCount = 0;
const MAX_RETRIES = 3;
const getCMSauth = async () => {
    try {
        auth.value = await $fetch('/api/auth');
        cookie.value = auth.value.login.data.token;
        retryCount = 0;
        setAppKey(auth.value.login.data.token);
    } catch (error) {
        if (error.response?.status === 401 && retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying authentication attempt ${retryCount}`);
            setTimeout(() => {
                getCMSauth();
            }, 1000 * retryCount);
        } else {
            console.error('Authentication failed:', error);
        }
    }
}
onMounted(() => {
    getCMSauth()
});
const isLoading = ref(false);
watch([cookie, app_key], () => {
    if (cookie.value && app_key.value.length) {
        isLoading.value = true
    }
})
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    
    <!-- <AuthCitizenAuthModals /> -->
</template>

<style lang="scss" scoped></style>
