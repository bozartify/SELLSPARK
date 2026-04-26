'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateMockIPPortfolio,
  generatePatentClaims,
  searchPriorArt,
  computeFreedomToOperate,
  generateIPAlerts,
  prioritizeAlerts,
  type IPAsset,
  type IPAssetStatus,
  type IPAssetType,
  type PatentClaim,
  type PriorArtResult,
  type IPAlert,
} from '@/lib/platform/ip-portfolio';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['portfolio', 'claims', 'prior-art', 'alerts'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  portfolio: 'Portfolio',
  claims: 'Claims',
  'prior-art': 'Prior Art',
  alerts: 'Alerts',
};

const TECH_FIELDS = [
  'AI/ML',
  'Quantum Computing',
  'Payments',
  'Content Distribution',
  'Data Privacy',
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValueM(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function typeIcon(type: IPAssetType): string {
  if (type === 'patent') return '📜';
  if (type === 'trademark') return '™';
  if (type === 'copyright') return '©';
  return '🔒';
}

function statusVariant(
  status: IPAssetStatus,
): 'secondary' | 'default' | 'warning' | 'success' | 'destructive' {
  switch (status) {
    case 'draft':
    case 'abandoned':
      return 'secondary';
    case 'filed':
      return 'default';
    case 'pending':
      return 'warning';
    case 'granted':
      return 'success';
    case 'expired':
      return 'destructive';
  }
}

function noveltyVariant(score: number): 'success' | 'warning' | 'destructive' {
  if (score > 0.7) return 'success';
  if (score >= 0.4) return 'warning';
  return 'destructive';
}

function daysRemaining(dueDate: string): number {
  const now = new Date('2026-04-23');
  const due = new Date(dueDate);
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}

function alertSeverityLabel(severity: IPAlert['severity']): string {
  if (severity === 'high') return '🔴 High';
  if (severity === 'medium') return '🟡 Medium';
  return '🟢 Low';
}

function alertTypeBadgeVariant(
  type: IPAlert['type'],
): 'destructive' | 'warning' | 'default' | 'secondary' {
  if (type === 'infringement') return 'destructive';
  if (type === 'maintenance-due') return 'warning';
  if (type === 'expiry') return 'default';
  return 'secondary';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardContent className="p-5">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-bold text-violet-300">{value}</p>
      </CardContent>
    </Card>
  );
}

function TypeBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-white/60 shrink-0">{label}</span>
      <div className="flex-1 h-4 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-white/80 shrink-0">{count}</span>
    </div>
  );
}

// ─── Tab: Portfolio ───────────────────────────────────────────────────────────

