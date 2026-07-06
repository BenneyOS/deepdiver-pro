import { useSettings } from "./store/useSettings";

/**
 * Visceral micro-feedback: haptics + light audio ticks. Every call reads the
 * user's settings (haptics/sound toggles) so both can be turned off. Haptics
 * are gated by `navigator.vibrate` support (mobile only) and never throw.
 */

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function vibrate(pattern: number | number[]): void {
  if (!useSettings.getState().haptics) return;
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore — vibration is best-effort
  }
}

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function tick(frequency: number, durationMs: number, gain = 0.05): void {
  if (!useSettings.getState().sound) return;
  const ac = ctx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") void ac.resume();
    const osc = ac.createOscillator();
    const vol = ac.createGain();
    osc.frequency.value = frequency;
    osc.type = "sine";
    vol.gain.value = gain;
    osc.connect(vol);
    vol.connect(ac.destination);
    const now = ac.currentTime;
    vol.gain.setValueAtTime(gain, now);
    vol.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  } catch {
    // audio is best-effort
  }
}

/** Correct answer: bright two-note tick + light haptic. */
export function feedbackCorrect(): void {
  vibrate(12);
  tick(660, 90);
  setTimeout(() => tick(880, 110), 70);
}

/** Wrong answer: single low haptic buzz (the tremor is visual, in the DOM). */
export function feedbackWrong(): void {
  vibrate([18, 40, 18]);
  tick(200, 140, 0.04);
}

/** Mastery / unlock: celebratory triad. */
export function feedbackReward(): void {
  vibrate([10, 30, 10, 30, 20]);
  tick(660, 90);
  setTimeout(() => tick(880, 90), 80);
  setTimeout(() => tick(1046, 140), 170);
}
