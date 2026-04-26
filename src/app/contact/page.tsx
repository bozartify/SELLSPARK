'use client';

import { useState } from 'react';
import { MarketingShell, PageHero, PageSection } from '@/components/site/marketing-shell';
import { Reveal, Magnetic } from '@/components/ui/motion';

const LINES = [
  { label: 'Sales', email: 'sales@sellspark.com' },
  { label: 'Support', email: 'help@sellspark.com' },
  { label: 'Press', email: 'press@sellspark.com' },
  { label: 'Security', email: 'security@sellspark.com' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Contact — we actually reply"
        title="Let's"
        italic="talk"
        suffix="."
        subtitle="Sales, press, support — median response under 4 hours."
      />
      <PageSection>
        <div className="grid md:grid-cols-2 gap-10">
          <Reveal>
            <div>
              <div className="fr-mono text-[11px] uppercase tracking-widest mb-6" style={{ color: 'var(--purple-glow)' }}>Direct lines</div>
              <ul className="space-y-5">
                {LINES.map((l) => (
                  <li key={l.label}>
                    <div className="fr-display text-[18px]" style={{ color: 'var(--ivory)' }}>{l.label}</div>
                    <a href={`mailto:${l.email}`} className="text-[14px]" style={{ color: 'var(--purple-glow)' }}>{l.email}</a>
                  </li>
                ))}
                <li>
                  <div className="fr-display text-[18px]" style={{ color: 'var(--ivory)' }}>HQ</div>
                  <div className="text-[14px]" style={{ color: 'var(--text-2)' }}>548 Market St, San Francisco, CA 94104</div>
                </li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="rounded-2xl p-7 space-y-4"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}
            >
              <div className="fr-display text-[24px]" style={{ color: 'var(--ivory)' }}>Send us a message</div>
              {['Your name', 'Email', 'Subject'].map((p) => (
                <input key={p} placeholder={p} required
                  className="w-full px-4 py-3 rounded-lg text-[14px] outline-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }} />
              ))}
              <textarea placeholder="How can we help?" required
                className="w-full px-4 py-3 rounded-lg text-[14px] min-h-[140px] outline-none"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }} />
              <Magnetic strength={10}>
                <button type="submit" className="fr-btn text-[13px] w-full" style={{ padding: '12px 20px', fontWeight: 600 }}>
                  {sent ? "Sent — we'll reply soon ✦" : 'Send message →'}
                </button>
              </Magnetic>
            </form>
          </Reveal>
        </div>
      </PageSection>
    </MarketingShell>
  );
}
