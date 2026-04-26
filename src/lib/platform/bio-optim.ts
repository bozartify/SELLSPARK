/**
 * SellSpark Bio-Inspired Optimizers
 * Ant Colony (ACO) for funnel path optimization, Genetic Algorithm
 * for headline evolution, Particle Swarm for pricing surface search.
 */

export function antColony<T>(
  nodes: T[],
  cost: (a: T, b: T) => number,
  opts: { ants?: number; iters?: number; alpha?: number; beta?: number; evap?: number } = {},
): T[] {
  const { ants = 20, iters = 60, alpha = 1, beta = 3, evap = 0.1 } = opts;
  const n = nodes.length;
  const pher: number[][] = Array.from({ length: n }, () => new Array(n).fill(1));
  let best: T[] = [];
  let bestCost = Infinity;
  for (let t = 0; t < iters; t++) {
    for (let a = 0; a < ants; a++) {
      const visited = new Set<number>();
      let cur = Math.floor(Math.random() * n);
      visited.add(cur);
      const path: number[] = [cur];
      while (visited.size < n) {
        const probs = nodes.map((_, j) => visited.has(j) ? 0 : Math.pow(pher[cur][j], alpha) * Math.pow(1 / Math.max(0.01, cost(nodes[cur], nodes[j])), beta));
        const sum = probs.reduce((s, p) => s + p, 0) || 1;
        let r = Math.random() * sum, pick = -1;
        for (let j = 0; j < n; j++) { r -= probs[j]; if (r <= 0 && !visited.has(j)) { pick = j; break; } }
        if (pick < 0) pick = nodes.findIndex((_, j) => !visited.has(j));
        path.push(pick); visited.add(pick); cur = pick;
      }
      const pc = path.slice(0, -1).reduce((s, k, i) => s + cost(nodes[k], nodes[path[i + 1]]), 0);
      if (pc < bestCost) { bestCost = pc; best = path.map((i) => nodes[i]); }
      path.forEach((k, i) => { if (i < path.length - 1) pher[k][path[i + 1]] += 1 / pc; });
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) pher[i][j] *= 1 - evap;
  }
  return best;
}

/** Genetic algorithm for headline/copy evolution. */
export function geneticEvolve(
  population: string[],
  fitness: (s: string) => number,
  opts: { generations?: number; mutationRate?: number } = {},
): { best: string; score: number } {
  const { generations = 20, mutationRate = 0.1 } = opts;
  let pop = [...population];
  for (let g = 0; g < generations; g++) {
    pop.sort((a, b) => fitness(b) - fitness(a));
    const top = pop.slice(0, Math.max(2, Math.floor(pop.length / 2)));
    const next: string[] = [...top];
    while (next.length < pop.length) {
      const [a, b] = [top[Math.floor(Math.random() * top.length)], top[Math.floor(Math.random() * top.length)]];
      const cut = Math.floor(Math.random() * Math.min(a.length, b.length));
      let child = a.slice(0, cut) + b.slice(cut);
      if (Math.random() < mutationRate) child = child.replace(/./, (c) => String.fromCharCode(c.charCodeAt(0) + (Math.random() < 0.5 ? 1 : -1)));
      next.push(child);
    }
    pop = next;
  }
  pop.sort((a, b) => fitness(b) - fitness(a));
  return { best: pop[0], score: fitness(pop[0]) };
}
