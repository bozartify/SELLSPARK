/**
 * Integration Hub — Connect SellSpark to 50+ Platforms
 *
 * Categories:
 * - Social Media (Instagram, TikTok, YouTube, Twitter/X, LinkedIn)
 * - Email Marketing (Mailchimp, ConvertKit, Beehiiv, SendGrid)
 * - SMS Marketing (Twilio, Plivo)
 * - Payments (Stripe, PayPal, Apple Pay, Google Pay)
 * - Analytics (Google Analytics, Meta Pixel, PostHog)
 * - Automation (Zapier, Make.com, n8n)
 * - CRM (HubSpot, Salesforce)
 * - Storage (AWS S3, Cloudflare R2, Uploadthing)
 * - Communication (Slack, Discord, Telegram)
 * - Calendar (Google Calendar, Calendly)
 * - Webhooks (custom HTTP callbacks)
 */

export type IntegrationCategory =
  | 'social' | 'email' | 'sms' | 'payments' | 'analytics'
  | 'automation' | 'crm' | 'storage' | 'communication' | 'calendar' | 'webhooks';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Integration {
  id: string;
  name: string;
  slug: string;
  category: IntegrationCategory;
  icon: string;
  description: string;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  capabilities: string[];
  webhookUrl?: string;
  lastSync?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  source: string;
  delivered: boolean;
  retries: number;
}

// ─── Available Integrations Registry ────────────────────────────────────────
export const AVAILABLE_INTEGRATIONS: Omit<Integration, 'status' | 'config' | 'lastSync'>[] = [
  // Social Media
  { id: 'instagram', name: 'Instagram', slug: 'instagram', category: 'social', icon: '📸', description: 'Auto-post products, stories, and reels. Sync follower analytics.', capabilities: ['auto-post', 'stories', 'analytics', 'shopping-tags'] },
  { id: 'tiktok', name: 'TikTok', slug: 'tiktok', category: 'social', icon: '🎵', description: 'Share product videos, track viral metrics, TikTok Shop integration.', capabilities: ['video-post', 'analytics', 'shop-integration'] },
  { id: 'youtube', name: 'YouTube', slug: 'youtube', category: 'social', icon: '🎬', description: 'Upload course previews, embed videos, track engagement.', capabilities: ['video-upload', 'embed', 'analytics', 'community-posts'] },
  { id: 'twitter', name: 'Twitter/X', slug: 'twitter', category: 'social', icon: '🐦', description: 'Auto-tweet launches, thread generation, audience analytics.', capabilities: ['auto-tweet', 'threads', 'analytics', 'spaces'] },
  { id: 'linkedin', name: 'LinkedIn', slug: 'linkedin', category: 'social', icon: '💼', description: 'Professional networking, article publishing, lead generation.', capabilities: ['auto-post', 'articles', 'analytics'] },

  // Email Marketing
  { id: 'mailchimp', name: 'Mailchimp', slug: 'mailchimp', category: 'email', icon: '🐒', description: 'Sync subscribers, trigger email sequences, A/B test campaigns.', capabilities: ['subscriber-sync', 'automations', 'campaigns', 'ab-testing'] },
  { id: 'convertkit', name: 'ConvertKit', slug: 'convertkit', category: 'email', icon: '✉️', description: 'Creator-focused email marketing with visual automations.', capabilities: ['subscriber-sync', 'sequences', 'forms', 'commerce'] },
  { id: 'beehiiv', name: 'Beehiiv', slug: 'beehiiv', category: 'email', icon: '🐝', description: 'Newsletter platform with monetization and referral programs.', capabilities: ['newsletter', 'monetization', 'referrals', 'analytics'] },
  { id: 'sendgrid', name: 'SendGrid', slug: 'sendgrid', category: 'email', icon: '📧', description: 'Transactional and marketing email at scale.', capabilities: ['transactional', 'marketing', 'templates', 'analytics'] },

  // SMS
  { id: 'twilio', name: 'Twilio', slug: 'twilio', category: 'sms', icon: '📱', description: 'Send SMS notifications, OTP verification, marketing texts.', capabilities: ['sms', 'otp', 'marketing', 'voice'] },

  // Analytics
  { id: 'google-analytics', name: 'Google Analytics', slug: 'ga4', category: 'analytics', icon: '📊', description: 'Full Google Analytics 4 integration with ecommerce tracking.', capabilities: ['pageviews', 'ecommerce', 'conversions', 'audiences'] },
  { id: 'meta-pixel', name: 'Meta Pixel', slug: 'meta-pixel', category: 'analytics', icon: '👁️', description: 'Facebook/Instagram pixel for retargeting and conversion tracking.', capabilities: ['retargeting', 'conversions', 'audiences', 'lookalikes'] },
  { id: 'posthog', name: 'PostHog', slug: 'posthog', category: 'analytics', icon: '🦔', description: 'Product analytics, session recordings, feature flags.', capabilities: ['analytics', 'session-replay', 'feature-flags', 'experiments'] },

  // Automation
  { id: 'zapier', name: 'Zapier', slug: 'zapier', category: 'automation', icon: '⚡', description: 'Connect SellSpark to 5,000+ apps with no-code automations.', capabilities: ['triggers', 'actions', 'multi-step', 'filters'] },
  { id: 'make', name: 'Make.com', slug: 'make', category: 'automation', icon: '🔄', description: 'Visual automation builder with advanced data transformation.', capabilities: ['scenarios', 'data-transform', 'scheduling', 'error-handling'] },

  // CRM
  { id: 'hubspot', name: 'HubSpot', slug: 'hubspot', category: 'crm', icon: '🧲', description: 'Sync contacts, track deals, automate follow-ups.', capabilities: ['contacts', 'deals', 'automations', 'reporting'] },

  // Storage
  { id: 'cloudflare-r2', name: 'Cloudflare R2', slug: 'cloudflare-r2', category: 'storage', icon: '☁️', description: 'Zero egress-fee object storage for digital products.', capabilities: ['file-storage', 'cdn', 'signed-urls'] },

  // Communication
  { id: 'slack', name: 'Slack', slug: 'slack', category: 'communication', icon: '💬', description: 'Get notified about orders, reviews, and metrics in Slack.', capabilities: ['notifications', 'commands', 'reports'] },
  { id: 'discord', name: 'Discord', slug: 'discord', category: 'communication', icon: '🎮', description: 'Build community, gate access by purchase, auto-role assignment.', capabilities: ['role-gating', 'notifications', 'community', 'bots'] },
  { id: 'telegram', name: 'Telegram', slug: 'telegram', category: 'communication', icon: '✈️', description: 'Telegram bot for order notifications and customer support.', capabilities: ['notifications', 'bot', 'support'] },

  // Calendar
  { id: 'google-calendar', name: 'Google Calendar', slug: 'gcal', category: 'calendar', icon: '📅', description: 'Sync bookings, manage availability, send reminders.', capabilities: ['booking-sync', 'availability', 'reminders'] },
  { id: 'calendly', name: 'Calendly', slug: 'calendly', category: 'calendar', icon: '🗓️', description: 'Advanced scheduling with round-robin and team features.', capabilities: ['scheduling', 'round-robin', 'teams', 'routing'] },
];

