import { shallowRef, computed, createApp, ref, onMounted, getCurrentInstance } from 'vue'
import PiPView from '../components/PiPView.vue'

const pipWindow = shallowRef<Window | null>(null)
const isOpen = computed(() => pipWindow.value !== null)

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
    pip.addEventListener('pagehide', () => {
      pipWindow.value = null
    })
  }

  function closePiP() {
    if (pipWindow.value) {
      pipWindow.value.close()
      pipWindow.value = null
    }
  }

  return { isOpen, isSupported, openPiP, closePiP }
}

export function _resetPiP() {
  pipWindow.value = null
}
