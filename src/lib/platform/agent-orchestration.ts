/**
 * @module agent-orchestration
 * @description Advanced AI agent orchestration engine for SellSpark creator OS.
 * Covers multi-agent debate, chain-of-thought logging, tool registry,
 * agent marketplace, memory consolidation, and capability-based task routing.
 */

// ─── Tool Registry ──────────────────────────────────────────────────────────

export type ToolCategory =
  | 'web'
  | 'content'
  | 'payments'
  | 'analytics'
  | 'communication';

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, string>;
  category: ToolCategory;
}

export const TOOL_REGISTRY: AgentTool[] = [
  {
    name: 'web-search',
    description: 'Search the web for real-time information and research.',
    inputSchema: { query: 'string', maxResults: 'number' },
    category: 'web',
  },
  {
    name: 'code-exec',
    description: 'Execute sandboxed code snippets and return output.',
    inputSchema: { language: 'string', code: 'string' },
    category: 'web',
  },
  {
    name: 'image-gen',
    description: 'Generate images from text prompts using diffusion models.',
    inputSchema: { prompt: 'string', size: 'string', style: 'string' },
    category: 'content',
  },
  {
    name: 'email-send',
    description: 'Send transactional or marketing emails to recipients.',
    inputSchema: { to: 'string', subject: 'string', body: 'string', fromName: 'string' },
    category: 'communication',
  },
  {
    name: 'calendar-book',
    description: 'Create calendar events and send invites to attendees.',
    inputSchema: { title: 'string', startTime: 'string', endTime: 'string', attendees: 'string[]' },
    category: 'communication',
  },
  {
    name: 'crm-lookup',
    description: 'Query the CRM database for customer or lead records.',
    inputSchema: { identifier: 'string', field: 'string' },
    category: 'analytics',
  },
  {
    name: 'payment-create',
    description: 'Create a payment intent or invoice via Stripe.',
    inputSchema: { amount: 'number', currency: 'string', customerId: 'string' },
    category: 'payments',
  },
  {
    name: 'analytics-query',
    description: 'Run a structured query against the analytics data warehouse.',
    inputSchema: { metric: 'string', dateRange: 'string', filters: 'Record<string,string>' },
    category: 'analytics',
  },
  {
    name: 'content-publish',
    description: 'Publish content to a connected channel (blog, social, newsletter).',
    inputSchema: { channel: 'string', title: 'string', body: 'string', scheduledAt: 'string' },
    category: 'content',
  },
  {
    name: 'sms-send',
    description: 'Send an SMS message to a phone number via Twilio.',
    inputSchema: { to: 'string', message: 'string' },
    category: 'communication',
  },
  {
    name: 'pdf-generate',
    description: 'Render an HTML template to a PDF document and return a download URL.',
    inputSchema: { templateId: 'string', data: 'Record<string,unknown>' },
    category: 'content',
  },
  {
    name: 'translate',
    description: 'Translate text between languages using a neural MT service.',
    inputSchema: { text: 'string', sourceLang: 'string', targetLang: 'string' },
    category: 'content',
  },
  {
    name: 'sentiment-analyze',
    description: 'Classify the sentiment of a text passage as positive, neutral, or negative.',
    inputSchema: { text: 'string' },
    category: 'analytics',
  },
  {
    name: 'price-optimize',
    description: 'Recommend an optimal price for a product based on demand signals.',
    inputSchema: { productId: 'string', currentPrice: 'number', competitorPrices: 'number[]' },
    category: 'payments',
  },
  {
    name: 'audience-segment',
    description: 'Segment an audience list by behavioural or demographic criteria.',
    inputSchema: { audienceId: 'string', criteria: 'Record<string,unknown>' },
    category: 'analytics',
  },
];

// ─── Chain-of-Thought Logging ────────────────────────────────────────────────

export interface ThoughtStep {
  stepId: string;
  agentId: string;
  reasoning: string;
  confidence: number; // 0–1
  toolsUsed: string[];
  timestamp: Date;
}

export interface ThoughtChain {
  chainId: string;
  agentId: string;
  steps: ThoughtStep[];
  createdAt: Date;
}

