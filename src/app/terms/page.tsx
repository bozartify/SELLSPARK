import { MarketingShell, PageHero, PageSection } from '@/components/site/marketing-shell';

export const metadata = { title: 'Terms of Service — SellSpark' };

const SECTIONS = [
  { h: 'Accounts', p: "You're responsible for activity on your account. Keep credentials safe." },
  { h: 'Content', p: 'You own your content. You grant us a license to host and display it in order to run the service.' },
  { h: 'Acceptable use', p: 'No illegal, harmful, or deceptive content. Our Trust & Safety agent reviews flagged items.' },
  { h: 'Payments & fees', p: 'Transaction fees are plan-dependent. Payouts run on Stripe Connect.' },
  { h: 'Termination', p: 'Either party may terminate at any time. Your data export is available for 30 days after termination.' },
  { h: 'Governing law', p: 'Delaware, USA.' },
];

export default function TermsPage() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Legal" title="Terms of" italic="service" suffix="." subtitle="Last updated: April 2026" />
      <PageSection>
        <article className="max-w-3xl space-y-6 text-[15px] leading-[1.75]" style={{ color: 'var(--text-2)' }}>
          <p>These Terms govern your use of SellSpark. By creating an account you agree to these terms.</p>
          {SECTIONS.map((s) => (
            <div key={s.h}>
              <h2 className="fr-display text-[28px] mt-10 mb-3" style={{ color: 'var(--ivory)' }}>{s.h}</h2>
              <p>{s.p}</p>
            </div>
          ))}
        </article>
      </PageSection>
    </MarketingShell>
  );
}
