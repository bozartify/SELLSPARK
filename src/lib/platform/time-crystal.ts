/**
 * SellSpark Time-Crystal Scheduler (conceptual)
 * Periodic but non-linear promotional pulse scheduler inspired by
 * time-crystal physics: never-settling revenue-optimal drop windows.
 */

export interface CrystalPhase { t: number; intensity: number; channel: 'email' | 'push' | 'social' | 'in-app' }

export function crystalPhases(totalHours = 168, phases = 24): CrystalPhase[] {
  const out: CrystalPhase[] = [];
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < phases; i++) {
    const t = (i * golden * totalHours) % totalHours;
    const intensity = 0.5 + 0.5 * Math.cos(i * Math.PI / 7);
    const channels: CrystalPhase['channel'][] = ['email', 'push', 'social', 'in-app'];
    out.push({ t, intensity, channel: channels[i % channels.length] });
  }
  return out.sort((a, b) => a.t - b.t);
}
