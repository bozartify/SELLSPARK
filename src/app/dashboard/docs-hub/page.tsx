'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CodeBlock } from '@/components/ui/code-block';

/* ═══════════════════════════════════════════════════════════════════
   Snippet library
   ═══════════════════════════════════════════════════════════════════ */

const SNIPPETS: Record<string, { lang: 'ts' | 'tsx' | 'bash' | 'json'; title: string; code: string }> = {
  init: {
    lang: 'bash',
    title: 'terminal',
    code: `# Install the SellSpark SDK
npm install @sellspark/sdk

# Or with pnpm
pnpm add @sellspark/sdk

# Authenticate with your API key
export SELLSPARK_KEY="sk_live_•••••••••"`,
  },
  quickstart: {
    lang: 'ts',
    title: 'quickstart.ts',
    code: `import { SellSpark } from '@sellspark/sdk';

// Initialize with your API key — quantum-safe transport by default
const spark = new SellSpark({
  apiKey: process.env.SELLSPARK_KEY,
  region: 'eu-central-1',
  // Post-quantum TLS (CRYSTALS-Kyber) enabled automatically
});

// Create a product in one call
const product = await spark.products.create({
  name: '12-Week Transformation',
  type: 'course',
  price: 9700, // cents
  currency: 'USD',
  published: true,
});

console.log(\`Product live → \${product.storefrontUrl}\`);`,
  },
  webhook: {
    lang: 'tsx',
    title: 'app/api/webhook/route.ts',
    code: `import { verifyWebhook } from '@sellspark/sdk';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('x-sellspark-signature')!;
  const body = await req.text();

  // Verifies dilithium signature (post-quantum, NIST-approved)
  const event = verifyWebhook(body, sig, process.env.WEBHOOK_SECRET!);

  switch (event.type) {
    case 'order.paid':
      await fulfillOrder(event.data);
      break;
    case 'subscription.created':
      await welcomeMember(event.data.customer);
      break;
    default:
      console.log('Unhandled event', event.type);
  }

  return Response.json({ received: true });
}`,
  },
  agent: {
    lang: 'ts',
    title: 'agents/launch-strategist.ts',
    code: `import { Agent, tool } from '@sellspark/agents';

// Define tools the agent can call
const emailTool = tool({
  name: 'send_email',
  schema: { to: 'string', subject: 'string', body: 'string' },
  run: async ({ to, subject, body }) => spark.email.send({ to, subject, body }),
});

// Compose an agent with memory + tools
export const launchStrategist = new Agent({
  name: 'Launch Strategist',
  model: 'claude-opus-4.7',
  memory: 'brand-voice.md',
  tools: [emailTool, calendarTool, analyticsReadTool],
  system: \`You plan 30-day launches. Maximise revenue without brand dilution.\`,
});

// Run with a goal
const plan = await launchStrategist.run({
  goal: 'Sell 500 units of 12-Week Plan in 30 days',
  budget: 2500,
});`,
  },
  response: {
    lang: 'json',
    title: 'response.json',
    code: `{
  "id": "prod_Nq7x3fP9bT",
  "object": "product",
  "name": "12-Week Transformation",
  "type": "course",
  "price": 9700,
  "currency": "USD",
  "published": true,
  "storefrontUrl": "https://spark.store/creator/12w",
  "quantum": {
    "signed": true,
    "algorithm": "CRYSTALS-Dilithium5",
    "attestationHash": "0x7c3aed...aEd9"
  },
  "created": 1745510400,
  "region": "eu-central-1"
}`,
  },
};

/* ═══════════════════════════════════════════════════════════════════
   Integration logos — pure inline SVG (no external deps)
   ═══════════════════════════════════════════════════════════════════ */

