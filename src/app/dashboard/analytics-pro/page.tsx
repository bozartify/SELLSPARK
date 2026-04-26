'use client';

import { useState, useMemo } from 'react';
import {
  buildCohorts,
  computeRetentionMatrix,
  predictLTV,
  attributeRevenue,
  generateMockTouchpoints,
  buildFunnel,
  MOCK_FUNNELS,
  forecastRevenue,
  generateMockEventStream,
  CHANNELS,
  type AttributionModel,
  type FunnelStage,
} from '@/lib/platform/analytics-engine';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['cohorts', 'ltv', 'attribution', 'funnel', 'forecast'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  cohorts: 'Cohort Retention',
  ltv: 'LTV Predictor',
  attribution: 'Attribution',
  funnel: 'Funnel',
  forecast: 'Revenue Forecast',
};

const HISTORICAL_MRR = [4200, 5800, 7300, 8900, 10200, 12100, 13400, 15200, 16800, 18400, 20100, 22500];

const ATTRIBUTION_MODELS: { value: AttributionModel; label: string }[] = [
  { value: 'first-touch', label: 'First Touch' },
  { value: 'last-touch', label: 'Last Touch' },
  { value: 'linear', label: 'Linear' },
  { value: 'time-decay', label: 'Time Decay' },
  { value: 'data-driven', label: 'Data-Driven' },
];

// ─── Heat cell color ──────────────────────────────────────────────────────────

