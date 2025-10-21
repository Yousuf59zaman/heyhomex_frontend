<script setup>
    const props = defineProps({
        title: String,
        icon: String,
    });
</script>

<template>
    <div class="flex items-center gap-2 px-4 caption_header_block">
        <i :class="icon"></i>
        <span>{{ title }}</span>
    </div>
</template>

<style lang="scss" scoped>
.caption_header_block {
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #ddd;
    background: #f7f7f7;
}
</style>
