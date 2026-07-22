<template>
  <div class="h-full flex flex-wrap justify-center gap-10 py-10">
      <Timer v-for="timer in timers" :timer-id="timer.timerId" :palette="timer.palette" :key="timer.timerId"/>
  </div>
</template>

<script setup lang="ts">
const { timers } = useTimerList()
</script>
