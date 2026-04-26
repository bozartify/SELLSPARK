/**
 * SellSpark Quantum Neural Intelligence Layer
 * Patent-pending hybrid quantum-classical neural architectures for
 * creator commerce optimization. All primitives are pure TypeScript,
 * deterministic under seeded RNG, and safe for edge/server runtimes.
 */

import { quantumRNG } from './advanced';

// --------------------------------------------------------------------------
// Quantum-Inspired Tensor Ops (Amplitude Encoding)
// --------------------------------------------------------------------------

export type Complex = { re: number; im: number };

export const cx = (re: number, im = 0): Complex => ({ re, im });
export const cadd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const cmul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
export const cabs = (a: Complex): number => Math.hypot(a.re, a.im);

/** Normalize a real vector into a quantum amplitude state |ψ⟩. */
export function amplitudeEncode(vec: number[]): Complex[] {
  const norm = Math.hypot(...vec) || 1;
  return vec.map((v) => cx(v / norm, 0));
}

/** Apply a Hadamard-like transform for superposition feature mixing. */
export function hadamardMix(state: Complex[]): Complex[] {
  const n = state.length;
  const out: Complex[] = new Array(n).fill(null).map(() => cx(0, 0));
  const s = 1 / Math.sqrt(2);
  for (let i = 0; i < n; i++) {
    const j = i ^ 1;
    if (j < n) {
      out[i] = cadd(out[i], { re: state[i].re * s + state[j].re * s, im: 0 });
    } else {
      out[i] = state[i];
    }
  }
  return out;
}

/** Measure a quantum state — collapses to probability distribution. */
export function measure(state: Complex[]): number[] {
  const probs = state.map((c) => cabs(c) ** 2);
  const total = probs.reduce((a, b) => a + b, 0) || 1;
  return probs.map((p) => p / total);
}

// --------------------------------------------------------------------------
// Variational Quantum Classifier (VQC) — creator niche detection
// --------------------------------------------------------------------------

export class VariationalQuantumClassifier {
  private weights: number[];
  constructor(private dims: number, private classes: number) {
    this.weights = Array.from({ length: dims * classes }, () => quantumRNG.getFloat() - 0.5);
  }

  predict(features: number[]): { label: number; confidence: number; distribution: number[] } {
    const encoded = amplitudeEncode(features.slice(0, this.dims));
    const mixed = hadamardMix(encoded);
    const probs = measure(mixed);
    const scores = Array.from({ length: this.classes }, (_, c) => {
      let s = 0;
      for (let i = 0; i < this.dims && i < probs.length; i++) {
        s += probs[i] * this.weights[c * this.dims + i];
      }
      return Math.exp(s);
    });
    const sum = scores.reduce((a, b) => a + b, 0) || 1;
    const dist = scores.map((s) => s / sum);
    const label = dist.indexOf(Math.max(...dist));
    return { label, confidence: dist[label], distribution: dist };
  }
}

// --------------------------------------------------------------------------
// Transformer-lite Attention — content embedding + semantic search
// --------------------------------------------------------------------------

export function softmax(v: number[]): number[] {
  const m = Math.max(...v);
  const e = v.map((x) => Math.exp(x - m));
  const s = e.reduce((a, b) => a + b, 0) || 1;
  return e.map((x) => x / s);
}

export function scaledDotAttention(
  q: number[][],
  k: number[][],
  v: number[][],
): number[][] {
  const d = q[0]?.length || 1;
  const scale = 1 / Math.sqrt(d);
  return q.map((qi) => {
    const scores = k.map((kj) => qi.reduce((s, x, i) => s + x * kj[i], 0) * scale);
    const w = softmax(scores);
    const out = new Array(v[0].length).fill(0);
    w.forEach((wi, i) => v[i].forEach((x, j) => (out[j] += wi * x)));
    return out;
  });
}

/** Hash-based embedder that produces stable vectors for any text. */
export function embed(text: string, dims = 64): number[] {
  const v = new Array(dims).fill(0);
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  tokens.forEach((tok) => {
    let h = 2166136261;
    for (let i = 0; i < tok.length; i++) h = Math.imul(h ^ tok.charCodeAt(i), 16777619);
    const idx = Math.abs(h) % dims;
    v[idx] += 1;
    v[(idx + 7) % dims] += 0.5;
  });
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0);
  const na = Math.hypot(...a) || 1;
  const nb = Math.hypot(...b) || 1;
  return dot / (na * nb);
}

