// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

class FakeParam {
  setValueAtTime = vi.fn()
  linearRampToValueAtTime = vi.fn()
}

class FakeOscillator {
  type = ''
  frequency = new FakeParam()
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class FakeGainNode {
  gain = new FakeParam()
  connect = vi.fn()
}

let instances: FakeAudioContext[]

class FakeAudioContext {
  currentTime = 0
  state = 'running'
  destination = {}
  resume = vi.fn()
  createOscillator = vi.fn(() => new FakeOscillator())
  createGain = vi.fn(() => new FakeGainNode())
  constructor() {
    instances.push(this)
  }
}

describe('useSound', () => {
  beforeEach(() => {
    localStorage.clear()
    instances = []
    ;(window as any).AudioContext = FakeAudioContext
  })

  afterEach(() => {
    delete (window as any).AudioContext
  })

  it('is unmuted by default', async () => {
    vi.resetModules()
    const { useSound } = await import('../../app/composables/useSound')
    expect(useSound().isMuted.value).toBe(false)
  })

  it('reads a persisted mute preference on load', async () => {
    localStorage.setItem('time-walk-muted', 'true')
    vi.resetModules()
    const { useSound } = await import('../../app/composables/useSound')
    expect(useSound().isMuted.value).toBe(true)
  })

  it('toggleMute flips and persists the muted state', async () => {
    vi.resetModules()
    const { useSound } = await import('../../app/composables/useSound')
    const sound = useSound()

    sound.toggleMute()
    expect(sound.isMuted.value).toBe(true)
    expect(localStorage.getItem('time-walk-muted')).toBe('true')

    sound.toggleMute()
    expect(sound.isMuted.value).toBe(false)
    expect(localStorage.getItem('time-walk-muted')).toBe('false')
  })

  it('playAlarm beeps three times through the Web Audio API when unmuted', async () => {
    vi.resetModules()
    const { useSound } = await import('../../app/composables/useSound')
    useSound().playAlarm()

    expect(instances).toHaveLength(1)
    expect(instances[0].createOscillator).toHaveBeenCalledTimes(3)
    expect(instances[0].createGain).toHaveBeenCalledTimes(3)
  })

  it('playAlarm does nothing when muted', async () => {
    vi.resetModules()
    const { useSound } = await import('../../app/composables/useSound')
    const sound = useSound()
    sound.toggleMute()
    sound.playAlarm()

    expect(instances).toHaveLength(0)
  })

  it('playAlarm is a no-op when the Web Audio API is unsupported', async () => {
    delete (window as any).AudioContext
    vi.resetModules()
    const { useSound } = await import('../../app/composables/useSound')
    expect(() => useSound().playAlarm()).not.toThrow()
    expect(instances).toHaveLength(0)
  })
})
