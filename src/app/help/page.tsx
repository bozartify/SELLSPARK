import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Help Center — SellSpark' };

const TOPICS: { icon: IconName; title: string; links: string[] }[] = [
  { icon: 'rocket', title: 'Getting started', links: ['Create your first store', 'Add products', 'Connect Stripe', 'Publish your domain'] },
  { icon: 'brain', title: 'AI features', links: ['Using the store builder', 'Train custom AI tools', 'A/B testing guide', 'Revenue forecasts'] },
  { icon: 'card', title: 'Payments & payouts', links: ['Stripe Connect setup', 'Crypto wallets', 'Tax handling', 'Refunds'] },
  { icon: 'shield', title: 'Security & privacy', links: ['Enable 2FA', 'Quantum key rotation', 'GDPR requests', 'Account recovery'] },
  { icon: 'mobile', title: 'Mobile & PWA', links: ['Install on iOS', 'Install on Android', 'Offline mode', 'Push notifications'] },
  { icon: 'plug', title: 'Integrations & API', links: ['Generate API keys', 'Webhook events', 'Zapier recipes', 'Widget embeds'] },
];

export default function HelpPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Help Center — 200+ articles"
        title="How can we"
        italic="help"
        suffix="?"
        subtitle="Search articles or chat with an AI support agent — typical reply under 60 seconds."
      />
      <PageSection>
        <div className="max-w-2xl mx-auto mb-12">
          <input
            placeholder="Search help articles…"
            className="w-full px-5 py-4 rounded-xl text-[14px] outline-none"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOPICS.map((t, i) => (
            <Reveal key={t.title} delay={i * 60}>
              <Tilt max={5}>
                <div className="rounded-2xl p-6 h-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="mb-4" style={{ color: 'var(--purple-glow)' }}><Icon name={t.icon} size={26} /></div>
                  <div className="fr-display text-[22px] mb-4" style={{ color: 'var(--ivory)' }}>{t.title}</div>
                  <ul className="space-y-2">
                    {t.links.map((l) => (
                      <li key={l}>
                        <Link href="#" className="text-[13px]" style={{ color: 'var(--text-2)' }}>{l} →</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Still stuck?" italic="Talk to a human." primary={{ href: '/contact', label: 'Contact support' }} secondary={{ href: '/docs', label: 'Read API docs' }} />
    </MarketingShell>
  );
}
