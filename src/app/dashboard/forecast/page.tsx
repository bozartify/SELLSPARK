'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  forecastRevenue, generateCohortAnalysis, analyzeFunnel,
  analyzePriceElasticity, forecastDemand, monteCarloRevenueSimulation,
  type TimeSeriesPoint,
} from '@/lib/platform/predictive-analytics';

// Generate 90 days of historical revenue data
function generateHistorical(): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  let base = 280;
  for (let i = 90; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    base = Math.max(50, base + (Math.random() - 0.45) * 40 + 3);
    points.push({ date: d.toISOString().slice(0, 10), value: Math.round(base) });
  }
  return points;
}

const HISTORICAL = generateHistorical();
const FORECAST = forecastRevenue(HISTORICAL, 30);
const COHORTS = generateCohortAnalysis();
const MONTE_CARLO = monteCarloRevenueSimulation(8500, 0.06, 0.15, 12, 500);
const PRICE_ANALYSIS = analyzePriceElasticity(197, 43, -1.5);
const DEMAND = forecastDemand('prod_01', 43, 200, 5);
const FUNNEL = analyzeFunnel([
  { name: 'Landing Page', visitors: 10000, converted: 10000, conversionRate: 1, avgTimeOnStep: 45 },
  { name: 'Product Page', visitors: 3200, converted: 3200, conversionRate: 0.32, avgTimeOnStep: 120 },
  { name: 'Add to Cart', visitors: 980, converted: 980, conversionRate: 0.306, avgTimeOnStep: 30 },
  { name: 'Checkout', visitors: 720, converted: 720, conversionRate: 0.735, avgTimeOnStep: 180 },
  { name: 'Payment', visitors: 420, converted: 420, conversionRate: 0.583, avgTimeOnStep: 90 },
  { name: 'Purchase', visitors: 380, converted: 380, conversionRate: 0.905, avgTimeOnStep: 0 },
], 197);

