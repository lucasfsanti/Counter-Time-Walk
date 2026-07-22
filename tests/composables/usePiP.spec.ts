// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope } from 'vue'

vi.mock('../../app/components/PiPView.vue', () => ({ default: {} }))

import { usePiP, _resetPiP } from '../../app/composables/usePiP'

function makeMockPipWindow() {
  const documentElement = { className: '' }
  const head = { appendChild: vi.fn() }
  const createdDiv = {}
  const body = { appendChild: vi.fn() }
  return {
    document: {
      head,
      body,
      documentElement,
      createElement: vi.fn(() => createdDiv),
    },
    addEventListener: vi.fn(),
    close: vi.fn(),
    _head: head,
    _body: body,
    _documentElement: documentElement,
  }
}

describe('usePiP', () => {
  let scope: ReturnType<typeof effectScope>
  let pip: ReturnType<typeof usePiP>
  let mockPipWindow: ReturnType<typeof makeMockPipWindow>

  beforeEach(() => {
    _resetPiP()
    mockPipWindow = makeMockPipWindow()

    Object.defineProperty(window, 'documentPictureInPicture', {
      value: { requestWindow: vi.fn().mockResolvedValue(mockPipWindow) },
      writable: true,
      configurable: true,
    })

    vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as any)

    scope = effectScope()
    scope.run(() => {
      pip = usePiP()
    })
  })

  afterEach(() => {
    scope.stop()
    vi.restoreAllMocks()
  })

  it('isOpen is false initially', () => {
    expect(pip.isOpen.value).toBe(false)
  })

  it('isSupported is true when documentPictureInPicture exists on window', () => {
    expect(pip.isSupported).toBe(true)
  })

  it('openPiP calls requestWindow with width 480 and height 320', async () => {
    await pip.openPiP()
    expect((window as any).documentPictureInPicture.requestWindow).toHaveBeenCalledWith({
      width: 480,
      height: 320,
    })
  })

  it('openPiP sets isOpen to true', async () => {
    await pip.openPiP()
    expect(pip.isOpen.value).toBe(true)
  })

  it('openPiP copies dark mode class from main document to pip document', async () => {
    document.documentElement.className = 'dark'
    await pip.openPiP()
    expect(mockPipWindow._documentElement.className).toBe('dark')
    document.documentElement.className = ''
  })

  it('openPiP registers a pagehide listener on the pip window', async () => {
    await pip.openPiP()
    expect(mockPipWindow.addEventListener).toHaveBeenCalledWith('pagehide', expect.any(Function))
  })

  it('pagehide event sets isOpen back to false', async () => {
    await pip.openPiP()
    const [, handler] = mockPipWindow.addEventListener.mock.calls.find(
      ([event]) => event === 'pagehide'
    )!
    handler()
    expect(pip.isOpen.value).toBe(false)
  })

  it('closePiP calls close() on the pip window and sets isOpen to false', async () => {
    await pip.openPiP()
    pip.closePiP()
    expect(mockPipWindow.close).toHaveBeenCalled()
    expect(pip.isOpen.value).toBe(false)
  })

  it('closePiP is a no-op when no pip window is open', () => {
    expect(() => pip.closePiP()).not.toThrow()
    expect(pip.isOpen.value).toBe(false)
  })
})
