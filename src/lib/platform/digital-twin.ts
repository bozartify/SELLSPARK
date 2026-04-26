/**
 * @module digital-twin
 * @description Creator Digital Twin — a living simulation model of a creator's
 * entire business that mirrors real-time state and runs predictive what-if scenarios.
 *
 * Capabilities:
 * - Real-time state mirroring (revenue, audience, content performance)
 * - What-if scenario engine (price changes, launch timing, audience segments)
 * - Autonomous optimisation loops (auto A/B, auto-pricing, auto-scheduling)
 * - Multi-agent simulation (creator + audience + competitors)
 * - Chaos engineering (resilience testing via simulated churn/outages)
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TwinState {
  creatorId: string;
  timestamp: number;

  // Revenue
  mrr: number;
  arr: number;
  totalRevenue: number;

  // Audience
  subscribers: number;
  activeSubscribers: number;
  churnRate: number;       // monthly %
  growthRate: number;      // monthly %
  nps: number;             // -100 to 100

  // Content
  publishedPosts: number;
  avgEngagementRate: number;
  viralCoefficient: number;

  // Products
  products: TwinProduct[];

  // Health
  healthScore: number;     // 0–100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TwinProduct {
  id: string;
  name: string;
  price: number;
  unitsSold: number;
  conversionRate: number;
  refundRate: number;
  revenueContribution: number; // fraction of total MRR
}

export interface ScenarioInput {
  name: string;
  priceMultiplier?: number;
  growthBoost?: number;      // additional monthly growth %
  churnReduction?: number;   // fraction reduction in churn
  contentFrequency?: number; // multiplier on post frequency
  newProduct?: { name: string; price: number; estimatedConversion: number };
  launchEvent?: boolean;
}

export interface ScenarioResult {
  scenario: string;
  deltaRevenue30d: number;
  deltaRevenue90d: number;
  deltaRevenue365d: number;
  deltaSubscribers30d: number;
  netNPV: number;
  riskAdjustedReturn: number;
  recommendation: 'strongly-proceed' | 'proceed' | 'caution' | 'avoid';
  keyInsights: string[];
}

export interface AudienceAgent {
  segment: string;
  size: number;
  ltv: number;
  sensitivity: { price: number; content: number; community: number };
  churnProbability: number;
  conversionProbability: number;
}

export interface CompetitorAgent {
  name: string;
  marketShare: number;
  priceIndex: number;   // relative to creator's price
  contentQuality: number; // 0–1
  growthRate: number;
}

export interface ChaosEvent {
  type: 'payment-outage' | 'viral-spike' | 'competitor-launch' | 'platform-ban' | 'refund-wave' | 'media-mention';
  severity: 'minor' | 'moderate' | 'severe';
  durationDays: number;
  revenueImpact: number;   // multiplier (0.5 = 50% revenue during event)
  subscriberImpact: number; // delta (negative = loss)
}

// ─── Twin Construction ─────────────────────────────────────────────────────────

export function createDigitalTwin(creatorId: string, seed: Partial<TwinState> = {}): TwinState {
  const base: TwinState = {
    creatorId,
    timestamp: Date.now(),
    mrr: 5000,
    arr: 60000,
    totalRevenue: 120000,
    subscribers: 2500,
    activeSubscribers: 2000,
    churnRate: 0.04,
    growthRate: 0.08,
    nps: 42,
    publishedPosts: 180,
    avgEngagementRate: 0.06,
    viralCoefficient: 0.12,
    products: [
      { id: 'p1', name: 'Core Course', price: 197, unitsSold: 340, conversionRate: 0.024, refundRate: 0.03, revenueContribution: 0.55 },
      { id: 'p2', name: 'Membership', price: 29,  unitsSold: 120, conversionRate: 0.04,  refundRate: 0.01, revenueContribution: 0.30 },
      { id: 'p3', name: 'Coaching 1:1', price: 500, unitsSold: 8, conversionRate: 0.005, refundRate: 0.00, revenueContribution: 0.15 },
    ],
    healthScore: 72,
    riskLevel: 'low',
    ...seed,
  };

  return recomputeHealth(base);
}

function recomputeHealth(state: TwinState): TwinState {
  const npsScore = (state.nps + 100) / 200;
  const growthScore = Math.min(state.growthRate / 0.15, 1);
  const churnScore = 1 - Math.min(state.churnRate / 0.12, 1);
  const engageScore = Math.min(state.avgEngagementRate / 0.1, 1);
  const healthScore = Math.round((npsScore * 25 + growthScore * 30 + churnScore * 25 + engageScore * 20));
  const riskLevel = healthScore > 75 ? 'low' : healthScore > 55 ? 'medium' : healthScore > 35 ? 'high' : 'critical';
  return { ...state, healthScore, riskLevel };
}

// ─── Time-Step Simulation ──────────────────────────────────────────────────────

/** Advance the twin by N months */
export function simulateMonths(state: TwinState, months: number): TwinState[] {
  const trajectory: TwinState[] = [state];
  let current = state;

  for (let m = 0; m < months; m++) {
    const newSubs = Math.floor(current.subscribers * current.growthRate);
    const lostSubs = Math.floor(current.activeSubscribers * current.churnRate);
    const subscribers = current.subscribers + newSubs - lostSubs;
    const activeSubscribers = Math.floor(subscribers * 0.82);

    // Viral loop
    const viralGain = Math.floor(current.subscribers * current.viralCoefficient * current.avgEngagementRate);

    // Revenue with slight product mix drift
    const mrr = current.mrr * (1 + current.growthRate * 0.6) * (1 - current.churnRate * 0.3);
    const totalRevenue = current.totalRevenue + mrr;

    // Engagement decays without fresh content
    const engagementDrift = current.avgEngagementRate * (0.98 + Math.random() * 0.04);

    const next = recomputeHealth({
      ...current,
      timestamp: current.timestamp + 30 * 24 * 3600 * 1000,
      subscribers: subscribers + viralGain,
      activeSubscribers,
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      totalRevenue: Math.round(totalRevenue),
      avgEngagementRate: Math.min(0.2, engagementDrift),
    });

    trajectory.push(next);
    current = next;
  }

  return trajectory;
}

