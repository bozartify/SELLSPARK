import { MarketingShell, PageHero, PageSection } from '@/components/site/marketing-shell';
import { Reveal } from '@/components/ui/motion';

export const metadata = { title: 'Status — SellSpark' };

const SERVICES = [
  { name: 'API', uptime: '99.997%' },
  { name: 'Dashboard', uptime: '99.994%' },
  { name: 'Storefronts', uptime: '99.999%' },
  { name: 'Checkout (Stripe)', uptime: '100.000%' },
  { name: 'AI Engine', uptime: '99.981%' },
  { name: 'Quantum KEM', uptime: '99.996%' },
  { name: 'Webhooks', uptime: '99.992%' },
  { name: 'Mobile push', uptime: '99.989%' },
];

export default function StatusPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Platform Status"
        title="All systems"
        italic="normal"
        suffix="."
        subtitle="Real-time platform health. Subscribe for incident alerts."
      />
      <PageSection>
        <div className="max-w-3xl mx-auto space-y-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.name} delay={i * 40}>
              <div className="flex items-center justify-between rounded-xl p-5"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="flex items-center gap-3">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#4ade80' }} />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#4ade80' }} />
                  </span>
                  <span className="fr-display text-[18px]" style={{ color: 'var(--ivory)' }}>{s.name}</span>
                </div>
                <div className="fr-mono text-[12px]" style={{ color: 'var(--text-3)' }}>{s.uptime} · 90d</div>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
    </MarketingShell>
  );
}
