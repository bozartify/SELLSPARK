/**
 * SellSpark Fraud Graph Intelligence
 * GNN-inspired link analysis, device fingerprint clustering,
 * community detection via label propagation, and anomaly scoring.
 */

export interface Edge { from: string; to: string; weight: number; kind: 'device' | 'ip' | 'payment' | 'email' }

export function labelPropagation(nodes: string[], edges: Edge[], iters = 20): Record<string, string> {
  const labels: Record<string, string> = Object.fromEntries(nodes.map((n) => [n, n]));
  const adj: Record<string, Edge[]> = Object.fromEntries(nodes.map((n) => [n, []]));
  edges.forEach((e) => { adj[e.from]?.push(e); adj[e.to]?.push({ ...e, from: e.to, to: e.from }); });
  for (let t = 0; t < iters; t++) {
    nodes.forEach((n) => {
      const counts: Record<string, number> = {};
      adj[n].forEach((e) => { counts[labels[e.to]] = (counts[labels[e.to]] || 0) + e.weight; });
      const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (best) labels[n] = best[0];
    });
  }
  return labels;
}

export function anomalyScore(user: { orderVelocity: number; deviceCount: number; ipCountries: number; chargebackRate: number }): number {
  const z =
    0.3 * Math.min(1, user.orderVelocity / 20) +
    0.25 * Math.min(1, user.deviceCount / 10) +
    0.2 * Math.min(1, user.ipCountries / 5) +
    0.25 * Math.min(1, user.chargebackRate * 20);
  return Math.round(z * 100);
}

export function ringDetection(labels: Record<string, string>, minSize = 3): { cluster: string; members: string[] }[] {
  const groups: Record<string, string[]> = {};
  Object.entries(labels).forEach(([n, l]) => { (groups[l] ||= []).push(n); });
  return Object.entries(groups).filter(([, m]) => m.length >= minSize).map(([cluster, members]) => ({ cluster, members }));
}
