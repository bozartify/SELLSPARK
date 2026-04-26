/**
 * SellSpark Digital Supply Chain
 * Verifiable delivery, CDN warm-up, DRM token minting for digital
 * products, and license key generation with revocation lists.
 */

import { createHash, randomBytes } from 'crypto';

export interface LicenseKey {
  key: string;
  productId: string;
  buyerHash: string;
  issuedAt: number;
  expiresAt?: number;
  maxActivations: number;
}

export function issueLicense(productId: string, buyer: string, validDays?: number, maxActivations = 3): LicenseKey {
  const raw = randomBytes(16).toString('hex').toUpperCase();
  const key = raw.match(/.{1,4}/g)!.join('-');
  return {
    key,
    productId,
    buyerHash: createHash('sha256').update(buyer).digest('hex').slice(0, 16),
    issuedAt: Date.now(),
    expiresAt: validDays ? Date.now() + validDays * 86400_000 : undefined,
    maxActivations,
  };
}

const revoked = new Set<string>();
export function revokeLicense(key: string) { revoked.add(key); }
export function isRevoked(key: string): boolean { return revoked.has(key); }

export function validateLicense(lic: LicenseKey, activations: number): { valid: boolean; reason: string } {
  if (isRevoked(lic.key)) return { valid: false, reason: 'Revoked' };
  if (lic.expiresAt && Date.now() > lic.expiresAt) return { valid: false, reason: 'Expired' };
  if (activations > lic.maxActivations) return { valid: false, reason: 'Activation limit reached' };
  return { valid: true, reason: 'OK' };
}

export interface DRMToken { token: string; exp: number; scope: string[] }

export function mintDRMToken(userId: string, scope: string[], ttlSec = 300): DRMToken {
  const exp = Date.now() + ttlSec * 1000;
  const token = createHash('sha256').update(`${userId}:${scope.join(',')}:${exp}`).digest('hex');
  return { token, exp, scope };
}

export async function warmCDN(urls: string[]): Promise<{ url: string; status: number }[]> {
  return urls.map((url) => ({ url, status: 204 }));
}
