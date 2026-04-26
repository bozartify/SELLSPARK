'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  type ARProduct,
  type ARSession,
  type SpatialAnchor,
  type HologramStream,
  createARSession,
  generateARDeepLink,
  computeARConversionLift,
  createSpatialAnchor,
  estimateHologramBandwidth,
  createHologramStream,
  getStreamHealth,
} from '@/lib/platform/future-tech';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'ar' | 'spatial' | 'bci' | 'hologram';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Array<{ label: string; price: number; product: ARProduct }> = [
  {
    label: 'Masterclass',
    price: 297,
    product: {
      productId: 'prod_masterclass',
      modelUrl: 'https://models.sellspark.io/masterclass.glb',
      scale: 1.0,
      position: { x: 0, y: 0, z: 0 },
      lighting: 'studio',
      supportedPlatforms: ['webxr', 'arkit', 'arcore'],
    },
  },
  {
    label: 'Template Pack',
    price: 97,
    product: {
      productId: 'prod_templates',
      modelUrl: 'https://models.sellspark.io/template-pack.glb',
      scale: 0.8,
      position: { x: 0, y: 0, z: 0 },
      lighting: 'ambient',
      supportedPlatforms: ['webxr', 'arcore'],
    },
  },
  {
    label: 'Coaching Session',
    price: 500,
    product: {
      productId: 'prod_coaching',
      modelUrl: 'https://models.sellspark.io/coaching.glb',
      scale: 1.2,
      position: { x: 0, y: 0, z: 0 },
      lighting: 'natural',
      supportedPlatforms: ['webxr', 'arkit'],
    },
  },
  {
    label: 'Course Bundle',
    price: 997,
    product: {
      productId: 'prod_bundle',
      modelUrl: 'https://models.sellspark.io/bundle.glb',
      scale: 1.5,
      position: { x: 0, y: 0, z: 0 },
      lighting: 'studio',
      supportedPlatforms: ['webxr', 'arkit', 'arcore'],
    },
  },
];

const MOCK_SESSIONS: ARSession[] = [
  { sessionId: 'ar_1', productId: 'prod_masterclass', deviceType: 'ios', startedAt: Date.now() - 3600000, duration: 45, converted: true },
  { sessionId: 'ar_2', productId: 'prod_masterclass', deviceType: 'android', startedAt: Date.now() - 7200000, duration: 30, converted: false },
  { sessionId: 'ar_3', productId: 'prod_masterclass', deviceType: 'desktop', startedAt: Date.now() - 1800000, duration: 60, converted: true },
  { sessionId: 'ar_4', productId: 'prod_masterclass', deviceType: 'ios', startedAt: Date.now() - 900000, duration: 20, converted: true },
];

const BCI_COMMAND_MAP: Array<{ intent: string; action: string }> = [
  { intent: 'think-left', action: 'Prev' },
  { intent: 'think-right', action: 'Next' },
  { intent: 'blink', action: 'Select' },
  { intent: 'focus', action: 'Confirm' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'ar', label: 'AR Preview' },
    { id: 'spatial', label: 'Spatial' },
    { id: 'bci', label: 'BCI' },
    { id: 'hologram', label: 'Hologram' },
  ];
  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            active === t.id
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── AR Tab ───────────────────────────────────────────────────────────────────

