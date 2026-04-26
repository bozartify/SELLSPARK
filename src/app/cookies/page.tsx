import { MarketingShell, PageHero, PageSection } from '@/components/site/marketing-shell';

export const metadata = { title: 'Cookie Policy — SellSpark' };

export default function CookiesPage() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Legal" title="Cookie" italic="policy" suffix="." />
      <PageSection>
        <article className="max-w-3xl space-y-6 text-[15px] leading-[1.75]" style={{ color: 'var(--text-2)' }}>
          <p>We use strictly-necessary cookies to keep you logged in, and optional analytics cookies to improve the product. No tracking cookies are set without consent.</p>
          <h2 className="fr-display text-[28px] mt-8" style={{ color: 'var(--ivory)' }}>Manage preferences</h2>
          <p>Open Settings → Privacy → Cookies to toggle categories at any time.</p>
        </article>
      </PageSection>
    </MarketingShell>
  );
}
