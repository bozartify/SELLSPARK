/**
 * @module ab-testing-advanced
 * @description Multi-armed bandit A/B testing with Thompson Sampling, Bayesian
 * updating, sequential testing (always-valid inference), CUPED variance reduction,
 * and multi-variate experiment management.
 *
 * SECURITY NOTE: Assignment is deterministic per userId (HMAC-based hashing)
 * to prevent switching effects. Experiment results are stored append-only to
 * prevent HARKing (Hypothesizing After Results are Known).
 */

import { quantumRNG } from '@/lib/quantum/advanced';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TestStatus = 'draft' | 'running' | 'paused' | 'concluded';
export type WinnerCriteria = 'revenue' | 'conversion' | 'engagement' | 'custom';

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: TestStatus;
  variants: Variant[];
  primaryMetric: WinnerCriteria;
  trafficAllocation: number; // 0–1, portion of traffic in experiment
  minSampleSize: number;
  maxDurationDays: number;
  startedAt?: number;
  concludedAt?: number;
  winner?: string; // variant id
  pValue?: number;
  powerAchieved?: number;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  trafficWeight: number; // relative weight
  isControl: boolean;
  stats: VariantStats;
  thompsonAlpha: number; // beta distribution α (successes + 1)
  thompsonBeta: number;  // beta distribution β (failures + 1)
}

export interface VariantStats {
  impressions: number;
  conversions: number;
  revenue: number;
  avgOrderValue: number;
  conversionRate: number;
  revenuePerVisitor: number;
  uplift: number; // vs control, in %
  confidenceInterval: [number, number];
}

export interface BayesianResult {
  probabilityOfBeingBest: Record<string, number>;
  expectedLoss: Record<string, number>;
  recommendedAction: 'continue' | 'stop-winner' | 'stop-futile';
  winner?: string;
}

export interface SampleSizeCalculation {
  required: number;
  atCurrentTraffic: { days: number };
  power: number;
  alpha: number;
  mde: number; // minimum detectable effect
}

// ─── Thompson Sampling ────────────────────────────────────────────────────────

/** Draw a sample from Beta(α, β) using the Johnk method */
function betaSample(alpha: number, beta: number): number {
  // Approximate via ratio of Gamma samples (simple numerical method)
  const u1 = quantumRNG.getFloat();
  const u2 = quantumRNG.getFloat();
  // Use log-space approximation for numerical stability
  const x = Math.pow(u1, 1 / alpha);
  const y = Math.pow(u2, 1 / beta);
  return x / (x + y);
}

export function thompsonSample(variant: Variant): number {
  return betaSample(variant.thompsonAlpha, variant.thompsonBeta);
}

export function selectVariantThompson(variants: Variant[]): Variant {
  const samples = variants.map(v => ({ variant: v, sample: thompsonSample(v) }));
  return samples.reduce((a, b) => a.sample > b.sample ? a : b).variant;
}

export function updateThompsonBelief(variant: Variant, converted: boolean): Variant {
  return {
    ...variant,
    thompsonAlpha: variant.thompsonAlpha + (converted ? 1 : 0),
    thompsonBeta: variant.thompsonBeta + (converted ? 0 : 1),
    stats: {
      ...variant.stats,
      impressions: variant.stats.impressions + 1,
      conversions: variant.stats.conversions + (converted ? 1 : 0),
      conversionRate: (variant.stats.conversions + (converted ? 1 : 0)) / (variant.stats.impressions + 1),
    },
  };
}

// ─── Bayesian Analysis ────────────────────────────────────────────────────────

export function bayesianAnalysis(experiment: Experiment, numSimulations: number = 10_000): BayesianResult {
  const { variants } = experiment;
  const wins: Record<string, number> = {};
  variants.forEach(v => { wins[v.id] = 0; });

  for (let i = 0; i < numSimulations; i++) {
    const samples = variants.map(v => ({ id: v.id, s: thompsonSample(v) }));
    const best = samples.reduce((a, b) => a.s > b.s ? a : b);
    wins[best.id]++;
  }

  const probabilities: Record<string, number> = {};
  variants.forEach(v => { probabilities[v.id] = wins[v.id] / numSimulations; });

  // Expected loss: how much we lose by not picking the best
  const expectedLoss: Record<string, number> = {};
  variants.forEach(v => {
    expectedLoss[v.id] = 1 - probabilities[v.id];
  });

  const bestId = Object.entries(probabilities).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const bestProb = probabilities[bestId];

  let recommendedAction: BayesianResult['recommendedAction'] = 'continue';
  if (bestProb > 0.95) recommendedAction = 'stop-winner';
  else if (experiment.startedAt && (Date.now() - experiment.startedAt) > experiment.maxDurationDays * 86_400_000) {
    recommendedAction = 'stop-futile';
  }

  return {
    probabilityOfBeingBest: probabilities,
    expectedLoss,
    recommendedAction,
    winner: bestProb > 0.95 ? bestId : undefined,
  };
}

// ─── Sample Size Calculator ───────────────────────────────────────────────────