function PortfolioTab() {
  const assets = useMemo(() => generateMockIPPortfolio(), []);

  const totalAssets = assets.length;
  const grantedPatents = assets.filter(
    (a) => a.type === 'patent' && a.status === 'granted',
  ).length;
  const totalValue = assets.reduce((s, a) => s + a.estimatedValue, 0);

  // maintenance due: assets where status is granted/pending and grantDate triggers maintenance
  const maintenanceDue = useMemo(() => {
    const now = new Date('2026-04-23');
    return assets.filter((asset) => {
      if (asset.status === 'expired' || asset.status === 'abandoned') return false;
      if (asset.status === 'granted' && asset.grantDate) {
        const grant = new Date(asset.grantDate);
        const monthsSince =
          (now.getFullYear() - grant.getFullYear()) * 12 +
          (now.getMonth() - grant.getMonth());
        if (asset.type === 'patent') {
          return [42, 90, 138].some((w) => {
            const diff = w - monthsSince;
            return diff >= 0 && diff <= 3;
          });
        }
        if (asset.type === 'trademark') {
          const yearsToRenewal = 10 - ((monthsSince / 12) % 10);
          return yearsToRenewal <= 0.25;
        }
      }
      if (asset.status === 'pending' && asset.filingDate) {
        const filed = new Date(asset.filingDate);
        const monthsPending =
          (now.getFullYear() - filed.getFullYear()) * 12 +
          (now.getMonth() - filed.getMonth());
        return monthsPending >= 18;
      }
      return false;
    }).length;
  }, [assets]);

  const typeCounts: Record<IPAssetType, number> = {
    patent: 0,
    trademark: 0,
    copyright: 0,
    'trade-secret': 0,
  };
  assets.forEach((a) => typeCounts[a.type]++);
  const maxCount = Math.max(...Object.values(typeCounts));

  const typeColors: Record<IPAssetType, string> = {
    patent: 'bg-violet-500',
    trademark: 'bg-indigo-500',
    copyright: 'bg-sky-500',
    'trade-secret': 'bg-emerald-500',
  };

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Assets" value={totalAssets} />
        <KpiCard label="Granted Patents" value={grantedPatents} />
        <KpiCard label="Estimated Value" value={formatValueM(totalValue)} />
        <KpiCard label="Maintenance Due" value={maintenanceDue} />
      </div>

      {/* Type breakdown bars */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-2">
          <p className="text-sm font-semibold text-white/80">Asset Breakdown by Type</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <TypeBar label="Patents" count={typeCounts.patent} max={maxCount} color={typeColors.patent} />
          <TypeBar label="Trademarks" count={typeCounts.trademark} max={maxCount} color={typeColors.trademark} />
          <TypeBar label="Copyrights" count={typeCounts.copyright} max={maxCount} color={typeColors.copyright} />
          <TypeBar label="Trade Secrets" count={typeCounts['trade-secret']} max={maxCount} color={typeColors['trade-secret']} />
        </CardContent>
      </Card>

      {/* Asset list */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-2">
          <p className="text-sm font-semibold text-white/80">All Assets</p>
        </CardHeader>
        <CardContent className="divide-y divide-white/5">
          {assets.map((asset) => (
            <AssetRow key={asset.assetId} asset={asset} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AssetRow({ asset }: { asset: IPAsset }) {
  const shownJurisdictions = asset.jurisdiction.slice(0, 2);
  const extra = asset.jurisdiction.length - 2;
  return (
    <div className="flex items-center gap-3 py-3 flex-wrap">
      <span className="text-xl w-7 shrink-0">{typeIcon(asset.type)}</span>
      <span className="flex-1 min-w-0 text-sm text-white font-medium truncate">
        {asset.title}
      </span>
      <Badge variant={statusVariant(asset.status)} className="capitalize shrink-0">
        {asset.status}
      </Badge>
      <div className="flex gap-1 shrink-0">
        {shownJurisdictions.map((j) => (
          <span
            key={j}
            className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/70 border border-white/10"
          >
            {j}
          </span>
        ))}
        {extra > 0 && (
          <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/50 border border-white/10">
            +{extra}
          </span>
        )}
      </div>
      <span className="text-xs text-violet-300 font-mono shrink-0">
        {formatValueM(asset.estimatedValue)}
      </span>
    </div>
  );
}

// ─── Tab: Claims ──────────────────────────────────────────────────────────────

function ClaimsTab() {
  const [title, setTitle] = useState('');
  const [field, setField] = useState<string>(TECH_FIELDS[0]);
  const [elements, setElements] = useState(['', '', '']);
  const [claims, setClaims] = useState<PatentClaim[]>([]);
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    if (!title.trim()) return;
    setLoading(true);
    const result = generatePatentClaims({
      title,
      description: title,
      technicalField: field,
      novelElements: elements.filter(Boolean),
    });
    setClaims(result);
    setLoading(false);
  }

  function updateElement(idx: number, val: string) {
    setElements((prev) => prev.map((e, i) => (i === idx ? val : e)));
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-2">
          <p className="text-sm font-semibold text-white/80">Invention Details</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Invention Title</label>
            <input
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="e.g. AI-Driven Creator Subscription Optimizer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Technical Field</label>
            <select
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              value={field}
              onChange={(e) => setField(e.target.value)}
            >
              {TECH_FIELDS.map((f) => (
                <option key={f} value={f} className="bg-gray-900">
                  {f}
                </option>
              ))}
            </select>
          </div>
          {[0, 1, 2].map((idx) => (
            <div key={idx}>
              <label className="block text-xs text-white/50 mb-1">Novel Element {idx + 1}</label>
              <input
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder={`Describe novel element ${idx + 1}…`}
                value={elements[idx]}
                onChange={(e) => updateElement(idx, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={handleGenerate} loading={loading} disabled={!title.trim()}>
            Generate Claims
          </Button>
        </CardContent>
      </Card>

      {claims.length > 0 && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-2">
            <p className="text-sm font-semibold text-white/80">Generated Claims</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {claims.map((claim) => (
              <ClaimItem key={claim.claimId} claim={claim} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClaimItem({ claim }: { claim: PatentClaim }) {
  const scoreLabel = `${(claim.noveltyScore * 100).toFixed(0)}% novelty`;
  return (
    <div className="border border-white/10 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-white/50 font-mono">
          Claim {claim.claimNumber} — {claim.type}
        </span>
        <Badge variant={noveltyVariant(claim.noveltyScore)} className="text-xs">
          {scoreLabel}
        </Badge>
      </div>
      <p className="text-sm text-white/90 leading-relaxed">
        <span className="font-semibold text-violet-300">{claim.claimNumber}.</span>{' '}
        {claim.text}
      </p>
      {claim.dependsOn && (
        <p className="text-xs text-white/40">Depends on claim {claim.dependsOn}</p>
      )}
    </div>
  );
}

// ─── Tab: Prior Art ───────────────────────────────────────────────────────────

function PriorArtTab() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState('');
  const [field, setField] = useState<string>(TECH_FIELDS[0]);
  const [results, setResults] = useState<PriorArtResult[]>([]);
  const [searched, setSearched] = useState(false);

  function addKeyword() {
    const kw = kwInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
    }
    setKwInput('');
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function handleSearch() {
    const res = searchPriorArt(keywords, field);
    setResults(res);
    setSearched(true);
  }

  const fto = useMemo(() => {
    if (!searched || results.length === 0) return null;
    return computeFreedomToOperate([], results);
  }, [results, searched]);

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-2">
          <p className="text-sm font-semibold text-white/80">Prior Art Search</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Keywords</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="Type keyword and press Enter"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
              />
              <Button variant="secondary" size="sm" onClick={addKeyword}>
                Add
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600/30 border border-violet-500/30 text-xs text-violet-200"
                  >
                    {kw}
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="text-violet-400 hover:text-white ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Technical Field</label>
            <select
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              value={field}
              onChange={(e) => setField(e.target.value)}
            >
              {TECH_FIELDS.map((f) => (
                <option key={f} value={f} className="bg-gray-900">
                  {f}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleSearch} disabled={keywords.length === 0}>
            Search Prior Art
          </Button>
        </CardContent>
      </Card>

      {searched && (
        <>
          <div className="space-y-4">
            {results.map((r) => (
              <PriorArtCard key={r.id} result={r} />
            ))}
          </div>

          {fto && (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="p-5">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
                  Freedom to Operate
                </p>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-5xl font-bold ${fto.safeToFile ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {Math.round(fto.score * 100)}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${fto.safeToFile ? 'text-emerald-300' : 'text-red-300'}`}>
                      {fto.safeToFile ? 'Safe to File' : 'Blockers Detected'}
                    </p>
                    {fto.blockers.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {fto.blockers.map((b) => (
                          <li key={b} className="text-xs text-red-300">
                            • {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function PriorArtCard({ result }: { result: PriorArtResult }) {
  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className="font-mono text-xs text-violet-300">{result.patentNumber}</span>
          <span className="text-xs text-white/40">{result.publicationDate}</span>
        </div>
        <p className="text-sm font-semibold text-white">{result.title}</p>
        <p className="text-xs text-white/50">{result.assignee}</p>
        <p className="text-xs text-white/60 leading-relaxed">
          {result.abstract.slice(0, 150)}
          {result.abstract.length > 150 ? '…' : ''}
        </p>
        <div className="space-y-1">
          <p className="text-xs text-white/40">
            Relevance — {(result.relevanceScore * 100).toFixed(0)}%
          </p>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${result.relevanceScore * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tab: Alerts ──────────────────────────────────────────────────────────────

function AlertsTab() {
  const allAlerts = useMemo(() => {
    const portfolio = generateMockIPPortfolio();
    const raw = generateIPAlerts(portfolio);
    return prioritizeAlerts(raw);
  }, []);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  const visible = allAlerts.filter((a) => !dismissed.has(a.alertId));

  const grouped: Record<'high' | 'medium' | 'low', IPAlert[]> = {
    high: visible.filter((a) => a.severity === 'high'),
    medium: visible.filter((a) => a.severity === 'medium'),
    low: visible.filter((a) => a.severity === 'low'),
  };

  const severities = ['high', 'medium', 'low'] as const;

  return (
    <div className="space-y-6">
      {visible.length === 0 && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="p-8 text-center text-white/40">
            All alerts resolved.
          </CardContent>
        </Card>
      )}
      {severities.map((sev) =>
        grouped[sev].length === 0 ? null : (
          <div key={sev} className="space-y-3">
            <p className="text-sm font-semibold text-white/60">{alertSeverityLabel(sev)}</p>
            {grouped[sev].map((alert) => (
              <AlertCard key={alert.alertId} alert={alert} onDismiss={() => dismiss(alert.alertId)} />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

function AlertCard({ alert, onDismiss }: { alert: IPAlert; onDismiss: () => void }) {
  const days = alert.dueDate ? daysRemaining(alert.dueDate) : null;
  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant={alertTypeBadgeVariant(alert.type)} className="capitalize text-xs">
              {alert.type.replace(/-/g, ' ')}
            </Badge>
            <span className="text-xs text-white/50">{alert.assetTitle}</span>
          </div>
          {days !== null && (
            <span
              className={`text-xs font-mono ${days <= 7 ? 'text-red-300' : days <= 30 ? 'text-amber-300' : 'text-white/40'}`}
            >
              {days > 0 ? `${days}d remaining` : 'Overdue'}
            </span>
          )}
        </div>
        <p className="text-sm text-white/80">{alert.description}</p>
        <p className="text-xs text-white/50">
          <span className="font-semibold text-white/60">Action:</span> {alert.actionRequired}
        </p>
        <div className="pt-1">
          <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white" onClick={onDismiss}>
            Mark Resolved
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IPPortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950/20 to-gray-950 p-6 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">IP Portfolio</h1>
          <p className="text-sm text-white/40 mt-1">
            Intellectual property management, patent claims, prior art, and alerts.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'claims' && <ClaimsTab />}
        {activeTab === 'prior-art' && <PriorArtTab />}
        {activeTab === 'alerts' && <AlertsTab />}
      </div>
    </div>
  );
}
