import { computed, watch } from 'vue'
import { useTimerList } from './useTimerList'

const DEFAULT_DURATION = 50 * 60

export function useTimer(timerId: number) {
  const { timers } = useTimerList()

  const entry = computed(() => timers.value.find(t => t.timerId === timerId)!)

  const currentTime = computed({
    get: () => entry.value.currentTime,
    set: (v: number) => { entry.value.currentTime = v },
  })

  const minutes = computed(() => {
    const min = Math.floor(entry.value.currentTime / 60)
    return min < 10 ? `0${min}` : `${min}`
  })

  const seconds = computed(() => {
    const sec = entry.value.currentTime % 60
    return sec < 10 ? `0${sec}` : `${sec}`
  })

  const interval = computed(() => entry.value.interval)

  watch(() => entry.value.currentTime, (value) => {
    if (value <= 0) stopTimer()
  }, { immediate: true, flush: 'sync' })

  function startTimer() {
    if (entry.value.interval === null) {
      entry.value.interval = setInterval(() => {
        entry.value.currentTime--
      }, 1000)
    }
  }

  function stopTimer() {
    if (entry.value.interval !== null) {
      clearInterval(entry.value.interval)
      entry.value.interval = null
    }
  }

  function resetTimer() {
    entry.value.currentTime = DEFAULT_DURATION
  }

  return { currentTime, minutes, seconds, interval, startTimer, stopTimer, resetTimer }
}
