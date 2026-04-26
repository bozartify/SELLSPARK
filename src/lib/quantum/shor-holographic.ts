/**
 * SellSpark Shor + Holographic Compute Primitives
 * Simulated Shor factoring circuit for cryptanalysis stress-tests,
 * holographic (tensor-network) state compression, and neuromorphic
 * spiking neural networks for ultra-low-power on-device inference.
 */

/** Classical simulation of Shor's factoring — educational/stress-test only. */
export function shorFactor(N: number): { factors: [number, number] | null; attempts: number } {
  if (N % 2 === 0) return { factors: [2, N / 2], attempts: 1 };
  for (let a = 2, attempts = 0; a < N; a++, attempts++) {
    const g = gcd(a, N);
    if (g > 1) return { factors: [g, N / g], attempts };
    const r = findPeriod(a, N);
    if (r % 2 !== 0) continue;
    const x = modPow(a, r / 2, N);
    if (x === N - 1) continue;
    const p = gcd(x - 1, N);
    const q = gcd(x + 1, N);
    if (p > 1 && p < N) return { factors: [p, N / p], attempts };
    if (q > 1 && q < N) return { factors: [q, N / q], attempts };
  }
  return { factors: null, attempts: N };
}

function gcd(a: number, b: number): number { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function modPow(base: number, exp: number, mod: number): number { let r = 1; base %= mod; while (exp > 0) { if (exp & 1) r = (r * base) % mod; exp >>= 1; base = (base * base) % mod; } return r; }
function findPeriod(a: number, N: number): number { let x = a % N; for (let r = 1; r < N; r++) { x = (x * a) % N; if (x === 1) return r; } return 0; }

/** Holographic tensor-network state compression (MPS-lite). */
export function compressTensor(state: number[], rank = 4): { core: number[]; factors: number[][] } {
  const n = state.length;
  const core: number[] = [];
  const factors: number[][] = [];
  for (let i = 0; i < rank; i++) {
    core.push(state[Math.floor((i * n) / rank)]);
    factors.push(state.slice(Math.floor((i * n) / rank), Math.floor(((i + 1) * n) / rank)));
  }
  return { core, factors };
}

/** Neuromorphic leaky integrate-and-fire spiking neuron. */
export class SpikingNeuron {
  private v = 0; private lastSpike = -Infinity;
  constructor(private threshold = 1, private leak = 0.05, private refractoryMs = 2) {}
  step(input: number, tMs: number): { spiked: boolean; potential: number } {
    if (tMs - this.lastSpike < this.refractoryMs) return { spiked: false, potential: this.v };
    this.v = this.v * (1 - this.leak) + input;
    if (this.v >= this.threshold) { this.v = 0; this.lastSpike = tMs; return { spiked: true, potential: 0 }; }
    return { spiked: false, potential: this.v };
  }
}

/** Spiking network population coding for ultra-low-power on-device inference. */
export function populationEncode(value: number, neurons = 16): number[] {
  const centers = Array.from({ length: neurons }, (_, i) => i / (neurons - 1));
  return centers.map((c) => Math.exp(-((value - c) ** 2) * 32));
}
