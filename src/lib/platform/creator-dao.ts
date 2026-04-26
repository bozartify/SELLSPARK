/**
 * @module creator-dao
 * @description Decentralized Autonomous Organisation (DAO) governance layer for
 * creator communities. Enables token-weighted voting, quadratic funding rounds,
 * multi-sig treasury management, and on-chain proposal lifecycle.
 *
 * All "on-chain" operations are simulated server-side — real deployment would
 * use Solana programs or EVM smart contracts. The module provides the business
 * logic layer that maps to real contract calls in production.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
export type VoteChoice = 'for' | 'against' | 'abstain';
export type FundingCategory = 'content' | 'tool' | 'event' | 'grant' | 'infrastructure';

export interface DAOToken {
  symbol: string;
  totalSupply: number;
  holders: number;
  decimals: number;
  vestingMonths: number;
}

export interface Member {
  address: string;
  tokens: number;
  votingPower: number;  // quadratic: sqrt(tokens)
  delegatedTo: string | null;
  delegatedFrom: string[];
  joinedAt: number;
  reputation: number;
  tier: 'citizen' | 'contributor' | 'core' | 'founder';
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  author: string;
  status: ProposalStatus;
  category: FundingCategory;
  requestedFunding: number;   // in USD
  createdAt: number;
  votingEndsAt: number;
  votes: Vote[];
  quorumRequired: number;     // fraction of total voting power
  passThreshold: number;      // fraction of cast votes needed to pass
  executionData?: string;     // encoded action (transfer / deploy / etc.)
  comments: Comment[];
}

export interface Vote {
  voter: string;
  choice: VoteChoice;
  votingPower: number;
  timestamp: number;
  reason?: string;
}

export interface Comment {
  author: string;
  content: string;
  timestamp: number;
  likes: number;
}

export interface Treasury {
  balances: Record<string, number>;  // currency → amount
  multisigSigners: string[];
  requiredSignatures: number;
  totalValueUSD: number;
  pendingTransactions: TreasuryTx[];
}

export interface TreasuryTx {
  id: string;
  to: string;
  amount: number;
  currency: string;
  purpose: string;
  signers: string[];
  executed: boolean;
  createdAt: number;
}

export interface QuadraticRound {
  id: string;
  title: string;
  matchingPool: number;
  projects: QFProject[];
  status: 'active' | 'closed' | 'distributed';
  endsAt: number;
}

export interface QFProject {
  id: string;
  name: string;
  description: string;
  recipient: string;
  contributions: Array<{ contributor: string; amount: number }>;
  matchedAmount: number;
}

export interface DAO {
  name: string;
  token: DAOToken;
  members: Member[];
  proposals: Proposal[];
  treasury: Treasury;
  quadraticRounds: QuadraticRound[];
  governanceParams: GovernanceParams;
}

export interface GovernanceParams {
  votingPeriodDays: number;
  quorum: number;            // 0–1
  passThreshold: number;     // 0–1
  proposalThreshold: number; // min tokens to submit
  timelockDays: number;
  delegationEnabled: boolean;
}

// ─── DAO Construction ─────────────────────────────────────────────────────────

export function createDAO(name: string, creatorAddress: string): DAO {
  const token: DAOToken = {
    symbol: name.slice(0, 4).toUpperCase() + 'DAO',
    totalSupply: 10_000_000,
    holders: 1,
    decimals: 6,
    vestingMonths: 24,
  };

  const founder: Member = {
    address: creatorAddress,
    tokens: 4_000_000,   // 40% founder allocation
    votingPower: Math.sqrt(4_000_000),
    delegatedTo: null,
    delegatedFrom: [],
    joinedAt: Date.now(),
    reputation: 1000,
    tier: 'founder',
  };

  return {
    name,
    token,
    members: [founder],
    proposals: [],
    treasury: {
      balances: { USDC: 50000, ETH: 10, SOL: 500 },
      multisigSigners: [creatorAddress],
      requiredSignatures: 1,
      totalValueUSD: 75000,
      pendingTransactions: [],
    },
    quadraticRounds: [],
    governanceParams: {
      votingPeriodDays: 7,
      quorum: 0.10,
      passThreshold: 0.51,
      proposalThreshold: 1000,
      timelockDays: 2,
      delegationEnabled: true,
    },
  };
}

// ─── Member Management ────────────────────────────────────────────────────────

export function addMember(dao: DAO, address: string, tokens: number): DAO {
  const tier: Member['tier'] = tokens > 100000 ? 'core' : tokens > 10000 ? 'contributor' : 'citizen';
  const member: Member = {
    address,
    tokens,
    votingPower: Math.sqrt(tokens),  // quadratic voting power
    delegatedTo: null,
    delegatedFrom: [],
    joinedAt: Date.now(),
    reputation: 10,
    tier,
  };

  return {
    ...dao,
    members: [...dao.members, member],
    token: { ...dao.token, holders: dao.token.holders + 1 },
  };
}

export function delegateVotes(dao: DAO, from: string, to: string): DAO {
  return {
    ...dao,
    members: dao.members.map(m => {
      if (m.address === from) return { ...m, delegatedTo: to };
      if (m.address === to) return { ...m, delegatedFrom: [...m.delegatedFrom, from], votingPower: m.votingPower + Math.sqrt(dao.members.find(x => x.address === from)?.tokens || 0) };
      return m;
    }),
  };
}

// ─── Proposal Lifecycle ────────────────────────────────────────────────────────

export function createProposal(
  dao: DAO,
  author: string,
  title: string,
  description: string,
  category: FundingCategory,
  requestedFunding: number,
): DAO {
  const member = dao.members.find(m => m.address === author);
  if (!member || member.tokens < dao.governanceParams.proposalThreshold) {
    throw new Error('Insufficient tokens to create proposal');
  }

  const proposal: Proposal = {
    id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description,
    author,
    status: 'active',
    category,
    requestedFunding,
    createdAt: Date.now(),
    votingEndsAt: Date.now() + dao.governanceParams.votingPeriodDays * 86400000,
    votes: [],
    quorumRequired: dao.governanceParams.quorum,
    passThreshold: dao.governanceParams.passThreshold,
    comments: [],
  };

  return { ...dao, proposals: [...dao.proposals, proposal] };
}

export function castVote(dao: DAO, proposalId: string, voter: string, choice: VoteChoice, reason?: string): DAO {
  const member = dao.members.find(m => m.address === voter);
  if (!member) throw new Error('Not a DAO member');

  const vote: Vote = {
    voter,
    choice,
    votingPower: member.votingPower,
    timestamp: Date.now(),
    reason,
  };

  return {
    ...dao,
    proposals: dao.proposals.map(p => {
      if (p.id !== proposalId) return p;
      const filtered = p.votes.filter(v => v.voter !== voter);
      return { ...p, votes: [...filtered, vote] };
    }),
  };
}

export function tallyProposal(proposal: Proposal): {
  forPower: number;
  againstPower: number;
  abstainPower: number;
  totalPower: number;
  quorumMet: boolean;
  passed: boolean;
  participation: number;
} {
  const forPower     = proposal.votes.filter(v => v.choice === 'for').reduce((s, v) => s + v.votingPower, 0);
  const againstPower = proposal.votes.filter(v => v.choice === 'against').reduce((s, v) => s + v.votingPower, 0);
  const abstainPower = proposal.votes.filter(v => v.choice === 'abstain').reduce((s, v) => s + v.votingPower, 0);
  const totalPower = forPower + againstPower + abstainPower;
  const quorumMet = totalPower >= proposal.quorumRequired * 1000; // simplified total
  const passed = quorumMet && forPower / (forPower + againstPower || 1) >= proposal.passThreshold;
  const participation = totalPower / 1000; // simplified

  return { forPower, againstPower, abstainPower, totalPower, quorumMet, passed, participation };
}

// ─── Quadratic Funding ────────────────────────────────────────────────────────

/**
 * Quadratic Funding (Gitcoin CLR algorithm):
 * matchedAmount_i = matchingPool * (sqrt(sum_j c_{ij}))^2 / sum_i (sqrt(sum_j c_{ij}))^2
 */
