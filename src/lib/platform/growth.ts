/**
 * SellSpark Growth Engine
 * Viral coefficient modeling, referral graph analysis (PageRank-lite),
 * cohort retention curves, and SEO metadata generation.
 */

export function viralCoefficient(invitesPerUser: number, conversionRate: number): number {
  return invitesPerUser * conversionRate;
}

export function projectGrowth(seed: number, k: number, cycles: number): number[] {
  const out: number[] = [];
  let n = seed;
  for (let i = 0; i < cycles; i++) {
    n = n + n * k;
    out.push(Math.round(n));
  }
  return out;
}

/** PageRank on referral graph — identifies super-spreaders. */
export function pageRank(adj: Record<string, string[]>, damping = 0.85, iters = 50): Record<string, number> {
  const nodes = Object.keys(adj);
  const n = nodes.length || 1;
  let rank: Record<string, number> = Object.fromEntries(nodes.map((k) => [k, 1 / n]));
  for (let t = 0; t < iters; t++) {
    const next: Record<string, number> = Object.fromEntries(nodes.map((k) => [k, (1 - damping) / n]));
    nodes.forEach((u) => {
      const outs = adj[u] || [];
      if (outs.length === 0) {
        nodes.forEach((v) => (next[v] += (damping * rank[u]) / n));
      } else {
        outs.forEach((v) => { next[v] = (next[v] ?? 0) + (damping * rank[u]) / outs.length; });
      }
    });
    rank = next;
  }
  return rank;
}

export function retentionCurve(cohort: number[][], days: number[]): { day: number; pct: number }[] {
  return days.map((d) => {
    const total = cohort.reduce((s, c) => s + (c[0] || 0), 0) || 1;
    const retained = cohort.reduce((s, c) => s + (c[d] || 0), 0);
    return { day: d, pct: retained / total };
  });
}

export function generateSEO(title: string, niche: string): { title: string; description: string; keywords: string[]; ogImage: string } {
  return {
    title: `${title} — AI Creator Store | SellSpark`,
    description: `Shop ${niche} products, courses, and coaching from a verified SellSpark creator. Quantum-secure checkout, instant delivery.`,
    keywords: [niche, 'creator', 'store', 'digital products', 'coaching', 'courses', 'SellSpark'],
    ogImage: `/api/og?title=${encodeURIComponent(title)}&niche=${encodeURIComponent(niche)}`,
  };
}
