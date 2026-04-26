import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt, Magnetic } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';
import Link from 'next/link';

export const metadata = { title: 'Products — SellSpark' };

const PRODUCTS: { icon: IconName; name: string; tagline: string; desc: string; tag: string; href: string }[] = [
  { icon: 'store', name: 'Storefronts', tagline: 'AI-built in 47 seconds', desc: 'Branded multi-product stores with checkout, domains, SEO, and quantum-safe payments.', tag: 'Core', href: '/features' },
  { icon: 'box', name: 'Digital Products', tagline: 'From templates to full courses', desc: 'PDFs, audio, video, software, license keys, DRM, and unlimited file size.', tag: 'Core', href: '/features' },
  { icon: 'grad', name: 'Cohort Courses', tagline: 'Drip + live + certificates', desc: 'Modules, lessons, quizzes, certificates, and student progress analytics.', tag: 'Studio', href: '/features' },
  { icon: 'diamond', name: 'Memberships', tagline: 'Recurring, gated, unlimited', desc: 'Tiered subscriptions, content gating, monthly/annual billing, dunning recovery.', tag: 'Core', href: '/features' },
  { icon: 'film', name: 'Live Studio', tagline: 'Stream & sell in one click', desc: 'WebRTC streaming, in-stream checkout, live polls, replays, and clip generation.', tag: 'Studio', href: '/features' },
  { icon: 'gavel', name: 'Auctions & Drops', tagline: 'Limited-edition mechanics', desc: 'Time-boxed sales, NFT-backed certificates, allow-lists, and reserve pricing.', tag: 'Commerce', href: '/features' },
  { icon: 'calendar', name: 'Bookings', tagline: 'Coaching & 1:1 calls', desc: 'Calendar sync, packages, intake forms, video room provisioning, deposits.', tag: 'Studio', href: '/features' },
  { icon: 'mail', name: 'Email & SMS', tagline: 'Sequences that convert', desc: 'Drag-drop builder, triggered automations, deliverability dashboard, A/B subjects.', tag: 'Studio', href: '/features' },
  { icon: 'bot', name: 'AI Agents', tagline: 'Six autonomous workers', desc: 'Growth, support, ops, content, finance, and trust agents running 24/7.', tag: 'AI', href: '/features' },
  { icon: 'chart', name: 'Analytics Pro', tagline: 'Cohorts, attribution, LTV', desc: 'Real-time dashboards, multi-touch attribution, churn modeling, revenue forecasts.', tag: 'AI', href: '/features' },
  { icon: 'flask', name: 'Experiments', tagline: 'Bayesian A/B at scale', desc: 'Thompson-sampled bandits across pricing, copy, layout, and onboarding flows.', tag: 'AI', href: '/features' },
  { icon: 'web', name: 'Audience Graph', tagline: 'Know every cohort', desc: 'Unified profiles across email, social, payment, and on-platform behavior.', tag: 'AI', href: '/features' },
  { icon: 'handshake', name: 'Affiliates', tagline: 'Programmatic referrals', desc: 'Tiered commissions, fraud detection, deep links, and instant payouts.', tag: 'Growth', href: '/features' },
  { icon: 'trophy', name: 'Loyalty & XP', tagline: 'Gamified retention', desc: 'Points, levels, streaks, badges, redemption store, and SDK for custom logic.', tag: 'Growth', href: '/features' },
  { icon: 'gem', name: 'Universal Wallet', tagline: '7 chains, one balance', desc: 'ETH, Base, Polygon, Solana, BTC, Lightning, SellSpark-L2 — auto-bridged.', tag: 'Commerce', href: '/features' },
  { icon: 'vote', name: 'Creator DAO', tagline: 'Token-gated communities', desc: 'Issue creator tokens, run governance, manage treasury, distribute yield.', tag: 'Web3', href: '/features' },
  { icon: 'mobile', name: 'PWA + Native', tagline: 'iOS, Android, install anywhere', desc: 'Offline-first, push notifications, biometric auth, App Store + Play Store ready.', tag: 'Platform', href: '/features' },
  { icon: 'plug', name: 'API & Webhooks', tagline: 'Build anything on top', desc: '20+ REST endpoints, HMAC-signed webhooks, typed SDKs, GraphQL on request.', tag: 'Platform', href: '/docs' },
];

const TAG_COLORS: Record<string, string> = {
  Core: '#a78bfa', Studio: '#60a5fa', Commerce: '#4ade80', AI: '#f472b6',
  Growth: '#f59e0b', Web3: '#22d3ee', Platform: '#c084fc',
};

export default function ProductsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="The full product suite"
        title="Eighteen products."
        italic="One OS"
        suffix="."
        subtitle="Everything a modern creator business needs — built to work together, priced to scale, secured by post-quantum cryptography."
        ctaHref="/onboarding"
        ctaLabel="Start free"
        secondaryHref="/pricing"
        secondaryLabel="See pricing"
      />
      <PageSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 40}>
              <Tilt max={5}>
                <Link href={p.href} className="block rounded-2xl p-7 h-full"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="flex items-start justify-between mb-5">
                    <div style={{ color: 'var(--purple-glow)' }}><Icon name={p.icon} size={30} /></div>
                    <span className="fr-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
                      style={{ background: `${TAG_COLORS[p.tag]}22`, color: TAG_COLORS[p.tag], border: `1px solid ${TAG_COLORS[p.tag]}44` }}>
                      {p.tag}
                    </span>
                  </div>
                  <div className="fr-display text-[26px] leading-tight mb-1" style={{ color: 'var(--ivory)' }}>{p.name}</div>
                  <div className="fr-mono text-[11px] uppercase tracking-widest mb-4" style={{ color: 'var(--purple-glow)' }}>{p.tagline}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{p.desc}</p>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="One platform." italic="Eighteen products." primary={{ href: '/onboarding', label: 'Build your stack' }} secondary={{ href: '/enterprise', label: 'Enterprise tier' }} />
    </MarketingShell>
  );
}
