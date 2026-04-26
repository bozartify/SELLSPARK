/**
 * SellSpark Metaverse Identity & Avatar System
 * Cross-platform avatar passport, SBT (soulbound) reputation,
 * portable inventory across Meta/Apple/Roblox/Decentraland, and
 * DID-based sovereign identity (W3C VC-compatible).
 */

import { createHash } from 'crypto';

export interface Avatar {
  did: string; // decentralized identifier
  displayName: string;
  mesh: string; // glTF URI
  voicePrint: string;
  worlds: string[]; // platforms where avatar is linked
  reputation: SBT[];
}

export interface SBT {
  kind: 'creator' | 'buyer' | 'contributor' | 'verified' | 'og';
  issuedBy: string;
  issuedAt: number;
  revocable: false;
}

export function mintDID(seed: string): string {
  const h = createHash('sha256').update(seed).digest('hex');
  return `did:sellspark:${h.slice(0, 32)}`;
}

export function issueSBT(kind: SBT['kind'], holder: string, issuer = 'sellspark'): SBT {
  return { kind, issuedBy: issuer, issuedAt: Date.now(), revocable: false };
}

export const WORLDS = [
  { id: 'apple-vision', label: 'Apple Vision Pro', supported: true },
  { id: 'meta-horizon', label: 'Meta Horizon', supported: true },
  { id: 'roblox', label: 'Roblox', supported: true },
  { id: 'decentraland', label: 'Decentraland', supported: true },
  { id: 'sandbox', label: 'The Sandbox', supported: true },
  { id: 'spatial', label: 'Spatial.io', supported: true },
  { id: 'zepeto', label: 'ZEPETO', supported: false },
];

export function portabilityScore(a: Avatar): number {
  return Math.min(100, (a.worlds.length / WORLDS.length) * 100);
}
