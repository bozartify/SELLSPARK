'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { Icon, IconName } from '@/components/ui/icon';
import { Reveal, Counter, Magnetic } from '@/components/ui/motion';
import { Sparkline, FlashNumber, RadialRing } from '@/components/ui/fintech';

const STATS: { label: string; value: number; prefix?: string; suffix?: string; decimals?: number; change: string; up: boolean; icon: IconName; spark: number[] }[] = [
  { label: 'Total Revenue', value: 12847, prefix: '$', change: '+23%', up: true, icon: 'money', spark: [40, 52, 49, 60, 58, 70, 72, 80, 84] },
  { label: 'Orders', value: 284, change: '+18%', up: true, icon: 'receipt', spark: [12, 18, 15, 22, 28, 25, 32, 36, 40] },
  { label: 'Store Visitors', value: 8432, change: '+31%', up: true, icon: 'web', spark: [200, 240, 260, 290, 310, 360, 400, 440, 480] },
  { label: 'Conversion Rate', value: 3.4, suffix: '%', decimals: 1, change: '+0.8%', up: true, icon: 'spark', spark: [2.1, 2.4, 2.6, 2.8, 3.0, 3.1, 3.2, 3.3, 3.4] },
];

const RECENT_ORDERS = [
  { product: '12-Week Fitness Plan', customer: 'Sarah M.', amount: 97, date: '2h ago' },
  { product: 'AI Content Generator', customer: 'Mike R.', amount: 29, date: '4h ago' },
  { product: 'VIP Coaching Call', customer: 'Emma L.', amount: 150, date: '6h ago' },
  { product: 'Digital Resource Pack', customer: 'Alex K.', amount: 39, date: '12h ago' },
];

const AI_INSIGHTS: { icon: IconName; tag: string; text: string; cta: string; href: string }[] = [
  { icon: 'chart', tag: 'Conversion', text: 'Mobile converts 2× better than desktop. A mobile-first page could unlock +$3.2K/mo.', cta: 'Optimize', href: '/dashboard/analytics-pro' },
  { icon: 'box', tag: 'Bundle', text: 'Bundle your top 2 products at 15% off — similar creators see 40% revenue lift.', cta: 'Create', href: '/dashboard/products' },
  { icon: 'mail', tag: 'Email', text: 'Open rates peak 9AM Tuesday for your audience. Schedule your next campaign then.', cta: 'Schedule', href: '/dashboard/email' },
];

