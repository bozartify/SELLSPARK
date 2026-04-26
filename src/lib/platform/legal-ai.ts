/**
 * SellSpark Legal AI
 * Auto-generate ToS/Privacy/refund policies, clause library,
 * DMCA takedown filing, and jurisdictional tax/KYC routing.
 */

export function generateRefundPolicy(opts: { windowDays: number; digitalOnly: boolean; exceptions?: string[] }): string {
  const { windowDays, digitalOnly, exceptions = [] } = opts;
  return [
    `## Refund Policy`,
    ``,
    `We offer a **${windowDays}-day satisfaction guarantee** on all${digitalOnly ? ' digital' : ''} products.`,
    ``,
    `To request a refund, email support@sellspark.com within ${windowDays} days of purchase.`,
    ``,
    exceptions.length ? `### Exceptions\n${exceptions.map((e) => `- ${e}`).join('\n')}` : '',
  ].filter(Boolean).join('\n');
}

export function dmcaNotice(opts: { claimant: string; infringingUrl: string; originalWork: string }): string {
  return [
    `DMCA Takedown Notice`,
    `Claimant: ${opts.claimant}`,
    `Original work: ${opts.originalWork}`,
    `Infringing URL: ${opts.infringingUrl}`,
    `Good faith: I have a good-faith belief that the use described above is not authorized.`,
    `Perjury: The information in this notice is accurate, under penalty of perjury.`,
    `Signed: ${opts.claimant} · ${new Date().toISOString()}`,
  ].join('\n');
}

export function kycRouting(country: string, amountUsd: number): { level: 'none' | 'basic' | 'enhanced'; provider: string } {
  if (amountUsd < 100) return { level: 'none', provider: '—' };
  if (amountUsd < 10_000) return { level: 'basic', provider: 'Stripe Identity' };
  const highRisk = ['IR', 'KP', 'SY', 'CU', 'RU'];
  return { level: 'enhanced', provider: highRisk.includes(country) ? 'Persona + manual' : 'Persona' };
}
