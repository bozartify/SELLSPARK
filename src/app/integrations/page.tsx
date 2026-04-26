import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';

export const metadata = { title: 'Integrations — SellSpark' };

const CATEGORIES = [
  {
    title: 'Payments & finance',
    italic: 'Move money',
    items: [
      'Stripe', 'Stripe Connect', 'PayPal', 'Apple Pay', 'Google Pay', 'Klarna', 'Afterpay',
      'Coinbase Commerce', 'BitPay', 'Lightning Network', 'Wise', 'Plaid', 'QuickBooks', 'Xero',
    ],
  },
  {
    title: 'Communication',
    italic: 'Talk to humans',
    items: ['Slack', 'Discord', 'Microsoft Teams', 'Telegram', 'WhatsApp Business', 'Twilio', 'SendGrid', 'Postmark', 'Resend', 'Intercom', 'Crisp', 'Front'],
  },
  {
    title: 'Productivity & docs',
    italic: 'Stay organized',
    items: ['Notion', 'Airtable', 'Google Workspace', 'Microsoft 365', 'Linear', 'Asana', 'Trello', 'ClickUp', 'Monday', 'Coda', 'Dropbox', 'Box'],
  },
  {
    title: 'Marketing & analytics',
    italic: 'Measure & grow',
    items: ['Google Analytics 4', 'Mixpanel', 'Amplitude', 'PostHog', 'Segment', 'Meta Ads', 'TikTok Ads', 'Google Ads', 'LinkedIn Ads', 'Klaviyo', 'Mailchimp', 'HubSpot', 'Salesforce', 'Customer.io'],
  },
  {
    title: 'Content & creative',
    italic: 'Make & publish',
    items: ['YouTube', 'Vimeo', 'Mux', 'Cloudflare Stream', 'Zoom', 'Riverside', 'Loom', 'Canva', 'Figma', 'Adobe Express', 'Descript', 'ElevenLabs'],
  },
  {
    title: 'Automation & dev',
    italic: 'Wire it together',
    items: ['Zapier', 'Make', 'n8n', 'Pipedream', 'GitHub', 'GitLab', 'Vercel', 'Cloudflare Workers', 'AWS S3', 'R2', 'Datadog', 'Sentry'],
  },
  {
    title: 'AI & ML',
    italic: 'Built-in or bring-your-own',
    items: ['Anthropic Claude', 'OpenAI GPT', 'Google Gemini', 'Mistral', 'Cohere', 'Perplexity', 'ElevenLabs', 'Replicate', 'Hugging Face', 'Pinecone', 'Weaviate', 'Modal'],
  },
  {
    title: 'Identity & compliance',
    italic: 'Trust the chain',
    items: ['Okta', 'Auth0', 'WorkOS', 'Cloudflare Turnstile', 'Persona', 'Onfido', 'Sumsub', 'TaxJar', 'Avalara', 'Vanta', 'Drata'],
  },
];

export default function IntegrationsPage() {
  const total = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Integrations — plays well with everything"
        title="Connect"
        italic={`${total}+ tools`}
        suffix="."
        subtitle="Out-of-the-box connectors, programmatic webhooks, and a full REST API. If it has an API, SellSpark talks to it."
        ctaHref="/onboarding"
        ctaLabel="Start free"
        secondaryHref="/docs"
        secondaryLabel="API reference"
      />
      {CATEGORIES.map((c) => (
        <PageSection key={c.title} eyebrow={c.title} title={c.title.split(' ')[0]} italic={c.italic}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {c.items.map((it, i) => (
              <Reveal key={it} delay={i * 25}>
                <Tilt max={4}>
                  <div className="rounded-xl p-4 h-[68px] flex items-center justify-center text-center fr-display text-[15px]"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}>
                    {it}
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </PageSection>
      ))}
      <PageCTA title="Don't see yours?" italic="Build it via webhooks." primary={{ href: '/docs', label: 'Read API docs' }} secondary={{ href: '/contact', label: 'Request integration' }} />
    </MarketingShell>
  );
}
