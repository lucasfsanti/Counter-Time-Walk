<template>
  <div class="flex flex-wrap justify-center gap-4 p-4 h-full">
    <Timer
      v-for="timer in timers"
      :key="timer.timerId"
      :timer-id="timer.timerId"
      :palette="timer.palette"
      :show-delete="false"
    />
  </div>
</template>

<script setup lang="ts">
const { timers } = useTimerList()
</script>
