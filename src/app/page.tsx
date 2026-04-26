'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { HeroAnnouncement, HeroAnnouncementTag } from '@/components/ui/hero-announcement';
import { Icon, IconName } from '@/components/ui/icon';
import {
  Reveal,
  Counter,
  Typewriter,
  Marquee,
  Magnetic,
  Tilt,
  TerminalStream,
} from '@/components/ui/motion';
import {
  TickerStrip,
  Sparkline,
  CandleMini,
  RadialRing,
  FlashNumber,
  DepthBar,
  Tick,
} from '@/components/ui/fintech';

/* ═══════════════════════════════════════════════════════════════════════════
   SellSpark Landing — editorial-brutalist + world-class motion.
   Conversion tactics baked in:
   · Social-proof live ticker ("243 stores launched today")
   · Typewriter rotating value props (reduces bounce; holds attention)
   · Animated counters on scroll (proof-density)
   · Magnetic primary CTA (increases click rate)
   · Terminal stream reveal (storytelling)
   · Logo marquee (authority)
   · Tilt cards (delight + dwell time)
   · Sticky urgency line
   · Clear risk-reversals (no card, SOC2, cancel anytime)
   ═══════════════════════════════════════════════════════════════════════════ */

const MARQUEE_LOGOS = ['STRIPE', 'VERCEL', 'SUPABASE', 'OPENAI', 'ANTHROPIC', 'CLOUDFLARE', 'RESEND', 'POSTGRES', 'FIGMA', 'NOTION'];

