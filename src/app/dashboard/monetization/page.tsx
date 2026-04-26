'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  computeDynamicPrice,
  createNFTGate,
  generateNFTMetadata,
  createStream,
  tickStream,
  settleStream,
  optimizeBundles,
  identifyLeakages,
  generateMockMembers,
  generateMockProducts,
  generateMockPurchaseHistory,
  type PricingSignal,
  type DynamicPrice,
  type NFTChain,
  type NFTAccessLevel,
  type NFTGate,
  type StreamSession,
  type StreamSettlement,
  type Bundle,
  type RevenueLeakage,
} from '@/lib/platform/monetization-engine';

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'pricing' | 'leakage' | 'nft' | 'streaming' | 'bundles';

const TABS: { id: Tab; label: string }[] = [
  { id: 'pricing', label: 'Dynamic Pricing' },
  { id: 'leakage', label: 'Revenue Leakage' },
  { id: 'nft', label: 'NFT Gates' },
  { id: 'streaming', label: 'Micro-Streaming' },
  { id: 'bundles', label: 'Bundle Optimizer' },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ basePrice, multiplier }: { basePrice: number; multiplier: number }) {
  const W = 200;
  const H = 48;
  const points = Array.from({ length: 10 }, (_, i) => {
    const x = (i / 9) * W;
    const wave = Math.sin((i / 9) * Math.PI * 2) * 0.15;
    const y = H - ((basePrice * (multiplier + wave)) / (basePrice * (multiplier + 0.15) * 1.05)) * H;
    return `${x},${Math.max(2, Math.min(H - 2, y))}`;
  });
  const polyline = points.join(' ');

  return (
    <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${H} ${polyline} ${W},${H}`}
        fill="url(#spark-fill)"
      />
      <polyline
        points={polyline}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Pricing Tab ──────────────────────────────────────────────────────────────

const BASE_PRICE = 49;

function PricingTab() {
  const [demand, setDemand] = useState(60);
  const [competition, setCompetition] = useState(30);
  const [season, setSeason] = useState(7);
  const [result, setResult] = useState<DynamicPrice | null>(null);

  useEffect(() => {
    const signals: PricingSignal = {
      demand: demand / 100,
      competition: competition / 100,
      season,
      dayOfWeek: (new Date().getDay() as PricingSignal['dayOfWeek']),
    };
    setResult(computeDynamicPrice(BASE_PRICE, signals));
  }, [demand, competition, season]);

  const strategyColor: Record<string, string> = {
    surge: 'text-orange-400',
    penetration: 'text-blue-400',
    premium: 'text-violet-400',
    parity: 'text-emerald-400',
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Controls */}
      <Card glass className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white text-lg">Pricing Signals</CardTitle>
          <CardDescription>Adjust market parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { label: 'Demand', value: demand, set: setDemand },
            { label: 'Competition', value: competition, set: setCompetition },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">{label}</span>
                <span className="text-violet-400 font-mono font-bold">{value}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={e => set(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>
          ))}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Season (month 1–12)</span>
              <span className="text-violet-400 font-mono font-bold">{season}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={season}
              onChange={e => setSeason(Number(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Live result */}
      {result && (
        <Card glass className="border-white/10 bg-white/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Live Price</CardTitle>
              <Badge variant="default" className="font-mono">
                ×{result.multiplier}
              </Badge>
            </div>
            <CardDescription className={strategyColor[result.strategy]}>
              {result.strategy.toUpperCase()} strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <span className="text-gray-500 line-through text-xl">${fmt(result.basePrice)}</span>
              <span className="text-4xl font-bold text-white">${fmt(result.adjustedPrice)}</span>
            </div>
            <p className="text-sm text-gray-400">{result.reason}</p>
            <Sparkline basePrice={result.basePrice} multiplier={result.multiplier} />
            <div className="text-xs text-gray-500">
              Valid until {new Date(result.validUntil).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Leakage Tab ──────────────────────────────────────────────────────────────

const LEAKAGE_ICONS: Record<string, string> = {
  churn: '📉',
  downgrade: '⬇️',
  'failed-payment': '💳',
  'discount-abuse': '🏷️',
};

function LeakageTab() {
  const [leakages] = useState<RevenueLeakage[]>(() =>
    identifyLeakages(generateMockMembers(40))
  );
  const [fixed, setFixed] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">
        Analysed 40 subscriber records — {leakages.length} leakage sources found.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {leakages.map(l => (
          <Card key={l.type} glass className="border-white/10 bg-white/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{LEAKAGE_ICONS[l.type]}</span>
                  <span className="text-white font-semibold capitalize">
                    {l.type.replace('-', ' ')}
                  </span>
                </div>
                <Badge variant="destructive">${fmt(l.mrr)} MRR at risk</Badge>
              </div>
              <div className="text-sm text-gray-400">
                <span className="font-mono text-white">{l.count}</span> affected subscribers
              </div>
              <p className="text-xs text-gray-500 italic">{l.recoveryAction}</p>
              <Button
                size="sm"
                variant={fixed.has(l.type) ? 'success' : 'default'}
                onClick={() => setFixed(prev => new Set([...prev, l.type]))}
                disabled={fixed.has(l.type)}
              >
                {fixed.has(l.type) ? '✓ Fix Queued' : 'Fix'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── NFT Tab ─────────────────────────────────────────────────────────────────

const MOCK_GATES: NFTGate[] = [
  {
    gateId: 'gate_abc123',
    contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    tokenId: null,
    chainId: 'ethereum',
    contentId: 'course_001',
    accessLevel: 'view',
    createdAt: Date.now() - 86400000,
  },
  {
    gateId: 'gate_def456',
    contractAddress: 'So11111111111111111111111111111111111111112',
    tokenId: '42',
    chainId: 'solana',
    contentId: 'preset_pack_v2',
    accessLevel: 'download',
    createdAt: Date.now() - 172800000,
  },
  {
    gateId: 'gate_ghi789',
    contractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    tokenId: null,
    chainId: 'polygon',
    contentId: 'beat_stems_vol3',
    accessLevel: 'remix',
    createdAt: Date.now() - 259200000,
  },
];

function NFTTab() {
  const [contract, setContract] = useState('');
  const [chain, setChain] = useState<NFTChain>('ethereum');
  const [access, setAccess] = useState<NFTAccessLevel>('view');
  const [metadata, setMetadata] = useState<string | null>(null);
  const [gates, setGates] = useState<NFTGate[]>(MOCK_GATES);

  function handleCreate() {
    const addr = contract.trim() || '0x0000000000000000000000000000000000000000';
    const gate = createNFTGate('content_new', { contractAddress: addr, chainId: chain, accessLevel: access });
    const meta = generateNFTMetadata({
      id: gate.gateId,
      name: `Gated Content (${access})`,
      description: `NFT-gated access on ${chain} — level: ${access}`,
      price: 0,
      creator: 'Creator',
    });
    setMetadata(meta);
    setGates(prev => [gate, ...prev]);
  }

  return (
    <div className="space-y-6">
      <Card glass className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Create NFT Gate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contract Address</label>
            <input
              type="text"
              value={contract}
              onChange={e => setContract(e.target.value)}
              placeholder="0x… or Solana pubkey"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Chain</label>
            <div className="flex gap-2 flex-wrap">
              {(['ethereum', 'polygon', 'solana'] as NFTChain[]).map(c => (
                <button
                  key={c}
                  onClick={() => setChain(c)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    chain === c
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-violet-500'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Access Level</label>
            <div className="flex gap-2 flex-wrap">
              {(['view', 'download', 'remix', 'commercial'] as NFTAccessLevel[]).map(a => (
                <button
                  key={a}
                  onClick={() => setAccess(a)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    access === a
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-indigo-500'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleCreate}>Create Gate</Button>
          {metadata && (
            <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-auto max-h-48 whitespace-pre">
              {metadata}
            </pre>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-white font-semibold">Active Gates</h3>
        {gates.slice(0, 4).map(g => (
          <Card key={g.gateId} glass className="border-white/10 bg-white/5">
            <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1 min-w-0">
                <div className="text-white font-mono text-xs truncate">{g.contractAddress}</div>
                <div className="text-gray-500 text-xs">{g.contentId} · token {g.tokenId ?? 'any'}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary">{g.chainId}</Badge>
                <Badge variant="default">{g.accessLevel}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Streaming Tab ────────────────────────────────────────────────────────────

function StreamingTab() {
  const [rate, setRate] = useState(0.01);
  const [session, setSession] = useState<StreamSession | null>(null);
  const [settlement, setSettlement] = useState<StreamSettlement | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<StreamSession | null>(null);

  function start() {
    setSettlement(null);
    const s = createStream(rate);
    setSession(s);
    sessionRef.current = s;
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      sessionRef.current = tickStream(sessionRef.current!, 1);
      setSession({ ...sessionRef.current });
      setElapsed(e => e + 1);
    }, 1000);
  }

  function settle() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionRef.current) {
      setSettlement(settleStream(sessionRef.current));
    }
    setSession(null);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="space-y-6">
      <Card glass className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Stream Rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">USD / second</span>
              <span className="text-violet-400 font-mono font-bold">${rate.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={0.1}
              step={0.001}
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              disabled={!!session}
              className="w-full accent-violet-500 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>$0.001</span><span>$0.100</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={start} disabled={!!session}>
              Start Stream
            </Button>
            <Button variant="destructive" onClick={settle} disabled={!session}>
              Settle
            </Button>
          </div>
        </CardContent>
      </Card>

      {session && (
        <Card glass className="border-white/10 bg-emerald-950/30 border-emerald-500/20">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold text-sm">STREAMING LIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-xs">Elapsed</div>
                <div className="text-white text-2xl font-mono font-bold">{elapsed}s</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Total Streamed</div>
                <div className="text-emerald-400 text-2xl font-mono font-bold">
                  ${session.totalStreamed.toFixed(6)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 font-mono">{session.sessionId}</div>
          </CardContent>
        </Card>
      )}

      {settlement && (
        <Card glass className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Settlement</CardTitle>
            <Badge variant="success" className="w-fit">Settled</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: 'Duration', value: `${settlement.durationSeconds}s` },
              { label: 'Total Streamed', value: `$${fmt(settlement.totalStreamed, 6)}` },
              { label: 'Platform Fee (2.5%)', value: `$${fmt(settlement.platformFee, 6)}` },
              { label: 'Creator Payout', value: `$${fmt(settlement.creatorPayout, 6)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-mono">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Bundles Tab ──────────────────────────────────────────────────────────────

function BundlesTab() {
  const [bundles, setBundles] = useState<Bundle[]>(() =>
    optimizeBundles(generateMockProducts(), generateMockPurchaseHistory()).slice(0, 3)
  );

  function toggle(id: string) {
    setBundles(prev =>
      prev.map(b => b.bundleId === id ? { ...b, active: !b.active } : b)
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">
        AI-optimised bundles based on co-purchase affinity across your catalogue.
      </p>
      {bundles.map(b => (
        <Card key={b.bundleId} glass className="border-white/10 bg-white/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-white font-semibold">{b.name}</div>
                <div className="text-gray-500 text-xs mt-0.5 font-mono">{b.bundleId}</div>
              </div>
              <Badge variant={b.active ? 'success' : 'secondary'}>
                {b.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="space-y-1">
              {b.products.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{p.name}</span>
                  <span className="text-gray-500 font-mono">${fmt(p.price, 0)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-1">
              <span className="text-gray-500 line-through text-sm">${fmt(b.originalTotal)}</span>
              <span className="text-white text-2xl font-bold">${fmt(b.bundlePrice)}</span>
              <Badge variant="warning">Save ${fmt(b.savings)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Conversion lift:{' '}
                <span className="text-emerald-400 font-semibold">
                  +{Math.round(b.conversionLift * 100)}%
                </span>
              </div>
              <Button
                size="sm"
                variant={b.active ? 'outline' : 'default'}
                onClick={() => toggle(b.bundleId)}
              >
                {b.active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MonetizationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pricing');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Monetization Engine
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Dynamic pricing · Leakage detection · NFT gates · Streaming payments · Bundle optimizer
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-fit px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div>
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'leakage' && <LeakageTab />}
          {activeTab === 'nft' && <NFTTab />}
          {activeTab === 'streaming' && <StreamingTab />}
          {activeTab === 'bundles' && <BundlesTab />}
        </div>
      </div>
    </div>
  );
}