function Logo({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24' } as const;
  switch (name) {
    case 'Stripe':
      return <svg {...common} fill="#635bff"><path d="M13.5 9.3c0-.6.5-.9 1.3-.9 1.2 0 2.7.4 3.9 1V5.7c-1.3-.5-2.6-.7-3.9-.7C11.5 5 9 6.7 9 9.5c0 4.3 5.9 3.6 5.9 5.5 0 .7-.6 1-1.5 1-1.3 0-3-.5-4.3-1.3v3.8c1.5.6 3 .9 4.3.9 3.3 0 5.9-1.6 5.9-4.5 0-4.6-6-3.8-6-5.6z"/></svg>;
    case 'Vercel':
      return <svg {...common} fill="#fff"><path d="M12 2l11 19H1z"/></svg>;
    case 'Supabase':
      return <svg {...common} fill="#3ecf8e"><path d="M13 2L3 14h8v8l10-12h-8z"/></svg>;
    case 'OpenAI':
      return <svg {...common} fill="#10a37f"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.5 11.8l-4 2.3a1 1 0 01-1 0l-4-2.3a1 1 0 01-.5-.9V8.2a1 1 0 01.5-.9l4-2.3a1 1 0 011 0l4 2.3a1 1 0 01.5.9v4.7a1 1 0 01-.5.9z"/></svg>;
    case 'Anthropic':
      return <svg {...common} fill="#d97706"><path d="M7 4h4l6 16h-4l-1.3-3.5H8.3L7 20H3zm1.8 9.5h4l-2-5.5z"/></svg>;
    case 'Notion':
      return <svg {...common} fill="#fff" stroke="#000" strokeWidth="0.5"><path d="M4 4h3l10 .5v15l-3 .5-10-.5zm2 2v12l8 .3V6.3z"/></svg>;
    case 'Slack':
      return <svg {...common} fill="#4a154b"><circle cx="7" cy="10" r="2"/><circle cx="14" cy="7" r="2"/><circle cx="17" cy="14" r="2"/><circle cx="10" cy="17" r="2"/><rect x="6" y="11" width="12" height="2" rx="1" fill="#ecb22e"/><rect x="11" y="6" width="2" height="12" rx="1" fill="#e01e5a"/></svg>;
    case 'Discord':
      return <svg {...common} fill="#5865f2"><path d="M20 5a17 17 0 00-4-1l-.2.4a15 15 0 00-7.6 0L8 4a17 17 0 00-4 1c-3 5-3.7 9.7-3.3 14.4A17 17 0 006 21l1-1.4a10 10 0 01-2-1l.5-.4a12 12 0 0011 0l.5.4a10 10 0 01-2 1l1 1.4a17 17 0 005-1.6c.7-5.4-.3-10-3.8-14.4zM8.5 15a2 2 0 110-4 2 2 0 010 4zm7 0a2 2 0 110-4 2 2 0 010 4z"/></svg>;
    case 'GitHub':
      return <svg {...common} fill="#fff"><path d="M12 2a10 10 0 00-3 19.5c.5 0 .7-.2.7-.5v-2c-3 .6-3.5-1.3-3.5-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7 0-.7 0-.7 1 0 1.6 1 1.6 1 1 1.6 2.5 1.2 3 1 .1-.8.4-1.3.7-1.6-2.2-.3-4.5-1.2-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a10 10 0 015 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.5 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10 10 0 0012 2z"/></svg>;
    case 'Zapier':
      return <svg {...common} fill="#ff4a00"><path d="M12 2v5l3.5-3.5.7.7L12.7 7.8H18v1h-5.3l3.5 3.5-.7.7L12 9.5v5h-1v-5l-3.5 3.5-.7-.7 3.5-3.5H5v-1h5.3L6.8 4.2l.7-.7L11 7V2z" transform="rotate(0 12 12)"/></svg>;
    case 'Shopify':
      return <svg {...common} fill="#95bf47"><path d="M15 4c-1-1-2-2-4-2-3 0-5 3-6 6-1 0-2 1-2 1l-2 11 14 2 4-14s-2-3-4-4zm-3 0c1 0 2 1 3 2l-1 1c-1-1-2-1-3-1 0-1 0-2 1-2zm-2 3l1 1c-1 0-2 1-2 2l-1-1c0-1 1-2 2-2z"/></svg>;
    case 'PostgreSQL':
      return <svg {...common} fill="#336791"><path d="M12 2a10 10 0 00-1 20c.3 0 .4-.2.4-.4l-.1-1.4c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-1-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2-.2-4.2-1-4.2-4.5 0-1 .4-1.8 1-2.4-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9 9 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.6 1 1.4 1 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.9.6 1.8v2.7c0 .3.1.5.4.4A10 10 0 0012 2z"/></svg>;
    default:
      return <span>{name[0]}</span>;
  }
}

const INTEGRATIONS = [
  { name: 'Stripe',     cat: 'Payments',  color: '#635bff' },
  { name: 'Vercel',     cat: 'Hosting',   color: '#ffffff' },
  { name: 'Supabase',   cat: 'Database',  color: '#3ecf8e' },
  { name: 'OpenAI',     cat: 'AI',        color: '#10a37f' },
  { name: 'Anthropic',  cat: 'AI',        color: '#d97706' },
  { name: 'Notion',     cat: 'Content',   color: '#ffffff' },
  { name: 'Slack',      cat: 'Comms',     color: '#4a154b' },
  { name: 'Discord',    cat: 'Community', color: '#5865f2' },
  { name: 'GitHub',     cat: 'Dev',       color: '#ffffff' },
  { name: 'Zapier',     cat: 'Automate',  color: '#ff4a00' },
  { name: 'Shopify',    cat: 'Commerce',  color: '#95bf47' },
  { name: 'PostgreSQL', cat: 'Database',  color: '#336791' },
];

/* ═══════════════════════════════════════════════════════════════════
   Comparison matrix
   ═══════════════════════════════════════════════════════════════════ */

const COMPARE_ROWS = [
  { feat: 'Digital products',           ours: '∞',                   gumroad: '∞',           stan: '∞',         lemon: '∞' },
  { feat: 'Courses & memberships',      ours: true,                  gumroad: true,          stan: true,         lemon: true },
  { feat: 'AI agent marketplace',       ours: true,                  gumroad: false,         stan: false,        lemon: false },
  { feat: 'Post-quantum crypto',        ours: true,                  gumroad: false,         stan: false,        lemon: false },
  { feat: 'Mobile money (M-Pesa, MTN)', ours: true,                  gumroad: false,         stan: false,        lemon: false },
  { feat: 'On-chain attestations',       ours: true,                  gumroad: false,         stan: false,        lemon: false },
  { feat: 'Open-source SDK',             ours: true,                  gumroad: false,         stan: false,        lemon: true },
  { feat: 'Transaction fee',             ours: '0% + Stripe',         gumroad: '10%',         stan: '5% + Stripe', lemon: '5% + Stripe' },
  { feat: 'Payout currencies',           ours: '40+',                 gumroad: '20',          stan: '1',          lemon: '10' },
  { feat: 'Uptime SLA',                  ours: '99.99%',              gumroad: '99.9%',       stan: '99.5%',      lemon: '99.9%' },
];

function CheckCell({ v }: { v: boolean | string }) {
  if (v === true) return (
    <span className="inline-flex w-6 h-6 rounded-lg items-center justify-center font-bold"
      style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' }}>✓</span>
  );
  if (v === false) return (
    <span className="inline-flex w-6 h-6 rounded-lg items-center justify-center font-bold opacity-50"
      style={{ background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.35)' }}>—</span>
  );
  return <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{v}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════ */

export default function DocsHubPage() {
  const [tab, setTab] = useState<keyof typeof SNIPPETS>('init');
  const s = SNIPPETS[tab];

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px]">
      {/* ═══ HERO ═══ */}
      <div
        className="relative overflow-hidden rounded-[24px] p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(11,8,23,0.95))',
          backdropFilter: 'blur(28px)',
          border: '1px solid var(--border-sm)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), var(--glow-sm)',
        }}
      >
        <div className="absolute inset-0 fr-grid-bg opacity-40" />
        <div className="absolute -top-32 -right-24 w-96 h-96 fr-glow-orb animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-1.5 h-1.5 rounded-full animate-orbit" style={{ background: '#c084fc' }} />

        <div className="relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="fr-badge fr-badge-purple"><span className="fr-pulse-dot" style={{ width: 6, height: 6 }} />Developers</span>
              <span className="fr-badge fr-badge-green">v3.2 · stable</span>
              <span className="fr-badge fr-badge-blue">OpenAPI 3.1</span>
              <span className="fr-badge fr-badge-amber">TypeScript-first</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: 'var(--text-1)' }}>
              Build on <span className="fr-gradient-text-purple animate-gradient">SellSpark</span>
              <span className="block text-xl sm:text-2xl font-semibold mt-3" style={{ color: 'var(--text-2)' }}>
                <span className="typewriter">SDKs · webhooks · agents · attestations</span>
              </span>
            </h1>
            <p className="mt-5 text-base leading-relaxed max-w-xl" style={{ color: 'var(--text-3)' }}>
              One API, seven languages, and a post-quantum transport layer. Ship integrations in hours, not quarters.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="#quickstart" className="fr-btn animate-pulse-glow">📘 Read the docs</Link>
              <a href="https://github.com/sellspark/sdk" className="fr-btn-outline">⌨ View SDK on GitHub ↗</a>
            </div>
          </div>

          {/* Mini code card */}
          <div className="hidden lg:block">
            <CodeBlock
              lang="bash"
              title="~/dev"
              code={`# 30-second quickstart
npx create-sellspark-app my-store
cd my-store && npm run dev

✓ Dashboard  → http://localhost:3000
✓ Storefront → http://localhost:3001
✓ Webhooks   → http://localhost:3002`}
            />
          </div>
        </div>
      </div>

      {/* ═══ CODE SNIPPET PREVIEWS ═══ */}
      <div id="quickstart">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-lg">⌨</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Code snippets</h2>
          <span className="fr-badge fr-badge-purple">Copy-ready</span>

          <div className="ml-auto flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-xs)' }}>
            {(['init', 'quickstart', 'webhook', 'agent', 'response'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize"
                style={{
                  background: tab === k ? 'var(--grad-brand)' : 'transparent',
                  color: tab === k ? '#fff' : 'var(--text-3)',
                  boxShadow: tab === k ? 'var(--glow-sm)' : 'none',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div key={tab} className="animate-scale-in">
          <CodeBlock
            code={s.code}
            lang={s.lang}
            title={s.title}
            badge={<span className="fr-badge fr-badge-purple text-[9px]">● secure</span>}
          />
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-4">
          {[
            { l: 'TypeScript', c: '#3178c6' },
            { l: 'Python',      c: '#3776ab' },
            { l: 'Go',          c: '#00add8' },
            { l: 'Ruby',        c: '#cc342d' },
            { l: 'Rust',        c: '#ce422b' },
            { l: 'PHP',         c: '#777bb4' },
            { l: 'Java',        c: '#f89820' },
          ].map((l) => (
            <div
              key={l.l}
              className="rounded-lg p-3 text-center text-xs font-mono font-semibold transition-all hover:scale-105 cursor-pointer"
              style={{
                background: 'rgba(21,17,42,0.55)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${l.c}33`,
                color: l.c,
                boxShadow: `0 0 12px ${l.c}22`,
              }}
            >
              {l.l}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FEATURE COMPARISON ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg">⚖️</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Feature comparison</h2>
          <span className="fr-badge fr-badge-green ml-auto">Verified Q2 2026</span>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(21,17,42,0.55)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--border-sm)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-sm)' }}>
                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Feature</th>
                  <th className="px-5 py-4 text-center relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'var(--grad-brand)', boxShadow: 'var(--glow-sm)' }} />
                    <div className="flex flex-col items-center gap-1">
                      <span className="fr-gradient-text-purple font-black">SellSpark</span>
                      <span className="fr-badge fr-badge-purple text-[9px]">RECOMMENDED</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-3)' }}>Gumroad</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-3)' }}>Stan</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold" style={{ color: 'var(--text-3)' }}>Lemon</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r, i) => (
                  <tr
                    key={r.feat}
                    className="animate-fade-in"
                    style={{ borderBottom: '1px solid var(--border-xs)', animationDelay: `${i * 40}ms`, opacity: 0 }}
                  >
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-1)' }}>{r.feat}</td>
                    <td className="px-5 py-3 text-center" style={{ background: 'rgba(124,58,237,0.05)' }}>
                      <CheckCell v={r.ours} />
                    </td>
                    <td className="px-5 py-3 text-center"><CheckCell v={r.gumroad} /></td>
                    <td className="px-5 py-3 text-center"><CheckCell v={r.stan} /></td>
                    <td className="px-5 py-3 text-center"><CheckCell v={r.lemon} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ INTEGRATIONS ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg">🔌</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Native integrations</h2>
          <span className="fr-badge fr-badge-white ml-auto">12 featured · 140+ total</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
          {INTEGRATIONS.map((int) => (
            <div
              key={int.name}
              className="group relative overflow-hidden rounded-xl p-4 flex flex-col items-center gap-2 transition-all cursor-pointer fr-tilt"
              style={{
                background: 'rgba(21,17,42,0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-xs)',
              }}
            >
              <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: int.color }}
              />
              <div
                className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: `${int.color}18`,
                  border: `1px solid ${int.color}33`,
                  boxShadow: `0 0 12px ${int.color}22`,
                }}
              >
                <Logo name={int.name} />
              </div>
              <p className="relative z-10 text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{int.name}</p>
              <p className="relative z-10 text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>{int.cat}</p>
              <span className="relative z-10 fr-badge fr-badge-green text-[9px]">● Connected</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ API STATUS / TRUST BAR ═══ */}
      <div
        className="rounded-2xl p-5 flex items-center flex-wrap gap-6"
        style={{ background: 'rgba(21,17,42,0.55)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-sm)' }}
      >
        {[
          { l: 'API status',      v: 'Operational', c: '#22c55e', dot: true },
          { l: 'Avg response',    v: '47ms p95',    c: '#60a5fa' },
          { l: 'Throughput',      v: '12.4K rps',   c: '#a78bfa' },
          { l: 'Regions',         v: '14 active',   c: '#f59e0b' },
          { l: 'Rate limit',      v: '10K / min',   c: '#c084fc' },
        ].map((x, i) => (
          <div key={i} className="flex items-center gap-3">
            {x.dot && <span className="fr-pulse-dot" style={{ background: x.c }} />}
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>{x.l}</p>
              <p className="text-sm font-mono font-bold" style={{ color: x.c }}>{x.v}</p>
            </div>
            {i < 4 && <div className="hidden sm:block w-px h-8 ml-6" style={{ background: 'var(--border-xs)' }} />}
          </div>
        ))}
      </div>

      {/* ═══ DOCUMENTATION LINKS ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg">📚</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Documentation</h2>
          <span className="fr-badge fr-badge-purple ml-auto">Always up to date</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🚀', title: 'Getting started',       desc: '5-min quickstart for your first product',     href: '/docs/quickstart',  tag: 'Beginner',     color: '#22c55e' },
            { icon: '🔑', title: 'Authentication',        desc: 'API keys, OAuth, and passwordless flows',      href: '/docs/auth',        tag: 'Core',         color: '#7c3aed' },
            { icon: '📦', title: 'Products API',          desc: 'Create, update, and publish products',         href: '/docs/products',    tag: 'API',          color: '#60a5fa' },
            { icon: '🔔', title: 'Webhooks',              desc: 'Event types, retries, PQ signature verify',    href: '/docs/webhooks',    tag: 'API',          color: '#60a5fa' },
            { icon: '🤖', title: 'Agents SDK',            desc: 'Hire agents, tools, memory, thought chains',   href: '/docs/agents',      tag: 'AI',           color: '#ec4899' },
            { icon: '⚛️', title: 'Quantum cryptography',  desc: 'Kyber, Dilithium, and attestation flow',       href: '/docs/quantum',     tag: 'Security',     color: '#a78bfa' },
            { icon: '🌍', title: 'Mobile money',          desc: 'M-Pesa, MTN, Airtel, and USSD integration',    href: '/docs/mobile-money',tag: 'Payments',     color: '#f59e0b' },
            { icon: '📊', title: 'Analytics events',      desc: 'Track, query, and export customer journeys',   href: '/docs/analytics',   tag: 'Data',         color: '#c084fc' },
            { icon: '📡', title: 'Reference (OpenAPI)',   desc: 'Auto-generated API reference + Postman',       href: '/docs/openapi',     tag: 'Reference',    color: '#22c55e' },
          ].map((d, i) => (
            <Link
              key={d.title}
              href={d.href}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all animate-slide-up"
              style={{
                background: 'rgba(21,17,42,0.55)',
                backdropFilter: 'blur(24px)',
                border: '1px solid var(--border-sm)',
                animationDelay: `${i * 50}ms`,
                opacity: 0,
              }}
            >
              <div
                className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl"
                style={{ background: d.color }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: `${d.color}22`,
                      border: `1px solid ${d.color}44`,
                      boxShadow: `0 0 16px ${d.color}33`,
                    }}
                  >
                    {d.icon}
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `${d.color}15`,
                      color: d.color,
                      border: `1px solid ${d.color}44`,
                    }}
                  >
                    {d.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>{d.title}</h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>{d.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2" style={{ color: d.color }}>
                  Read docs <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ RESOURCES FOOTER ═══ */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(11,8,23,0.85))',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-md)',
        }}
      >
        <div className="absolute -bottom-20 -right-20 w-60 h-60 fr-glow-orb opacity-40 animate-float" />
        <div className="relative z-10 grid md:grid-cols-4 gap-5">
          {[
            { h: 'Community',  items: [['Discord',          '/community/discord'], ['GitHub',    '/github'],  ['Changelog',   '/changelog']] },
            { h: 'Resources',  items: [['Blog',             '/blog'],              ['Guides',    '/guides'],  ['Templates',   '/templates']] },
            { h: 'Support',    items: [['Help center',      '/help'],              ['Contact',   '/support'], ['Status page', '/status']] },
            { h: 'Legal',      items: [['Terms',            '/terms'],             ['Privacy',   '/privacy'], ['Security',    '/security']] },
          ].map((col) => (
            <div key={col.h}>
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>{col.h}</p>
              <div className="space-y-2">
                {col.items.map(([l, h]) => (
                  <Link
                    key={l}
                    href={h}
                    className="block text-xs transition-colors"
                    style={{ color: 'var(--text-3)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-1)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-3)')}
                  >
                    → {l}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
