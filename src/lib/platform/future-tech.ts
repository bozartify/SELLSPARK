/**
 * @module future-tech
 * @description SellSpark Future Technology Layer — AR/spatial computing, BCI,
 * holographic streaming, digital twin sync, and generative world assets.
 */

// ─── AR Product Preview ────────────────────────────────────────────────────────

export interface ARProduct {
  productId: string;
  modelUrl: string;
  scale: number;
  position: { x: number; y: number; z: number };
  lighting: 'natural' | 'studio' | 'ambient';
  supportedPlatforms: ('webxr' | 'arkit' | 'arcore')[];
}

export interface ARSession {
  sessionId: string;
  productId: string;
  deviceType: 'ios' | 'android' | 'headset' | 'desktop';
  startedAt: number;
  duration: number; // seconds
  converted: boolean;
}

export function createARSession(product: ARProduct): ARSession {
  return {
    sessionId: `ar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId: product.productId,
    deviceType: /iPhone|iPad/.test(navigator?.userAgent ?? '')
      ? 'ios'
      : /Android/.test(navigator?.userAgent ?? '')
      ? 'android'
      : 'desktop',
    startedAt: Date.now(),
    duration: 0,
    converted: false,
  };
}

export function generateARDeepLink(product: ARProduct, platform: 'webxr' | 'arkit' | 'arcore'): string {
  const base = encodeURIComponent(product.modelUrl);
  const scale = product.scale.toFixed(2);
  switch (platform) {
    case 'arkit':
      return `https://ar.sellspark.io/arkit?model=${base}&scale=${scale}&pid=${product.productId}`;
    case 'arcore':
      return `https://ar.sellspark.io/arcore?model=${base}&scale=${scale}&pid=${product.productId}`;
    default:
      return `https://ar.sellspark.io/webxr?model=${base}&scale=${scale}&pid=${product.productId}`;
  }
}

export function computeARConversionLift(sessions: ARSession[]): number {
  if (sessions.length === 0) return 0;
  const converted = sessions.filter((s) => s.converted).length;
  // Baseline assumed 2.3% (industry e-commerce average)
  const baseline = 0.023;
  const arRate = converted / sessions.length;
  return ((arRate - baseline) / baseline) * 100;
}

// ─── Spatial Computing ────────────────────────────────────────────────────────

export interface SpatialAnchor {
  anchorId: string;
  worldPosition: { x: number; y: number; z: number };
  content: string;
  persistUntil: number; // unix ms
}

export interface SpatialScene {
  sceneId: string;
  anchors: SpatialAnchor[];
  lightEstimate: number; // lux
  planeDetected: boolean;
}

export function createSpatialAnchor(
  content: string,
  pos: { x: number; y: number; z: number },
): SpatialAnchor {
  return {
    anchorId: `anchor_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    worldPosition: pos,
    content,
    persistUntil: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

export function buildSpatialScene(anchors: SpatialAnchor[]): SpatialScene {
  return {
    sceneId: `scene_${Date.now()}`,
    anchors,
    lightEstimate: 320 + Math.random() * 480,
    planeDetected: anchors.length > 0,
  };
}

export function generateSpatialManifest(scene: SpatialScene): string {
  return JSON.stringify(
    {
      version: '1.0',
      sceneId: scene.sceneId,
      generated: new Date().toISOString(),
      lightEstimate: Math.round(scene.lightEstimate),
      planeDetected: scene.planeDetected,
      anchors: scene.anchors.map((a) => ({
        id: a.anchorId,
        pos: a.worldPosition,
        content: a.content,
        expiresAt: new Date(a.persistUntil).toISOString(),
      })),
    },
    null,
    2,
  );
}

// ─── Neural Interface / BCI ───────────────────────────────────────────────────

export interface BCISignal {
  channel: string;
  frequency: number; // Hz
  amplitude: number; // µV
  timestamp: number;
}

export interface BCIProfile {
  userId: string;
  calibrated: boolean;
  commandMap: Record<string, string>;
  accuracy: number; // 0-1
}

const DEFAULT_COMMAND_MAP: Record<string, string> = {
  'think-left': 'prev',
  'think-right': 'next',
  blink: 'select',
  focus: 'confirm',
};

export function classifyBCIIntent(signals: BCISignal[]): { intent: string; confidence: number } {
  if (signals.length === 0) return { intent: 'idle', confidence: 0 };

  const avgAmplitude = signals.reduce((s, sig) => s + sig.amplitude, 0) / signals.length;
  const avgFreq = signals.reduce((s, sig) => s + sig.frequency, 0) / signals.length;

  // Heuristic frequency-band mapping
  if (avgFreq < 4) return { intent: 'idle', confidence: 0.55 };
  if (avgFreq < 8) return { intent: 'think-left', confidence: Math.min(0.95, avgAmplitude / 80) };
  if (avgFreq < 13) return { intent: 'focus', confidence: Math.min(0.95, avgAmplitude / 60) };
  if (avgFreq < 30) return { intent: 'think-right', confidence: Math.min(0.95, avgAmplitude / 70) };
  return { intent: 'blink', confidence: Math.min(0.99, avgAmplitude / 100) };
}

export function calibrateBCI(rawSignals: BCISignal[][]): BCIProfile {
  const totalSamples = rawSignals.reduce((s, ch) => s + ch.length, 0);
  const accuracy = Math.min(0.97, 0.6 + (totalSamples / 5000) * 0.37);
  return {
    userId: `user_${Math.random().toString(36).slice(2, 10)}`,
    calibrated: totalSamples >= 500,
    commandMap: DEFAULT_COMMAND_MAP,
    accuracy,
  };
}

// ─── Holographic Streaming ────────────────────────────────────────────────────

export interface HologramStream {
  streamId: string;
  sourceDevice: string;
  codec: 'volumetric-h266' | 'point-cloud-draco';
  bitrateMbps: number;
  fps: number;
  latencyMs: number;
  viewers: number;
}

export function estimateHologramBandwidth(resolution: '4K' | '8K' | '16K', fps: number): number {
  const baseMap: Record<string, number> = { '4K': 80, '8K': 280, '16K': 900 };
  const base = baseMap[resolution] ?? 80;
  // Scale linearly with fps relative to 30 fps baseline
  return parseFloat(((base * fps) / 30).toFixed(1));
}

export function createHologramStream(config: Omit<HologramStream, 'streamId' | 'latencyMs' | 'viewers'>): HologramStream {
  return {
    ...config,
    streamId: `holo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    latencyMs: config.codec === 'volumetric-h266' ? 45 + Math.random() * 20 : 25 + Math.random() * 15,
    viewers: 0,
  };
}