const QUICK: { icon: IconName; label: string; href: string; color: string }[] = [
  { icon: 'box', label: 'Products', href: '/dashboard/products', color: '#7c3aed' },
  { icon: 'stars', label: 'Creator Studio', href: '/dashboard/creator-studio', color: '#9b6ef5' },
  { icon: 'bot', label: 'Agent Hub', href: '/dashboard/agent-hub', color: '#a78bfa' },
  { icon: 'africa', label: 'Africa Hub', href: '/dashboard/africa-hub', color: '#22c55e' },
  { icon: 'atom', label: 'Quantum', href: '/dashboard/quantum-security', color: '#f59e0b' },
  { icon: 'money', label: 'Monetization', href: '/dashboard/monetization', color: '#ef4444' },
  { icon: 'chart', label: 'Analytics', href: '/dashboard/analytics-pro', color: '#60a5fa' },
  { icon: 'scales', label: 'IP Portfolio', href: '/dashboard/ip-portfolio', color: '#c084fc' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-7 max-w-[1400px]">

      {/* Hero banner */}
      <Reveal>
        <div className="relative overflow-hidden rounded-[20px] p-8"
          style={{
            background: 'linear-gradient(135deg, var(--surface-2), var(--surface-1))',
            border: '1px solid var(--border-sm)',
            boxShadow: '0 30px 80px -20px rgba(124,58,237,0.25)',
          }}>
          <div className="absolute -top-32 -right-32 w-80 h-80 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)' }} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="fr-mono text-[10px] uppercase tracking-widest mb-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(124,58,237,0.18)', color: 'var(--purple-glow)', border: '1px solid rgba(167,139,250,0.3)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--purple-glow)' }} />
                SellSpark OS · Live
              </div>
              <h1 className="fr-display text-[44px] leading-[1]" style={{ color: 'var(--ivory)' }}>
                Welcome back, <span className="fr-display-italic fr-gradient-animated">{user?.name || 'Creator'}</span>.
              </h1>
              <p className="mt-3 text-[14px] max-w-md" style={{ color: 'var(--text-3)' }}>
                Your store is performing above average today. Three AI insights waiting.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Magnetic strength={10}>
                  <Link href="/dashboard/products" className="fr-btn text-[13px]" style={{ padding: '11px 20px', fontWeight: 600 }}>
                    + Add product
                  </Link>
                </Magnetic>
                <Link href="/dashboard/analytics-pro" className="text-[13px] px-5 py-2.5 rounded-md"
                  style={{ color: 'var(--text-1)', border: '1px solid var(--border-md)' }}>
                  View analytics →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { label: 'MRR', value: 4820, prefix: '$' },
                { label: 'Members', value: 142 },
                { label: 'Avg Order', value: 78.5, prefix: '$', dec: 2 },
                { label: 'Churn Risk', value: 3, suffix: ' users' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-4 min-w-[130px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)' }}>
                  <p className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{s.label}</p>
                  <p className="fr-display text-[22px] leading-tight mt-1" style={{ color: 'var(--ivory)' }}>
                    <Counter to={s.value} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} decimals={s.dec ?? 0} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* KPI row with sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: 'var(--grad-brand)' }} />
              <div className="flex items-center justify-between mb-3">
                <span style={{ color: 'var(--purple-glow)' }}><Icon name={s.icon} size={20} /></span>
                <span className="fr-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.18)', color: '#4ade80' }}>{s.change}</span>
              </div>
              <p className="fr-display text-[32px] leading-none" style={{ color: 'var(--ivory)' }}>
                <FlashNumber value={s.value} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} decimals={s.decimals ?? 0} />
              </p>
              <p className="fr-mono text-[10px] uppercase tracking-widest mt-2 mb-3" style={{ color: 'var(--text-3)' }}>{s.label}</p>
              <Sparkline data={s.spark} width={180} height={32} stroke="var(--purple-glow)" fill="auto" />
            </div>
          </Reveal>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* AI Insights */}
        <Reveal>
          <div className="rounded-2xl overflow-hidden h-full"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-sm)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.18)', color: 'var(--purple-glow)' }}>
                <Icon name="brain" size={16} />
              </div>
              <span className="fr-display text-[16px]" style={{ color: 'var(--ivory)' }}>AI Insights</span>
              <span className="ml-auto fr-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(124,58,237,0.18)', color: 'var(--purple-glow)' }}>3 new</span>
            </div>
            <div className="p-4 space-y-3">
              {AI_INSIGHTS.map((ins, i) => (
                <div key={i} className="rounded-xl p-4"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border-xs)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: 'var(--purple-glow)' }}><Icon name={ins.icon} size={14} /></span>
                    <span className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--purple-glow)' }}>{ins.tag}</span>
                  </div>
                  <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>{ins.text}</p>
                  <Link href={ins.href} className="fr-mono text-[11px] uppercase tracking-widest" style={{ color: 'var(--purple-glow)' }}>
                    {ins.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Recent orders */}
        <Reveal delay={120}>
          <div className="rounded-2xl overflow-hidden h-full lg:col-span-2"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-sm)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.18)', color: 'var(--purple-glow)' }}>
                  <Icon name="receipt" size={16} />
                </div>
                <span className="fr-display text-[16px]" style={{ color: 'var(--ivory)' }}>Recent Orders</span>
              </div>
              <Link href="/dashboard/orders" className="fr-mono text-[11px] uppercase tracking-widest"
                style={{ color: 'var(--purple-glow)' }}>View all →</Link>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-xs)' }}>
                  {['Product', 'Customer', 'Date', 'Amount', 'Status'].map((h, i) => (
                    <th key={h} className={`fr-mono text-[10px] uppercase tracking-widest text-left px-5 py-3 ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 2 ? 'hidden md:table-cell' : ''} ${i >= 3 ? 'text-right' : ''}`}
                      style={{ color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-xs)' }}>
                    <td className="px-5 py-4 text-[13px]" style={{ color: 'var(--ivory)' }}>{o.product}</td>
                    <td className="hidden sm:table-cell px-5 py-4 text-[13px]" style={{ color: 'var(--text-2)' }}>{o.customer}</td>
                    <td className="hidden md:table-cell px-5 py-4 fr-mono text-[11px]" style={{ color: 'var(--text-3)' }}>{o.date}</td>
                    <td className="text-right px-5 py-4 fr-display text-[15px]" style={{ color: 'var(--ivory)' }}>{formatPrice(o.amount)}</td>
                    <td className="text-right px-5 py-4">
                      <span className="fr-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(74,222,128,0.18)', color: '#4ade80' }}>Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>

      {/* Performance rings */}
      <Reveal>
        <div className="rounded-2xl p-7 grid md:grid-cols-3 gap-6"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
          {[
            { pct: 78, label: 'Goal', color: '#a78bfa' },
            { pct: 92, label: 'Health', color: '#4ade80' },
            { pct: 64, label: 'Engagement', color: '#60a5fa' },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-5">
              <RadialRing pct={r.pct} size={96} stroke={8} color={r.color} label={r.label} />
              <div>
                <div className="fr-display text-[20px]" style={{ color: 'var(--ivory)' }}>{r.label}</div>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                  Updated 2 minutes ago · vs last week
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Quick access */}
      <div>
        <p className="fr-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: 'var(--purple-glow)' }}>◆ Quick Access</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {QUICK.map((q, i) => (
            <Reveal key={q.href} delay={i * 30}>
              <Link href={q.href}>
                <div className="rounded-xl p-3 flex flex-col items-center gap-2 text-center transition-all"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${q.color}22`, border: `1px solid ${q.color}44`, color: q.color }}>
                    <Icon name={q.icon} size={18} />
                  </div>
                  <p className="text-[11px] leading-tight" style={{ color: 'var(--text-2)' }}>{q.label}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <div className="h-px" style={{ background: 'var(--border-sm)' }} />
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <p className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
          // SellSpark OS · Quantum-resistant · Privacy-first
        </p>
        <div className="flex gap-5 flex-wrap">
          {['Quantum', 'DAO', 'Federated', 'IP', 'Africa'].map((l) => (
            <Link key={l} href={`/dashboard/${l.toLowerCase()}`}
              className="fr-mono text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--purple-glow)' }}>
              {l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
