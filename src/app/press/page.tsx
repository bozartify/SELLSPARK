import { MarketingShell, PageHero, PageSection } from '@/components/site/marketing-shell';
import { Reveal } from '@/components/ui/motion';

export const metadata = { title: 'Press — SellSpark' };

const COVERAGE = [
  { outlet: 'TechCrunch', title: 'SellSpark raises $40M to build the quantum-safe creator OS', date: '2026-02-14' },
  { outlet: 'The Verge', title: 'Meet the AI that builds an entire online business in 60 seconds', date: '2026-01-22' },
  { outlet: 'Wired', title: 'Inside the post-quantum stack every creator app will copy', date: '2025-12-09' },
  { outlet: 'Forbes', title: '30 Under 30: SellSpark founders reinventing creator commerce', date: '2025-11-30' },
];

export default function PressPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Press & Media"
        title="In the"
        italic="news"
        suffix="."
        subtitle="Media inquiries: press@sellspark.com — we reply within a business day."
      />
      <PageSection>
        <div className="max-w-3xl mx-auto space-y-3">
          {COVERAGE.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <a href="#" className="block rounded-2xl p-6 transition-all"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--purple-glow)' }}>
                  {c.outlet} · {new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div className="fr-display text-[22px] leading-tight" style={{ color: 'var(--ivory)' }}>{c.title}</div>
              </a>
            </Reveal>
          ))}
        </div>
      </PageSection>
    </MarketingShell>
  );
}
