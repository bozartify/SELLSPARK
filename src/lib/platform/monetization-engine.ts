/**
 * @module monetization-engine
 * @description Comprehensive monetization toolkit for the SellSpark creator OS.
 * Covers dynamic pricing, subscription revenue leakage detection, NFT-gated
 * content, micro-payment streaming, bundle optimisation, and tip jar / PWYW.
 */

// ─── Utilities ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Dynamic Pricing ──────────────────────────────────────────────────────────

export type PricingStrategy = 'surge' | 'penetration' | 'premium' | 'parity';

export interface PricingSignal {
  /** 0 = no demand, 1 = peak demand */
  demand: number;
  /** 0 = no competition, 1 = fierce competition */
  competition: number;
  /** season index, e.g. 1–12 for months or 1–4 for quarters */
  season: number;
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface DynamicPrice {
  basePrice: number;
  adjustedPrice: number;
  multiplier: number;
  reason: string;
  strategy: PricingStrategy;
  validUntil: number; // unix ms
}

export const PRICING_STRATEGIES: PricingStrategy[] = [
  'surge', 'penetration', 'premium', 'parity',
];

/** Choose a strategy heuristically from signals. */
function selectStrategy(signals: PricingSignal): PricingStrategy {
  if (signals.demand > 0.75) return 'surge';
  if (signals.competition > 0.7) return 'penetration';
  if (signals.demand > 0.5 && signals.competition < 0.3) return 'premium';
  return 'parity';
}

/** Compute a dynamic price from a base price and market signals. */
export function computeDynamicPrice(
  basePrice: number,
  signals: PricingSignal,
): DynamicPrice {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const d = clamp(signals.demand);
  const c = clamp(signals.competition);

  // Weekend uplift (Fri-Sat = 5,6)
  const weekendFactor = signals.dayOfWeek >= 5 ? 1.08 : 1.0;
  // Season bump: months 10-12 (holiday) = 1.15
  const seasonFactor = signals.season >= 10 ? 1.15 : signals.season <= 2 ? 0.92 : 1.0;

  const strategy = selectStrategy(signals);

  let multiplier: number;
  let reason: string;

  switch (strategy) {
    case 'surge':
      multiplier = 1 + d * 0.6 * weekendFactor * seasonFactor;
      reason = `High demand (${Math.round(d * 100)}%) — surge pricing applied`;
      break;
    case 'penetration':
      multiplier = Math.max(0.7, 1 - c * 0.3);
      reason = `Competitive market — penetration price to capture share`;
      break;
    case 'premium':
      multiplier = 1 + (d - 0.5) * 0.4 * seasonFactor;
      reason = `Low competition with strong demand — premium tier`;
      break;
    default: // parity
      multiplier = weekendFactor * seasonFactor;
      reason = `Stable market — price parity with minor calendar adjustments`;
  }

  multiplier = Math.round(multiplier * 100) / 100;
  const adjustedPrice = Math.round(basePrice * multiplier * 100) / 100;
  const validUntil = Date.now() + 4 * 60 * 60 * 1000; // 4 h validity

  return { basePrice, adjustedPrice, multiplier, reason, strategy, validUntil };
}

// ─── Subscription Revenue Optimizer ──────────────────────────────────────────

export type LeakageType = 'churn' | 'downgrade' | 'failed-payment' | 'discount-abuse';

export interface RevenueLeakage {
  type: LeakageType;
  mrr: number;          // MRR at risk (USD)
  count: number;        // number of affected subscribers
  recoveryAction: string;
}

export interface MemberRecord {
  id: string;
  mrr: number;
  status: 'active' | 'past_due' | 'cancelled' | 'churned' | 'downgraded';
  discountPct: number;  // 0–100
  failedPayments: number;
  churnScore: number;   // 0–1
}

export function identifyLeakages(members: MemberRecord[]): RevenueLeakage[] {
  const churned    = members.filter(m => m.churnScore > 0.65 || m.status === 'churned');
  const downgraded = members.filter(m => m.status === 'downgraded');
  const failed     = members.filter(m => m.failedPayments > 0 || m.status === 'past_due');
  const abusers    = members.filter(m => m.discountPct > 50);

  const leakages: RevenueLeakage[] = [];

  if (churned.length) {
    leakages.push({
      type: 'churn',
      mrr: churned.reduce((s, m) => s + m.mrr, 0),
      count: churned.length,
      recoveryAction: 'Send win-back sequence with 20% loyalty offer',
    });
  }
  if (downgraded.length) {
    leakages.push({
      type: 'downgrade',
      mrr: downgraded.reduce((s, m) => s + m.mrr, 0),
      count: downgraded.length,
      recoveryAction: 'Trigger upgrade nudge campaign with feature showcase',
    });
  }
  if (failed.length) {
    leakages.push({
      type: 'failed-payment',
      mrr: failed.reduce((s, m) => s + m.mrr, 0),
      count: failed.length,
      recoveryAction: 'Run smart dunning: retry + update payment method email',
    });
  }
  if (abusers.length) {
    leakages.push({
      type: 'discount-abuse',
      mrr: abusers.reduce((s, m) => s + m.mrr * (m.discountPct / 100), 0),
      count: abusers.length,
      recoveryAction: 'Cap discount at 30% and audit coupon distribution channel',
    });
  }

  return leakages;
}

/** Hill-climb to find the price that maximises expected revenue (price × conversions). */
export function computeOptimalPrice(
  conversionData: { price: number; conversions: number }[],
): number {
  if (!conversionData.length) return 0;

  let best = conversionData[0];
  for (const point of conversionData) {
    if (point.price * point.conversions > best.price * best.conversions) {
      best = point;
    }
  }
  return best.price;
}

// ─── NFT-Gated Content ────────────────────────────────────────────────────────

export type NFTChain = 'ethereum' | 'polygon' | 'solana';
export type NFTAccessLevel = 'view' | 'download' | 'remix' | 'exclusive';

export interface NFTGate {
  gateId: string;
  contractAddress: string;
  tokenId: string | null;   // null = any token in collection
  chainId: NFTChain;
  contentId: string;
  accessLevel: NFTAccessLevel;
  createdAt: number;
}

export interface NFTGateRequirements {
  contractAddress: string;
  tokenId?: string;
  chainId: NFTChain;
  accessLevel: NFTAccessLevel;
}

export interface ProductMeta {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  creator: string;
}

/** Simulated ownership check — in production this would call an RPC node. */
export function verifyNFTOwnership(
  walletAddress: string,
  gate: NFTGate,
): boolean {
  // Simulate: wallets starting with '0x1' own the token for demo purposes
  const owned = walletAddress.startsWith('0x1') || walletAddress.length === 44;
  return owned && gate.contractAddress.length > 10;
}

export function createNFTGate(
  contentId: string,
  requirements: NFTGateRequirements,
): NFTGate {
  return {
    gateId: `gate_${uid()}`,
    contractAddress: requirements.contractAddress,
    tokenId: requirements.tokenId ?? null,
    chainId: requirements.chainId,
    contentId,
    accessLevel: requirements.accessLevel,
    createdAt: Date.now(),
  };
}

/** Generate ERC-721-compatible metadata JSON string. */
export function generateNFTMetadata(product: ProductMeta): string {
  const meta = {
    name: product.name,
    description: product.description,
    image: product.imageUrl ?? `https://sellspark.io/nft/${product.id}/image.png`,
    external_url: `https://sellspark.io/products/${product.id}`,
    attributes: [
      { trait_type: 'Creator', value: product.creator },
      { trait_type: 'Price USD', value: product.price },
      { trait_type: 'Platform', value: 'SellSpark' },
      { trait_type: 'Edition', value: 'Limited' },
    ],
    seller_fee_basis_points: 500, // 5% royalty
    fee_recipient: `0x${product.id.replace(/\D/g, '').padStart(40, '0')}`,
  };
  return JSON.stringify(meta, null, 2);
}

// ─── Micro-Payment Streaming ──────────────────────────────────────────────────

export type StreamStatus = 'active' | 'paused' | 'settled' | 'cancelled';

export interface StreamSession {
  sessionId: string;
  payerAddress: string;
  recipientAddress: string;
  ratePerSecond: number;   // USD / second
  startedAt: number;       // unix ms
  totalStreamed: number;   // USD accumulated
  status: StreamStatus;
}

export interface StreamSettlement {
  sessionId: string;
  totalStreamed: number;
  durationSeconds: number;
  platformFee: number;     // 2.5%
  creatorPayout: number;
  settledAt: number;
}

export function createStream(
  rate: number,
  payerAddress = '0x1000000000000000000000000000000000000001',
  recipientAddress = '0x2000000000000000000000000000000000000002',
): StreamSession {
  return {
    sessionId: `stream_${uid()}`,
    payerAddress,
    recipientAddress,
    ratePerSecond: rate,
    startedAt: Date.now(),
    totalStreamed: 0,
    status: 'active',
  };
}

export function tickStream(session: StreamSession, seconds: number): StreamSession {
  if (session.status !== 'active') return session;
  return {
    ...session,
    totalStreamed: Math.round((session.totalStreamed + session.ratePerSecond * seconds) * 1e6) / 1e6,
  };
}

export function settleStream(session: StreamSession): StreamSettlement {
  const durationSeconds = (Date.now() - session.startedAt) / 1000;
  const total = session.totalStreamed;
  const platformFee = Math.round(total * 0.025 * 1e6) / 1e6;
  return {
    sessionId: session.sessionId,
    totalStreamed: total,
    durationSeconds: Math.round(durationSeconds),
    platformFee,
    creatorPayout: Math.round((total - platformFee) * 1e6) / 1e6,
    settledAt: Date.now(),
  };
}

// ─── Bundle Optimizer ─────────────────────────────────────────────────────────

export interface BundleProduct {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Bundle {
  bundleId: string;
  name: string;
  products: BundleProduct[];
  originalTotal: number;
  bundlePrice: number;
  savings: number;
  conversionLift: number; // fractional, e.g. 0.23 = 23%
  active: boolean;
}

export interface PurchaseRecord {
  productIds: string[];
}

/** Compute co-purchase affinity score between two products (0–1). */
export function computeBundleAffinityScore(
  productA: BundleProduct,
  productB: BundleProduct,
  history: PurchaseRecord[],
): number {
  if (!history.length) return 0;
  const together = history.filter(
    r => r.productIds.includes(productA.id) && r.productIds.includes(productB.id),
  ).length;
  const withA = history.filter(r => r.productIds.includes(productA.id)).length;
  if (!withA) return 0;
  return Math.round((together / withA) * 100) / 100;
}

/** Generate optimised bundles from a product catalogue and purchase history. */
export function optimizeBundles(
  products: BundleProduct[],
  purchaseHistory: PurchaseRecord[],
): Bundle[] {
  if (products.length < 2) return [];

  const bundles: Bundle[] = [];
  const used = new Set<string>();

  for (let i = 0; i < products.length && bundles.length < 6; i++) {
    if (used.has(products[i].id)) continue;
    for (let j = i + 1; j < products.length; j++) {
      if (used.has(products[j].id)) continue;
      const affinity = computeBundleAffinityScore(products[i], products[j], purchaseHistory);
      if (affinity < 0 || products.length >= 2) { // always pair for demo
        const pair = [products[i], products[j]];
        const originalTotal = pair.reduce((s, p) => s + p.price, 0);
        const discount = 0.15 + affinity * 0.1; // 15–25%
        const bundlePrice = Math.round(originalTotal * (1 - discount) * 100) / 100;
        bundles.push({
          bundleId: `bundle_${uid()}`,
          name: `${products[i].name} + ${products[j].name}`,
          products: pair,
          originalTotal,
          bundlePrice,
          savings: Math.round((originalTotal - bundlePrice) * 100) / 100,
          conversionLift: Math.round((0.18 + affinity * 0.15) * 100) / 100,
          active: false,
        });
        used.add(products[i].id);
        used.add(products[j].id);
        break;
      }
    }
  }

  return bundles;
}

// ─── Tip Jar / Pay-What-You-Want ─────────────────────────────────────────────

export interface TipConfig {
  minimumAmount: number;
  suggestedAmounts: number[];
  thankYouMessage: string;
  goalAmount?: number;
}

export interface TipRecord {
  tipId: string;
  amount: number;
  message: string;
  anonymous: boolean;
  timestamp: number;
}

export interface TipStats {
  total: number;
  average: number;
  count: number;
  topTippers: Array<{ tipId: string; amount: number; message: string }>;
}

export function generateTipStats(tips: TipRecord[]): TipStats {
  if (!tips.length) {
    return { total: 0, average: 0, count: 0, topTippers: [] };
  }
  const total = tips.reduce((s, t) => s + t.amount, 0);
  const sorted = [...tips].sort((a, b) => b.amount - a.amount);
  return {
    total: Math.round(total * 100) / 100,
    average: Math.round((total / tips.length) * 100) / 100,
    count: tips.length,
    topTippers: sorted.slice(0, 3).map(t => ({
      tipId: t.tipId,
      amount: t.amount,
      message: t.anonymous ? '(anonymous)' : t.message,
    })),
  };
}

// ─── Mock Data Helpers ────────────────────────────────────────────────────────

export function generateMockMembers(count = 20): MemberRecord[] {
  const statuses: MemberRecord['status'][] = [
    'active', 'past_due', 'cancelled', 'churned', 'downgraded',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `mem_${i}`,
    mrr: Math.round((10 + Math.random() * 190) * 100) / 100,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    discountPct: Math.floor(Math.random() * 80),
    failedPayments: Math.floor(Math.random() * 4),
    churnScore: Math.round(Math.random() * 100) / 100,
  }));
}

