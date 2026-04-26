/**
 * @module membership-engine
 * @description Tiered membership & subscription management engine.
 * Handles tier creation, access control, trial periods, pause/resume,
 * upgrade/downgrade prorations, benefit matrices, and churn prediction.
 *
 * Integrates with payment-intelligence.ts for recurring billing logic.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type BillingInterval = 'monthly' | 'quarterly' | 'annual' | 'lifetime';
export type MemberStatus   = 'trialing' | 'active' | 'paused' | 'past_due' | 'cancelled' | 'expired';
export type AccessLevel    = 'free' | 'basic' | 'pro' | 'elite' | 'founder';

export interface MembershipTier {
  id: string;
  name: string;
  accessLevel: AccessLevel;
  price: Record<BillingInterval, number>;  // USD prices per interval
  trialDays: number;
  features: TierFeature[];
  limits: TierLimits;
  color: string;
  popular: boolean;
  createdAt: number;
}

export interface TierFeature {
  key: string;
  label: string;
  included: boolean;
  limit?: number | 'unlimited';
  badge?: string;
}

export interface TierLimits {
  products: number | 'unlimited';
  courses: number | 'unlimited';
  emailContacts: number | 'unlimited';
  storageGB: number | 'unlimited';
  affiliates: number | 'unlimited';
  teamMembers: number | 'unlimited';
  monthlyVideoMinutes: number | 'unlimited';
  apiCallsPerDay: number | 'unlimited';
}

export interface Member {
  id: string;
  email: string;
  name: string;
  tierId: string;
  status: MemberStatus;
  interval: BillingInterval;
  trialEndsAt: number | null;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  pausedAt: number | null;
  resumeAt: number | null;
  cancelledAt: number | null;
  mrr: number;               // monthly equivalent in USD
  ltv: number;
  joinedAt: number;
  churnRisk: number;         // 0–1
  lastActiveAt: number;
  usageMetrics: UsageMetrics;
  paymentMethodId: string;
  stripeSubscriptionId: string;
}

export interface UsageMetrics {
  productsCreated: number;
  coursesPublished: number;
  emailContactsUsed: number;
  storageUsedGB: number;
  videoMinutesUsed: number;
  apiCallsToday: number;
  loginStreak: number;
  lastFeatureUsed: string;
}

export interface SubscriptionEvent {
  id: string;
  memberId: string;
  type: 'created' | 'upgraded' | 'downgraded' | 'paused' | 'resumed' | 'cancelled' | 'payment_failed' | 'trial_ended' | 'renewed';
  fromTier?: string;
  toTier?: string;
  amount?: number;
  timestamp: number;
  metadata: Record<string, string>;
}

export interface BenefitMatrix {
  tiers: MembershipTier[];
  featureKeys: string[];
  matrix: Record<string, Record<string, boolean | number | 'unlimited'>>;
}

// ─── Default Tier Catalog ─────────────────────────────────────────────────────

export function getDefaultTiers(): MembershipTier[] {
  return [
    {
      id: 'tier-free',
      name: 'Free',
      accessLevel: 'free',
      price: { monthly: 0, quarterly: 0, annual: 0, lifetime: 0 },
      trialDays: 0,
      color: '#6b7280',
      popular: false,
      createdAt: Date.now(),
      features: [
        { key: 'products',      label: 'Digital Products',   included: true,  limit: 3 },
        { key: 'courses',       label: 'Courses',            included: true,  limit: 1 },
        { key: 'email',         label: 'Email Marketing',    included: true,  limit: 100 },
        { key: 'analytics',     label: 'Basic Analytics',    included: true },
        { key: 'ai_tools',      label: 'AI Tools',           included: false },
        { key: 'live',          label: 'Live Streaming',     included: false },
        { key: 'affiliates',    label: 'Affiliate Program',  included: false },
        { key: 'custom_domain', label: 'Custom Domain',      included: false },
        { key: 'api',           label: 'API Access',         included: false },
        { key: 'white_label',   label: 'White Label',        included: false },
      ],
      limits: { products: 3, courses: 1, emailContacts: 100, storageGB: 1, affiliates: 0, teamMembers: 1, monthlyVideoMinutes: 60, apiCallsPerDay: 0 },
    },
    {
      id: 'tier-basic',
      name: 'Starter',
      accessLevel: 'basic',
      price: { monthly: 29, quarterly: 79, annual: 279, lifetime: 799 },
      trialDays: 14,
      color: '#3b82f6',
      popular: false,
      createdAt: Date.now(),
      features: [
        { key: 'products',      label: 'Digital Products',   included: true,  limit: 20 },
        { key: 'courses',       label: 'Courses',            included: true,  limit: 5 },
        { key: 'email',         label: 'Email Marketing',    included: true,  limit: 2500 },
        { key: 'analytics',     label: 'Analytics',          included: true },
        { key: 'ai_tools',      label: 'AI Tools',           included: true,  badge: 'NEW' },
        { key: 'live',          label: 'Live Streaming',     included: true },
        { key: 'affiliates',    label: 'Affiliate Program',  included: false },
        { key: 'custom_domain', label: 'Custom Domain',      included: true },
        { key: 'api',           label: 'API Access',         included: false },
        { key: 'white_label',   label: 'White Label',        included: false },
      ],
      limits: { products: 20, courses: 5, emailContacts: 2500, storageGB: 10, affiliates: 0, teamMembers: 1, monthlyVideoMinutes: 600, apiCallsPerDay: 0 },
    },
    {
      id: 'tier-pro',
      name: 'Pro',
      accessLevel: 'pro',
      price: { monthly: 79, quarterly: 219, annual: 749, lifetime: 1999 },
      trialDays: 14,
      color: '#7c3aed',
      popular: true,
      createdAt: Date.now(),
      features: [
        { key: 'products',      label: 'Digital Products',   included: true,  limit: 'unlimited' },
        { key: 'courses',       label: 'Courses',            included: true,  limit: 'unlimited' },
        { key: 'email',         label: 'Email Marketing',    included: true,  limit: 25000 },
        { key: 'analytics',     label: 'Advanced Analytics', included: true },
        { key: 'ai_tools',      label: 'AI Tools',           included: true },
        { key: 'live',          label: 'Live Streaming',     included: true },
        { key: 'affiliates',    label: 'Affiliate Program',  included: true,  limit: 50 },
        { key: 'custom_domain', label: 'Custom Domain',      included: true },
        { key: 'api',           label: 'API Access',         included: true,  badge: 'NEW' },
        { key: 'white_label',   label: 'White Label',        included: false },
      ],
      limits: { products: 'unlimited', courses: 'unlimited', emailContacts: 25000, storageGB: 100, affiliates: 50, teamMembers: 5, monthlyVideoMinutes: 6000, apiCallsPerDay: 10000 },
    },
    {
      id: 'tier-elite',
      name: 'Elite',
      accessLevel: 'elite',
      price: { monthly: 199, quarterly: 549, annual: 1999, lifetime: 4999 },
      trialDays: 14,
      color: '#f59e0b',
      popular: false,
      createdAt: Date.now(),
      features: [
        { key: 'products',      label: 'Digital Products',   included: true,  limit: 'unlimited' },
        { key: 'courses',       label: 'Courses',            included: true,  limit: 'unlimited' },
        { key: 'email',         label: 'Email Marketing',    included: true,  limit: 'unlimited' },
        { key: 'analytics',     label: 'Quantum Analytics',  included: true,  badge: 'QUANTUM' },
        { key: 'ai_tools',      label: 'AI Agent Swarm',     included: true },
        { key: 'live',          label: 'Live + Multi-cam',   included: true },
        { key: 'affiliates',    label: 'Affiliate Program',  included: true,  limit: 'unlimited' },
        { key: 'custom_domain', label: 'Custom Domain',      included: true },
        { key: 'api',           label: 'Full API + Webhooks',included: true },
        { key: 'white_label',   label: 'White Label',        included: true,  badge: 'ELITE' },
      ],
      limits: { products: 'unlimited', courses: 'unlimited', emailContacts: 'unlimited', storageGB: 'unlimited', affiliates: 'unlimited', teamMembers: 25, monthlyVideoMinutes: 'unlimited', apiCallsPerDay: 'unlimited' },
    },
    {
      id: 'tier-founder',
      name: 'Founder',
      accessLevel: 'founder',
      price: { monthly: 499, quarterly: 1399, annual: 4999, lifetime: 9999 },
      trialDays: 30,
      color: '#ec4899',
      popular: false,
      createdAt: Date.now(),
      features: [
        { key: 'products',      label: 'Digital Products',   included: true,  limit: 'unlimited' },
        { key: 'courses',       label: 'Courses',            included: true,  limit: 'unlimited' },
        { key: 'email',         label: 'Email Marketing',    included: true,  limit: 'unlimited' },
        { key: 'analytics',     label: 'Custom Analytics',   included: true },
        { key: 'ai_tools',      label: 'Priority AI Access', included: true },
        { key: 'live',          label: 'CDN + Multi-stream', included: true },
        { key: 'affiliates',    label: 'Custom Commission',  included: true,  limit: 'unlimited' },
        { key: 'custom_domain', label: 'Multi-Domain',       included: true },
        { key: 'api',           label: 'Private API Cluster',included: true },
        { key: 'white_label',   label: 'Full White Label',   included: true,  badge: '🏆' },
      ],
      limits: { products: 'unlimited', courses: 'unlimited', emailContacts: 'unlimited', storageGB: 'unlimited', affiliates: 'unlimited', teamMembers: 'unlimited', monthlyVideoMinutes: 'unlimited', apiCallsPerDay: 'unlimited' },
    },
  ];
}

// ─── Member Operations ────────────────────────────────────────────────────────

export function createMember(
  email: string,
  name: string,
  tier: MembershipTier,
  interval: BillingInterval,
): Member {
  const now = Date.now();
  const periodDays = interval === 'monthly' ? 30 : interval === 'quarterly' ? 90 : interval === 'annual' ? 365 : 36500;
  const mrr = tier.price.monthly;
  return {
    id: `mem-${now}-${Math.random().toString(36).slice(2, 7)}`,
    email, name,
    tierId: tier.id,
    status: tier.trialDays > 0 ? 'trialing' : 'active',
    interval,
    trialEndsAt: tier.trialDays > 0 ? now + tier.trialDays * 86400000 : null,
    currentPeriodStart: now,
    currentPeriodEnd: now + periodDays * 86400000,
    pausedAt: null,
    resumeAt: null,
    cancelledAt: null,
    mrr,
    ltv: mrr,
    joinedAt: now,
    churnRisk: 0.05,
    lastActiveAt: now,
    usageMetrics: { productsCreated: 0, coursesPublished: 0, emailContactsUsed: 0, storageUsedGB: 0, videoMinutesUsed: 0, apiCallsToday: 0, loginStreak: 1, lastFeatureUsed: 'onboarding' },
    paymentMethodId: 'pm_placeholder',
    stripeSubscriptionId: `sub_${Math.random().toString(36).slice(2, 14)}`,
  };
}

export function checkAccess(member: Member, feature: string, tiers: MembershipTier[]): { allowed: boolean; reason: string; upgradeToTier?: string } {
  if (member.status === 'cancelled' || member.status === 'expired') return { allowed: false, reason: 'Subscription cancelled or expired', upgradeToTier: 'tier-basic' };
  if (member.status === 'past_due') return { allowed: false, reason: 'Payment past due — please update payment method' };

  const tier = tiers.find(t => t.id === member.tierId);
  if (!tier) return { allowed: false, reason: 'Tier not found' };

  const feat = tier.features.find(f => f.key === feature);
  if (!feat) return { allowed: false, reason: 'Feature not in any tier', upgradeToTier: 'tier-pro' };
  if (!feat.included) {
    const upgradeTier = tiers.find(t => t.features.find(f => f.key === feature && f.included));
    return { allowed: false, reason: `Not included in ${tier.name}`, upgradeToTier: upgradeTier?.id };
  }
  return { allowed: true, reason: 'Access granted' };
}

export function pauseSubscription(member: Member, resumeInDays: number = 30): Member {
  if (member.status !== 'active') throw new Error('Can only pause active subscriptions');
  return { ...member, status: 'paused', pausedAt: Date.now(), resumeAt: Date.now() + resumeInDays * 86400000 };
}

export function resumeSubscription(member: Member): Member {
  if (member.status !== 'paused') throw new Error('Subscription is not paused');
  return { ...member, status: 'active', pausedAt: null, resumeAt: null };
}

export function applyTrialPeriod(member: Member, extraDays: number): Member {
  const newTrialEnd = (member.trialEndsAt || Date.now()) + extraDays * 86400000;
  return { ...member, trialEndsAt: newTrialEnd, status: 'trialing' };
}

export function upgradeTier(member: Member, newTier: MembershipTier): { member: Member; event: SubscriptionEvent; prorationCredit: number } {
  const oldTierId = member.tierId;
  const daysUsed = (Date.now() - member.currentPeriodStart) / 86400000;
  const totalDays = (member.currentPeriodEnd - member.currentPeriodStart) / 86400000;
  const unusedFraction = Math.max(0, 1 - daysUsed / totalDays);
  const oldMrr = member.mrr;
  const prorationCredit = oldMrr * unusedFraction;

  const updated: Member = { ...member, tierId: newTier.id, mrr: newTier.price.monthly, ltv: member.ltv + newTier.price.monthly };
  const event: SubscriptionEvent = {
    id: `evt-${Date.now()}`,
    memberId: member.id,
    type: 'upgraded',
    fromTier: oldTierId,
    toTier: newTier.id,
    amount: newTier.price.monthly - oldMrr,
    timestamp: Date.now(),
    metadata: { prorationCredit: prorationCredit.toFixed(2) },
  };
  return { member: updated, event, prorationCredit };
}

// ─── Churn Prediction ─────────────────────────────────────────────────────────

export function scoreChurnRisk(member: Member): number {
  let risk = 0;
  const daysSinceActive = (Date.now() - member.lastActiveAt) / 86400000;
  const daysSinceJoined = (Date.now() - member.joinedAt) / 86400000;

  if (daysSinceActive > 14)  risk += 0.25;
  if (daysSinceActive > 30)  risk += 0.25;
  if (member.usageMetrics.loginStreak < 3) risk += 0.15;
  if (member.usageMetrics.productsCreated === 0) risk += 0.20;
  if (member.status === 'past_due') risk += 0.40;
  if (member.status === 'paused')  risk += 0.30;
  if (daysSinceJoined < 7)  risk -= 0.10; // honeymoon
  return Math.max(0, Math.min(1, risk));
}

export function generateWinBackSequence(member: Member, tier: MembershipTier): Array<{ dayOffset: number; subject: string; offer: string; discountPct: number }> {
  return [
    { dayOffset: 1,  subject: `We miss you, ${member.name.split(' ')[0]}! 👋`, offer: 'No offer — reactivation reminder', discountPct: 0 },
    { dayOffset: 4,  subject: 'Here\'s what you\'re missing on SellSpark', offer: '10% off next month', discountPct: 10 },
    { dayOffset: 9,  subject: 'Last chance: 20% off to come back', offer: '20% off next month', discountPct: 20 },
    { dayOffset: 14, subject: 'Special offer just for you', offer: '1 month free + lock current price', discountPct: 100 },
  ];
}

// ─── Benefit Matrix ───────────────────────────────────────────────────────────

export function buildBenefitMatrix(tiers: MembershipTier[]): BenefitMatrix {
  const featureKeys = Array.from(new Set(tiers.flatMap(t => t.features.map(f => f.key))));
  const matrix: BenefitMatrix['matrix'] = {};

  tiers.forEach(tier => {
    matrix[tier.id] = {};
    featureKeys.forEach(key => {
      const feat = tier.features.find(f => f.key === key);
      matrix[tier.id][key] = feat?.included ? (feat.limit ?? true) : false;
    });
  });

  return { tiers, featureKeys, matrix };
}

// ─── Revenue Metrics ──────────────────────────────────────────────────────────

export function computeMembershipMRR(members: Member[]): { total: number; byTier: Record<string, number>; growth: number } {
  const byTier: Record<string, number> = {};
  let total = 0;
  members.filter(m => m.status === 'active' || m.status === 'trialing').forEach(m => {
    total += m.mrr;
    byTier[m.tierId] = (byTier[m.tierId] || 0) + m.mrr;
  });
  return { total, byTier, growth: 0.08 }; // placeholder growth
}

export function getMembersByChurnRisk(members: Member[]): { high: Member[]; medium: Member[]; low: Member[] } {
  const withRisk = members.map(m => ({ ...m, churnRisk: scoreChurnRisk(m) }));
  return {
    high:   withRisk.filter(m => m.churnRisk > 0.6),
    medium: withRisk.filter(m => m.churnRisk > 0.3 && m.churnRisk <= 0.6),
    low:    withRisk.filter(m => m.churnRisk <= 0.3),
  };
}

// ─── Mock Data Generator ──────────────────────────────────────────────────────

export function generateMockMembers(tiers: MembershipTier[], count: number = 12): Member[] {
  const names = ['Alex Chen','Maria Santos','Kwame Asante','Priya Nair','Jordan Lee','Sofia Rossi','Mohammed Al-Rashid','Emma Müller','Yuki Tanaka','Carlos Vega','Aisha Okonkwo','Liam Walsh'];
  return names.slice(0, count).map((name, i) => {
    const tier = tiers[i % (tiers.length - 1)]; // skip founder for mocks
    const intervals: BillingInterval[] = ['monthly','monthly','quarterly','annual'];
    const interval = intervals[i % intervals.length];
    const member = createMember(`${name.toLowerCase().replace(' ','.')}@example.com`, name, tier, interval);
    const daysAgo = Math.floor(Math.random() * 120) + 1;
    return {
      ...member,
      joinedAt: Date.now() - daysAgo * 86400000,
      lastActiveAt: Date.now() - Math.floor(Math.random() * 20) * 86400000,
      ltv: tier.price.monthly * Math.floor(daysAgo / 30),
      usageMetrics: {
        productsCreated: Math.floor(Math.random() * 15),
        coursesPublished: Math.floor(Math.random() * 4),
        emailContactsUsed: Math.floor(Math.random() * 1500),
        storageUsedGB: Math.random() * 8,
        videoMinutesUsed: Math.floor(Math.random() * 300),
        apiCallsToday: Math.floor(Math.random() * 500),
        loginStreak: Math.floor(Math.random() * 14),
        lastFeatureUsed: ['email','courses','products','live','analytics'][Math.floor(Math.random() * 5)],
      },
      status: (['active','active','active','active','trialing','paused'] as MemberStatus[])[i % 6],
    };
  });
}
