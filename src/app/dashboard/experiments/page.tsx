'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createExperiment, bayesianAnalysis, updateThompsonBelief, calculateSampleSize,
  sequentialTest, cupedAdjust, type Experiment, type Variant,
} from '@/lib/platform/ab-testing-advanced';

const INITIAL_EXPERIMENT = createExperiment(
  'Checkout CTA Button Test',
  'Changing CTA from "Buy Now" to "Get Instant Access" will increase conversion by 15%',
  ['Control: "Buy Now"', 'Variant A: "Get Instant Access"', 'Variant B: "Start Today"'],
  'conversion',
  0.032,
  500,
);

// Seed with some data
const SEEDED_VARIANTS: Variant[] = [
  { ...INITIAL_EXPERIMENT.variants[0], stats: { impressions: 1840, conversions: 59, revenue: 11623, avgOrderValue: 197, conversionRate: 0.032, revenuePerVisitor: 6.31, uplift: 0, confidenceInterval: [0.024, 0.040] }, thompsonAlpha: 60, thompsonBeta: 1782 },
  { ...INITIAL_EXPERIMENT.variants[1], stats: { impressions: 1820, conversions: 74, revenue: 14578, avgOrderValue: 197, conversionRate: 0.041, revenuePerVisitor: 8.01, uplift: 28.1, confidenceInterval: [0.032, 0.050] }, thompsonAlpha: 75, thompsonBeta: 1747 },
  { ...INITIAL_EXPERIMENT.variants[2], stats: { impressions: 1830, conversions: 61, revenue: 12017, avgOrderValue: 197, conversionRate: 0.033, revenuePerVisitor: 6.57, uplift: 3.1, confidenceInterval: [0.025, 0.041] }, thompsonAlpha: 62, thompsonBeta: 1770 },
];

const SEEDED: Experiment = {
  ...INITIAL_EXPERIMENT,
  status: 'running',
  variants: SEEDED_VARIANTS,
  startedAt: Date.now() - 7 * 86_400_000,
};

