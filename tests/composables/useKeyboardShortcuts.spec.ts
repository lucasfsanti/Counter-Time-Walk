// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope } from 'vue'

const pipMock = vi.hoisted(() => ({
  isSupported: { value: true },
  isOpen: { value: false },
  openPiP: vi.fn(),
  closePiP: vi.fn(),
}))

vi.mock('../../app/composables/usePiP', () => ({
  usePiP: () => pipMock,
}))

const soundMock = vi.hoisted(() => ({
  isMuted: { value: false },
  toggleMute: vi.fn(),
  playAlarm: vi.fn(),
}))

vi.mock('../../app/composables/useSound', () => ({
  useSound: () => soundMock,
}))

import { useKeyboardShortcuts } from '../../app/composables/useKeyboardShortcuts'
import { useTimerList, _resetForTesting } from '../../app/composables/useTimerList'
import { useTimerSelection, _resetTimerSelectionForTesting } from '../../app/composables/useTimerSelection'
import { useTimer } from '../../app/composables/useTimer'
import { useTimerNameEdit, _resetTimerNameEditForTesting } from '../../app/composables/useTimerNameEdit'

function keydown(code: string, opts: Partial<KeyboardEventInit> = {}) {
  return new KeyboardEvent('keydown', { code, cancelable: true, ...opts })
}

describe('useKeyboardShortcuts', () => {
  let scope: ReturnType<typeof effectScope>
  let handleKeydown: (event: KeyboardEvent) => void
  let list: ReturnType<typeof useTimerList>
  let selection: ReturnType<typeof useTimerSelection>

  beforeEach(() => {
    _resetForTesting()
    _resetTimerSelectionForTesting()
    _resetTimerNameEditForTesting()
    pipMock.isSupported.value = true
    pipMock.isOpen.value = false
    pipMock.openPiP.mockClear()
    pipMock.closePiP.mockClear()
    soundMock.toggleMute.mockClear()

    scope = effectScope()
    scope.run(() => {
      list = useTimerList()
      selection = useTimerSelection()
      handleKeydown = useKeyboardShortcuts().handleKeydown
    })
  })

  afterEach(() => {
    scope.stop()
  })

  it('Space starts the active timer, then pauses it on the next press', () => {
    const timer = scope.run(() => useTimer(0))!
    handleKeydown(keydown('Space'))
    expect(timer.interval.value).not.toBeNull()

    handleKeydown(keydown('Space'))
    expect(timer.interval.value).toBeNull()
  })

  it('KeyR resets the active timer', () => {
    const timer = scope.run(() => useTimer(0))!
    timer.currentTime.value = 10
    handleKeydown(keydown('KeyR'))
    expect(timer.currentTime.value).toBe(3000)
  })

  it('ArrowUp adds 30 seconds to the active timer', () => {
    const timer = scope.run(() => useTimer(0))!
    handleKeydown(keydown('ArrowUp'))
    expect(timer.currentTime.value).toBe(3030)
  })

  it('ArrowDown subtracts 30 seconds from the active timer', () => {
    const timer = scope.run(() => useTimer(0))!
    handleKeydown(keydown('ArrowDown'))
    expect(timer.currentTime.value).toBe(2970)
  })

  it('ArrowRight/ArrowLeft move the active selection between timers', () => {
    scope.run(() => list.addTimer())
    handleKeydown(keydown('ArrowRight'))
    expect(selection.activeTimerId.value).toBe(1)
    handleKeydown(keydown('ArrowLeft'))
    expect(selection.activeTimerId.value).toBe(0)
  })

  it('Digit1-9 select the timer at that 1-based position', () => {
    scope.run(() => {
      list.addTimer()
      list.addTimer()
    })
    handleKeydown(keydown('Digit3'))
    expect(selection.activeTimerId.value).toBe(2)
    handleKeydown(keydown('Digit1'))
    expect(selection.activeTimerId.value).toBe(0)
  })

  it('a digit key beyond the number of timers is a no-op', () => {
    handleKeydown(keydown('Digit9'))
    expect(selection.activeTimerId.value).toBe(0)
  })

  it('KeyN adds a new timer', () => {
    handleKeydown(keydown('KeyN'))
    expect(list.timers.value).toHaveLength(2)
  })

  it('KeyE starts editing the active timer name', () => {
    const { editingTimerId } = useTimerNameEdit()
    handleKeydown(keydown('KeyE'))
    expect(editingTimerId.value).toBe(0)
  })

  it('KeyE no-ops when there is no active timer', () => {
    scope.run(() => list.removeTimer(0))
    const { editingTimerId } = useTimerNameEdit()
    handleKeydown(keydown('KeyE'))
    expect(editingTimerId.value).toBeNull()
  })

  it('KeyP opens PiP when supported and closed, closes it when open', () => {
    handleKeydown(keydown('KeyP'))
    expect(pipMock.openPiP).toHaveBeenCalled()

    pipMock.isOpen.value = true
    handleKeydown(keydown('KeyP'))
    expect(pipMock.closePiP).toHaveBeenCalled()
  })

  it('KeyP does nothing when PiP is not supported', () => {
    pipMock.isSupported.value = false
    handleKeydown(keydown('KeyP'))
    expect(pipMock.openPiP).not.toHaveBeenCalled()
  })

  it('KeyM toggles the site mute state', () => {
    handleKeydown(keydown('KeyM'))
    expect(soundMock.toggleMute).toHaveBeenCalledTimes(1)
  })

  it('ignores shortcuts when a modifier key is held', () => {
    const timer = scope.run(() => useTimer(0))!
    handleKeydown(keydown('Space', { ctrlKey: true }))
    expect(timer.interval.value).toBeNull()
  })

  it('ignores shortcuts when the event target is a text input', () => {
    const input = document.createElement('input')
    const timer = scope.run(() => useTimer(0))!
    const event = keydown('Space')
    Object.defineProperty(event, 'target', { value: input })
    handleKeydown(event)
    expect(timer.interval.value).toBeNull()
  })

  it('no-ops start/reset/adjust shortcuts when there is no active timer', () => {
    scope.run(() => list.removeTimer(0))
    expect(() => handleKeydown(keydown('Space'))).not.toThrow()
    expect(() => handleKeydown(keydown('KeyR'))).not.toThrow()
    expect(() => handleKeydown(keydown('ArrowUp'))).not.toThrow()
  })
})
