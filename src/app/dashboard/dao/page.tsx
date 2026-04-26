'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createDAO, addMember, createProposal, castVote, tallyProposal,
  createQFRound, contributeToProject, computeQuadraticMatching, daoAnalytics,
  type DAO, type VoteChoice,
} from '@/lib/platform/creator-dao';

const CREATOR_ADDR = '0xCreator1234...abcd';
const MEMBERS = [
  { address: '0xMember_A', tokens: 50000 },
  { address: '0xMember_B', tokens: 25000 },
  { address: '0xMember_C', tokens: 10000 },
  { address: '0xMember_D', tokens: 5000 },
  { address: '0xMember_E', tokens: 1500 },
];

function buildInitialDAO(): DAO {
  let dao = createDAO('SellSpark Creator DAO', CREATOR_ADDR);
  MEMBERS.forEach(m => { dao = addMember(dao, m.address, m.tokens); });

  dao = createProposal(dao, CREATOR_ADDR, 'Fund Q3 Content Sprint', 'Allocate $10,000 for 12 premium video lessons covering advanced email marketing, AI prompting, and course launch strategy.', 'content', 10000);
  dao = createProposal(dao, CREATOR_ADDR, 'Launch Community Discord', 'Set up and moderate a Discord server with 5 channels — announcements, Q&A, showcase, feedback, and off-topic.', 'infrastructure', 2500);
  dao = createProposal(dao, CREATOR_ADDR, 'Grant: AI Tool Access', 'Provide 3-month free access to SellSpark Pro for 50 emerging creators under 1,000 subscribers.', 'grant', 7500);

  // Seed some votes
  dao = castVote(dao, dao.proposals[0].id, '0xMember_A', 'for', 'Strong content ROI');
  dao = castVote(dao, dao.proposals[0].id, '0xMember_B', 'for');
  dao = castVote(dao, dao.proposals[0].id, '0xMember_C', 'against', 'Too expensive');
  dao = castVote(dao, dao.proposals[1].id, '0xMember_A', 'for');
  dao = castVote(dao, dao.proposals[1].id, '0xMember_D', 'for');
  dao = castVote(dao, dao.proposals[2].id, '0xMember_B', 'abstain');

  return dao;
}

function buildInitialQFRound() {
  let round = createQFRound('Creator Tools Grant Round #1', 25000, [
    { name: 'Open-Source Subtitle Generator', description: 'Auto-caption tool for creator videos', recipient: '0xDev_A' },
    { name: 'Email Template Library', description: '100 battle-tested email templates', recipient: '0xDev_B' },
    { name: 'Accessibility Audit Bot', description: 'Auto-check course content for a11y', recipient: '0xDev_C' },
  ]);
  round = contributeToProject(round, round.projects[0].id, '0xMember_A', 200);
  round = contributeToProject(round, round.projects[0].id, '0xMember_B', 50);
  round = contributeToProject(round, round.projects[0].id, '0xMember_C', 100);
  round = contributeToProject(round, round.projects[1].id, '0xMember_A', 80);
  round = contributeToProject(round, round.projects[1].id, '0xMember_D', 300);
  round = contributeToProject(round, round.projects[2].id, '0xMember_E', 25);
  return round;
}

