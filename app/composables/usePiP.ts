import { shallowRef, computed, createApp, ref, onMounted, getCurrentInstance, watch } from 'vue'
import PiPView from '../components/PiPView.vue'
import { useTimerList } from './useTimerList'

const pipWindow = shallowRef<Window | null>(null)
const isOpen = computed(() => pipWindow.value !== null)
let stopWatchingTimerCount: (() => void) | null = null
let openedAutomatically = false
let visibilityListenerAttached = false

function pipWindowSize(timerCount: number) {
  return {
    width: Math.round(screen.width * 0.30 * timerCount),
    height: Math.round(screen.height / 3),
  }
}

async function openPiP() {
  const { timers } = useTimerList()
  const { width, height } = pipWindowSize(timers.value.length)

  const pip = await (window as any).documentPictureInPicture.requestWindow({
    width,
    height,
  }) as Window

  document.querySelectorAll('link[rel="stylesheet"], style').forEach(el =>
    pip.document.head.appendChild(el.cloneNode(true))
  )
  pip.document.documentElement.className = document.documentElement.className

  const div = pip.document.createElement('div')
  pip.document.body.appendChild(div)
  createApp(PiPView).mount(div)

  pipWindow.value = pip

  // resizeTo() on a document-PiP window requires a live user gesture.
  // This call is within the click handler so it succeeds for manual opens;
  // the auto-open path (visibilitychange) has no gesture so it falls back
  // to the requestWindow dimensions passed above.
  try {
    const { width: w, height: h } = pipWindowSize(timers.value.length)
    pip.resizeTo(w, h)
  } catch {
    // no active user gesture; window keeps the requestWindow size
  }

  stopWatchingTimerCount = watch(() => timers.value.length, (count) => {
    const { width: w, height: h } = pipWindowSize(count)
    try {
      pip.resizeTo(w, h)
    } catch {
      // no active user gesture
    }
  })

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
