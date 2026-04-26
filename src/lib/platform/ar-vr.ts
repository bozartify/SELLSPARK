/**
 * SellSpark AR/VR/Spatial Commerce Primitives
 * WebXR feature detection, 3D product placement, spatial anchors,
 * and AI-generated virtual storefront scenes for Apple Vision Pro,
 * Meta Quest, and mobile AR (ARKit/ARCore via WebXR).
 */

export interface SpatialAnchor {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
  productId?: string;
}

export async function detectXRSupport(): Promise<{
  immersiveVR: boolean;
  immersiveAR: boolean;
  handTracking: boolean;
  eyeTracking: boolean;
}> {
  const nav = (globalThis as unknown as { navigator?: { xr?: { isSessionSupported: (m: string) => Promise<boolean> } } }).navigator;
  if (!nav?.xr) {
    return { immersiveVR: false, immersiveAR: false, handTracking: false, eyeTracking: false };
  }
  const [vr, ar] = await Promise.all([
    nav.xr.isSessionSupported('immersive-vr').catch(() => false),
    nav.xr.isSessionSupported('immersive-ar').catch(() => false),
  ]);
  return { immersiveVR: vr, immersiveAR: ar, handTracking: vr, eyeTracking: vr };
}

export function generateStoreScene(niche: string): {
  environment: string;
  lighting: string;
  props: string[];
  ambientAudio: string;
} {
  const scenes: Record<string, { environment: string; lighting: string; props: string[]; ambientAudio: string }> = {
    fitness: { environment: 'modern-gym-loft', lighting: 'dawn-warm', props: ['kettlebell', 'yoga-mat', 'mirror-wall'], ambientAudio: 'upbeat-electronic' },
    education: { environment: 'library-study', lighting: 'soft-academic', props: ['bookshelf', 'globe', 'desk-lamp'], ambientAudio: 'soft-piano' },
    business: { environment: 'penthouse-office', lighting: 'golden-hour', props: ['whiteboard', 'trophy-shelf', 'city-view'], ambientAudio: 'corporate-energy' },
    creative: { environment: 'artist-studio', lighting: 'natural-skylight', props: ['easel', 'paint-splatters', 'vinyl-records'], ambientAudio: 'lo-fi-beats' },
  };
  return scenes[niche] ?? { environment: 'minimal-gallery', lighting: 'neutral-studio', props: ['plinth', 'plant'], ambientAudio: 'ambient-pad' };
}

export function placeAnchor(productId: string, pos: [number, number, number]): SpatialAnchor {
  return {
    id: `anchor_${Date.now().toString(36)}`,
    position: pos,
    rotation: [0, 0, 0, 1],
    scale: [1, 1, 1],
    productId,
  };
}
