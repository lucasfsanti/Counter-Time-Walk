<template>
    <UCard
      variant="outline"
      :style="paletteStyle"
      :class="['relative', { 'timer-card--active': isActive, 'timer-card--alarming': isAlarming }]"
      @mouseenter="setActiveTimer(props.timerId)"
    >
      <h1 class="timer-display">{{minutes}}:{{seconds}}</h1>
      <div class="flex gap-2 flex-wrap justify-center">
        <UButton @click="startTimer()" icon="ic:round-play-arrow" size="xl" :disabled="interval != null" aria-label="Start timer" />
        <UButton @click="stopTimer()" icon="material-symbols:pause-rounded" size="xl" :disabled="interval === null" aria-label="Pause timer" />
        <UButton @click="resetTimer()" icon="ic:round-replay" size="xl" aria-label="Reset timer" />
        <UButton v-if="showDelete" @click="deleteTimer()" icon="ic:round-delete" aria-label="Delete timer" />
      </div>
      <div class="flex gap-2 mt-4 flex-wrap justify-center">
        <UButton @click="currentTime += 30" label="30 s" icon="ic:round-add" color="secondary" :style="accentStyle" />
        <UButton @click="currentTime += 60" label="1 min" icon="ic:round-add" color="secondary" :style="accentStyle" />
        <UButton @click="currentTime += 5 * 60" label="5 min" icon="ic:round-add" color="secondary" :style="accentStyle" />
      </div>
      <div class="flex gap-2 mt-2 flex-wrap justify-center">
        <UButton @click="currentTime -= 30" label="30s" icon="ic:round-minus" color="secondary" :style="accentStyle" />
        <UButton @click="currentTime -= 60" label="1 min" icon="ic:round-minus" color="secondary" :style="accentStyle" />
        <UButton @click="currentTime -= 5 * 60" label="5 min" icon="ic:round-minus" color="secondary" :style="accentStyle" />
      </div>
    </UCard>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  timerId: number
  palette?: { border: string; text: string; accent: string }
  showDelete?: boolean
}>(), {
  palette: () => getColorPalette(0),
  showDelete: true,
})

const { currentTime, minutes, seconds, interval, isAlarming, startTimer, stopTimer, resetTimer } = useTimer(props.timerId)

const { removeTimer } = useTimerList()

const { activeTimerId, setActiveTimer } = useTimerSelection()
const isActive = computed(() => activeTimerId.value === props.timerId)

const paletteStyle = computed(() => ({
  '--ui-border': props.palette.border,
  '--ui-text': props.palette.text,
  '--ui-glow': props.palette.accent,
}))

const accentStyle = computed(() => ({
  color: props.palette.accent,
}))

function deleteTimer() {
  removeTimer(props.timerId)
}
</script>

<style>
  @font-face {
    font-family: 'Digital Dismay';
    src: url('/Counter-Time-Walk/Digital%20Dismay.otf') format('otf'),
        url('/Digital%20Dismay.otf') format('otf');
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }

  .timer-display {
    font-family: 'clockicons';
    font-size: 15vw;
    color: var(--ui-text);
    line-height: initial;
    text-shadow: 0 0 16px color-mix(in srgb, currentColor 50%, transparent), 0 0 32px color-mix(in srgb, currentColor 20%, transparent);
    /* height: 15vw; */
  }

  .timer-card--active {
    box-shadow: 0 0 0 3px var(--ui-glow), 0 0 24px color-mix(in srgb, var(--ui-glow) 60%, transparent);
    transition: box-shadow 0.15s ease-out;
  }

  .timer-card--alarming {
    animation: timer-alarm-pulse 1s ease-in-out infinite;
  }

  .timer-card--alarming .timer-display {
    animation: timer-alarm-flash 1s ease-in-out infinite;
  }

  @keyframes timer-alarm-pulse {
    0%, 100% {
      box-shadow: 0 0 0 3px var(--ui-error), 0 0 24px color-mix(in srgb, var(--ui-error) 60%, transparent);
    }
    50% {
      box-shadow: 0 0 0 6px var(--ui-error), 0 0 48px color-mix(in srgb, var(--ui-error) 80%, transparent);
    }
  }

  @keyframes timer-alarm-flash {
    0%, 100% {
      color: var(--ui-text);
    }
    50% {
      color: var(--ui-error);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .timer-card--alarming,
    .timer-card--alarming .timer-display {
      animation: none;
      box-shadow: 0 0 0 3px var(--ui-error), 0 0 24px color-mix(in srgb, var(--ui-error) 60%, transparent);
      color: var(--ui-error);
    }
  }

</style>