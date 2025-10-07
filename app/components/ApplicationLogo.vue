<script setup>
    const props = defineProps({
        width: {
            type: String,
            default: "100%",
        },
        height: {
            type: String,
            default: "100%",
        },
    });
</script>
<template>
    <div>
        <!-- <NuxtImg src="/images/logo.png" alt=""
            :width="width"
            :height="height"
            class="fill-current" /> -->

        <img
            src="/images/logo.png"
            :style="{ height: height , width: width  }"
            alt=""
        />
    </div>
</template>
