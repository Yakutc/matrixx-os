export type FmPresetId = 'night' | 'chase' | 'signal'

export interface FmPreset {
  id: FmPresetId
  title: string
  subtitle: string
  bpm: number
  chords: number[][]
  arp: number[]
  bass: number[]
}

export const PRESETS: Record<FmPresetId, FmPreset> = {
  night: {
    id: 'night',
    title: 'Night Drive',
    subtitle: 'NOCTURNE / A MINOR',
    bpm: 92,
    chords: [
      [57, 60, 64],
      [53, 57, 60],
      [48, 52, 55],
      [55, 59, 62],
    ],
    arp: [0, 1, 2, 1],
    bass: [0, 3, 6, 10, 14],
  },
  chase: {
    id: 'chase',
    title: 'Chase',
    subtitle: 'SECTOR 4 / D MINOR',
    bpm: 112,
    chords: [
      [50, 53, 57],
      [46, 50, 53],
      [53, 57, 60],
      [48, 52, 55],
    ],
    arp: [0, 2, 1, 2],
    bass: [0, 2, 4, 6, 8, 10, 12, 14],
  },
  signal: {
    id: 'signal',
    title: 'Signal',
    subtitle: '47.2 HZ / E MINOR',
    bpm: 78,
    chords: [
      [52, 55, 59, 62],
      [48, 52, 55, 59],
      [55, 59, 62, 66],
      [50, 54, 57, 60],
    ],
    arp: [0, 3, 1, 2],
    bass: [0, 6, 8, 14],
  },
}

function frequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12)
}