export default function ExperimentsPage() {
  const [experiment, setExperiment] = useState<Experiment>(SEEDED);
  const [activeTab, setActiveTab] = useState<'overview' | 'bayesian' | 'sequential' | 'cuped'>('overview');

  const bayesian = bayesianAnalysis(experiment);
  const sampleSize = calculateSampleSize(0.032, 0.15, 0.05, 0.80, 500);

  const control = experiment.variants.find(v => v.isControl)!;
  const bestVariant = experiment.variants.reduce((a, b) =>
    b.stats.conversionRate > a.stats.conversionRate ? b : a
  );

  const seqTest = sequentialTest(
    { n: control.stats.impressions, conversions: control.stats.conversions },
    { n: bestVariant.stats.impressions, conversions: bestVariant.stats.conversions },
  );

  const cuped = cupedAdjust(
    experiment.variants.map(v => v.stats.conversionRate * 100),
    [3.1, 3.3, 3.0], // pre-experiment baselines
  );

  function simulateTick() {
    setExperiment(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        // Simulate ~3% base conversion for control, ~4.1% for variant A
        const trueRate = v.isControl ? 0.032 : v.id === 'var_1' ? 0.041 : 0.033;
        const converted = Math.random() < trueRate;
        return updateThompsonBelief(v, converted);
      }),
    }));
  }

  const totalImpressions = experiment.variants.reduce((a, v) => a + v.stats.impressions, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">A/B Experiments</h1>
          <p className="text-sm text-gray-400 mt-1">Thompson Sampling · Bayesian analysis · Sequential testing · CUPED variance reduction</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={simulateTick} size="sm" className="bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/30">
            Simulate +1 Click
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">+ New Experiment</Button>
        </div>
      </div>

      {/* Experiment Card */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-medium text-lg">{experiment.name}</p>
                <Badge className={`text-xs ${experiment.status === 'running' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>{experiment.status}</Badge>
              </div>
              <p className="text-gray-400 text-sm italic">"{experiment.hypothesis}"</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Day {experiment.startedAt ? Math.floor((Date.now() - experiment.startedAt) / 86_400_000) : 0} of {experiment.maxDurationDays}</span>
                <span>{totalImpressions.toLocaleString()} total impressions</span>
                <span>Min sample: {experiment.minSampleSize.toLocaleString()}</span>
              </div>
            </div>
            {bayesian.winner && (
              <Badge className="bg-green-600 text-white text-sm px-3 py-1">🏆 Winner Found</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['overview', 'bayesian', 'sequential', 'cuped'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'cuped' ? 'CUPED' : t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-3">
          {experiment.variants.map(v => (
            <Card key={v.id} className={`border ${v.id === bestVariant.id ? 'border-violet-500/50 bg-violet-900/10' : 'border-white/10 bg-white/5'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{v.name}</p>
                    {v.isControl && <Badge className="text-xs bg-gray-600 text-white">Control</Badge>}
                    {v.id === bestVariant.id && !v.isControl && <Badge className="text-xs bg-violet-600 text-white">Leading</Badge>}
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${v.id === bestVariant.id ? 'text-violet-400' : 'text-white'}`}>
                      {(v.stats.conversionRate * 100).toFixed(2)}%
                    </p>
                    <p className="text-gray-500 text-xs">conversion rate</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  {[
                    { l: 'Impressions', v2: v.stats.impressions.toLocaleString() },
                    { l: 'Conversions', v2: v.stats.conversions.toString() },
                    { l: 'Revenue', v2: `$${v.stats.revenue.toLocaleString()}` },
                    { l: 'RPV', v2: `$${v.stats.revenuePerVisitor.toFixed(2)}` },
                    { l: 'Uplift vs Control', v2: v.isControl ? '—' : `${v.stats.uplift > 0 ? '+' : ''}${v.stats.uplift.toFixed(1)}%` },
                  ].map(item => (
                    <div key={item.l}>
                      <p className="text-gray-500 text-xs">{item.l}</p>
                      <p className={`text-sm font-medium ${item.l === 'Uplift vs Control' && v.stats.uplift > 10 ? 'text-green-400' : 'text-white'}`}>{item.v2}</p>
                    </div>
                  ))}
                </div>
                {/* Thompson confidence bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Thompson confidence</span>
                    <span>{(bayesian.probabilityOfBeingBest[v.id] * 100).toFixed(1)}% chance of being best</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                      style={{ width: `${(bayesian.probabilityOfBeingBest[v.id] * 100).toFixed(1)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'bayesian' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Bayesian Recommendation</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-4xl ${bayesian.recommendedAction === 'stop-winner' ? '🏆' : bayesian.recommendedAction === 'stop-futile' ? '⏹️' : '▶️'}`} />
                <div>
                  <p className={`text-xl font-bold ${bayesian.recommendedAction === 'stop-winner' ? 'text-green-400' : bayesian.recommendedAction === 'stop-futile' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {bayesian.recommendedAction === 'stop-winner' ? 'Declare Winner' :
                     bayesian.recommendedAction === 'stop-futile' ? 'Stop (No Effect)' : 'Continue Running'}
                  </p>
                  {bayesian.winner && <p className="text-gray-400 text-sm">Winner: {experiment.variants.find(v => v.id === bayesian.winner)?.name}</p>}
                </div>
              </div>
              <div className="space-y-2">
                {experiment.variants.map(v => (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-40 truncate">{v.name}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full">
                      <div className="h-full rounded-full bg-violet-500 transition-all"
                        style={{ width: `${(bayesian.probabilityOfBeingBest[v.id] * 100).toFixed(0)}%` }} />
                    </div>
                    <span className="text-white text-sm tabular-nums w-12 text-right">{(bayesian.probabilityOfBeingBest[v.id] * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'sequential' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Sequential (Always-Valid) Test</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400 text-sm">Testing {control.name} vs {bestVariant.name}</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-gray-500 text-xs">p-Value</p>
                  <p className={`text-2xl font-bold ${seqTest.pValue < 0.05 ? 'text-green-400' : 'text-white'}`}>{seqTest.pValue.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Significant at α=0.05?</p>
                  <p className={`text-2xl font-bold ${seqTest.significant ? 'text-green-400' : 'text-red-400'}`}>{seqTest.significant ? 'YES' : 'NO'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Relative Effect</p>
                  <p className="text-2xl font-bold text-violet-400">{seqTest.effect > 0 ? '+' : ''}{seqTest.effect.toFixed(1)}%</p>
                </div>
              </div>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3">
                  <p className="text-gray-400 text-xs">Sample size needed: <span className="text-white">{sampleSize.required.toLocaleString()} per variant</span></p>
                  <p className="text-gray-400 text-xs">At current traffic: <span className="text-white">{sampleSize.atCurrentTraffic.days} days</span></p>
                  <p className="text-gray-400 text-xs">Power: {(sampleSize.power * 100).toFixed(0)}% · MDE: {(sampleSize.mde * 100).toFixed(0)}%</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'cuped' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">CUPED Variance Reduction</CardTitle>
              <p className="text-gray-400 text-xs mt-1">Controlled-experiment Using Pre-Experiment Data — reduces noise in estimates</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-2">Raw Conversion Rates (%)</p>
                  {experiment.variants.map((v, i) => (
                    <div key={v.id} className="flex justify-between text-sm py-1 border-b border-white/5">
                      <span className="text-gray-400">{v.name.slice(0, 20)}...</span>
                      <span className="text-white">{(v.stats.conversionRate * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">CUPED-Adjusted Rates (%)</p>
                  {experiment.variants.map((v, i) => (
                    <div key={v.id} className="flex justify-between text-sm py-1 border-b border-white/5">
                      <span className="text-gray-400">{v.name.slice(0, 20)}...</span>
                      <span className="text-violet-300">{cuped.adjusted[i].toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                <p className="text-green-400 font-medium">Variance Reduction: {cuped.varianceReduction}%</p>
                <p className="text-gray-400 text-xs mt-1">CUPED reduced measurement noise by {cuped.varianceReduction}%, equivalent to getting {cuped.varianceReduction}% more data for free.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
