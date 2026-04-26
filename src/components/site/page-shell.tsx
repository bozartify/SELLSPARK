import { SiteHeader } from './header';
import { SiteFooter } from './footer';
import { NavButtons } from './nav-buttons';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <NavButtons />
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative px-6 py-24 overflow-hidden text-center">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-3xl mx-auto">
        {eyebrow && <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 mb-5">{eyebrow}</div>}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>}
      </div>
    </section>
  );
}
