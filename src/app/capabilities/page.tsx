import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt, Counter } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Platform Capabilities — SellSpark' };

const PILLARS: { icon: IconName; eyebrow: string; title: string; desc: string; bullets: string[] }[] = [
  {
    icon: 'spark', eyebrow: 'Performance', title: 'Edge-native, sub-100ms',
    desc: 'Every storefront runs at the edge across 320+ POPs. Median TTFB worldwide: 38ms.',
    bullets: ['Cloudflare + Vercel hybrid edge', 'HTTP/3 + 0-RTT', 'Brotli 11 by default', 'Image optimization on the fly', 'Tiered caching with stale-while-revalidate', 'Realtime via WebTransport'],
  },
  {
    icon: 'shield', eyebrow: 'Security', title: 'Post-quantum by default',
    desc: 'CRYSTALS-Kyber + AES-256-GCM hybrid. Zero-knowledge auth. Optional BB84 QKD.',
    bullets: ['SOC 2 Type II audited', 'ISO 27001:2022 certified', 'GDPR / CCPA / PIPEDA / LGPD ready', 'HIPAA-eligible enterprise tier', 'PCI-DSS Level 1 (Stripe-backed)', 'FIPS 140-3 HSM key storage'],
  },
  {
    icon: 'brain', eyebrow: 'AI', title: 'Native intelligence everywhere',
    desc: 'Six autonomous agents, on-device Spark-Nano, federated learning across cohorts.',
    bullets: ['Multi-model routing (Claude, GPT, Gemini, Mistral)', 'Bring-your-own model + key', 'Embeddings + vector search built-in', 'Thompson-sampled bandits', 'LinUCB recommender', 'Federated cohort training'],
  },
  {
    icon: 'globe', eyebrow: 'Scale', title: 'Built for the long tail',
    desc: 'From your first sale to 10M MRR — same platform, no rearchitecting.',
    bullets: ['Multi-region active-active', 'Horizontal Postgres via Citus', 'Per-tenant Redis isolation', '10M req/s sustained', '99.99% SLA on Business+', 'Dedicated VPC on Enterprise'],
  },
  {
    icon: 'globe', eyebrow: 'Reach', title: 'Sell anywhere on Earth',
    desc: '220+ countries, 135+ currencies, 47+ languages, 30+ tax regions auto-handled.',
    bullets: ['Auto-translate via on-device LLM', 'Locale-aware pricing', 'VAT, GST, sales tax compliance', 'Geo-fenced rollouts', 'IPv6 + low-bandwidth fallbacks', 'Pan-African Africa Hub stack'],
  },
  {
    icon: 'plug', eyebrow: 'Extensibility', title: 'Hackable from end to end',
    desc: 'REST + webhooks + GraphQL + SDKs in 5 languages. Embed, white-label, or fork.',
    bullets: ['20+ REST endpoints', 'HMAC-signed webhooks', 'Typed SDKs (JS, Python, Go, Ruby, Swift)', 'OAuth 2.0 + PKCE', 'Embeddable widgets', 'Marketplace SDK for third-party apps'],
  },
];

const STATS = [
  { v: 99.99, suffix: '%', label: 'SLA uptime' },
  { v: 38, suffix: 'ms', label: 'Median TTFB' },
  { v: 320, suffix: '+', label: 'Edge POPs' },
  { v: 10, suffix: 'M req/s', label: 'Peak throughput' },
];

export default function CapabilitiesPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Platform capabilities"
        title="Engineered for"
        italic="enterprise scale"
        suffix="."
        subtitle="From the post-quantum crypto layer to edge-native rendering, every piece of SellSpark is built for the next decade of creator commerce."
        ctaHref="/enterprise"
        ctaLabel="Talk to sales"
        secondaryHref="/security"
        secondaryLabel="Security details"
      />
      <PageSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <Reveal key={s.label}>
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-display text-[44px] leading-none fr-gradient-animated">
                  <Counter to={s.v} suffix={s.suffix} decimals={s.v < 100 && s.v % 1 !== 0 ? 2 : s.v < 100 ? 0 : 0} />
                </div>
                <div className="fr-mono text-[10px] uppercase tracking-widest mt-2" style={{ color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      {PILLARS.map((p, idx) => (
        <PageSection key={p.title} eyebrow={p.eyebrow}
          title={p.title.split(' ').slice(0, -2).join(' ') || p.title}
          italic={p.title.split(' ').slice(-2).join(' ')}
          subtitle={p.desc}>
          <Reveal>
            <Tilt max={3}>
              <div className="rounded-2xl p-8" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="flex items-start gap-6">
                  <div className="shrink-0" style={{ color: 'var(--purple-glow)' }}><Icon name={p.icon} size={40} /></div>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 flex-1">
                    {p.bullets.map((b) => (
                      <div key={b} className="flex gap-3 text-[14px]" style={{ color: 'var(--text-2)' }}>
                        <span style={{ color: 'var(--purple-glow)' }}>✦</span>{b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tilt>
          </Reveal>
        </PageSection>
      ))}
      <PageCTA title="Ready for enterprise?" italic="Let's talk." primary={{ href: '/enterprise', label: 'Contact sales' }} secondary={{ href: '/security', label: 'Security & compliance' }} />
    </MarketingShell>
  );
}
