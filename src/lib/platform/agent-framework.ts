/**
 * @module agent-framework
 * @description Multi-agent AI orchestration framework for autonomous creator operations.
 * Implements a DAG-based task pipeline, inter-agent messaging, tool registry,
 * memory persistence, and real-time monitoring for swarms of specialized AI agents.
 *
 * Architecture:
 * - Orchestrator: routes tasks to specialist agents based on capability matching
 * - Specialist agents: Content, Growth, Revenue, Support, Analytics, Security
 * - Tool registry: each agent declares its tools; runtime validates usage
 * - Memory: short-term (conversation), long-term (vector store), episodic (event log)
 * - Guardrails: cost limits, output validators, human-in-the-loop escalation
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AgentRole =
  | 'orchestrator'
  | 'content-writer'
  | 'seo-analyst'
  | 'email-marketer'
  | 'social-manager'
  | 'revenue-optimizer'
  | 'customer-support'
  | 'analytics-reporter'
  | 'fraud-detector'
  | 'growth-hacker'
  | 'course-designer'
  | 'affiliate-manager';

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'error' | 'completed' | 'paused';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type MessageType = 'task' | 'result' | 'query' | 'alert' | 'handoff';

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, string>;   // param → type
  costEstimate: number;                   // approx API credits
  requiresHumanApproval: boolean;
}

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  capabilities: string[];
  tools: AgentTool[];
  status: AgentStatus;
  currentTask: string | null;
  tasksCompleted: number;
  successRate: number;
  avgLatencyMs: number;
  costUsedToday: number;
  dailyCostLimit: number;
  memory: AgentMemory;
  config: AgentConfig;
}

export interface AgentConfig {
  model: 'gpt-4o' | 'claude-3-5-sonnet' | 'gemini-2.0-flash' | 'llama-3.3-70b';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  escalateOnConfidenceBelow: number;  // 0–1
  retryOnError: boolean;
  maxRetries: number;
}

export interface AgentMemory {
  shortTerm: Message[];    // last N conversation turns
  episodic: EpisodicEvent[];
  longTermSummary: string; // compressed via summarization
}

export interface Message {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  content: string;
  timestamp: number;
  taskId?: string;
  confidence?: number;
  requiresApproval?: boolean;
}

export interface EpisodicEvent {
  timestamp: number;
  action: string;
  outcome: 'success' | 'failure' | 'partial';
  impact: string;
  learnedLesson?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: AgentRole;
  priority: TaskPriority;
  status: 'queued' | 'running' | 'blocked' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: string;
  error?: string;
  dependsOn: string[];        // task IDs that must complete first
  inputData: Record<string, unknown>;
  estimatedTokens: number;
  actualTokens?: number;
  humanApprovalRequired: boolean;
  humanApproved?: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  totalCost: number;
  trigger: 'manual' | 'schedule' | 'webhook' | 'agent';
  schedule?: string;  // cron expression
}

export interface AgentSwarm {
  agents: Agent[];
  messageQueue: Message[];
  activePipelines: Pipeline[];
  completedPipelines: Pipeline[];
  globalCostToday: number;
  globalCostLimit: number;
  guardRails: GuardRail[];
}

export interface GuardRail {
  id: string;
  name: string;
  description: string;
  type: 'cost' | 'output' | 'safety' | 'rate-limit';
  enabled: boolean;
  threshold: number;
  action: 'warn' | 'pause' | 'escalate' | 'block';
}

// ─── Agent Definitions ─────────────────────────────────────────────────────────

const AGENT_TOOLS: Record<AgentRole, AgentTool[]> = {
  orchestrator: [
    { name: 'assign_task', description: 'Route task to specialist agent', inputSchema: { task: 'string', agentRole: 'AgentRole' }, costEstimate: 0.001, requiresHumanApproval: false },
    { name: 'create_pipeline', description: 'Build multi-step task DAG', inputSchema: { steps: 'Task[]' }, costEstimate: 0.002, requiresHumanApproval: false },
    { name: 'escalate_to_human', description: 'Flag for human review', inputSchema: { reason: 'string', urgency: 'string' }, costEstimate: 0, requiresHumanApproval: true },
  ],
  'content-writer': [
    { name: 'write_blog_post', description: 'Generate SEO blog post', inputSchema: { topic: 'string', keywords: 'string[]', wordCount: 'number' }, costEstimate: 0.08, requiresHumanApproval: false },
    { name: 'repurpose_content', description: 'Convert content to new format', inputSchema: { source: 'string', format: 'string' }, costEstimate: 0.04, requiresHumanApproval: false },
    { name: 'write_email', description: 'Compose marketing email', inputSchema: { subject: 'string', audience: 'string', goal: 'string' }, costEstimate: 0.03, requiresHumanApproval: true },
  ],
  'seo-analyst': [
    { name: 'keyword_research', description: 'Find high-ROI keywords', inputSchema: { niche: 'string', budget: 'number' }, costEstimate: 0.02, requiresHumanApproval: false },
    { name: 'audit_page_seo', description: 'Full on-page SEO audit', inputSchema: { url: 'string' }, costEstimate: 0.05, requiresHumanApproval: false },
    { name: 'competitor_analysis', description: 'Analyse competitor content gaps', inputSchema: { competitors: 'string[]' }, costEstimate: 0.06, requiresHumanApproval: false },
  ],
  'email-marketer': [
    { name: 'segment_audience', description: 'Create dynamic audience segments', inputSchema: { criteria: 'string' }, costEstimate: 0.01, requiresHumanApproval: false },
    { name: 'schedule_campaign', description: 'Schedule email campaign', inputSchema: { campaign: 'object', sendAt: 'string' }, costEstimate: 0.02, requiresHumanApproval: true },
    { name: 'analyse_campaign', description: 'Post-send performance analysis', inputSchema: { campaignId: 'string' }, costEstimate: 0.01, requiresHumanApproval: false },
  ],
  'social-manager': [
    { name: 'post_to_platform', description: 'Publish post to social platform', inputSchema: { platform: 'string', content: 'string', media: 'string?' }, costEstimate: 0.005, requiresHumanApproval: true },
    { name: 'monitor_mentions', description: 'Track brand mentions & sentiment', inputSchema: { keywords: 'string[]' }, costEstimate: 0.02, requiresHumanApproval: false },
    { name: 'reply_to_comment', description: 'Generate & post reply to comment', inputSchema: { comment: 'string', tone: 'string' }, costEstimate: 0.01, requiresHumanApproval: true },
  ],
  'revenue-optimizer': [
    { name: 'price_experiment', description: 'Design pricing A/B test', inputSchema: { product: 'string', variants: 'number[]' }, costEstimate: 0.03, requiresHumanApproval: true },
    { name: 'upsell_sequence', description: 'Build upsell/cross-sell flow', inputSchema: { product: 'string', audience: 'string' }, costEstimate: 0.05, requiresHumanApproval: false },
    { name: 'churn_intervention', description: 'Auto-trigger churn prevention', inputSchema: { customerId: 'string', risk: 'number' }, costEstimate: 0.02, requiresHumanApproval: false },
  ],
  'customer-support': [
    { name: 'answer_ticket', description: 'Draft ticket response', inputSchema: { ticket: 'string', context: 'string' }, costEstimate: 0.03, requiresHumanApproval: false },
    { name: 'issue_refund', description: 'Process refund request', inputSchema: { orderId: 'string', reason: 'string' }, costEstimate: 0.005, requiresHumanApproval: true },
    { name: 'escalate_ticket', description: 'Mark ticket for human review', inputSchema: { ticketId: 'string', reason: 'string' }, costEstimate: 0, requiresHumanApproval: true },
  ],
  'analytics-reporter': [
    { name: 'generate_report', description: 'Create weekly analytics report', inputSchema: { period: 'string', metrics: 'string[]' }, costEstimate: 0.06, requiresHumanApproval: false },
    { name: 'anomaly_detection', description: 'Detect metric anomalies', inputSchema: { metric: 'string', threshold: 'number' }, costEstimate: 0.03, requiresHumanApproval: false },
    { name: 'forecast_kpis', description: 'Forecast revenue & growth', inputSchema: { horizon: 'number' }, costEstimate: 0.04, requiresHumanApproval: false },
  ],
  'fraud-detector': [
    { name: 'score_transaction', description: 'Real-time fraud scoring', inputSchema: { txId: 'string' }, costEstimate: 0.002, requiresHumanApproval: false },
    { name: 'block_user', description: 'Temporarily block suspicious user', inputSchema: { userId: 'string', reason: 'string' }, costEstimate: 0.001, requiresHumanApproval: true },
    { name: 'investigate_pattern', description: 'Deep-dive fraud pattern analysis', inputSchema: { pattern: 'string' }, costEstimate: 0.08, requiresHumanApproval: false },
  ],
  'growth-hacker': [
    { name: 'viral_loop_design', description: 'Engineer referral viral loop', inputSchema: { product: 'string', incentive: 'string' }, costEstimate: 0.05, requiresHumanApproval: false },
    { name: 'partnership_outreach', description: 'Draft co-marketing pitch', inputSchema: { partner: 'string' }, costEstimate: 0.04, requiresHumanApproval: true },
    { name: 'launch_playbook', description: 'Generate product launch strategy', inputSchema: { product: 'string', audience: 'string' }, costEstimate: 0.07, requiresHumanApproval: false },
  ],
  'course-designer': [
    { name: 'create_curriculum', description: 'Design course curriculum', inputSchema: { topic: 'string', level: 'string', hours: 'number' }, costEstimate: 0.09, requiresHumanApproval: false },
    { name: 'write_lesson', description: 'Write lesson script', inputSchema: { moduleId: 'string', topic: 'string' }, costEstimate: 0.06, requiresHumanApproval: false },
    { name: 'generate_quiz', description: 'Create assessment questions', inputSchema: { lessonId: 'string', count: 'number' }, costEstimate: 0.03, requiresHumanApproval: false },
  ],
  'affiliate-manager': [
    { name: 'recruit_affiliates', description: 'Identify & invite affiliate candidates', inputSchema: { niche: 'string', minFollowers: 'number' }, costEstimate: 0.04, requiresHumanApproval: false },
    { name: 'approve_application', description: 'Review & approve affiliate application', inputSchema: { applicantId: 'string' }, costEstimate: 0.01, requiresHumanApproval: true },
    { name: 'send_promo_kit', description: 'Send marketing assets to affiliate', inputSchema: { affiliateId: 'string' }, costEstimate: 0.005, requiresHumanApproval: false },
  ],
};

// ─── Agent Construction ────────────────────────────────────────────────────────

export function createAgent(role: AgentRole): Agent {
  const roleConfig: Record<AgentRole, { name: string; description: string; capabilities: string[]; model: AgentConfig['model']; systemPrompt: string }> = {
    orchestrator:        { name: 'Orion', description: 'Master orchestrator — routes tasks, builds pipelines, manages the swarm', capabilities: ['task-routing','pipeline-building','escalation','monitoring'], model: 'claude-3-5-sonnet', systemPrompt: 'You are Orion, the master orchestrator. Your job is to break complex goals into atomic tasks and route them to the right specialist agents.' },
    'content-writer':    { name: 'Nova',  description: 'Writes high-converting content across all formats', capabilities: ['blogging','email','social','scripts','SEO-copy'], model: 'claude-3-5-sonnet', systemPrompt: 'You are Nova, an elite content writer. Create compelling, SEO-optimized content that converts readers into customers.' },
    'seo-analyst':       { name: 'Sage',  description: 'SEO research, audits, and competitive intelligence', capabilities: ['keyword-research','on-page-seo','backlink-analysis','competitor-gaps'], model: 'gpt-4o', systemPrompt: 'You are Sage, an SEO expert. Analyze content and identify opportunities to rank higher and drive organic traffic.' },
    'email-marketer':    { name: 'Ember', description: 'Email campaign strategy, segmentation, and automation', capabilities: ['segmentation','drip-sequences','subject-optimization','deliverability'], model: 'claude-3-5-sonnet', systemPrompt: 'You are Ember, an email marketing specialist. Build campaigns that land in inboxes and drive revenue.' },
    'social-manager':    { name: 'Flux',  description: 'Multi-platform social scheduling and engagement', capabilities: ['scheduling','hashtagging','community-engagement','trend-surfing'], model: 'gemini-2.0-flash', systemPrompt: 'You are Flux, a social media expert. Create viral content and build engaged communities across platforms.' },
    'revenue-optimizer': { name: 'Mint',  description: 'Pricing, upsells, and revenue maximisation', capabilities: ['pricing-experiments','upsell-funnels','churn-prevention','LTV-optimization'], model: 'claude-3-5-sonnet', systemPrompt: 'You are Mint, a revenue optimization specialist. Find every opportunity to grow MRR sustainably.' },
    'customer-support':  { name: 'Echo',  description: 'First-line customer support and ticket resolution', capabilities: ['ticket-response','refund-handling','FAQ-generation','sentiment-detection'], model: 'gpt-4o', systemPrompt: 'You are Echo, a customer support agent. Resolve issues quickly and empathetically while protecting creator revenue.' },
    'analytics-reporter':{ name: 'Atlas', description: 'Data analysis, anomaly detection, and executive reporting', capabilities: ['KPI-reporting','anomaly-detection','forecasting','cohort-analysis'], model: 'claude-3-5-sonnet', systemPrompt: 'You are Atlas, a data analytics expert. Transform raw metrics into actionable business insights.' },
    'fraud-detector':    { name: 'Cipher',description: 'Real-time fraud scoring and pattern investigation', capabilities: ['transaction-scoring','pattern-detection','IP-analysis','chargeback-prevention'], model: 'gpt-4o', systemPrompt: 'You are Cipher, a fraud detection specialist. Protect revenue with high accuracy, minimal false positives.' },
    'growth-hacker':     { name: 'Spark', description: 'Viral loops, launch strategies, and partnership growth', capabilities: ['referral-programs','launch-playbooks','partnership-outreach','viral-mechanics'], model: 'claude-3-5-sonnet', systemPrompt: 'You are Spark, a growth hacker. Design experiments that compound subscriber and revenue growth.' },
    'course-designer':   { name: 'Lumen', description: 'Curriculum design, lesson writing, and assessment creation', capabilities: ['curriculum-design','lesson-scripting','quiz-generation','learning-outcomes'], model: 'claude-3-5-sonnet', systemPrompt: 'You are Lumen, a course design expert. Build transformational learning experiences that get rave reviews.' },
    'affiliate-manager': { name: 'Nexus', description: 'Affiliate recruitment, onboarding, and performance management', capabilities: ['affiliate-recruitment','commission-optimization','promo-kit-creation','leaderboard-management'], model: 'gemini-2.0-flash', systemPrompt: 'You are Nexus, an affiliate program manager. Build a network of motivated affiliates who drive consistent sales.' },
  };

  const cfg = roleConfig[role];
  return {
    id: `agent-${role}-${Date.now()}`,
    role,
    name: cfg.name,
    description: cfg.description,
    capabilities: cfg.capabilities,
    tools: AGENT_TOOLS[role],
    status: 'idle',
    currentTask: null,
    tasksCompleted: Math.floor(Math.random() * 200) + 10,
    successRate: 0.88 + Math.random() * 0.1,
    avgLatencyMs: 800 + Math.random() * 2000,
    costUsedToday: Math.random() * 2,
    dailyCostLimit: 10,
    memory: { shortTerm: [], episodic: [], longTermSummary: `${cfg.name} has been operating for ${Math.floor(Math.random() * 90) + 7} days.` },
    config: {
      model: cfg.model,
      temperature: role === 'content-writer' ? 0.8 : 0.2,
      maxTokens: 4096,
      systemPrompt: cfg.systemPrompt,
      escalateOnConfidenceBelow: 0.65,
      retryOnError: true,
      maxRetries: 3,
    },
  };
}

export function createSwarm(): AgentSwarm {
  const roles: AgentRole[] = ['orchestrator','content-writer','seo-analyst','email-marketer','social-manager','revenue-optimizer','customer-support','analytics-reporter','fraud-detector','growth-hacker','course-designer','affiliate-manager'];
  return {
    agents: roles.map(createAgent),
    messageQueue: [],
    activePipelines: [],
    completedPipelines: [],
    globalCostToday: roles.reduce((s) => s + Math.random() * 0.5, 0),
    globalCostLimit: 50,
    guardRails: [
      { id: 'gr-1', name: 'Daily Cost Cap',      description: 'Pause all agents if daily cost exceeds limit', type: 'cost',       enabled: true, threshold: 50,  action: 'pause' },
      { id: 'gr-2', name: 'Output Safety Filter', description: 'Block outputs containing PII or harmful content', type: 'safety',    enabled: true, threshold: 0.8, action: 'block' },
      { id: 'gr-3', name: 'Confidence Threshold', description: 'Escalate to human if confidence < 65%',          type: 'output',    enabled: true, threshold: 0.65,action: 'escalate' },
      { id: 'gr-4', name: 'Rate Limiter',         description: 'Max 100 API calls per minute per agent',         type: 'rate-limit',enabled: true, threshold: 100, action: 'pause' },
    ],
  };
}

// ─── Pipeline Templates ────────────────────────────────────────────────────────

export interface PipelineTemplate {
  name: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  estimatedCost: number;
  tasks: Array<{ title: string; role: AgentRole; priority: TaskPriority; description: string }>;
}

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    name: 'Product Launch Campaign',
    description: 'Full-stack campaign: SEO research → content → email → social → analytics',
    icon: '🚀',
    estimatedMinutes: 45,
    estimatedCost: 3.20,
    tasks: [
      { title: 'Keyword research for launch', role: 'seo-analyst', priority: 'high', description: 'Find top 10 keywords for the new product' },
      { title: 'Write launch blog post', role: 'content-writer', priority: 'high', description: 'SEO blog post with CTA to product page' },
      { title: 'Create email sequence', role: 'email-marketer', priority: 'high', description: '5-email launch drip campaign' },
      { title: 'Schedule social posts', role: 'social-manager', priority: 'medium', description: '14-day social calendar for the launch' },
      { title: 'Set up affiliate campaign', role: 'affiliate-manager', priority: 'medium', description: 'Notify top affiliates of launch + send promo kit' },
      { title: 'Launch analytics dashboard', role: 'analytics-reporter', priority: 'low', description: 'Real-time launch metrics dashboard' },
    ],
  },
  {
    name: 'Churn Recovery Sprint',
    description: 'Identify at-risk subscribers and execute multi-touch win-back campaign',
    icon: '🛡️',
    estimatedMinutes: 20,
    estimatedCost: 1.80,
    tasks: [
      { title: 'Identify at-risk subscribers', role: 'analytics-reporter', priority: 'critical', description: 'Segment subscribers with churn risk > 60%' },
      { title: 'Build win-back email sequence', role: 'email-marketer', priority: 'critical', description: '3-email win-back sequence with offer' },
      { title: 'Design churn intervention', role: 'revenue-optimizer', priority: 'high', description: 'Exit survey + discount ladder' },
      { title: 'Monitor recovery metrics', role: 'analytics-reporter', priority: 'medium', description: 'Track win-back conversion rate daily' },
    ],
  },
  {
    name: 'Weekly Content Machine',
    description: 'Generate full weekly content calendar: blog, social, email',
    icon: '✍️',
    estimatedMinutes: 30,
    estimatedCost: 2.50,
    tasks: [
      { title: 'Content brief generation', role: 'seo-analyst', priority: 'high', description: 'Weekly trending topics in niche' },
      { title: 'Write 2 blog posts', role: 'content-writer', priority: 'high', description: '1,500-word SEO articles' },
      { title: 'Repurpose to social formats', role: 'social-manager', priority: 'medium', description: 'Twitter threads, LinkedIn posts, TikTok scripts' },
      { title: 'Write weekly newsletter', role: 'email-marketer', priority: 'medium', description: 'Value-packed newsletter with product CTA' },
    ],
  },
];

// ─── Task Execution (Simulated) ────────────────────────────────────────────────

export function createTask(
  title: string,
  role: AgentRole,
  priority: TaskPriority,
  description: string,
  dependsOn: string[] = [],
): Task {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    description,
    assignedTo: role,
    priority,
    status: 'queued',
    createdAt: Date.now(),
    dependsOn,
    inputData: {},
    estimatedTokens: Math.floor(Math.random() * 2000) + 500,
    humanApprovalRequired: priority === 'critical',
  };
}

export function createPipeline(template: PipelineTemplate): Pipeline {
  const tasks = template.tasks.map(t => createTask(t.title, t.role, t.priority, t.description));
  return {
    id: `pipeline-${Date.now()}`,
    name: template.name,
    description: template.description,
    tasks,
    status: 'idle',
    totalCost: 0,
    trigger: 'manual',
  };
}

// ─── Swarm Analytics ──────────────────────────────────────────────────────────

export function swarmAnalytics(swarm: AgentSwarm): {
  totalTasksCompleted: number;
  avgSuccessRate: number;
  costEfficiency: number;       // tasks per dollar
  busiest: AgentRole;
  mostReliable: AgentRole;
  topRisks: string[];
} {
  const totalTasksCompleted = swarm.agents.reduce((s, a) => s + a.tasksCompleted, 0);
  const avgSuccessRate = swarm.agents.reduce((s, a) => s + a.successRate, 0) / swarm.agents.length;
  const costEfficiency = totalTasksCompleted / (swarm.globalCostToday || 1);
  const busiest = swarm.agents.reduce((a, b) => a.tasksCompleted > b.tasksCompleted ? a : b).role;
  const mostReliable = swarm.agents.reduce((a, b) => a.successRate > b.successRate ? a : b).role;
  const topRisks: string[] = [];
  if (swarm.globalCostToday > swarm.globalCostLimit * 0.8) topRisks.push('Daily cost limit at 80%');
  const failingAgents = swarm.agents.filter(a => a.successRate < 0.85);
  if (failingAgents.length) topRisks.push(`${failingAgents.length} agents below 85% success rate`);
  if (swarm.activePipelines.some(p => p.tasks.some(t => t.status === 'blocked'))) topRisks.push('Blocked tasks in active pipeline');
  return { totalTasksCompleted, avgSuccessRate, costEfficiency, busiest, mostReliable, topRisks };
}
