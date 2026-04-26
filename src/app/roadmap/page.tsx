import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal } from '@/components/ui/motion';

export const metadata = { title: 'Roadmap — SellSpark' };

const COLS = [
  { title: 'Shipped', tint: '#4ade80', items: ['AI Store Builder', 'Quantum KEM', '7-chain Wallet', 'Agent Swarm', 'PWA + iOS/Android'] },
  { title: 'Now', tint: 'var(--purple-glow)', items: ['Vision Pro spatial commerce', 'Federated cohort learning', 'On-device Spark-Nano model'] },
  { title: 'Next', tint: '#60a5fa', items: ['Creator token launches', 'Live-shopping 2.0', 'AR try-on', 'Auto-translate 40+ langs'] },
  { title: 'Later', tint: '#f59e0b', items: ['BCI checkout', 'Satellite-backed payouts', 'Autonomous creator LLM fine-tune'] },
];

export default function RoadmapPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Public Roadmap"
        title="What we're"
        italic="building"
        suffix="."
        subtitle="Public. Honest. Updated weekly. Vote on what ships next."
      />
      <PageSection>
        <div className="grid md:grid-cols-4 gap-5">
          {COLS.map((c, colIdx) => (
            <Reveal key={c.title} delay={colIdx * 80}>
              <div className="rounded-2xl p-5 h-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.tint, boxShadow: `0 0 10px ${c.tint}` }} />
                  <span className="fr-mono text-[11px] uppercase tracking-widest" style={{ color: c.tint }}>{c.title}</span>
                </div>
                <ul className="space-y-2.5">
                  {c.items.map((i) => (
                    <li key={i} className="rounded-lg p-3 text-[13px]" style={{ background: 'var(--bg-2)', color: 'var(--text-2)', border: '1px solid var(--border-xs)' }}>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Want to vote?" italic="Shape what ships." primary={{ href: '/auth/signup', label: 'Join free' }} secondary={{ href: '/changelog', label: 'What shipped' }} />
    </MarketingShell>
  );
}