export default function ForecastPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'cohorts' | 'funnel' | 'pricing'>('revenue');

  const currentMRR = HISTORICAL.slice(-30).reduce((a, p) => a + p.value, 0);
  const forecastedMRR = FORECAST.forecast.reduce((a, p) => a + p.value, 0);
  const growth = ((forecastedMRR - currentMRR) / currentMRR * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Forecast</h1>
          <p className="text-sm text-gray-400 mt-1">Exponential smoothing · Monte Carlo · Cohort analysis · Price elasticity · Funnel optimizer</p>
        </div>
        <Badge className={`${FORECAST.trend === 'up' ? 'bg-green-600' : FORECAST.trend === 'down' ? 'bg-red-600' : 'bg-yellow-600'} text-white`}>
          Trend: {FORECAST.trend === 'up' ? '↑' : FORECAST.trend === 'down' ? '↓' : '→'} {FORECAST.trend}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current 30d Revenue', value: `$${currentMRR.toLocaleString()}`, color: 'text-white' },
          { label: 'Forecast 30d Revenue', value: `$${forecastedMRR.toLocaleString()}`, color: 'text-violet-400' },
          { label: 'Predicted Growth', value: `${growth}%`, color: Number(growth) > 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Forecast MAPE', value: `${FORECAST.mape.toFixed(1)}%`, color: 'text-yellow-400' },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['revenue', 'cohorts', 'funnel', 'pricing'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'pricing' ? '💰 Price Elasticity' : t}
          </button>
        ))}
      </div>

      {activeTab === 'revenue' && (
        <div className="space-y-4">
          {/* Simple text chart */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">30-Day Revenue Forecast with Confidence Interval</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {FORECAST.forecast.slice(0, 14).map((point, i) => {
                  const low = FORECAST.confidenceLower[i]?.value ?? 0;
                  const high = FORECAST.confidenceUpper[i]?.value ?? 0;
                  const maxVal = Math.max(...FORECAST.forecast.map(p => p.value)) * 1.1;
                  const barWidth = (point.value / maxVal * 100).toFixed(0);
                  return (
                    <div key={point.date} className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500 w-20">{point.date.slice(5)}</span>
                      <div className="flex-1 relative h-5 bg-white/5 rounded overflow-hidden">
                        <div className="absolute inset-y-0 bg-violet-500/20 rounded" style={{ left: `${(low / maxVal * 100).toFixed(0)}%`, width: `${((high - low) / maxVal * 100).toFixed(0)}%` }} />
                        <div className="absolute inset-y-1 bg-violet-500 rounded" style={{ width: `${barWidth}%` }} />
                      </div>
                      <span className="text-white w-16 text-right tabular-nums">${point.value.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500 inline-block" /> Forecast</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500/20 inline-block" /> 90% Confidence</span>
              </div>
            </CardContent>
          </Card>

          {/* Monte Carlo */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Monte Carlo 12-Month Revenue Simulation (500 runs)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'P10 (Bear case)', value: `$${(MONTE_CARLO.p10.at(-1) ?? 0).toLocaleString()}`, color: 'text-red-400' },
                  { label: 'P50 (Base case)', value: `$${(MONTE_CARLO.p50.at(-1) ?? 0).toLocaleString()}`, color: 'text-yellow-400' },
                  { label: 'P90 (Bull case)', value: `$${(MONTE_CARLO.p90.at(-1) ?? 0).toLocaleString()}`, color: 'text-green-400' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-gray-500 text-xs">{s.label}</p>
                    <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
                    <p className="text-gray-500 text-xs">12-month MRR</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demand Forecast */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Product Demand Forecast</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Forecasted Units (30d)</span>
                <span className="text-white">{DEMAND.forecastedUnits} <span className="text-gray-500 text-xs">(CI: {DEMAND.confidenceInterval[0]}–{DEMAND.confidenceInterval[1]})</span></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Forecasted Revenue</span>
                <span className="text-green-400">${DEMAND.forecastedRevenue.toLocaleString()}</span>
              </div>
              {DEMAND.restockDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Suggested Restock Date</span>
                  <span className="text-yellow-400">{DEMAND.restockDate}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'cohorts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: 'Avg 30d Retention', v: `${COHORTS.avgRetentionAt30d}%` },
              { l: 'Avg 90d Retention', v: `${COHORTS.avgRetentionAt90d}%` },
              { l: 'Avg 12m LTV', v: `$${COHORTS.avgLTVAt12m.toLocaleString()}` },
            ].map(s => (
              <Card key={s.l} className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-400 text-xs">{s.l}</p>
                  <p className="text-xl font-bold text-violet-400 mt-1">{s.v}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-white/5 border-white/10 overflow-x-auto">
            <CardHeader><CardTitle className="text-white text-sm">Cohort Retention Table</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 py-2 pr-4">Cohort</th>
                    <th className="text-right text-gray-400 py-2 px-2">Size</th>
                    {Array.from({ length: 6 }, (_, i) => (
                      <th key={i} className="text-right text-gray-400 py-2 px-2">M+{i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COHORTS.cohorts.map(c => (
                    <tr key={c.cohortMonth} className="border-b border-white/5">
                      <td className="text-gray-300 py-2 pr-4">{c.cohortMonth}</td>
                      <td className="text-right text-white py-2 px-2">{c.size}</td>
                      {c.retention.map((r, i) => (
                        <td key={i} className="text-right py-2 px-2"
                          style={{ color: r > 50 ? '#4ade80' : r > 20 ? '#facc15' : '#f87171' }}>
                          {r}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'funnel' && (
        <div className="space-y-3">
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-red-400 font-medium">⚠ Biggest Drop-Off: {FUNNEL.biggestDropOff}</p>
                <p className="text-gray-400 text-sm mt-1">Fixing this could unlock <span className="text-green-400">${FUNNEL.optimizationPotential.toLocaleString()}/mo</span> in additional revenue</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Overall Conversion</p>
                <p className="text-white text-2xl font-bold">{(FUNNEL.overallConversion * 100).toFixed(2)}%</p>
              </div>
            </CardContent>
          </Card>
          {FUNNEL.steps.map((step, i) => (
            <Card key={step.name} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">{i + 1}.</span>
                    <span className="text-white font-medium">{step.name}</span>
                    {step.dropOff > 50 && <Badge className="bg-red-600/20 text-red-400 text-xs">High drop-off</Badge>}
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{step.visitors.toLocaleString()}</span>
                    <span className="text-gray-500 text-xs ml-1">visitors</span>
                  </div>
                </div>
                {i > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${(step.conversionRate * 100).toFixed(0)}%` }} />
                    </div>
                    <span className={`${step.dropOff > 50 ? 'text-red-400' : step.dropOff > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {step.dropOff}% drop-off
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: 'Current Price', v: `$${PRICE_ANALYSIS.currentPrice}`, color: 'text-white' },
              { l: 'Optimal Price', v: `$${PRICE_ANALYSIS.optimalPrice}`, color: 'text-violet-400' },
              { l: 'Revenue Uplift', v: `$${PRICE_ANALYSIS.uplift.toLocaleString()}`, color: PRICE_ANALYSIS.uplift > 0 ? 'text-green-400' : 'text-red-400' },
            ].map(s => (
              <Card key={s.l} className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-400 text-xs">{s.l}</p>
                  <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.v}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Revenue vs Price Curve (elasticity: {PRICE_ANALYSIS.elasticityCoefficient})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {PRICE_ANALYSIS.pricePoints.filter((_, i) => i % 2 === 0).map(pp => {
                  const maxRevenue = Math.max(...PRICE_ANALYSIS.pricePoints.map(p => p.revenue));
                  const barWidth = (pp.revenue / maxRevenue * 100).toFixed(0);
                  const isOptimal = pp.price === PRICE_ANALYSIS.optimalPrice;
                  return (
                    <div key={pp.price} className="flex items-center gap-3 text-xs">
                      <span className={`w-12 tabular-nums ${isOptimal ? 'text-violet-400 font-bold' : 'text-gray-500'}`}>${pp.price}</span>
                      <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                        <div className={`h-full rounded transition-all ${isOptimal ? 'bg-violet-500' : 'bg-white/20'}`} style={{ width: `${barWidth}%` }} />
                      </div>
                      <span className={`w-20 text-right tabular-nums ${isOptimal ? 'text-violet-300 font-bold' : 'text-gray-400'}`}>${pp.revenue.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
