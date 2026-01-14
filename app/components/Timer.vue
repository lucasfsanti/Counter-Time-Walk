<template>
    <UCard variant="outline">
      <!-- <span v-if="this && this.timerId">{{ timerId }}</span> -->
      <h1 class="timer-display font-timer">{{minutes}}:{{seconds}}</h1>
      <div class="flex gap-2 flex-wrap justify-center">
        <UButton @click="startTimer()" icon="ic:round-play-arrow" size="xl" v-if="interval === null" />
        <UButton @click="stopTimer()" icon="ic:round-pause" size="xl" v-if="interval != null" />
        <UButton @click="resetTimer()" icon="ic:round-replay" size="xl" />
        <UButton @click="deleteTimer()" icon="ic:round-delete" />
      </div>
      <div class="flex gap-2 mt-4 flex-wrap justify-center">
        <UButton @click="currentTime += 30" label="30 s" icon="ic:round-add" color="secondary" class="text-yellow-energy" />
        <UButton @click="currentTime += 60" label="1 min" icon="ic:round-add" color="secondary" class="text-yellow-energy" />
        <UButton @click="currentTime += 5 * 60" label="5 min" icon="ic:round-add" color="secondary" class="text-yellow-energy" />
      </div>
      <div class="flex gap-2 mt-2 flex-wrap justify-center">
        <UButton @click="currentTime -= 30" label="30s" icon="ic:round-minus" color="secondary" class="text-yellow-energy" />
        <UButton @click="currentTime -= 60" label="1 min" icon="ic:round-minus" color="secondary" class="text-yellow-energy" />
        <UButton @click="currentTime -= 5 * 60" label="5 min" icon="ic:round-minus" color="secondary" class="text-yellow-energy" />
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

  // beforeCreate() {
  //   this.interval = interval;
  // },

  props: {
    timerId: Number
  },

  watch: {
    currentTime: {
      handler(value) {
        let min = parseInt(value / 60, 10);
        this.minutes = min < 10 ? "0" + min : min;
        let sec = parseInt(value % 60, 10);
        this.seconds = sec < 10 ? "0" + sec : sec;
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
  .timer-display {
    font-family: 'Digital Dismay';
    font-size: 15vw;
    color: var(--ui-text);
    line-height: initial;
    /* height: 15vw; */
  }
</style>