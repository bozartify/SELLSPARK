'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MARKETPLACE_AGENTS,
  TOOL_REGISTRY,
  installAgent,
  initiateDebate,
  createThoughtChain,
  addStep,
  type MarketplaceAgent,
  type DebateAgent,
  type DebateResult,
  type ThoughtChain,
  type ToolCategory,
} from '@/lib/platform/agent-orchestration';

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = 'marketplace' | 'debate' | 'thoughts' | 'tools';

const TABS: { id: Tab; label: string }[] = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'debate', label: 'Debate' },
  { id: 'thoughts', label: 'Thought Chain' },
  { id: 'tools', label: 'Tools' },
];

// ─── Mock thought chain shown in the Thoughts tab ────────────────────────────

const MOCK_CHAIN: ThoughtChain = (() => {
  let chain = createThoughtChain('agent-revenuemax');
  chain = addStep(chain, 'Analysing current pricing relative to competitor benchmarks.', 0.72, [
    'analytics-query',
    'web-search',
  ]);
  chain = addStep(chain, 'Detecting demand elasticity from last 30 days of purchase events.', 0.85, [
    'analytics-query',
  ]);
  chain = addStep(
    chain,
    'Segmenting audience by willingness-to-pay using behavioural signals.',
    0.78,
    ['audience-segment'],
  );
  chain = addStep(
    chain,
    'Proposing price increase of 12% for premium tier — projected +18% MRR uplift.',
    0.91,
    ['price-optimize'],
  );
  return chain;
})();

// ─── Tool category colours ────────────────────────────────────────────────────

