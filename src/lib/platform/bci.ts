/**
 * SellSpark Brain-Computer Interface Bridge
 * EEG signal ingest (Muse/Neurable/Emotiv), SSVEP intent decoding,
 * attention/flow-state scoring, and thought-to-purchase prototyping.
 */

export interface EEGSample { ts: number; channels: number[]; sampleRateHz: number }

export function bandPower(signal: number[], fs: number, lo: number, hi: number): number {
  // naive Welch-lite: window mean-square in band via Goertzel sum
  let power = 0;
  for (let f = lo; f <= hi; f++) {
    const w = (2 * Math.PI * f) / fs;
    let real = 0, imag = 0;
    for (let n = 0; n < signal.length; n++) { real += signal[n] * Math.cos(w * n); imag += signal[n] * Math.sin(w * n); }
    power += (real * real + imag * imag) / signal.length;
  }
  return power;
}

export function flowState(sample: EEGSample): { alpha: number; beta: number; theta: number; focus: number; flow: number } {
  const ch = sample.channels;
  const alpha = bandPower(ch, sample.sampleRateHz, 8, 12);
  const beta = bandPower(ch, sample.sampleRateHz, 13, 30);
  const theta = bandPower(ch, sample.sampleRateHz, 4, 7);
  const focus = beta / Math.max(0.01, alpha + theta);
  const flow = (alpha * theta) / Math.max(0.01, beta);
  return { alpha, beta, theta, focus, flow };
}

/** Steady-state visual evoked potential intent classifier. */
export function ssvepIntent(sample: EEGSample, targetHz: number[]): { pick: number; confidence: number } {
  const powers = targetHz.map((f) => bandPower(sample.channels, sample.sampleRateHz, f - 0.5, f + 0.5));
  const max = Math.max(...powers);
  const total = powers.reduce((s, p) => s + p, 0) || 1;
  return { pick: powers.indexOf(max), confidence: max / total };
}