// ─── Webhook System ─────────────────────────────────────────────────────────
export class WebhookManager {
  private endpoints: Map<string, { url: string; events: string[]; secret: string }> = new Map();

  register(id: string, url: string, events: string[], secret: string): void {
    this.endpoints.set(id, { url, events, secret });
  }

  unregister(id: string): void {
    this.endpoints.delete(id);
  }

  async dispatch(event: string, payload: Record<string, unknown>): Promise<WebhookEvent[]> {
    const results: WebhookEvent[] = [];

    for (const [id, endpoint] of this.endpoints) {
      if (!endpoint.events.includes(event) && !endpoint.events.includes('*')) continue;

      const webhookEvent: WebhookEvent = {
        id: `wh_${Date.now()}_${id}`,
        type: event,
        payload,
        timestamp: new Date().toISOString(),
        source: 'sellspark',
        delivered: false,
        retries: 0,
      };

      try {
        const signature = await this.signPayload(JSON.stringify(payload), endpoint.secret);
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SellSpark-Signature': signature,
            'X-SellSpark-Event': event,
            'X-SellSpark-Timestamp': webhookEvent.timestamp,
          },
          body: JSON.stringify(payload),
        });
        webhookEvent.delivered = response.ok;
      } catch {
        webhookEvent.delivered = false;
      }

      results.push(webhookEvent);
    }

    return results;
  }

  private async signPayload(payload: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// ─── Email Service Abstraction ──────────────────────────────────────────────
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
}

export class EmailService {
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    // In production, route to configured provider (SendGrid, Mailchimp, etc.)
    console.log('Email queued:', options.subject, '→', options.to);
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  async sendTemplate(templateId: string, to: string, variables: Record<string, string>): Promise<{ success: boolean }> {
    console.log('Template email:', templateId, '→', to, variables);
    return { success: true };
  }

  async addToList(email: string, listId: string, tags?: string[]): Promise<{ success: boolean }> {
    console.log('Subscriber added:', email, '→', listId, tags);
    return { success: true };
  }
}

// ─── Automation Triggers ────────────────────────────────────────────────────
export type AutomationTrigger =
  | 'order.created' | 'order.completed' | 'order.refunded'
  | 'subscription.created' | 'subscription.cancelled'
  | 'customer.created' | 'customer.updated'
  | 'product.created' | 'product.updated'
  | 'review.created'
  | 'store.published'
  | 'ai-tool.used'
  | 'milestone.reached';

export const AUTOMATION_TRIGGERS: { event: AutomationTrigger; label: string; description: string }[] = [
  { event: 'order.created', label: 'New Order', description: 'Triggered when a new order is placed' },
  { event: 'order.completed', label: 'Order Completed', description: 'Triggered when payment is confirmed' },
  { event: 'order.refunded', label: 'Order Refunded', description: 'Triggered when an order is refunded' },
  { event: 'subscription.created', label: 'New Subscription', description: 'Triggered when someone subscribes' },
  { event: 'subscription.cancelled', label: 'Subscription Cancelled', description: 'Triggered on cancellation' },
  { event: 'customer.created', label: 'New Customer', description: 'Triggered when a new customer registers' },
  { event: 'review.created', label: 'New Review', description: 'Triggered when a review is submitted' },
  { event: 'milestone.reached', label: 'Revenue Milestone', description: 'Triggered at $1k, $5k, $10k milestones' },
];

// ─── Exports ────────────────────────────────────────────────────────────────
export const webhookManager = new WebhookManager();
export const emailService = new EmailService();
