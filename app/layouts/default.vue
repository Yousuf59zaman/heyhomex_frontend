<script setup>
</script>

<template>
    <div class="h-screen overflow-hidden">
        <AppHeaderGuest />

        <div :class="[' transition-all duration-100 ']">
            <slot />
        </div>

        <AppFooterGuest />
    </div>
</template>

<style lang="scss" scoped></style>
