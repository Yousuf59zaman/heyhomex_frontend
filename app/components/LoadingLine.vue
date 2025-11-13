<template>
  <div class="relative w-full h-full overflow-hidden">
    <slot />
    <div class="absolute top-0 left-0 w-full h-2 bg-blue-500 animate-loading-line z-10"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingLine'
}
</script>

<style scoped>
.animate-loading-line {
  animation: moveUpDown 1.5s infinite ease-in-out;
}

@keyframes moveUpDown {
  0% { transform: translateY(0); }
  50% { transform: translateY(calc(100vh - 50%)); }
  100% { transform: translateY(0); }
}
</style>