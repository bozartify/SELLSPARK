import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Tilt } from '@/components/ui/motion';

export const metadata = { title: 'Blog — SellSpark' };

export const POSTS = [
  { slug: 'launch-a-creator-empire-in-60-seconds', title: 'Launch a creator empire in 60 seconds', excerpt: "How SellSpark's AI builds your full storefront faster than making coffee.", date: '2026-04-10', tag: 'Product' },
  { slug: 'why-quantum-resistant-security-matters', title: 'Why quantum-resistant security matters — now', excerpt: '"Harvest now, decrypt later" is already happening. Here\'s how we defend.', date: '2026-04-03', tag: 'Security' },
  { slug: 'thompson-sampling-for-creators', title: 'Thompson sampling for creators (no math degree needed)', excerpt: "The math behind our A/B engine, explained like you're 12.", date: '2026-03-27', tag: 'AI' },
  { slug: 'the-10k-mo-creator-playbook', title: 'The $10k/mo creator playbook', excerpt: "Four pricing tiers, two funnels, one AI agent. Here's the recipe.", date: '2026-03-20', tag: 'Growth' },
  { slug: 'from-stan-to-sellspark', title: 'From Stan Store to SellSpark: what\'s different', excerpt: 'A feature-by-feature breakdown for creators considering the switch.', date: '2026-03-13', tag: 'Compare' },
  { slug: 'meet-the-agent-swarm', title: 'Meet the agent swarm running your business', excerpt: 'Six autonomous agents. Zero chores for you.', date: '2026-03-05', tag: 'AI' },
];

export default function BlogPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Blog — notes from the frontier"
        title="Ideas that"
        italic="ship revenue"
        suffix="."
        subtitle="Product updates, AI research, creator playbooks — published weekly."
      />
      <PageSection>
        <div className="grid md:grid-cols-2 gap-5">
          {POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <Tilt max={4}>
                <Link href={`/blog/${p.slug}`} className="block rounded-2xl p-7 h-full group"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="fr-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>
                    {p.tag} · {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <h3 className="fr-display text-[26px] leading-tight mb-3" style={{ color: 'var(--ivory)' }}>{p.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{p.excerpt}</p>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Read more." italic="Ship more." primary={{ href: '/guides', label: 'See playbooks' }} secondary={{ href: '/auth/signup', label: 'Start free' }} />
    </MarketingShell>
  );
}
