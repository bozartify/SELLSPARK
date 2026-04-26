import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'Resources — SellSpark' };

const HUBS: { icon: IconName; title: string; desc: string; href: string; meta: string }[] = [
  { icon: 'pen', title: 'Blog', desc: 'Product updates, AI research, creator playbooks.', href: '/blog', meta: 'Weekly' },
  { icon: 'book', title: 'Guides', desc: 'Long-form playbooks from creators doing $10k–$500k/mo.', href: '/guides', meta: '40+ guides' },
  { icon: 'wrench', title: 'API Docs', desc: 'REST, webhooks, SDKs, and code samples in 5 languages.', href: '/docs', meta: 'Versioned' },
  { icon: 'chat', title: 'Help Center', desc: '200+ articles + AI support agent (avg <60s reply).', href: '/help', meta: '24/7' },
  { icon: 'film', title: 'Video tutorials', desc: 'Walkthroughs, deep-dives, and creator interviews.', href: '/blog', meta: '120+ videos' },
  { icon: 'flask', title: 'Templates', desc: 'Pre-built funnels, courses, email sequences, and stores.', href: '/marketplace', meta: '300+ templates' },
  { icon: 'users', title: 'Community', desc: 'Discord, weekly office hours, creator AMAs.', href: '/help', meta: '12k members' },
  { icon: 'grad', title: 'Academy', desc: 'Self-paced certification courses on creator commerce.', href: '/guides', meta: 'Free' },
  { icon: 'radar', title: 'Status & roadmap', desc: 'Real-time platform health and what we\'re building next.', href: '/status', meta: 'Live' },
  { icon: 'scales', title: 'Legal & compliance', desc: 'Privacy, terms, DPA, sub-processors, SOC2 reports.', href: '/security', meta: 'Audited' },
  { icon: 'mail', title: 'Newsletter', desc: '"Spark Weekly" — 25k creators read it every Tuesday.', href: '/blog', meta: 'Free' },
  { icon: 'trophy', title: 'Case studies', desc: 'Real numbers from real creators. Revenue, churn, conversion.', href: '/blog', meta: '50+ studies' },
];

export default function ResourcesPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Resources — everything you need"
        title="Learn. Build."
        italic="Win"
        suffix="."
        subtitle="Whether you're stuck on copy, debugging a webhook, or scaling past $100k MRR — we've got the resource."
        ctaHref="/blog"
        ctaLabel="Browse the blog"
        secondaryHref="/guides"
        secondaryLabel="Read playbooks"
      />
      <PageSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HUBS.map((h, i) => (
            <Reveal key={h.title} delay={i * 50}>
              <Tilt max={5}>
                <Link href={h.href} className="block rounded-2xl p-7 h-full"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div style={{ color: 'var(--purple-glow)' }}><Icon name={h.icon} size={28} /></div>
                    <span className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{h.meta}</span>
                  </div>
                  <div className="fr-display text-[24px] leading-tight mb-2" style={{ color: 'var(--ivory)' }}>{h.title}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{h.desc}</p>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Still need help?" italic="Talk to a human." primary={{ href: '/contact', label: 'Contact us' }} secondary={{ href: '/help', label: 'Search help' }} />
    </MarketingShell>
  );
}
