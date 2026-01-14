<template>
  <div class="h-full flex flex-wrap justify-center gap-10 py-10">
      <Timer v-for="timer in timers" :timer-id="timer.timerId" :key="timer.timerId"/>
  </div>
</template>

<script>
let ultimoId = 0;
export default {
  data() {
    return {
      timers: [{
        timerId: 0
      }]
    }
  },

  created() {
    const nuxtApp = useNuxtApp();

    nuxtApp.hook('app:timer:add', () => {
      this.onAddTimer();
    });

    nuxtApp.hook('app:timer:delete', (timerId) => {
      this.onDeleteTimer(timerId);
    })
  },

  methods: {
    onAddTimer() {
      ultimoId++;
      this.timers.push({
        timerId: ultimoId
      });
    },

    onDeleteTimer(timerId) {
      const indexToRemove = this.timers.findIndex(t => t.timerId === timerId);

      if (indexToRemove !== -1) {
        this.timers.splice(indexToRemove, 1);
      }
    }
  }
}
</script>