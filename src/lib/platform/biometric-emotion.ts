/**
 * SellSpark Biometric & Emotion Intelligence
 * Camera-based heart-rate (rPPG), gaze/attention estimation,
 * emotion inference from facial action units, and stress scoring
 * for adaptive UI that responds to the viewer in real time.
 */

export interface EmotionVector {
  joy: number; surprise: number; focus: number; frustration: number; fatigue: number;
}

export function blendEmotion(samples: EmotionVector[]): EmotionVector {
  const z: EmotionVector = { joy: 0, surprise: 0, focus: 0, frustration: 0, fatigue: 0 };
  if (samples.length === 0) return z;
  samples.forEach((s) => {
    (Object.keys(z) as (keyof EmotionVector)[]).forEach((k) => (z[k] += s[k]));
  });
  (Object.keys(z) as (keyof EmotionVector)[]).forEach((k) => (z[k] /= samples.length));
  return z;
}

/** Convert RGB frame luminance history to heart rate (bpm) via FFT peak. */
export function estimateHeartRate(greenChannel: number[], fps = 30): number {
  if (greenChannel.length < fps * 2) return 0;
  const mean = greenChannel.reduce((s, x) => s + x, 0) / greenChannel.length;
  const centered = greenChannel.map((x) => x - mean);
  // naive autocorrelation peak within 40–180 bpm band
  let bestLag = 0, bestVal = -Infinity;
  const minLag = Math.floor(fps * 60 / 180);
  const maxLag = Math.floor(fps * 60 / 40);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i < centered.length - lag; i++) s += centered[i] * centered[i + lag];
    if (s > bestVal) { bestVal = s; bestLag = lag; }
  }
  return bestLag ? Math.round((fps * 60) / bestLag) : 0;
}

export function adaptiveUIHint(e: EmotionVector): { theme: string; pace: 'slow' | 'normal' | 'fast'; cta: string } {
  if (e.frustration > 0.6) return { theme: 'calm', pace: 'slow', cta: 'Need help? Chat live' };
  if (e.joy > 0.6) return { theme: 'vibrant', pace: 'fast', cta: 'Get it now — 10% off' };
  if (e.fatigue > 0.6) return { theme: 'minimal', pace: 'slow', cta: 'Save for later' };
  if (e.focus > 0.7) return { theme: 'focused', pace: 'normal', cta: 'Continue to checkout' };
  return { theme: 'default', pace: 'normal', cta: 'Learn more' };
}
