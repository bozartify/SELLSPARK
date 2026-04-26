/**
 * SellSpark Quantum Search & Optimization
 * Grover-inspired amplitude amplification for product/catalog search,
 * QAOA-style combinatorial pricing optimization, and
 * quantum walk-based graph recommendation.
 */

/** Grover-inspired search: O(√N) expected iterations in ideal quantum hardware,
 *  simulated here classically but using the amplitude-amplification pattern. */
export function groverSearch<T>(
  items: T[],
  oracle: (x: T) => boolean,
): { found: T | null; iterations: number; probability: number } {
  const n = items.length;
  if (n === 0) return { found: null, iterations: 0, probability: 0 };
  const optimalIters = Math.max(1, Math.floor((Math.PI / 4) * Math.sqrt(n)));
  let amplitudes = new Array(n).fill(1 / Math.sqrt(n));
  for (let k = 0; k < optimalIters; k++) {
    // oracle flip
    amplitudes = amplitudes.map((a, i) => (oracle(items[i]) ? -a : a));
    // inversion about mean
    const mean = amplitudes.reduce((s, a) => s + a, 0) / n;
    amplitudes = amplitudes.map((a) => 2 * mean - a);
  }
  const probs = amplitudes.map((a) => a * a);
  const best = probs.indexOf(Math.max(...probs));
  return { found: oracle(items[best]) ? items[best] : null, iterations: optimalIters, probability: probs[best] };
}

/** QAOA-style MaxCut — used for pricing tier clustering. */
export function qaoaMaxCut(adj: number[][], layers = 3): number[] {
  const n = adj.length;
  let best: number[] = new Array(n).fill(0).map(() => (Math.random() < 0.5 ? 0 : 1));
  let bestCut = cutValue(adj, best);
  for (let l = 0; l < layers * n; l++) {
    const cand = [...best];
    cand[l % n] = 1 - cand[l % n];
    const c = cutValue(adj, cand);
    if (c > bestCut) {
      best = cand;
      bestCut = c;
    }
  }
  return best;
}

function cutValue(adj: number[][], assign: number[]): number {
  let c = 0;
  for (let i = 0; i < adj.length; i++)
    for (let j = i + 1; j < adj.length; j++)
      if (assign[i] !== assign[j]) c += adj[i][j];
  return c;
}

/** Continuous-time quantum walk for graph-based recommendation. */
export function quantumWalkRecommend(adj: number[][], start: number, steps = 50): number[] {
  const n = adj.length;
  const amp = new Array(n).fill(0);
  amp[start] = 1;
  for (let t = 0; t < steps; t++) {
    const next = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let neighborSum = 0;
      for (let j = 0; j < n; j++) if (adj[i][j]) neighborSum += amp[j];
      next[i] = Math.cos(0.1) * amp[i] - Math.sin(0.1) * neighborSum;
    }
    const norm = Math.hypot(...next) || 1;
    for (let i = 0; i < n; i++) amp[i] = next[i] / norm;
  }
  return amp.map((a) => a * a);
}
