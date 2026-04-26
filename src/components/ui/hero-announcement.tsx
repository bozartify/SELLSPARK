'use client';

/* Hero Announcement — pill-style banner for above-the-fold CTAs.
   Drop above hero headlines to promote launches, changelogs, beta access.
   Variants: default | live | beta | launch
   Composable: <HeroAnnouncement href="..."><HeroAnnouncementTag>NEW</HeroAnnouncementTag>Label</HeroAnnouncement>
*/

import { ReactNode } from 'react';
import Link from 'next/link';

type Variant = 'default' | 'live' | 'beta' | 'launch';

const VARIANTS: Record<Variant, { accent: string; tagBg: string; ring: string }> = {
  default: { accent: 'var(--purple-glow)', tagBg: 'rgba(124,58,237,0.22)', ring: 'rgba(124,58,237,0.35)' },
  live:    { accent: '#4ade80',            tagBg: 'rgba(34,197,94,0.18)',  ring: 'rgba(34,197,94,0.35)' },
  beta:    { accent: '#fbbf24',            tagBg: 'rgba(245,158,11,0.18)', ring: 'rgba(245,158,11,0.35)' },
  launch:  { accent: '#f472b6',            tagBg: 'rgba(244,114,182,0.18)',ring: 'rgba(244,114,182,0.35)' },
};

export function HeroAnnouncement({
  children,
  href,
  variant = 'default',
  className = '',
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
}) {
  const v = VARIANTS[variant];
  const content = (
    <span
      className={`group inline-flex items-center gap-2 rounded-full pl-1 pr-4 py-1 text-[13px] font-medium transition-all ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        color: 'var(--text-2)',
        border: `1px solid ${v.ring}`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {children}
      {href && (
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: v.accent }}
          aria-hidden
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      )}
    </span>
  );

  if (!href) return content;
  const ext = /^https?:/.test(href);
  return ext ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    <Link href={href}>{content}</Link>
  );
}

export function HeroAnnouncementTag({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  const v = VARIANTS[variant];
  return (
    <span
      className="fr-mono inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        background: v.tagBg,
        color: v.accent,
        border: `1px solid ${v.ring}`,
        letterSpacing: '0.08em',
      }}
    >
      {variant === 'live' && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: v.accent, boxShadow: `0 0 6px ${v.accent}` }}
        />
      )}
      {children}
    </span>
  );
}
