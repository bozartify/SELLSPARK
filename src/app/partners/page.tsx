import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Magnetic, Tilt } from '@/components/ui/motion';

export const metadata = { title: 'Partners — SellSpark' };

const PARTNERS = ['Stripe', 'Anthropic', 'OpenAI', 'Vercel', 'Cloudflare', 'Twilio', 'SendGrid', 'Mailchimp', 'Notion', 'Zapier', 'Slack', 'Discord'];

const PROGRAMS = [
  { t: 'Affiliate Program', d: 'Earn 30% recurring on every creator you refer. Monthly payouts, no cap.' },
  { t: 'Integration Partner', d: 'List your app in our marketplace — reach 12k+ active creators.' },
  { t: 'Agency Program', d: 'White-label SellSpark for your clients. 0% platform fee. Dedicated CSM.' },
];

export default function PartnersPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Partners — grow together"
        title="Build with"
        italic="SellSpark"
        suffix="."
        subtitle="Affiliates, integrations, agencies, and solution partners — pick your lane."
      />
      <PageSection eyebrow="Who we work with" title="Trusted by" italic="world-class infra">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {PARTNERS.map((p, i) => (
            <Reveal key={p} delay={i * 25}>
              <div className="h-24 flex items-center justify-center rounded-xl fr-display text-[18px]"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}>
                {p}
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Programs" title="Pick your" italic="lane">
        <div className="grid md:grid-cols-3 gap-5">
          {PROGRAMS.map((x, i) => (
            <Reveal key={x.t} delay={i * 80}>
              <Tilt max={5}>
                <div className="rounded-2xl p-7 h-full flex flex-col" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="fr-display text-[24px] mb-3" style={{ color: 'var(--ivory)' }}>{x.t}</div>
                  <p className="text-[14px] leading-relaxed mb-6 flex-1" style={{ color: 'var(--text-2)' }}>{x.d}</p>
                  <Magnetic strength={8}>
                    <button className="fr-btn text-[12px]" style={{ padding: '10px 18px', fontWeight: 600 }}>Apply →</button>
                  </Magnetic>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Let's grow together." italic="Apply in 2 minutes." primary={{ href: '/contact', label: 'Become a partner' }} secondary={{ href: '/about', label: 'About us' }} />
    </MarketingShell>
  );
}
