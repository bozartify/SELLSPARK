import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';

export const metadata = { title: 'Guides — SellSpark' };

const GUIDES = [
  { t: 'Zero to $10k/mo in 90 days', d: 'The complete playbook.', read: '18 min' },
  { t: 'AI content flywheel for creators', d: 'Ship 30 posts/week automatically.', read: '12 min' },
  { t: 'Pricing psychology masterclass', d: 'Why $29 beats $30 — with data.', read: '9 min' },
  { t: 'Launching your first digital product', d: 'From idea to first sale.', read: '14 min' },
  { t: 'Building an audience on 3 platforms', d: 'Without burning out.', read: '11 min' },
  { t: 'Email funnels that convert', d: 'A 7-day sequence template.', read: '10 min' },
];

export default function GuidesPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Playbooks — battle-tested"
        title="How creators"
        italic="actually scale"
        suffix="."
        subtitle="Real playbooks from creators doing $10k–$500k/mo. No fluff, no theory."
      />
      <PageSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDES.map((g, i) => (
            <Reveal key={g.t} delay={i * 50}>
              <Tilt max={5}>
                <Link href="#" className="block rounded-2xl p-6 h-full"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="fr-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>
                    ◆ {g.read} read
                  </div>
                  <div className="fr-display text-[22px] leading-tight mb-2" style={{ color: 'var(--ivory)' }}>{g.t}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{g.d}</p>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Ready to apply them?" italic="Start your store." />
    </MarketingShell>
  );
}
