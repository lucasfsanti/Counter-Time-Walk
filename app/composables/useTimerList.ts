import { ref } from 'vue'
import { getColorPalette } from '../utils/colorPalettes.js'

export function useTimerList() {
  let nextId = 1

  const timers = ref([
    { timerId: 0, palette: getColorPalette(0) }
  ])

  function addTimer() {
    timers.value.push({ timerId: nextId, palette: getColorPalette(nextId) })
    nextId++
  }

  function removeTimer(timerId: number) {
    const index = timers.value.findIndex(t => t.timerId === timerId)
    if (index !== -1) timers.value.splice(index, 1)
  }

  return { timers, addTimer, removeTimer }
}
