import { onMounted, onUnmounted } from 'vue'
import { useTimerList } from './useTimerList'
import { useTimerSelection } from './useTimerSelection'
import { useTimer } from './useTimer'
import { usePiP } from './usePiP'
import { useSound } from './useSound'
import { useTimerNameEdit } from './useTimerNameEdit'

const TIME_STEP = 30

const DIGIT_KEY = /^Digit([1-9])$/

export function useKeyboardShortcuts() {
  const { addTimer, timers } = useTimerList()
  const { activeTimerId, setActiveTimer, selectNext, selectPrevious } = useTimerSelection()
  const { isSupported, isOpen, openPiP, closePiP } = usePiP()
  const { toggleMute } = useSound()
  const { startEditingName } = useTimerNameEdit()

  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const target = event.target as HTMLElement | null
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return

    const digitMatch = event.code.match(DIGIT_KEY)
    if (digitMatch) {
      const timer = timers.value[Number(digitMatch[1]) - 1]
      if (timer) setActiveTimer(timer.timerId)
      return
    }

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
      case 'KeyE':
        if (activeTimerId.value === null) break
        startEditingName(activeTimerId.value)
        break
      case 'KeyP':
        if (isSupported.value) {
          if (isOpen.value) closePiP()
          else openPiP()
        }
        break
      case 'KeyM':
        toggleMute()
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
