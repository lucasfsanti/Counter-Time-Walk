<template>
  <div class="pip-content flex flex-row items-start justify-center gap-4 p-4">
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

<style>
  /* Sizes to its natural content width/height so usePiP can read it via
     scrollWidth/scrollHeight and resize the floating window to match,
     regardless of the window's current (pre-resize) viewport size. */
  .pip-content {
    width: max-content;
  }

  /* Fixed size instead of the main view's 15vw: the PiP window is resized to
     fit this content, so a viewport-relative font would feed back into its
     own layout width and never settle. */
  .pip-content .timer-display {
    font-size: 4rem;
  }
</style>
