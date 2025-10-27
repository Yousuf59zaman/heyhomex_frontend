<script setup>
    useHead({ title: 'Admin Login' });
    definePageMeta({ middleware: ['guest'], layout: 'guest' });
</script>
<template>
    <div class="min-h-screen flex flex-col justify-between items-center">
        <AuthAdminLogin />
    </div>
</template>
