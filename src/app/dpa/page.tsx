import { MarketingShell, PageHero, PageSection } from '@/components/site/marketing-shell';

export const metadata = { title: 'DPA — SellSpark' };

export default function DPAPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Legal"
        title="Data processing"
        italic="addendum"
        suffix="."
        subtitle="GDPR Article 28 · CCPA · international transfers"
      />
      <PageSection>
        <article className="max-w-3xl space-y-6 text-[15px] leading-[1.75]" style={{ color: 'var(--text-2)' }}>
          <p>Our DPA is auto-countersigned for every SellSpark account. You can download the latest signed copy from Settings → Compliance, or request a custom version at privacy@sellspark.com.</p>
          <p>Sub-processors list is updated live: Stripe, Vercel, Cloudflare, Anthropic, SendGrid.</p>
        </article>
      </PageSection>
    </MarketingShell>
  );
}
