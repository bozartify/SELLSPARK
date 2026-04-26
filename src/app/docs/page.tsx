import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';

export const metadata = { title: 'API Docs — SellSpark' };

const SECTIONS = [
  { title: 'Quickstart', items: ['Authentication', 'Your first request', 'Rate limits', 'Errors'] },
  { title: 'Resources', items: ['Stores', 'Products', 'Orders', 'Customers', 'Subscriptions', 'Analytics'] },
  { title: 'Webhooks', items: ['Event list', 'HMAC signatures', 'Delivery retries', 'Testing locally'] },
  { title: 'SDKs', items: ['JavaScript / TypeScript', 'Python', 'Go', 'Ruby', 'cURL'] },
  { title: 'AI', items: ['Generate content', 'Embeddings', 'Classify creator', 'Voice intent'] },
  { title: 'Quantum', items: ['Key exchange', 'ZK auth', 'Merkle attestations'] },
];

export default function DocsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Developers — build on SellSpark"
        title="The"
        italic="API"
        suffix=" you'll love."
        subtitle="REST + webhooks. Typed SDKs. Production-ready in minutes."
        ctaHref="/auth/signup"
        ctaLabel="Get API key"
        secondaryHref="#"
        secondaryLabel="Read reference"
      />
      <PageSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <Tilt max={5}>
                <div className="rounded-2xl p-6 h-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="fr-display text-[22px] mb-4" style={{ color: 'var(--ivory)' }}>{s.title}</div>
                  <ul className="space-y-2">
                    {s.items.map((item) => (
                      <li key={item}>
                        <Link href="#" className="text-[13px] transition-colors" style={{ color: 'var(--text-2)' }}>
                          {item} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Start building." italic="We'll keep up." primary={{ href: '/auth/signup', label: 'Get API key' }} secondary={{ href: '/pricing', label: 'See pricing' }} />
    </MarketingShell>
  );
}
