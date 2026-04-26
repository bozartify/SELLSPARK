'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createDigitalTwin, simulateMonths, runScenario, buildAudienceAgents,
  buildCompetitorAgents, generateChaosEvents, applyChaosEvent, resilienceScore, summarizeTwin,
  type TwinState, type ScenarioInput,
} from '@/lib/platform/digital-twin';

const INITIAL_TWIN = createDigitalTwin('creator_demo', {
  mrr: 8400, subscribers: 3200, growthRate: 0.09, churnRate: 0.035, nps: 58,
});

const PRESET_SCENARIOS: ScenarioInput[] = [
  { name: 'Price Increase 30%', priceMultiplier: 1.3 },
  { name: 'Viral Launch Event', launchEvent: true, growthBoost: 0.05 },
  { name: 'New $497 Flagship Course', newProduct: { name: 'Flagship Course', price: 497, estimatedConversion: 0.018 } },
  { name: 'Double Content Cadence', contentFrequency: 2, growthBoost: 0.02 },
  { name: 'Churn Rescue Campaign', churnReduction: 0.35, growthBoost: 0.01 },
];

export default function TwinPage() {
  const [twin] = useState<TwinState>(INITIAL_TWIN);
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'audience' | 'chaos'>('overview');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioInput>(PRESET_SCENARIOS[0]);
  const [scenarioResult, setScenarioResult] = useState<ReturnType<typeof runScenario> | null>(null);
  const [activeChaos, setActiveChaos] = useState<string | null>(null);

  const trajectory = simulateMonths(twin, 12);
  const chaosEvents = generateChaosEvents();
  const audienceAgents = buildAudienceAgents(twin);
  const competitors = buildCompetitorAgents();
  const resilience = resilienceScore(twin, chaosEvents);
  const twinSummary = summarizeTwin(twin);

  const healthColor = (h: number) => h > 75 ? 'text-green-400' : h > 50 ? 'text-yellow-400' : 'text-red-400';
  const riskBadge = (r: string) =>
    r === 'low' ? 'bg-green-500/20 text-green-300' :
    r === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
    r === 'high' ? 'bg-orange-500/20 text-orange-300' :
    'bg-red-500/20 text-red-300';
  const recColor = (r: string) =>
    r === 'strongly-proceed' ? 'text-green-400' :
    r === 'proceed' ? 'text-blue-400' :
    r === 'caution' ? 'text-yellow-400' : 'text-red-400';

  const maxMRR = Math.max(...trajectory.map(s => s.mrr));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Creator Digital Twin</h1>
          <p className="text-sm text-gray-400 mt-1">Live business simulation · What-if scenarios · Audience agents · Chaos engineering</p>
        </div>
        <div className="flex gap-2">
          <Badge className={riskBadge(twin.riskLevel)}>Risk: {twin.riskLevel.toUpperCase()}</Badge>
          <Badge className="bg-violet-600 text-white">Health {twin.healthScore}/100</Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: `$${twin.mrr.toLocaleString()}`, sub: `ARR $${twin.arr.toLocaleString()}` },
          { label: 'Subscribers', value: twin.subscribers.toLocaleString(), sub: `${twin.activeSubscribers.toLocaleString()} active` },
          { label: 'Growth / Churn', value: `${(twin.growthRate*100).toFixed(1)}% / ${(twin.churnRate*100).toFixed(1)}%`, sub: 'monthly' },
          { label: 'Resilience Score', value: resilience.toFixed(0), sub: 'vs 6 chaos events' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{kpi.label}</p>
              <p className="text-white text-xl font-bold mt-1">{kpi.value}</p>
              <p className="text-gray-500 text-xs">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['overview', 'scenarios', 'audience', 'chaos'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'overview' ? '📡 Overview' : t === 'scenarios' ? '🔮 Scenarios' : t === 'audience' ? '👥 Audience Agents' : '💥 Chaos'}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* 12-month MRR forecast chart */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">12-Month MRR Forecast (Twin Simulation)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40">
                {trajectory.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${(s.mrr / maxMRR) * 130}px`,
                        background: i === 0 ? 'rgb(139 92 246)' : 'linear-gradient(to top, rgb(79 70 229 / 0.6), rgb(139 92 246 / 0.4))',
                      }}
                    />
                    {i % 3 === 0 && <span className="text-gray-500 text-xs">M{i}</span>}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Now: ${twin.mrr.toLocaleString()}</span>
                <span>Month 12: ${trajectory[12].mrr.toLocaleString()}</span>
                <span>+{((trajectory[12].mrr / twin.mrr - 1) * 100).toFixed(0)}% growth</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Twin summary */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">Twin State Summary</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {twinSummary.map((line, i) => (
                  <p key={i} className={`text-xs ${i === 0 ? 'text-white font-medium' : line.startsWith('  •') ? 'text-gray-400 font-mono' : 'text-gray-300'}`}>{line}</p>
                ))}
              </CardContent>
            </Card>

            {/* Competitors */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">Competitive Landscape</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {competitors.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white font-medium w-28">{c.name}</span>
                    <div className="flex-1 mx-2 h-1.5 bg-white/10 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.marketShare * 100}%` }} />
                    </div>
                    <span className="text-gray-400 w-16 text-right">{(c.marketShare * 100).toFixed(0)}% share</span>
                    <span className={`w-16 text-right ${c.growthRate > 0.08 ? 'text-red-400' : 'text-gray-400'}`}>+{(c.growthRate * 100).toFixed(0)}%/mo</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── SCENARIOS ─── */}
      {activeTab === 'scenarios' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Select Scenario</p>
            {PRESET_SCENARIOS.map(s => (
              <button key={s.name} onClick={() => setSelectedScenario(s)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selectedScenario.name === s.name ? 'border-violet-500/60 bg-violet-600/10 text-violet-300' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                {s.name}
              </button>
            ))}
            <Button onClick={() => setScenarioResult(runScenario(twin, selectedScenario))}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white">
              ▶ Run Simulation
            </Button>
          </div>

          {scenarioResult ? (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">{scenarioResult.scenario}</CardTitle>
                  <span className={`text-sm font-bold capitalize ${recColor(scenarioResult.recommendation)}`}>
                    {scenarioResult.recommendation.replace(/-/g, ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Revenue Delta 30d', value: `${scenarioResult.deltaRevenue30d >= 0 ? '+' : ''}$${Math.round(scenarioResult.deltaRevenue30d).toLocaleString()}` },
                    { label: 'Revenue Delta 90d', value: `${scenarioResult.deltaRevenue90d >= 0 ? '+' : ''}$${Math.round(scenarioResult.deltaRevenue90d).toLocaleString()}` },
                    { label: 'Revenue Delta 365d', value: `${scenarioResult.deltaRevenue365d >= 0 ? '+' : ''}$${Math.round(scenarioResult.deltaRevenue365d).toLocaleString()}` },
                    { label: 'New Subscribers 30d', value: `${scenarioResult.deltaSubscribers30d >= 0 ? '+' : ''}${scenarioResult.deltaSubscribers30d}` },
                    { label: 'Net NPV', value: `$${scenarioResult.netNPV.toLocaleString()}` },
                    { label: 'Risk-Adj Return', value: `$${scenarioResult.riskAdjustedReturn.toLocaleString()}` },
                  ].map(item => (
                    <div key={item.label} className="p-2 bg-white/5 rounded">
                      <p className="text-gray-500">{item.label}</p>
                      <p className={`font-bold mt-0.5 ${item.value.startsWith('+') ? 'text-green-400' : item.value.startsWith('-') ? 'text-red-400' : 'text-white'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {scenarioResult.keyInsights.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Key Insights</p>
                    {scenarioResult.keyInsights.map((ins, i) => (
                      <p key={i} className="text-gray-300 text-xs">• {ins}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm border border-white/10 rounded-xl">Select a scenario and run simulation</div>
          )}
        </div>
      )}

      {/* ─── AUDIENCE AGENTS ─── */}
      {activeTab === 'audience' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audienceAgents.map(agent => (
              <Card key={agent.segment} className="bg-white/5 border-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium">{agent.segment}</p>
                    <Badge className="bg-violet-600/20 text-violet-300">{agent.size.toLocaleString()}</Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-gray-400">LTV</span><span className="text-white">${agent.ltv}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Churn Risk</span><span className={agent.churnProbability > 0.15 ? 'text-red-400' : 'text-green-400'}>{(agent.churnProbability * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Conversion</span><span className="text-violet-300">{(agent.conversionProbability * 100).toFixed(0)}%</span></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs">Sensitivity</p>
                    {Object.entries(agent.sensitivity).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 w-16 capitalize">{key}</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${val * 100}%` }} />
                        </div>
                        <span className="text-gray-500 w-8 text-right">{(val * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── CHAOS ─── */}
      {activeTab === 'chaos' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-orange-300 font-medium text-sm">Chaos Engineering Mode</p>
              <p className="text-gray-400 text-xs">Test business resilience by simulating adverse events. Overall Resilience: <span className="text-orange-300 font-bold">{resilience.toFixed(0)}/100</span></p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chaosEvents.map(event => {
              const impacted = applyChaosEvent(twin, event);
              const isActive = activeChaos === event.type;
              return (
                <Card key={event.type} className={`border transition-all ${isActive ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm capitalize">{event.type.replace(/-/g, ' ')}</p>
                      <Badge className={event.severity === 'severe' ? 'bg-red-500/20 text-red-300' : event.severity === 'moderate' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'}>
                        {event.severity}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white">{event.durationDays} days</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Revenue Impact</span><span className={event.revenueImpact < 1 ? 'text-red-400' : 'text-green-400'}>{(event.revenueImpact * 100).toFixed(0)}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Subscriber Δ</span><span className={event.subscriberImpact < 0 ? 'text-red-400' : 'text-green-400'}>{event.subscriberImpact > 0 ? '+' : ''}{event.subscriberImpact}</span></div>
                    </div>
                    {isActive && (
                      <div className="p-2 bg-orange-500/10 rounded text-xs space-y-1">
                        <p className="text-orange-300 font-medium">Simulated Impact:</p>
                        <p className="text-gray-300">MRR: ${impacted.mrr.toLocaleString()} (was ${twin.mrr.toLocaleString()})</p>
                        <p className="text-gray-300">Subscribers: {impacted.subscribers.toLocaleString()}</p>
                        <p className={`font-medium ${healthColor(impacted.healthScore)}`}>Health: {impacted.healthScore}/100</p>
                      </div>
                    )}
                    <Button size="sm"
                      onClick={() => setActiveChaos(isActive ? null : event.type)}
                      className={`w-full text-xs ${isActive ? 'bg-orange-600/40 hover:bg-orange-600/60 text-orange-300' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}>
                      {isActive ? 'Hide Impact' : 'Simulate'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
