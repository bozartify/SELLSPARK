/**
 * @module analytics-engine
 * @description Deep analytics engine: cohort analysis, LTV prediction,
 * attribution modeling, funnel visualization, revenue forecasting,
 * and real-time event streaming for the SellSpark creator OS.
 */

// ─── Cohort Analysis ──────────────────────────────────────────────────────────

export interface Cohort {
  cohortId: string;
  cohortMonth: string; // e.g. '2025-01'
  initialSize: number;
  retentionByWeek: number[]; // index 0-12, value = fraction retained
  avgLTV: number;
  churnRate: number; // monthly, 0-1
}

/**
 * Build synthetic cohorts for the past `months` months.
 */
export function buildCohorts(months: number): Cohort[] {
  const now = new Date();
  const cohorts: Cohort[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cohortMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const initialSize = Math.round(80 + Math.random() * 120);
    const baseChurn = 0.04 + Math.random() * 0.06;

    // Retention decays each week; week 0 is always 1.0
    const retentionByWeek: number[] = [1.0];
    for (let w = 1; w <= 12; w++) {
      const prev = retentionByWeek[w - 1];
      const weeklyChurn = baseChurn / 4 + Math.random() * 0.01;
      retentionByWeek.push(Math.max(0, prev - weeklyChurn));
    }

    const avgLTV = Math.round((1 / baseChurn) * (29 + Math.random() * 70));

    cohorts.push({
      cohortId: `cohort-${cohortMonth}`,
      cohortMonth,
      initialSize,
      retentionByWeek,
      avgLTV,
      churnRate: baseChurn,
    });
  }

  return cohorts;
}

/**
 * Compute a retention matrix: rows = cohorts, cols = weeks 0-12.
 * Values are percentages (0-100).
 */
export function computeRetentionMatrix(cohorts: Cohort[]): number[][] {
  return cohorts.map((c) =>
    c.retentionByWeek.map((r) => Math.round(r * 100))
  );
}

// ─── LTV Prediction ───────────────────────────────────────────────────────────

export interface LTVPrediction {
  subscriberId: string;
  predictedLTV: number;
  confidence: number; // 0-1
  horizon: 30 | 90 | 180 | 365;
  factors: string[];
}

/**
 * Predict LTV using: LTV = mrr × (1/churnRate) × (1 + engagementBonus)
 * churnRate derived from tenure; engagementBonus from score and productCount.
 */
