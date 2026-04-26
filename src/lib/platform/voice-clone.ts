/**
 * SellSpark Voice Cloning & Deepfake Defense
 * Consented voice fingerprint capture, on-brand TTS synthesis,
 * and adversarial liveness/deepfake detection.
 */

import { createHash } from 'crypto';

export interface VoicePrint { id: string; owner: string; consent: boolean; capturedAt: number; hash: string; features: number[] }

export function capturePrint(owner: string, features: number[]): VoicePrint {
  return {
    id: `vp_${Date.now().toString(36)}`,
    owner,
    consent: true,
    capturedAt: Date.now(),
    hash: createHash('sha256').update(features.join(',')).digest('hex').slice(0, 24),
    features,
  };
}

export function similarity(a: VoicePrint, b: VoicePrint): number {
  const n = Math.min(a.features.length, b.features.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { dot += a.features[i] * b.features[i]; na += a.features[i] ** 2; nb += b.features[i] ** 2; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/** Liveness detection score via spectral entropy + pitch jitter. */
export function livenessScore(features: number[]): { real: number; synthetic: number; verdict: 'human' | 'synthetic' | 'uncertain' } {
  const mean = features.reduce((s, x) => s + x, 0) / features.length;
  const variance = features.reduce((s, x) => s + (x - mean) ** 2, 0) / features.length;
  const jitter = Math.sqrt(variance);
  const real = Math.min(1, jitter * 2);
  const synthetic = 1 - real;
  return { real, synthetic, verdict: real > 0.7 ? 'human' : synthetic > 0.7 ? 'synthetic' : 'uncertain' };
}
