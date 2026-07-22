import { ref } from 'vue'
import { getColorPalette } from '../utils/colorPalettes.js'

const DEFAULT_DURATION = 50 * 60

interface ColorPalette {
  border: string
  text: string
  accent: string
}

interface TimerEntry {
  timerId: number
  palette: ColorPalette
  currentTime: number
  interval: ReturnType<typeof setInterval> | null
  isAlarming: boolean
  name: string
}

let nextId = 1

const timers = ref<TimerEntry[]>([
  { timerId: 0, palette: getColorPalette(0), currentTime: DEFAULT_DURATION, interval: null, isAlarming: false, name: '' },
])

export function useTimerList() {
  function addTimer() {
    timers.value.push({
      timerId: nextId,
      palette: getColorPalette(nextId),
      currentTime: DEFAULT_DURATION,
      interval: null,
      isAlarming: false,
      name: '',
    })
    nextId++
  }

  function removeTimer(timerId: number) {
    const index = timers.value.findIndex(t => t.timerId === timerId)
    if (index !== -1) {
      if (timers.value[index].interval !== null) {
        clearInterval(timers.value[index].interval)
      }
      timers.value.splice(index, 1)
    }
  }

  return { timers, addTimer, removeTimer }
}

export function _resetForTesting() {
  timers.value = [{ timerId: 0, palette: getColorPalette(0), currentTime: DEFAULT_DURATION, interval: null, isAlarming: false, name: '' }]
  nextId = 1
}
