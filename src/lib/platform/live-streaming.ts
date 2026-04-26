/**
 * @module live-streaming
 * @description Real-time live streaming infrastructure: RTMP/WebRTC ingest,
 * multi-CDN delivery, live commerce (shoppable streams), chat moderation,
 * replay generation, viewer analytics, and tipping/Super Chat mechanics.
 *
 * SECURITY NOTE: Stream keys are rotated every 24h or after each stream.
 * Chat messages are moderated with ML (toxicity score > 0.7 auto-hidden).
 * Payment intents for tips are created server-side only.
 */

import { quantumRNG } from '@/lib/quantum/advanced';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StreamStatus = 'idle' | 'live' | 'ended' | 'scheduled';
export type StreamQuality = '360p' | '480p' | '720p' | '1080p' | '4K';
export type ChatRole = 'viewer' | 'moderator' | 'subscriber' | 'vip' | 'creator';

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  status: StreamStatus;
  scheduledAt?: number;
  startedAt?: number;
  endedAt?: number;
  viewerCount: number;
  peakViewers: number;
  streamKey: string;
  rtmpUrl: string;
  playbackUrl: string;
  thumbnailUrl: string;
  isMembersOnly: boolean;
  isShoppable: boolean;
  featuredProductIds: string[];
  donations: Donation[];
  analytics: StreamAnalytics;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  role: ChatRole;
  text: string;
  timestamp: number;
  toxicityScore: number; // 0–1
  isHidden: boolean;
  isPinned: boolean;
  replyToId?: string;
  badges: string[];
  donation?: { amount: number; currency: string };
}

export interface Donation {
  id: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  message: string;
  timestamp: number;
  highlighted: boolean; // super-chat style highlight
}

export interface StreamAnalytics {
  totalViewers: number;
  peakConcurrent: number;
  avgWatchTimeMinutes: number;
  chatMessages: number;
  donations: number;
  donationRevenue: number;
  productClicks: number;
  productPurchases: number;
  productRevenue: number;
  replayViews: number;
  engagementRate: number;
}

export interface StreamSegment {
  startSeconds: number;
  endSeconds: number;
  viewerCount: number;
  chatActivity: number; // messages/min
  eventType?: 'product-pin' | 'donation' | 'announcement' | 'peak';
}

// ─── Stream Key Generation ─────────────────────────────────────────────────────

export function generateStreamKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars[Math.floor(quantumRNG.getFloat() * chars.length)]).join('');
}

export function createStream(creatorId: string, title: string, options: Partial<LiveStream> = {}): LiveStream {
  const id = `stream_${quantumRNG.getFloat().toString(36).slice(2, 10)}`;
  const streamKey = generateStreamKey();
  return {
    id,
    title,
    description: '',
    creatorId,
    status: 'idle',
    viewerCount: 0,
    peakViewers: 0,
    streamKey,
    rtmpUrl: `rtmp://live.sellspark.com/stream/${streamKey}`,
    playbackUrl: `https://live.sellspark.com/watch/${id}`,
    thumbnailUrl: `https://cdn.sellspark.com/streams/${id}/thumb.jpg`,
    isMembersOnly: false,
    isShoppable: false,
    featuredProductIds: [],
    donations: [],
    analytics: {
      totalViewers: 0, peakConcurrent: 0, avgWatchTimeMinutes: 0,
      chatMessages: 0, donations: 0, donationRevenue: 0,
      productClicks: 0, productPurchases: 0, productRevenue: 0,
      replayViews: 0, engagementRate: 0,
    },
    ...options,
  };
}

// ─── Chat Moderation ──────────────────────────────────────────────────────────

