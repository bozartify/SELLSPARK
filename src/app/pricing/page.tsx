import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Magnetic, Tilt } from '@/components/ui/motion';

export const metadata = { title: 'Pricing — SellSpark' };

const PLANS = [
  { name: 'Starter', price: 0, period: 'Free forever', blurb: 'Everything you need to launch.', features: ['1 storefront', '3 products', 'Basic AI store builder', 'Quantum-secure checkout', '5% transaction fee', 'Community support'], cta: 'Start free', popular: false },
  { name: 'Pro', price: 29, period: '/month', blurb: 'For creators scaling to $10k/mo.', features: ['Unlimited products', 'Full AI App Marketplace', 'Custom domain', 'Advanced analytics & A/B testing', '2% transaction fee', 'Email automations', 'Priority support', 'Affiliate program'], cta: 'Go Pro', popular: true },
  { name: 'Business', price: 79, period: '/month', blurb: 'For agencies & 7-figure creators.', features: ['Everything in Pro', 'Multi-store (up to 10)', 'White-label option', 'Full API & webhooks', '0% transaction fee', 'Dedicated account manager', 'Quantum key rotation', 'SOC2 reports'], cta: 'Scale up', popular: false },
  { name: 'Enterprise', price: null, period: 'Custom', blurb: 'Unlimited everything + compliance.', features: ['Everything in Business', 'Unlimited storefronts', 'SSO / SAML', 'Custom DPA + HIPAA', 'On-prem quantum HSM', '24/7 phone support', 'Private Slack channel'], cta: 'Contact sales', popular: false },
];

const FAQS = [
  { q: 'Is there a free trial for Pro?', a: 'Pro includes a 14-day free trial — no credit card required. Cancel anytime.' },
  { q: 'What payment methods do you accept?', a: 'All major cards via Stripe, Apple Pay, Google Pay, crypto on 7 chains, and ACH for annual plans.' },
  { q: 'Can I change plans later?', a: 'Yes — upgrade or downgrade at any time. Prorated instantly.' },
  { q: 'Do you offer creator discounts?', a: 'Students, nonprofits, and creators under $1k/mo get 50% off Pro. Email hello@sellspark.com.' },
  { q: 'What are transaction fees?', a: "A small % on top of Stripe's standard processing (2.9% + 30¢). Business plan has zero platform fees." },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Pricing — transparent, no tricks"
        title="Pay after"
        italic="you win"
        suffix="."
        subtitle="Every plan includes quantum-resistant security, unlimited bandwidth, and our full AI engine. Switch tiers any time."
      />
      <PageSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <Tilt max={6}>
                <div
                  className="h-full rounded-2xl p-7 flex flex-col relative overflow-hidden transition-all"
                  style={{
                    background: p.popular ? 'linear-gradient(180deg, rgba(124,58,237,0.18), rgba(124,58,237,0.04))' : 'var(--surface-1)',
                    border: p.popular ? '1px solid rgba(167,139,250,0.5)' : '1px solid var(--border-sm)',
                    boxShadow: p.popular ? '0 20px 60px -20px rgba(124,58,237,0.4)' : 'none',
                  }}
                >
                  {p.popular && (
                    <div className="fr-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: 'var(--purple-glow)' }}>
                      ◆ Most popular
                    </div>
                  )}
                  <h3 className="fr-display text-[32px] leading-none" style={{ color: 'var(--ivory)' }}>{p.name}</h3>
                  <p className="text-[13px] mt-2 mb-5" style={{ color: 'var(--text-3)' }}>{p.blurb}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="fr-display text-[48px] leading-none" style={{ color: 'var(--ivory)' }}>
                      {p.price === null ? 'Custom' : p.price === 0 ? 'Free' : `$${p.price}`}
                    </span>
                    {p.price !== null && p.price > 0 && <span className="fr-mono text-[11px]" style={{ color: 'var(--text-3)' }}>{p.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2 text-[13px]" style={{ color: 'var(--text-2)' }}>
                        <span style={{ color: 'var(--purple-glow)' }}>✦</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Magnetic strength={10}>
                    <Link
                      href={p.name === 'Enterprise' ? '/contact' : '/auth/signup'}
                      className={p.popular ? 'fr-btn text-[13px] w-full text-center' : 'text-[13px] w-full text-center inline-block px-5 py-3 rounded-md transition-all'}
                      style={p.popular
                        ? { padding: '12px 20px', fontWeight: 600 }
                        : { color: 'var(--text-1)', border: '1px solid var(--border-md)', background: 'rgba(124,58,237,0.04)' }}
                    >
                      {p.cta} →
                    </Link>
                  </Magnetic>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="FAQ" title="Questions," italic="answered.">
        <div className="max-w-3xl space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="rounded-xl p-5 group" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <summary className="font-semibold cursor-pointer text-[15px]" style={{ color: 'var(--ivory)' }}>{f.q}</summary>
                <p className="text-[14px] mt-3 leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Start free." italic="Upgrade when you're ready." />
    </MarketingShell>
  );
}
