<script setup>
    const hamburger_button = useState('hamburger_button', () => true);
</script>

<template>
    <div
        class="relative transition-all duration-500 ease-in-out min-h-screen"
        :class="hamburger_button ? 'ml-0 md:ml-[250px]' : 'ml-0 md:ml-[70px]'">
        <AppHeaderAdmin />
        <slot />
    </div>
</template>

<style lang="scss" scoped></style>
