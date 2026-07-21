import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope } from 'vue'
import { useTimer } from '../../app/composables/useTimer'

describe('useTimer', () => {
  let scope: ReturnType<typeof effectScope>
  let timer: ReturnType<typeof useTimer>

  beforeEach(() => {
    vi.useFakeTimers()
    scope = effectScope()
    scope.run(() => {
      timer = useTimer()
    })
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  it('initialises at 50 minutes (3000 seconds)', () => {
    expect(timer.currentTime.value).toBe(3000)
    expect(timer.minutes.value).toBe('50')
    expect(timer.seconds.value).toBe('00')
  })

  it('startTimer sets interval and decrements currentTime each second', () => {
    timer.startTimer()
    expect(timer.interval.value).not.toBeNull()
    vi.advanceTimersByTime(3000)
    expect(timer.currentTime.value).toBe(2997)
  })

  it('startTimer is idempotent — a second call does not double-decrement', () => {
    timer.startTimer()
    timer.startTimer()
    vi.advanceTimersByTime(3000)
    expect(timer.currentTime.value).toBe(2997)
  })

  it('stopTimer clears interval and halts countdown', () => {
    timer.startTimer()
    vi.advanceTimersByTime(2000)
    timer.stopTimer()
    expect(timer.interval.value).toBeNull()
    vi.advanceTimersByTime(5000)
    expect(timer.currentTime.value).toBe(2998)
  })

  it('resetTimer restores currentTime to 3000 while keeping timer running', () => {
    timer.startTimer()
    vi.advanceTimersByTime(10000)
    expect(timer.currentTime.value).toBe(2990)
    timer.resetTimer()
    expect(timer.currentTime.value).toBe(3000)
    expect(timer.interval.value).not.toBeNull()
    vi.advanceTimersByTime(5000)
    expect(timer.currentTime.value).toBe(2995)
  })

  it('auto-stops and sets interval to null when currentTime reaches 0', () => {
    timer.startTimer()
    vi.advanceTimersByTime(3000 * 1000)
    expect(timer.currentTime.value).toBe(0)
    expect(timer.interval.value).toBeNull()
  })

  it('minutes and seconds are correctly zero-padded strings', () => {
    timer.currentTime.value = 65  // 1 min 5 sec
    expect(timer.minutes.value).toBe('01')
    expect(timer.seconds.value).toBe('05')
  })

  it('adding time to currentTime updates minutes and seconds', () => {
    timer.currentTime.value += 30
    expect(timer.currentTime.value).toBe(3030)
    expect(timer.minutes.value).toBe('50')
    expect(timer.seconds.value).toBe('30')
  })

  it('subtracting time from currentTime updates minutes and seconds', () => {
    timer.currentTime.value -= 60
    expect(timer.currentTime.value).toBe(2940)
    expect(timer.minutes.value).toBe('49')
    expect(timer.seconds.value).toBe('00')
  })
})
