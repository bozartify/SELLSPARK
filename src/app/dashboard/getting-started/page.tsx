'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wizard, WizardStep } from '@/components/ui/wizard';
import { HowTo } from '@/components/ui/how-to';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const HERO_STATS = [
  { label: 'Creators onboarded', value: 24871, suffix: '+' },
  { label: 'Avg setup time',     value: 7,     suffix: ' min' },
  { label: 'Revenue unlocked',   value: 48,    prefix: '$', suffix: 'M' },
  { label: 'Quantum-ready',      value: 100,   suffix: '%' },
];

const HOW_TOS = [
  {
    title: 'Launch your first product in 5 minutes',
    description: 'Digital download, course, or booking — all from one form.',
    steps: [
      { icon: '1', title: 'Pick a product type',    time: '30s', tip: 'Start with a digital product — fastest to launch.', body: 'Choose Digital, Course, Membership, Booking, or AI Tool. Each template pre-fills the right fields.' },
      { icon: '2', title: 'Add your content',       time: '2m',  tip: 'Drag & drop uploads auto-encode for mobile.',         body: 'Upload files, write a description, pick a price. Markdown supported in the description field.' },
      { icon: '3', title: 'Set pricing & payouts',  time: '1m',  tip: 'Dynamic pricing adjusts to demand automatically.',    body: 'One-time, subscription, pay-what-you-want, or bundle. Connect Stripe or mobile money.' },
      { icon: '4', title: 'Publish & share link',   time: '30s',                                                              body: 'Toggle "Published", copy your storefront link, share anywhere. Built-in SEO + social previews.' },
    ],
  },
  {
    title: 'Connect your audience channels',
    description: 'Email, socials, and community in one funnel.',
    steps: [
      { icon: '📧', title: 'Connect email provider',    time: '1m',  body: 'ConvertKit, Mailchimp, Beehiiv, Klaviyo, or native SellSpark email — one-click OAuth.' },
      { icon: '📱', title: 'Link social accounts',      time: '2m',  tip: 'Schedule once, post to Twitter/LinkedIn/Instagram/TikTok.', body: 'Authorize each platform from Integrations Hub. We never post without your approval.' },
      { icon: '🤝', title: 'Enable affiliate program',  time: '1m',  body: 'Set commission %, approve affiliates, share signup link. Payouts auto-settle monthly.' },
      { icon: '💬', title: 'Open your community',        time: '30s', body: 'One-click Discord-style community gated by purchase, subscription, or NFT.' },
    ],
  },
  {
    title: 'Turn on AI agents & automations',
    description: 'Let the OS run growth while you sleep.',
    steps: [
      { icon: '🤖', title: 'Hire agents from Marketplace', time: '1m', tip: 'Start with "Copy Muse" and "Launch Strategist".', body: 'Browse the agent marketplace, review capabilities and tools, hire with one click.' },
      { icon: '🧠', title: 'Give them memory',             time: '2m', body: 'Drop in your brand voice doc, past launches, and audience persona. Agents retain context.' },
      { icon: '⚡', title: 'Wire automations',             time: '3m', body: 'Trigger → agent → action. Example: New subscriber → Copy Muse drafts welcome → You approve → Sends.' },
      { icon: '📊', title: 'Watch the thought chain',      time: '∞',  tip: 'Every agent action is auditable.',                 body: 'Open Agent Hub → Thoughts tab to see reasoning, tool calls, and results in real time.' },
    ],
  },
];

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'profile',
    icon: '👤',
    title: 'Tell us who you are',
    description: 'We tailor the dashboard to your creator niche.',
    content: (
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { icon: '🎓', label: 'Educator / Coach' },
          { icon: '🎨', label: 'Artist / Designer' },
          { icon: '💪', label: 'Fitness / Wellness' },
          { icon: '📝', label: 'Writer / Newsletter' },
          { icon: '🎙', label: 'Podcaster / Video' },
          { icon: '💼', label: 'Consultant / B2B' },
        ].map((p) => (
          <label
            key={p.label}
            className="fr-card fr-card-hover p-4 flex items-center gap-3 cursor-pointer animate-fade-in"
          >
            <input type="radio" name="niche" className="accent-[var(--purple)]" />
            <span className="text-xl">{p.icon}</span>
            <span style={{ color: 'var(--text-1)' }}>{p.label}</span>
          </label>
        ))}
      </div>
    ),
  },
  {
    id: 'goals',
    icon: '🎯',
    title: 'Pick your 90-day goals',
    description: 'We\'ll surface the right widgets and AI suggestions.',
    content: (
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          'Launch first digital product',
          'Grow email list to 1K',
          'Start a paid community',
          'Hit $10K MRR',
          'Publish 30 pieces of content',
          'Build an affiliate army',
        ].map((g) => (
          <label
            key={g}
            className="fr-card p-3 flex items-center gap-2 cursor-pointer text-sm"
            style={{ color: 'var(--text-2)' }}
          >
            <input type="checkbox" className="accent-[var(--purple)]" />
            {g}
          </label>
        ))}
      </div>
    ),
  },
  {
    id: 'stack',
    icon: '🔌',
    title: 'Connect your stack',
    description: 'Optional — you can do this later from Integrations Hub.',
    content: (
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {['Stripe', 'ConvertKit', 'Notion', 'Zapier', 'Slack', 'Discord', 'Shopify', 'YouTube', 'Twitter', 'TikTok'].map((t) => (
          <button
            key={t}
            className="fr-card fr-card-hover p-3 text-xs font-medium flex flex-col items-center gap-1 animate-pop-in"
            style={{ color: 'var(--text-2)' }}
          >
            <span className="text-lg">🔗</span>
            {t}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'agents',
    icon: '🤖',
    title: 'Hire your first AI agents',
    description: 'We\'ll kick off with two free for 14 days.',
    content: (
      <div className="space-y-3">
        {[
          { name: 'Copy Muse',         desc: 'Writes launches, emails, and product copy in your voice.',  tag: 'Recommended' },
          { name: 'Launch Strategist', desc: 'Plans 30-day go-to-market with channel mix and KPIs.',     tag: 'Free trial' },
          { name: 'Thumbnail Forge',   desc: 'Generates A/B-tested thumbnails that outperform baseline.',  tag: 'Optional' },
        ].map((a) => (
          <label
            key={a.name}
            className="fr-card p-4 flex items-start gap-3 cursor-pointer fr-tilt"
          >
            <input type="checkbox" defaultChecked={a.tag !== 'Optional'} className="mt-1 accent-[var(--purple)]" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{a.name}</span>
                <span className="fr-badge fr-badge-purple text-[10px]">{a.tag}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{a.desc}</p>
            </div>
          </label>
        ))}
      </div>
    ),
  },
  {
    id: 'ready',
    icon: '🚀',
    title: 'You\'re all set',
    description: 'Jump into your dashboard — or let us autopilot the first week.',
    content: (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: '⚡', title: 'Quick launch',  desc: 'Publish your first product now' },
            { icon: '🧠', title: 'AI autopilot',  desc: 'Let agents draft the first week' },
            { icon: '🎓', title: 'Watch tour',     desc: '3-min video walkthrough' },
          ].map((c, i) => (
            <div
              key={i}
              className="fr-card fr-card-hover p-4 text-center animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
            >
              <div className="text-3xl mb-2 animate-float" style={{ animationDelay: `${i * 300}ms` }}>{c.icon}</div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{c.title}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function GettingStartedPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[20px] p-8 fr-section-glow"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-sm)',
          boxShadow: 'var(--shadow-card), var(--glow-sm)',
        }}>
        <div className="absolute inset-0 fr-grid-bg opacity-60" />
        <div className="absolute -top-20 -right-20 w-80 h-80 fr-glow-orb animate-pulse-glow" />
        <div className="absolute top-10 right-32 w-3 h-3 rounded-full animate-orbit" style={{ background: 'var(--purple-glow)' }} />

        <div className="relative z-10 max-w-3xl">
          <div className="fr-badge fr-badge-purple mb-4">
            <span className="fr-pulse-dot" style={{ width: 6, height: 6 }} />
            Welcome to SellSpark OS
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: 'var(--text-1)' }}>
            Build your creator business{' '}
            <span className="fr-gradient-text-purple animate-gradient">in minutes</span>
            <span className="typewriter block text-xl sm:text-2xl font-semibold mt-3" style={{ color: 'var(--text-2)' }}>
              Quantum-secure · AI-native · Pan-African ready
            </span>
          </h1>
          <p className="mt-6 text-base leading-relaxed" style={{ color: 'var(--text-3)' }}>
            The all-in-one operating system for modern creators. Launch products, grow your audience,
            deploy AI agents, and accept payments in 40+ currencies — all from one dashboard.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="#wizard" className="fr-btn animate-pulse-glow">Start setup →</Link>
            <Link href="/dashboard" className="fr-btn-outline">Skip to dashboard</Link>
          </div>
        </div>
      </div>

      {/* ── Animated stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {HERO_STATS.map((s, i) => (
          <div key={i} className="fr-card fr-tilt p-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: 'var(--grad-brand)' }} />
            <div className="absolute -top-10 -right-10 w-20 h-20 fr-glow-orb opacity-40" />
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>
              {s.label}
            </p>
            <p className="fr-stat-num mt-2">
              <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
          </div>
        ))}
      </div>

      {/* ── Wizard ──────────────────────────────────────────── */}
      <div id="wizard" className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="fr-pulse-dot" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>
              Setup wizard
            </h2>
            <span className="fr-badge fr-badge-purple ml-auto">5 steps · ~4 min</span>
          </div>
          {completed ? (
            <div className="fr-card p-8 text-center animate-pop-in">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl animate-pulse-glow"
                style={{ background: 'var(--grad-brand)' }}>✓</div>
              <h3 className="text-2xl font-bold mt-4" style={{ color: 'var(--text-1)' }}>You're live!</h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-3)' }}>
                Your creator OS is configured. Jump into the dashboard to launch your first product.
              </p>
              <Link href="/dashboard" className="fr-btn inline-block mt-5">Go to dashboard →</Link>
            </div>
          ) : (
            <Wizard steps={WIZARD_STEPS} onComplete={() => setCompleted(true)} completeLabel="Launch my OS 🚀" />
          )}
        </div>

        {/* Side: live checklist */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg animate-bounce-subtle">🏁</span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Week-one checklist</h2>
          </div>
          {[
            { done: true,  label: 'Create account',              detail: 'Just now' },
            { done: true,  label: 'Verify email',                detail: '2 min ago' },
            { done: false, label: 'Run setup wizard',            detail: 'In progress', active: true },
            { done: false, label: 'Publish first product',       detail: '~5 min' },
            { done: false, label: 'Connect email provider',      detail: '~1 min' },
            { done: false, label: 'Hire your first AI agent',    detail: '~2 min' },
            { done: false, label: 'Invite first 10 subscribers', detail: '~3 min' },
            { done: false, label: 'Run a launch campaign',       detail: '~30 min' },
          ].map((t, i) => (
            <div
              key={i}
              className="fr-card p-3 flex items-center gap-3 animate-slide-in-right"
              style={{
                animationDelay: `${i * 70}ms`,
                opacity: 0,
                borderColor: t.active ? 'var(--purple)' : undefined,
                boxShadow: t.active ? 'var(--glow-sm)' : undefined,
              }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: t.done ? 'rgba(34,197,94,0.15)' : t.active ? 'var(--grad-brand)' : 'var(--surface-3)',
                  color: t.done ? '#4ade80' : t.active ? '#fff' : 'var(--text-3)',
                  border: `1px solid ${t.done ? 'rgba(34,197,94,0.35)' : t.active ? 'var(--purple)' : 'var(--border-xs)'}`,
                }}
              >
                {t.done ? '✓' : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: t.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: t.done ? 'line-through' : undefined }}>
                  {t.label}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>{t.detail}</p>
              </div>
              {t.active && <span className="fr-pulse-dot shrink-0" style={{ width: 8, height: 8 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── How-to guides ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📘</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Playbooks</h2>
          <span className="fr-badge fr-badge-white ml-auto">3 guides</span>
        </div>
        <div className="grid lg:grid-cols-3 gap-5 stagger-children">
          {HOW_TOS.map((h, i) => (
            <HowTo key={i} title={h.title} description={h.description} steps={h.steps} defaultOpen={i === 0 ? 0 : -1} />
          ))}
        </div>
      </div>

      {/* ── Quick links ─────────────────────────────────────── */}
      <div className="fr-card p-6 relative overflow-hidden">
        <div className="absolute -bottom-16 -left-16 w-48 h-48 fr-glow-orb opacity-40 animate-float" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-1)' }}>Next, explore →</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🤖', label: 'Agent Hub',        href: '/dashboard/agent-hub' },
              { icon: '✨', label: 'Creator Studio',   href: '/dashboard/creator-studio' },
              { icon: '📊', label: 'Analytics Pro',    href: '/dashboard/analytics-pro' },
              { icon: '🌍', label: 'Africa Hub',       href: '/dashboard/africa-hub' },
              { icon: '⚛️', label: 'Quantum Security', href: '/dashboard/quantum-security' },
              { icon: '💸', label: 'Monetization',     href: '/dashboard/monetization' },
              { icon: '⚖️', label: 'IP Portfolio',     href: '/dashboard/ip-portfolio' },
              { icon: '🔮', label: 'Future Tech',      href: '/dashboard/future-tech' },
            ].map((q, i) => (
              <Link
                key={q.href}
                href={q.href}
                className="fr-card fr-card-hover fr-tilt p-4 flex flex-col items-center text-center animate-pop-in"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <div className="text-2xl mb-2">{q.icon}</div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{q.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Floating quick-help FAB */}
      <Link href="#wizard" className="fr-fab" title="Jump to setup">
        <span>✨</span>
      </Link>
    </div>
  );
}
