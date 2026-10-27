// Tiny WebAudio synth for UI feedback — no audio files needed.
let ctx = null;
let enabled = true;

export const setSound = on => { enabled = on; };

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur = 0.08, type = 'square', vol = 0.05, when = 0, slide = 0) {
  if (!enabled) return;
  const a = ac(); if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

export const sfx = {
  click: () => tone(520, 0.05, 'triangle', 0.05),
  tick: i => tone(300 + (i % 6) * 60, 0.04, 'square', 0.025),
  pick: () => { tone(440, 0.08, 'triangle', 0.06); tone(880, 0.14, 'triangle', 0.05, 0.06, 200); },
  reveal: tier => {
    const base = [392, 440, 523, 587, 659, 784][tier] || 392;
    [0, 4, 7, 12].slice(0, 2 + Math.min(2, tier)).forEach((s, i) => tone(base * Math.pow(2, s / 12), 0.22 + tier * 0.05, 'sawtooth', 0.035, i * 0.07));
    if (tier >= 3) tone(base / 2, 0.6, 'sine', 0.08, 0, -100);
  },
  reroll: () => tone(220, 0.25, 'sawtooth', 0.04, 0, 400),
  complete: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.06, i * 0.1)),
  error: () => tone(160, 0.15, 'square', 0.04),
};
