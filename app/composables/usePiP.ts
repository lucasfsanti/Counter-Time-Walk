import { shallowRef, computed, createApp, ref, onMounted, getCurrentInstance, nextTick, watch } from 'vue'
import PiPView from '../components/PiPView.vue'
import { useTimerList } from './useTimerList'

const pipWindow = shallowRef<Window | null>(null)
const isOpen = computed(() => pipWindow.value !== null)
let stopWatchingTimerCount: (() => void) | null = null
let openedAutomatically = false
let visibilityListenerAttached = false

async function openPiP() {
  const pip = await (window as any).documentPictureInPicture.requestWindow({
    width: 480,
    height: 320,
  }) as Window

  document.querySelectorAll('link[rel="stylesheet"], style').forEach(el =>
    pip.document.head.appendChild(el.cloneNode(true))
  )
  pip.document.documentElement.className = document.documentElement.className

  const div = pip.document.createElement('div')
  pip.document.body.appendChild(div)
  createApp(PiPView).mount(div)

  pipWindow.value = pip

  async function fitToContent() {
    await nextTick()
    if (pip.document.fonts) await pip.document.fonts.ready

    // Measure the rendered content itself, not the plain mount `div` — as an
    // unstyled block element it stretches to the window's current width, so
    // its scrollWidth just echoes that width back instead of the content's
    // natural size.
    const content = pip.document.querySelector('.pip-content') as HTMLElement | null
    if (!content) return

    // resizeTo() sets the OUTER window size, but the content we measured is
    // the INNER viewport size — add back whatever chrome (title bar,
    // borders) the window currently has so the result isn't clipped short.
    const width = Math.ceil(content.scrollWidth + (pip.outerWidth - pip.innerWidth))
    const height = Math.ceil(content.scrollHeight + (pip.outerHeight - pip.innerHeight))
    if (width <= 0 || height <= 0) return

    // resizeTo() on a document-PiP window requires a live user gesture —
    // e.g. a fit triggered by the auto-open-on-hide path has none behind it
    // (it fires from a visibilitychange event, not a click) and Chrome
    // rejects it. That's expected: the window just keeps its current size
    // rather than the call throwing out to an unhandled rejection.
    try {
      pip.resizeTo(width, height)
    } catch {
      // no active user gesture; leave the window at its current size
    }
  }

  const { timers } = useTimerList()
  stopWatchingTimerCount = watch(() => timers.value.length, fitToContent)
  await fitToContent()

  pip.addEventListener('pagehide', () => {
    pipWindow.value = null
    openedAutomatically = false
    stopWatchingTimerCount?.()
    stopWatchingTimerCount = null
  })
}

function closePiP() {
  if (pipWindow.value) {
    pipWindow.value.close()
    pipWindow.value = null
  }
  openedAutomatically = false
  stopWatchingTimerCount?.()
  stopWatchingTimerCount = null
}

// Auto-opens the PiP window when the main window is minimized or backgrounded
// (tab hidden), and auto-closes it again on return — but only if this PiP
// session was the one that opened automatically, so a window the user opened
// by hand isn't yanked away from them when they switch back.
async function handleVisibilityChange() {
  if (!('documentPictureInPicture' in window)) return

  if (document.visibilityState === 'hidden') {
    if (!pipWindow.value) {
      openedAutomatically = true
      await openPiP()
    }
  } else if (document.visibilityState === 'visible') {
    if (pipWindow.value && openedAutomatically) {
      closePiP()
    }
  }
}

function attachVisibilityListener() {
  if (visibilityListenerAttached) return
  visibilityListenerAttached = true
  document.addEventListener('visibilitychange', handleVisibilityChange)
}

export function usePiP() {
  const isSupported = ref(false)

  function setup() {
    isSupported.value = 'documentPictureInPicture' in window
    attachVisibilityListener()
  }

  if (getCurrentInstance()) {
    onMounted(setup)
  } else if (typeof window !== 'undefined') {
    setup()
  }

  return { isOpen, isSupported, openPiP, closePiP }
}

export function _resetPiP() {
  pipWindow.value = null
  openedAutomatically = false
}
