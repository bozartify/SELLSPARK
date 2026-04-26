'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { Reveal, Magnetic } from '@/components/ui/motion';

/* ═══════════════════════════════════════════════════════════════════════════
   Shared shell used by every marketing page. Keeps the editorial-brutalist
   aesthetic consistent across the whole site. One PageHero primitive
   covers 90% of headline patterns.
   ═══════════════════════════════════════════════════════════════════════════ */

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--text-1)' }}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

/* ─── PageHero — serif display + eyebrow + subtext + optional CTAs ───── */
export function PageHero({
  eyebrow,
  title,
  italic,
  suffix,
  subtitle,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  children,
}: {
  eyebrow?: string;
  title: string;
  italic?: string;
  suffix?: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative pt-40 pb-20 px-6 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center top, black 30%, transparent 70%)',
        }} />
      <div className="relative max-w-[1200px] mx-auto text-center">
        {eyebrow && (
          <Reveal>
            <div className="fr-eyebrow mb-6" style={{ color: 'var(--purple-glow)' }}>
              {eyebrow}
            </div>
          </Reveal>
        )}
        <Reveal delay={80}>
          <h1
            className="fr-display text-[64px] md:text-[112px] leading-[0.92] tracking-[-0.02em]"
            style={{ color: 'var(--ivory)' }}
          >
            {title}
            {italic && (
              <>
                {' '}
                <span className="fr-display-italic fr-gradient-animated">{italic}</span>
              </>
            )}
            {suffix && <span>{suffix}</span>}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={160}>
            <p className="mt-8 max-w-[640px] mx-auto text-[17px] leading-[1.65]"
              style={{ color: 'var(--text-2)' }}>
              {subtitle}
            </p>
          </Reveal>
        )}
        {(ctaHref || secondaryHref) && (
          <Reveal delay={240}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {ctaHref && (
                <Magnetic strength={14}>
                  <Link href={ctaHref} className="fr-btn text-[14px]" style={{ padding: '14px 26px', fontWeight: 600 }}>
                    {ctaLabel ?? 'Get started'} →
                  </Link>
                </Magnetic>
              )}
              {secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center gap-2 text-[14px] px-5 py-3.5 rounded-md transition-all"
                  style={{ color: 'var(--text-2)', border: '1px solid var(--border-sm)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-sm)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {secondaryLabel ?? 'Learn more'}
                </Link>
              )}
            </div>
          </Reveal>
        )}
        {children && <Reveal delay={300}>{children}</Reveal>}
      </div>
    </section>
  );
}

/* ─── Section wrapper with consistent padding + reveal ───────────────── */
export function PageSection({
  eyebrow,
  title,
  italic,
  subtitle,
  children,
  className = '',
}: {
  eyebrow?: string;
  title?: string;
  italic?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-24 px-6 ${className}`}>
      <div className="max-w-[1200px] mx-auto">
        {(eyebrow || title) && (
          <Reveal>
            <div className="mb-12 max-w-[720px]">
              {eyebrow && (
                <div className="fr-eyebrow mb-4" style={{ color: 'var(--purple-glow)' }}>
                  {eyebrow}
                </div>
              )}
              {title && (
                <h2 className="fr-display text-[44px] md:text-[64px] leading-[0.98] tracking-[-0.02em]"
                  style={{ color: 'var(--ivory)' }}>
                  {title}
                  {italic && <> <span className="fr-display-italic" style={{ color: 'var(--purple-glow)' }}>{italic}</span></>}
                </h2>
              )}
              {subtitle && (
                <p className="mt-5 text-[16px] leading-[1.6]" style={{ color: 'var(--text-2)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/* ─── CTA banner — bottom of every page ──────────────────────────────── */
export function PageCTA({
  title = 'Ready to ship?',
  italic = 'Your empire awaits.',
  primary = { href: '/onboarding', label: 'Start free' },
  secondary = { href: '/pricing', label: 'See pricing' },
}: {
  title?: string;
  italic?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 70% at 50% 50%, rgba(124,58,237,0.18), transparent 70%)' }} />
      <Reveal>
        <div className="relative max-w-[1000px] mx-auto text-center">
          <h2 className="fr-display text-[52px] md:text-[88px] leading-[0.92] tracking-[-0.03em] mb-8"
            style={{ color: 'var(--ivory)' }}>
            {title}<br />
            <span className="fr-display-italic fr-gradient-animated">{italic}</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Magnetic strength={16}>
              <Link href={primary.href} className="fr-btn text-[14px]" style={{ padding: '14px 28px', fontWeight: 600 }}>
                {primary.label} →
              </Link>
            </Magnetic>
            <Link href={secondary.href} className="text-[14px] px-5 py-3.5 rounded-md transition-all"
              style={{ color: 'var(--text-2)', border: '1px solid var(--border-sm)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-sm)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {secondary.label}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
