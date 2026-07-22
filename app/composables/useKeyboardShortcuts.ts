import { onMounted, onUnmounted } from 'vue'
import { useTimerList } from './useTimerList'
import { useTimerSelection } from './useTimerSelection'
import { useTimer } from './useTimer'
import { usePiP } from './usePiP'

const TIME_STEP = 30

export function useKeyboardShortcuts() {
  const { addTimer } = useTimerList()
  const { activeTimerId, selectNext, selectPrevious } = useTimerSelection()
  const { isSupported, isOpen, openPiP, closePiP } = usePiP()

  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const target = event.target as HTMLElement | null
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return

    switch (event.code) {
      case 'Space': {
        event.preventDefault()
        if (activeTimerId.value === null) break
        const { interval, startTimer, stopTimer } = useTimer(activeTimerId.value)
        if (interval.value === null) startTimer()
        else stopTimer()
        break
      }
      case 'KeyR': {
        if (activeTimerId.value === null) break
        useTimer(activeTimerId.value).resetTimer()
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (activeTimerId.value === null) break
        useTimer(activeTimerId.value).currentTime.value += TIME_STEP
        break
      }
      case 'ArrowDown': {
        event.preventDefault()
        if (activeTimerId.value === null) break
        useTimer(activeTimerId.value).currentTime.value -= TIME_STEP
        break
      }
      case 'ArrowLeft':
        event.preventDefault()
        selectPrevious()
        break
      case 'ArrowRight':
        event.preventDefault()
        selectNext()
        break
      case 'KeyN':
        addTimer()
        break
      case 'KeyP':
        if (isSupported.value) {
          if (isOpen.value) closePiP()
          else openPiP()
        }
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return { handleKeydown }
}
