/**
 * SellSpark Integrations Hub
 * Webhook manager, OAuth connector registry, automation triggers,
 * API key vault, and rate limiter infrastructure.
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// WEBHOOK MANAGER
// ---------------------------------------------------------------------------

export interface Webhook {
  webhookId: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  deliveryCount: number;
  failureCount: number;
  lastDelivery?: string; // ISO timestamp
}

export interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  duration: number;
  error?: string;
  timestamp: string;
}

export const WEBHOOK_EVENTS: string[] = [
  'order.created',
  'order.completed',
  'order.refunded',
  'order.failed',
  'payment.succeeded',
  'payment.failed',
  'payment.disputed',
  'subscriber.joined',
  'subscriber.cancelled',
  'subscriber.upgraded',
  'content.published',
  'content.unpublished',
  'content.purchased',
  'member.created',
  'member.deleted',
  'product.created',
  'product.updated',
  'affiliate.sale',
  'coupon.redeemed',
  'course.completed',
];

export function generateWebhookSecret(): string {
  return 'whsec_' + crypto.randomBytes(24).toString('hex');
}

export function signWebhookPayload(payload: string, secret: string): string {
  const rawSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  return crypto
    .createHmac('sha256', Buffer.from(rawSecret, 'hex'))
    .update(payload)
    .digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  sig: string,
  secret: string,
): boolean {
  const expected = signWebhookPayload(payload, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'));
  } catch {
    return false;
  }
}

export async function retryFailedDelivery(webhook: Webhook): Promise<DeliveryResult> {
  const start = Date.now();
  try {
    const payload = JSON.stringify({ webhookId: webhook.webhookId, retry: true, ts: new Date().toISOString() });
    const sig = signWebhookPayload(payload, webhook.secret);
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SellSpark-Signature': sig,
      },
      body: payload,
    });
    return {
      success: res.ok,
      statusCode: res.status,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      duration: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// ---------------------------------------------------------------------------
// OAUTH CONNECTOR REGISTRY
// ---------------------------------------------------------------------------

export type OAuthCategory = 'social' | 'payment' | 'analytics' | 'email' | 'crm' | 'storage';

export interface OAuthConnector {
  id: string;
  name: string;
  icon: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  category: OAuthCategory;
}

export const OAUTH_CONNECTORS: OAuthConnector[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    scopes: ['read_write'],
    category: 'payment',
  },
  {
    id: 'google',
    name: 'Google',
    icon: '🔵',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/analytics.readonly'],
    category: 'analytics',
  },
  {
    id: 'meta',
    name: 'Meta',
    icon: '🟦',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['ads_read', 'pages_read_engagement', 'instagram_basic'],
    category: 'social',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.list'],
    category: 'social',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    category: 'social',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    icon: '🐒',
    authUrl: 'https://login.mailchimp.com/oauth2/authorize',
    tokenUrl: 'https://login.mailchimp.com/oauth2/token',
    scopes: ['basic'],
    category: 'email',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '🟠',
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    scopes: ['contacts', 'deals', 'crm.objects.contacts.read', 'crm.objects.contacts.write'],
    category: 'crm',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
    scopes: ['read_orders', 'read_products', 'read_customers'],
    category: 'payment',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: ['read_user', 'read_content', 'update_content'],
    category: 'storage',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scopes: ['identify', 'guilds', 'bot'],
    category: 'social',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['chat:write', 'channels:read', 'users:read'],
    category: 'crm',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    scopes: ['files.content.read', 'files.content.write'],
    category: 'storage',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '📹',
    authUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    scopes: ['meeting:read', 'meeting:write', 'webinar:read'],
    category: 'social',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
    category: 'social',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '🔗',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    category: 'social',
  },
];

export function buildOAuthUrl(
  connector: OAuthConnector,
  redirectUri: string,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: process.env[`NEXT_PUBLIC_${connector.id.toUpperCase()}_CLIENT_ID`] ?? 'CLIENT_ID',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: connector.scopes.join(' '),
    state,
  });
  return `${connector.authUrl}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// AUTOMATION TRIGGERS (Zapier-style)
// ---------------------------------------------------------------------------

export interface AutomationFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
  value: string | number;
}

export interface AutomationTrigger {
  triggerId: string;
  name: string;
  app: string;
  event: string;
  filters: AutomationFilter[];
}

export interface AutomationAction {
  actionId: string;
  app: string;
  operation: string;
  fieldMapping: Record<string, string>;
}

export interface Automation {
  automationId: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  active: boolean;
  runCount: number;
  lastRun?: string; // ISO timestamp
}

export function evaluateTrigger(
  trigger: AutomationTrigger,
  event: Record<string, unknown>,
): boolean {
  if (trigger.filters.length === 0) return true;
  return trigger.filters.every(f => {
    const val = event[f.field];
    switch (f.operator) {
      case 'eq': return val === f.value;
      case 'neq': return val !== f.value;
      case 'gt': return typeof val === 'number' && val > Number(f.value);
      case 'lt': return typeof val === 'number' && val < Number(f.value);
      case 'contains': return typeof val === 'string' && val.includes(String(f.value));
      default: return false;
    }
  });
}

export const AUTOMATION_TEMPLATES: Automation[] = [
  {
    automationId: 'tpl-1',
    name: 'New Sale → Send Slack',
    trigger: { triggerId: 'trig-1', name: 'New order created', app: 'SellSpark', event: 'order.created', filters: [] },
    actions: [{ actionId: 'act-1', app: 'Slack', operation: 'send_message', fieldMapping: { text: '🎉 New sale: {{order.amount}} from {{order.customer}}', channel: '#sales' } }],
    active: false, runCount: 0,
  },
  {
    automationId: 'tpl-2',
    name: 'Subscriber Joined → Add to HubSpot',
    trigger: { triggerId: 'trig-2', name: 'New subscriber', app: 'SellSpark', event: 'subscriber.joined', filters: [] },
    actions: [{ actionId: 'act-2', app: 'HubSpot', operation: 'create_contact', fieldMapping: { email: '{{subscriber.email}}', firstname: '{{subscriber.name}}' } }],
    active: false, runCount: 0,
  },
  {
    automationId: 'tpl-3',
    name: 'Payment Failed → Send Email',
    trigger: { triggerId: 'trig-3', name: 'Payment failed', app: 'SellSpark', event: 'payment.failed', filters: [] },
    actions: [{ actionId: 'act-3', app: 'Mailchimp', operation: 'send_transactional', fieldMapping: { to: '{{customer.email}}', template: 'payment-failed' } }],
    active: false, runCount: 0,
  },
  {
    automationId: 'tpl-4',
    name: 'Course Completed → Discord Role',
    trigger: { triggerId: 'trig-4', name: 'Course completed', app: 'SellSpark', event: 'course.completed', filters: [] },
    actions: [{ actionId: 'act-4', app: 'Discord', operation: 'add_role', fieldMapping: { user_id: '{{member.discordId}}', role: 'Graduate' } }],
    active: false, runCount: 0,
  },
  {
    automationId: 'tpl-5',
    name: 'New Content → Tweet',
    trigger: { triggerId: 'trig-5', name: 'Content published', app: 'SellSpark', event: 'content.published', filters: [] },
    actions: [{ actionId: 'act-5', app: 'Twitter / X', operation: 'post_tweet', fieldMapping: { text: '🚀 New post: {{content.title}} {{content.url}}' } }],
    active: false, runCount: 0,
  },
  {
    automationId: 'tpl-6',
    name: 'Affiliate Sale → Notion Log',
    trigger: { triggerId: 'trig-6', name: 'Affiliate sale', app: 'SellSpark', event: 'affiliate.sale', filters: [] },
    actions: [{ actionId: 'act-6', app: 'Notion', operation: 'append_row', fieldMapping: { db: 'Affiliate Sales', amount: '{{sale.amount}}', affiliate: '{{sale.affiliate}}' } }],
    active: false, runCount: 0,
  },
  {
    automationId: 'tpl-7',
    name: 'Order Refunded → HubSpot Note',
    trigger: { triggerId: 'trig-7', name: 'Order refunded', app: 'SellSpark', event: 'order.refunded', filters: [] },
    actions: [{ actionId: 'act-7', app: 'HubSpot', operation: 'create_note', fieldMapping: { contact_email: '{{order.email}}', note: 'Refund issued: {{order.amount}}' } }],
    active: false, runCount: 0,
  },
  {
    automationId: 'tpl-8',
    name: 'Subscriber Cancelled → Slack Alert',
    trigger: { triggerId: 'trig-8', name: 'Subscriber cancelled', app: 'SellSpark', event: 'subscriber.cancelled', filters: [] },
    actions: [{ actionId: 'act-8', app: 'Slack', operation: 'send_message', fieldMapping: { text: '😢 Churn: {{subscriber.email}} cancelled', channel: '#retention' } }],
    active: false, runCount: 0,
  },
];

// ---------------------------------------------------------------------------
// API KEY VAULT
// ---------------------------------------------------------------------------

export interface APIKey {
  keyId: string;
  name: string;
  key: string;
  service: string;
  scopes: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  active: boolean;
}

export const API_KEY_SCOPES = [
  'read:products',
  'write:products',
  'read:orders',
  'write:orders',
  'read:subscribers',
  'write:subscribers',
  'read:analytics',
  'webhooks:manage',
  'content:publish',
];

export function generateAPIKey(prefix: string = 'sk_live'): string {
  const rand = crypto.randomBytes(20).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
  return `${prefix}_${rand}`;
}

export function rotateKey(key: APIKey): APIKey {
  return {
    ...key,
    keyId: crypto.randomUUID(),
    key: generateAPIKey('sk_live'),
    createdAt: new Date().toISOString(),
    lastUsed: undefined,
    active: true,
  };
}

export interface KeyAuditResult {
  active: number;
  expired: number;
  unused: number;
  riskFlags: string[];
}

export function auditKeyUsage(keys: APIKey[]): KeyAuditResult {
  const now = new Date();
  const active = keys.filter(k => k.active && (!k.expiresAt || new Date(k.expiresAt) > now)).length;
  const expired = keys.filter(k => k.expiresAt && new Date(k.expiresAt) <= now).length;
  const unused = keys.filter(k => !k.lastUsed).length;
  const riskFlags: string[] = [];
  if (unused > 3) riskFlags.push(`${unused} keys have never been used — consider revoking`);
  const oldKeys = keys.filter(k => {
    const age = (now.getTime() - new Date(k.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return age > 90 && !k.expiresAt;
  });
  if (oldKeys.length > 0) riskFlags.push(`${oldKeys.length} keys older than 90 days with no expiry`);
  const broadKeys = keys.filter(k => k.scopes.length >= API_KEY_SCOPES.length);
  if (broadKeys.length > 0) riskFlags.push(`${broadKeys.length} keys have full scope — apply least-privilege`);
  return { active, expired, unused, riskFlags };
}

// ---------------------------------------------------------------------------
// RATE LIMITER
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  endpoint: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstAllowance: number;
}

export interface RateLimitState {
  remaining: number;
  reset: number; // unix timestamp ms
  retryAfter?: number; // seconds
}

export const RATE_LIMIT_CONFIGS: RateLimitConfig[] = [
  { endpoint: '/api/webhooks/deliver', requestsPerMinute: 60, requestsPerHour: 1000, burstAllowance: 10 },
  { endpoint: '/api/orders', requestsPerMinute: 120, requestsPerHour: 3000, burstAllowance: 20 },
  { endpoint: '/api/content/publish', requestsPerMinute: 10, requestsPerHour: 100, burstAllowance: 3 },
  { endpoint: '/api/analytics', requestsPerMinute: 30, requestsPerHour: 500, burstAllowance: 5 },
  { endpoint: '/api/subscribers', requestsPerMinute: 60, requestsPerHour: 1500, burstAllowance: 10 },
  { endpoint: '/api/keys/rotate', requestsPerMinute: 5, requestsPerHour: 20, burstAllowance: 1 },
];

export function checkRateLimit(
  config: RateLimitConfig,
  state: RateLimitState,
): RateLimitState {
  const now = Date.now();
  if (now > state.reset) {
    // window expired — reset
    return {
      remaining: config.requestsPerMinute + config.burstAllowance - 1,
      reset: now + 60_000,
    };
  }
  if (state.remaining <= 0) {
    const retryAfter = Math.ceil((state.reset - now) / 1000);
    return { ...state, retryAfter };
  }
  return { remaining: state.remaining - 1, reset: state.reset };
}
