'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDashboard, useAuthStore } from '@/lib/store';
import { NavButtons } from '@/components/site/nav-buttons';
import { Icon, IconName } from '@/components/ui/icon';

type NavGroup = { label: string; items: { href: string; icon: IconName; label: string }[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', icon: 'overview', label: 'Overview' },
      { href: '/dashboard/getting-started', icon: 'rocket', label: 'Getting Started' },
      { href: '/dashboard/vault', icon: 'vault', label: 'Vault' },
      { href: '/dashboard/reference', icon: 'spark', label: 'Reference' },
      { href: '/dashboard/docs-hub', icon: 'book', label: 'Docs Hub' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/dashboard/store', icon: 'store', label: 'My Store' },
      { href: '/dashboard/products', icon: 'box', label: 'Products' },
      { href: '/dashboard/orders', icon: 'receipt', label: 'Orders' },
      { href: '/dashboard/payments', icon: 'card', label: 'Payments' },
      { href: '/dashboard/payouts', icon: 'cash', label: 'Payouts' },
      { href: '/dashboard/monetization', icon: 'money', label: 'Monetization' },
      { href: '/dashboard/memberships', icon: 'diamond', label: 'Memberships' },
      { href: '/dashboard/auctions', icon: 'gavel', label: 'Auctions' },
      { href: '/dashboard/bookings', icon: 'calendar', label: 'Bookings' },
    ],
  },
  {
    label: 'Studio',
    items: [
      { href: '/dashboard/content', icon: 'pen', label: 'Content Studio' },
      { href: '/dashboard/video', icon: 'film', label: 'Video Studio' },
      { href: '/dashboard/live', icon: 'live', label: 'Live Studio' },
      { href: '/dashboard/creator-studio', icon: 'stars', label: 'Creator Studio' },
      { href: '/dashboard/email', icon: 'mail', label: 'Email' },
      { href: '/dashboard/social', icon: 'share', label: 'Social' },
      { href: '/dashboard/courses', icon: 'grad', label: 'Courses' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/dashboard/analytics', icon: 'chart', label: 'Analytics' },
      { href: '/dashboard/analytics-pro', icon: 'chart', label: 'Analytics Pro' },
      { href: '/dashboard/forecast', icon: 'radar', label: 'Forecast' },
      { href: '/dashboard/experiments', icon: 'flask', label: 'Experiments' },
      { href: '/dashboard/audience', icon: 'web', label: 'Audience Graph' },
      { href: '/dashboard/growth', icon: 'growth', label: 'Growth' },
    ],
  },
  {
    label: 'AI & Agents',
    items: [
      { href: '/dashboard/ai-tools', icon: 'bot', label: 'AI Tools' },
      { href: '/dashboard/agents', icon: 'arm', label: 'AI Agents' },
      { href: '/dashboard/agent-hub', icon: 'bot', label: 'Agent Hub' },
      { href: '/dashboard/neural', icon: 'brain', label: 'Neural' },
      { href: '/dashboard/federated', icon: 'lock', label: 'Federated ML' },
      { href: '/dashboard/twin', icon: 'mirror', label: 'Digital Twin' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/dashboard/crm', icon: 'users', label: 'CRM' },
      { href: '/dashboard/affiliates', icon: 'handshake', label: 'Affiliates' },
      { href: '/dashboard/community', icon: 'chat', label: 'Community' },
      { href: '/dashboard/loyalty', icon: 'trophy', label: 'Loyalty' },
      { href: '/dashboard/dao', icon: 'vote', label: 'DAO' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/dashboard/integrations', icon: 'plug', label: 'Integrations' },
      { href: '/dashboard/integrations-hub', icon: 'link', label: 'Integrations Hub' },
      { href: '/dashboard/developer', icon: 'wrench', label: 'Developer' },
      { href: '/dashboard/pwa-mobile', icon: 'mobile', label: 'PWA / Mobile' },
      { href: '/dashboard/translate', icon: 'translate', label: 'Translate' },
    ],
  },
  {
    label: 'Advanced',
    items: [
      { href: '/dashboard/wallet', icon: 'gem', label: 'Wallet' },
      { href: '/dashboard/quantum', icon: 'atom', label: 'Quantum' },
      { href: '/dashboard/quantum-security', icon: 'keyhole', label: 'Quantum Security' },
      { href: '/dashboard/identity', icon: 'shield', label: 'Identity' },
      { href: '/dashboard/future-tech', icon: 'crystal', label: 'Future Tech' },
      { href: '/dashboard/wellness', icon: 'leaf', label: 'Wellness' },
      { href: '/dashboard/impact', icon: 'globe', label: 'Impact' },
      { href: '/dashboard/africa-hub', icon: 'africa', label: 'Africa Hub' },
      { href: '/dashboard/ip-portfolio', icon: 'scales', label: 'IP Portfolio' },
      { href: '/dashboard/settings', icon: 'cog', label: 'Settings' },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useDashboard();
  const { user } = useAuthStore();

  return (
    <div data-page="dashboard" className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ─── Sidebar ────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-[68px]'
        )}
        style={{
          background: 'var(--surface-1)',
          borderRight: '1px solid var(--border-xs)',
        }}
      >
        {/* Logo */}
        <div
          className="h-[60px] flex items-center px-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border-xs)' }}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            {/* // mark like Flock Ramp */}
            <div
              className="fr-logo-mark w-10 h-10 rounded-xl shrink-0 text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
              </svg>
            </div>
            {sidebarOpen && (
              <span
                className="fr-display text-[26px] leading-none tracking-[-0.01em]"
                style={{ color: 'var(--ivory)' }}
              >
                Sell<span className="fr-display-italic fr-gradient-animated">Spark</span>
              </span>
            )}
          </Link>
        </div>

        {/* Nav list — grouped with editorial eyebrows */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-0.5">
              {sidebarOpen && (
                <div className="fr-eyebrow px-3 pb-1.5">{group.label}</div>
              )}
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!sidebarOpen ? item.label : undefined}
                    className={cn('fr-nav-item', active && 'active')}
                  >
                    <Icon name={item.icon} size={17} className="shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {sidebarOpen && active && (
                      <span className="ml-auto w-1 h-1 rounded-full shrink-0"
                        style={{ background: 'var(--purple-glow)', boxShadow: '0 0 8px var(--purple-glow)' }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="shrink-0 p-3" style={{ borderTop: '1px solid var(--border-xs)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.04]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'var(--grad-brand)' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                  {user?.name || 'Creator'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-4)' }}>
                  {user?.email || 'Pro Plan'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main area ──────────────────────────────────────────────── */}
      <main
        className={cn('flex-1 overflow-y-auto transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-[68px]')}
      >
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 h-14 flex items-center px-5 gap-3"
          style={{
            background: 'rgba(8,6,19,0.88)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border-xs)',
          }}
        >
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <NavButtons />
          <div className="flex-1" />

          {/* Live status */}
          <span className="fr-badge fr-badge-green hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>

          <Link
            href="/marketplace"
            className="text-sm font-medium transition-opacity hover:opacity-100 opacity-60 hidden md:block"
            style={{ color: 'var(--text-2)' }}
          >
            Marketplace
          </Link>

          <Link
            href={`/${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'store'}`}
            className="fr-btn text-sm"
            style={{ padding: '7px 18px' }}
          >
            View Store ↗
          </Link>
        </header>

        {/* Page */}
        <div className="p-6 relative z-10">{children}</div>
      </main>
    </div>
  );
}
