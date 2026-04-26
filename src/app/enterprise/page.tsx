import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt, Counter } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Enterprise — SellSpark' };

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'shield', title: 'Dedicated VPC', desc: 'Isolated compute, dedicated Postgres + Redis, per-tenant key vault.' },
  { icon: 'lock', title: 'On-prem quantum HSM', desc: 'FIPS 140-3 Level 4 hardware security modules, air-gapped key ceremonies.' },
  { icon: 'keyhole', title: 'SSO + SCIM', desc: 'SAML 2.0, OIDC, automated user provisioning across Okta/Azure AD/Google.' },
  { icon: 'scales', title: 'Custom DPA + MSA', desc: 'Bespoke data-processing agreements, BAA for HIPAA, signed sub-processors.' },
  { icon: 'radar', title: 'SIEM streaming', desc: 'Audit logs streamed to Splunk, Datadog, Elastic — every action, every byte.' },
  { icon: 'cog', title: 'White-label everything', desc: 'Custom domains, brand removal, themable dashboard, OEM-ready APIs.' },
  { icon: 'users', title: '24/7 priority support', desc: '<15min P1 response, dedicated CSM, quarterly business reviews.' },
  { icon: 'gem', title: 'Volume pricing', desc: '0% platform fee, custom Stripe rates, prepaid usage credits, multi-year deals.' },
  { icon: 'globe', title: 'Multi-region residency', desc: 'EU, US, UK, Canada, AU, India, Brazil — pin your data exactly where you need.' },
  { icon: 'flask', title: 'Custom AI fine-tuning', desc: 'Private model fine-tunes on your data, dedicated inference endpoints.' },
  { icon: 'plug', title: 'Private cloud / on-prem', desc: 'Deploy SellSpark inside your AWS/GCP/Azure account or fully air-gapped.' },
  { icon: 'wrench', title: 'Solution architects', desc: 'Hands-on migration, integration, and optimization with our SE team.' },
];

const COMPLIANCE = [
  'SOC 2 Type II', 'ISO 27001:2022', 'ISO 27017', 'ISO 27018', 'ISO 22301',
  'GDPR', 'CCPA / CPRA', 'PIPEDA', 'LGPD', 'HIPAA', 'PCI-DSS Level 1',
  'FedRAMP Moderate (in process)', 'FIPS 140-3', 'NIST 800-53', 'C5 (Germany)',
  'ENS High (Spain)', 'Cyber Essentials Plus (UK)', 'IRAP (Australia)',
];

const LOGOS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Massive Dynamic', 'Stark Industries', 'Wayne Enterprises'];

export default function EnterprisePage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Enterprise — for the world's biggest creator brands"
        title="Built for"
        italic="boardrooms"
        suffix="."
        subtitle="Dedicated infrastructure, white-glove onboarding, custom contracts, and the security posture your CISO will actually approve."
        ctaHref="/contact"
        ctaLabel="Talk to sales"
        secondaryHref="/security"
        secondaryLabel="Security overview"
      />
      <PageSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: 12000, suffix: '+', label: 'Creators' },
            { v: 2.4, prefix: '$', suffix: 'B', label: 'GMV processed', dec: 1 },
            { v: 99.99, suffix: '%', label: 'SLA' },
            { v: 47, suffix: 'ms', label: 'p50 latency' },
          ].map((s) => (
            <Reveal key={s.label}>
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-display text-[40px] fr-gradient-animated">
                  <Counter to={s.v} prefix={s.prefix ?? ''} suffix={s.suffix} decimals={s.dec ?? 0} />
                </div>
                <div className="fr-mono text-[10px] uppercase tracking-widest mt-2" style={{ color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="What you get" title="The enterprise" italic="upgrade">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 40}>
              <Tilt max={5}>
                <div className="rounded-2xl p-6 h-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="mb-4" style={{ color: 'var(--purple-glow)' }}><Icon name={f.icon} size={26} /></div>
                  <div className="fr-display text-[20px] leading-tight mb-2" style={{ color: 'var(--ivory)' }}>{f.title}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Compliance" title="Audited," italic="certified, ready." subtitle="The most comprehensive compliance posture in the creator economy.">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {COMPLIANCE.map((c, i) => (
            <Reveal key={c} delay={i * 25}>
              <div className="rounded-lg p-4 text-center fr-mono text-[10px] uppercase tracking-widest"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}>
                {c}
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Trusted by" title="Brands that" italic="ship at scale">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LOGOS.map((l) => (
            <Reveal key={l}>
              <div className="rounded-xl h-24 flex items-center justify-center fr-display text-[20px]"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}>
                {l}
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Let's build your enterprise stack." italic="White-glove from day one." primary={{ href: '/contact', label: 'Talk to sales' }} secondary={{ href: '/capabilities', label: 'See capabilities' }} />
    </MarketingShell>
  );
}
