/**
 * SellSpark Loyalty, Points & Referral Credits
 * Tiered loyalty engine, points earn/burn, referral credits,
 * streaks, badges, and gamified quests.
 */

export const TIERS = [
  { id: 'bronze', min: 0, multiplier: 1.0, perks: ['Welcome kit'] },
  { id: 'silver', min: 500, multiplier: 1.25, perks: ['Early access drops'] },
  { id: 'gold', min: 2500, multiplier: 1.5, perks: ['Private Discord', 'Surprise gifts'] },
  { id: 'platinum', min: 10000, multiplier: 2.0, perks: ['Creator call', 'Custom merch'] },
  { id: 'diamond', min: 50000, multiplier: 3.0, perks: ['Revenue share', 'Lifetime access'] },
] as const;

export function tierFor(points: number) { return [...TIERS].reverse().find((t) => points >= t.min)!; }

export function earnPoints(usd: number, tierMultiplier = 1): number {
  return Math.round(usd * 100 * tierMultiplier);
}

export interface Quest { id: string; title: string; reward: number; progress: number; goal: number }

export const STARTER_QUESTS: Quest[] = [
  { id: 'first-sale', title: 'Make your first sale', reward: 500, progress: 0, goal: 1 },
  { id: 'five-reviews', title: 'Collect 5 reviews', reward: 300, progress: 0, goal: 5 },
  { id: 'invite-3', title: 'Invite 3 creators', reward: 1000, progress: 0, goal: 3 },
  { id: 'post-daily-7', title: '7-day posting streak', reward: 700, progress: 0, goal: 7 },
];

export function streakBonus(days: number): number {
  return Math.min(500, days * 10 * Math.log2(1 + days));
}