export function predictLTV(
  mrr: number,
  tenure: number, // months
  engagementScore: number, // 0-100
  productCount: number,
  horizon: 30 | 90 | 180 | 365 = 365
): LTVPrediction {
  // Inferred monthly churn: decreases as tenure grows (sticky subscribers)
  const baseChurn = Math.max(0.02, 0.12 - tenure * 0.002);

  // Engagement bonus: up to 0.5 extra multiplier
  const engagementBonus = (engagementScore / 100) * 0.5;

  // Product diversity bonus
  const productBonus = Math.min(productCount * 0.05, 0.3);

  const lifetimeMonths = 1 / baseChurn;
  const rawLTV = mrr * lifetimeMonths * (1 + engagementBonus + productBonus);

  // Scale to horizon
  const horizonMonths = horizon / 30;
  const predictedLTV = Math.min(rawLTV, mrr * horizonMonths) * (horizon / 365);

  // Confidence grows with tenure and engagement
  const confidence = Math.min(0.95, 0.5 + tenure * 0.01 + engagementScore * 0.003);

  const factors: string[] = [];
  if (engagementScore > 70) factors.push('High engagement');
  if (tenure > 12) factors.push('Loyal subscriber');
  if (productCount >= 3) factors.push('Multi-product customer');
  if (baseChurn < 0.05) factors.push('Low churn risk');
  if (mrr > 100) factors.push('High MRR tier');

  return {
    subscriberId: `sub-${Date.now()}`,
    predictedLTV: Math.round(predictedLTV * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    horizon,
    factors: factors.length ? factors : ['Standard prediction'],
  };
}

// ─── Attribution Modeling ─────────────────────────────────────────────────────

export type AttributionModel =
  | 'first-touch'
  | 'last-touch'
  | 'linear'
  | 'time-decay'
  | 'data-driven';

export interface TouchPoint {
  channel: string;
  timestamp: number; // unix ms
  weight: number; // computed weight, 0-1; sum across touchpoints = 1
}

const CHANNELS = ['Organic Search', 'Paid Social', 'Email', 'Direct', 'Referral', 'YouTube'];

/**
 * Attribute `amount` across `touchpoints` using the given model.
 * Returns touchpoints with computed weights (and implicit revenue = weight × amount).
 */
export function attributeRevenue(
  touchpoints: TouchPoint[],
  amount: number,
  model: AttributionModel
): TouchPoint[] {
  if (touchpoints.length === 0) return [];

  const sorted = [...touchpoints].sort((a, b) => a.timestamp - b.timestamp);
  const n = sorted.length;
  let rawWeights: number[];

  switch (model) {
    case 'first-touch':
      rawWeights = sorted.map((_, i) => (i === 0 ? 1 : 0));
      break;

    case 'last-touch':
      rawWeights = sorted.map((_, i) => (i === n - 1 ? 1 : 0));
      break;

    case 'linear':
      rawWeights = sorted.map(() => 1 / n);
      break;

    case 'time-decay': {
      // Weight decays exponentially toward earlier touches
      const halfLife = 7 * 24 * 60 * 60 * 1000; // 7-day half-life in ms
      const lastTs = sorted[n - 1].timestamp;
      rawWeights = sorted.map((tp) => {
        const daysDiff = (lastTs - tp.timestamp) / halfLife;
        return Math.pow(2, -daysDiff);
      });
      break;
    }

    case 'data-driven': {
      // Pseudo data-driven: channels weighted by typical empirical contribution
      const channelPriors: Record<string, number> = {
        'Organic Search': 0.28,
        'Paid Social': 0.22,
        Email: 0.20,
        Direct: 0.15,
        Referral: 0.10,
        YouTube: 0.05,
      };
      rawWeights = sorted.map((tp) => channelPriors[tp.channel] ?? 0.1);
      break;
    }
  }

  const total = rawWeights.reduce((a, b) => a + b, 0) || 1;
  return sorted.map((tp, i) => ({
    ...tp,
    weight: Math.round((rawWeights[i] / total) * 10000) / 10000,
  }));
}

/**
 * Generate a representative set of touchpoints for demo purposes.
 */
export function generateMockTouchpoints(): TouchPoint[] {
  const now = Date.now();
  return CHANNELS.slice(0, 4 + Math.floor(Math.random() * 3)).map((channel, i) => ({
    channel,
    timestamp: now - (6 - i) * 2 * 24 * 60 * 60 * 1000,
    weight: 0,
  }));
}

export { CHANNELS };

// ─── Funnel Visualization ─────────────────────────────────────────────────────

export interface FunnelStage {
  name: string;
  users: number;
  conversionRate: number; // % to next stage
  avgTimeSeconds: number;
  dropoffReasons: string[];
  cumulativeConversion?: number; // added by buildFunnel
}

/**
 * Enrich stages with cumulative conversion from top of funnel.
 */
export function buildFunnel(stages: FunnelStage[]): FunnelStage[] {
  if (stages.length === 0) return [];
  const topUsers = stages[0].users;
  return stages.map((stage) => ({
    ...stage,
    cumulativeConversion: Math.round((stage.users / topUsers) * 100 * 10) / 10,
  }));
}

export const MOCK_FUNNELS: Record<string, FunnelStage[]> = {
  'Product Purchase': buildFunnel([
    {
      name: 'Landing Page',
      users: 10000,
      conversionRate: 42,
      avgTimeSeconds: 45,
      dropoffReasons: ['Slow load time', 'Unclear value prop', 'No social proof'],
    },
    {
      name: 'Product Detail',
      users: 4200,
      conversionRate: 58,
      avgTimeSeconds: 120,
      dropoffReasons: ['Price shock', 'Missing info', 'Comparison shopping'],
    },
    {
      name: 'Add to Cart',
      users: 2436,
      conversionRate: 71,
      avgTimeSeconds: 30,
      dropoffReasons: ['Changed mind', 'Account required'],
    },
    {
      name: 'Checkout',
      users: 1730,
      conversionRate: 82,
      avgTimeSeconds: 180,
      dropoffReasons: ['Payment friction', 'Trust concerns'],
    },
    {
      name: 'Purchase',
      users: 1419,
      conversionRate: 100,
      avgTimeSeconds: 0,
      dropoffReasons: [],
    },
  ]),

  'Course Enrollment': buildFunnel([
    {
      name: 'Sales Page',
      users: 8000,
      conversionRate: 38,
      avgTimeSeconds: 90,
      dropoffReasons: ['Too long', 'No preview', 'Unclear outcome'],
    },
    {
      name: 'Curriculum View',
      users: 3040,
      conversionRate: 55,
      avgTimeSeconds: 200,
      dropoffReasons: ['Too advanced', 'Too basic', 'Time commitment'],
    },
    {
      name: 'Pricing Page',
      users: 1672,
      conversionRate: 68,
      avgTimeSeconds: 60,
      dropoffReasons: ['Price too high', 'No payment plan'],
    },
    {
      name: 'Checkout',
      users: 1137,
      conversionRate: 89,
      avgTimeSeconds: 150,
      dropoffReasons: ['Technical error', 'Card declined'],
    },
    {
      name: 'Enrolled',
      users: 1012,
      conversionRate: 100,
      avgTimeSeconds: 0,
      dropoffReasons: [],
    },
  ]),

  'Membership Upgrade': buildFunnel([
    {
      name: 'Upgrade Prompt',
      users: 5000,
      conversionRate: 31,
      avgTimeSeconds: 20,
      dropoffReasons: ['Not ready', 'Ignored', 'Dismissed'],
    },
    {
      name: 'Benefits Page',
      users: 1550,
      conversionRate: 62,
      avgTimeSeconds: 80,
      dropoffReasons: ['Benefits not compelling', 'Already on trial'],
    },
    {
      name: 'Plan Selector',
      users: 961,
      conversionRate: 74,
      avgTimeSeconds: 45,
      dropoffReasons: ['Annual vs monthly confusion'],
    },
    {
      name: 'Payment',
      users: 711,
      conversionRate: 91,
      avgTimeSeconds: 120,
      dropoffReasons: ['Card issues'],
    },
    {
      name: 'Upgraded',
      users: 647,
      conversionRate: 100,
      avgTimeSeconds: 0,
      dropoffReasons: [],
    },
  ]),
};

// ─── Revenue Forecasting ──────────────────────────────────────────────────────

export interface ForecastPoint {
  month: string; // e.g. '2025-07'
  predicted: number;
  lower: number;
  upper: number;
  confidence: number; // 0-1
}

/**
 * Simple OLS linear regression: returns slope and intercept.
 */
function linearRegression(y: number[]): { slope: number; intercept: number; r2: number } {
  const n = y.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = (n - 1) / 2;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let ssxy = 0;
  let ssxx = 0;
  let ssyy = 0;
  for (let i = 0; i < n; i++) {
    ssxy += (xs[i] - xMean) * (y[i] - yMean);
    ssxx += (xs[i] - xMean) ** 2;
    ssyy += (y[i] - yMean) ** 2;
  }

  const slope = ssxx !== 0 ? ssxy / ssxx : 0;
  const intercept = yMean - slope * xMean;
  const r2 = ssyy !== 0 ? (ssxy ** 2) / (ssxx * ssyy) : 0;

  return { slope, intercept, r2 };
}

/**
 * Forecast `months` months of MRR from `historicalMRR` using linear regression.
 * Confidence intervals widen with forecast horizon.
 */
export function forecastRevenue(historicalMRR: number[], months: number): ForecastPoint[] {
  const { slope, intercept, r2 } = linearRegression(historicalMRR);
  const n = historicalMRR.length;

  // Residual std dev for CI
  const residuals = historicalMRR.map((v, i) => v - (intercept + slope * i));
  const mse = residuals.reduce((a, b) => a + b ** 2, 0) / Math.max(n - 2, 1);
  const stdErr = Math.sqrt(mse);

  const now = new Date();
  const points: ForecastPoint[] = [];

  for (let i = 1; i <= months; i++) {
    const x = n - 1 + i;
    const predicted = Math.max(0, intercept + slope * x);
    const horizonFactor = 1 + (i / months) * 1.5; // wider CI further out
    const ci = stdErr * horizonFactor * 1.96;
    const confidence = Math.max(0.3, r2 * (1 - i / (months * 2)));

    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    points.push({
      month,
      predicted: Math.round(predicted),
      lower: Math.round(Math.max(0, predicted - ci)),
      upper: Math.round(predicted + ci),
      confidence: Math.round(confidence * 100) / 100,
    });
  }

  return points;
}

// ─── Real-time Event Stream ───────────────────────────────────────────────────

export const EVENT_TYPES = [
  'page_view',
  'add_to_cart',
  'checkout_start',
  'purchase',
  'refund',
  'subscribe',
  'churn',
  'share',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface AnalyticsEvent {
  eventId: string;
  type: EventType;
  userId: string;
  properties: Record<string, string | number | boolean>;
  timestamp: number;
}

const MOCK_PRODUCTS = ['AI Writing Kit', '12-Week Program', 'VIP Membership', 'Creator Bundle'];
const MOCK_CHANNELS_EVT = ['email', 'organic', 'paid', 'direct', 'referral'];

/**
 * Generate `count` synthetic analytics events spread over the past hour.
 */
export function generateMockEventStream(count: number): AnalyticsEvent[] {
  const now = Date.now();
  const events: AnalyticsEvent[] = [];

  for (let i = 0; i < count; i++) {
    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const timestamp = now - Math.floor(Math.random() * 3600 * 1000);

    const properties: Record<string, string | number | boolean> = {
      channel: MOCK_CHANNELS_EVT[Math.floor(Math.random() * MOCK_CHANNELS_EVT.length)],
      sessionId: `sess-${Math.random().toString(36).slice(2, 10)}`,
    };

    if (type === 'purchase' || type === 'add_to_cart' || type === 'checkout_start') {
      properties.product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
      properties.amount = Math.round((29 + Math.random() * 470) * 100) / 100;
    }
    if (type === 'refund') {
      properties.amount = Math.round((20 + Math.random() * 200) * 100) / 100;
      properties.reason = ['Quality', 'Accidental', 'Not as described'][Math.floor(Math.random() * 3)];
    }
    if (type === 'page_view') {
      properties.page = ['/', '/products', '/courses', '/membership', '/checkout'][
        Math.floor(Math.random() * 5)
      ];
      properties.durationSeconds = Math.round(10 + Math.random() * 300);
    }
    if (type === 'subscribe' || type === 'churn') {
      properties.plan = ['basic', 'pro', 'enterprise'][Math.floor(Math.random() * 3)];
      properties.mrr = [29, 79, 199][Math.floor(Math.random() * 3)];
    }
    if (type === 'share') {
      properties.platform = ['twitter', 'instagram', 'tiktok', 'linkedin'][
        Math.floor(Math.random() * 4)
      ];
    }

    events.push({
      eventId: `evt-${timestamp}-${i}`,
      type,
      userId: `user-${Math.floor(Math.random() * 5000)}`,
      properties,
      timestamp,
    });
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}
