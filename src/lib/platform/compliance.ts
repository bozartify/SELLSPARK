/**
 * SellSpark Compliance & Data Governance
 * GDPR/CCPA/PIPEDA rights requests, data export bundles,
 * consent ledger, and AI-usage disclosure generator.
 */

export type Jurisdiction = 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD' | 'APPI' | 'POPIA';

export interface ConsentRecord { userId: string; purpose: string; granted: boolean; ts: number; jurisdiction: Jurisdiction }

const ledger: ConsentRecord[] = [];

export function recordConsent(r: Omit<ConsentRecord, 'ts'>): ConsentRecord {
  const entry = { ...r, ts: Date.now() };
  ledger.push(entry);
  return entry;
}

export function consentFor(userId: string, purpose: string): boolean {
  const latest = [...ledger].reverse().find((r) => r.userId === userId && r.purpose === purpose);
  return latest?.granted ?? false;
}

export interface DataExport { user: Record<string, unknown>; orders: unknown[]; messages: unknown[]; consents: ConsentRecord[] }

export function buildExport(userId: string, data: Omit<DataExport, 'consents'>): DataExport {
  return { ...data, consents: ledger.filter((r) => r.userId === userId) };
}

export function aiDisclosure(featuresUsed: string[]): string {
  return [
    'This storefront uses AI systems to personalize your experience:',
    ...featuresUsed.map((f) => `• ${f}`),
    'You may opt out of AI personalization in settings. No biometric data leaves your device.',
  ].join('\n');
}

export const RIGHTS: Record<Jurisdiction, string[]> = {
  GDPR: ['access', 'rectification', 'erasure', 'portability', 'objection', 'restrict-processing'],
  CCPA: ['know', 'delete', 'opt-out-sale', 'non-discrimination'],
  PIPEDA: ['access', 'correction', 'withdraw-consent'],
  LGPD: ['confirmation', 'access', 'correction', 'anonymization', 'portability', 'elimination'],
  APPI: ['disclosure', 'correction', 'deletion', 'opt-out'],
  POPIA: ['access', 'correction', 'objection', 'deletion'],
};