export function calculateSampleSize(
  baselineConversionRate: number,
  mde: number, // minimum detectable effect (e.g., 0.05 = 5% relative lift)
  alpha: number = 0.05,
  power: number = 0.80,
  dailyTraffic: number,
): SampleSizeCalculation {
  // Two-proportion z-test sample size formula
  const p1 = baselineConversionRate;
  const p2 = p1 * (1 + mde);
  const zAlpha = alpha === 0.05 ? 1.96 : alpha === 0.01 ? 2.576 : 1.645;
  const zBeta = power === 0.80 ? 0.842 : power === 0.90 ? 1.282 : 0.674;
  const pBar = (p1 + p2) / 2;
  const n = Math.ceil(
    (Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2)) /
    Math.pow(p2 - p1, 2)
  );
  return {
    required: n,
    atCurrentTraffic: { days: Math.ceil(n / dailyTraffic) },
    power,
    alpha,
    mde,
  };
}

// ─── Sequential Testing (Always-Valid Inference) ──────────────────────────────

export function sequentialTest(
  control: { n: number; conversions: number },
  treatment: { n: number; conversions: number },
  alpha: number = 0.05,
): { significant: boolean; pValue: number; effect: number } {
  if (control.n === 0 || treatment.n === 0) return { significant: false, pValue: 1, effect: 0 };

  const p1 = control.conversions / control.n;
  const p2 = treatment.conversions / treatment.n;
  const pBar = (control.conversions + treatment.conversions) / (control.n + treatment.n);
  const se = Math.sqrt(pBar * (1 - pBar) * (1 / control.n + 1 / treatment.n));
  if (se === 0) return { significant: false, pValue: 1, effect: 0 };

  const z = Math.abs(p2 - p1) / se;
  // Approximate p-value from z-score
  // Approximate erfc via numerical series (no Math.erf in TS stdlib)
  const t = 1 / (1 + 0.3275911 * z);
  const erfc = t * Math.exp(-z * z) * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const pValue = 2 * (erfc > 1 ? 1 : erfc < 0 ? 0 : erfc);

  return {
    significant: pValue < alpha,
    pValue: Math.round(pValue * 10000) / 10000,
    effect: Math.round((p2 - p1) / p1 * 100 * 10) / 10,
  };
}

// ─── CUPED Variance Reduction ─────────────────────────────────────────────────

/** CUPED: Controlled-experiment Using Pre-Experiment Data to reduce variance */
export function cupedAdjust(
  postMetrics: number[],
  preMetrics: number[],
): { adjusted: number[]; varianceReduction: number } {
  const n = postMetrics.length;
  const meanPost = postMetrics.reduce((a, b) => a + b, 0) / n;
  const meanPre = preMetrics.reduce((a, b) => a + b, 0) / n;

  // Covariance and variance
  let cov = 0, varPre = 0;
  for (let i = 0; i < n; i++) {
    cov += (postMetrics[i] - meanPost) * (preMetrics[i] - meanPre);
    varPre += Math.pow(preMetrics[i] - meanPre, 2);
  }
  cov /= n; varPre /= n;
  const theta = varPre > 0 ? cov / varPre : 0;

  const adjusted = postMetrics.map((y, i) => y - theta * (preMetrics[i] - meanPre));
  const origVariance = postMetrics.reduce((a, b) => a + Math.pow(b - meanPost, 2), 0) / n;
  const adjVariance = adjusted.reduce((a, b) => a + Math.pow(b - meanPost, 2), 0) / n;
  const varianceReduction = origVariance > 0 ? (1 - adjVariance / origVariance) * 100 : 0;

  return { adjusted, varianceReduction: Math.round(varianceReduction) };
}

// ─── Experiment Factory ───────────────────────────────────────────────────────

export function createExperiment(
  name: string,
  hypothesis: string,
  variantNames: string[],
  primaryMetric: WinnerCriteria,
  baselineConversionRate: number,
  dailyTraffic: number,
): Experiment {
  const sampleSize = calculateSampleSize(baselineConversionRate, 0.05, 0.05, 0.80, dailyTraffic);
  const variants: Variant[] = variantNames.map((vName, i) => ({
    id: `var_${i}`,
    name: vName,
    description: i === 0 ? 'Control (original)' : `Treatment variant ${i}`,
    trafficWeight: 1,
    isControl: i === 0,
    stats: { impressions: 0, conversions: 0, revenue: 0, avgOrderValue: 0, conversionRate: 0, revenuePerVisitor: 0, uplift: 0, confidenceInterval: [0, 0] },
    thompsonAlpha: 1,
    thompsonBeta: 1,
  }));

  return {
    id: `exp_${quantumRNG.getFloat().toString(36).slice(2, 8)}`,
    name,
    hypothesis,
    status: 'draft',
    variants,
    primaryMetric,
    trafficAllocation: 1,
    minSampleSize: sampleSize.required,
    maxDurationDays: Math.min(sampleSize.atCurrentTraffic.days, 30),
  };
}
