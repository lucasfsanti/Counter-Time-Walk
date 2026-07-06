<template>
    <UCard variant="outline" :style="paletteStyle">
      <h1 class="timer-display">{{minutes}}:{{seconds}}</h1>
      <div class="flex gap-2 flex-wrap justify-center">
        <UButton @click="startTimer()" icon="ic:round-play-arrow" size="xl" :disabled="interval != null" />
        <UButton @click="stopTimer()" icon="material-symbols:pause-rounded" size="xl" :disabled="interval === null" />
        <UButton @click="resetTimer()" icon="ic:round-replay" size="xl" />
        <UButton @click="deleteTimer()" icon="ic:round-delete" />
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

<script>
const defaultTimer = 50 * 60;
let interval = null;

export default {
  data() {
    return {
      timerCount: defaultTimer,
      currentTime: defaultTimer,
      minutes: 50,
      seconds: 0,
      interval: null,
    }
  },

  props: {
    timerId: Number,
    palette: {
      type: Object,
      default: () => getColorPalette(0)
    }
  },

  computed: {
    paletteStyle() {
      return {
        '--ui-border': this.palette.border,
        '--ui-text': this.palette.text
      };
    },

    accentStyle() {
      return {
        color: this.palette.accent
      };
    }
  },

  watch: {
    currentTime: {
      handler(value) {
        let min = parseInt(value / 60, 10);
        this.minutes = min < 10 ? "0" + min : min;
        let sec = parseInt(value % 60, 10);
        this.seconds = sec < 10 ? "0" + sec : sec;

        if (value <= 0) {
          this.stopTimer();
        }
      },
      immediate: true
    }
  },

  methods: {
    startTimer() {
      if (this.interval === null) {
        this.interval = setInterval(() => {
          this.currentTime--;
        }, 1000);
      }

      debugger
    },

    stopTimer() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null
      }
    },

    resetTimer() {
      this.currentTime = this.timerCount;
    },

    deleteTimer() {
      const nuxtApp = useNuxtApp()

      nuxtApp.callHook('app:timer:delete', this.timerId);
    }
  }
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
    /* height: 15vw; */
  }
</style>