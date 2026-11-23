let ctx: AudioContext | null = null
let master: GainNode | null = null
let currentVolume = 0

type Engine = { ctx: AudioContext; master: GainNode }

function audioEngine(volume: number): Engine | null {
  currentVolume = Math.min(1, Math.max(0, volume))
  if (currentVolume <= 0) return null
  try {
    if (!ctx) {
      const Constructor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Constructor) return null
      ctx = new Constructor()
      master = ctx.createGain()
      master.gain.value = currentVolume * 0.2
      master.connect(ctx.destination)
    }
    if (!master) return null
    master.gain.setTargetAtTime(currentVolume * 0.2, ctx.currentTime, 0.01)
    if (ctx.state === 'suspended') void ctx.resume()
    return { ctx, master }
  } catch {
    return null
  }
}

function tone(
  engine: Engine,
  type: OscillatorType,
  from: number,
  to: number,
  duration: number,
  peak: number,
  delay = 0,
): void {
  const { ctx: audio, master: output } = engine
  const start = audio.currentTime + delay
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(Math.max(20, from), start)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + duration)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(output)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function playUiSound(
  name: 'click' | 'open' | 'close' | 'error' | 'chime',
  volume: number,
): void {
  const engine = audioEngine(volume)
  if (!engine) return
  if (name === 'click') {
    tone(engine, 'square', 880, 820, 0.035, 0.06)
    return
  }
  if (name === 'open') {
    tone(engine, 'sawtooth', 180, 380, 0.11, 0.055)
    return
  }
  if (name === 'close') {
    tone(engine, 'sawtooth', 380, 160, 0.1, 0.045)
    return
  }
  if (name === 'error') {
    tone(engine, 'square', 120, 96, 0.14, 0.07)
    return
  }
  tone(engine, 'sine', 220, 220, 0.7, 0.06)
  tone(engine, 'sine', 330, 330, 0.7, 0.045, 0.04)
  tone(engine, 'sine', 440, 440, 0.55, 0.03, 0.09)
}
