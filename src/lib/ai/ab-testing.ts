/**
 * AI A/B Testing Engine
 *
 * Automatically generates and tests:
 * - Headlines & copy variations
 * - Pricing experiments
 * - Layout/design variants
 * - CTA button text/color
 * - Email subject lines
 *
 * Uses multi-armed bandit (Thompson Sampling) for optimal exploration/exploitation.
 */

export interface Variant {
  id: string;
  name: string;
  content: string | Record<string, unknown>;
  impressions: number;
  conversions: number;
  revenue: number;
}

export interface Experiment {
  id: string;
  name: string;
  type: 'headline' | 'pricing' | 'cta' | 'layout' | 'email_subject' | 'product_image';
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  winner: string | null;
  confidence: number;
  startDate: string;
  endDate: string | null;
  trafficSplit: number[]; // percentage per variant
}

export interface ExperimentResult {
  experimentId: string;
  winner: Variant;
  confidence: number;
  uplift: number; // percentage improvement
  recommendations: string[];
}

// ─── Thompson Sampling (Bayesian Multi-Armed Bandit) ────────────────────────
function betaSample(alpha: number, beta: number): number {
  // Approximation using the Joehnk algorithm
  let u1: number, u2: number, s: number;
  do {
    u1 = Math.pow(Math.random(), 1 / alpha);
    u2 = Math.pow(Math.random(), 1 / beta);
    s = u1 + u2;
  } while (s === 0 || s > 1);
  return u1 / s;
}

export class ABTestingEngine {
  private experiments: Map<string, Experiment> = new Map();

  createExperiment(config: {
    name: string;
    type: Experiment['type'];
    variants: Array<{ name: string; content: string | Record<string, unknown> }>;
  }): Experiment {
    const experiment: Experiment = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: config.name,
      type: config.type,
      status: 'running',
      variants: config.variants.map((v, i) => ({
        id: `var_${i}`,
        name: v.name,
        content: v.content,
        impressions: 0,
        conversions: 0,
        revenue: 0,
      })),
      winner: null,
      confidence: 0,
      startDate: new Date().toISOString(),
      endDate: null,
      trafficSplit: config.variants.map(() => 100 / config.variants.length),
    };
    this.experiments.set(experiment.id, experiment);
    return experiment;
  }

  // Thompson Sampling: select the best variant to show
  selectVariant(experimentId: string): Variant | null {
    const exp = this.experiments.get(experimentId);
    if (!exp || exp.status !== 'running') return null;

    let bestScore = -1;
    let bestVariant: Variant | null = null;

    for (const variant of exp.variants) {
      const alpha = variant.conversions + 1;
      const beta = variant.impressions - variant.conversions + 1;
      const score = betaSample(alpha, beta);

      if (score > bestScore) {
        bestScore = score;
        bestVariant = variant;
      }
    }

    if (bestVariant) bestVariant.impressions++;
    return bestVariant;
  }

  recordConversion(experimentId: string, variantId: string, revenue: number = 0): void {
    const exp = this.experiments.get(experimentId);
    if (!exp) return;

    const variant = exp.variants.find(v => v.id === variantId);
    if (variant) {
      variant.conversions++;
      variant.revenue += revenue;
    }

    // Auto-detect winner with 95% confidence
    this.checkForWinner(experimentId);
  }

  private checkForWinner(experimentId: string): void {
    const exp = this.experiments.get(experimentId);
    if (!exp || exp.variants.length < 2) return;

    const totalImpressions = exp.variants.reduce((s, v) => s + v.impressions, 0);
    if (totalImpressions < 100) return; // Need minimum sample

    // Calculate Z-score for statistical significance
    const rates = exp.variants.map(v =>
      v.impressions > 0 ? v.conversions / v.impressions : 0
    );
    const best = Math.max(...rates);
    const bestIdx = rates.indexOf(best);
    const second = Math.max(...rates.filter((_, i) => i !== bestIdx));

    const n1 = exp.variants[bestIdx].impressions;
    const p1 = rates[bestIdx];
    const p2 = second;

    if (n1 === 0) return;
    const pooledP = (p1 + p2) / 2;
    const se = Math.sqrt(pooledP * (1 - pooledP) * (2 / n1));
    const zScore = se > 0 ? (p1 - p2) / se : 0;

    const confidence = this.zToConfidence(zScore);
    exp.confidence = confidence;

    if (confidence >= 0.95 && totalImpressions >= 200) {
      exp.winner = exp.variants[bestIdx].id;
      exp.status = 'completed';
      exp.endDate = new Date().toISOString();
    }
  }

  private zToConfidence(z: number): number {
    // Approximation of normal CDF
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = z < 0 ? -1 : 1;
    const x = Math.abs(z) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
  }

  getResults(experimentId: string): ExperimentResult | null {
    const exp = this.experiments.get(experimentId);
    if (!exp) return null;

    const sorted = [...exp.variants].sort((a, b) => {
      const rateA = a.impressions > 0 ? a.conversions / a.impressions : 0;
      const rateB = b.impressions > 0 ? b.conversions / b.impressions : 0;
      return rateB - rateA;
    });

    const winner = sorted[0];
    const second = sorted[1];
    const winRate = winner.impressions > 0 ? winner.conversions / winner.impressions : 0;
    const secondRate = second?.impressions > 0 ? second.conversions / second.impressions : 0;
    const uplift = secondRate > 0 ? ((winRate - secondRate) / secondRate) * 100 : 0;

    return {
      experimentId,
      winner,
      confidence: exp.confidence,
      uplift,
      recommendations: this.generateRecommendations(exp, winner),
    };
  }

  private generateRecommendations(exp: Experiment, winner: Variant): string[] {
    const recs: string[] = [];
    const winRate = winner.impressions > 0 ? (winner.conversions / winner.impressions * 100).toFixed(1) : '0';

    recs.push(`"${winner.name}" is converting at ${winRate}% — deploy to 100% of traffic.`);

    if (exp.type === 'pricing') {
      recs.push('Consider testing a higher price point next — you may have more pricing power.');
    }
    if (exp.type === 'headline') {
      recs.push('Test emotional vs. data-driven headlines in the next experiment.');
    }
    if (exp.type === 'cta') {
      recs.push('Try changing CTA color along with text for the next test.');
    }

    return recs;
  }

  // ─── Auto-Generate Experiment Variants ──────────────────────────────────
  generateHeadlineVariants(original: string): string[] {
    const variants = [original];
    // Question variant
    variants.push(original.replace(/^(.+)$/, 'Want to $1?').replace(/ {2}/g, ' '));
    // Numbers variant
    variants.push(`The #1 Way to ${original}`);
    // Urgency variant
    variants.push(`${original} (Limited Time)`);
    // Social proof variant
    variants.push(`Join 10,000+ People Who ${original}`);
    return variants;
  }

  generatePricingVariants(basePrice: number): number[] {
    return [
      Math.round(basePrice * 0.8),   // 20% lower
      basePrice,                      // original
      Math.round(basePrice * 1.15),   // 15% higher
      basePrice - 2,                  // charm pricing
      Math.round(basePrice * 1.3),    // premium test
    ];
  }
}

export const abTestingEngine = new ABTestingEngine();
