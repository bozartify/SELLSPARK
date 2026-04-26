'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CommandPalette, CommandItem } from '@/components/ui/command-palette';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { AnimatedCounter } from '@/components/ui/animated-counter';

/* ═══════════════════════════════════════════════════════════════════
   Radial progress meter
   ═══════════════════════════════════════════════════════════════════ */
function RadialMeter({
  value, max = 100, size = 120, color = 'var(--purple)', label, sub,
}: { value: number; max?: number; size?: number; color?: string; label?: string; sub?: string }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setDrawn(pct), 50);
    return () => clearTimeout(id);
  }, [pct]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - drawn)}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.3,1)', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color: 'var(--text-1)' }}>
          <AnimatedCounter value={value} suffix={max === 100 ? '%' : ''} />
        </span>
        {label && <span className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-4)' }}>{label}</span>}
        {sub && <span className="text-[10px] mt-0.5" style={{ color: color }}>{sub}</span>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Activity heatmap (GitHub-style)
   ═══════════════════════════════════════════════════════════════════ */
function Heatmap() {
  const data = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 7 * 16; i++) arr.push(Math.floor(Math.random() * 5));
    return arr;
  }, []);
  const color = (v: number) => {
    if (v === 0) return 'var(--surface-3)';
    if (v === 1) return 'rgba(124,58,237,0.25)';
    if (v === 2) return 'rgba(124,58,237,0.45)';
    if (v === 3) return 'rgba(124,58,237,0.70)';
    return '#a78bfa';
  };
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridAutoColumns: '14px' }}>
        {data.map((v, i) => (
          <div
            key={i}
            className="w-[14px] h-[14px] rounded-sm transition-all hover:scale-125 cursor-pointer"
            style={{
              background: color(v),
              boxShadow: v >= 3 ? `0 0 6px ${color(v)}` : 'none',
              animation: `fade-in 0.6s ease-out ${i * 4}ms forwards`,
              opacity: 0,
            }}
            title={`${v} actions`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: 'var(--text-4)' }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((v) => <div key={v} className="w-3 h-3 rounded-sm" style={{ background: color(v) }} />)}
        <span>More</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Sparkline (inline mini chart)
   ═══════════════════════════════════════════════════════════════════ */
function Sparkline({ data, color = 'var(--purple)', w = 80, h = 22 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const stepX = w / (data.length - 1);
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block align-middle">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Segmented control
   ═══════════════════════════════════════════════════════════════════ */
function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex p-1 rounded-xl" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-xs)' }}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize"
            style={{
              background: active ? 'var(--grad-brand)' : 'transparent',
              color: active ? '#fff' : 'var(--text-3)',
              boxShadow: active ? 'var(--glow-sm)' : 'none',
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Toggle switch
   ═══════════════════════════════════════════════════════════════════ */
function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-10 h-6 rounded-full transition-all"
      style={{
        background: checked ? 'var(--grad-brand)' : 'var(--surface-3)',
        boxShadow: checked ? 'var(--glow-sm)' : 'none',
        border: `1px solid ${checked ? 'var(--purple)' : 'var(--border-sm)'}`,
      }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-lg"
        style={{ left: checked ? '20px' : '4px' }}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Inner page content (toast hook requires provider)
   ═══════════════════════════════════════════════════════════════════ */
function ReferenceContent() {
  const { toast } = useToast();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [seg, setSeg] = useState('week');
  const [notify, setNotify] = useState(true);
  const [sortKey, setSortKey] = useState<'revenue' | 'orders' | 'growth'>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ⌘K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const commands: CommandItem[] = [
    { id: '1', icon: '📦', title: 'New product',         hint: 'Launch a digital product', group: 'Create', action: () => toast({ title: 'Product wizard opened', variant: 'success' }) },
    { id: '2', icon: '📧', title: 'New email campaign',   hint: 'Compose broadcast',        group: 'Create', action: () => toast({ title: 'Campaign drafted', variant: 'info' }) },
    { id: '3', icon: '🤖', title: 'Hire AI agent',         hint: 'Browse marketplace',       group: 'Create', href: '/dashboard/agent-hub' },
    { id: '4', icon: '📊', title: 'Open Analytics Pro',    hint: 'Cohorts, LTV, attribution', group: 'Navigate', href: '/dashboard/analytics-pro' },
    { id: '5', icon: '🔐', title: 'Open Vault',             hint: 'Custody & payouts',          group: 'Navigate', href: '/dashboard/vault' },
    { id: '6', icon: '🌍', title: 'Open Africa Hub',        hint: 'Mobile money & languages',   group: 'Navigate', href: '/dashboard/africa-hub' },
    { id: '7', icon: '⚛️', title: 'Quantum Security',       hint: 'PQ certs, QKD, ZKP',          group: 'Navigate', href: '/dashboard/quantum-security' },
    { id: '8', icon: '⚙️', title: 'Settings',               hint: 'Account preferences',        group: 'Navigate', href: '/dashboard/settings' },
    { id: '9', icon: '🌓', title: 'Toggle theme',           hint: 'Dark · Dim · System',        group: 'App',     action: () => toast({ title: 'Theme: Dim', variant: 'default' }) },
    { id: '10', icon: '🔔', title: 'Notification settings', hint: 'Email, push, in-app',        group: 'App',     action: () => toast({ title: 'Opened notifications', variant: 'info' }) },
  ];

  const rows = [
    { product: '12-Week Fitness Plan',  revenue: 14700, orders: 142, growth: 23.4, spark: [3,4,3,5,6,5,7,8] },
    { product: 'AI Content Generator',  revenue: 11281, orders: 389, growth: 18.2, spark: [5,5,4,6,6,7,6,8] },
    { product: 'VIP Coaching Call',     revenue: 22500, orders:  28, growth: 41.8, spark: [2,3,3,4,5,6,7,9] },
    { product: 'Digital Resource Pack', revenue:  8385, orders: 215, growth: -4.1, spark: [6,5,5,4,5,4,4,3] },
    { product: 'Monthly Membership',    revenue: 18420, orders:  67, growth:  9.6, spark: [4,4,5,5,5,6,6,7] },
  ];

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey]; const bv = b[sortKey];
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function toggleSort(k: typeof sortKey) {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      {/* ═══ HERO / Context bar ═══ */}
      <div className="relative overflow-hidden rounded-[24px] p-7"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(16,12,30,0.88))',
          backdropFilter: 'blur(28px)',
          border: '1px solid var(--border-sm)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), var(--glow-sm)',
        }}>
        <div className="absolute inset-0 fr-grid-bg opacity-40" />
        <div className="absolute -top-32 -right-24 w-96 h-96 fr-glow-orb animate-pulse-glow" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="fr-badge fr-badge-purple"><span className="fr-pulse-dot" style={{ width: 6, height: 6 }} />Pro Max · Reference</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: 'var(--text-1)' }}>
              Command your creator OS
              <span className="fr-gradient-text-purple animate-gradient"> at the speed of thought.</span>
            </h1>
            <p className="text-sm mt-3 max-w-xl" style={{ color: 'var(--text-3)' }}>
              Keyboard-first, glass-finished, and tuned for creators who ship. Every primitive on this page is production-ready.
            </p>
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(16,12,30,0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-sm)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <span style={{ color: 'var(--text-3)' }}>⌘</span>
            <span className="text-sm" style={{ color: 'var(--text-3)' }}>Search, navigate, create…</span>
            <span className="flex gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] rounded font-mono" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] rounded font-mono" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>K</kbd>
            </span>
          </button>
        </div>
      </div>

      {/* ═══ KPI ROW — radial meters ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { v: 87,    l: 'Goal progress',    s: 'Q2 target',       c: '#7c3aed' },
          { v: 99.98, l: 'Uptime',           s: 'Last 30 days',    c: '#22c55e' },
          { v: 64,    l: 'CTR',              s: 'vs industry 12%', c: '#60a5fa' },
          { v: 42,    l: 'Margin',           s: '+8% MoM',         c: '#f59e0b' },
        ].map((m) => (
          <div
            key={m.l}
            className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-5 fr-tilt"
            style={{
              background: 'rgba(21,17,42,0.55)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--border-sm)',
            }}
          >
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-30 blur-2xl" style={{ background: m.c }} />
            <div className="relative z-10 shrink-0"><RadialMeter value={m.v} size={92} color={m.c} /></div>
            <div className="relative z-10 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{m.l}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{m.s}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Split: Activity feed + Heatmap + Smart controls ═══ */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Activity feed */}
        <div
          className="rounded-2xl overflow-hidden lg:col-span-1"
          style={{ background: 'rgba(21,17,42,0.55)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)' }}
        >
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border-xs)' }}>
            <span className="fr-pulse-dot" />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Live activity</span>
            <span className="fr-badge fr-badge-green ml-auto">● Streaming</span>
          </div>
          <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto">
            {[
              { who: 'Sarah M.',   act: 'bought',     what: '12-Week Plan',          when: '14s',  amt: '$97',  icon: '💰', c: '#22c55e' },
              { who: 'Mike R.',    act: 'subscribed', what: 'Monthly Membership',    when: '42s',  amt: '$49',  icon: '💎', c: '#7c3aed' },
              { who: 'Agent Copy', act: 'drafted',    what: 'launch email #3',       when: '1m',                  icon: '✍️', c: '#60a5fa' },
              { who: 'Emma L.',    act: 'booked',     what: 'VIP Coaching Call',     when: '3m',  amt: '$150', icon: '📅', c: '#f59e0b' },
              { who: 'System',     act: 'verified',   what: 'quantum attestation',   when: '4m',                  icon: '⚛️', c: '#a78bfa' },
              { who: 'Alex K.',    act: 'bought',     what: 'Resource Pack',         when: '7m',  amt: '$39',  icon: '💰', c: '#22c55e' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-3 animate-slide-in-right" style={{ animationDelay: `${i * 70}ms`, opacity: 0 }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: `${e.c}22`, border: `1px solid ${e.c}44` }}
                >
                  {e.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-1)' }}>
                    <span className="font-semibold">{e.who}</span>{' '}
                    <span style={{ color: 'var(--text-3)' }}>{e.act}</span>{' '}
                    <span style={{ color: 'var(--purple-glow)' }}>{e.what}</span>
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>{e.when} ago{e.amt ? ` · ${e.amt}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div
          className="rounded-2xl p-5 lg:col-span-1"
          style={{ background: 'rgba(21,17,42,0.55)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Engagement heatmap</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>16 weeks · 734 actions</p>
            </div>
            <Segmented options={['day', 'week', 'month']} value={seg} onChange={setSeg} />
          </div>
          <Heatmap />
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--border-xs)' }}>
            {[
              { l: 'Current streak', v: '14 days',  c: '#7c3aed' },
              { l: 'Longest',        v: '42 days',  c: '#a78bfa' },
              { l: 'This week',      v: '+23%',     c: '#22c55e' },
            ].map((x) => (
              <div key={x.l}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>{x.l}</p>
                <p className="text-sm font-bold mt-1" style={{ color: x.c }}>{x.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Smart controls */}
        <div
          className="rounded-2xl p-5 lg:col-span-1"
          style={{ background: 'rgba(21,17,42,0.55)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">⚡</span>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Quick actions</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Ship notifications',   desc: 'Push + email on new order',    s: notify,     onChange: setNotify },
              { label: 'AI autopilot',          desc: 'Agents draft weekly content',  s: true,      onChange: () => {} },
              { label: 'Quantum-safe mode',    desc: 'Require PQ-verified payouts',  s: true,      onChange: () => {} },
              { label: 'Maintenance window',   desc: 'Pause automations Sundays 2a', s: false,     onChange: () => {} },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 p-3 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-xs)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{row.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>{row.desc}</p>
                </div>
                <Switch checked={row.s} onChange={row.onChange} />
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => toast({ title: 'Settings saved', variant: 'success' })} className="fr-btn text-xs">Save</button>
            <button onClick={() => toast({ title: 'Payout failed', description: 'Insufficient balance for $4,820', variant: 'error' })} className="fr-btn-outline text-xs">Test error</button>
            <button onClick={() => toast({ title: 'New insight available', description: 'Mobile converts 2× desktop', variant: 'info' })} className="fr-btn-outline text-xs">Test info</button>
            <button onClick={() => toast({ title: 'Bandwidth quota 85%', variant: 'warning' })} className="fr-btn-outline text-xs">Test warn</button>
          </div>
        </div>
      </div>

      {/* ═══ Sortable data table with sparklines ═══ */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(21,17,42,0.55)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-xs)' }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Top products</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>5 products · click header to sort</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="fr-badge fr-badge-purple text-[10px]">Sorted by {sortKey} {sortDir === 'asc' ? '↑' : '↓'}</span>
            <Link href="/dashboard/products" className="fr-btn-ghost text-xs">View all →</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-xs)' }}>
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Product</th>
                {(['revenue', 'orders', 'growth'] as const).map((k) => (
                  <th
                    key={k}
                    onClick={() => toggleSort(k)}
                    className="text-right px-5 py-3 text-[11px] uppercase tracking-widest cursor-pointer transition-colors hover:text-[var(--purple-glow)]"
                    style={{ color: sortKey === k ? 'var(--purple-glow)' : 'var(--text-4)' }}
                  >
                    {k} {sortKey === k && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Trend</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.product}
                  className="transition-colors animate-fade-in group cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border-xs)', animationDelay: `${i * 50}ms`, opacity: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-1)' }}>{r.product}</td>
                  <td className="px-5 py-3 text-right font-mono" style={{ color: 'var(--text-1)' }}>${r.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right" style={{ color: 'var(--text-2)' }}>{r.orders}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`fr-badge ${r.growth >= 0 ? 'fr-badge-green' : 'fr-badge-red'} text-[10px]`}>
                      {r.growth >= 0 ? '▲' : '▼'} {Math.abs(r.growth).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right"><Sparkline data={r.spark} color={r.growth >= 0 ? '#22c55e' : '#ef4444'} /></td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold"
                      style={{ color: 'var(--purple-glow)' }}
                    >
                      Open →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ State patterns: loading, empty, error ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg">🎛️</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>State patterns</h2>
          <span className="fr-badge fr-badge-white ml-auto">Loading · Empty · Error</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {/* Skeleton loading */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(21,17,42,0.55)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)' }}>
            <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: 'var(--text-4)' }}>Loading state</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded shimmer w-3/4" />
                  <div className="h-2 rounded shimmer w-1/2" />
                </div>
              </div>
              <div className="h-20 rounded-xl shimmer" />
              <div className="flex gap-2">
                <div className="h-8 rounded-lg shimmer flex-1" />
                <div className="h-8 rounded-lg shimmer flex-1" />
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(21,17,42,0.55)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)', minHeight: 240 }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 animate-float"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid var(--border-sm)' }}>
              📭
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-1)' }}>No campaigns yet</p>
            <p className="text-xs mt-1 max-w-[220px]" style={{ color: 'var(--text-3)' }}>
              Create your first broadcast and we&apos;ll auto-segment your list by engagement.
            </p>
            <button onClick={() => toast({ title: 'Campaign composer opened', variant: 'info' })} className="fr-btn text-xs mt-4">
              + New campaign
            </button>
          </div>

          {/* Error state */}
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'rgba(239,68,68,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-20 blur-2xl" style={{ background: '#ef4444' }} />
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg animate-bounce-subtle"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}>
                  !
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#fca5a5' }}>Payout failed</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                    Bank connection timed out after 30s. Funds are safe. Retry or switch rail.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg font-mono text-[10px]" style={{ background: 'rgba(8,6,19,0.6)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                Error: ECONNRESET<br />
                at BankAdapter.transfer (idx: 0x7c3aed)
              </div>
              <div className="flex gap-2 mt-4">
                <button className="fr-btn text-xs flex-1">Retry</button>
                <button className="fr-btn-outline text-xs flex-1">Switch rail</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Keyboard shortcut cheatsheet ═══ */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(16,12,30,0.85))', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)' }}>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 fr-glow-orb opacity-40 animate-float" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">⌨️</span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Keyboard shortcuts</h2>
            <span className="fr-badge fr-badge-purple ml-auto">Power user</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { group: 'General', items: [['⌘ K', 'Command palette'], ['⌘ /', 'Quick search'], ['G then D', 'Go to dashboard'], ['?', 'Show shortcuts']] },
              { group: 'Create',  items: [['C P', 'New product'], ['C E', 'New email'], ['C A', 'Hire agent'], ['C X', 'New experiment']] },
              { group: 'Navigate',items: [['G V', 'Go to Vault'], ['G Q', 'Go to Quantum'], ['G A', 'Go to Analytics'], ['G S', 'Go to Settings']] },
              { group: 'Actions', items: [['⌘ S', 'Save'], ['⌘ Z', 'Undo'], ['⌘ Enter', 'Submit'], ['esc', 'Cancel']] },
            ].map((col) => (
              <div key={col.group}>
                <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>{col.group}</p>
                <div className="space-y-2">
                  {col.items.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{v}</span>
                      <div className="flex gap-1">
                        {k.split(' ').map((key, i) => (
                          <kbd
                            key={i}
                            className="px-1.5 py-0.5 text-[10px] rounded font-mono font-bold"
                            style={{
                              background: 'rgba(124,58,237,0.15)',
                              border: '1px solid var(--border-sm)',
                              color: 'var(--text-2)',
                              minWidth: 20, textAlign: 'center',
                            }}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CommandPalette items={commands} open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Floating trigger */}
      <button onClick={() => setPaletteOpen(true)} className="fr-fab" title="Command palette (⌘K)">
        <span>⌘</span>
      </button>
    </div>
  );
}

export default function ReferencePage() {
  return (
    <ToastProvider>
      <ReferenceContent />
    </ToastProvider>
  );
}
