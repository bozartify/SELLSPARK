import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Magnetic } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Careers — SellSpark' };

const BENEFITS: { icon: IconName; v: string }[] = [
  { icon: 'globe', v: 'Remote-first' },
  { icon: 'money', v: 'Top-of-market equity' },
  { icon: 'leaf', v: 'Unlimited PTO' },
  { icon: 'brain', v: '$5k learning / yr' },
];

const ROLES = [
  { title: 'Staff AI Research Engineer', dept: 'AI', location: 'Remote' },
  { title: 'Senior Cryptographer (Post-Quantum)', dept: 'Security', location: 'SF / Remote' },
  { title: 'Product Designer — Creator Experience', dept: 'Design', location: 'Remote' },
  { title: 'Developer Advocate', dept: 'DevRel', location: 'Remote' },
  { title: 'Growth Marketer', dept: 'Growth', location: 'NY / Remote' },
  { title: 'Customer Success (EMEA)', dept: 'Success', location: 'London' },
  { title: 'iOS Engineer', dept: 'Mobile', location: 'Remote' },
  { title: 'Android Engineer', dept: 'Mobile', location: 'Remote' },
];

export default function CareersPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Careers — join us"
        title="Build the creator"
        italic="OS of the future"
        suffix="."
        subtitle="Remote-first. Generous equity. Mission-obsessed. We ship weekly."
      />
      <PageSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.v} delay={i * 60}>
              <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="mb-3 flex justify-center" style={{ color: 'var(--purple-glow)' }}><Icon name={b.icon} size={24} /></div>
                <div className="fr-mono text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>{b.v}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="fr-mono text-[11px] uppercase tracking-widest mb-6" style={{ color: 'var(--purple-glow)' }}>Open roles · {ROLES.length}</div>
        <div className="space-y-3">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 30}>
              <div className="rounded-xl p-5 flex items-center justify-between transition-all group"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div>
                  <div className="fr-display text-[18px]" style={{ color: 'var(--ivory)' }}>{r.title}</div>
                  <div className="fr-mono text-[11px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-3)' }}>
                    {r.dept} · {r.location} · Full-time
                  </div>
                </div>
                <Magnetic strength={8}>
                  <button className="text-[12px] px-4 py-2 rounded-md transition-all"
                    style={{ color: 'var(--text-1)', border: '1px solid var(--border-md)' }}>
                    Apply →
                  </button>
                </Magnetic>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Don't see your role?" italic="Tell us anyway." primary={{ href: 'mailto:careers@sellspark.com', label: 'Email us' }} secondary={{ href: '/about', label: 'About SellSpark' }} />
    </MarketingShell>
  );
}