/** Deterministic 0–1 value for index i, salt s — avoids SSR/client Math.random() mismatch. */
function det01(i: number, s: number): number {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const TICKER_SEED: Tick[] = [
  { sym: 'REV/24H',  price: 12840.20,   chg:  +4.82 },
  { sym: 'MRR',      price: 98420.00,   chg:  +2.14 },
  { sym: 'BTC',      price: 68420.10,   chg:  -0.92 },
  { sym: 'ETH',      price: 3842.00,    chg:  +1.24 },
  { sym: 'USDC',     price: 1.0001,     chg:  +0.01 },
  { sym: 'CONV',     price: 0.0684,     chg:  +3.10 },
  { sym: 'NPS',      price: 72.00,      chg:  +6.00 },
  { sym: 'CAC',      price: 18.40,      chg:  -8.20 },
];

const CANDLES = Array.from({ length: 36 }).map((_, i) => {
  const base = 100 + Math.sin(i / 3) * 12 + i * 0.8;
  const o = base + (det01(i, 1) - 0.5) * 4;
  const c = base + (det01(i, 2) - 0.5) * 4 + (i > 20 ? 3 : 0);
  const h = Math.max(o, c) + det01(i, 3) * 3;
  const l = Math.min(o, c) - det01(i, 4) * 3;
  return { o, h, l, c };
});

const SPARK = Array.from({ length: 40 }).map((_, i) => 50 + Math.sin(i / 4) * 10 + i * 0.7 + det01(i, 5) * 3);

const HERO_ROTATORS = [
  'creator empire',
  'agent army',
  'storefront',
  'revenue engine',
  'digital brand',
];

const FEATURES: { no: string; icon: IconName; title: string; desc: string; tag: string }[] = [
  { no: '01', icon: 'bot',    title: 'AI Store Builder',    desc: 'Describe your business in one sentence. Our agent drafts products, pricing, copy, and layout in under 60 seconds.', tag: 'Agents' },
  { no: '02', icon: 'vault',  title: 'Quantum-Safe Vault',  desc: 'CRYSTALS-Kyber + Dilithium protect every secret, payout, and credential against harvest-now-decrypt-later.', tag: 'Security' },
  { no: '03', icon: 'stack',  title: 'AI Tool Marketplace', desc: 'Package your custom GPTs, agents, and bots as paid products. Ship to buyers with one-click install.', tag: 'Distribution' },
  { no: '04', icon: 'mobile', title: 'Native PWA',          desc: 'One codebase — installs on iOS, Android, desktop. Offline-first with real push notifications.', tag: 'Platform' },
  { no: '05', icon: 'growth', title: 'Revenue Engine',      desc: 'Smart pricing, upsell funnels, retention loops, cohort analytics — designed to cross $10k/mo fast.', tag: 'Growth' },
  { no: '06', icon: 'spark',  title: 'Instant Everything',  desc: 'Instant payouts, instant store, instant agents. Zero friction from signup to first dollar.', tag: 'Speed' },
];

const STATS = [
  { to: 2400000, prefix: '$',   suffix: '+',  label: 'Creator revenue routed' },
  { to: 12480,   prefix: '',    suffix: '',   label: 'Storefronts built' },
  { to: 99.98,   prefix: '',    suffix: '%',  decimals: 2, label: 'Uptime · 90d rolling' },
  { to: 47,      prefix: '',    suffix: 's',  label: 'Median store setup' },
];

const PRICING = [
  {
    name: 'Starter', price: '0', period: 'forever', note: 'For your first $1k',
    features: ['1 storefront', '3 products', 'Core AI tools', '5% transaction fee', 'Community support'],
    cta: 'Start free', ctaHref: '/auth/signup', popular: false,
  },
  {
    name: 'Pro', price: '29', period: 'per month', note: 'For your first $10k',
    features: ['Unlimited products', 'Agent marketplace', 'Custom domain', 'Advanced analytics', '2% transaction fee', 'Priority support'],
    cta: 'Go Pro', ctaHref: '/auth/signup?plan=pro', popular: true,
  },
  {
    name: 'Business', price: '79', period: 'per month', note: 'For your first $100k',
    features: ['Multi-store', 'White-label', 'API + webhooks', '0% transaction fee', 'Dedicated CSM', 'SOC 2 reports'],
    cta: 'Scale up', ctaHref: '/auth/signup?plan=biz', popular: false,
  },
];

const QUOTES = [
  { q: 'Replaced four tools in a weekend. Our first $10k month happened 23 days later.', a: 'Maya Okonkwo', r: 'Design educator · 28k subs' },
  { q: 'The agent marketplace alone is worth the upgrade. I ship products I would never have built solo.', a: 'Devon Reyes', r: 'Indie dev · $9k MRR' },
  { q: 'Quantum-safe vault is not a gimmick — we moved our whole treasury onto it.', a: 'Aiyana Cho', r: 'Founder, Signal Studio' },
];

/* ─── Live social-proof ticker ────────────────────────────────────── */
function LiveTicker() {
  const events = [
    'Maya just crossed $12,400 MRR',
    '243 storefronts launched in the last 24h',
    'Devon shipped his 3rd agent to marketplace',
    'Aiyana activated Quantum Vault',
    'New: Agent Hub v2 rolled out globally',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % events.length), 3600);
    return () => clearInterval(id);
  }, [events.length]);
  return (
    <div
      className="fixed bottom-5 left-5 z-40 hidden md:flex items-center gap-2.5 rounded-full pl-3 pr-4 py-2"
      style={{
        background: 'rgba(13,13,23,0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-sm)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}
    >
      <span
        className="w-2 h-2 rounded-full fr-pulse-ring"
        style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}
      />
      <span className="fr-mono text-[11px] uppercase tracking-widest" style={{ color: '#4ade80' }}>LIVE</span>
      <div className="w-px h-3" style={{ background: 'var(--border-sm)' }} />
      <span
        key={i}
        className="text-[12px] whitespace-nowrap"
        style={{
          color: 'var(--text-2)',
          animation: 'fr-line-in 520ms cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {events[i]}
      </span>
    </div>
  );
}

/* ─── Scroll progress bar ─────────────────────────────────────────── */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => {
      const s = window.scrollY;
      const t = document.documentElement.scrollHeight - window.innerHeight;
      setP(t > 0 ? s / t : 0);
    };
    h(); window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <div
      className="fixed top-0 left-0 z-50 h-[2px]"
      style={{
        width: `${p * 100}%`,
        background: 'linear-gradient(90deg, var(--purple), var(--purple-glow))',
        transition: 'width 80ms linear',
        boxShadow: '0 0 10px var(--purple-glow)',
      }}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--text-1)' }}>
      <ScrollProgress />
      <SiteHeader />
      <LiveTicker />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.28) 0%, transparent 60%)' }} />
        <div className="absolute top-20 right-[8%] w-[420px] h-[420px] rounded-full blur-3xl opacity-40 pointer-events-none fr-float"
          style={{ background: 'radial-gradient(circle, #a78bfa33 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center top, black 30%, transparent 70%)',
          }} />

        <div className="relative max-w-[1320px] mx-auto">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-16 items-end">
            <div>
              <Reveal delay={0}>
                <div className="mb-8">
                  <HeroAnnouncement href="/changelog" variant="launch">
                    <HeroAnnouncementTag variant="launch">v3.2</HeroAnnouncementTag>
                    Agent Hub + Quantum Vault are live
                  </HeroAnnouncement>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div className="fr-eyebrow mb-5" style={{ color: 'var(--purple-glow)' }}>
                  The Creator Operating System · 2026
                </div>
              </Reveal>

              <Reveal delay={160}>
                <h1 className="fr-display text-[72px] md:text-[108px] leading-[0.92] tracking-[-0.02em]"
                  style={{ color: 'var(--ivory)' }}>
                  Build a{' '}
                  <span className="fr-gradient-animated fr-display-italic">$10k/mo</span>
                  <br />
                  <Typewriter
                    words={HERO_ROTATORS}
                    className="fr-display-italic"
                    style={{ color: 'var(--purple-glow)' }}
                    caretColor="var(--purple-glow)"
                  />
                  <br />
                  <span>with one agent.</span>
                </h1>
              </Reveal>

              <Reveal delay={260}>
                <p className="mt-8 max-w-[560px] text-[17px] leading-[1.6]" style={{ color: 'var(--text-2)' }}>
                  SellSpark is the AI-first OS that builds, optimizes, and scales your storefront across every platform.
                  Quantum-safe. Agent-native. Ships in{' '}
                  <span className="fr-mono" style={{ color: 'var(--ivory)' }}>47 seconds</span>.
                </p>
              </Reveal>

              <Reveal delay={340}>
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Magnetic strength={14}>
                    <Link href="/onboarding" className="fr-btn text-[14px]" style={{ padding: '14px 26px', fontWeight: 600 }}>
                      Launch your store →
                    </Link>
                  </Magnetic>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 text-[14px] px-5 py-3.5 rounded-md transition-all"
                    style={{ color: 'var(--text-2)', border: '1px solid var(--border-sm)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-sm)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon name="stack" size={15} /> Browse marketplace
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={440}>
                <div className="mt-12 flex items-center gap-5 text-[12px]" style={{ color: 'var(--text-4)' }}>
                  <span className="fr-mono">SOC 2 TYPE II</span>
                  <span>·</span>
                  <span className="fr-mono">ISO 27001</span>
                  <span>·</span>
                  <span className="fr-mono">PQ-READY</span>
                  <span>·</span>
                  <span className="fr-mono">GDPR</span>
                </div>
              </Reveal>
            </div>

            {/* Right stat block */}
            <Reveal delay={300} y={40}>
              <Tilt max={5}>
                <div
                  className="rounded-2xl p-8 relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(21,17,42,0.75), rgba(13,13,23,0.75))',
                    border: '1px solid var(--border-sm)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 80px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="fr-eyebrow" style={{ color: 'var(--purple-glow)' }}>Live metrics · now</div>
                    <span className="w-2 h-2 rounded-full fr-pulse-ring"
                      style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                  </div>
                  <div className="space-y-6">
                    {STATS.map((s, i) => (
                      <div key={s.label} className="flex items-end justify-between pb-5"
                        style={{ borderBottom: i < STATS.length - 1 ? '1px solid var(--border-xs)' : 'none' }}>
                        <div>
                          <div className="fr-display text-[52px] leading-none" style={{ color: 'var(--ivory)' }}>
                            <Counter
                              to={s.to}
                              prefix={s.prefix}
                              suffix={s.suffix}
                              decimals={s.decimals || 0}
                            />
                          </div>
                          <div className="fr-mono text-[11px] uppercase tracking-widest mt-2" style={{ color: 'var(--text-3)' }}>
                            {s.label}
                          </div>
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid var(--border-sm)', color: 'var(--purple-glow)' }}
                        >
                          <Icon name={(['chart', 'box', 'shield', 'rocket'] as IconName[])[i]} size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute -top-3 -right-3 fr-mono text-[10px] px-2 py-1 rounded"
                    style={{ background: 'var(--purple)', color: '#fff', letterSpacing: '0.12em', boxShadow: 'var(--glow-sm)' }}>
                    LIVE
                  </div>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── LOGO MARQUEE ──────────────────────────────────────────────── */}
      <section className="py-12 border-y" style={{ borderColor: 'var(--border-xs)' }}>
        <div className="max-w-[1320px] mx-auto px-6">
          <Reveal>
            <div className="fr-eyebrow text-center mb-8" style={{ color: 'var(--text-3)' }}>
              Powered by · trusted with
            </div>
          </Reveal>
          <Marquee
            speed={42}
            items={MARQUEE_LOGOS.map((l) => (
              <span key={l} className="fr-mono text-[13px] tracking-[0.22em]" style={{ color: 'var(--text-3)' }}>
                {l}
              </span>
            ))}
          />
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 mb-16 items-end">
            <Reveal>
              <div>
                <div className="fr-eyebrow mb-4" style={{ color: 'var(--purple-glow)' }}>What it does</div>
                <h2 className="fr-display text-[52px] md:text-[72px] leading-[0.95] tracking-[-0.02em]"
                  style={{ color: 'var(--ivory)' }}>
                  Six primitives.<br />
                  <span className="fr-display-italic fr-gradient-animated">One empire.</span>
                </h2>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-[17px] leading-[1.7] md:max-w-[520px] md:justify-self-end"
                style={{ color: 'var(--text-2)' }}>
                No more stitching Stripe, Shopify, ConvertKit, Notion, and five AI wrappers together.
                Every primitive a creator needs, designed to work as one fabric — from first draft
                to seven-figure operator.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.no} delay={i * 80} y={28}>
                <Tilt max={6}>
                  <div
                    className="group relative rounded-xl p-6 transition-colors cursor-pointer"
                    style={{
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border-xs)',
                      minHeight: 240,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--border-md)';
                      e.currentTarget.style.background = 'var(--surface-2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-xs)';
                      e.currentTarget.style.background = 'var(--surface-1)';
                    }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-[8deg]"
                        style={{
                          background: 'rgba(124,58,237,0.12)',
                          border: '1px solid var(--border-sm)',
                          color: 'var(--purple-glow)',
                        }}
                      >
                        <Icon name={f.icon} size={20} />
                      </div>
                      <span className="fr-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
                        {f.no} / 06
                      </span>
                    </div>
                    <div className="fr-mono text-[10px] mb-2 uppercase tracking-widest"
                      style={{ color: 'var(--purple-glow)' }}>
                      {f.tag}
                    </div>
                    <h3 className="fr-display text-[26px] leading-[1.1] mb-3" style={{ color: 'var(--ivory)' }}>
                      {f.title}
                    </h3>
                    <p className="text-[14px] leading-[1.6]" style={{ color: 'var(--text-3)' }}>
                      {f.desc}
                    </p>
                    <div
                      className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'linear-gradient(to right, transparent, var(--purple), transparent)' }}
                    />
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AGENT SHOWCASE ────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <div className="fr-eyebrow mb-4" style={{ color: 'var(--purple-glow)' }}>Agent Hub</div>
                <h2 className="fr-display text-[52px] md:text-[68px] leading-[0.95] tracking-[-0.02em] mb-6"
                  style={{ color: 'var(--ivory)' }}>
                  Your team of{' '}
                  <span className="fr-display-italic fr-gradient-animated">24 specialists</span>,
                  hired in one click.
                </h2>
                <p className="text-[16px] leading-[1.7] mb-8 max-w-[540px]" style={{ color: 'var(--text-2)' }}>
                  Pricing strategist. Copy editor. Support triage. Email curator. Cohort analyst.
                  Every role you would pay $2k/mo for — running 24/7 in your stack, trained on
                  your data, paid once.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-[480px]">
                  {[
                    { n: 'arm',   t: 'Research agent', d: 'Deep web + your data' },
                    { n: 'pen',   t: 'Copy agent',     d: 'Brand-locked writer' },
                    { n: 'chart', t: 'Analyst agent',  d: 'Cohort + LTV modeling' },
                    { n: 'radar', t: 'Signal agent',   d: 'Market + churn scout' },
                  ].map((a, i) => (
                    <Reveal key={a.t} delay={i * 90}>
                      <div className="flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--border-xs)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-xs)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                      >
                        <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--purple-glow)' }}>
                          <Icon name={a.n as IconName} size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium" style={{ color: 'var(--text-1)' }}>{a.t}</div>
                          <div className="fr-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{a.d}</div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={180} y={40}>
              <Tilt max={5}>
                <div
                  className="rounded-2xl p-6 relative"
                  style={{
                    background: '#0a0a14',
                    border: '1px solid var(--border-sm)',
                    boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.15)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                    <span className="fr-mono text-[11px] ml-3" style={{ color: 'var(--text-3)' }}>
                      sellspark · agent:analyst
                    </span>
                  </div>
                  <TerminalStream
                    className="fr-mono text-[13px] space-y-2.5 leading-[1.7]"
                    lineDelay={360}
                    lines={[
                      { text: <><span style={{ color: '#4ade80' }}>$</span> <span style={{ color: 'var(--text-3)' }}>sellspark run analyst --query &quot;who should I email next?&quot;</span></> },
                      { text: '⋯ scanning 12,482 subscribers across 3 segments', color: 'var(--text-4)' },
                      { text: '⋯ modeling churn risk + LTV upside', color: 'var(--text-4)' },
                      { text: '→ 847 high-intent, low-recency contacts identified', color: 'var(--purple-glow)' },
                      { text: <>Top cohort: <span style={{ color: '#fbbf24' }}>buyers of &quot;Brand Kit v2&quot;</span> who last opened 18d ago.</>, color: 'var(--text-2)' },
                      { text: <>Recommend: relaunch at <span style={{ color: '#86efac' }}>$49 → $39</span>, send Tue 10:14 local.</>, color: 'var(--text-2)' },
                      { text: <>Projected revenue: <span style={{ color: '#86efac' }}>$8,420 ± $1,100</span>.</>, color: 'var(--text-2)' },
                      { text: <><span style={{ color: '#4ade80' }}>$</span> <span className="inline-block w-2 h-4 align-middle" style={{ background: '#4ade80', animation: 'fr-blink 1s steps(2) infinite' }} /></>, color: 'var(--text-3)' },
                    ]}
                  />
                  <div
                    className="absolute -bottom-4 -right-4 px-3 py-2 rounded-lg fr-mono text-[11px] fr-float"
                    style={{
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border-md)',
                      color: 'var(--purple-glow)',
                      boxShadow: 'var(--glow-sm)',
                    }}
                  >
                    1.2s to answer
                  </div>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── LIVE TICKER + DASHBOARD PREVIEW ──────────────────────────── */}
      <section className="py-8 border-y relative" style={{ borderColor: 'var(--border-xs)', background: 'rgba(13,13,23,0.4)' }}>
        <TickerStrip seed={TICKER_SEED} />
      </section>

      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30 fr-dot-grid"
          style={{ maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' }} />

        <div className="max-w-[1320px] mx-auto relative">
          <div className="grid md:grid-cols-[1fr_1.3fr] gap-10 mb-16 items-end">
            <Reveal>
              <div>
                <div className="fr-eyebrow mb-4" style={{ color: 'var(--purple-glow)' }}>Command Center</div>
                <h2 className="fr-display text-[52px] md:text-[72px] leading-[0.95] tracking-[-0.02em]"
                  style={{ color: 'var(--ivory)' }}>
                  Markets for<br />
                  <span className="fr-holo fr-display-italic">your business</span>.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-[17px] leading-[1.7] md:max-w-[520px] md:justify-self-end"
                style={{ color: 'var(--text-2)' }}>
                Every metric you&apos;d check on Coinbase Pro, built for creator revenue instead.
                Live MRR candles, cohort depth, conversion volatility, payout flow — all in one ink-black cockpit.
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} y={40}>
            <div className="fr-holo-border p-[1px] rounded-2xl">
              <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #0a0a14 0%, #06060b 100%)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}>

                {/* Top bar */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full fr-pulse-ring" style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                    <span className="fr-mono text-[11px] uppercase tracking-widest" style={{ color: '#4ade80' }}>LIVE · STREAMING</span>
                    <div className="w-px h-4" style={{ background: 'var(--border-sm)' }} />
                    <span className="fr-mono text-[11px]" style={{ color: 'var(--text-3)' }}>BINANCE-GRADE P&L</span>
                  </div>
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-xs)' }}>
                    {['1H', '24H', '7D', '30D', 'ALL'].map((r, i) => (
                      <button key={r}
                        className="px-2.5 py-1 rounded text-[11px] fr-mono transition-colors"
                        style={{
                          background: i === 2 ? 'rgba(124,58,237,0.2)' : 'transparent',
                          color: i === 2 ? 'var(--purple-glow)' : 'var(--text-3)',
                        }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
                  {/* Left: headline number + candle + sparks */}
                  <div>
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                      <div>
                        <div className="fr-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                          Revenue · 7D
                        </div>
                        <div className="fr-display text-[64px] md:text-[80px] leading-none" style={{ color: 'var(--ivory)' }}>
                          <Counter to={84240.18} prefix="$" decimals={2} duration={2000} />
                        </div>
                        <div className="mt-2 flex items-center gap-2 fr-mono text-[13px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                            style={{ background: 'rgba(34,197,94,0.14)', color: '#4ade80' }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2l4 6H1z" /></svg>
                            +24.8%
                          </span>
                          <span style={{ color: 'var(--text-3)' }}>vs prior 7d</span>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {[
                          { l: 'Orders', v: 1284, c: '#4ade80' },
                          { l: 'Conv',   v: 6.84, c: '#a78bfa', dec: 2, suf: '%' },
                          { l: 'AOV',    v: 68.40, c: '#fbbf24', dec: 2, pre: '$' },
                        ].map((k) => (
                          <div key={k.l}>
                            <div className="fr-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>{k.l}</div>
                            <div className="fr-display text-[24px] leading-none fr-tabular" style={{ color: k.c }}>
                              {(k.pre || '') + k.v.toFixed(k.dec || 0) + (k.suf || '')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Candle chart */}
                    <div className="rounded-lg p-4 relative overflow-hidden"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--border-xs)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="fr-mono text-[11px]" style={{ color: 'var(--text-3)' }}>MRR · 4H CANDLES</span>
                        <span className="fr-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
                          H: <span style={{ color: 'var(--ivory)' }}>$142.8</span>  L: <span style={{ color: 'var(--ivory)' }}>$88.1</span>
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <CandleMini bars={CANDLES} width={720} height={140} />
                      </div>
                      {/* axis fake */}
                      <div className="flex justify-between mt-2 fr-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
                      </div>
                    </div>

                    {/* Depth bars */}
                    <div className="grid md:grid-cols-2 gap-2 mt-4">
                      <div className="rounded-lg p-3" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-xs)' }}>
                        <div className="fr-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#4ade80' }}>BUY DEPTH · COHORTS</div>
                        <div className="space-y-1">
                          <DepthBar side="buy" pct={88} label="Design educators" value="$42,180" />
                          <DepthBar side="buy" pct={64} label="Indie devs"       value="$28,420" />
                          <DepthBar side="buy" pct={41} label="Agencies"         value="$18,640" />
                          <DepthBar side="buy" pct={22} label="Course creators"  value="$9,840" />
                        </div>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-xs)' }}>
                        <div className="fr-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#f87171' }}>CHURN RISK · 30D</div>
                        <div className="space-y-1">
                          <DepthBar side="sell" pct={14} label="Dormant · 60d+"     value="$2,108" />
                          <DepthBar side="sell" pct={28} label="No-repeat buyers"   value="$4,240" />
                          <DepthBar side="sell" pct={42} label="Trial unconverted"  value="$6,820" />
                          <DepthBar side="sell" pct={9}  label="Cancelled subs"     value="$1,410" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: rings + sparks */}
                  <div className="space-y-4">
                    <div className="rounded-lg p-5" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-xs)' }}>
                      <div className="fr-mono text-[11px] uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>Portfolio allocation</div>
                      <div className="grid grid-cols-3 gap-2">
                        <RadialRing pct={48} color="#a78bfa" label="Products" value="48%" />
                        <RadialRing pct={31} color="#4ade80" label="Subs"     value="31%" />
                        <RadialRing pct={21} color="#fbbf24" label="Agents"   value="21%" />
                      </div>
                    </div>

                    {[
                      { l: 'Conversion rate', v: 6.84, c: '#4ade80', suf: '%', delta: '+0.92' },
                      { l: 'LTV / CAC',       v: 4.20, c: '#a78bfa', suf: 'x', delta: '+0.31' },
                      { l: 'Payout · Q',      v: 18420, c: '#fbbf24', pre: '$', delta: '+$2.1k' },
                    ].map((r, i) => (
                      <div key={r.l} className="rounded-lg p-4 flex items-center justify-between"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--border-xs)' }}>
                        <div>
                          <div className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{r.l}</div>
                          <div className="fr-display text-[22px] leading-tight mt-0.5 fr-tabular" style={{ color: r.c }}>
                            {(r.pre || '') + r.v.toLocaleString() + (r.suf || '')}
                          </div>
                          <div className="fr-mono text-[10px] mt-0.5" style={{ color: '#4ade80' }}>▲ {r.delta}</div>
                        </div>
                        <Sparkline
                          data={SPARK.slice(i * 3)}
                          width={92}
                          height={36}
                          stroke={r.c}
                          fill="auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating "streaming" chip */}
                <div className="absolute top-6 right-6 hidden md:block">
                  <div className="fr-mono text-[10px] px-2 py-1 rounded fr-holo" style={{ letterSpacing: '0.12em', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(167,139,250,0.3)' }}>
                    QUANTUM-SAFE STREAM
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-[1320px] mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <div className="fr-eyebrow mb-4" style={{ color: 'var(--purple-glow)' }}>Pricing</div>
              <h2 className="fr-display text-[52px] md:text-[72px] leading-[0.95] tracking-[-0.02em]"
                style={{ color: 'var(--ivory)' }}>
                Pay after you <span className="fr-display-italic fr-gradient-animated">win</span>.
              </h2>
              <p className="mt-4 text-[16px]" style={{ color: 'var(--text-3)' }}>
                14-day free trial on every paid plan. No card to start.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {PRICING.map((p, i) => (
              <Reveal key={p.name} delay={i * 100} y={28}>
                <Tilt max={p.popular ? 6 : 4}>
                  <div
                    className="relative rounded-2xl p-8 h-full transition-shadow"
                    style={{
                      background: p.popular
                        ? 'linear-gradient(180deg, rgba(124,58,237,0.12), rgba(13,13,23,0.65))'
                        : 'var(--surface-1)',
                      border: p.popular ? '1px solid var(--border-md)' : '1px solid var(--border-xs)',
                      boxShadow: p.popular ? '0 30px 80px rgba(124,58,237,0.18)' : 'none',
                    }}
                  >
                    {p.popular && (
                      <div className="absolute -top-3 left-8 fr-mono text-[10px] px-2.5 py-1 rounded"
                        style={{ background: 'var(--purple)', color: '#fff', letterSpacing: '0.12em', boxShadow: 'var(--glow-sm)' }}>
                        MOST POPULAR
                      </div>
                    )}
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="fr-display text-[28px]" style={{ color: 'var(--ivory)' }}>{p.name}</div>
                      <div className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>
                        {p.note}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-[18px]" style={{ color: 'var(--text-3)' }}>$</span>
                      <span className="fr-display text-[64px] leading-none" style={{ color: 'var(--ivory)' }}>{p.price}</span>
                    </div>
                    <div className="fr-mono text-[12px] mb-6" style={{ color: 'var(--text-3)' }}>{p.period}</div>

                    {p.popular ? (
                      <Magnetic strength={10}>
                        <Link href={p.ctaHref} className="fr-btn w-full justify-center"
                          style={{ display: 'inline-flex', padding: '12px 20px', fontSize: 13, fontWeight: 600, width: '100%' }}>
                          {p.cta} →
                        </Link>
                      </Magnetic>
                    ) : (
                      <Link href={p.ctaHref}
                        className="w-full inline-flex justify-center items-center transition-all"
                        style={{
                          padding: '12px 20px',
                          fontSize: 13,
                          borderRadius: 10,
                          border: '1px solid var(--border-sm)',
                          color: 'var(--text-1)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-sm)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {p.cta} →
                      </Link>
                    )}

                    <ul className="mt-8 space-y-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: 'var(--text-2)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ color: 'var(--purple-glow)', marginTop: 2, flexShrink: 0 }}>
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-[1320px] mx-auto">
          <Reveal>
            <div className="fr-eyebrow mb-4" style={{ color: 'var(--purple-glow)' }}>Operators</div>
            <h2 className="fr-display text-[52px] md:text-[68px] leading-[0.95] tracking-[-0.02em] mb-16 max-w-[900px]"
              style={{ color: 'var(--ivory)' }}>
              Built by creators<br />
              <span className="fr-display-italic fr-gradient-animated">already winning</span> with it.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {QUOTES.map((q, i) => (
              <Reveal key={i} delay={i * 110} y={28}>
                <Tilt max={5}>
                  <figure
                    className="rounded-xl p-7 h-full transition-all"
                    style={{
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border-xs)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-xs)'; }}
                  >
                    <svg width="24" height="18" viewBox="0 0 24 18" fill="currentColor"
                      style={{ color: 'var(--purple-glow)', marginBottom: 16 }}>
                      <path d="M0 18V9c0-5 3-8 8-9l1 2c-3 1-5 3-5 6h5v10H0zm13 0V9c0-5 3-8 8-9l1 2c-3 1-5 3-5 6h5v10h-9z" />
                    </svg>
                    <blockquote className="fr-display text-[22px] leading-[1.3] mb-6" style={{ color: 'var(--ivory)' }}>
                      &ldquo;{q.q}&rdquo;
                    </blockquote>
                    <figcaption>
                      <div className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{q.a}</div>
                      <div className="fr-mono text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{q.r}</div>
                    </figcaption>
                  </figure>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(124,58,237,0.22), transparent 70%)' }} />
        <Reveal>
          <div className="relative max-w-[1100px] mx-auto text-center">
            <div className="fr-eyebrow mb-5" style={{ color: 'var(--purple-glow)' }}>Launch window · open</div>
            <h2 className="fr-display text-[64px] md:text-[120px] leading-[0.9] tracking-[-0.03em] mb-10"
              style={{ color: 'var(--ivory)' }}>
              Ship in <span className="fr-display-italic fr-gradient-animated">47 seconds</span>.<br />
              Scale for <span className="fr-display-italic" style={{ color: 'var(--purple-glow)' }}>years</span>.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic strength={18}>
                <Link href="/onboarding" className="fr-btn text-[14px]" style={{ padding: '16px 30px', fontWeight: 600 }}>
                  Start building →
                </Link>
              </Magnetic>
              <Link href="/pricing" className="text-[14px] px-5 py-4 rounded-md transition-all"
                style={{ color: 'var(--text-2)', border: '1px solid var(--border-sm)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-sm)'; e.currentTarget.style.background = 'transparent'; }}
              >
                See pricing
              </Link>
            </div>
            <div className="mt-12 fr-mono text-[11px] tracking-widest" style={{ color: 'var(--text-4)' }}>
              NO CARD · 14-DAY PRO TRIAL · CANCEL ANYTIME
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
