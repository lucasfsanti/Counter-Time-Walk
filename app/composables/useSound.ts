import { ref } from 'vue'

const STORAGE_KEY = 'time-walk-muted'

function readStoredMute() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

const isMuted = ref(readStoredMute())

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null
  if (!audioContext) audioContext = new window.AudioContext()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

export function useSound() {
  function toggleMute() {
    isMuted.value = !isMuted.value
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(isMuted.value))
    }
  }

  function playAlarm() {
    if (isMuted.value) return
    const ctx = getAudioContext()
    if (!ctx) return

    const beepCount = 3
    const beepDuration = 0.15
    const gap = 0.15

    for (let i = 0; i < beepCount; i++) {
      const startTime = ctx.currentTime + i * (beepDuration + gap)
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + beepDuration)
    }
  }

  return { isMuted, toggleMute, playAlarm }
}

export function _resetSoundForTesting() {
  isMuted.value = false
  audioContext = null
  if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
}
