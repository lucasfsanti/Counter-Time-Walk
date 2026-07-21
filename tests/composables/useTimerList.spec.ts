import { describe, it, expect, beforeEach } from 'vitest'
import { useTimerList } from '../../app/composables/useTimerList'
import { colorPalettes } from '../../app/utils/colorPalettes.js'

describe('useTimerList', () => {
  let list: ReturnType<typeof useTimerList>

  beforeEach(() => {
    list = useTimerList()
  })

  it('starts with one timer at id 0 using the first palette', () => {
    expect(list.timers.value).toHaveLength(1)
    expect(list.timers.value[0].timerId).toBe(0)
    expect(list.timers.value[0].palette).toEqual(colorPalettes[0])
  })

  it('addTimer appends a new entry with an incrementing timerId', () => {
    list.addTimer()
    expect(list.timers.value).toHaveLength(2)
    expect(list.timers.value[1].timerId).toBe(1)
    expect(list.timers.value[1].palette).toEqual(colorPalettes[1])
  })

  it('addTimer cycles palette back to index 0 after 6 entries', () => {
    for (let i = 0; i < 6; i++) list.addTimer()
    // 7 timers total (ids 0–6); timerId 6 → getColorPalette(6) → 6 % 6 = 0
    expect(list.timers.value[6].palette).toEqual(colorPalettes[0])
  })

  it('removeTimer splices the entry with the matching timerId', () => {
    list.addTimer() // timerId 1
    list.addTimer() // timerId 2
    list.removeTimer(1)
    expect(list.timers.value).toHaveLength(2)
    expect(list.timers.value.find(t => t.timerId === 1)).toBeUndefined()
  })

  it('removeTimer no-ops when timerId does not exist', () => {
    list.removeTimer(999)
    expect(list.timers.value).toHaveLength(1)
  })
})