export function computeQuadraticMatching(round: QuadraticRound): QuadraticRound {
  const sqrtSums = round.projects.map(p => {
    const sqrtContribs = p.contributions.map(c => Math.sqrt(c.amount));
    return sqrtContribs.reduce((a, b) => a + b, 0) ** 2;
  });
  const totalSqrtSum = sqrtSums.reduce((a, b) => a + b, 0);

  const updatedProjects = round.projects.map((p, i) => ({
    ...p,
    matchedAmount: totalSqrtSum > 0 ? round.matchingPool * sqrtSums[i] / totalSqrtSum : 0,
  }));

  return { ...round, projects: updatedProjects };
}

export function createQFRound(title: string, matchingPool: number, projects: Array<{ name: string; description: string; recipient: string }>): QuadraticRound {
  return {
    id: `qf-${Date.now()}`,
    title,
    matchingPool,
    status: 'active',
    endsAt: Date.now() + 14 * 86400000,
    projects: projects.map((p, i) => ({
      id: `proj-${i}`,
      name: p.name,
      description: p.description,
      recipient: p.recipient,
      contributions: [],
      matchedAmount: 0,
    })),
  };
}

export function contributeToProject(round: QuadraticRound, projectId: string, contributor: string, amount: number): QuadraticRound {
  const updated: QuadraticRound = {
    ...round,
    projects: round.projects.map(p => {
      if (p.id !== projectId) return p;
      const existing = p.contributions.findIndex(c => c.contributor === contributor);
      const contributions = existing >= 0
        ? p.contributions.map((c, i) => i === existing ? { ...c, amount: c.amount + amount } : c)
        : [...p.contributions, { contributor, amount }];
      return { ...p, contributions };
    }),
  };
  return computeQuadraticMatching(updated);
}

