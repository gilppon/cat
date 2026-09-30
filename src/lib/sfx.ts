/* 오디오 파일 없이 WebAudio 로 합성하는 경쾌한 효과음 */

const MUTE_KEY = 'PETS_HARBOR_MUTED';
let ctx: AudioContext | null = null;
let muted = false;

try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  muted = false;
}

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
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
  if (!c) return;
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
  gain.connect(c.destination);
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
