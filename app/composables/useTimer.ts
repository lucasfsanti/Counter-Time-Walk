import { computed, watch } from 'vue'
import { useTimerList } from './useTimerList'
import { useSound } from './useSound'

const DEFAULT_DURATION = 50 * 60

export function useTimer(timerId: number) {
  const { timers } = useTimerList()
  const { playAlarm } = useSound()

  const entry = computed(() => timers.value.find(t => t.timerId === timerId)!)

  const currentTime = computed({
    get: () => entry.value.currentTime,
    set: (v: number) => {
      entry.value.currentTime = v
      if (v > 0) entry.value.isAlarming = false
    },
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
  const isAlarming = computed(() => entry.value.isAlarming)

  const name = computed({
    get: () => entry.value.name,
    set: (v: string) => {
      entry.value.name = v
    },
  })

  watch(() => entry.value?.currentTime, (value) => {
    if (value === undefined || value > 0) return
    stopTimer()
    if (!entry.value.isAlarming) {
      entry.value.isAlarming = true
      playAlarm()
    }
  }, { immediate: true, flush: 'sync' })

  function startTimer() {
    if (entry.value.interval === null) {
      entry.value.isAlarming = false
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
    entry.value.isAlarming = false
  }

  return { currentTime, minutes, seconds, interval, isAlarming, name, startTimer, stopTimer, resetTimer }
}
