/**
 * Alert sound generator using the Web Audio API.
 * No external audio files required — all sounds are synthesized in the browser.
 * Includes global mute control and non-overlapping sound management.
 */

let audioCtx: AudioContext | null = null;
let _muted = false;

/** Check if sounds are muted */
export function isMuted(): boolean {
  return _muted;
}

/** Toggle mute state, returns new state */
export function toggleMute(): boolean {
  _muted = !_muted;
  if (_muted) stopAllSounds();
  return _muted;
}

/** Set mute state explicitly */
export function setMuted(muted: boolean): void {
  _muted = muted;
  if (_muted) stopAllSounds();
}

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Stop all currently playing sounds (resets AudioContext) */
export function stopAllSounds(): void {
  if (audioCtx && audioCtx.state !== "closed") {
    audioCtx.close();
    audioCtx = null;
  }
}

/** 🔔 Notification: Short double-ding for new alerts in bell dropdown */
export function playNotificationSound(): void {
  if (_muted) return;
  stopAllSounds(); // prevent overlap

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Ding 1
  const g1 = ctx.createGain();
  g1.connect(ctx.destination);
  g1.gain.setValueAtTime(0.25, now);
  g1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  const o1 = ctx.createOscillator();
  o1.type = "sine";
  o1.frequency.setValueAtTime(880, now); // A5
  o1.connect(g1);
  o1.start(now);
  o1.stop(now + 0.25);

  // Ding 2 (higher)
  const g2 = ctx.createGain();
  g2.connect(ctx.destination);
  g2.gain.setValueAtTime(0.25, now + 0.15);
  g2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

  const o2 = ctx.createOscillator();
  o2.type = "sine";
  o2.frequency.setValueAtTime(1100, now + 0.15); // C#6
  o2.connect(g2);
  o2.start(now + 0.15);
  o2.stop(now + 0.45);
}

/** 🔴 Critical: Loud, fast siren — alternating two tones rapidly */
export function playCriticalSound(): void {
  if (_muted) return;
  stopAllSounds();

  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = 2.5;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.connect(gain);

  const cycles = 8;
  for (let i = 0; i < cycles; i++) {
    const t = now + (i * duration) / cycles;
    const half = duration / cycles / 2;
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(1200, t + half);
  }

  osc.start(now);
  osc.stop(now + duration);

  for (let i = 0; i < 10; i++) {
    const beepStart = now + i * 0.25;
    const beepGain = ctx.createGain();
    beepGain.connect(ctx.destination);
    beepGain.gain.setValueAtTime(0.3, beepStart);
    beepGain.gain.setValueAtTime(0, beepStart + 0.12);

    const beep = ctx.createOscillator();
    beep.type = "square";
    beep.frequency.setValueAtTime(1400, beepStart);
    beep.connect(beepGain);
    beep.start(beepStart);
    beep.stop(beepStart + 0.12);
  }
}

/** 🟡 Warning: Moderate, slow beeping chime */
export function playWarningSound(): void {
  if (_muted) return;
  stopAllSounds();

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < 4; i++) {
    const beepStart = now + i * 0.5;
    const beepGain = ctx.createGain();
    beepGain.connect(ctx.destination);
    beepGain.gain.setValueAtTime(0.35, beepStart);
    beepGain.gain.exponentialRampToValueAtTime(0.01, beepStart + 0.35);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(660, beepStart);
    osc.frequency.linearRampToValueAtTime(440, beepStart + 0.35);
    osc.connect(beepGain);
    osc.start(beepStart);
    osc.stop(beepStart + 0.35);
  }
}

/** 🟢 Safe: Short, calm confirmation chime */
export function playSafeSound(): void {
  if (_muted) return;
  stopAllSounds();

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const notes = [
    { freq: 523, start: 0, end: 0.4 },    // C5
    { freq: 659, start: 0.2, end: 0.7 },  // E5
    { freq: 784, start: 0.4, end: 1.0 },  // G5
  ];

  for (const note of notes) {
    const g = ctx.createGain();
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.28, now + note.start);
    g.gain.exponentialRampToValueAtTime(0.01, now + note.end);

    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(note.freq, now + note.start);
    o.connect(g);
    o.start(now + note.start);
    o.stop(now + note.end);
  }
}
