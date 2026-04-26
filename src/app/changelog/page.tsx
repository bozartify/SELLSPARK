import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal } from '@/components/ui/motion';

export const metadata = { title: 'Changelog — SellSpark' };

const ENTRIES = [
  { date: '2026-04-14', tag: 'Quantum', items: ['BB84 QKD session fingerprints', 'Qubit teleportation simulator', 'Grover search in catalog'] },
  { date: '2026-04-08', tag: 'AI', items: ['Autonomous agent swarm (6 agents)', 'LinUCB contextual bandit recommender', 'Federated learning aggregator'] },
  { date: '2026-03-30', tag: 'Commerce', items: ['7-chain universal wallet', 'DRM & license key system', 'IoT / stream deck integration'] },
  { date: '2026-03-22', tag: 'Mobile', items: ['iOS + Android PWA shells', 'Biometric WebAuthn', 'Offline-first IndexedDB sync'] },
  { date: '2026-03-10', tag: 'Launch', items: ['SellSpark public beta', 'Free tier live', 'AI store builder goes GA'] },
];

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Changelog — shipped, not slideware"
        title="What's"
        italic="new"
        suffix="."
        subtitle="Weekly releases. Sometimes daily. Every change, documented."
      />
      <PageSection>
        <div className="max-w-3xl space-y-5">
          {ENTRIES.map((e, i) => (
            <Reveal key={e.date} delay={i * 80}>
              <div className="rounded-2xl p-7" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="fr-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.18)', color: 'var(--purple-glow)', border: '1px solid rgba(167,139,250,0.3)' }}>
                    {e.tag}
                  </div>
                  <div className="fr-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                    {new Date(e.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {e.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[14px]" style={{ color: 'var(--text-2)' }}>
                      <span style={{ color: 'var(--purple-glow)' }}>✦</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Follow along." italic="Ship with us." primary={{ href: '/auth/signup', label: 'Start free' }} secondary={{ href: '/roadmap', label: 'See roadmap' }} />
    </MarketingShell>
  );
}