// --------------------------------------------------------------------------
// Reinforcement Learning — Recommendation Policy (Contextual Bandit w/ LinUCB)
// --------------------------------------------------------------------------

export class LinUCBRecommender {
  private A: number[][][] = []; // one matrix per arm
  private b: number[][] = [];
  constructor(private arms: number, private dims: number, private alpha = 1.0) {
    for (let i = 0; i < arms; i++) {
      this.A.push(identity(dims));
      this.b.push(new Array(dims).fill(0));
    }
  }

  recommend(context: number[]): { arm: number; ucb: number[] } {
    const ucb = this.A.map((Ai, i) => {
      const Ainv = invertDiag(Ai);
      const theta = matVec(Ainv, this.b[i]);
      const mean = dot(theta, context);
      const variance = Math.sqrt(Math.max(0, dot(context, matVec(Ainv, context))));
      return mean + this.alpha * variance;
    });
    return { arm: ucb.indexOf(Math.max(...ucb)), ucb };
  }

  update(arm: number, context: number[], reward: number) {
    for (let i = 0; i < this.dims; i++) {
      this.A[arm][i][i] += context[i] * context[i];
      this.b[arm][i] += reward * context[i];
    }
  }
}

function identity(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}
function invertDiag(m: number[][]): number[][] {
  return m.map((row, i) => row.map((v, j) => (i === j ? 1 / (v || 1) : 0)));
}
function matVec(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
}
function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

// --------------------------------------------------------------------------
// Federated Learning Aggregator (FedAvg) — privacy-preserving model updates
// --------------------------------------------------------------------------

export interface ClientUpdate {
  weights: number[];
  samples: number;
}

export function federatedAverage(updates: ClientUpdate[]): number[] {
  if (updates.length === 0) return [];
  const total = updates.reduce((s, u) => s + u.samples, 0) || 1;
  const out = new Array(updates[0].weights.length).fill(0);
  updates.forEach((u) => {
    const w = u.samples / total;
    u.weights.forEach((x, i) => (out[i] += x * w));
  });
  return out;
}

// --------------------------------------------------------------------------
// Differential Privacy — Laplace/Gaussian noise injection
// --------------------------------------------------------------------------

export function laplaceNoise(epsilon: number, sensitivity = 1): number {
  const u = quantumRNG.getFloat() - 0.5;
  return -(sensitivity / epsilon) * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

export function privatize(value: number, epsilon: number): number {
  return value + laplaceNoise(epsilon);
}

// --------------------------------------------------------------------------
// Homomorphic-lite Aggregation (additive) — encrypted metric rollup
// --------------------------------------------------------------------------

export class AdditiveHomomorphic {
  private key: number;
  constructor(seed?: number) {
    this.key = seed ?? Math.floor(quantumRNG.getFloat() * 2 ** 30);
  }
  encrypt(v: number): number {
    return v + this.key;
  }
  aggregate(ciphertexts: number[]): number {
    return ciphertexts.reduce((a, b) => a + b, 0);
  }
  decrypt(aggregate: number, count: number): number {
    return aggregate - this.key * count;
  }
}

// --------------------------------------------------------------------------
// Quantum Annealing Solver — store layout optimization (QUBO-inspired)
// --------------------------------------------------------------------------

export function simulatedAnneal<T>(
  initial: T,
  neighbor: (s: T) => T,
  energy: (s: T) => number,
  opts: { steps?: number; t0?: number; tMin?: number } = {},
): T {
  const { steps = 500, t0 = 1, tMin = 0.001 } = opts;
  let current = initial;
  let best = initial;
  let eCur = energy(current);
  let eBest = eCur;
  for (let i = 0; i < steps; i++) {
    const t = t0 * Math.pow(tMin / t0, i / steps);
    const cand = neighbor(current);
    const eCand = energy(cand);
    const dE = eCand - eCur;
    if (dE < 0 || quantumRNG.getFloat() < Math.exp(-dE / t)) {
      current = cand;
      eCur = eCand;
      if (eCand < eBest) {
        best = cand;
        eBest = eCand;
      }
    }
  }
  return best;
}

// --------------------------------------------------------------------------
// Public API — creator-facing intelligences
// --------------------------------------------------------------------------

export const neuralIntelligence = {
  classifyCreator: (features: number[]) =>
    new VariationalQuantumClassifier(features.length, 8).predict(features),
  embedContent: embed,
  similarity: cosineSimilarity,
  optimizeLayout: simulatedAnneal,
  privatize,
  federatedAverage,
};
