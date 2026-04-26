'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Docs', href: '/docs' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    h(); window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(6,6,11,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-xs)' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1320px] mx-auto px-6 h-[88px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 min-w-0 group" aria-label="SellSpark home">
          <div
            className="fr-logo-mark w-[54px] h-[54px] rounded-2xl shrink-0 text-white"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <span className="fr-display text-[40px] leading-none tracking-[-0.02em] flex items-baseline" style={{ color: 'var(--ivory)' }}>
            Sell<span className="fr-display-italic fr-gradient-animated ml-[1px]">Spark</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-md text-[13px] transition-colors whitespace-nowrap"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              {n.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="hidden sm:block px-3 py-2 text-[13px] transition-colors"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="fr-btn text-[13px]"
            style={{ padding: '8px 16px' }}
          >
            Start free →
          </Link>
          <button
            className="md:hidden p-2 rounded-md"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            style={{ color: 'var(--text-2)' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden px-6 py-4 space-y-1"
          style={{
            background: 'rgba(6,6,11,0.95)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border-xs)',
          }}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-[14px]"
              style={{ color: 'var(--text-2)' }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
