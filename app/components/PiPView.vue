<template>
  <div class="pip-content flex flex-row items-stretch">
    <div v-for="timer in timers" :key="timer.timerId" class="pip-timer-slot">
      <Timer
        :timer-id="timer.timerId"
        :palette="timer.palette"
        :show-delete="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { timers } = useTimerList()
</script>

<style>
  .pip-content {
    width: 100%;
    height: 100svh;
    overflow: hidden;
    padding-block: 1rem;
    gap: 4px;
  }

  .pip-timer-slot {
    flex: 1;
    min-width: 0;
    container-type: inline-size;
    display: flex;
    align-items: stretch;
  }

  /* UCard root fills the slot height */
  .pip-timer-slot > * {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* UCard body: center content vertically, proportional padding */
  .pip-timer-slot [data-slot="body"] {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4cqw;
    gap: 3cqw;
  }

  .pip-timer-slot .timer-display {
    font-size: 30cqw;
  }

  .pip-timer-slot .timer-name-label,
  .pip-timer-slot .timer-name-input {
    font-size: clamp(1rem, 6cqw, 3rem);
  }

  /* Scale the main control buttons and their icons */
  .pip-timer-slot .flex.gap-2 {
    gap: 3cqw;
  }

  .pip-timer-slot button {
    width: 11cqw;
    height: 11cqw;
    min-width: unset;
    padding: 0;
    display: grid;
    place-items: center;
  }

  .pip-timer-slot button svg {
    width: 7cqw;
    height: 7cqw;
  }

  /* Hide time-adjustment rows */
  .pip-content .timer-adjustments {
    display: none;
  }
</style>
