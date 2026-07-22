import { shallowRef, computed, createApp, ref, onMounted, getCurrentInstance, nextTick, watch } from 'vue'
import PiPView from '../components/PiPView.vue'
import { useTimerList } from './useTimerList'

const pipWindow = shallowRef<Window | null>(null)
const isOpen = computed(() => pipWindow.value !== null)
let stopWatchingTimerCount: (() => void) | null = null

export function usePiP() {
  const isSupported = ref(false)
  if (getCurrentInstance()) {
    onMounted(() => { isSupported.value = 'documentPictureInPicture' in window })
  } else if (typeof window !== 'undefined') {
    isSupported.value = 'documentPictureInPicture' in window
  }

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
      const width = Math.ceil(div.scrollWidth)
      const height = Math.ceil(div.scrollHeight)
      if (width > 0 && height > 0) pip.resizeTo(width, height)
    }

    const { timers } = useTimerList()
    stopWatchingTimerCount = watch(() => timers.value.length, fitToContent)
    await fitToContent()

    pip.addEventListener('pagehide', () => {
      pipWindow.value = null
      stopWatchingTimerCount?.()
      stopWatchingTimerCount = null
    })
  }

  function closePiP() {
    if (pipWindow.value) {
      pipWindow.value.close()
      pipWindow.value = null
    }
    stopWatchingTimerCount?.()
    stopWatchingTimerCount = null
  }

  return { isOpen, isSupported, openPiP, closePiP }
}

export function _resetPiP() {
  pipWindow.value = null
}