export function createThoughtChain(agentId: string): ThoughtChain {
  return {
    chainId: `chain_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    steps: [],
    createdAt: new Date(),
  };
}

export function addStep(
  chain: ThoughtChain,
  reasoning: string,
  confidence: number,
  toolsUsed: string[] = [],
): ThoughtChain {
  const step: ThoughtStep = {
    stepId: `step_${chain.steps.length + 1}`,
    agentId: chain.agentId,
    reasoning,
    confidence: Math.max(0, Math.min(1, confidence)),
    toolsUsed,
    timestamp: new Date(),
  };
  return { ...chain, steps: [...chain.steps, step] };
}

export function summarizeChain(chain: ThoughtChain): string {
  if (chain.steps.length === 0) return 'No steps recorded.';
  const avgConfidence =
    chain.steps.reduce((sum, s) => sum + s.confidence, 0) / chain.steps.length;
  const allTools = [...new Set(chain.steps.flatMap((s) => s.toolsUsed))];
  return (
    `Chain ${chain.chainId} — ${chain.steps.length} step(s), ` +
    `avg confidence ${(avgConfidence * 100).toFixed(1)}%, ` +
    `tools used: ${allTools.length > 0 ? allTools.join(', ') : 'none'}.`
  );
}

// ─── Multi-Agent Debate Protocol ─────────────────────────────────────────────

export interface DebateArgument {
  agentId: string;
  agentName: string;
  round: number;
  position: string;
  supporting: string[];
  confidence: number;
}

export interface DebateResult {
  question: string;
  rounds: number;
  arguments: DebateArgument[];
  consensusScore: number; // 0–1
  winningPosition: string;
  winningAgentId: string;
  completedAt: Date;
}

export interface DebateAgent {
  id: string;
  name: string;
  perspective: string; // e.g. "growth-focused", "risk-averse"
}

export type AgentDebate = {
  debateId: string;
  question: string;
  agents: DebateAgent[];
  totalRounds: number;
  status: 'pending' | 'running' | 'completed';
};

/** Synthetic argument generator — in production, replace with real LLM calls. */
function generateArgument(
  agent: DebateAgent,
  question: string,
  round: number,
  prior: DebateArgument[],
): DebateArgument {
  const priorContext =
    prior.length > 0
      ? ` Considering prior arguments: ${prior.map((a) => a.position).join('; ')}.`
      : '';

  const positions = [
    `From a ${agent.perspective} standpoint, the answer to "${question}" is to prioritise measurable ROI.${priorContext}`,
    `A ${agent.perspective} analysis of "${question}" suggests a phased rollout minimises risk.${priorContext}`,
    `Given ${agent.perspective} constraints, "${question}" is best resolved by A/B testing first.${priorContext}`,
    `The ${agent.perspective} model recommends focusing on user retention to address "${question}".${priorContext}`,
  ];

  const position = positions[(agent.id.charCodeAt(agent.id.length - 1) + round) % positions.length];

  return {
    agentId: agent.id,
    agentName: agent.name,
    round,
    position,
    supporting: [
      'Historical performance data',
      'Market benchmarks',
      `${agent.perspective} heuristics`,
    ],
    confidence: 0.55 + Math.random() * 0.4,
  };
}

export function initiateDebate(
  question: string,
  agents: DebateAgent[],
  rounds: number,
): DebateResult {
  if (agents.length === 0) throw new Error('At least one agent required for debate.');
  if (rounds < 1) throw new Error('Rounds must be >= 1.');

  const allArguments: DebateArgument[] = [];

  for (let round = 1; round <= rounds; round++) {
    for (const agent of agents) {
      const priorForAgent = allArguments.filter((a) => a.agentId !== agent.id);
      const arg = generateArgument(agent, question, round, priorForAgent);
      allArguments.push(arg);
    }
  }

  // Consensus: average pairwise agreement proxy (how close confidence scores are)
  const confidences = allArguments.map((a) => a.confidence);
  const mean = confidences.reduce((s, c) => s + c, 0) / confidences.length;
  const variance =
    confidences.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / confidences.length;
  const consensusScore = Math.max(0, 1 - Math.sqrt(variance) * 4);

  // Winning agent = highest average confidence across their arguments
  const agentScores = agents.map((agent) => {
    const agentArgs = allArguments.filter((a) => a.agentId === agent.id);
    const avg = agentArgs.reduce((s, a) => s + a.confidence, 0) / agentArgs.length;
    return { agent, avg };
  });
  agentScores.sort((a, b) => b.avg - a.avg);
  const winner = agentScores[0];
  const winningArg = allArguments
    .filter((a) => a.agentId === winner.agent.id)
    .sort((a, b) => b.confidence - a.confidence)[0];

  return {
    question,
    rounds,
    arguments: allArguments,
    consensusScore: parseFloat(consensusScore.toFixed(3)),
    winningPosition: winningArg.position,
    winningAgentId: winner.agent.id,
    completedAt: new Date(),
  };
}

// ─── Agent Marketplace ───────────────────────────────────────────────────────

export type AgentCategory =
  | 'content'
  | 'growth'
  | 'revenue'
  | 'support'
  | 'analytics'
  | 'compliance'
  | 'social'
  | 'automation'
  | 'video'
  | 'email'
  | 'seo'
  | 'ecommerce'
  | 'design'
  | 'finance'
  | 'productivity'
  | 'security'
  | 'hr'
  | 'legal'
  | 'research'
  | 'community'
  | 'ads'
  | 'data'
  | 'devops'
  | 'web3'
  | 'swarm'
  | 'team'
  | 'enterprise'
  | 'orchestrator'
  | 'autonomous'
  | 'quantum'
  | 'elite';

export interface MarketplaceAgent {
  agentId: string;
  name: string;
  category: AgentCategory;
  rating: number; // 1–5
  usageCount: number;
  price: number; // USD / month
  capabilities: string[];
  installed: boolean;
}

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    agentId: 'mkt-001',
    name: 'ContentCraft AI',
    category: 'content',
    rating: 4.8,
    usageCount: 12400,
    price: 29,
    capabilities: ['blog-writing', 'seo-optimisation', 'image-gen', 'content-publish'],
    installed: false,
  },
  {
    agentId: 'mkt-002',
    name: 'GrowthEngine',
    category: 'growth',
    rating: 4.6,
    usageCount: 8750,
    price: 49,
    capabilities: ['audience-segment', 'ab-testing', 'funnel-analysis', 'price-optimize'],
    installed: false,
  },
  {
    agentId: 'mkt-003',
    name: 'RevenueMax',
    category: 'revenue',
    rating: 4.9,
    usageCount: 6200,
    price: 79,
    capabilities: ['payment-create', 'price-optimize', 'churn-prediction', 'upsell-engine'],
    installed: true,
  },
  {
    agentId: 'mkt-004',
    name: 'SupportBot Pro',
    category: 'support',
    rating: 4.4,
    usageCount: 21000,
    price: 19,
    capabilities: ['ticket-triage', 'crm-lookup', 'email-send', 'sms-send'],
    installed: false,
  },
  {
    agentId: 'mkt-005',
    name: 'DataSage Analytics',
    category: 'analytics',
    rating: 4.7,
    usageCount: 5300,
    price: 59,
    capabilities: ['analytics-query', 'sentiment-analyze', 'audience-segment', 'crm-lookup'],
    installed: false,
  },
  {
    agentId: 'mkt-006',
    name: 'ComplianceGuard',
    category: 'compliance',
    rating: 4.5,
    usageCount: 3100,
    price: 39,
    capabilities: ['legal-scan', 'gdpr-check', 'pdf-generate', 'translate'],
    installed: false,
  },
  {
    agentId: 'mkt-007',
    name: 'SocialPilot AI',
    category: 'social',
    rating: 4.3,
    usageCount: 18500,
    price: 24,
    capabilities: ['content-publish', 'sentiment-analyze', 'image-gen', 'web-search'],
    installed: true,
  },
  {
    agentId: 'mkt-008',
    name: 'AutoFlow Builder',
    category: 'automation',
    rating: 4.6,
    usageCount: 7900,
    price: 44,
    capabilities: ['calendar-book', 'email-send', 'code-exec', 'crm-lookup'],
    installed: false,
  },
  ...buildExtendedAgentCatalog(),
  ...buildSwarmAndTeamCatalog(),
];

// ─── Swarm, Team & Enterprise Catalog (50+ premium up to €25k/mo) ────────────
function buildSwarmAndTeamCatalog(): MarketplaceAgent[] {
  const seed: Array<[string, AgentCategory, number, string[]]> = [
    // ── Swarms (multi-agent collectives) ───────────────────────────────
    ['Hivemind Swarm', 'swarm', 1499, ['12-agent-mesh', 'consensus-vote', 'parallel-exec', 'self-heal']],
    ['Recon Swarm', 'swarm', 999, ['osint', 'competitor-scan', 'web-search', 'aggregate']],
    ['ContentFactory Swarm', 'swarm', 1899, ['parallel-write', 'multi-channel', 'qa-loop', 'content-publish']],
    ['GrowthOps Swarm', 'swarm', 2499, ['ad-swarm', 'seo-swarm', 'crm-loop', 'a-b-test']],
    ['SupportMesh Swarm', 'swarm', 1799, ['24-7-coverage', 'language-route', 'escalate', 'kb-keep']],
    ['Trader Swarm', 'swarm', 4999, ['signal-fusion', 'risk-budget', 'execution', 'guardrail']],
    ['Research Swarm', 'swarm', 1299, ['lit-search', 'cite-graph', 'critique', 'synthesise']],
    ['QA Swarm', 'swarm', 999, ['e2e-test', 'visual-diff', 'flake-detect', 'report']],
    ['Security Swarm', 'swarm', 3999, ['red-team', 'blue-team', 'threat-hunt', 'incident-respond']],
    ['Localization Swarm', 'swarm', 1599, ['multi-lang', 'rtl-check', 'qa-loop', 'translate']],
    ['DevSwarm Coding', 'swarm', 4499, ['plan-code-review', 'pr-loop', 'spec-to-code', 'test-gen']],
    ['DataOps Swarm', 'swarm', 2799, ['etl-build', 'qa-data', 'lineage', 'monitor']],
    ['Compliance Swarm', 'swarm', 3499, ['gdpr-soc2-hipaa', 'evidence-collect', 'audit-prep', 'report']],
    ['CreativeStudio Swarm', 'swarm', 1999, ['brief-to-asset', 'critique-loop', 'brand-apply', 'image-gen']],
    ['Sales Swarm', 'swarm', 2999, ['prospect', 'outreach', 'qualify', 'close']],

    // ── Teams (named composite squads) ─────────────────────────────────
    ['Editorial Team', 'team', 799, ['editor-in-chief', 'writers', 'fact-check', 'publish']],
    ['Newsroom Team', 'team', 1299, ['breaking-news', 'beat-writers', 'editor', 'distribute']],
    ['Product Team', 'team', 1899, ['pm-agent', 'designer-agent', 'engineer-agent', 'qa-agent']],
    ['Marketing Team', 'team', 1499, ['strategist', 'copywriter', 'designer', 'analyst']],
    ['SEO Team', 'team', 999, ['strategist', 'researcher', 'on-page', 'link-builder']],
    ['Performance Marketing Team', 'team', 2299, ['planner', 'creative', 'media-buyer', 'analyst']],
    ['Customer Success Team', 'team', 1399, ['onboarder', 'csm', 'renewal', 'expansion']],
    ['Finance Team', 'team', 1799, ['controller', 'fp&a', 'tax', 'treasury']],
    ['Legal Team', 'team', 2499, ['contracts', 'ip', 'privacy', 'litigation']],
    ['HR & People Team', 'team', 1199, ['recruiter', 'onboarder', 'l&d', 'perf-coach']],
    ['Engineering Team', 'team', 3499, ['architect', 'backend', 'frontend', 'sre']],
    ['Data Science Team', 'team', 2999, ['analyst', 'ml-engineer', 'data-eng', 'storyteller']],
    ['Trust & Safety Team', 'team', 1899, ['policy', 'moderation', 'investigations', 'appeals']],
    ['Brand Team', 'team', 1599, ['brand-strategist', 'designer', 'copywriter', 'social']],
    ['Community Team', 'team', 999, ['mod', 'events', 'ambassadors', 'feedback-loop']],

    // ── Enterprise / Orchestrators ─────────────────────────────────────
    ['Enterprise Command Center', 'enterprise', 9999, ['multi-team-orch', 'rbac', 'audit', 'sla']],
    ['Global Ops Orchestrator', 'enterprise', 14999, ['follow-the-sun', 'multi-region', 'failover', 'observability']],
    ['M&A Diligence Suite', 'enterprise', 19999, ['data-room', 'redline', 'financial-model', 'risk-map']],
    ['IPO Readiness Suite', 'enterprise', 24999, ['s1-draft', 'controls', 'investor-deck', 'comms']],
    ['Board Intelligence', 'enterprise', 7999, ['briefing-pack', 'kpi-narrate', 'risk-radar', 'minutes']],
    ['Executive Copilot', 'enterprise', 4999, ['inbox-zero', 'briefing', 'decision-log', 'delegate']],
    ['Strategy Lab', 'enterprise', 8999, ['scenario-plan', 'wargame', 'option-value', 'memo']],
    ['Risk & Resilience Suite', 'enterprise', 11999, ['threat-model', 'bcp', 'tabletop', 'report']],
    ['Mega-Pipeline Orchestrator', 'orchestrator', 6999, ['1000-agent-fanout', 'queue', 'retry', 'observability']],
    ['Workflow Composer Pro', 'orchestrator', 1999, ['drag-drop', 'conditional', 'webhook', 'sla']],
    ['Plan-Execute-Reflect Loop', 'orchestrator', 2499, ['plan', 'act', 'reflect', 'memory']],
    ['Tree-of-Thought Engine', 'orchestrator', 1799, ['branch-search', 'prune', 'rerank', 'merge']],
    ['Graph-of-Agents Router', 'orchestrator', 2299, ['dag-build', 'cost-route', 'fallback', 'trace']],
    ['Skill Marketplace Router', 'orchestrator', 1499, ['skill-pick', 'cost-quality', 'rate-limit', 'cache']],

    // ── Autonomous / 24-7 ─────────────────────────────────────────────
    ['Autonomous Storefront', 'autonomous', 3999, ['catalog-curate', 'pricing', 'ads-rotate', 'cs-reply']],
    ['Autonomous Newsroom', 'autonomous', 2999, ['watch-feeds', 'verify', 'write', 'publish']],
    ['Autonomous Recruiter', 'autonomous', 2499, ['source', 'screen', 'schedule', 'feedback']],
    ['Autonomous SOC', 'autonomous', 7999, ['detect', 'triage', 'contain', 'report']],
    ['Autonomous Trader Suite', 'autonomous', 14999, ['signal', 'risk', 'execute', 'reconcile']],
    ['Autonomous Researcher', 'autonomous', 1999, ['hypothesise', 'experiment', 'analyse', 'write-up']],

    // ── Quantum & Elite ───────────────────────────────────────────────
    ['Quantum Optimizer Suite', 'quantum', 9999, ['qubo', 'annealer', 'classical-fallback', 'benchmark']],
    ['Quantum-Safe Vault Ops', 'quantum', 4999, ['pqc-rotate', 'kyber', 'dilithium', 'audit']],
    ['Quantum Forecaster', 'quantum', 6999, ['qml-forecast', 'classical-blend', 'monitor', 'report']],
    ['Elite CMO Copilot', 'elite', 2499, ['portfolio-strategy', 'budget-shift', 'mmm', 'narrate']],
    ['Elite CFO Copilot', 'elite', 2999, ['close-the-books', 'forecast', 'investor-comms', 'risk']],
    ['Elite CTO Copilot', 'elite', 2999, ['arch-review', 'roadmap', 'hire-plan', 'incident']],
    ['Elite COO Copilot', 'elite', 2799, ['ops-review', 'sla', 'vendor', 'capacity']],
    ['Elite Founder Copilot', 'elite', 1999, ['fundraise', 'storyline', 'metrics', 'hiring']],
    ['Elite Creator Copilot', 'elite', 1499, ['brand-arc', 'multi-platform', 'monetise', 'community']],
    ['White-Glove Concierge', 'elite', 24999, ['dedicated-pod', 'sla-1h', 'custom-models', 'priority']],
  ];
  return seed.map(([name, category, price, capabilities], i) => ({
    agentId: `swarm-${String(i + 1).padStart(3, '0')}`,
    name,
    category,
    rating: parseFloat((4.5 + ((i * 7) % 6) / 10).toFixed(1)),
    usageCount: 50 + ((i * 613) % 4200),
    price,
    capabilities,
    installed: false,
  }));
}

// ─── Extended Agent Catalog (100+) ───────────────────────────────────────────
function buildExtendedAgentCatalog(): MarketplaceAgent[] {
  const seed: Array<[string, AgentCategory, number, string[]]> = [
    ['BlogForge Pro', 'content', 34, ['long-form', 'seo-optimisation', 'image-gen', 'content-publish']],
    ['HeadlineHero', 'content', 14, ['copywriting', 'a-b-headlines', 'sentiment-analyze']],
    ['Newsletter Nova', 'content', 22, ['newsletter-draft', 'segment-personalise', 'email-send']],
    ['Caption King', 'social', 12, ['caption-gen', 'hashtag-research', 'content-publish']],
    ['ThreadSpinner', 'social', 18, ['twitter-threads', 'hook-writing', 'audience-segment']],
    ['ReelRanger', 'video', 39, ['shorts-script', 'trend-watch', 'b-roll-search']],
    ['ShortsAlchemist', 'video', 49, ['vertical-video', 'caption-burnin', 'hook-frames']],
    ['PodcastPilot', 'video', 29, ['episode-outline', 'show-notes', 'transcript-clean']],
    ['VoiceClone Studio', 'video', 59, ['voice-synthesis', 'multi-lang', 'lipsync']],
    ['LiveStream Coach', 'video', 45, ['live-overlay', 'chat-mod', 'highlight-clip']],
    ['SEO Sentinel', 'seo', 49, ['keyword-research', 'serp-track', 'on-page-audit']],
    ['BacklinkBuilder', 'seo', 69, ['link-prospecting', 'outreach-email', 'anchor-vary']],
    ['SchemaSmith', 'seo', 19, ['structured-data', 'rich-results', 'audit']],
    ['LocalRank Pro', 'seo', 29, ['gbp-optimise', 'review-reply', 'citations']],
    ['AdCopy Genius', 'ads', 39, ['google-ads', 'meta-ads', 'a-b-test']],
    ['CampaignMaestro', 'ads', 79, ['budget-pacing', 'roas-optimise', 'creative-rotate']],
    ['LookalikeLens', 'ads', 59, ['audience-build', 'pixel-events', 'retarget']],
    ['CreativeForge Ads', 'ads', 49, ['static-creative', 'video-creative', 'variant-gen']],
    ['EmailDeliverability Doc', 'email', 29, ['spf-dkim', 'warmup', 'inbox-place']],
    ['SequenceArchitect', 'email', 39, ['drip-build', 'cohort-trigger', 'email-send']],
    ['SubjectLineLab', 'email', 19, ['subject-test', 'open-rate-pred', 'preview-text']],
    ['ColdOutreach Hawk', 'email', 49, ['lead-find', 'personalise', 'email-send']],
    ['CartRescuer', 'ecommerce', 39, ['abandon-recover', 'discount-trigger', 'sms-send']],
    ['PriceWatcher', 'ecommerce', 29, ['competitor-scan', 'price-optimize', 'alerts']],
    ['InventoryOracle', 'ecommerce', 49, ['demand-forecast', 'restock-suggest', 'sku-cluster']],
    ['ReviewSentry', 'ecommerce', 19, ['review-reply', 'sentiment-analyze', 'flag-fraud']],
    ['UpsellArchitect', 'ecommerce', 59, ['bundle-suggest', 'post-purchase', 'price-optimize']],
    ['FraudShield', 'security', 79, ['risk-score', 'velocity-check', 'chargeback-defend']],
    ['BotBlocker', 'security', 39, ['bot-detect', 'rate-limit', 'turnstile']],
    ['SecretsScanner', 'security', 29, ['repo-scan', 'leak-alert', 'rotate-key']],
    ['SOC2 Companion', 'compliance', 99, ['evidence-collect', 'audit-prep', 'pdf-generate']],
    ['GDPR Concierge', 'compliance', 49, ['dsar-handle', 'consent-log', 'gdpr-check']],
    ['HIPAA Helper', 'compliance', 89, ['phi-redact', 'baa-track', 'audit']],
    ['TaxBot Global', 'finance', 59, ['vat-calc', 'sales-tax', 'reporting']],
    ['InvoiceInk', 'finance', 19, ['invoice-gen', 'pdf-generate', 'reminder-send']],
    ['CashflowOracle', 'finance', 49, ['cashflow-forecast', 'runway-calc', 'alerts']],
    ['ExpenseHawk', 'finance', 29, ['receipt-parse', 'category-tag', 'reconcile']],
    ['PayoutPilot', 'finance', 39, ['payout-schedule', 'multi-currency', 'fx-hedge']],
    ['AffiliateAce', 'growth', 49, ['link-track', 'commission-calc', 'leaderboard']],
    ['ReferralRocket', 'growth', 39, ['referral-flow', 'reward-issue', 'fraud-detect']],
    ['ChurnGuard', 'growth', 69, ['churn-predict', 'win-back', 'segment-trigger']],
    ['OnboardOptimizer', 'growth', 29, ['flow-build', 'tooltip-gen', 'a-b-test']],
    ['LandingPageLab', 'growth', 49, ['copy-gen', 'layout-suggest', 'a-b-test']],
    ['CRO Coach', 'growth', 59, ['heatmap-read', 'experiment-plan', 'lift-estimate']],
    ['CommunityCurator', 'community', 39, ['discord-mod', 'circle-mod', 'auto-welcome']],
    ['ModSquad AI', 'community', 29, ['toxicity-detect', 'auto-action', 'appeal-route']],
    ['EventOrchestrator', 'community', 49, ['rsvp-flow', 'reminder-send', 'calendar-book']],
    ['LoyaltyLoom', 'community', 39, ['tier-build', 'reward-issue', 'analytics-query']],
    ['SuperfanSpotter', 'community', 29, ['ltv-rank', 'engagement-score', 'segment']],
    ['SupportSage', 'support', 39, ['ticket-triage', 'kb-suggest', 'reply-draft']],
    ['ChatTriage', 'support', 19, ['intent-detect', 'route-agent', 'sentiment-analyze']],
    ['VoiceBot Concierge', 'support', 79, ['phone-answer', 'ivr-build', 'transcribe']],
    ['KBKeeper', 'support', 29, ['article-write', 'gap-detect', 'translate']],
    ['DocsBot Realtime', 'support', 39, ['rag-search', 'inline-cite', 'feedback-loop']],
    ['DataPipelinePilot', 'data', 89, ['etl-build', 'schema-infer', 'monitor']],
    ['SQLSorcerer', 'data', 49, ['nl2sql', 'analytics-query', 'explain-plan']],
    ['DashboardDruid', 'data', 39, ['chart-suggest', 'kpi-build', 'embed']],
    ['CohortConjurer', 'data', 49, ['cohort-build', 'retention-curve', 'segment']],
    ['AttributionAlchemist', 'data', 79, ['multi-touch', 'mmm-lite', 'channel-rank']],
    ['ABTestArchitect', 'analytics', 59, ['power-calc', 'guardrail', 'lift-detect']],
    ['ForecastFalcon', 'analytics', 69, ['ts-forecast', 'anomaly-detect', 'alerts']],
    ['AnomalyHound', 'analytics', 49, ['drift-detect', 'alerts', 'root-cause']],
    ['PersonaPainter', 'analytics', 29, ['persona-build', 'cluster', 'narrate']],
    ['DesignDeck AI', 'design', 49, ['slide-gen', 'brand-apply', 'image-gen']],
    ['BrandKitGen', 'design', 39, ['logo-suggest', 'palette', 'type-pair']],
    ['ThumbnailWizard', 'design', 19, ['yt-thumb', 'a-b-test', 'image-gen']],
    ['UIComposer', 'design', 59, ['wireframe', 'figma-export', 'token-apply']],
    ['IconForge', 'design', 14, ['icon-gen', 'svg-clean', 'set-pack']],
    ['ProductivityPal', 'productivity', 19, ['inbox-zero', 'meeting-summarise', 'calendar-book']],
    ['MeetingMinuteMaker', 'productivity', 24, ['transcribe', 'action-extract', 'send-recap']],
    ['TaskRouter', 'productivity', 19, ['task-route', 'workload-balance', 'slack-notify']],
    ['FocusGuardian', 'productivity', 9, ['notification-mute', 'time-block', 'report']],
    ['DocsCopilot', 'productivity', 29, ['draft-doc', 'summarise', 'translate']],
    ['DevOpsDispatcher', 'devops', 79, ['deploy-orchestrate', 'rollback', 'incident-notify']],
    ['LogLoom', 'devops', 49, ['log-cluster', 'anomaly-detect', 'alerts']],
    ['CodeReviewer AI', 'devops', 59, ['pr-review', 'security-scan', 'style-fix']],
    ['BugBountyHunter', 'devops', 99, ['fuzz-test', 'cve-scan', 'report']],
    ['LoadTestLion', 'devops', 39, ['k6-script', 'capacity-plan', 'sla-check']],
    ['HRHelper', 'hr', 29, ['jd-write', 'screen-cv', 'interview-kit']],
    ['OnboardHR Buddy', 'hr', 19, ['checklist-gen', 'doc-collect', 'reminder-send']],
    ['PerfReview Coach', 'hr', 39, ['review-draft', 'feedback-norm', 'goal-track']],
    ['LegalLens', 'legal', 79, ['contract-review', 'redline', 'clause-library']],
    ['NDABuilder', 'legal', 19, ['nda-gen', 'pdf-generate', 'esign']],
    ['TrademarkTracker', 'legal', 29, ['mark-watch', 'opposition-alert', 'class-search']],
    ['ResearchRanger', 'research', 49, ['lit-search', 'summarise', 'cite-graph']],
    ['MarketScout', 'research', 39, ['competitor-scan', 'tam-estimate', 'trend-watch']],
    ['SurveySage', 'research', 29, ['survey-design', 'analyse', 'persona-update']],
    ['UserInterviewer', 'research', 39, ['interview-script', 'transcribe', 'theme-extract']],
    ['Web3Wrangler', 'web3', 89, ['contract-deploy', 'gas-optimise', 'audit-lite']],
    ['NFTNurturer', 'web3', 49, ['mint-flow', 'royalty-track', 'metadata']],
    ['DAOConductor', 'web3', 79, ['proposal-draft', 'snapshot-vote', 'treasury-report']],
    ['TokenTactician', 'web3', 99, ['tokenomics-sim', 'vesting-build', 'audit-lite']],
    ['QuantumKeeper', 'security', 119, ['pqc-rotate', 'kyber-key', 'audit']],
    ['BiasBuster', 'compliance', 49, ['model-audit', 'fairness-score', 'report']],
    ['ContentModerator AI', 'compliance', 39, ['nsfw-detect', 'pii-redact', 'flag']],
    ['TranslationTitan', 'content', 29, ['translate', 'localise', 'glossary']],
    ['LocaleLab', 'content', 24, ['i18n-extract', 'locale-test', 'rtl-check']],
    ['SocialScheduler', 'social', 19, ['multi-post', 'best-time', 'content-publish']],
    ['InfluencerInk', 'social', 49, ['creator-find', 'outreach', 'roi-track']],
    ['StoryStitcher', 'social', 19, ['story-build', 'sticker-suggest', 'content-publish']],
    ['TrendOracle', 'social', 39, ['trend-watch', 'hashtag-rank', 'sound-pick']],
    ['CourseCraft AI', 'content', 59, ['curriculum-build', 'quiz-gen', 'video-script']],
    ['QuizForge', 'content', 14, ['quiz-build', 'grade-auto', 'lead-capture']],
    ['EbookEngine', 'content', 24, ['outline', 'chapter-draft', 'pdf-generate']],
    ['AffiliateRecruiter', 'growth', 39, ['partner-find', 'outreach', 'crm-lookup']],
    ['LeadScorer Plus', 'growth', 49, ['lead-score', 'enrich', 'route']],
    ['WebinarWizard', 'growth', 39, ['funnel-build', 'reminder-send', 'replay-publish']],
    ['Sustainability Sage', 'compliance', 29, ['carbon-track', 'esg-report', 'pdf-generate']],
    ['AccessibilityAce', 'design', 19, ['wcag-audit', 'alt-text', 'contrast-fix']],
    ['PrivacyPilot', 'compliance', 39, ['cookie-consent', 'policy-gen', 'dsar-handle']],
  ];
  return seed.map(([name, category, price, capabilities], i) => ({
    agentId: `mkt-${String(i + 9).padStart(3, '0')}`,
    name,
    category,
    rating: parseFloat((4.0 + ((i * 13) % 11) / 10).toFixed(1)),
    usageCount: 800 + ((i * 977) % 24000),
    price,
    capabilities,
    installed: false,
  }));
}

/** Install an agent by id. Returns the updated agent record. */
export function installAgent(agentId: string): MarketplaceAgent {
  const agent = MARKETPLACE_AGENTS.find((a) => a.agentId === agentId);
  if (!agent) throw new Error(`Agent ${agentId} not found in marketplace.`);
  agent.installed = true;
  agent.usageCount += 1;
  return { ...agent };
}

/** Return the top N marketplace agents sorted by rating × log(usageCount). */
export function getTopAgents(n: number = 5): MarketplaceAgent[] {
  return [...MARKETPLACE_AGENTS]
    .sort((a, b) => b.rating * Math.log(b.usageCount + 1) - a.rating * Math.log(a.usageCount + 1))
    .slice(0, n);
}

// ─── Memory Consolidation ────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  agentId: string;
  content: string;
  importance: number; // 0–1
  tags: string[];
  accessCount: number;
  createdAt: Date;
}

/**
 * Score a memory entry by importance × recency decay.
 * Recency half-life is 7 days.
 */
function scoreMemory(entry: MemoryEntry, now: Date): number {
  const ageMs = now.getTime() - entry.createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const halfLife = 7;
  const recency = Math.pow(0.5, ageDays / halfLife);
  const accessBoost = Math.log(entry.accessCount + 1) * 0.1;
  return entry.importance * recency + accessBoost;
}

/**
 * Consolidate memory entries: score each, keep the top `maxEntries`.
 */
export function consolidateMemories(
  entries: MemoryEntry[],
  maxEntries: number,
): MemoryEntry[] {
  if (entries.length <= maxEntries) return entries;
  const now = new Date();
  return [...entries]
    .sort((a, b) => scoreMemory(b, now) - scoreMemory(a, now))
    .slice(0, maxEntries);
}

// ─── Task Routing ────────────────────────────────────────────────────────────

export interface RoutableAgent {
  id: string;
  name: string;
  capabilities: string[];
}

export interface RoutingResult {
  agentId: string;
  agentName: string;
  confidence: number; // 0–1
  matchedCapabilities: string[];
}

/**
 * Route a task description to the best available agent.
 * Matching is keyword-based; confidence = matched / task keywords.
 */
export function routeTask(task: string, availableAgents: RoutableAgent[]): RoutingResult {
  if (availableAgents.length === 0) throw new Error('No agents available for routing.');

  const keywords = task
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const scored = availableAgents.map((agent) => {
    const matched = agent.capabilities.filter((cap) =>
      keywords.some((kw) => cap.includes(kw) || kw.includes(cap.replace(/-/g, ''))),
    );
    const confidence = keywords.length > 0 ? matched.length / keywords.length : 0;
    return { agent, matched, confidence };
  });

  scored.sort((a, b) => b.confidence - a.confidence);
  const best = scored[0];

  return {
    agentId: best.agent.id,
    agentName: best.agent.name,
    confidence: parseFloat(Math.min(best.confidence, 1).toFixed(3)),
    matchedCapabilities: best.matched,
  };
}
