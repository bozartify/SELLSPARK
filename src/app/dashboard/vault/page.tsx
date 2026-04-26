'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/ui/animated-counter';

/* ═══════════════════════════════════════════════════════════════════
   Live mini chart — animated SVG line with shimmer & gradient fill
   ═══════════════════════════════════════════════════════════════════ */
function LiveChart({
  data,
  color = 'var(--purple)',
  height = 80,
  animate = true,
}: {
  data: number[];
  color?: string;
  height?: number;
  animate?: boolean;
}) {
  const w = 280;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / span) * (h - 10) - 5;
    return [x, y];
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = points[points.length - 1];
  const gradId = useMemo(() => `g-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
          strokeDasharray: animate ? 1200 : undefined,
          strokeDashoffset: animate ? 1200 : undefined,
          animation: animate ? 'chart-draw 1.6s ease-out forwards' : undefined,
        }}
      />
      {/* Last dot with pulse */}
      <circle cx={last[0]} cy={last[1]} r="4" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
        <animate attributeName="r" values="4;6;4" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Seed generators
   ═══════════════════════════════════════════════════════════════════ */
function seed(len: number, base: number, drift = 0.04, noise = 0.02): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < len; i++) {
    v = v * (1 + (Math.random() - 0.48) * noise + drift / len);
    out.push(v);
  }
  return out;
}

const ASSETS_INIT = [
  { sym: 'USDC', name: 'Creator Earnings',   base: 12847.24, color: '#7c3aed', change: 2.14 },
  { sym: 'BTC',  name: 'Reserve Treasury',    base: 0.4821,   color: '#f59e0b', change: 5.32, decimals: 4 },
  { sym: 'ETH',  name: 'Smart Payouts',       base: 18.44,    color: '#60a5fa', change: -1.28, decimals: 2 },
  { sym: 'SOL',  name: 'Fast Settlement',     base: 342.19,   color: '#22c55e', change: 8.91, decimals: 2 },
];

export default function VaultPage() {
  const [tick, setTick] = useState(0);
  const [assets, setAssets] = useState(() =>
    ASSETS_INIT.map((a) => ({ ...a, history: seed(24, a.base, 0.06, 0.04) }))
  );

  // Real-time tick every 1.8s — push new price, drop oldest
  useEffect(() => {
    const id = setInterval(() => {
      setAssets((prev) =>
        prev.map((a) => {
          const last = a.history[a.history.length - 1];
          const next = last * (1 + (Math.random() - 0.46) * 0.018);
          const history = [...a.history.slice(1), next];
          const first = history[0];
          const change = ((next - first) / first) * 100;
          return { ...a, history, change };
        })
      );
      setTick((t) => t + 1);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      {/* inject chart keyframe once */}
      <style>{`@keyframes chart-draw { to { stroke-dashoffset: 0; } }`}</style>

      {/* ═══ HERO — Glassmorphism security banner ═══ */}
      <div className="relative overflow-hidden rounded-[24px] p-8 fr-section-glow"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(16,12,30,0.85) 100%)',
          border: '1px solid var(--border-sm)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), var(--glow-sm)',
        }}>
        <div className="absolute inset-0 fr-grid-bg opacity-40" />
        <div className="absolute -top-32 -right-32 w-96 h-96 fr-glow-orb animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-2 h-2 rounded-full animate-orbit" style={{ background: 'var(--purple-glow)' }} />
        <div className="absolute top-20 right-60 w-1.5 h-1.5 rounded-full animate-orbit" style={{ background: '#22c55e', animationDuration: '8s' }} />

        <div className="relative z-10 grid lg:grid-cols-[1.3fr_1fr] gap-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="fr-badge fr-badge-purple"><span className="fr-pulse-dot" style={{ width: 6, height: 6 }} />Quantum-resistant</span>
              <span className="fr-badge fr-badge-green">SOC 2 Type II</span>
              <span className="fr-badge fr-badge-blue">ISO 27001</span>
              <span className="fr-badge fr-badge-amber">Audited by Trail of Bits</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: 'var(--text-1)' }}>
              The <span className="fr-gradient-text-purple animate-gradient">Vault</span>
              <span className="block text-xl sm:text-2xl font-semibold mt-3" style={{ color: 'var(--text-2)' }}>
                <span className="typewriter">Multi-chain custody · Post-quantum · Self-sovereign</span>
              </span>
            </h1>
            <p className="mt-5 text-base leading-relaxed max-w-xl" style={{ color: 'var(--text-3)' }}>
              Your earnings, reserves, and smart payouts — protected by lattice-based cryptography,
              hardware MPC, and real-time anomaly detection. Zero custodial risk. One dashboard.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button className="fr-btn animate-pulse-glow">🔐 Unlock Vault</button>
              <button className="fr-btn-outline">View audit reports →</button>
            </div>
          </div>

          {/* Hero trust stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Assets secured',   value: 124,  prefix: '$', suffix: 'M', accent: '#7c3aed' },
              { label: 'Uptime',            value: 99.997, suffix: '%', decimals: 3, accent: '#22c55e' },
              { label: 'Countries',         value: 84,   suffix: '+',  accent: '#60a5fa' },
              { label: 'Threats blocked',   value: 48217, suffix: '',  accent: '#f59e0b' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl relative overflow-hidden animate-pop-in"
                style={{
                  background: 'rgba(16,12,30,0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-sm)',
                  animationDelay: `${i * 90}ms`,
                  opacity: 0,
                }}
              >
                <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: s.accent, boxShadow: `0 0 10px ${s.accent}` }} />
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>{s.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: 'var(--text-1)' }}>
                  <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ REAL-TIME PRICE CHARTS ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="fr-pulse-dot" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Live markets</h2>
          <span className="text-xs" style={{ color: 'var(--text-4)' }}>Tick #{tick} · refreshed every 1.8s</span>
          <span className="fr-badge fr-badge-green ml-auto">● Streaming</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {assets.map((a) => {
            const last = a.history[a.history.length - 1];
            const up = a.change >= 0;
            return (
              <div
                key={a.sym}
                className="relative overflow-hidden rounded-2xl p-5 fr-tilt"
                style={{
                  background: 'rgba(21,17,42,0.55)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid var(--border-sm)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                }}
              >
                <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-30 blur-2xl"
                  style={{ background: a.color }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black"
                          style={{ background: `${a.color}22`, color: a.color, border: `1px solid ${a.color}44` }}
                        >
                          {a.sym}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{a.name}</span>
                      </div>
                      <p className="text-2xl font-bold mt-3" style={{ color: 'var(--text-1)' }}>
                        {a.sym === 'USDC' ? '$' : ''}
                        {last.toLocaleString(undefined, {
                          minimumFractionDigits: a.decimals ?? 2,
                          maximumFractionDigits: a.decimals ?? 2,
                        })}
                        {a.sym !== 'USDC' && <span className="text-xs ml-1" style={{ color: 'var(--text-4)' }}>{a.sym}</span>}
                      </p>
                    </div>
                    <span className={`fr-badge ${up ? 'fr-badge-green' : 'fr-badge-red'} text-[10px]`}>
                      {up ? '▲' : '▼'} {Math.abs(a.change).toFixed(2)}%
                    </span>
                  </div>
                  <LiveChart data={a.history} color={a.color} height={70} animate={false} />
                  <div className="flex items-center justify-between mt-2 text-[10px]" style={{ color: 'var(--text-4)' }}>
                    <span>24h</span>
                    <span>● Live</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ SECURITY FEATURES GRID ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg animate-bounce-subtle">🛡️</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Defense in depth</h2>
          <span className="fr-badge fr-badge-purple ml-auto">7 layers active</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {[
            {
              icon: '⚛️', title: 'Post-quantum encryption', status: 'ACTIVE', color: '#7c3aed',
              desc: 'CRYSTALS-Kyber + Dilithium protect your vault against Shor\'s algorithm — future-proof against quantum attacks.',
              metric: 'NIST Level 5',
            },
            {
              icon: '🔐', title: 'Hardware MPC custody', status: 'ACTIVE', color: '#22c55e',
              desc: 'Keys split across 5 HSMs in 3 regions. No single signer, no single point of failure. Shamir threshold 3-of-5.',
              metric: '3-of-5 threshold',
            },
            {
              icon: '👁️', title: 'Real-time anomaly detection', status: 'ACTIVE', color: '#60a5fa',
              desc: 'Federated ML flags unusual withdrawals, geographies, and spend patterns in <200ms before settlement.',
              metric: '< 200ms latency',
            },
            {
              icon: '🧬', title: 'Zero-knowledge proofs', status: 'ACTIVE', color: '#f59e0b',
              desc: 'Prove balance, compliance, and identity to counterparties without revealing the underlying data.',
              metric: 'Groth16 · Plonk',
            },
            {
              icon: '🪪', title: 'Biometric + WebAuthn', status: 'ACTIVE', color: '#ec4899',
              desc: 'Passkey, Face ID, and Touch ID. Phishing-resistant login backed by device-bound hardware keys.',
              metric: 'FIDO2 certified',
            },
            {
              icon: '🧯', title: 'Continuous audit', status: 'ACTIVE', color: '#22c55e',
              desc: 'On-chain attestations published every 6 hours. Any withdrawal is matched to a signed, timestamped proof.',
              metric: 'Every 6h',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
              style={{
                background: 'rgba(21,17,42,0.55)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-sm)',
              }}
            >
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl"
                style={{ background: f.color }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: `${f.color}22`,
                      border: `1px solid ${f.color}44`,
                      boxShadow: `0 0 20px ${f.color}33`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}44` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: f.color }} />
                    {f.status}
                  </span>
                </div>
                <h3 className="font-bold mt-4 text-base" style={{ color: 'var(--text-1)' }}>{f.title}</h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-3)' }}>{f.desc}</p>
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-xs)' }}>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Standard</span>
                  <p className="text-sm font-mono font-semibold mt-0.5" style={{ color: f.color }}>{f.metric}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ WALLET INTEGRATION SHOWCASE ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg">💎</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Connect any wallet</h2>
          <span className="fr-badge fr-badge-white ml-auto">40+ wallets · 12 chains</span>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
          {/* Featured glass card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(91,33,182,0.04))',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--border-sm)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 fr-glow-orb opacity-60 animate-float" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="fr-badge fr-badge-purple"><span className="fr-pulse-dot" style={{ width: 6, height: 6 }} />Connected</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>0x7c3a...aEd9</span>
              </div>

              <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Total balance</p>
              <p className="text-5xl font-black mt-1" style={{ color: 'var(--text-1)' }}>
                $<AnimatedCounter value={128472.41} decimals={2} />
              </p>
              <p className="text-sm mt-2" style={{ color: '#22c55e' }}>▲ $2,841 today · +2.26%</p>

              <div className="grid grid-cols-3 gap-2 mt-6">
                {[
                  { label: 'Send',     icon: '↗' },
                  { label: 'Receive',  icon: '↙' },
                  { label: 'Swap',     icon: '⇌' },
                ].map((a) => (
                  <button
                    key={a.label}
                    className="p-3 rounded-xl font-semibold text-sm flex flex-col items-center gap-1 transition-all hover:scale-[1.03]"
                    style={{
                      background: 'rgba(16,12,30,0.6)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-sm)',
                      color: 'var(--text-1)',
                    }}
                  >
                    <span className="text-lg">{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>

              {/* mini allocation bar */}
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-4)' }}>Portfolio</p>
                <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                  <div style={{ width: '42%', background: '#7c3aed', boxShadow: '0 0 10px #7c3aed' }} />
                  <div style={{ width: '28%', background: '#f59e0b' }} />
                  <div style={{ width: '18%', background: '#60a5fa' }} />
                  <div style={{ width: '12%', background: '#22c55e' }} />
                </div>
                <div className="flex justify-between mt-2 text-[10px]" style={{ color: 'var(--text-4)' }}>
                  <span>USDC 42%</span><span>BTC 28%</span><span>ETH 18%</span><span>SOL 12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet connector list */}
          <div className="space-y-2">
            {[
              { name: 'MetaMask',         icon: '🦊', status: 'Connected', chains: 'ETH · POL · ARB', glow: '#f59e0b' },
              { name: 'Phantom',          icon: '👻', status: 'Connected', chains: 'SOL · ETH',        glow: '#a78bfa' },
              { name: 'Ledger',           icon: '🔒', status: 'Hardware',   chains: '20+ chains',        glow: '#60a5fa' },
              { name: 'Coinbase Wallet',  icon: '🅒', status: 'Available',  chains: 'BASE · ETH',        glow: '#2563eb' },
              { name: 'Rainbow',          icon: '🌈', status: 'Available',  chains: 'ETH · OP',          glow: '#ec4899' },
              { name: 'WalletConnect',    icon: '🔗', status: 'Protocol',   chains: 'All chains',        glow: '#22c55e' },
            ].map((w, i) => (
              <div
                key={w.name}
                className="p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all animate-slide-in-right hover:scale-[1.02]"
                style={{
                  background: 'rgba(21,17,42,0.55)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--border-xs)',
                  animationDelay: `${i * 60}ms`,
                  opacity: 0,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${w.glow}18`, border: `1px solid ${w.glow}44`, boxShadow: `0 0 12px ${w.glow}44` }}
                >
                  {w.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{w.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-4)' }}>{w.chains}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    w.status === 'Connected' ? 'fr-badge fr-badge-green' : 'fr-badge fr-badge-white'
                  }`}
                >
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TRUST INDICATORS ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'rgba(16,12,30,0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-sm)',
        }}
      >
        <div className="absolute -bottom-20 -right-20 w-60 h-60 fr-glow-orb opacity-40 animate-float" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-lg">✨</span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Trusted by the industry</h2>
            <span className="fr-badge fr-badge-green ml-auto">Verified · 2026-04</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'SOC 2 Type II',    icon: '🏛️', color: '#22c55e' },
              { label: 'ISO 27001',         icon: '📜', color: '#60a5fa' },
              { label: 'PCI DSS L1',        icon: '💳', color: '#7c3aed' },
              { label: 'GDPR Compliant',    icon: '🇪🇺', color: '#a78bfa' },
              { label: 'NIST PQ Ready',     icon: '⚛️', color: '#ec4899' },
              { label: 'HIPAA Eligible',    icon: '🏥', color: '#f59e0b' },
            ].map((c, i) => (
              <div
                key={c.label}
                className="p-3 rounded-xl flex items-center gap-2 animate-pop-in"
                style={{
                  background: 'rgba(16,12,30,0.6)',
                  border: `1px solid ${c.color}33`,
                  animationDelay: `${i * 60}ms`,
                  opacity: 0,
                }}
              >
                <span className="text-xl">{c.icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate" style={{ color: c.color }}>{c.label}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-4)' }}>Certified</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5" style={{ borderTop: '1px solid var(--border-xs)' }}>
            {[
              { label: 'Mean time to detect',  value: 147,  suffix: 'ms',   accent: '#22c55e' },
              { label: 'Insured up to',         value: 250,  suffix: 'M',    prefix: '$', accent: '#7c3aed' },
              { label: 'Audits completed',     value: 17,   suffix: '',     accent: '#60a5fa' },
              { label: 'Bug bounty paid',      value: 1.4,  suffix: 'M',    prefix: '$', decimals: 1, accent: '#f59e0b' },
            ].map((t, i) => (
              <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>{t.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: t.accent }}>
                  <AnimatedCounter value={t.value} prefix={t.prefix} suffix={t.suffix} decimals={t.decimals} />
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial row */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { q: 'The only creator platform I\'ve trusted with 7-figure payouts.', who: 'Maya K.', role: 'Course creator · 2.4M subs' },
              { q: 'Quantum-ready gave our board full peace of mind.',                who: 'Devon R.', role: 'CFO, Orbital Labs' },
              { q: 'Real-time anomaly detection caught a phishing attempt instantly.', who: 'Aisha T.', role: 'Lead · Creator DAO' },
            ].map((t, i) => (
              <div
                key={i}
                className="p-4 rounded-xl relative animate-fade-in"
                style={{
                  background: 'rgba(21,17,42,0.55)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--border-xs)',
                  animationDelay: `${i * 120}ms`,
                  opacity: 0,
                }}
              >
                <span className="absolute top-2 right-3 text-3xl opacity-20" style={{ color: 'var(--purple-glow)' }}>&ldquo;</span>
                <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-2)' }}>{t.q}</p>
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-xs)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{t.who}</p>
                  <p className="text-xs" style={{ color: 'var(--text-4)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(91,33,182,0.05))',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-md)',
          boxShadow: '0 16px 48px rgba(124,58,237,0.2)',
        }}
      >
        <div className="absolute inset-0 fr-grid-bg opacity-30" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black" style={{ color: 'var(--text-1)' }}>
            Your keys. <span className="fr-gradient-text-purple">Your empire.</span>
          </h2>
          <p className="mt-2 text-sm max-w-lg mx-auto" style={{ color: 'var(--text-3)' }}>
            Spin up a self-custodial vault in 60 seconds. No KYC wall, no custodian in the middle.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <button className="fr-btn animate-pulse-glow">🚀 Create Vault</button>
            <Link href="/dashboard/quantum-security" className="fr-btn-outline">See security stack →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
