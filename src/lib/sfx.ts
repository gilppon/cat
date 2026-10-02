/* Cheerful sound effects synthesised with WebAudio, no audio files needed */

const MUTE_KEY = 'PETS_HARBOR_MUTED';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
// Kept separate from `muted` so un-muting after an ad never un-mutes a player-muted game.
let adMuted = false;

try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  muted = false;
}

function applyGain() {
  if (master) master.gain.value = adMuted ? 0 : 1;
}

// ---- Background music: warm F-major lullaby loop, no assets ----
let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicStep = 0;

function mnote(freq: number, delay: number, dur: number, type: OscillatorType, vol: number) {
  const c = audio();
  if (!c || !musicGain) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(musicGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Idempotent. Call from a user gesture; AudioContext requires one. */
export function startMusic() {
  const c = audio();
  if (!c) return;
  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = 0.55;
    musicGain.connect(master!);
  }
  if (musicTimer !== null) return;
  musicStep = 0;
  musicTimer = window.setInterval(musicTick, 210);
}

export function stopMusic() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

function musicTick() {
  // Never schedule while muted, ad-muted, hidden, or suspended; tails fade.
  if (muted || adMuted || document.hidden) return;
  const c = audio();
  if (!c || c.state !== 'running') return;
  const s = musicStep++ % 32;
  // Pad chords: F - Bb - C - F, one per 8 steps, sine, long and soft.
  if (s % 8 === 0) {
    const chords = [
      [174.61, 220.0, 261.63],
      [174.61, 233.08, 293.66],
      [196.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
    ];
    chords[(s >> 3) % 4]?.forEach((f) => mnote(f, 0, 1.7, 'sine', 0.05));
  }
  // Sparse music-box melody on the off-bars, F major pentatonic.
  if (s % 8 === 4) {
    const lead = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33];
    const f = lead[(s >> 3) % 8];
    if (f !== undefined) mnote(f, 0, 0.5, 'triangle', 0.05);
  }
  // Gentle root pulse under each chord change.
  if (s % 8 === 0) {
    const roots = [87.31, 87.31, 98.0, 87.31];
    const r = roots[(s >> 3) % 4];
    if (r !== undefined) mnote(r, 0, 0.4, 'sine', 0.07);
  }
}

function audio(): AudioContext | null {
  if (muted || adMuted) return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = adMuted ? 0 : 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  delay: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.1,
  slideTo?: number,
) {
  const c = audio();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export const sfx = {
  unlock() {
    audio();
  },
  isMuted: () => muted,
  setMuted(value: boolean) {
    muted = value;
    try {
      localStorage.setItem(MUTE_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  },
  /** Portal requirement: silence all audio while an ad is playing. */
  setAdMuted(value: boolean) {
    adMuted = value;
    applyGain();
  },
  tap: () => tone(620, 0, 0.06, 'triangle', 0.05),
  pick: () => tone(480, 0, 0.08, 'triangle', 0.06, 660),
  drop: () => tone(340, 0, 0.09, 'sine', 0.07, 240),
  spawn: () => {
    tone(700, 0, 0.08, 'triangle', 0.07);
    tone(1050, 0.05, 0.1, 'triangle', 0.05);
  },
  merge: (level: number) => {
    const base = 392 * Math.pow(1.12, level);
    tone(base, 0, 0.12, 'triangle', 0.09);
    tone(base * 1.26, 0.07, 0.12, 'triangle', 0.08);
    tone(base * 1.5, 0.14, 0.24, 'sine', 0.08);
  },
  deliver: () => {
    tone(880, 0, 0.1, 'square', 0.035);
    tone(1175, 0.08, 0.1, 'square', 0.035);
    tone(1568, 0.16, 0.32, 'triangle', 0.06);
  },
  coin: () => {
    tone(1320, 0, 0.07, 'square', 0.03);
    tone(1760, 0.06, 0.16, 'square', 0.03);
  },
  restore: () => {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.22, 'triangle', 0.08));
  },
  fanfare: () => {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
      tone(f, i * 0.11, i === 5 ? 0.55 : 0.18, 'triangle', 0.09),
    );
  },
  error: () => tone(200, 0, 0.16, 'sawtooth', 0.035, 140),
  buy: () => {
    tone(988, 0, 0.08, 'triangle', 0.07);
    tone(1319, 0.07, 0.2, 'triangle', 0.07);
  },
};
