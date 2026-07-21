<template>
  <div class="h-full flex flex-wrap justify-center gap-10 py-10">
      <Timer v-for="timer in timers" :timer-id="timer.timerId" :palette="timer.palette" :key="timer.timerId"/>
  </div>
</template>

<script setup lang="ts">
const { timers, addTimer, removeTimer } = useTimerList()

const nuxtApp = useNuxtApp()
nuxtApp.hook('app:timer:add', () => addTimer())
nuxtApp.hook('app:timer:delete', (timerId: number) => removeTimer(timerId))
</script>
