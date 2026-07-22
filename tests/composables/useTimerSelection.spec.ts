import { describe, it, expect, beforeEach } from 'vitest'
import { effectScope } from 'vue'
import { useTimerSelection, _resetTimerSelectionForTesting } from '../../app/composables/useTimerSelection'
import { useTimerList, _resetForTesting } from '../../app/composables/useTimerList'

describe('useTimerSelection', () => {
  let scope: ReturnType<typeof effectScope>
  let selection: ReturnType<typeof useTimerSelection>
  let list: ReturnType<typeof useTimerList>

  beforeEach(() => {
    _resetForTesting()
    _resetTimerSelectionForTesting()
    scope = effectScope()
    scope.run(() => {
      list = useTimerList()
      selection = useTimerSelection()
    })
  })

  it('defaults to the first timer when nothing is selected yet', () => {
    expect(selection.activeTimerId.value).toBe(0)
  })

  it('setActiveTimer selects the given timer', () => {
    scope.run(() => list.addTimer())
    selection.setActiveTimer(1)
    expect(selection.activeTimerId.value).toBe(1)
  })

  it('selectNext cycles forward through timers and wraps around', () => {
    scope.run(() => {
      list.addTimer()
      list.addTimer()
    })
    expect(selection.activeTimerId.value).toBe(0)
    selection.selectNext()
    expect(selection.activeTimerId.value).toBe(1)
    selection.selectNext()
    expect(selection.activeTimerId.value).toBe(2)
    selection.selectNext()
    expect(selection.activeTimerId.value).toBe(0)
  })

  it('selectPrevious cycles backward through timers and wraps around', () => {
    scope.run(() => {
      list.addTimer()
      list.addTimer()
    })
    selection.selectPrevious()
    expect(selection.activeTimerId.value).toBe(2)
    selection.selectPrevious()
    expect(selection.activeTimerId.value).toBe(1)
  })

  it('re-selects the first remaining timer when the active one is removed', () => {
    scope.run(() => list.addTimer())
    selection.setActiveTimer(1)
    scope.run(() => list.removeTimer(1))
    expect(selection.activeTimerId.value).toBe(0)
  })

  it('activeTimerId is null when there are no timers', () => {
    scope.run(() => list.removeTimer(0))
    expect(selection.activeTimerId.value).toBeNull()
  })

  it('selectNext/selectPrevious no-op when there are no timers', () => {
    scope.run(() => list.removeTimer(0))
    selection.selectNext()
    expect(selection.activeTimerId.value).toBeNull()
    selection.selectPrevious()
    expect(selection.activeTimerId.value).toBeNull()
  })

  it('multiple calls to useTimerSelection() share the same active timer state', () => {
    const other = useTimerSelection()
    selection.setActiveTimer(0)
    expect(other.activeTimerId.value).toBe(0)
  })
})
