<script setup lang="ts">
const config = useRuntimeConfig();
const currentYear = new Date().getFullYear();
</script>

<template>
  <div class="mt-2 flex items-center justify-center gap-1 text-xs text-neutral-400">
    <span class="font-semibold transition hover:text-white" href="https://github.com/lucasfsanti/Counter-Time-Walk" target="_blank">Time Walker v{{ config.public.version }}</span>
    - by
    <a class="font-semibold transition hover:text-white" href="https://github.com/lucasfsanti" target="_blank">Lucas Santiago</a>
    {{ currentYear }}
  </div>
</template>