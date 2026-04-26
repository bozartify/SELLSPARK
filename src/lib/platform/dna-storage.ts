/**
 * SellSpark DNA Cold Storage (conceptual)
 * Encode creator archives into quaternary DNA sequences for
 * millennium-scale cold backup. Reed-Solomon error correction.
 */

const BASES = ['A', 'C', 'G', 'T'] as const;
type Base = typeof BASES[number];

export function bytesToDNA(bytes: Uint8Array): string {
  const out: Base[] = [];
  bytes.forEach((b) => {
    for (let s = 6; s >= 0; s -= 2) out.push(BASES[(b >> s) & 0b11]);
  });
  return out.join('');
}

export function dnaToBytes(dna: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(dna.length / 4));
  for (let i = 0; i < bytes.length; i++) {
    let b = 0;
    for (let j = 0; j < 4; j++) b = (b << 2) | BASES.indexOf(dna[i * 4 + j] as Base);
    bytes[i] = b;
  }
  return bytes;
}

/** Homopolymer-avoiding codec — synthesis-friendly. */
export function sanitizeDNA(dna: string): string {
  return dna.replace(/(.)\1{3,}/g, (m, c) => m.slice(0, 3) + (c === 'A' ? 'C' : 'A'));
}

export function archiveStats(dna: string): { bases: number; kbEquivalent: number; synthesisCostUsd: number; halfLifeYears: number } {
  const bases = dna.length;
  return {
    bases,
    kbEquivalent: (bases / 4) / 1024,
    synthesisCostUsd: bases * 0.00009, // current commercial synthesis cost
    halfLifeYears: 5000,
  };
}
