// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'

// Patch createApp so mount() silently no-ops when the target element is a plain
// object mock (e.g. in usePiP tests where pip.document.createElement returns {}).
// This lets tests assert on composable state without needing a real pip DOM tree.
vi.mock('vue', async (importOriginal) => {
  const original = await importOriginal<typeof import('vue')>()
  return {
    ...original,
    createApp: (...args: ConstructorParameters<never>) => {
      const app = (original.createApp as (...a: unknown[]) => unknown)(...args) as {
        mount: (el: unknown) => unknown
        [key: string]: unknown
      }
      const originalMount = app.mount.bind(app)
      app.mount = (el: unknown) => {
        if (el && typeof el === 'object' && typeof (el as Record<string, unknown>).insertBefore === 'function') {
          return originalMount(el)
        }
        return {}
      }
      return app
    },
  }
})

vi.mock('../../app/components/PiPView.vue', () => ({ default: {} }))

import { usePiP, _resetPiP } from '../../app/composables/usePiP'
import { useTimerList, _resetForTesting as _resetTimerList } from '../../app/composables/useTimerList'

function makeMockPipWindow() {
  const documentElement = { className: '' }
  const head = { appendChild: vi.fn() }
  const createdDiv = { scrollWidth: 600, scrollHeight: 400 }
  const body = { appendChild: vi.fn() }
  const mock: any = {
    document: {
      head,
      body,
      documentElement,
      createElement: vi.fn(() => createdDiv),
      querySelector: vi.fn(() => createdDiv),
      fonts: { ready: Promise.resolve() },
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    close: vi.fn(),
    // No window chrome in these mocks, so outer/inner dimensions match —
    // resizeTo() should be called with exactly the measured content size.
    outerWidth: 0,
    outerHeight: 0,
    innerWidth: 0,
    innerHeight: 0,
    _head: head,
    _body: body,
    _documentElement: documentElement,
    _createdDiv: createdDiv,
  }
  mock.resizeTo = vi.fn((width: number, height: number) => {
    mock.outerWidth = width
    mock.innerWidth = width
    mock.outerHeight = height
    mock.innerHeight = height
  })
  return mock
}

function setVisibility(state: 'hidden' | 'visible') {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('usePiP', () => {
  let scope: ReturnType<typeof effectScope>
  let pip: ReturnType<typeof usePiP>
  let mockPipWindow: ReturnType<typeof makeMockPipWindow>

  beforeEach(() => {
    _resetPiP()
    _resetTimerList()
    mockPipWindow = makeMockPipWindow()

    Object.defineProperty(window, 'documentPictureInPicture', {
      value: { requestWindow: vi.fn().mockResolvedValue(mockPipWindow) },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })

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
    expect(pip.isSupported.value).toBe(true)
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

  it('openPiP resizes the pip window to fit the rendered content', async () => {
    await pip.openPiP()
    expect(mockPipWindow.resizeTo).toHaveBeenCalledWith(600, 400)
  })

  it('adding a timer while pip is open re-fits the window to the new content size', async () => {
    await pip.openPiP()
    mockPipWindow.resizeTo.mockClear()
    mockPipWindow._createdDiv.scrollWidth = 900
    mockPipWindow._createdDiv.scrollHeight = 420

    useTimerList().addTimer()

    await vi.waitFor(() => expect(mockPipWindow.resizeTo).toHaveBeenCalledWith(900, 420))
  })

  it('removing a timer while pip is open re-fits the window to the smaller content size', async () => {
    useTimerList().addTimer()
    await pip.openPiP()
    mockPipWindow.resizeTo.mockClear()
    mockPipWindow._createdDiv.scrollWidth = 300
    mockPipWindow._createdDiv.scrollHeight = 380

    useTimerList().removeTimer(0)

    await vi.waitFor(() => expect(mockPipWindow.resizeTo).toHaveBeenCalledWith(300, 380))
  })

  it('closePiP stops re-fitting the window when the timer count later changes', async () => {
    await pip.openPiP()
    pip.closePiP()
    mockPipWindow.resizeTo.mockClear()

    useTimerList().addTimer()
    await nextTick()

    expect(mockPipWindow.resizeTo).not.toHaveBeenCalled()
  })

  it('pagehide stops re-fitting the window when the timer count later changes', async () => {
    await pip.openPiP()
    const [, handler] = mockPipWindow.addEventListener.mock.calls.find(
      ([event]) => event === 'pagehide'
    )!
    handler()
    mockPipWindow.resizeTo.mockClear()

    useTimerList().addTimer()
    await nextTick()

    expect(mockPipWindow.resizeTo).not.toHaveBeenCalled()
  })

  it('opens PiP automatically when the document becomes hidden', async () => {
    setVisibility('hidden')
    await vi.waitFor(() => expect(pip.isOpen.value).toBe(true))
    expect((window as any).documentPictureInPicture.requestWindow).toHaveBeenCalled()
  })

  it('does not open a second PiP window when one is already open and the document becomes hidden', async () => {
    await pip.openPiP()
    ;(window as any).documentPictureInPicture.requestWindow.mockClear()

    setVisibility('hidden')
    await nextTick()

    expect((window as any).documentPictureInPicture.requestWindow).not.toHaveBeenCalled()
  })

  it('does not auto-open PiP when the document becomes hidden and the browser does not support it', async () => {
    delete (window as any).documentPictureInPicture

    setVisibility('hidden')
    await nextTick()

    expect(pip.isOpen.value).toBe(false)
  })

  it('closes an automatically-opened PiP window when the document becomes visible again', async () => {
    setVisibility('hidden')
    await vi.waitFor(() => expect(pip.isOpen.value).toBe(true))

    setVisibility('visible')

    expect(mockPipWindow.close).toHaveBeenCalled()
    expect(pip.isOpen.value).toBe(false)
  })

  it('leaves a manually-opened PiP window open when the document becomes visible', async () => {
    await pip.openPiP()

    setVisibility('visible')

    expect(mockPipWindow.close).not.toHaveBeenCalled()
    expect(pip.isOpen.value).toBe(true)
  })
})