const CATEGORY_COLOUR: Record<ToolCategory, string> = {
  web: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  content: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  payments: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  analytics: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  communication: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-white/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-white/60">{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function MarketplaceTab() {
  const [agents, setAgents] = useState<MarketplaceAgent[]>(MARKETPLACE_AGENTS);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'installs' | 'price'>('rating');

  function handleInstall(agentId: string) {
    installAgent(agentId);
    setAgents((prev) =>
      prev.map((a) => (a.agentId === agentId ? { ...a, installed: true } : a)),
    );
  }

  const categories = ['all', ...Array.from(new Set(agents.map((a) => a.category)))];
  const filtered = agents
    .filter((a) => activeCategory === 'all' || a.category === activeCategory)
    .filter((a) =>
      query.trim() === ''
        ? true
        : (a.name + ' ' + a.capabilities.join(' ')).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'installs') return b.usageCount - a.usageCount;
      return a.price - b.price;
    });

  return (
    <div className="flex flex-col gap-5">
      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Total agents', agents.length.toLocaleString()],
          ['Categories', String(new Set(agents.map((a) => a.category)).size)],
          ['Installed', String(agents.filter((a) => a.installed).length)],
          ['Avg rating', (agents.reduce((s, a) => s + a.rating, 0) / agents.length).toFixed(2)],
        ].map(([label, val]) => (
          <Card key={label} className="border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{val}</p>
          </Card>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 100+ agents by name or capability…"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'rating' | 'installs' | 'price')}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
        >
          <option value="rating">Top rated</option>
          <option value="installs">Most installed</option>
          <option value="price">Lowest price</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
              activeCategory === cat
                ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
            }`}
          >
            {cat}{' '}
            <span className="opacity-60">
              ({cat === 'all' ? agents.length : agents.filter((a) => a.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-white/40">
        Showing {filtered.length} of {agents.length} agents
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {filtered.map((agent) => (
        <Card
          key={agent.agentId}
          className="flex flex-col gap-3 border-white/10 bg-white/5 p-5 backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white">{agent.name}</p>
              <Badge
                variant="secondary"
                className="mt-1 capitalize text-xs border border-white/10 bg-white/10 text-white/70"
              >
                {agent.category}
              </Badge>
            </div>
            <span className="text-lg font-bold text-violet-400">${agent.price}<span className="text-xs font-normal text-white/40">/mo</span></span>
          </div>

          <StarRating rating={agent.rating} />

          <p className="text-xs text-white/50">
            {agent.usageCount.toLocaleString()} installs
          </p>

          <div className="flex flex-wrap gap-1.5">
            {agent.capabilities.map((cap) => (
              <span
                key={cap}
                className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300"
              >
                {cap}
              </span>
            ))}
          </div>

          <Button
            variant={agent.installed ? 'secondary' : 'default'}
            size="sm"
            className="mt-auto w-full"
            disabled={agent.installed}
            onClick={() => handleInstall(agent.agentId)}
          >
            {agent.installed ? 'Installed' : 'Install'}
          </Button>
        </Card>
      ))}
      </div>
    </div>
  );
}

const DEBATE_AGENT_OPTIONS: DebateAgent[] = [
  { id: 'da-001', name: 'GrowthEngine', perspective: 'growth-focused' },
  { id: 'da-002', name: 'RevenueMax', perspective: 'revenue-optimised' },
  { id: 'da-003', name: 'DataSage', perspective: 'data-driven' },
  { id: 'da-004', name: 'ComplianceGuard', perspective: 'risk-averse' },
  { id: 'da-005', name: 'SocialPilot', perspective: 'audience-centric' },
];

function DebateTab() {
  const [question, setQuestion] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<DebateResult | null>(null);
  const [running, setRunning] = useState(false);

  function toggleAgent(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev,
    );
  }

  function startDebate() {
    if (!question.trim() || selectedIds.length === 0) return;
    setRunning(true);
    const agents = DEBATE_AGENT_OPTIONS.filter((a) => selectedIds.includes(a.id));
    const res = initiateDebate(question, agents, 2);
    setResult(res);
    setRunning(false);
  }

  const agentColours: Record<string, string> = {};
  const palette = [
    'bg-violet-500/20 border-violet-500/30 text-violet-200',
    'bg-sky-500/20 border-sky-500/30 text-sky-200',
    'bg-emerald-500/20 border-emerald-500/30 text-emerald-200',
  ];
  selectedIds.forEach((id, i) => { agentColours[id] = palette[i % palette.length]; });

  return (
    <div className="flex flex-col gap-6">
      {/* Input section */}
      <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <p className="mb-3 text-sm font-semibold text-white/80">Debate Question</p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Should we raise prices by 20% for the premium tier?"
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-500 focus:outline-none resize-none"
        />

        <p className="mb-3 mt-4 text-sm font-semibold text-white/80">
          Select Agents <span className="text-white/40 font-normal">(up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {DEBATE_AGENT_OPTIONS.map((agent) => {
            const selected = selectedIds.includes(agent.id);
            return (
              <button
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selected
                    ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                }`}
              >
                {agent.name}
              </button>
            );
          })}
        </div>

        <Button
          className="mt-5"
          disabled={!question.trim() || selectedIds.length === 0 || running}
          onClick={startDebate}
        >
          {running ? 'Running…' : 'Start Debate'}
        </Button>
      </Card>

      {/* Debate results */}
      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {result.arguments.map((arg, idx) => {
              const colour = agentColours[arg.agentId] ?? palette[0];
              const isRight = idx % 2 !== 0;
              return (
                <div
                  key={idx}
                  className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl border p-4 backdrop-blur-sm ${colour}`}
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                      {arg.agentName} · Round {arg.round}
                    </p>
                    <p className="text-sm leading-relaxed">{arg.position}</p>
                    <p className="mt-2 text-[10px] opacity-60">
                      Confidence: {(arg.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consensus meter */}
          <Card className="border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="mb-3 text-sm font-semibold text-white">Consensus Score</p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${result.consensusScore * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/60">
              {(result.consensusScore * 100).toFixed(1)}% — Winning position held by{' '}
              <span className="text-violet-300 font-medium">
                {DEBATE_AGENT_OPTIONS.find((a) => a.id === result.winningAgentId)?.name}
              </span>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

function ThoughtsTab() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <p className="mb-1 text-sm font-semibold text-white">RevenueMax · Pricing Analysis</p>
        <p className="text-xs text-white/40">Chain ID: {MOCK_CHAIN.chainId}</p>
      </Card>

      <div className="relative flex flex-col gap-0">
        {/* Vertical line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-white/10" />

        {MOCK_CHAIN.steps.map((step, idx) => (
          <div key={step.stepId} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Circle */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/20 text-xs font-bold text-violet-300">
              {idx + 1}
            </div>

            <Card className="flex-1 border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="mb-3 text-sm text-white/90 leading-relaxed">{step.reasoning}</p>

              {/* Confidence bar */}
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-[10px] text-white/40">
                  <span>Confidence</span>
                  <span>{(step.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ width: `${step.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Tools used */}
              {step.toolsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {step.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-2 text-[10px] text-white/30">
                {step.timestamp.toLocaleTimeString()}
              </p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

const TOOL_CATEGORIES: ToolCategory[] = ['web', 'content', 'payments', 'analytics', 'communication'];

const CATEGORY_LABEL: Record<ToolCategory, string> = {
  web: 'Web',
  content: 'Content',
  payments: 'Payments',
  analytics: 'Analytics',
  communication: 'Communication',
};

function ToolsTab() {
  const [tested, setTested] = useState<Set<string>>(new Set());

  function handleTest(name: string) {
    setTested((prev) => new Set([...prev, name]));
    setTimeout(() => {
      setTested((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }, 1500);
  }

  return (
    <div className="flex flex-col gap-8">
      {TOOL_CATEGORIES.map((cat) => {
        const tools = TOOL_REGISTRY.filter((t) => t.category === cat);
        return (
          <div key={cat}>
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${CATEGORY_COLOUR[cat]}`}
              >
                {CATEGORY_LABEL[cat]}
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <Card
                  key={tool.name}
                  className="flex items-start justify-between gap-3 border-white/10 bg-white/5 p-4 backdrop-blur-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{tool.name}</p>
                    <p className="mt-1 text-xs text-white/50 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.keys(tool.inputSchema).map((param) => (
                        <span
                          key={param}
                          className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40"
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => handleTest(tool.name)}
                  >
                    {tested.has(tool.name) ? '✓ OK' : 'Test'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('marketplace');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 px-4 py-8 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Agent Hub</h1>
        <p className="mt-1 text-sm text-white/50">
          Orchestrate AI agents, run debates, trace reasoning, and manage tools.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'marketplace' && <MarketplaceTab />}
      {activeTab === 'debate' && <DebateTab />}
      {activeTab === 'thoughts' && <ThoughtsTab />}
      {activeTab === 'tools' && <ToolsTab />}
    </div>
  );
}
