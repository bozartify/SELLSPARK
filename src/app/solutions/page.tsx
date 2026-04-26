import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Solutions — SellSpark' };

const VERTICALS: { icon: IconName; who: string; headline: string; desc: string; features: string[] }[] = [
  { icon: 'pen', who: 'Writers & Newsletters', headline: 'Monetize every word', desc: 'Paid tiers, gated archives, AI repurposing across 5 platforms.', features: ['Paid newsletter', 'Member-only archives', 'AI tweet threads'] },
  { icon: 'film', who: 'Video Creators', headline: 'Beyond AdSense', desc: 'Courses, memberships, live shopping, sponsor marketplace.', features: ['Live shopping', 'Sponsor matching', 'Clip auto-gen'] },
  { icon: 'grad', who: 'Course Creators', headline: 'Ship a cohort in a weekend', desc: 'AI outlines, video hosting, certificates, affiliate engine.', features: ['Cohort scheduling', 'Quizzes & certs', 'Affiliate tier'] },
  { icon: 'handshake', who: 'Coaches', headline: 'Productize your practice', desc: 'Booking, packages, intake forms, white-label client portals.', features: ['1:1 booking', 'Group programs', 'Client portal'] },
  { icon: 'store', who: 'Digital Sellers', headline: 'From $9 to $999 bundles', desc: 'DRM, license keys, upsells, post-purchase automation.', features: ['License keys', 'One-click upsells', 'Bundle builder'] },
  { icon: 'arm', who: 'Fitness Creators', headline: 'Train millions, profit predictably', desc: 'Workout libraries, meal plans, app + web + watch sync.', features: ['Workout streaming', 'Meal plans', 'Wearables sync'] },
  { icon: 'leaf', who: 'Wellness & Mindfulness', headline: 'Calm, monetized', desc: 'Audio drops, breathwork, sleep stories, recurring memberships.', features: ['Audio library', 'Daily drips', 'Quiet mode UI'] },
  { icon: 'flask', who: 'Educators & Tutors', headline: 'Teach without LMS pain', desc: 'Multi-class scheduling, parent/student portals, automated grading.', features: ['Multi-class', 'Parent portal', 'Auto-grading'] },
  { icon: 'spark', who: 'Artists & Creatives', headline: 'Sell originals + prints + commissions', desc: 'Print-on-demand, NFT minting, commission queue, gallery mode.', features: ['POD fulfillment', 'NFT mint', 'Commission queue'] },
  { icon: 'film', who: 'Podcasters', headline: 'Pod + sponsorship + memberships', desc: 'Private feeds, dynamic ad insertion, transcript paywalls.', features: ['Private feeds', 'Dynamic ads', 'Transcript gate'] },
  { icon: 'gem', who: 'Musicians', headline: 'Direct-to-fan, Spotify-free', desc: 'Album drops, vinyl pre-orders, ticketed livestreams, fan tokens.', features: ['Album drops', 'Vinyl POs', 'Fan tokens'] },
  { icon: 'mobile', who: 'Mobile-first creators', headline: 'TikTok + IG + YT in one', desc: 'Link-in-bio plus full storefront, optimized for tap.', features: ['Link-in-bio', 'Story commerce', 'Mobile checkout'] },
  { icon: 'atom', who: 'Agencies & studios', headline: 'White-label the OS', desc: 'Multi-tenant, 0% platform fees, dedicated CSM, custom domain per client.', features: ['Multi-tenant', '0% fees', 'White-label'] },
  { icon: 'globe', who: 'Enterprise creators', headline: 'Brands at scale', desc: 'Dedicated VPC, SSO, custom DPA, 24/7 support, on-prem option.', features: ['Dedicated VPC', 'SSO + SCIM', '24/7 SLA'] },
  { icon: 'africa', who: 'Africa & emerging markets', headline: 'Built for low-bandwidth', desc: 'M-Pesa, Flutterwave, USSD fallbacks, edge POPs in Lagos & Nairobi.', features: ['M-Pesa', 'USSD checkout', 'Edge in Africa'] },
  { icon: 'users', who: 'Communities & DAOs', headline: 'Token-gated everything', desc: 'Membership tokens, governance, treasury, reputation systems.', features: ['Token gating', 'Governance', 'Treasury'] },
];

export default function SolutionsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow={`Solutions — ${VERTICALS.length} verticals served`}
        title="One platform."
        italic="Every creator"
        suffix="."
        subtitle="Whether you ship words, videos, courses, or consulting — SellSpark adapts to your shape, your audience, your jurisdiction."
        ctaHref="/onboarding"
        ctaLabel="Find your fit"
        secondaryHref="/products"
        secondaryLabel="Browse products"
      />
      <PageSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VERTICALS.map((s, i) => (
            <Reveal key={s.who} delay={i * 40}>
              <Tilt max={5}>
                <div className="rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="mb-5" style={{ color: 'var(--purple-glow)' }}><Icon name={s.icon} size={28} /></div>
                  <div className="fr-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>{s.who}</div>
                  <div className="fr-display text-[24px] leading-tight mb-3" style={{ color: 'var(--ivory)' }}>{s.headline}</div>
                  <p className="text-[13px] leading-relaxed mb-5 flex-1" style={{ color: 'var(--text-2)' }}>{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.features.map((f) => (
                      <span key={f} className="fr-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{ background: 'var(--bg-2)', color: 'var(--text-3)', border: '1px solid var(--border-xs)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Find your fit." italic="Launch in 47 seconds." primary={{ href: '/onboarding', label: 'Start building' }} secondary={{ href: '/enterprise', label: 'Enterprise tier' }} />
    </MarketingShell>
  );
}
