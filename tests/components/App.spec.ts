// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

// app.vue's template references isSupported/isOpen unwrapped (auto-unref),
// so the mock must hand back real Vue refs — plain { value } objects don't
// satisfy Vue's isRef() check and would always unwrap truthy.
vi.mock('../../app/composables/usePiP', async () => {
  const { ref } = await import('vue')
  const isSupported = ref(true)
  const isOpen = ref(false)
  const openPiP = vi.fn(async () => { isOpen.value = true })
  const closePiP = vi.fn(() => { isOpen.value = false })
  return { usePiP: () => ({ isSupported, isOpen, openPiP, closePiP }) }
})

const shortcutsMock = vi.hoisted(() => ({
  useKeyboardShortcuts: vi.fn(() => ({ handleKeydown: vi.fn() })),
}))

vi.mock('../../app/composables/useKeyboardShortcuts', () => shortcutsMock)

import App from '../../app/app.vue'
import { usePiP } from '../../app/composables/usePiP'
import { useSound, _resetSoundForTesting } from '../../app/composables/useSound'
import { useTimerList, _resetForTesting } from '../../app/composables/useTimerList'
import { nuxtUiStubs } from '../support/nuxtUiStubs'

describe('app.vue', () => {
  let wrapper: VueWrapper
  let list: ReturnType<typeof useTimerList>
  let pip: ReturnType<typeof usePiP>
  let sound: ReturnType<typeof useSound>

  beforeEach(() => {
    _resetForTesting()
    _resetSoundForTesting()
    shortcutsMock.useKeyboardShortcuts.mockClear()

    pip = usePiP()
    pip.isSupported.value = true
    pip.isOpen.value = false
    vi.mocked(pip.openPiP).mockClear()
    vi.mocked(pip.closePiP).mockClear()

    sound = useSound()
    list = useTimerList()
    wrapper = mount(App, { global: { stubs: nuxtUiStubs } })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('mounts the global keyboard shortcut listener', () => {
    expect(shortcutsMock.useKeyboardShortcuts).toHaveBeenCalledTimes(1)
  })

  it('has a header button to add a timer', async () => {
    expect(list.timers.value).toHaveLength(1)
    await wrapper.find('button[icon="ic:round-add"]').trigger('click')
    expect(list.timers.value).toHaveLength(2)
  })

  it('has a keyboard-shortcuts button that opens a modal documenting every binding', () => {
    expect(wrapper.find('[aria-label="Atalhos de teclado"]').exists()).toBe(true)

    const modalBody = wrapper.find('[data-testid="modal-body"]')
    expect(modalBody.text()).toContain('espaço')
    expect(modalBody.text()).toContain('iniciar/pausar timer selecionado')
    expect(modalBody.text()).toContain('reiniciar timer selecionado')
    expect(modalBody.text()).toContain('+30s / -30s no timer selecionado')
    expect(modalBody.text()).toContain('selecionar timer anterior/próximo')
    expect(modalBody.text()).toContain('selecionar o timer com esse número')
    expect(modalBody.text()).toContain('adicionar timer')
    expect(modalBody.text()).toContain('abrir/fechar picture-in-picture')
    expect(modalBody.text()).toContain('mutar/ativar sons')
  })

  it('disables the PiP button when the browser does not support it', async () => {
    pip.isSupported.value = false
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button[icon="ic:round-picture-in-picture-alt"]').attributes('disabled')).toBeDefined()
  })

  it('clicking the PiP button opens/closes picture-in-picture', async () => {
    const pipButton = wrapper.find('button[icon="ic:round-picture-in-picture-alt"]')
    await pipButton.trigger('click')
    expect(pip.openPiP).toHaveBeenCalled()

    pip.isOpen.value = true
    await pipButton.trigger('click')
    expect(pip.closePiP).toHaveBeenCalled()
  })

  it('has a header button that mutes/unmutes site sounds and swaps its icon', async () => {
    expect(sound.isMuted.value).toBe(false)
    expect(wrapper.find('button[icon="ic:round-volume-up"]').exists()).toBe(true)

    await wrapper.find('[aria-label="Mutar sons"]').trigger('click')
    expect(sound.isMuted.value).toBe(true)

    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[icon="ic:round-volume-off"]').exists()).toBe(true)

    await wrapper.find('[aria-label="Ativar sons"]').trigger('click')
    expect(sound.isMuted.value).toBe(false)
  })
})
