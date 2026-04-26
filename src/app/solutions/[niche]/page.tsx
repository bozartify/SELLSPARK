import { PageShell, PageHero } from '@/components/site/page-shell';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

const NICHES: Record<string, { title: string; sub: string; features: string[]; quote: string; author: string }> = {
  coaches: { title: 'SellSpark for coaches', sub: 'Sell 1:1 sessions, group cohorts, and replays — with AI scheduling and no-show recovery.', features: ['Calendar sync', 'Group calls', 'Recording library', 'Pay-what-you-want sessions', 'Zoom / Meet / Whereby'], quote: 'I tripled bookings in my first month.', author: '— Maya R., Leadership coach' },
  educators: { title: 'SellSpark for educators', sub: 'Drip courses, cohort-based classes, and gated communities.', features: ['Course modules', 'Progress tracking', 'Certificates', 'Discussion forums', 'Quizzes'], quote: 'My cohort went from 50 to 500 students.', author: '— Prof. Daniel K.' },
  fitness: { title: 'SellSpark for fitness creators', sub: 'Programs, meal plans, challenges, and live classes.', features: ['Workout builder', 'Macro tracker integration', 'Live class streaming', 'Apple Health sync', 'Community challenges'], quote: '$28k first month selling my 12-week program.', author: '— Jasmine T., Trainer' },
  agencies: { title: 'SellSpark for agencies', sub: 'White-label the platform for your clients. Keep 100% of fees.', features: ['Multi-tenant mgmt', 'Custom branding', 'Client dashboards', 'API access', 'Dedicated success manager'], quote: 'We moved 40 clients off Stan in a weekend.', author: '— Ryan, Growth agency CEO' },
  enterprise: { title: 'SellSpark for enterprise', sub: 'SSO, custom compliance, on-prem quantum HSM, dedicated infra.', features: ['SAML / OIDC SSO', 'Custom DPA + HIPAA', 'On-prem option', 'SLA-backed support', 'Dedicated cluster'], quote: 'Easiest security review we&apos;ve ever run.', author: '— CISO, F500 media co.' },
};

export function generateStaticParams() {
  return Object.keys(NICHES).map((niche) => ({ niche }));
}

export default async function SolutionPage({ params }: { params: Promise<{ niche: string }> }) {
  const { niche } = await params;
  const data = NICHES[niche];
  if (!data) notFound();
  return (
    <PageShell>
      <PageHero eyebrow={`Solutions · ${niche}`} title={data.title} subtitle={data.sub} />
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-5">
          {data.features.map((f) => (
            <div key={f} className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex gap-3"><span className="text-violet-600">✦</span><span className="font-semibold">{f}</span></div>
            </div>
          ))}
        </div>
        <blockquote className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-2xl font-semibold italic">&ldquo;{data.quote}&rdquo;</p>
          <footer className="text-sm text-gray-500 mt-3">{data.author}</footer>
        </blockquote>
        <div className="text-center mt-10">
          <Link href="/onboarding"><Button size="xl">Start free — no card needed</Button></Link>
        </div>
      </section>
    </PageShell>
  );
}
