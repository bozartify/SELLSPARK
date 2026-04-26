/**
 * SellSpark Genomic-Style Personalization
 * Treat each visitor as a "profile genome" with discrete allele traits.
 * Polygenic scoring drives product/content ranking — GDPR-safe,
 * no actual biometric data required.
 */

export interface ProfileGenome { alleles: Record<string, number> }

export function recombine(a: ProfileGenome, b: ProfileGenome, rate = 0.5): ProfileGenome {
  const alleles: Record<string, number> = {};
  const keys = new Set([...Object.keys(a.alleles), ...Object.keys(b.alleles)]);
  keys.forEach((k) => { alleles[k] = Math.random() < rate ? a.alleles[k] ?? 0 : b.alleles[k] ?? 0; });
  return { alleles };
}

export function polygenicScore(genome: ProfileGenome, weights: Record<string, number>): number {
  return Object.entries(weights).reduce((s, [k, w]) => s + (genome.alleles[k] ?? 0) * w, 0);
}

export function mutate(g: ProfileGenome, rate = 0.05): ProfileGenome {
  const alleles: Record<string, number> = { ...g.alleles };
  Object.keys(alleles).forEach((k) => { if (Math.random() < rate) alleles[k] = Math.random(); });
  return { alleles };
}
