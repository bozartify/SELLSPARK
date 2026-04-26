// ip-portfolio.ts — IP portfolio management, patent claims, prior art, and alerts

// ─── Patent Claims ────────────────────────────────────────────────────────────

export interface PatentClaim {
  claimId: string;
  type: 'independent' | 'dependent';
  claimNumber: number;
  text: string;
  dependsOn?: number;
  keywords: string[];
  noveltyScore: number;
}

export interface InventionInput {
  title: string;
  description: string;
  technicalField: string;
  novelElements: string[];
}

export function generatePatentClaims(invention: InventionInput): PatentClaim[] {
  const { title, technicalField, novelElements } = invention;
  const baseKeywords = technicalField.toLowerCase().split(' ').filter(Boolean);

  const independentClaim: PatentClaim = {
    claimId: `claim-${Date.now()}-1`,
    type: 'independent',
    claimNumber: 1,
    text: `A system and method for ${title.toLowerCase()}, comprising: ${novelElements.slice(0, 3).map((e, i) => `(${String.fromCharCode(97 + i)}) ${e}`).join('; ')}.`,
    keywords: [...new Set([...baseKeywords, ...novelElements.flatMap(e => e.toLowerCase().split(' '))])].slice(0, 8),
    noveltyScore: 0.72 + Math.random() * 0.2,
  };

  const claims: PatentClaim[] = [independentClaim];

  novelElements.forEach((element, idx) => {
    const claimNum = idx + 2;
    claims.push({
      claimId: `claim-${Date.now()}-${claimNum}`,
      type: 'dependent',
      claimNumber: claimNum,
      text: `The system of claim 1, wherein ${element} is implemented using machine-learning optimization and real-time feedback loops.`,
      dependsOn: 1,
      keywords: [...baseKeywords, ...element.toLowerCase().split(' ')].slice(0, 6),
      noveltyScore: 0.55 + Math.random() * 0.3,
    });
  });

  // Add a method claim
  claims.push({
    claimId: `claim-${Date.now()}-method`,
    type: 'independent',
    claimNumber: claims.length + 1,
    text: `A computer-implemented method for ${title.toLowerCase()}, the method comprising: receiving input data related to ${technicalField}; processing said data via a neural inference engine; and outputting a ranked set of recommendations.`,
    keywords: [...baseKeywords, 'method', 'computer-implemented', 'neural', 'inference'].slice(0, 8),
    noveltyScore: 0.65 + Math.random() * 0.2,
  });

  return claims;
}

export function formatClaimsDocument(claims: PatentClaim[]): string {
  const lines: string[] = ['PATENT CLAIMS', '='.repeat(60), ''];

  const independent = claims.filter(c => c.type === 'independent');
  const dependent = claims.filter(c => c.type === 'dependent');

  independent.forEach(claim => {
    lines.push(`Claim ${claim.claimNumber}. (Independent)`);
    lines.push(claim.text);
    lines.push(`  Novelty Score: ${(claim.noveltyScore * 100).toFixed(1)}%`);
    lines.push(`  Keywords: ${claim.keywords.join(', ')}`);
    lines.push('');
  });

  if (dependent.length > 0) {
    lines.push('─'.repeat(60));
    lines.push('Dependent Claims');
    lines.push('─'.repeat(60));
    lines.push('');
    dependent.forEach(claim => {
      lines.push(`Claim ${claim.claimNumber}. (Depends on Claim ${claim.dependsOn ?? 1})`);
      lines.push(claim.text);
      lines.push(`  Novelty Score: ${(claim.noveltyScore * 100).toFixed(1)}%`);
      lines.push('');
    });
  }

  return lines.join('\n');
}

export function scoreNovelty(claim: PatentClaim, priorArt: PriorArtResult[]): number {
  if (priorArt.length === 0) return claim.noveltyScore;

  const avgRelevance = priorArt.reduce((sum, p) => sum + p.relevanceScore, 0) / priorArt.length;
  const highlyRelevant = priorArt.filter(p => p.relevanceScore > 0.75).length;
  const penalty = (avgRelevance * 0.3) + (highlyRelevant * 0.05);
  return Math.max(0, Math.min(1, claim.noveltyScore - penalty));
}