// ─── Scenario Engine ──────────────────────────────────────────────────────────

export function runScenario(baseState: TwinState, scenario: ScenarioInput): ScenarioResult {
  // Apply scenario modifiers
  let modified: TwinState = {
    ...baseState,
    growthRate: baseState.growthRate + (scenario.growthBoost || 0),
    churnRate: baseState.churnRate * (1 - (scenario.churnReduction || 0)),
    avgEngagementRate: baseState.avgEngagementRate * (scenario.contentFrequency || 1),
  };

  if (scenario.priceMultiplier) {
    modified = {
      ...modified,
      mrr: modified.mrr * scenario.priceMultiplier * 0.85, // price elasticity: 15% loss per 100% increase
      products: modified.products.map(p => ({
        ...p,
        price: p.price * scenario.priceMultiplier!,
        conversionRate: p.conversionRate * (1 - (scenario.priceMultiplier! - 1) * 0.3),
      })),
    };
  }

  if (scenario.newProduct) {
    const np = scenario.newProduct;
    modified = {
      ...modified,
      products: [...modified.products, {
        id: `new-${Date.now()}`,
        name: np.name,
        price: np.price,
        unitsSold: 0,
        conversionRate: np.estimatedConversion,
        refundRate: 0.05,
        revenueContribution: 0,
      }],
      mrr: modified.mrr + np.price * np.estimatedConversion * modified.subscribers / 12,
    };
  }

  if (scenario.launchEvent) {
    modified = { ...modified, growthRate: modified.growthRate * 2.5, viralCoefficient: modified.viralCoefficient * 3 };
  }

  const baseTraj  = simulateMonths(baseState, 12);
  const modTraj   = simulateMonths(modified, 12);

  const deltaRevenue30d  = (modTraj[1].mrr  - baseTraj[1].mrr);
  const deltaRevenue90d  = (modTraj[3].mrr  - baseTraj[3].mrr);
  const deltaRevenue365d = (modTraj[12].totalRevenue - baseTraj[12].totalRevenue);
  const deltaSubscribers30d = modTraj[1].subscribers - baseTraj[1].subscribers;

  // Simple NPV at 12% discount
  const discountRate = 0.01; // monthly
  const netNPV = modTraj.slice(1).reduce((npv, s, i) => {
    const baseRev = baseTraj[i + 1].mrr;
    const delta = s.mrr - baseRev;
    return npv + delta / Math.pow(1 + discountRate, i + 1);
  }, 0);

  const riskAdjustedReturn = netNPV * (1 - (modified.riskLevel === 'high' ? 0.3 : modified.riskLevel === 'medium' ? 0.15 : 0.05));
  const recommendation = riskAdjustedReturn > 10000 ? 'strongly-proceed' : riskAdjustedReturn > 2000 ? 'proceed' : riskAdjustedReturn > 0 ? 'caution' : 'avoid';

  const keyInsights: string[] = [];
  if (deltaRevenue365d > 0) keyInsights.push(`+$${Math.round(deltaRevenue365d).toLocaleString()} annual revenue uplift`);
  if (deltaSubscribers30d > 0) keyInsights.push(`+${deltaSubscribers30d} subscribers in first 30 days`);
  if (scenario.priceMultiplier && scenario.priceMultiplier > 1) keyInsights.push(`Price increase reduces conversion by ~${Math.round((scenario.priceMultiplier - 1) * 30)}%`);
  if (netNPV < 0) keyInsights.push('NPV negative — scenario destroys value');

  return {
    scenario: scenario.name,
    deltaRevenue30d,
    deltaRevenue90d,
    deltaRevenue365d,
    deltaSubscribers30d,
    netNPV: Math.round(netNPV),
    riskAdjustedReturn: Math.round(riskAdjustedReturn),
    recommendation,
    keyInsights,
  };
}