// ─── Treasury ─────────────────────────────────────────────────────────────────

export function proposeTreasuryTx(treasury: Treasury, to: string, amount: number, currency: string, purpose: string, proposer: string): Treasury {
  const tx: TreasuryTx = {
    id: `tx-${Date.now()}`,
    to,
    amount,
    currency,
    purpose,
    signers: [proposer],
    executed: false,
    createdAt: Date.now(),
  };
  return { ...treasury, pendingTransactions: [...treasury.pendingTransactions, tx] };
}

export function signTreasuryTx(treasury: Treasury, txId: string, signer: string): Treasury {
  return {
    ...treasury,
    pendingTransactions: treasury.pendingTransactions.map(tx => {
      if (tx.id !== txId || tx.signers.includes(signer)) return tx;
      const signers = [...tx.signers, signer];
      const executed = signers.length >= treasury.requiredSignatures;
      return { ...tx, signers, executed };
    }),
  };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function daoAnalytics(dao: DAO): {
  participationRate: number;
  passRate: number;
  avgTurnout: number;
  tokenConcentration: number;  // Gini coefficient
  fundingDeployed: number;
  topContributors: string[];
} {
  const finishedProps = dao.proposals.filter(p => p.status === 'passed' || p.status === 'rejected');
  const passRate = finishedProps.length ? dao.proposals.filter(p => p.status === 'passed').length / finishedProps.length : 0;

  const avgTurnout = dao.proposals.reduce((sum, p) => {
    const totalVP = p.votes.reduce((s, v) => s + v.votingPower, 0);
    return sum + totalVP;
  }, 0) / (dao.proposals.length || 1);

  // Gini coefficient of token distribution
  const tokens = dao.members.map(m => m.tokens).sort((a, b) => a - b);
  const n = tokens.length;
  const gini = tokens.reduce((sum, t, i) => sum + (2 * (i + 1) - n - 1) * t, 0) / (n * tokens.reduce((a, b) => a + b, 0) || 1);

  const fundingDeployed = dao.proposals.filter(p => p.status === 'executed').reduce((s, p) => s + p.requestedFunding, 0);
  const topContributors = [...dao.members].sort((a, b) => b.reputation - a.reputation).slice(0, 5).map(m => m.address);

  return {
    participationRate: Math.min(1, avgTurnout / (dao.members.reduce((s, m) => s + m.votingPower, 0) || 1)),
    passRate,
    avgTurnout,
    tokenConcentration: Math.max(0, gini),
    fundingDeployed,
    topContributors,
  };
}
