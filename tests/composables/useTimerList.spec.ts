import { describe, it, expect, beforeEach } from 'vitest'
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
})
