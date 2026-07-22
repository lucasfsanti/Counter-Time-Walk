import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTimerList, _resetForTesting } from '../../app/composables/useTimerList'
import { colorPalettes } from '../../app/utils/colorPalettes.js'

const DEFAULT_DURATION = 3000

describe('useTimerList', () => {
  let list: ReturnType<typeof useTimerList>

  beforeEach(() => {
    _resetForTesting()
    list = useTimerList()
  })

  it('starts with one timer at id 0 using the first palette', () => {
    expect(list.timers.value).toHaveLength(1)
    expect(list.timers.value[0].timerId).toBe(0)
    expect(list.timers.value[0].palette).toEqual(colorPalettes[0])
    expect(list.timers.value[0].currentTime).toBe(DEFAULT_DURATION)
    expect(list.timers.value[0].interval).toBeNull()
  })

  it('addTimer appends a new entry with an incrementing timerId and default runtime state', () => {
    list.addTimer()
    expect(list.timers.value).toHaveLength(2)
    expect(list.timers.value[1].timerId).toBe(1)
    expect(list.timers.value[1].palette).toEqual(colorPalettes[1])
    expect(list.timers.value[1].currentTime).toBe(DEFAULT_DURATION)
    expect(list.timers.value[1].interval).toBeNull()
  })

  it('addTimer cycles palette back to index 0 after 6 entries', () => {
    for (let i = 0; i < 6; i++) list.addTimer()
    expect(list.timers.value[6].palette).toEqual(colorPalettes[0])
  })

  it('removeTimer splices the entry with the matching timerId', () => {
    list.addTimer()
    list.addTimer()
    list.removeTimer(1)
    expect(list.timers.value).toHaveLength(2)
    expect(list.timers.value.find(t => t.timerId === 1)).toBeUndefined()
  })

  it('removeTimer no-ops when timerId does not exist', () => {
    list.removeTimer(999)
    expect(list.timers.value).toHaveLength(1)
  })

  it('multiple calls to useTimerList() return the same singleton', () => {
    const a = useTimerList()
    const b = useTimerList()
    a.addTimer()
    expect(b.timers.value).toHaveLength(2)
  })

  describe('getDisplayNumber', () => {
    function expectSequentialNumbering() {
      // `timers` is rendered by a plain v-for with no reordering, so array
      // position 0 is always the leftmost card, position 1 the next, etc.
      // The badge number must track that position, not the timerId.
      list.timers.value.forEach((timer, index) => {
        expect(list.getDisplayNumber(timer.timerId)).toBe(index + 1)
      })
    }

    it('numbers the sole initial timer as 1', () => {
      expectSequentialNumbering()
    })

    it('numbers timers 1..N in array order after several adds', () => {
      list.addTimer()
      list.addTimer()
      list.addTimer()
      expectSequentialNumbering()
    })

    it('renumbers the remaining timers after removing the first one', () => {
      list.addTimer()
      list.addTimer()
      list.removeTimer(0)
      expectSequentialNumbering()
      expect(list.getDisplayNumber(1)).toBe(1)
      expect(list.getDisplayNumber(2)).toBe(2)
    })

    it('renumbers the remaining timers after removing a middle one', () => {
      list.addTimer()
      list.addTimer()
      list.addTimer()
      list.removeTimer(2)
      expectSequentialNumbering()
      expect(list.getDisplayNumber(0)).toBe(1)
      expect(list.getDisplayNumber(1)).toBe(2)
      expect(list.getDisplayNumber(3)).toBe(3)
    })

    it('keeps sequential numbering through a mix of adds and removes with non-contiguous timerIds', () => {
      list.addTimer() // id 1
      list.addTimer() // id 2
      list.removeTimer(0)
      list.addTimer() // id 3
      list.removeTimer(2)
      expectSequentialNumbering()
    })

    it('returns 0 for a timerId that is not in the list', () => {
      expect(list.getDisplayNumber(999)).toBe(0)
    })
  })

  it('removeTimer clears the interval before splicing a running timer', () => {
    vi.useFakeTimers()
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

    // Simulate a running timer by assigning a non-null interval handle
    list.timers.value[0].interval = setInterval(() => {}, 1000)
    const handle = list.timers.value[0].interval

    list.removeTimer(0)

    expect(list.timers.value).toHaveLength(0)
    expect(clearIntervalSpy).toHaveBeenCalledWith(handle)

    clearIntervalSpy.mockRestore()
    vi.useRealTimers()
  })
})
