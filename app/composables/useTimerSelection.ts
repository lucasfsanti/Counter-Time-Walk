import { ref, watch } from 'vue'
import { useTimerList } from './useTimerList'

const activeTimerId = ref<number | null>(null)

export function useTimerSelection() {
  const { timers } = useTimerList()

  function ensureValid() {
    if (timers.value.length === 0) {
      activeTimerId.value = null
      return
    }
    if (!timers.value.some(t => t.timerId === activeTimerId.value)) {
      activeTimerId.value = timers.value[0].timerId
    }
  }

  ensureValid()
  watch(() => timers.value.length, ensureValid, { flush: 'sync' })

  function setActiveTimer(timerId: number) {
    activeTimerId.value = timerId
  }

  function selectNext() {
    ensureValid()
    if (timers.value.length === 0) return
    const index = timers.value.findIndex(t => t.timerId === activeTimerId.value)
    activeTimerId.value = timers.value[(index + 1) % timers.value.length].timerId
  }

  function selectPrevious() {
    ensureValid()
    if (timers.value.length === 0) return
    const index = timers.value.findIndex(t => t.timerId === activeTimerId.value)
    activeTimerId.value = timers.value[(index - 1 + timers.value.length) % timers.value.length].timerId
  }

  return { activeTimerId, setActiveTimer, selectNext, selectPrevious }
}

export function _resetTimerSelectionForTesting() {
  activeTimerId.value = null
}