export default function DAOPage() {
  const [dao, setDao] = useState<DAO>(buildInitialDAO);
  const [qfRound] = useState(buildInitialQFRound);
  const [activeTab, setActiveTab] = useState<'proposals' | 'treasury' | 'qf' | 'analytics'>('proposals');
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteChoice, setVoteChoice] = useState<VoteChoice>('for');

  const analytics = daoAnalytics(dao);

  const handleVote = (proposalId: string) => {
    try {
      setDao(prev => castVote(prev, proposalId, '0xYou', voteChoice, 'My vote from dashboard'));
    } catch { /* already voted */ }
  };

  const tierColor = (t: string) =>
    t === 'founder' ? 'bg-yellow-500/20 text-yellow-300' :
    t === 'core' ? 'bg-violet-500/20 text-violet-300' :
    t === 'contributor' ? 'bg-blue-500/20 text-blue-300' :
    'bg-white/10 text-gray-300';

  const statusColor = (s: string) =>
    s === 'active' ? 'bg-green-500/20 text-green-300' :
    s === 'passed' ? 'bg-violet-500/20 text-violet-300' :
    s === 'rejected' ? 'bg-red-500/20 text-red-300' :
    'bg-white/10 text-gray-300';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{dao.name}</h1>
          <p className="text-sm text-gray-400 mt-1">On-chain governance · Quadratic funding · Multi-sig treasury · Token voting</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-indigo-600/30 text-indigo-300">{dao.token.symbol}</Badge>
          <Badge className="bg-violet-600 text-white">{dao.members.length} Members</Badge>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Supply', value: (dao.token.totalSupply / 1e6).toFixed(1) + 'M', sub: dao.token.symbol },
          { label: 'Treasury', value: '$' + dao.treasury.totalValueUSD.toLocaleString(), sub: 'multi-sig secured' },
          { label: 'Participation', value: (analytics.participationRate * 100).toFixed(1) + '%', sub: 'governance activity' },
          { label: 'Token Concentration', value: analytics.tokenConcentration.toFixed(2), sub: 'Gini (lower = better)' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{kpi.label}</p>
              <p className="text-white text-2xl font-bold mt-1">{kpi.value}</p>
              <p className="text-gray-500 text-xs">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['proposals', 'treasury', 'qf', 'analytics'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'proposals' ? '🗳️ Proposals' : t === 'treasury' ? '🏦 Treasury' : t === 'qf' ? '🔮 Quadratic Funding' : '📊 Analytics'}
          </button>
        ))}
      </div>

      {/* ─── PROPOSALS ─── */}
      {activeTab === 'proposals' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {dao.proposals.map(p => {
              const tally = tallyProposal(p);
              const totalVP = tally.forPower + tally.againstPower + tally.abstainPower || 1;
              return (
                <Card key={p.id}
                  className={`bg-white/5 border-white/10 cursor-pointer transition-all ${selectedProposal === p.id ? 'border-violet-500/50' : ''}`}
                  onClick={() => setSelectedProposal(p.id)}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-medium">{p.title}</p>
                      <Badge className={statusColor(p.status)}>{p.status}</Badge>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">Funding: <span className="text-white">${p.requestedFunding.toLocaleString()}</span></span>
                      <Badge className="bg-white/10 text-gray-300 capitalize">{p.category}</Badge>
                    </div>
                    {/* Vote bar */}
                    <div className="space-y-1">
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 transition-all" style={{ width: `${(tally.forPower / totalVP) * 100}%` }} />
                        <div className="bg-red-500 transition-all" style={{ width: `${(tally.againstPower / totalVP) * 100}%` }} />
                        <div className="bg-gray-500 transition-all" style={{ width: `${(tally.abstainPower / totalVP) * 100}%` }} />
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-400">For {(tally.forPower / totalVP * 100).toFixed(0)}%</span>
                        <span className="text-red-400">Against {(tally.againstPower / totalVP * 100).toFixed(0)}%</span>
                        <span className="text-gray-500">{p.votes.length} votes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Vote panel */}
          <div className="space-y-3">
            {selectedProposal ? (() => {
              const p = dao.proposals.find(x => x.id === selectedProposal)!;
              const tally = tallyProposal(p);
              return (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-white text-sm">{p.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm">{p.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white/5 rounded"><p className="text-gray-500">Requested</p><p className="text-white">${p.requestedFunding.toLocaleString()}</p></div>
                      <div className="p-2 bg-white/5 rounded"><p className="text-gray-500">Quorum met</p><p className={tally.quorumMet ? 'text-green-400' : 'text-red-400'}>{tally.quorumMet ? 'Yes' : 'No'}</p></div>
                      <div className="p-2 bg-white/5 rounded"><p className="text-gray-500">For VP</p><p className="text-green-400">{tally.forPower.toFixed(0)}</p></div>
                      <div className="p-2 bg-white/5 rounded"><p className="text-gray-500">Against VP</p><p className="text-red-400">{tally.againstPower.toFixed(0)}</p></div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-2">Cast Your Vote</p>
                      <div className="flex gap-2 mb-3">
                        {(['for', 'against', 'abstain'] as VoteChoice[]).map(c => (
                          <button key={c} onClick={() => setVoteChoice(c)}
                            className={`flex-1 py-2 text-xs rounded capitalize ${voteChoice === c ? c === 'for' ? 'bg-green-600 text-white' : c === 'against' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                      <Button onClick={() => handleVote(p.id)} className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm">
                        Submit Vote
                      </Button>
                    </div>
                    {/* Vote list */}
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {p.votes.map(v => (
                        <div key={v.voter} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                          <span className="text-gray-400 font-mono">{v.voter.slice(0, 12)}…</span>
                          <span className={v.choice === 'for' ? 'text-green-400' : v.choice === 'against' ? 'text-red-400' : 'text-gray-400'}>{v.choice}</span>
                          <span className="text-gray-500">{v.votingPower.toFixed(1)} VP</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })() : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">Select a proposal to vote</div>
            )}

            {/* Member list */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">Members</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {dao.members.slice(0, 6).map(m => (
                  <div key={m.address} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-mono">{m.address.slice(0, 14)}…</span>
                    <Badge className={tierColor(m.tier)}>{m.tier}</Badge>
                    <span className="text-white">{(m.tokens / 1000).toFixed(0)}K</span>
                    <span className="text-violet-300">{m.votingPower.toFixed(0)} VP</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── TREASURY ─── */}
      {activeTab === 'treasury' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(dao.treasury.balances).map(([currency, amount]) => (
              <Card key={currency} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-xs">{currency}</p>
                  <p className="text-white text-2xl font-bold mt-1">{amount.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">{dao.treasury.requiredSignatures}/{dao.treasury.multisigSigners.length} multisig</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Multi-Sig Signers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dao.treasury.multisigSigners.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-gray-300 font-mono">{s}</span>
                  <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                </div>
              ))}
              <p className="text-gray-500 text-xs pt-2">Required: {dao.treasury.requiredSignatures} of {dao.treasury.multisigSigners.length} signatures</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── QUADRATIC FUNDING ─── */}
      {activeTab === 'qf' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">{qfRound.title}</CardTitle>
                <Badge className="bg-green-500/20 text-green-300">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Matching Pool: <span className="text-white font-bold">${qfRound.matchingPool.toLocaleString()}</span></p>
              <div className="space-y-4">
                {qfRound.projects.map(proj => {
                  const totalContribs = proj.contributions.reduce((s, c) => s + c.amount, 0);
                  const matchPct = qfRound.matchingPool > 0 ? proj.matchedAmount / qfRound.matchingPool * 100 : 0;
                  return (
                    <div key={proj.id} className="p-3 bg-white/5 rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium text-sm">{proj.name}</p>
                          <p className="text-gray-400 text-xs">{proj.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-violet-300 font-bold">${proj.matchedAmount.toFixed(0)}</p>
                          <p className="text-gray-500 text-xs">matched</p>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(matchPct, 100)}%` }} />
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>{proj.contributions.length} contributors</span>
                        <span>${totalContribs} direct</span>
                        <span>{matchPct.toFixed(1)}% of pool</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── ANALYTICS ─── */}
      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Pass Rate', value: (analytics.passRate * 100).toFixed(0) + '%', desc: 'of completed proposals passed' },
            { label: 'Avg Voter Turnout', value: analytics.avgTurnout.toFixed(1), desc: 'voting power per proposal' },
            { label: 'Funding Deployed', value: '$' + analytics.fundingDeployed.toLocaleString(), desc: 'total executed grants' },
            { label: 'Gini Coefficient', value: analytics.tokenConcentration.toFixed(3), desc: '0 = perfect equality' },
          ].map(stat => (
            <Card key={stat.label} className="bg-white/5 border-white/10">
              <CardContent className="p-5">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-white/5 border-white/10 md:col-span-2">
            <CardHeader><CardTitle className="text-white text-sm">Top Contributors by Reputation</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {analytics.topContributors.map((addr, i) => {
                const m = dao.members.find(x => x.address === addr);
                return m ? (
                  <div key={addr} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 w-4">#{i+1}</span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {i+1}
                    </div>
                    <span className="text-gray-300 font-mono flex-1">{addr.slice(0, 18)}…</span>
                    <Badge className={tierColor(m.tier)}>{m.tier}</Badge>
                    <span className="text-violet-300">{m.reputation} rep</span>
                  </div>
                ) : null;
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