export function generateMockProducts(): BundleProduct[] {
  return [
    { id: 'p1', name: 'Notion Templates Pack', price: 29, category: 'templates' },
    { id: 'p2', name: 'Video Editing Presets', price: 39, category: 'presets' },
    { id: 'p3', name: 'Social Media Masterclass', price: 97, category: 'course' },
    { id: 'p4', name: 'Email Swipe File', price: 19, category: 'copywriting' },
    { id: 'p5', name: 'Brand Kit Builder', price: 49, category: 'design' },
    { id: 'p6', name: 'SEO Audit Checklist', price: 17, category: 'marketing' },
  ];
}

export function generateMockPurchaseHistory(): PurchaseRecord[] {
  return [
    { productIds: ['p1', 'p2'] },
    { productIds: ['p1', 'p2', 'p3'] },
    { productIds: ['p3', 'p4'] },
    { productIds: ['p5', 'p6'] },
    { productIds: ['p1', 'p5'] },
    { productIds: ['p2', 'p4'] },
    { productIds: ['p3', 'p6'] },
  ];
}

export function generateMockTips(): TipRecord[] {
  const messages = [
    'Your content changed my life!',
    'Keep up the great work 🔥',
    'Worth every penny',
    'Thanks for the free value!',
    '',
  ];
  return Array.from({ length: 14 }, (_, i) => ({
    tipId: `tip_${i}`,
    amount: parseFloat((2 + Math.random() * 98).toFixed(2)),
    message: messages[i % messages.length],
    anonymous: i % 4 === 0,
    timestamp: Date.now() - i * 3_600_000,
  }));
}