export function getStreamHealth(stream: HologramStream): 'excellent' | 'good' | 'degraded' | 'failed' {
  if (stream.latencyMs > 500 || stream.bitrateMbps === 0) return 'failed';
  if (stream.latencyMs > 200 || stream.bitrateMbps < stream.bitrateMbps * 0.4) return 'degraded';
  if (stream.latencyMs > 80) return 'good';
  return 'excellent';
}

// ─── Digital Twin Sync ────────────────────────────────────────────────────────

export interface TwinSyncEvent {
  eventId: string;
  twinId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
  source: 'physical' | 'virtual';
}

export function syncTwinState(events: TwinSyncEvent[]): Record<string, unknown> {
  // Last-write-wins per field; physical source wins on tie
  const resolved: Record<string, { value: unknown; ts: number; source: 'physical' | 'virtual' }> = {};

  for (const ev of events) {
    const existing = resolved[ev.field];
    if (
      !existing ||
      ev.timestamp > existing.ts ||
      (ev.timestamp === existing.ts && ev.source === 'physical')
    ) {
      resolved[ev.field] = { value: ev.newValue, ts: ev.timestamp, source: ev.source };
    }
  }

  return Object.fromEntries(Object.entries(resolved).map(([k, v]) => [k, v.value]));
}

export function detectTwinDivergence(
  physical: Record<string, unknown>,
  virtual: Record<string, unknown>,
): { divergent: boolean; fields: string[]; score: number } {
  const allFields = new Set([...Object.keys(physical), ...Object.keys(virtual)]);
  const divergentFields: string[] = [];

  for (const field of allFields) {
    const pv = physical[field];
    const vv = virtual[field];
    if (JSON.stringify(pv) !== JSON.stringify(vv)) divergentFields.push(field);
  }

  const score = allFields.size > 0 ? divergentFields.length / allFields.size : 0;
  return { divergent: divergentFields.length > 0, fields: divergentFields, score };
}

// ─── Generative World ─────────────────────────────────────────────────────────

export interface WorldAsset {
  assetId: string;
  type: 'terrain' | 'building' | 'avatar' | 'prop';
  generatedBy: string;
  seed: number;
  parameters: Record<string, unknown>;
}

export function generateWorldAsset(type: WorldAsset['type'], seed: number): WorldAsset {
  const paramsByType: Record<WorldAsset['type'], Record<string, unknown>> = {
    terrain: { heightScale: (seed % 100) / 10, biome: seed % 2 === 0 ? 'forest' : 'desert', erosion: 0.4 },
    building: { floors: 2 + (seed % 20), style: seed % 3 === 0 ? 'modern' : seed % 3 === 1 ? 'gothic' : 'brutalist' },
    avatar: { height: 1.6 + (seed % 40) / 100, style: seed % 2 === 0 ? 'realistic' : 'stylized', accessories: seed % 5 },
    prop: { category: ['furniture', 'vehicle', 'plant', 'tech'][seed % 4], worn: seed % 10 > 7 },
  };

  return {
    assetId: `asset_${type}_${seed}_${Date.now()}`,
    type,
    generatedBy: 'sellspark-genworld-v1',
    seed,
    parameters: paramsByType[type],
  };
}

export const WORLD_PRESETS: Array<{ name: string; description: string; assets: WorldAsset[] }> = [
  {
    name: 'Digital Marketplace',
    description: 'A neon-lit bazaar with floating product showcases',
    assets: [
      generateWorldAsset('terrain', 1001),
      generateWorldAsset('building', 1002),
      generateWorldAsset('prop', 1003),
    ],
  },
  {
    name: 'Creator Studio',
    description: 'Minimalist white-void studio with broadcast lighting rigs',
    assets: [
      generateWorldAsset('building', 2001),
      generateWorldAsset('prop', 2002),
      generateWorldAsset('avatar', 2003),
    ],
  },
  {
    name: 'Forest Retreat',
    description: 'Lush procedural forest with interactive product trees',
    assets: [
      generateWorldAsset('terrain', 3001),
      generateWorldAsset('prop', 3002),
      generateWorldAsset('avatar', 3003),
    ],
  },
  {
    name: 'Orbital Station',
    description: 'Zero-gravity commerce hub orbiting Earth',
    assets: [
      generateWorldAsset('building', 4001),
      generateWorldAsset('prop', 4002),
      generateWorldAsset('terrain', 4003),
    ],
  },
  {
    name: 'Ancient Agora',
    description: 'Reconstructed Greek marketplace reimagined for digital goods',
    assets: [
      generateWorldAsset('terrain', 5001),
      generateWorldAsset('building', 5002),
      generateWorldAsset('avatar', 5003),
    ],
  },
];
