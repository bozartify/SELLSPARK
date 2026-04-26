import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Trust Center — SellSpark' };

const REPORTS: { icon: IconName; title: string; desc: string; href: string; meta: string }[] = [
  { icon: 'shield', title: 'SOC 2 Type II', desc: 'Latest audit covering security, availability, confidentiality.', href: '/contact', meta: 'Annual' },
  { icon: 'scales', title: 'ISO 27001:2022', desc: 'Information security management system certification.', href: '/contact', meta: 'Triennial' },
  { icon: 'lock', title: 'Pen-test report', desc: 'Q4 2025 external assessment by Trail of Bits.', href: '/contact', meta: 'Quarterly' },
  { icon: 'keyhole', title: 'GDPR DPIA', desc: 'Data Protection Impact Assessment + records of processing.', href: '/dpa', meta: 'Living doc' },
  { icon: 'plug', title: 'Sub-processors', desc: 'Live registry of every vendor processing customer data.', href: '/contact', meta: 'Live' },
  { icon: 'radar', title: 'Status & uptime', desc: 'Real-time platform health, 90-day uptime, incident history.', href: '/status', meta: 'Realtime' },
  { icon: 'book', title: 'Security whitepaper', desc: 'Architecture deep-dive: quantum stack, zero-trust, isolation.', href: '/contact', meta: 'PDF · 42pp' },
  { icon: 'cog', title: 'Vulnerability disclosure', desc: 'Coordinated disclosure policy + HackerOne bug bounty.', href: 'mailto:security@sellspark.com', meta: 'Up to $50k' },
];

const PRINCIPLES = [
  { h: 'Privacy is the default', p: 'Strictly necessary cookies only. No tracking without consent. Your customer data is yours — we will never sell, scrape, or train on it.' },
  { h: 'Encryption everywhere', p: 'Post-quantum hybrid in transit. AES-256-GCM at rest. Field-level encryption for PII. Tokenized payment data via Stripe.' },
  { h: 'You own your data', p: 'One-click export of every record (JSON + CSV). 30-day grace after termination. Permanent deletion within 7 days of request.' },
  { h: 'Transparent by design', p: 'Public status page. Public sub-processor list. Public bug bounty. Public roadmap. Public changelog. No hidden surveillance.' },
];

export default function TrustPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Trust Center"
        title="Verify"
        italic="everything"
        suffix="."
        subtitle="Audit reports, certifications, sub-processors, security whitepapers — request what you need or grab the public artifacts directly."
        ctaHref="/security"
        ctaLabel="Security overview"
        secondaryHref="/contact"
        secondaryLabel="Request reports"
      />
      <PageSection eyebrow="Reports & certifications" title="Pull the" italic="receipts">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {REPORTS.map((r, i) => (
            <Reveal key={r.title} delay={i * 50}>
              <Tilt max={5}>
                <Link href={r.href} className="block rounded-2xl p-6 h-full"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div style={{ color: 'var(--purple-glow)' }}><Icon name={r.icon} size={24} /></div>
                    <span className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{r.meta}</span>
                  </div>
                  <div className="fr-display text-[20px] leading-tight mb-2" style={{ color: 'var(--ivory)' }}>{r.title}</div>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{r.desc}</p>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Principles" title="What we" italic="believe">
        <div className="grid md:grid-cols-2 gap-5">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.h} delay={i * 60}>
              <div className="rounded-2xl p-7" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-display text-[22px] mb-3" style={{ color: 'var(--ivory)' }}>{p.h}</div>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{p.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Need something else?" italic="Ask security." primary={{ href: 'mailto:security@sellspark.com', label: 'Email security' }} secondary={{ href: '/security', label: 'Security overview' }} />
    </MarketingShell>
  );
}
