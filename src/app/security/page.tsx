import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt, Counter } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Security — SellSpark' };

const PILLARS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'lock', title: 'Post-quantum encryption', desc: 'CRYSTALS-Kyber KEM + AES-256-GCM hybrid. Migrating now beats migrating under attack.' },
  { icon: 'keyhole', title: 'Zero-knowledge auth', desc: 'Schnorr proofs — we never see your password, ever. Optional WebAuthn/biometric.' },
  { icon: 'atom', title: 'BB84 QKD (opt-in)', desc: 'Quantum key distribution for session fingerprints. Defeats harvest-now-decrypt-later.' },
  { icon: 'shield', title: 'SOC 2 Type II', desc: 'Annual audit by Big-4 accountant. Continuous monitoring via Vanta + Drata.' },
  { icon: 'scales', title: 'GDPR / CCPA / PIPEDA / LGPD', desc: 'Full data-rights workflows: access, export, delete, restrict — automated.' },
  { icon: 'vault', title: 'HSM-backed keys', desc: 'Private keys never leave FIPS 140-3 Level 3 hardware. Per-tenant on Enterprise.' },
  { icon: 'radar', title: 'Fraud graph AI', desc: 'GNN-based ring detection, device fingerprinting, behavioral anomaly scoring.' },
  { icon: 'bot', title: '24/7 incident response', desc: 'security@sellspark.com · PGP available · 15-min P1 SLA on Enterprise.' },
  { icon: 'shield', title: 'DDoS protection', desc: 'Cloudflare Magic Transit + L7 rate limiting. Sustained 5 Tbps capacity.' },
  { icon: 'plug', title: 'Sub-processor transparency', desc: 'Live list of every vendor that touches your data. 7-day notice on changes.' },
  { icon: 'cog', title: 'Continuous pen-testing', desc: 'Quarterly external pen-tests. Bug bounty up to $50k. HackerOne managed.' },
  { icon: 'spark', title: 'Secure SDLC', desc: 'SAST + DAST + SCA in CI. Dependency review on every PR. Signed builds.' },
];

const COMPLIANCE = [
  'SOC 2 Type II', 'ISO 27001:2022', 'ISO 27017', 'ISO 27018', 'ISO 22301',
  'GDPR', 'CCPA / CPRA', 'PIPEDA', 'LGPD', 'HIPAA-eligible', 'PCI-DSS L1',
  'FedRAMP Moderate (in process)', 'FIPS 140-3', 'NIST 800-53', 'C5 (DE)',
  'ENS High (ES)', 'Cyber Essentials Plus (UK)', 'IRAP (AU)',
];

const PRACTICES = [
  { h: 'Encryption everywhere', p: 'TLS 1.3 with PFS in transit. AES-256-GCM at rest. Field-level encryption for PII. Tokenized payment data via Stripe — we never see card numbers.' },
  { h: 'Access control', p: 'Least-privilege RBAC. SSO + SCIM on Business+. Hardware keys (YubiKey) for engineering. All admin actions logged & alerted.' },
  { h: 'Data residency', p: 'Pin your tenant to EU, US, UK, Canada, Australia, India, or Brazil. No data leaves the region without an explicit DPA addendum.' },
  { h: 'Backups & DR', p: 'Continuous WAL streaming + 5-min RPO snapshots. Cross-region replicas. Annual DR drills with documented RTO < 4h.' },
  { h: 'Vendor risk', p: 'Every sub-processor passes our security questionnaire + SOC 2 review. Public list updated within 7 days of any change.' },
  { h: 'Incident response', p: '24/7 on-call. Customer notification within 72h of any confirmed breach (most jurisdictions require 72h; we commit to it globally).' },
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Trust & Security"
        title="Built for the"
        italic="next 30 years"
        suffix="."
        subtitle="Quantum-safe by default. Compliance-ready out of the box. The most rigorous security posture in the creator economy."
        ctaHref="/contact"
        ctaLabel="Request SOC 2 report"
        secondaryHref="/enterprise"
        secondaryLabel="Enterprise security"
      />
      <PageSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: 99.99, suffix: '%', label: 'SLA uptime' },
            { v: 0, suffix: '', label: 'Breaches to date' },
            { v: 50, prefix: '$', suffix: 'k', label: 'Bug bounty cap' },
            { v: 72, suffix: 'h', label: 'Breach disclosure' },
          ].map((s) => (
            <Reveal key={s.label}>
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-display text-[40px] fr-gradient-animated">
                  <Counter to={s.v} prefix={s.prefix ?? ''} suffix={s.suffix} decimals={s.v % 1 ? 2 : 0} />
                </div>
                <div className="fr-mono text-[10px] uppercase tracking-widest mt-2" style={{ color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Pillars" title="Twelve" italic="defenses">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 40}>
              <Tilt max={4}>
                <div className="rounded-2xl p-6 h-full flex gap-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="shrink-0" style={{ color: 'var(--purple-glow)' }}><Icon name={p.icon} size={26} /></div>
                  <div>
                    <div className="fr-display text-[20px] mb-1" style={{ color: 'var(--ivory)' }}>{p.title}</div>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{p.desc}</p>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Practices" title="How we" italic="actually do it">
        <div className="grid md:grid-cols-2 gap-5">
          {PRACTICES.map((p, i) => (
            <Reveal key={p.h} delay={i * 60}>
              <div className="rounded-2xl p-7" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-display text-[22px] mb-3" style={{ color: 'var(--ivory)' }}>{p.h}</div>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{p.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Compliance" title="Audited," italic="certified, ready.">
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
      <PageCTA title="Report a vulnerability." italic="Earn up to $50k." primary={{ href: 'mailto:security@sellspark.com', label: 'Email security' }} secondary={{ href: '/status', label: 'Platform status' }} />
    </MarketingShell>
  );
}