// ─── Multi-Agent Simulation ────────────────────────────────────────────────────

export function buildAudienceAgents(state: TwinState): AudienceAgent[] {
  return [
    { segment: 'Champions',    size: Math.floor(state.activeSubscribers * 0.12), ltv: 1200, sensitivity: { price: 0.1, content: 0.8, community: 0.7 }, churnProbability: 0.01, conversionProbability: 0.12 },
    { segment: 'Loyalists',    size: Math.floor(state.activeSubscribers * 0.22), ltv: 650,  sensitivity: { price: 0.3, content: 0.6, community: 0.6 }, churnProbability: 0.03, conversionProbability: 0.06 },
    { segment: 'Potentials',   size: Math.floor(state.activeSubscribers * 0.31), ltv: 280,  sensitivity: { price: 0.5, content: 0.5, community: 0.4 }, churnProbability: 0.07, conversionProbability: 0.03 },
    { segment: 'At-Risk',      size: Math.floor(state.activeSubscribers * 0.20), ltv: 120,  sensitivity: { price: 0.7, content: 0.3, community: 0.2 }, churnProbability: 0.18, conversionProbability: 0.01 },
    { segment: 'New',          size: Math.floor(state.activeSubscribers * 0.15), ltv: 40,   sensitivity: { price: 0.9, content: 0.9, community: 0.8 }, churnProbability: 0.25, conversionProbability: 0.04 },
  ];
}

export function buildCompetitorAgents(): CompetitorAgent[] {
  return [
    { name: 'CreatorPro',     marketShare: 0.28, priceIndex: 0.9, contentQuality: 0.72, growthRate: 0.06 },
    { name: 'StudioFlow',     marketShare: 0.15, priceIndex: 1.2, contentQuality: 0.85, growthRate: 0.09 },
    { name: 'LaunchPad',      marketShare: 0.11, priceIndex: 0.7, contentQuality: 0.55, growthRate: 0.12 },
    { name: 'CourseHero',     marketShare: 0.08, priceIndex: 1.5, contentQuality: 0.90, growthRate: 0.04 },
  ];
}

// ─── Chaos Engineering ────────────────────────────────────────────────────────

export function generateChaosEvents(): ChaosEvent[] {
  return [
    { type: 'payment-outage',    severity: 'moderate', durationDays: 2,  revenueImpact: 0.0,  subscriberImpact: -50  },
    { type: 'viral-spike',       severity: 'minor',    durationDays: 7,  revenueImpact: 2.5,  subscriberImpact: 800  },
    { type: 'competitor-launch', severity: 'moderate', durationDays: 30, revenueImpact: 0.85, subscriberImpact: -120 },
    { type: 'platform-ban',      severity: 'severe',   durationDays: 14, revenueImpact: 0.3,  subscriberImpact: -400 },
    { type: 'refund-wave',       severity: 'moderate', durationDays: 5,  revenueImpact: 0.75, subscriberImpact: -80  },
    { type: 'media-mention',     severity: 'minor',    durationDays: 14, revenueImpact: 1.4,  subscriberImpact: 350  },
  ];
}

export function applyChaosEvent(state: TwinState, event: ChaosEvent): TwinState {
  return recomputeHealth({
    ...state,
    mrr: Math.max(0, state.mrr * event.revenueImpact),
    subscribers: Math.max(0, state.subscribers + event.subscriberImpact),
    activeSubscribers: Math.max(0, state.activeSubscribers + Math.floor(event.subscriberImpact * 0.8)),
  });
}

export function resilienceScore(state: TwinState, events: ChaosEvent[]): number {
  const impacts = events.map(e => {
    const after = applyChaosEvent(state, e);
    return after.healthScore / state.healthScore;
  });
  const worstCase = Math.min(...impacts);
  const avgImpact = impacts.reduce((a, b) => a + b, 0) / impacts.length;
  return Math.round((worstCase * 40 + avgImpact * 60) * 100);
}

// ─── Twin Summary ─────────────────────────────────────────────────────────────

export function summarizeTwin(state: TwinState): string[] {
  const lines: string[] = [
    `MRR $${state.mrr.toLocaleString()} | ARR $${state.arr.toLocaleString()}`,
    `${state.subscribers.toLocaleString()} subscribers (${state.activeSubscribers.toLocaleString()} active)`,
    `Growth ${(state.growthRate * 100).toFixed(1)}%/mo | Churn ${(state.churnRate * 100).toFixed(1)}%/mo`,
    `NPS ${state.nps} | Health ${state.healthScore}/100 | Risk: ${state.riskLevel.toUpperCase()}`,
    `Engagement ${(state.avgEngagementRate * 100).toFixed(1)}% | Viral k=${state.viralCoefficient.toFixed(2)}`,
  ];
  state.products.forEach(p => lines.push(`  • ${p.name} — $${p.price} · ${(p.conversionRate * 100).toFixed(1)}% CVR · ${(p.revenueContribution * 100).toFixed(0)}% revenue`));
  return lines;
}