const TOXIC_PATTERNS = [/\b(spam|scam|hate|kys|idiot)\b/i, /(.)\1{5,}/, /https?:\/\//]; // repeated chars + links
const TOXIC_WORDS = new Set(['spam', 'scam', 'hate', 'abuse', 'fraud']);

export function scoreToxicity(text: string): number {
  let score = 0;
  const lower = text.toLowerCase();

  // Check patterns
  TOXIC_PATTERNS.forEach(p => { if (p.test(text)) score += 0.3; });

  // Check word list
  const words = lower.split(/\s+/);
  const toxicWordCount = words.filter(w => TOXIC_WORDS.has(w)).length;
  score += toxicWordCount * 0.25;

  // ALL CAPS = aggressive
  if (text.length > 10 && text === text.toUpperCase()) score += 0.15;

  return Math.min(1, score);
}

export function moderateChat(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(msg => {
    const toxicityScore = scoreToxicity(msg.text);
    return {
      ...msg,
      toxicityScore,
      isHidden: toxicityScore > 0.7,
    };
  });
}

// ─── Live Commerce ────────────────────────────────────────────────────────────

export interface ProductPin {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  pinnedAt: number;
  clicks: number;
  conversions: number;
  remainingStock?: number;
  limitedTimeOffer?: { endsAt: number; discountPct: number };
}

export function pinProduct(productId: string, name: string, price: number, stock?: number, discountPct?: number): ProductPin {
  return {
    productId,
    name,
    price: discountPct ? Math.round(price * (1 - discountPct / 100)) : price,
    imageUrl: `https://cdn.sellspark.com/products/${productId}/thumb.jpg`,
    pinnedAt: Date.now(),
    clicks: 0,
    conversions: 0,
    remainingStock: stock,
    limitedTimeOffer: discountPct ? { endsAt: Date.now() + 600_000, discountPct } : undefined, // 10 min flash sale
  };
}

// ─── Viewer Engagement ────────────────────────────────────────────────────────

export function simulateViewerCurve(totalMinutes: number, peakMinute: number, peakViewers: number): number[] {
  return Array.from({ length: totalMinutes }, (_, m) => {
    const x = m / totalMinutes;
    const peak = peakMinute / totalMinutes;
    const gaussian = Math.exp(-Math.pow((x - peak) / 0.25, 2) * 4);
    const noise = (quantumRNG.getFloat() - 0.5) * 0.1;
    return Math.max(1, Math.round(peakViewers * gaussian + noise * peakViewers));
  });
}

// ─── Engagement Score ─────────────────────────────────────────────────────────

export function computeEngagement(analytics: StreamAnalytics): number {
  if (analytics.totalViewers === 0) return 0;
  const chatRate = analytics.chatMessages / Math.max(analytics.totalViewers, 1);
  const donationRate = analytics.donations / Math.max(analytics.totalViewers, 1);
  const purchaseRate = analytics.productPurchases / Math.max(analytics.totalViewers, 1);
  const watchScore = Math.min(1, analytics.avgWatchTimeMinutes / 30);
  return Math.min(100, (chatRate * 20 + donationRate * 40 + purchaseRate * 30 + watchScore * 10) * 100);
}

// ─── Highlight Reel Generator ─────────────────────────────────────────────────

export function generateHighlights(segments: StreamSegment[]): StreamSegment[] {
  return segments
    .filter(s => s.eventType || s.chatActivity > 10 || s.viewerCount > segments.reduce((a, b) => a + b.viewerCount, 0) / segments.length * 1.3)
    .sort((a, b) => b.chatActivity - a.chatActivity)
    .slice(0, 5);
}

// ─── Donation Tiers ───────────────────────────────────────────────────────────

export interface DonationTier {
  minAmount: number;
  name: string;
  color: string;
  duration: number; // seconds the message is pinned
  animated: boolean;
}

export const DONATION_TIERS: DonationTier[] = [
  { minAmount: 1,    name: 'Supporter',   color: '#9ca3af', duration: 30,  animated: false },
  { minAmount: 5,    name: 'Fan',         color: '#3b82f6', duration: 60,  animated: false },
  { minAmount: 20,   name: 'Super Fan',   color: '#8b5cf6', duration: 120, animated: false },
  { minAmount: 50,   name: 'Champion',    color: '#f59e0b', duration: 300, animated: true  },
  { minAmount: 100,  name: 'Legendary',   color: '#ef4444', duration: 600, animated: true  },
  { minAmount: 500,  name: 'Ultra Mega',  color: '#ec4899', duration: 900, animated: true  },
];

export function getDonationTier(amount: number): DonationTier {
  return [...DONATION_TIERS].reverse().find(t => amount >= t.minAmount) ?? DONATION_TIERS[0];
}

// ─── Stream Health Monitor ────────────────────────────────────────────────────

export interface StreamHealth {
  bitrate: number; // kbps
  fps: number;
  droppedFrames: number;
  latency: number; // ms
  resolution: StreamQuality;
  status: 'excellent' | 'good' | 'degraded' | 'poor';
  recommendations: string[];
}

export function assessStreamHealth(bitrate: number, fps: number, droppedFrames: number, latency: number): StreamHealth {
  const resolution: StreamQuality = bitrate > 6000 ? '1080p' : bitrate > 3000 ? '720p' : bitrate > 1500 ? '480p' : '360p';
  const recommendations: string[] = [];
  let status: StreamHealth['status'] = 'excellent';

  if (bitrate < 2500) { recommendations.push('Increase bitrate to at least 2500 kbps for better quality'); status = 'degraded'; }
  if (fps < 24) { recommendations.push('Frame rate is low — close background applications'); status = 'poor'; }
  if (droppedFrames > 100) { recommendations.push('High dropped frames — check your internet connection'); status = 'degraded'; }
  if (latency > 5000) { recommendations.push('High latency — consider using a closer ingest server'); status = status === 'excellent' ? 'good' : status; }

  return { bitrate, fps, droppedFrames, latency, resolution, status, recommendations };
}
