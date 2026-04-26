import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'API & Developer Platform — SellSpark' };

const CAPS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'plug', title: '20+ REST endpoints', desc: 'Stores, products, orders, customers, subscriptions, analytics, AI.' },
  { icon: 'spark', title: 'HMAC webhooks', desc: '40+ event types, automatic retries, signature verification, replay protection.' },
  { icon: 'web', title: 'GraphQL (beta)', desc: 'Introspectable schema, persisted queries, subscriptions over WebSockets.' },
  { icon: 'book', title: 'Typed SDKs', desc: 'JavaScript, Python, Go, Ruby, Swift — generated from OpenAPI.' },
  { icon: 'wrench', title: 'CLI + Terraform', desc: 'IaC for stores, API keys, webhooks, and pricing plans.' },
  { icon: 'mirror', title: 'Sandbox per branch', desc: 'Preview stores with mocked data for every PR.' },
  { icon: 'lock', title: 'OAuth 2.0 + PKCE', desc: 'Build apps for the Marketplace, request scopes, refresh tokens.' },
  { icon: 'bot', title: 'AI endpoints', desc: 'Generate copy, embeddings, classify creator, voice intent — pay per token.' },
];

const SAMPLE = `// Create a product, programmatically
import { SellSpark } from '@sellspark/sdk';

const ss = new SellSpark({ apiKey: process.env.SELLSPARK_KEY! });

const product = await ss.products.create({
  storeId: 'store_8f2c',
  name: '12-Week Fitness Plan',
  price: 9700,            // cents
  currency: 'USD',
  type: 'digital',
  files: ['s3://uploads/plan.pdf'],
  ai: { generateSEO: true, generateThumbnail: true },
});

await ss.webhooks.subscribe({
  url: 'https://yourapp.com/hook',
  events: ['order.paid', 'subscription.renewed'],
});`;

export default function ApiPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Developer platform"
        title="The API"
        italic="under everything"
        suffix="."
        subtitle="Every pixel of SellSpark is built on the same public API. If it's in the dashboard, it's in the API. Documented, typed, versioned."
        ctaHref="/auth/signup"
        ctaLabel="Get an API key"
        secondaryHref="/docs"
        secondaryLabel="Read the reference"
      />
      <PageSection eyebrow="Capabilities" title="Build" italic="anything">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CAPS.map((c, i) => (
            <Reveal key={c.title} delay={i * 40}>
              <Tilt max={5}>
                <div className="rounded-2xl p-6 h-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="mb-4" style={{ color: 'var(--purple-glow)' }}><Icon name={c.icon} size={26} /></div>
                  <div className="fr-display text-[20px] leading-tight mb-2" style={{ color: 'var(--ivory)' }}>{c.title}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{c.desc}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Code" title="Real" italic="snippets">
        <Reveal>
          <div className="rounded-2xl p-1 fr-holo-border">
            <pre className="rounded-xl p-7 fr-mono text-[12px] leading-[1.7] overflow-auto"
              style={{ background: '#0c0a18', color: '#e2dcfb' }}>
              <code>{SAMPLE}</code>
            </pre>
          </div>
        </Reveal>
      </PageSection>
      <PageSection eyebrow="Quick links" title="Jump" italic="straight in">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { t: 'Quickstart →', h: '/docs', d: 'Authenticate and make your first request in 3 minutes.' },
            { t: 'Webhook events →', h: '/docs', d: 'All 40+ events with payload schemas and retry semantics.' },
            { t: 'Build for the marketplace →', h: '/marketplace', d: 'Publish a third-party app and earn revenue share.' },
          ].map((l) => (
            <Reveal key={l.t}>
              <Link href={l.h} className="block rounded-2xl p-7"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-display text-[22px] mb-2" style={{ color: 'var(--ivory)' }}>{l.t}</div>
                <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>{l.d}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Build on SellSpark." italic="Ship for years." primary={{ href: '/auth/signup', label: 'Get API key' }} secondary={{ href: '/docs', label: 'Reference' }} />
    </MarketingShell>
  );
}