function retentionColor(pct: number): string {
  // 0% → transparent violet, 100% → violet-600 (#7c3aed)
  const alpha = pct / 100;
  return `rgba(124, 58, 237, ${alpha.toFixed(2)})`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CohortTab() {
  const cohorts = useMemo(() => buildCohorts(8), []);
  const matrix = useMemo(() => computeRetentionMatrix(cohorts), [cohorts]);
  const weeks = Array.from({ length: 13 }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Cohort Retention Matrix</h2>
        <p className="text-sm text-white/50">
          Percentage of subscribers retained per week since cohort start. Darker = higher retention.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-left text-white/50 font-medium w-28">Cohort</th>
              {weeks.map((w) => (
                <th key={w} className="px-2 py-2 text-center text-white/50 font-medium">
                  W{w}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-white/50 font-medium">Avg LTV</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, ri) => (
              <tr key={cohort.cohortId} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2 text-white/70 font-mono text-xs whitespace-nowrap">
                  {cohort.cohortMonth}
                  <span className="ml-1 text-white/30">({cohort.initialSize})</span>
                </td>
                {weeks.map((w) => {
                  const val = matrix[ri]?.[w] ?? 0;
                  return (
                    <td key={w} className="px-0.5 py-0.5">
                      <div
                        className="flex items-center justify-center rounded text-white font-semibold"
                        style={{
                          background: retentionColor(val),
                          minWidth: 36,
                          height: 28,
                          fontSize: 10,
                          color: val > 50 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {val}%
                      </div>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right text-violet-300 font-semibold">
                  ${cohort.avgLTV.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-xs text-white/40">
        <span>0%</span>
        <div
          className="flex-1 h-2 rounded-full"
          style={{
            background: 'linear-gradient(to right, rgba(124,58,237,0.05), rgba(124,58,237,1))',
          }}
        />
        <span>100%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function LTVTab() {
  const [mrr, setMrr] = useState(79);
  const [tenure, setTenure] = useState(6);
  const [engagement, setEngagement] = useState(65);
  const [products, setProducts] = useState(2);
  const [horizon, setHorizon] = useState<30 | 90 | 180 | 365>(365);

  const prediction = useMemo(
    () => predictLTV(mrr, tenure, engagement, products, horizon),
    [mrr, tenure, engagement, products, horizon]
  );

  const confidencePct = Math.round(prediction.confidence * 100);
  const confidenceColor =
    confidencePct >= 80
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : confidencePct >= 60
        ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
        : 'text-red-400 border-red-500/40 bg-red-500/10';

  const horizonOptions: (30 | 90 | 180 | 365)[] = [30, 90, 180, 365];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">LTV Predictor</h2>
        <p className="text-sm text-white/50">
          Adjust subscriber attributes to forecast lifetime value.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-5">
          <SliderField
            label="Monthly MRR"
            value={mrr}
            min={0}
            max={500}
            step={1}
            display={`$${mrr}`}
            onChange={setMrr}
          />
          <SliderField
            label="Tenure"
            value={tenure}
            min={0}
            max={36}
            step={1}
            display={`${tenure} mo`}
            onChange={setTenure}
          />
          <SliderField
            label="Engagement Score"
            value={engagement}
            min={0}
            max={100}
            step={1}
            display={`${engagement}/100`}
            onChange={setEngagement}
          />
          <SliderField
            label="Products Owned"
            value={products}
            min={0}
            max={10}
            step={1}
            display={`${products}`}
            onChange={setProducts}
          />

          {/* Horizon selector */}
          <div>
            <label className="block text-xs text-white/50 mb-2">Prediction Horizon</label>
            <div className="flex gap-2">
              {horizonOptions.map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                    horizon === h
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {h}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction card */}
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/60 font-medium">Predicted LTV</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${confidenceColor}`}
              >
                {confidencePct}% confidence
              </span>
            </div>
            <div className="text-5xl font-bold text-white tracking-tight mb-1">
              ${prediction.predictedLTV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-white/40 mb-6">over {horizon} days</div>

            <div className="space-y-1">
              {prediction.factors.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-white">
                ${(mrr * (1 / Math.max(0.02, 0.12 - tenure * 0.002))).toFixed(0)}
              </div>
              <div className="text-xs text-white/40">Uncapped LTV</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-emerald-400">
                {Math.round(1 / Math.max(0.02, 0.12 - tenure * 0.002))} mo
              </div>
              <div className="text-xs text-white/40">Predicted Lifetime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs text-white/50">{label}</label>
        <span className="text-xs font-semibold text-violet-300">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-violet-500 cursor-pointer"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AttributionTab() {
  const [model, setModel] = useState<AttributionModel>('linear');

  const touchpoints = useMemo(() => generateMockTouchpoints(), []);
  const attributed = useMemo(
    () => attributeRevenue(touchpoints, 1000, model),
    [touchpoints, model]
  );

  // Build per-channel weights for all 6 canonical channels
  const channelWeights = useMemo(() => {
    const map: Record<string, number> = {};
    CHANNELS.forEach((c) => (map[c] = 0));
    attributed.forEach((tp) => {
      if (map[tp.channel] !== undefined) map[tp.channel] += tp.weight;
    });
    return map;
  }, [attributed]);

  const maxWeight = Math.max(...Object.values(channelWeights), 0.01);

  const CHANNEL_COLORS = [
    '#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Attribution Modeling</h2>
        <p className="text-sm text-white/50">
          See how revenue credit shifts across channels by model.
        </p>
      </div>

      {/* Model radio */}
      <div className="flex flex-wrap gap-2">
        {ATTRIBUTION_MODELS.map((m) => (
          <button
            key={m.value}
            onClick={() => setModel(m.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              model === m.value
                ? 'bg-violet-600 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* SVG bar chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <svg viewBox={`0 0 600 260`} className="w-full" style={{ maxHeight: 280 }}>
          {CHANNELS.map((channel, i) => {
            const w = channelWeights[channel] ?? 0;
            const barWidth = (w / maxWeight) * 460;
            const y = i * 38 + 10;

            return (
              <g key={channel}>
                {/* Label */}
                <text x={0} y={y + 17} className="fill-white/60" fontSize={11} fontFamily="system-ui">
                  {channel}
                </text>
                {/* Bar bg */}
                <rect x={130} y={y + 4} width={460} height={22} rx={4} fill="rgba(255,255,255,0.04)" />
                {/* Bar fill */}
                <rect
                  x={130}
                  y={y + 4}
                  width={barWidth}
                  height={22}
                  rx={4}
                  fill={CHANNEL_COLORS[i]}
                  opacity={0.85}
                  style={{ transition: 'width 0.4s ease' }}
                />
                {/* Pct label */}
                <text
                  x={130 + barWidth + 6}
                  y={y + 19}
                  className="fill-white/70"
                  fontSize={10}
                  fontFamily="system-ui"
                >
                  {(w * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-white/30">
        Based on {touchpoints.length} touchpoints · Total attribution: $1,000
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FunnelTab() {
  const funnelNames = Object.keys(MOCK_FUNNELS);
  const [selected, setSelected] = useState(funnelNames[0]);

  const stages: FunnelStage[] = useMemo(
    () => buildFunnel(MOCK_FUNNELS[selected] ?? []),
    [selected]
  );

  const topUsers = stages[0]?.users ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Conversion Funnel</h2>
          <p className="text-sm text-white/50">Visualize drop-off at each stage.</p>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {funnelNames.map((name) => (
            <option key={name} value={name} className="bg-gray-900">
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-center gap-1">
        {stages.map((stage, i) => {
          const widthPct = (stage.users / topUsers) * 100;
          const isLast = i === stages.length - 1;

          return (
            <div key={stage.name} className="w-full flex flex-col items-center">
              {/* Funnel bar */}
              <div className="w-full flex justify-center">
                <div
                  className="relative rounded-lg transition-all"
                  style={{
                    width: `${widthPct}%`,
                    minWidth: 120,
                    background: `rgba(124, 58, 237, ${0.3 + (i / stages.length) * 0.5})`,
                    border: '1px solid rgba(124,58,237,0.4)',
                  }}
                >
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-white font-medium text-sm">{stage.name}</span>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">
                        {stage.users.toLocaleString()}
                      </div>
                      <div className="text-white/50 text-xs">
                        {stage.cumulativeConversion}% of total
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector + drop-off info */}
              {!isLast && (
                <div className="flex flex-col items-center my-1 text-center">
                  <div className="w-px h-4 bg-white/20" />
                  <div className="text-xs text-violet-300 font-semibold">
                    {stage.conversionRate}% continue
                  </div>
                  {stage.dropoffReasons.length > 0 && (
                    <div className="text-xs text-white/30 max-w-xs">
                      Drop-off: {stage.dropoffReasons.join(' · ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ForecastTab() {
  const forecastPoints = useMemo(() => forecastRevenue(HISTORICAL_MRR, 6), []);

  // Combine historical + forecast for chart
  const now = new Date();
  const historicalLabels = HISTORICAL_MRR.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - HISTORICAL_MRR.length + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const allMonths = [
    ...historicalLabels,
    ...forecastPoints.map((p) => p.month),
  ];
  const allValues = [
    ...HISTORICAL_MRR,
    ...forecastPoints.map((p) => p.predicted),
  ];
  const maxVal = Math.max(...allValues, ...forecastPoints.map((p) => p.upper));
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const W = 600;
  const H = 240;
  const PAD = { top: 20, right: 20, bottom: 30, left: 55 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const totalPoints = allMonths.length;
  const xOf = (i: number) => PAD.left + (i / (totalPoints - 1)) * innerW;
  const yOf = (v: number) => PAD.top + innerH - ((v - minVal) / range) * innerH;

  // Paths
  const histPath = HISTORICAL_MRR.map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(v)}`).join(' ');
  const forecastOffset = HISTORICAL_MRR.length - 1;
  const forecastPath = forecastPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(forecastOffset + i)},${yOf(p.predicted)}`)
    .join(' ');

  // CI band polygon
  const upperPoints = forecastPoints
    .map((p, i) => `${xOf(forecastOffset + i)},${yOf(p.upper)}`)
    .join(' ');
  const lowerPoints = [...forecastPoints]
    .reverse()
    .map((p, i) => `${xOf(forecastOffset + forecastPoints.length - 1 - i)},${yOf(p.lower)}`)
    .join(' ');
  const ciPolygon = `${upperPoints} ${lowerPoints}`;

  // Join line from last historical to first forecast
  const joinPath = `M${xOf(forecastOffset)},${yOf(HISTORICAL_MRR[forecastOffset])} L${xOf(forecastOffset)},${yOf(forecastPoints[0].predicted)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Revenue Forecast</h2>
          <p className="text-sm text-white/50">
            12-month historical MRR + 6-month linear regression forecast.
          </p>
        </div>
        <div className="flex gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-violet-400 inline-block rounded" />
            Historical
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-6 h-0.5 inline-block rounded"
              style={{ background: '#34d399' }}
            />
            Forecast
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-4 h-3 inline-block rounded opacity-40"
              style={{ background: '#34d399' }}
            />
            95% CI
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const v = minVal + frac * range;
            const y = yOf(v);
            return (
              <g key={frac}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.35)"
                  fontSize={9}
                  fontFamily="system-ui"
                >
                  ${(v / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Forecast divider */}
          <line
            x1={xOf(forecastOffset)}
            y1={PAD.top}
            x2={xOf(forecastOffset)}
            y2={H - PAD.bottom}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 3"
            strokeWidth={1}
          />
          <text
            x={xOf(forecastOffset) + 4}
            y={PAD.top + 10}
            fill="rgba(255,255,255,0.3)"
            fontSize={8}
            fontFamily="system-ui"
          >
            forecast →
          </text>

          {/* CI band */}
          <polygon points={ciPolygon} fill="rgba(52,211,153,0.12)" />

          {/* Historical line */}
          <path d={histPath} fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinejoin="round" />

          {/* Join */}
          <path d={joinPath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

          {/* Forecast line */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#34d399"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            strokeLinejoin="round"
          />

          {/* Historical dots */}
          {HISTORICAL_MRR.map((v, i) => (
            <circle key={i} cx={xOf(i)} cy={yOf(v)} r={3} fill="#7c3aed" />
          ))}

          {/* Forecast dots */}
          {forecastPoints.map((p, i) => (
            <circle key={i} cx={xOf(forecastOffset + i)} cy={yOf(p.predicted)} r={3} fill="#34d399" />
          ))}

          {/* X-axis labels — show every other month */}
          {allMonths.map((m, i) => {
            if (i % 2 !== 0) return null;
            const parts = m.split('-');
            const label = `${parts[1]}/${parts[0].slice(2)}`;
            return (
              <text
                key={m}
                x={xOf(i)}
                y={H - PAD.bottom + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.35)"
                fontSize={8.5}
                fontFamily="system-ui"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Forecast table */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {forecastPoints.map((p) => (
          <div
            key={p.month}
            className="rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <div className="text-xs text-white/40 mb-1">{p.month}</div>
            <div className="text-base font-bold text-white">${p.predicted.toLocaleString()}</div>
            <div className="text-xs text-white/30">
              ${p.lower.toLocaleString()} – ${p.upper.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-emerald-400">
              {Math.round(p.confidence * 100)}% conf.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsProPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cohorts');

  // Live event feed (static on load for SSR safety)
  const events = useMemo(() => generateMockEventStream(8), []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics Pro</h1>
          <p className="text-sm text-white/50 mt-0.5">
            Deep insights · Cohorts · LTV · Attribution · Funnels · Forecasting
          </p>
        </div>

        {/* Live event ticker */}
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 min-w-64">
          <div className="text-xs text-white/40 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live events (last hour)
          </div>
          <div className="space-y-0.5 max-h-20 overflow-hidden">
            {events.slice(0, 4).map((evt) => (
              <div key={evt.eventId} className="flex items-center gap-2 text-xs">
                <span className="text-violet-400 font-mono">{evt.type}</span>
                <span className="text-white/30 truncate">{evt.userId}</span>
                {'amount' in evt.properties && (
                  <span className="text-emerald-400 ml-auto">
                    ${(evt.properties.amount as number).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 min-h-96">
        {activeTab === 'cohorts' && <CohortTab />}
        {activeTab === 'ltv' && <LTVTab />}
        {activeTab === 'attribution' && <AttributionTab />}
        {activeTab === 'funnel' && <FunnelTab />}
        {activeTab === 'forecast' && <ForecastTab />}
      </div>
    </div>
  );
}
