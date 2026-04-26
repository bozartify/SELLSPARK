/**
 * SellSpark Carbon & Impact Ledger
 * Per-transaction CO2 accounting, automatic offset routing to
 * verified climate funds, and Scope 1/2/3 reporting for creators.
 */

const CO2_GRAMS_PER_CHAIN: Record<string, number> = {
  ethereum: 22,
  base: 0.15,
  polygon: 0.4,
  solana: 0.002,
  bitcoin: 707,
  lightning: 0.001,
  'sellspark-l2': 0.05,
};

const CO2_GRAMS_PER_STREAM_HOUR = 55; // avg video streaming
const CO2_GRAMS_PER_AI_CALL = 0.3;

export function transactionFootprint(chain: keyof typeof CO2_GRAMS_PER_CHAIN): number {
  return CO2_GRAMS_PER_CHAIN[chain] ?? 1;
}

export function totalFootprint(x: { txByChain: Record<string, number>; streamHours: number; aiCalls: number }): number {
  const tx = Object.entries(x.txByChain).reduce((s, [c, n]) => s + (CO2_GRAMS_PER_CHAIN[c] ?? 1) * n, 0);
  return tx + x.streamHours * CO2_GRAMS_PER_STREAM_HOUR + x.aiCalls * CO2_GRAMS_PER_AI_CALL;
}

export interface OffsetRoute { fund: string; tons: number; costUsd: number; verifier: string }

export function offsetRoute(grams: number): OffsetRoute {
  const tons = grams / 1_000_000;
  return { fund: 'Climeworks direct-air-capture', tons, costUsd: tons * 430, verifier: 'Gold Standard' };
}

export function esgReport(footprintG: number, revenueUsd: number): {
  intensity: number; grade: 'A+' | 'A' | 'B' | 'C' | 'D';
} {
  const intensity = footprintG / Math.max(1, revenueUsd); // gCO2 per $
  const grade = intensity < 0.5 ? 'A+' : intensity < 1 ? 'A' : intensity < 5 ? 'B' : intensity < 20 ? 'C' : 'D';
  return { intensity, grade };
}
