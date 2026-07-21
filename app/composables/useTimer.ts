import { ref, computed, watch } from 'vue'

const DEFAULT_DURATION = 50 * 60

export function useTimer() {
  const timerCount = ref(DEFAULT_DURATION)
  const currentTime = ref(DEFAULT_DURATION)
  const interval = ref<ReturnType<typeof setInterval> | null>(null)

  const minutes = computed(() => {
    const min = Math.floor(currentTime.value / 60)
    return min < 10 ? `0${min}` : `${min}`
  })

  const seconds = computed(() => {
    const sec = currentTime.value % 60
    return sec < 10 ? `0${sec}` : `${sec}`
  })

  watch(currentTime, (value) => {
    if (value <= 0) stopTimer()
  }, { immediate: true, flush: 'sync' })

  function startTimer() {
    if (interval.value === null) {
      interval.value = setInterval(() => {
        currentTime.value--
      }, 1000)
    }
  }

  function stopTimer() {
    if (interval.value !== null) {
      clearInterval(interval.value)
      interval.value = null
    }
  }

  function resetTimer() {
    currentTime.value = timerCount.value
  }

  return { currentTime, minutes, seconds, interval, startTimer, stopTimer, resetTimer }
}
