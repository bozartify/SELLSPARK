import Link from 'next/link';

const COLS = [
  {
    title: 'Product',
    links: [
      { label: 'Products', href: '/products' },
      { label: 'Features', href: '/features' },
      { label: 'Capabilities', href: '/capabilities' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'All solutions', href: '/solutions' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Agencies', href: '/solutions' },
      { label: 'Course creators', href: '/solutions' },
      { label: 'Coaches', href: '/solutions' },
      { label: 'Africa & emerging', href: '/solutions' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API & platform', href: '/api' },
      { label: 'API reference', href: '/docs' },
      { label: 'SDKs', href: '/docs' },
      { label: 'Webhooks', href: '/docs' },
      { label: 'Build for marketplace', href: '/marketplace' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Resources hub', href: '/resources' },
      { label: 'Blog', href: '/blog' },
      { label: 'Guides', href: '/guides' },
      { label: 'Help Center', href: '/help' },
      { label: 'Trust Center', href: '/trust' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'DPA', href: '/dpa' },
      { label: 'Sub-processors', href: '/trust' },
    ],
  },
];

const SOCIALS = [
  { label: 'X', href: 'https://x.com/sellspark', icon: 'M18.244 2H21l-6.52 7.45L22 22h-6.828l-4.77-6.24L4.8 22H2l7-8L2 2h6.914l4.3 5.76L18.244 2Zm-1.196 18h1.83L7.05 4H5.124l11.924 16Z' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/sellspark', icon: 'M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 8h4.56v14H.22V8Zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.33-2.36 4.63 0 5.48 3.05 5.48 7.02V22h-4.56v-6.17c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.37 1.6-2.37 3.25V22H7.72V8Z' },
  { label: 'YouTube', href: 'https://youtube.com/@sellspark', icon: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z' },
  { label: 'GitHub', href: 'https://github.com/sellspark', icon: 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.26 5.69.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z' },
  { label: 'Discord', href: 'https://discord.gg/sellspark', icon: 'M20.32 4.57A19.8 19.8 0 0 0 15.43 3c-.22.39-.48.92-.66 1.34a18.27 18.27 0 0 0-5.54 0A12.92 12.92 0 0 0 8.56 3a19.74 19.74 0 0 0-4.9 1.57C.55 9.18-.3 13.66.12 18.08a19.92 19.92 0 0 0 6.03 3.05c.49-.67.92-1.38 1.3-2.13-.72-.27-1.4-.6-2.06-.99.17-.12.34-.25.5-.38a14.22 14.22 0 0 0 12.22 0c.17.13.33.26.5.38-.66.39-1.35.72-2.06.99.37.75.8 1.46 1.3 2.13a19.87 19.87 0 0 0 6.03-3.05c.5-5.17-.84-9.6-3.56-13.51ZM8.02 15.3c-1.18 0-2.15-1.1-2.15-2.44 0-1.34.95-2.44 2.15-2.44s2.17 1.1 2.15 2.44c0 1.34-.95 2.44-2.15 2.44Zm7.96 0c-1.18 0-2.15-1.1-2.15-2.44 0-1.34.95-2.44 2.15-2.44s2.17 1.1 2.15 2.44c0 1.34-.95 2.44-2.15 2.44Z' },
];

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border-sm)' }}>
      <div className="max-w-[1320px] mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="fr-logo-mark w-12 h-12 rounded-2xl text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </div>
              <span className="fr-display text-[32px] leading-none" style={{ color: 'var(--ivory)' }}>
                Sell<span className="fr-display-italic fr-gradient-animated">Spark</span>
              </span>
            </Link>
            <p className="text-[13px] mt-5 leading-relaxed" style={{ color: 'var(--text-3)' }}>
              The quantum-safe, AI-first creator OS. Launch, scale, automate.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', color: 'var(--text-3)' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={s.icon} /></svg>
                </a>
              ))}
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="fr-mono text-[10px] uppercase tracking-widest mb-5" style={{ color: 'var(--purple-glow)' }}>
                {col.title}
              </div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] transition-colors" style={{ color: 'var(--text-2)' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 fr-mono text-[11px]"
          style={{ borderTop: '1px solid var(--border-sm)', color: 'var(--text-3)' }}>
          <div>© {new Date().getFullYear()} SellSpark, Inc. — Built for the next billion creators.</div>
          <div className="flex items-center gap-5">
            <Link href="/sitemap.xml">Sitemap</Link>
            <Link href="/status" className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
              All systems normal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
