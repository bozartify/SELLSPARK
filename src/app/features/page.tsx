import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Features — SellSpark' };

const GROUPS: { title: string; italic: string; features: { icon: IconName; title: string; desc: string }[] }[] = [
  {
    title: 'AI', italic: 'intelligence',
    features: [
      { icon: 'brain', title: 'AI Store Builder', desc: '60-second storefront generation with VQC niche detection.' },
      { icon: 'chart', title: 'Revenue Forecasting', desc: 'Linear regression + seasonal decomposition + Prophet.' },
      { icon: 'flask', title: 'Thompson-sampled A/B', desc: 'Bayesian bandits pick winners in real time.' },
      { icon: 'bot', title: 'LinUCB Recommender', desc: 'Contextual bandit upsell engine.' },
      { icon: 'spark', title: 'Spark-Nano on-device', desc: 'Local 3B model for offline inference and privacy.' },
      { icon: 'pen', title: 'AI copywriting', desc: 'Headlines, sales pages, emails, social — on-brand.' },
      { icon: 'film', title: 'Video summarization', desc: 'Auto-clips, chapters, captions, thumbnails.' },
      { icon: 'web', title: 'SEO autopilot', desc: 'Keyword research, meta tags, schema, internal linking.' },
    ],
  },
  {
    title: 'Quantum', italic: 'security',
    features: [
      { icon: 'lock', title: 'CRYSTALS-Kyber KEM', desc: 'Lattice-based post-quantum key exchange.' },
      { icon: 'shield', title: 'BB84 QKD', desc: 'Quantum key distribution for session fingerprints.' },
      { icon: 'keyhole', title: 'Zero-knowledge auth', desc: 'Schnorr proofs — no password leaks ever.' },
      { icon: 'atom', title: 'Homomorphic rollup', desc: 'Aggregate encrypted metrics without decrypting.' },
      { icon: 'vault', title: 'HSM key vault', desc: 'FIPS 140-3 hardware-backed private keys.' },
      { icon: 'radar', title: 'Fraud graph AI', desc: 'GNN-based ring detection, anomaly scoring.' },
      { icon: 'scales', title: 'Compliance ledger', desc: 'Tamper-evident audit chain, GDPR DSAR automation.' },
      { icon: 'shield', title: 'DDoS shield', desc: 'Cloudflare Magic Transit + L7 rate limiters.' },
    ],
  },
  {
    title: 'Creator', italic: 'tools',
    features: [
      { icon: 'film', title: 'Live Streaming', desc: 'WebRTC studio, overlays, chat, in-stream checkout.' },
      { icon: 'mobile', title: 'PWA + iOS + Android', desc: 'Install anywhere, works offline, push notifications.' },
      { icon: 'handshake', title: 'Affiliates', desc: 'Tiered bronze → platinum commission engine.' },
      { icon: 'chat', title: 'Community', desc: 'Chat rooms, waitlists, testimonial walls.' },
      { icon: 'pen', title: 'Content Studio', desc: 'Multi-platform repurposing, brand voice, calendar.' },
      { icon: 'grad', title: 'Cohort courses', desc: 'Drip schedules, certificates, student analytics.' },
      { icon: 'calendar', title: 'Bookings', desc: 'Calendar sync, packages, deposits, video rooms.' },
      { icon: 'mail', title: 'Email builder', desc: 'Drag-drop, automations, deliverability dashboard.' },
    ],
  },
  {
    title: 'Commerce', italic: 'rails',
    features: [
      { icon: 'globe', title: '7-chain wallet', desc: 'ETH, Base, Polygon, Solana, BTC, Lightning, L2.' },
      { icon: 'receipt', title: '30+ tax regions', desc: 'Auto-calc VAT, GST, US sales tax, EU OSS.' },
      { icon: 'gem', title: 'Smart bundles & coupons', desc: 'Programmatic discounts with guardrails.' },
      { icon: 'box', title: 'DRM & licensing', desc: 'Activation keys, revocation lists, watermarks.' },
      { icon: 'gavel', title: 'Auctions & drops', desc: 'Time-boxed, reserve pricing, allow-lists.' },
      { icon: 'diamond', title: 'Memberships', desc: 'Recurring tiers, gating, dunning recovery.' },
      { icon: 'cash', title: 'Stripe Connect', desc: 'Instant payouts in 47 countries.' },
      { icon: 'card', title: 'BNPL ready', desc: 'Klarna, Afterpay, Affirm — opt-in per product.' },
    ],
  },
  {
    title: 'Developer', italic: 'platform',
    features: [
      { icon: 'plug', title: 'REST + Webhooks', desc: '20+ endpoints, HMAC-signed deliveries.' },
      { icon: 'book', title: 'SDKs in 5 langs', desc: 'JS, Python, Go, Ruby, Swift — typed and versioned.' },
      { icon: 'cog', title: '50+ integrations', desc: 'Stripe, Slack, Notion, Zapier, Make, n8n…' },
      { icon: 'stack', title: 'Embeddable widgets', desc: '5 widget types, framework-agnostic.' },
      { icon: 'wrench', title: 'CLI & Terraform', desc: 'IaC for stores, API keys, webhooks, plans.' },
      { icon: 'mirror', title: 'Sandbox environments', desc: 'Per-branch preview stores with mock data.' },
      { icon: 'web', title: 'GraphQL (beta)', desc: 'Schema introspection, persisted queries.' },
      { icon: 'spark', title: 'Edge Functions', desc: 'Deploy custom logic at every POP.' },
    ],
  },
  {
    title: 'Autonomous', italic: 'agents',
    features: [
      { icon: 'rocket', title: 'Growth Agent', desc: 'Runs funnel optimization and SEO 24/7.' },
      { icon: 'users', title: 'Support Agent', desc: '<60s tickets, CSAT >95%, multilingual.' },
      { icon: 'wrench', title: 'Ops Agent', desc: 'Monitors infra, cost, and security.' },
      { icon: 'pen', title: 'Content Agent', desc: 'Ships daily on-brand content.' },
      { icon: 'cash', title: 'Finance Agent', desc: 'Reconciliation, invoicing, tax prep.' },
      { icon: 'shield', title: 'Trust Agent', desc: 'Reviews flagged content, KYC, refund risk.' },
    ],
  },
  {
    title: 'Mobile', italic: '& spatial',
    features: [
      { icon: 'mobile', title: 'Native iOS app', desc: 'Live Activities, widgets, dynamic island.' },
      { icon: 'mobile', title: 'Native Android', desc: 'Material You theming, app shortcuts.' },
      { icon: 'crystal', title: 'Vision Pro', desc: 'Spatial commerce, immersive product demos.' },
      { icon: 'globe', title: 'Meta Quest', desc: 'VR storefronts, live shopping in 3D.' },
      { icon: 'plug', title: 'CarPlay & Auto', desc: 'Audiobook + course playback in vehicles.' },
      { icon: 'mobile', title: 'Apple Watch', desc: 'Sales notifications, payout alerts.' },
    ],
  },
  {
    title: 'Reach', italic: 'globally',
    features: [
      { icon: 'translate', title: 'Auto-translate 47 langs', desc: 'On-device LLM, no API costs.' },
      { icon: 'globe', title: '135+ currencies', desc: 'Locale-aware pricing & rounding.' },
      { icon: 'africa', title: 'Africa Hub', desc: 'M-Pesa, Flutterwave, low-bandwidth UX.' },
      { icon: 'web', title: 'IPv6 + offline-first', desc: 'Works on 2G in remote regions.' },
      { icon: 'plug', title: 'Geo-fenced rollouts', desc: 'Region-locked pricing, content, payment methods.' },
      { icon: 'scales', title: 'Per-region residency', desc: 'EU, US, UK, AU, IN, BR data pinning.' },
    ],
  },
];

export default function FeaturesPage() {
  const total = GROUPS.reduce((n, g) => n + g.features.length, 0);
  return (
    <MarketingShell>
      <PageHero
        eyebrow={`Features — ${total}+ shipping today`}
        title="Eight stacks."
        italic="One platform"
        suffix="."
        subtitle="From post-quantum crypto to spatial commerce — every creator-economy primitive in one place. Each feature is opt-in, composable, and API-first."
      />
      {GROUPS.map((g) => (
        <PageSection key={g.title} eyebrow={g.title.toUpperCase()} title={g.title} italic={g.italic}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {g.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 50}>
                <Tilt max={5}>
                  <div className="rounded-2xl p-6 h-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                    <div className="mb-4" style={{ color: 'var(--purple-glow)' }}>
                      <Icon name={f.icon} size={26} />
                    </div>
                    <div className="fr-display text-[20px] leading-tight mb-2" style={{ color: 'var(--ivory)' }}>{f.title}</div>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{f.desc}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </PageSection>
      ))}
      <PageCTA title="Ship in 47 seconds." italic="Scale for years." primary={{ href: '/onboarding', label: 'Build my store' }} secondary={{ href: '/capabilities', label: 'Platform deep-dive' }} />
    </MarketingShell>
  );
}
