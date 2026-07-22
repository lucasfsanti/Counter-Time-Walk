// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Timer from '../../app/components/Timer.vue'
import { useTimerList, _resetForTesting } from '../../app/composables/useTimerList'
import { useTimerSelection, _resetTimerSelectionForTesting } from '../../app/composables/useTimerSelection'
import { nuxtUiStubs } from '../support/nuxtUiStubs'

describe('Timer.vue', () => {
  let list: ReturnType<typeof useTimerList>
  let selection: ReturnType<typeof useTimerSelection>
  let wrappers: VueWrapper[]

  function mountTimer(timerId: number, props: Record<string, unknown> = {}) {
    const wrapper = mount(Timer, {
      props: { timerId, ...props },
      global: { stubs: nuxtUiStubs },
    })
    wrappers.push(wrapper)
    return wrapper
  }

  beforeEach(() => {
    _resetForTesting()
    _resetTimerSelectionForTesting()
    list = useTimerList()
    selection = useTimerSelection()
    wrappers = []
  })

  afterEach(() => {
    wrappers.forEach(w => w.unmount())
  })

  it('shows its 1-based position in the timers list as a badge', () => {
    list.addTimer()
    const first = mountTimer(0)
    const second = mountTimer(1)
    expect(first.find('.timer-number').text()).toBe('1')
    expect(second.find('.timer-number').text()).toBe('2')
  })

  it('updates its badge after an earlier timer is removed', async () => {
    list.addTimer()
    const second = mountTimer(1)
    expect(second.find('.timer-number').text()).toBe('2')

    list.removeTimer(0)
    await second.vm.$nextTick()
    expect(second.find('.timer-number').text()).toBe('1')
  })

  it('is highlighted as active when it is the selected timer', () => {
    const wrapper = mountTimer(0)
    expect(wrapper.classes()).toContain('timer-card--active')
  })

  it('is not highlighted when another timer is selected', () => {
    list.addTimer()
    selection.setActiveTimer(1)
    const wrapper = mountTimer(0)
    expect(wrapper.classes()).not.toContain('timer-card--active')
  })

  it('shows a visual alarm state once the timer has flagged an active alarm', async () => {
    const wrapper = mountTimer(0)
    expect(wrapper.classes()).not.toContain('timer-card--alarming')

    list.timers.value[0].isAlarming = true
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).toContain('timer-card--alarming')
  })

  it('mouseenter selects this timer as active', async () => {
    list.addTimer()
    selection.setActiveTimer(1)
    const wrapper = mountTimer(0)
    expect(wrapper.classes()).not.toContain('timer-card--active')

    await wrapper.trigger('mouseenter')
    expect(selection.activeTimerId.value).toBe(0)
    expect(wrapper.classes()).toContain('timer-card--active')
  })

  it('clicking start enables the running state and disables the start button', async () => {
    const wrapper = mountTimer(0)
    const startButton = wrapper.find('[aria-label="Start timer"]')
    expect(startButton.attributes('disabled')).toBeUndefined()

    await startButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[aria-label="Start timer"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="Pause timer"]').attributes('disabled')).toBeUndefined()
  })

  it('clicking reset restores the default duration', async () => {
    const wrapper = mountTimer(0)
    expect(wrapper.find('.timer-display').text()).toBe('50:00')

    await wrapper.find('[aria-label="Reset timer"]').trigger('click')
    expect(wrapper.find('.timer-display').text()).toBe('50:00')
  })

  it('clicking delete removes the timer from the list when showDelete is true', async () => {
    // Mounted through a v-for host, like pages/index.vue does, so Vue
    // unmounts the deleted Timer instance as part of the same reactive
    // flush that removes it from the list — matching real usage.
    list.addTimer()
    const host = mount({
      components: { Timer },
      setup: () => ({ timers: list.timers }),
      template: '<Timer v-for="t in timers" :key="t.timerId" :timer-id="t.timerId" />',
    }, { global: { stubs: nuxtUiStubs } })
    wrappers.push(host)

    expect(host.findAll('[aria-label="Delete timer"]')).toHaveLength(2)

    await host.findAll('[aria-label="Delete timer"]')[0].trigger('click')
    expect(list.timers.value).toHaveLength(1)
    expect(list.timers.value[0].timerId).toBe(1)
  })

  it('hides the delete button when showDelete is false', () => {
    const wrapper = mountTimer(0, { showDelete: false })
    expect(wrapper.find('[aria-label="Delete timer"]').exists()).toBe(false)
  })
})