export class FmEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private delay: DelayNode | null = null
  private delayWet: GainNode | null = null
  private noise: AudioBuffer | null = null
  private sources = new Set<AudioScheduledSourceNode>()
  private timer: number | null = null
  private playing = false
  private step = 0
  private nextTime = 0
  private bpm = PRESETS.night.bpm
  private preset: FmPresetId = 'night'
  private volume = 0.6

  get isPlaying(): boolean {
    return this.playing
  }

  get analyserNode(): AnalyserNode | null {
    return this.analyser
  }

  get currentPreset(): FmPreset {
    return PRESETS[this.preset]
  }

  setPreset(preset: FmPresetId): void {
    this.preset = preset
    this.bpm = PRESETS[preset].bpm
    if (this.ctx && this.playing) {
      this.step = 0
      this.nextTime = this.ctx.currentTime + 0.05
    }
  }

  setBpm(bpm: number): void {
    this.bpm = Math.min(120, Math.max(70, Math.round(bpm)))
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume * 0.28, this.ctx.currentTime, 0.03)
    }
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    try {
      const Constructor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Constructor) return null
      const ctx = new Constructor()
      const master = ctx.createGain()
      master.gain.value = this.volume * 0.28
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -20
      compressor.knee.value = 18
      compressor.ratio.value = 4
      compressor.attack.value = 0.005
      compressor.release.value = 0.2
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      master.connect(compressor)
      compressor.connect(analyser)
      analyser.connect(ctx.destination)
      const delay = ctx.createDelay(1)
      delay.delayTime.value = 0.32
      const feedback = ctx.createGain()
      feedback.gain.value = 0.26
      const wet = ctx.createGain()
      wet.gain.value = 0.22
      delay.connect(feedback)
      feedback.connect(delay)
      delay.connect(wet)
      wet.connect(master)
      this.ctx = ctx
      this.master = master
      this.analyser = analyser
      this.delay = delay
      this.delayWet = wet
      const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let index = 0; index < data.length; index += 1) {
        data[index] = Math.random() * 2 - 1
      }
      this.noise = noise
      return ctx
    } catch {
      return null
    }
  }

  private track(source: AudioScheduledSourceNode): void {
    this.sources.add(source)
    source.onended = () => this.sources.delete(source)
  }

  private tone(
    type: OscillatorType,
    note: number,
    start: number,
    duration: number,
    peak: number,
    options: { filter?: number; detune?: number; send?: boolean } = {},
  ): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = frequency(note)
    if (options.detune) osc.detune.value = options.detune
    const attack = options.filter ? 0.06 : 0.006
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    let tail: AudioNode = gain
    if (options.filter) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = options.filter
      gain.connect(filter)
      tail = filter
    }
    tail.connect(master)
    if (options.send && this.delayWet && this.delay) {
      const send = ctx.createGain()
      send.gain.value = 0.35
      gain.connect(send)
      send.connect(this.delay)
    }
    osc.connect(gain)
    osc.start(start)
    osc.stop(start + duration + 0.08)
    this.track(osc)
  }

  private pad(notes: number[], start: number, duration: number): void {
    notes.forEach((note) => {
      this.tone('sawtooth', note, start, duration, 0.018, {
        filter: 760,
        detune: -6,
      })
      this.tone('sawtooth', note, start, duration, 0.014, {
        filter: 900,
        detune: 7,
      })
    })
  }

  private noiseHit(
    start: number,
    duration: number,
    peak: number,
    type: BiquadFilterType,
    cutoff: number,
  ): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master || !this.noise) return
    const source = ctx.createBufferSource()
    source.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = cutoff
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(peak, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(start)
    source.stop(start + duration + 0.02)
    this.track(source)
  }

  private kick(start: number): void {
    this.tone('sine', 36, start, 0.19, 0.24, { filter: 160 })
    this.tone('sine', 31, start + 0.02, 0.16, 0.16)
  }

  private scheduleStep(step: number, time: number): void {
    const preset = PRESETS[this.preset]
    const position = step % 16
    const bar = Math.floor(step / 16) % preset.chords.length
    const chord = preset.chords[bar]
    const beat = 60 / this.bpm
    if (position === 0) this.pad(chord, time, beat * 3.9)
    if (position === 0 || position === 8 || (preset.id === 'chase' && position === 6)) {
      this.kick(time)
    }
    if (position === 4 || position === 12) {
      this.noiseHit(time, 0.13, 0.09, 'bandpass', 1800)
    }
    if (position % 2 === 0) {
      this.noiseHit(time + 0.01, 0.035, 0.028, 'highpass', 7200)
    }
    if (preset.bass.includes(position)) {
      this.tone('triangle', chord[0] - 12, time, beat * 0.32, 0.085, { filter: 340 })
    }
    if (position % 2 === 0) {
      const note = chord[preset.arp[(position / 2) % preset.arp.length] % chord.length] + 12
      this.tone('square', note, time, beat * 0.2, 0.026, { filter: 2400, send: true })
    }
    if (preset.id === 'signal' && position % 4 === 2) {
      this.tone('sawtooth', chord[chord.length - 1] + 24, time, beat * 0.5, 0.012, {
        filter: 3200,
        send: true,
      })
    }
  }

  private schedule = (): void => {
    const ctx = this.ctx
    if (!ctx || !this.playing) return
    const stepDuration = 60 / this.bpm / 4
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.scheduleStep(this.step, this.nextTime)
      this.nextTime += stepDuration
      this.step += 1
    }
  }

  async start(): Promise<boolean> {
    const ctx = this.ensure()
    if (!ctx) return false
    try {
      await ctx.resume()
    } catch {
      return false
    }
    if (this.playing) return true
    this.playing = true
    this.step = 0
    this.nextTime = ctx.currentTime + 0.06
    this.schedule()
    this.timer = window.setInterval(this.schedule, 25)
    return true
  }

  stop(): void {
    this.playing = false
    if (this.timer) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    const ctx = this.ctx
    if (!ctx) return
    const now = ctx.currentTime
    if (this.master) {
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setTargetAtTime(0.0001, now, 0.02)
    }
    for (const source of this.sources) {
      try {
        source.stop(now + 0.03)
      } catch {
        void 0
      }
    }
    this.sources.clear()
    window.setTimeout(() => {
      if (!this.playing && this.master && this.ctx) {
        this.master.gain.setTargetAtTime(this.volume * 0.28, this.ctx.currentTime, 0.05)
      }
    }, 180)
  }

  dispose(): void {
    this.stop()
    if (this.ctx) {
      const ctx = this.ctx
      window.setTimeout(() => {
        void ctx.close()
      }, 240)
    }
    this.ctx = null
    this.master = null
    this.analyser = null
    this.delay = null
    this.delayWet = null
    this.noise = null
  }
}