// ─── Prior Art ────────────────────────────────────────────────────────────────

export interface PriorArtResult {
  id: string;
  title: string;
  publicationDate: string;
  assignee: string;
  abstract: string;
  relevanceScore: number;
  patentNumber: string;
  url: string;
}

export function searchPriorArt(keywords: string[], technicalField: string): PriorArtResult[] {
  const field = technicalField.toLowerCase();
  const kws = keywords.map(k => k.toLowerCase());

  // 5 realistic mock prior art results
  const allPriorArt: PriorArtResult[] = [
    {
      id: 'pa-001',
      title: 'System and Method for AI-Driven Creator Monetization',
      publicationDate: '2023-06-15',
      assignee: 'Meta Platforms, Inc.',
      abstract: 'A platform enabling digital creators to monetize content through AI-personalized subscription tiers, dynamic pricing models, and automated audience segmentation.',
      relevanceScore: 0,
      patentNumber: 'US11,782,334 B2',
      url: 'https://patents.google.com/patent/US11782334B2',
    },
    {
      id: 'pa-002',
      title: 'Blockchain-Based Intellectual Property Rights Management',
      publicationDate: '2022-11-28',
      assignee: 'IBM Corporation',
      abstract: 'Methods and systems for recording, tracking, and enforcing intellectual property rights using distributed ledger technology with smart contract automation.',
      relevanceScore: 0,
      patentNumber: 'US11,694,201 B1',
      url: 'https://patents.google.com/patent/US11694201B1',
    },
    {
      id: 'pa-003',
      title: 'Machine Learning Portfolio Valuation for Intangible Assets',
      publicationDate: '2023-02-07',
      assignee: 'Accenture Global Solutions Ltd.',
      abstract: 'An ML pipeline that ingests patent metadata, licensing revenue, and market comparables to generate real-time valuations for IP portfolios held by corporations.',
      relevanceScore: 0,
      patentNumber: 'US11,741,889 B2',
      url: 'https://patents.google.com/patent/US11741889B2',
    },
    {
      id: 'pa-004',
      title: 'Automated Prior Art Discovery Using Neural Embedding Search',
      publicationDate: '2023-09-19',
      assignee: 'Alphabet Inc.',
      abstract: 'A neural search architecture that encodes patent claims into dense vector embeddings and retrieves semantically similar prior art across multiple patent databases.',
      relevanceScore: 0,
      patentNumber: 'US11,803,567 B1',
      url: 'https://patents.google.com/patent/US11803567B1',
    },
    {
      id: 'pa-005',
      title: 'Real-Time Trademark Infringement Detection via Computer Vision',
      publicationDate: '2022-08-30',
      assignee: 'Adobe Inc.',
      abstract: 'Systems for continuous monitoring of digital media channels using computer vision models to detect unauthorized use of registered trademarks and brand assets.',
      relevanceScore: 0,
      patentNumber: 'US11,622,445 B2',
      url: 'https://patents.google.com/patent/US11622445B2',
    },
  ];

  // Score relevance based on keyword overlap with abstract + title
  return allPriorArt.map(art => {
    const haystack = `${art.title} ${art.abstract}`.toLowerCase();
    const matches = kws.filter(kw => haystack.includes(kw)).length;
    const fieldBonus = haystack.includes(field) ? 0.15 : 0;
    const relevanceScore = Math.min(1, (matches / Math.max(kws.length, 1)) * 0.85 + fieldBonus);
    return { ...art, relevanceScore };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export function computeFreedomToOperate(
  claims: PatentClaim[],
  priorArt: PriorArtResult[],
): { score: number; blockers: string[]; safeToFile: boolean } {
  const blockers: string[] = [];

  priorArt.forEach(art => {
    if (art.relevanceScore > 0.7) {
      blockers.push(`${art.patentNumber} — "${art.title}" (relevance ${(art.relevanceScore * 100).toFixed(0)}%)`);
    }
  });

  const avgNovelty = claims.reduce((sum, c) => sum + c.noveltyScore, 0) / Math.max(claims.length, 1);
  const avgRelevance = priorArt.reduce((sum, p) => sum + p.relevanceScore, 0) / Math.max(priorArt.length, 1);
  const score = Math.max(0, Math.min(1, avgNovelty - avgRelevance * 0.5));

  return {
    score,
    blockers,
    safeToFile: score > 0.5 && blockers.length === 0,
  };
}

// ─── IP Portfolio ─────────────────────────────────────────────────────────────

export type IPAssetType = 'patent' | 'trademark' | 'copyright' | 'trade-secret';
export type IPAssetStatus = 'draft' | 'filed' | 'pending' | 'granted' | 'expired' | 'abandoned';

export interface IPAsset {
  assetId: string;
  type: IPAssetType;
  title: string;
  status: IPAssetStatus;
  filingDate?: string;
  grantDate?: string;
  jurisdiction: string[];
  estimatedValue: number;
  description: string;
}

export function computePortfolioValue(assets: IPAsset[]): {
  total: number;
  byType: Record<IPAssetType, number>;
  byStatus: Record<IPAssetStatus, number>;
} {
  const byType: Record<IPAssetType, number> = { patent: 0, trademark: 0, copyright: 0, 'trade-secret': 0 };
  const byStatus: Record<IPAssetStatus, number> = { draft: 0, filed: 0, pending: 0, granted: 0, expired: 0, abandoned: 0 };

  assets.forEach(asset => {
    byType[asset.type] += asset.estimatedValue;
    byStatus[asset.status] += asset.estimatedValue;
  });

  return {
    total: assets.reduce((sum, a) => sum + a.estimatedValue, 0),
    byType,
    byStatus,
  };
}

export function generateMockIPPortfolio(): IPAsset[] {
  return [
    {
      assetId: 'ip-001',
      type: 'patent',
      title: 'AI-Driven Creator Revenue Optimization System',
      status: 'granted',
      filingDate: '2022-03-10',
      grantDate: '2024-01-22',
      jurisdiction: ['US', 'EU', 'GB'],
      estimatedValue: 4_200_000,
      description: 'A patent covering machine-learning methods for dynamically pricing creator subscriptions based on audience engagement signals.',
    },
    {
      assetId: 'ip-002',
      type: 'patent',
      title: 'Quantum-Resistant Content Watermarking Protocol',
      status: 'pending',
      filingDate: '2023-07-18',
      jurisdiction: ['US', 'JP', 'AU'],
      estimatedValue: 2_800_000,
      description: 'Methods for embedding lattice-based cryptographic watermarks into digital media that survive transcoding and are resistant to quantum attacks.',
    },
    {
      assetId: 'ip-003',
      type: 'trademark',
      title: 'SELLSPARK™ Word Mark',
      status: 'granted',
      filingDate: '2021-11-05',
      grantDate: '2022-08-14',
      jurisdiction: ['US', 'EU', 'CA', 'AU'],
      estimatedValue: 1_500_000,
      description: 'Registered word mark for the SellSpark creator platform brand in International Class 42 (Software as a Service).',
    },
    {
      assetId: 'ip-004',
      type: 'trademark',
      title: 'SELLSPARK Logo & Design Mark',
      status: 'filed',
      filingDate: '2024-02-29',
      jurisdiction: ['US', 'EU'],
      estimatedValue: 850_000,
      description: 'Stylized logo mark incorporating the SellSpark lightning bolt motif, filed for protection in software and digital services classes.',
    },
    {
      assetId: 'ip-005',
      type: 'copyright',
      title: 'SellSpark Platform Source Code v2.x',
      status: 'granted',
      filingDate: '2023-01-15',
      grantDate: '2023-01-15',
      jurisdiction: ['US'],
      estimatedValue: 3_600_000,
      description: 'Copyright registration covering the core Next.js platform codebase, including the AI recommendation engine and payment orchestration layer.',
    },
    {
      assetId: 'ip-006',
      type: 'trade-secret',
      title: 'Audience Graph Embedding Model Weights',
      status: 'granted',
      jurisdiction: ['US', 'EU', 'UK', 'SG'],
      estimatedValue: 5_100_000,
      description: 'Proprietary trained neural network weights for the audience affinity graph, protected as trade secrets via NDA and access control policies.',
    },
    {
      assetId: 'ip-007',
      type: 'patent',
      title: 'Federated Creator Marketplace Transaction Settlement',
      status: 'draft',
      jurisdiction: ['US'],
      estimatedValue: 1_200_000,
      description: 'Draft patent application for a decentralized settlement protocol enabling near-instant creator payouts across federated marketplace nodes.',
    },
    {
      assetId: 'ip-008',
      type: 'copyright',
      title: 'SellSpark Brand Asset Library',
      status: 'granted',
      filingDate: '2022-06-01',
      grantDate: '2022-06-01',
      jurisdiction: ['US'],
      estimatedValue: 420_000,
      description: 'Copyright covering the full suite of brand assets including UI design system, marketing templates, and motion graphics.',
    },
  ];
}

export function getMaintenanceDue(assets: IPAsset[]): IPAsset[] {
  const now = new Date('2026-04-23');
  return assets.filter(asset => {
    if (asset.status === 'expired' || asset.status === 'abandoned') return false;
    if (asset.status === 'granted' && asset.grantDate) {
      const grant = new Date(asset.grantDate);
      const monthsSinceGrant = (now.getFullYear() - grant.getFullYear()) * 12 + (now.getMonth() - grant.getMonth());
      // Patents: maintenance at 3.5, 7.5, 11.5 years — flag within 90 days of next window
      if (asset.type === 'patent') {
        const windows = [42, 90, 138]; // months
        return windows.some(w => {
          const diff = w - monthsSinceGrant;
          return diff >= 0 && diff <= 3;
        });
      }
      // Trademarks: renewal every 10 years
      if (asset.type === 'trademark') {
        const yearsToRenewal = 10 - (monthsSinceGrant / 12) % 10;
        return yearsToRenewal <= 0.25;
      }
    }
    if (asset.status === 'pending') {
      // Flag pending assets older than 18 months to check status
      const filed = asset.filingDate ? new Date(asset.filingDate) : null;
      if (filed) {
        const monthsPending = (now.getFullYear() - filed.getFullYear()) * 12 + (now.getMonth() - filed.getMonth());
        return monthsPending >= 18;
      }
    }
    return false;
  });
}

// ─── Defensive Publication ────────────────────────────────────────────────────

export interface DefensivePublication {
  pubId: string;
  title: string;
  disclosureDate: string;
  inventors: string[];
  abstract: string;
  technicalDetails: string;
  publicationUrl: string;
}

export function createDefensivePublication(invention: InventionInput): DefensivePublication {
  const slug = invention.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const pubId = `dp-${Date.now()}`;
  return {
    pubId,
    title: `Defensive Disclosure: ${invention.title}`,
    disclosureDate: '2026-04-23',
    inventors: ['Platform Engineering Team', 'AI Research Group'],
    abstract: `This defensive publication discloses methods and systems related to ${invention.title.toLowerCase()} in the field of ${invention.technicalField}. ${invention.description}`,
    technicalDetails: `Novel elements disclosed: ${invention.novelElements.map((e, i) => `(${i + 1}) ${e}`).join('; ')}. This disclosure is made to establish prior art and prevent third-party patenting of these techniques.`,
    publicationUrl: `https://ip.sellspark.io/defensive-publications/${slug}-${pubId}`,
  };
}

// ─── IP Alerts ────────────────────────────────────────────────────────────────

export type IPAlertType = 'infringement' | 'expiry' | 'competitor-filing' | 'maintenance-due';

export interface IPAlert {
  alertId: string;
  type: IPAlertType;
  severity: 'high' | 'medium' | 'low';
  assetTitle: string;
  description: string;
  actionRequired: string;
  dueDate?: string;
}

export function generateIPAlerts(portfolio: IPAsset[]): IPAlert[] {
  const alerts: IPAlert[] = [];
  const now = new Date('2026-04-23');

  portfolio.forEach(asset => {
    // Expiry alerts for granted patents (US utility: 20 years from filing)
    if (asset.type === 'patent' && asset.status === 'granted' && asset.filingDate) {
      const filed = new Date(asset.filingDate);
      const expiryDate = new Date(filed);
      expiryDate.setFullYear(expiryDate.getFullYear() + 20);
      const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 86_400_000);
      if (daysToExpiry <= 365 && daysToExpiry > 0) {
        alerts.push({
          alertId: `alert-expiry-${asset.assetId}`,
          type: 'expiry',
          severity: daysToExpiry <= 90 ? 'high' : 'medium',
          assetTitle: asset.title,
          description: `Patent expires in ${daysToExpiry} days on ${expiryDate.toISOString().split('T')[0]}.`,
          actionRequired: 'Review licensing opportunities and consider filing continuation applications before expiry.',
          dueDate: expiryDate.toISOString().split('T')[0],
        });
      }
    }

    // Maintenance alerts
    const maintenanceDue = getMaintenanceDue([asset]);
    if (maintenanceDue.length > 0) {
      alerts.push({
        alertId: `alert-maint-${asset.assetId}`,
        type: 'maintenance-due',
        severity: 'high',
        assetTitle: asset.title,
        description: `Maintenance fee window approaching for ${asset.type} "${asset.title}".`,
        actionRequired: 'Pay USPTO/EPO maintenance fee within the statutory window to avoid abandonment.',
        dueDate: (() => {
          const d = new Date(now);
          d.setMonth(d.getMonth() + 2);
          return d.toISOString().split('T')[0];
        })(),
      });
    }

    // Competitor filing alerts for pending assets with long pendency
    if (asset.status === 'pending' && asset.filingDate) {
      const filed = new Date(asset.filingDate);
      const monthsPending = (now.getFullYear() - filed.getFullYear()) * 12 + (now.getMonth() - filed.getMonth());
      if (monthsPending >= 24) {
        alerts.push({
          alertId: `alert-pending-${asset.assetId}`,
          type: 'competitor-filing',
          severity: 'medium',
          assetTitle: asset.title,
          description: `Application has been pending for ${monthsPending} months. Competitor landscape may have shifted.`,
          actionRequired: 'Request USPTO status update; consider filing continuation or CIP to capture new improvements.',
        });
      }
    }

    // Draft assets not yet filed
    if (asset.status === 'draft') {
      alerts.push({
        alertId: `alert-draft-${asset.assetId}`,
        type: 'competitor-filing',
        severity: 'low',
        assetTitle: asset.title,
        description: `"${asset.title}" is still in draft status and has not been filed.`,
        actionRequired: 'Prioritize filing to establish priority date and prevent third-party patenting.',
      });
    }
  });

  // Static infringement alert (simulated competitive monitoring)
  alerts.push({
    alertId: 'alert-infr-001',
    type: 'infringement',
    severity: 'high',
    assetTitle: 'SELLSPARK™ Word Mark',
    description: 'Monitoring system detected a newly registered trademark "SellSpark AI" by a third party in Class 42.',
    actionRequired: 'Engage IP counsel to file an opposition or cease-and-desist letter within 30 days.',
    dueDate: '2026-05-23',
  });

  return alerts;
}

export function prioritizeAlerts(alerts: IPAlert[]): IPAlert[] {
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const typeOrder: Record<string, number> = { infringement: 0, 'maintenance-due': 1, expiry: 2, 'competitor-filing': 3 };

  return [...alerts].sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    const typeDiff = typeOrder[a.type] - typeOrder[b.type];
    if (typeDiff !== 0) return typeDiff;
    // Earlier due dates first
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}