function ARTab() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [arActive, setArActive] = useState(false);
  const [session, setSession] = useState<ARSession | null>(null);

  const selected = selectedIdx !== null ? MOCK_PRODUCTS[selectedIdx] : null;

  const lift = useMemo(() => computeARConversionLift(MOCK_SESSIONS), []);
  const converted = MOCK_SESSIONS.filter((s) => s.converted).length;

  function handleLaunch() {
    if (!selected) return;
    const s = createARSession(selected.product);
    setSession(s);
    setArActive(true);
  }

  const deepLink = selected
    ? generateARDeepLink(selected.product, 'webxr')
    : null;

  return (
    <div className="space-y-6">
      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_PRODUCTS.map((p, i) => (
          <Card
            key={p.product.productId}
            glass
            hover
            onClick={() => { setSelectedIdx(i); setArActive(false); setSession(null); }}
            className={`cursor-pointer transition-all duration-200 ${
              selectedIdx === i
                ? 'border-violet-500/70 ring-2 ring-violet-500/40'
                : 'border-white/10 hover:border-violet-400/40'
            }`}
          >
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="h-16 rounded-xl bg-gradient-to-br from-violet-900/60 to-indigo-900/60 flex items-center justify-center text-2xl">
                {['🎓', '📦', '🎙️', '🚀'][i]}
              </div>
              <p className="text-sm font-semibold text-white">{p.label}</p>
              <p className="text-violet-300 font-bold">${p.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Stats */}
          <Card glass className="border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">AR Session Stats — {selected.label}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold text-violet-300">{MOCK_SESSIONS.length}</p>
                <p className="text-xs text-gray-400 mt-1">Sessions</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-300">{converted}</p>
                <p className="text-xs text-gray-400 mt-1">Conversions</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <p className="text-2xl font-bold text-amber-300">+{lift.toFixed(1)}%</p>
                <p className="text-xs text-gray-400 mt-1">Lift</p>
              </div>
            </CardContent>
            <CardContent className="pt-0 space-y-3">
              <Button onClick={handleLaunch} className="w-full">
                Launch AR Preview
              </Button>
              {deepLink && (
                <p className="text-xs font-mono text-violet-300 bg-black/30 rounded-lg px-3 py-2 break-all border border-white/10">
                  {deepLink}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Simulated AR frame */}
          <Card glass className="border-white/10 flex flex-col">
            <CardHeader>
              <CardTitle className="text-white text-base">AR Frame</CardTitle>
              <CardDescription>{arActive ? 'Simulated WebXR session active' : 'Launch preview to activate'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center min-h-[180px]">
              {arActive && session ? (
                <div
                  style={{
                    perspective: '600px',
                    perspectiveOrigin: '50% 50%',
                  }}
                  className="w-36 h-36"
                >
                  <div
                    style={{
                      transform: 'rotateX(20deg) rotateY(35deg)',
                      transformStyle: 'preserve-3d',
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      animation: 'spin3d 6s linear infinite',
                    }}
                  >
                    {/* Front */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(139,92,246,0.35)', border: '1px solid rgba(167,139,250,0.6)', backdropFilter: 'blur(4px)', transform: 'translateZ(72px)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="text-violet-200 text-xs font-bold">{selected.label}</span>
                    </div>
                    {/* Back */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(129,140,248,0.4)', transform: 'translateZ(-72px) rotateY(180deg)', borderRadius: 8 }} />
                    {/* Left */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '144px', background: 'rgba(109,40,217,0.25)', border: '1px solid rgba(139,92,246,0.3)', transform: 'rotateY(-90deg) translateZ(72px)', borderRadius: 8 }} />
                    {/* Right */}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '144px', background: 'rgba(79,70,229,0.25)', border: '1px solid rgba(99,102,241,0.3)', transform: 'rotateY(90deg) translateZ(72px)', borderRadius: 8 }} />
                    {/* Top */}
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '144px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(139,92,246,0.3)', transform: 'rotateX(90deg) translateZ(72px)', borderRadius: 8 }} />
                    {/* Bottom */}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '144px', background: 'rgba(67,56,202,0.2)', border: '1px solid rgba(99,102,241,0.25)', transform: 'rotateX(-90deg) translateZ(72px)', borderRadius: 8 }} />
                  </div>
                  <style>{`@keyframes spin3d { from { transform: rotateX(20deg) rotateY(0deg); } to { transform: rotateX(20deg) rotateY(360deg); } }`}</style>
                </div>
              ) : (
                <div className="text-gray-600 text-sm">No active session</div>
              )}
            </CardContent>
            {session && (
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500 font-mono">Session: {session.sessionId}</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Spatial Tab ──────────────────────────────────────────────────────────────

function SpatialTab() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);
  const [content, setContent] = useState('');
  const [anchors, setAnchors] = useState<SpatialAnchor[]>([]);

  function handlePlace() {
    if (!content.trim()) return;
    const anchor = createSpatialAnchor(content.trim(), { x, y, z });
    setAnchors((prev) => [...prev, anchor]);
    setContent('');
  }

  function handleDelete(id: string) {
    setAnchors((prev) => prev.filter((a) => a.anchorId !== id));
  }

  // Normalize world coords (-100..100) to SVG space (10..190)
  function toSVG(val: number): number {
    return 10 + ((val + 100) / 200) * 180;
  }

  return (
    <div className="space-y-6">
      <Card glass className="border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Place Spatial Anchor</CardTitle>
          <CardDescription>Set world coordinates and content label</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {(['X', 'Y', 'Z'] as const).map((axis) => (
              <div key={axis} className="space-y-1">
                <label className="text-xs text-gray-400 font-medium">{axis} Axis</label>
                <input
                  type="number"
                  min={-100}
                  max={100}
                  value={axis === 'X' ? x : axis === 'Y' ? y : z}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (axis === 'X') setX(v);
                    else if (axis === 'Y') setY(v);
                    else setZ(v);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40"
                />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium">Content</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Anchor label or content..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40"
            />
          </div>
          <Button onClick={handlePlace} disabled={!content.trim()}>
            Place Anchor
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top-down SVG map */}
        <Card glass className="border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Top-Down Map (X/Z plane)</CardTitle>
          </CardHeader>
          <CardContent>
            <svg
              width={200}
              height={200}
              className="rounded-xl bg-black/40 border border-white/10"
              style={{ display: 'block' }}
            >
              {/* Grid lines */}
              {[50, 100, 150].map((v) => (
                <g key={v}>
                  <line x1={v} y1={0} x2={v} y2={200} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                  <line x1={0} y1={v} x2={200} y2={v} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                </g>
              ))}
              {/* Center crosshair */}
              <line x1={100} y1={0} x2={100} y2={200} stroke="rgba(139,92,246,0.2)" strokeWidth={1} />
              <line x1={0} y1={100} x2={200} y2={100} stroke="rgba(139,92,246,0.2)" strokeWidth={1} />
              {/* Anchors */}
              {anchors.map((a) => (
                <g key={a.anchorId}>
                  <circle
                    cx={toSVG(a.worldPosition.x)}
                    cy={toSVG(a.worldPosition.z)}
                    r={6}
                    fill="rgba(139,92,246,0.8)"
                    stroke="rgba(167,139,250,0.9)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={toSVG(a.worldPosition.x) + 9}
                    y={toSVG(a.worldPosition.z) + 4}
                    fontSize={9}
                    fill="rgba(196,181,253,0.9)"
                    fontFamily="monospace"
                  >
                    {a.content.slice(0, 10)}
                  </text>
                </g>
              ))}
              {/* Origin dot */}
              <circle cx={100} cy={100} r={3} fill="rgba(255,255,255,0.3)" />
            </svg>
          </CardContent>
        </Card>

        {/* Anchor list */}
        <Card glass className="border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Anchors ({anchors.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {anchors.length === 0 && (
              <p className="text-gray-500 text-sm">No anchors placed yet.</p>
            )}
            {anchors.map((a) => (
              <div
                key={a.anchorId}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{a.content}</p>
                  <p className="text-xs font-mono text-gray-400">
                    ({a.worldPosition.x}, {a.worldPosition.y}, {a.worldPosition.z})
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.anchorId)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none"
                  aria-label="Delete anchor"
                >
                  ×
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── BCI Tab ──────────────────────────────────────────────────────────────────

function BCITab() {
  const [amplitudes, setAmplitudes] = useState([0, 0, 0, 0]);
  const [calibrating, setCalibrating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleCalibrate() {
    setCalibrating(true);
    setAccuracy(null);

    intervalRef.current = setInterval(() => {
      setAmplitudes([
        Math.random() * 80 + 10,
        Math.random() * 70 + 15,
        Math.random() * 90 + 5,
        Math.random() * 60 + 20,
      ]);
    }, 100);

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCalibrating(false);
      setAmplitudes([0, 0, 0, 0]);
      setAccuracy(0.87);
    }, 3000);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const channels = ['Fp1', 'Fp2', 'O1', 'O2'];
  const maxAmp = 100;

  return (
    <div className="space-y-6">
      <Card glass className="border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">BCI Calibration</CardTitle>
          <CardDescription>Simulated EEG signal calibration across 4 channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleCalibrate} disabled={calibrating} loading={calibrating}>
            {calibrating ? 'Calibrating…' : 'Start Calibration'}
          </Button>

          {/* Signal bars */}
          <div className="space-y-3">
            {channels.map((ch, i) => (
              <div key={ch} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 w-8">{ch}</span>
                <div className="flex-1 h-5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all duration-100"
                    style={{ width: `${(amplitudes[i] / maxAmp) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-violet-300 w-14 text-right">
                  {amplitudes[i].toFixed(1)} µV
                </span>
              </div>
            ))}
          </div>

          {/* Accuracy meter */}
          {accuracy !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Calibration Accuracy</span>
                <span className="text-emerald-300 font-bold">{(accuracy * 100).toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${accuracy * 100}%` }}
                />
              </div>
              <Badge variant="success" className="mt-1">Calibrated</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command map */}
      <Card glass className="border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Command Map</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium pb-2">Intent</th>
                <th className="text-left text-gray-400 font-medium pb-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {BCI_COMMAND_MAP.map((row) => (
                <tr key={row.intent}>
                  <td className="py-2 font-mono text-violet-300">{row.intent}</td>
                  <td className="py-2 text-white font-medium">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Hologram Tab ─────────────────────────────────────────────────────────────

type Resolution = '4K' | '8K' | '16K';

function HologramTab() {
  const [resolution, setResolution] = useState<Resolution>('4K');
  const [fps, setFps] = useState<number>(30);
  const [stream, setStream] = useState<HologramStream | null>(null);

  const bandwidth = useMemo(() => estimateHologramBandwidth(resolution, fps), [resolution, fps]);

  function handleStart() {
    const s = createHologramStream({
      sourceDevice: 'SellSpark-Holo-Rig-v2',
      codec: resolution === '16K' ? 'volumetric-h266' : 'point-cloud-draco',
      bitrateMbps: bandwidth,
      fps,
    });
    // Simulate some initial viewers
    s.viewers = Math.floor(Math.random() * 50) + 1;
    setStream(s);
  }

  const health = stream ? getStreamHealth(stream) : null;
  const healthVariant: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
    excellent: 'success',
    good: 'default',
    degraded: 'warning',
    failed: 'destructive',
  };

  return (
    <div className="space-y-6">
      <Card glass className="border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Hologram Stream Config</CardTitle>
          <CardDescription>Configure resolution and frame rate for volumetric streaming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as Resolution)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/60 appearance-none cursor-pointer"
              >
                {(['4K', '8K', '16K'] as Resolution[]).map((r) => (
                  <option key={r} value={r} className="bg-gray-900">{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Frame Rate</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/60 appearance-none cursor-pointer"
              >
                {[24, 30, 60, 120].map((f) => (
                  <option key={f} value={f} className="bg-gray-900">{f} fps</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Estimated Bandwidth</span>
            <span className="text-violet-300 font-bold font-mono">{bandwidth} Mbps</span>
          </div>

          <Button onClick={handleStart}>Start Stream</Button>
        </CardContent>
      </Card>

      {stream && health && (
        <Card glass className="border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Live Stream</CardTitle>
              <Badge variant={healthVariant[health] ?? 'default'}>{health}</Badge>
            </div>
            <CardDescription className="font-mono text-xs">{stream.streamId}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xl font-bold text-violet-300">{stream.viewers}</p>
              <p className="text-xs text-gray-400 mt-1">Viewers</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xl font-bold text-indigo-300">{stream.latencyMs.toFixed(0)}ms</p>
              <p className="text-xs text-gray-400 mt-1">Latency</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xl font-bold text-cyan-300">{stream.bitrateMbps}</p>
              <p className="text-xs text-gray-400 mt-1">Mbps</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xs font-bold text-teal-300 font-mono leading-tight mt-1">{stream.codec}</p>
              <p className="text-xs text-gray-400 mt-1">Codec</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FutureTechPage() {
  const [tab, setTab] = useState<Tab>('ar');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-purple-600/8 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Future Tech Lab</h1>
          <p className="text-gray-400 mt-1">AR · Spatial Computing · BCI · Holographic Streaming</p>
        </div>

        {/* Tabs */}
        <TabBar active={tab} onChange={setTab} />

        {/* Tab content */}
        <div>
          {tab === 'ar' && <ARTab />}
          {tab === 'spatial' && <SpatialTab />}
          {tab === 'bci' && <BCITab />}
          {tab === 'hologram' && <HologramTab />}
        </div>
      </div>
    </div>
  );
}
