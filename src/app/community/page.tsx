import { PageShell, PageHero } from '@/components/site/page-shell';
import { Button } from '@/components/ui/button';
export const metadata = { title: 'Community — SellSpark' };
export default function CommunityPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Community" title="12,000 creators. One Discord." subtitle="Weekly office hours, feedback channels, private launches." />
      <section className="max-w-4xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-6">
        {[{ t: 'Discord', d: 'Live chat, weekly AMAs, giveaways.', cta: 'Join Discord', href: 'https://discord.gg/sellspark' }, { t: 'Creator Forum', d: 'Long-form threads, playbooks, case studies.', cta: 'Open forum', href: '/forum' }].map((c) => (
          <div key={c.t} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="font-bold text-lg mb-2">{c.t}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{c.d}</p>
            <a href={c.href}><Button>{c.cta}</Button></a>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
