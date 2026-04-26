import { MarketingShell, PageHero, PageSection } from '@/components/site/marketing-shell';

export const metadata = { title: 'Privacy Policy — SellSpark' };

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Legal" title="Privacy" italic="policy" suffix="." subtitle="Last updated: April 2026" />
      <PageSection>
        <article className="max-w-3xl space-y-6 text-[15px] leading-[1.75]" style={{ color: 'var(--text-2)' }}>
          <p>SellSpark, Inc. (&quot;we&quot;, &quot;us&quot;) operates the SellSpark platform. This Privacy Policy describes how we collect, use, and share information.</p>
          <h2 className="fr-display text-[28px] mt-10" style={{ color: 'var(--ivory)' }}>1. Information we collect</h2>
          <p>Account data (email, name), creator content, payment metadata (no card numbers are ever stored on our servers — Stripe handles them), and usage analytics.</p>
          <h2 className="fr-display text-[28px] mt-10" style={{ color: 'var(--ivory)' }}>2. How we use it</h2>
          <p>To provide the service, personalize AI, prevent fraud, and comply with law. We never sell personal data.</p>
          <h2 className="fr-display text-[28px] mt-10" style={{ color: 'var(--ivory)' }}>3. Your rights (GDPR / CCPA / PIPEDA / LGPD)</h2>
          <p>Access, rectify, export, delete, or restrict your data at any time from Settings → Privacy, or email privacy@sellspark.com.</p>
          <h2 className="fr-display text-[28px] mt-10" style={{ color: 'var(--ivory)' }}>4. Security</h2>
          <p>We use post-quantum CRYSTALS-Kyber KEM, AES-256-GCM at rest, TLS 1.3 in transit, and optional BB84 QKD for session fingerprints.</p>
          <h2 className="fr-display text-[28px] mt-10" style={{ color: 'var(--ivory)' }}>5. Contact</h2>
          <p>privacy@sellspark.com · 548 Market St, San Francisco, CA 94104.</p>
        </article>
      </PageSection>
    </MarketingShell>
  );
}
