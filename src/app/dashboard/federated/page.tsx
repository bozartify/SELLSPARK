'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createFederatedModel,
  advanceRound,
  fedAvgRound,
  simulateClientUpdate,
  computePrivacyBudget,
  generatePrivacyReport,
  type FederatedModel,
} from '@/lib/quantum/federated-learning';

// ─── Local state types ────────────────────────────────────────────────────────

interface RoundRecord {
  round: number;
  participants: number;
  globalLoss: number;
  accuracy: number;
  privacySpent: number;
  timestamp: number;
}

interface SimulatedClient {
  clientId: string;
  datasetSize: number;
  localEpochs: number;
  epsilon: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PURPOSES = [
  'churn-prediction',
  'content-recommendation',
  'pricing-optimizer',
  'fraud-detection',
] as const;

type Purpose = typeof PURPOSES[number];

const CLIENT_POOL: SimulatedClient[] = [
  { clientId: 'client-a1b2c3d4', datasetSize: 1200, localEpochs: 3, epsilon: 1.0 },
  { clientId: 'client-e5f6a7b8', datasetSize: 850,  localEpochs: 2, epsilon: 0.8 },
  { clientId: 'client-c9d0e1f2', datasetSize: 2100, localEpochs: 4, epsilon: 1.2 },
  { clientId: 'client-a3b4c5d6', datasetSize: 600,  localEpochs: 2, epsilon: 0.9 },
  { clientId: 'client-e7f8a9b0', datasetSize: 1750, localEpochs: 3, epsilon: 1.1 },
  { clientId: 'client-c1d2e3f4', datasetSize: 980,  localEpochs: 3, epsilon: 1.0 },
];

function riskColor(risk: string) {
  if (risk === 'minimal') return 'text-emerald-400';
  if (risk === 'low')     return 'text-green-400';
  if (risk === 'medium')  return 'text-yellow-400';
  return 'text-red-400';
}

function riskBadgeVariant(risk: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (risk === 'minimal' || risk === 'low') return 'success';
  if (risk === 'medium') return 'warning';
  return 'destructive';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FederatedPage() {
  const [purpose, setPurpose] = useState<Purpose>('churn-prediction');
  const [model, setModel] = useState<FederatedModel>(() => createFederatedModel('churn-prediction'));
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<'overview' | 'clients' | 'privacy' | 'history'>('overview');

  // ── Derived ──────────────────────────────────────────────────────────────────

  const report = useMemo(() => generatePrivacyReport(model), [model]);

  const budgetSeries = useMemo(() =>
    history.map(r => ({ round: r.round, epsilon: r.privacySpent })),
    [history],
  );

  const privacyBudget = useMemo(() =>
    computePrivacyBudget(budgetSeries, model.maxEpsilon),
    [budgetSeries, model.maxEpsilon],
  );

  const totalData = CLIENT_POOL.reduce((s, c) => s + c.datasetSize, 0);
  const latestAccuracy = history.length > 0 ? history[history.length - 1].accuracy : model.accuracy;
  const budgetUsedFraction = model.cumulativeEpsilon / model.maxEpsilon;
  const budgetRemainingPct = Math.max(0, (1 - budgetUsedFraction) * 100);

  // ── Actions ──────────────────────────────────────────────────────────────────

  function handleRunRound() {
    setRunning(true);
    setTimeout(() => {
      const updates = CLIENT_POOL.map(c =>
        simulateClientUpdate(c.clientId, model.globalWeights, c.datasetSize, c.localEpochs, c.epsilon, 1e-5, 1.0)
      );
      const result = fedAvgRound(model.globalWeights, updates, model.round + 1);
      const next = advanceRound(model, result);
      const rec: RoundRecord = {
        round: next.round,
        participants: result.participantsUsed,
        globalLoss: result.avgLocalLoss,
        accuracy: next.accuracy,
        privacySpent: result.privacySpent,
        timestamp: Date.now(),
      };
      setModel(next);
      setHistory(h => [...h, rec]);
      setRunning(false);
    }, 600);
  }

  function handleReset() {
    const fresh = createFederatedModel(purpose);
    setModel(fresh);
    setHistory([]);
  }

  function handlePurposeChange(p: Purpose) {
    setPurpose(p);
    setModel(createFederatedModel(p));
    setHistory([]);
  }

  // ── Chart helpers ─────────────────────────────────────────────────────────────

  const CHART_W = 520;
  const CHART_H = 120;
  const BAR_GAP = 4;

  function renderAccuracyChart() {
    if (history.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
          No rounds completed yet — run a round to see the chart.
        </div>
      );
    }
    const n = history.length;
    const barW = Math.max(8, Math.floor((CHART_W - BAR_GAP * (n + 1)) / n));
    const usableW = n * (barW + BAR_GAP) + BAR_GAP;

    return (
      <svg viewBox={`0 0 ${usableW} ${CHART_H + 24}`} className="w-full" style={{ maxHeight: 160 }}>
        {/* y-axis gridlines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map(v => {
          const y = CHART_H - v * CHART_H;
          return (
            <g key={v}>
              <line x1={0} y1={y} x2={usableW} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
              <text x={2} y={y - 2} fill="rgba(255,255,255,0.3)" fontSize={8}>{(v * 100).toFixed(0)}%</text>
            </g>
          );
        })}
        {history.map((rec, i) => {
          const x = BAR_GAP + i * (barW + BAR_GAP);
          const barH = Math.max(2, rec.accuracy * CHART_H);
          const y = CHART_H - barH;
          return (
            <g key={rec.round}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={2}
                fill="url(#barGrad)"
                opacity={0.85}
              />
              <text x={x + barW / 2} y={CHART_H + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
                {rec.round}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const TABS = ['overview', 'clients', 'privacy', 'history'] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Federated Learning</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Privacy-preserving on-device training — no raw data leaves client devices.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={privacyBudget.recommendation === 'continue' ? 'success' : privacyBudget.recommendation === 'slow-down' ? 'warning' : 'destructive'}>
            {privacyBudget.recommendation}
          </Badge>
          <Badge variant="secondary">{model.purpose}</Badge>
        </div>
      </div>

      {/* Purpose selector */}
      <div className="flex gap-2 flex-wrap">
        {PURPOSES.map(p => (
          <button
            key={p}
            onClick={() => handlePurposeChange(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              purpose === p
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
            }`}
          >
            {p.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-violet-500 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ───────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader><span className="text-xs text-zinc-400">Round</span></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{model.round}</div>
                <div className="text-xs text-zinc-500 mt-1">FedAvg rounds completed</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader><span className="text-xs text-zinc-400">Active Clients</span></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{CLIENT_POOL.length}</div>
                <div className="text-xs text-zinc-500 mt-1">{model.participatingClients} last round</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader><span className="text-xs text-zinc-400">Global Accuracy</span></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-violet-400">{(latestAccuracy * 100).toFixed(1)}%</div>
                <div className="text-xs text-zinc-500 mt-1">
                  loss: {model.loss.toFixed(4)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader><span className="text-xs text-zinc-400">Privacy Budget Remaining</span></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-400">{budgetRemainingPct.toFixed(1)}%</div>
                <div className="text-xs text-zinc-500 mt-1">
                  ε {model.cumulativeEpsilon.toFixed(2)} / {model.maxEpsilon} spent
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Training Control</h2>
                <Badge variant={model.round === 0 ? 'secondary' : 'success'}>
                  {model.round === 0 ? 'initialised' : 'training'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                Model: <span className="text-white font-mono text-xs">{model.id}</span>
              </p>
              <p className="text-sm text-zinc-400">
                {report.summary}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleRunRound}
                  disabled={running || privacyBudget.recommendation === 'stop'}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {running ? 'Running round…' : 'Run Round'}
                </Button>
                <Button variant="outline" onClick={handleReset} className="border-white/10 text-zinc-300 hover:bg-white/10">
                  Reset Model
                </Button>
              </div>
              {privacyBudget.recommendation === 'stop' && (
                <p className="text-xs text-red-400">Privacy budget exhausted — training halted to preserve DP guarantees.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Clients Tab ────────────────────────────────────────────────────────── */}
      {tab === 'clients' && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <h2 className="font-semibold text-white">Participating Clients</h2>
            <p className="text-xs text-zinc-500">{CLIENT_POOL.length} devices enrolled — data never leaves device</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-zinc-500 border-b border-white/10">
                    <th className="text-left py-2 pr-4">Client ID</th>
                    <th className="text-right py-2 pr-4">Dataset Size</th>
                    <th className="text-right py-2 pr-4">Local Epochs</th>
                    <th className="text-right py-2 pr-4">DP ε</th>
                    <th className="text-left py-2">Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {CLIENT_POOL.map(c => {
                    const weight = (c.datasetSize / totalData) * 100;
                    return (
                      <tr key={c.clientId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-300">
                          {c.clientId.slice(0, 14)}…
                        </td>
                        <td className="py-3 pr-4 text-right text-white">{c.datasetSize.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{c.localEpochs}</td>
                        <td className="py-3 pr-4 text-right text-violet-400 font-mono">{c.epsilon.toFixed(1)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/10 rounded-full h-2 min-w-16">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"
                                style={{ width: `${weight}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-400 w-12 text-right">{weight.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Privacy Tab ────────────────────────────────────────────────────────── */}
      {tab === 'privacy' && (
        <div className="space-y-4">
          {/* ε-budget meter */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Privacy Budget (ε-meter)</h2>
                <Badge variant={riskBadgeVariant(report.dataExposureRisk)}>
                  {report.dataExposureRisk} risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>ε spent: {model.cumulativeEpsilon.toFixed(3)}</span>
                  <span>max: {model.maxEpsilon}</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      budgetUsedFraction > 0.8
                        ? 'bg-gradient-to-r from-red-600 to-orange-500'
                        : budgetUsedFraction > 0.5
                        ? 'bg-gradient-to-r from-yellow-600 to-amber-500'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, budgetUsedFraction * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {budgetRemainingPct.toFixed(1)}% remaining — ~{privacyBudget.roundsRemaining} rounds before budget exhausted
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-zinc-400 mb-1 font-semibold">DP Guarantee</p>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed">{report.guarantee}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rényi DP details */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><h2 className="font-semibold text-white">Rényi DP Composition</h2></CardHeader>
            <CardContent>
              {budgetSeries.length === 0 ? (
                <p className="text-sm text-zinc-500">Run at least one round to compute composition.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-1">Total ε</div>
                    <div className="text-xl font-bold text-violet-400 font-mono">{privacyBudget.totalEpsilon.toFixed(4)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-1">Total δ</div>
                    <div className="text-xl font-bold text-indigo-400 font-mono">{privacyBudget.totalDelta.toExponential(0)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-1">Rounds Remaining</div>
                    <div className="text-xl font-bold text-white">{privacyBudget.roundsRemaining}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-1">Recommendation</div>
                    <Badge variant={riskBadgeVariant(privacyBudget.recommendation === 'stop' ? 'high' : privacyBudget.recommendation === 'slow-down' ? 'medium' : 'low')}>
                      {privacyBudget.recommendation}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Recommendations</h2>
                <span className={`text-sm font-semibold ${riskColor(report.dataExposureRisk)}`}>
                  Data exposure: {report.dataExposureRisk}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {report.recommendations.length === 0 ? (
                <p className="text-sm text-emerald-400">No issues detected — training within safe parameters.</p>
              ) : (
                <ul className="space-y-2">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-yellow-400 mt-0.5">⚠</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── History Tab ────────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Accuracy chart */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <h2 className="font-semibold text-white">Accuracy over Rounds</h2>
              <p className="text-xs text-zinc-500">x-axis: round number — y-axis: accuracy (0–100%)</p>
            </CardHeader>
            <CardContent>
              {renderAccuracyChart()}
            </CardContent>
          </Card>

          {/* History table */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><h2 className="font-semibold text-white">Round Log</h2></CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-zinc-500">No rounds completed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-zinc-500 border-b border-white/10">
                        <th className="text-right py-2 pr-4">Round</th>
                        <th className="text-right py-2 pr-4">Participants</th>
                        <th className="text-right py-2 pr-4">Global Loss</th>
                        <th className="text-right py-2 pr-4">Accuracy</th>
                        <th className="text-right py-2 pr-4">ε Spent</th>
                        <th className="text-left py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...history].reverse().map(rec => (
                        <tr key={rec.round} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-4 text-right font-mono text-zinc-300">{rec.round}</td>
                          <td className="py-2 pr-4 text-right text-white">{rec.participants}</td>
                          <td className="py-2 pr-4 text-right font-mono text-zinc-300">{rec.globalLoss.toFixed(4)}</td>
                          <td className="py-2 pr-4 text-right font-mono text-violet-400">{(rec.accuracy * 100).toFixed(2)}%</td>
                          <td className="py-2 pr-4 text-right font-mono text-indigo-400">{rec.privacySpent.toFixed(4)}</td>
                          <td className="py-2 text-xs text-zinc-500">
                            {new Date(rec.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
