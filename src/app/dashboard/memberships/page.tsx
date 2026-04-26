'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getDefaultTiers, generateMockMembers, buildBenefitMatrix,
  computeMembershipMRR, getMembersByChurnRisk, generateWinBackSequence,
  pauseSubscription, resumeSubscription,
  type MembershipTier, type Member, type BillingInterval,
} from '@/lib/platform/membership-engine';

const TIERS = getDefaultTiers();
const ALL_MEMBERS = generateMockMembers(TIERS, 12);
const MATRIX = buildBenefitMatrix(TIERS);

const INTERVAL_LABELS: Record<BillingInterval, string> = { monthly: 'mo', quarterly: 'qtr', annual: 'yr', lifetime: 'once' };
const INTERVAL_SAVINGS: Record<BillingInterval, string> = { monthly: '', quarterly: 'Save 9%', annual: 'Save 20%', lifetime: 'Best Value' };

export default function MembershipsPage() {
  const [activeTab, setActiveTab] = useState<'tiers' | 'members' | 'churn' | 'matrix'>('tiers');
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('monthly');
  const [members, setMembers] = useState<Member[]>(ALL_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const mrrData = computeMembershipMRR(members);
  const riskData = getMembersByChurnRisk(members);

  const statusColor = (s: string) =>
    s === 'active'    ? 'bg-green-500/20 text-green-300' :
    s === 'trialing'  ? 'bg-blue-500/20 text-blue-300' :
    s === 'paused'    ? 'bg-yellow-500/20 text-yellow-300' :
    s === 'past_due'  ? 'bg-orange-500/20 text-orange-300' :
    'bg-gray-500/20 text-gray-400';

  const riskColor = (r: number) => r > 0.6 ? 'text-red-400' : r > 0.3 ? 'text-yellow-400' : 'text-green-400';

  const handlePause = (m: Member) => {
    try {
      const updated = pauseSubscription(m);
      setMembers(prev => prev.map(x => x.id === m.id ? updated : x));
      setSelectedMember(updated);
    } catch { /* ignore */ }
  };

  const handleResume = (m: Member) => {
    try {
      const updated = resumeSubscription(m);
      setMembers(prev => prev.map(x => x.id === m.id ? updated : x));
      setSelectedMember(updated);
    } catch { /* ignore */ }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Memberships & Subscriptions</h1>
          <p className="text-sm text-gray-400 mt-1">Tiered access · Recurring billing · Churn prevention · Benefit matrix</p>
        </div>
        <Badge className="bg-violet-600 text-white">{members.filter(m => m.status === 'active').length} Active Members</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: `$${mrrData.total.toLocaleString()}`, sub: `ARR $${(mrrData.total * 12).toLocaleString()}` },
          { label: 'Total Members', value: members.length.toString(), sub: `${members.filter(m=>m.status==='trialing').length} trialing` },
          { label: 'At-Risk Members', value: riskData.high.length.toString(), sub: 'churn risk >60%', color: riskData.high.length > 0 ? 'text-red-400' : 'text-green-400' },
          { label: 'Avg LTV', value: `$${Math.round(members.reduce((s,m)=>s+m.ltv,0)/members.length)}`, sub: 'per member' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${(kpi as { color?: string }).color ?? 'text-white'}`}>{kpi.value}</p>
              <p className="text-gray-500 text-xs">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['tiers','members','churn','matrix'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab===t?'text-violet-400 border-b-2 border-violet-400':'text-gray-400 hover:text-white'}`}>
            {t==='tiers'?'💎 Tiers':t==='members'?'👥 Members':t==='churn'?'⚠️ Churn':' 📋 Benefit Matrix'}
          </button>
        ))}
      </div>

      {/* ─── TIERS ─── */}
      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['monthly','quarterly','annual','lifetime'] as BillingInterval[]).map(i => (
              <button key={i} onClick={() => setSelectedInterval(i)}
                className={`px-3 py-1.5 text-xs rounded-full capitalize transition-all ${selectedInterval===i?'bg-violet-600 text-white':'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                {i} {INTERVAL_SAVINGS[i] && <span className="text-green-300 ml-1">{INTERVAL_SAVINGS[i]}</span>}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TIERS.map(tier => (
              <Card key={tier.id} className={`bg-white/5 border-white/10 relative ${tier.popular ? 'border-violet-500/60 ring-1 ring-violet-500/30' : ''}`}>
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs px-3 py-0.5 rounded-full">Most Popular</div>}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: tier.color }} />
                    <p className="text-white font-bold text-lg">{tier.name}</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: tier.color }}>
                      ${tier.price[selectedInterval]}
                      <span className="text-gray-500 text-sm font-normal">/{INTERVAL_LABELS[selectedInterval]}</span>
                    </p>
                    {tier.trialDays > 0 && <p className="text-gray-400 text-xs">{tier.trialDays}-day free trial</p>}
                  </div>
                  <div className="space-y-1.5">
                    {tier.features.map(f => (
                      <div key={f.key} className="flex items-center gap-2 text-xs">
                        <span className={f.included ? 'text-green-400' : 'text-gray-600'}>{f.included ? '✓' : '✗'}</span>
                        <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>{f.label}</span>
                        {f.limit != null && <span className="text-gray-500 ml-auto">{f.limit === 'unlimited' ? '∞' : f.limit}</span>}
                        {f.badge && <Badge className="bg-violet-500/20 text-violet-300 text-xs ml-auto">{f.badge}</Badge>}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full text-sm" style={{ backgroundColor: tier.color + '30', color: tier.color, borderColor: tier.color + '60' }}>
                    {tier.price[selectedInterval] === 0 ? 'Get Started Free' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── MEMBERS ─── */}
      {activeTab === 'members' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {members.map(m => {
              const tier = TIERS.find(t => t.id === m.tierId);
              return (
                <Card key={m.id}
                  className={`bg-white/5 border-white/10 cursor-pointer transition-all ${selectedMember?.id===m.id?'border-violet-500/60':''}`}
                  onClick={() => setSelectedMember(m)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, ${tier?.color ?? '#7c3aed'}, #4f46e5)` }}>
                        {m.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{m.name}</p>
                          <Badge className={statusColor(m.status)}>{m.status}</Badge>
                        </div>
                        <p className="text-gray-400 text-xs">{tier?.name} · {m.interval}</p>
                      </div>
                      <div className="text-right flex-shrink-0 text-xs">
                        <p className="text-white">${m.mrr}/mo</p>
                        <p className="text-gray-500">LTV ${m.ltv}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedMember ? (() => {
            const tier = TIERS.find(t => t.id === selectedMember.tierId);
            const winback = generateWinBackSequence(selectedMember, tier!);
            return (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${tier?.color ?? '#7c3aed'}, #4f46e5)` }}>
                      {selectedMember.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-white">{selectedMember.name}</CardTitle>
                      <p className="text-gray-400 text-xs">{selectedMember.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { l: 'Plan', v: tier?.name ?? 'Unknown' },
                      { l: 'Status', v: selectedMember.status },
                      { l: 'MRR', v: `$${selectedMember.mrr}` },
                      { l: 'LTV', v: `$${selectedMember.ltv}` },
                      { l: 'Products', v: selectedMember.usageMetrics.productsCreated.toString() },
                      { l: 'Courses', v: selectedMember.usageMetrics.coursesPublished.toString() },
                    ].map(item => (
                      <div key={item.l} className="p-2 bg-white/5 rounded">
                        <p className="text-gray-500">{item.l}</p>
                        <p className="text-white mt-0.5">{item.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {selectedMember.status === 'active' && (
                      <Button size="sm" onClick={() => handlePause(selectedMember)} className="flex-1 bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 text-xs">Pause</Button>
                    )}
                    {selectedMember.status === 'paused' && (
                      <Button size="sm" onClick={() => handleResume(selectedMember)} className="flex-1 bg-green-600/30 hover:bg-green-600/50 text-green-300 text-xs">Resume</Button>
                    )}
                    <Button size="sm" className="flex-1 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs">Upgrade</Button>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Win-Back Sequence</p>
                    {winback.map((step, i) => (
                      <div key={i} className="flex gap-3 text-xs py-1.5 border-b border-white/5">
                        <span className="text-gray-500 w-12">Day +{step.dayOffset}</span>
                        <span className="text-gray-300 flex-1">{step.subject}</span>
                        {step.discountPct > 0 && <Badge className="bg-green-500/20 text-green-300">{step.discountPct}% off</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })() : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm border border-white/10 rounded-xl">Select a member</div>
          )}
        </div>
      )}

      {/* ─── CHURN ─── */}
      {activeTab === 'churn' && (
        <div className="space-y-4">
          {(['high','medium','low'] as const).map(level => {
            const group = riskData[level];
            if (group.length === 0) return null;
            return (
              <div key={level}>
                <p className={`text-xs uppercase tracking-wider mb-2 font-bold ${level==='high'?'text-red-400':level==='medium'?'text-yellow-400':'text-green-400'}`}>
                  {level === 'high' ? '🔴' : level === 'medium' ? '🟡' : '🟢'} {level} Risk ({group.length})
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.map(m => {
                    const tier = TIERS.find(t => t.id === m.tierId);
                    return (
                      <Card key={m.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-sm font-medium">{m.name}</p>
                            <span className={`text-xs font-bold ${riskColor(m.churnRisk)}`}>{(m.churnRisk*100).toFixed(0)}% risk</span>
                          </div>
                          <p className="text-gray-400 text-xs">{tier?.name} · ${m.mrr}/mo</p>
                          <div className="h-1.5 bg-white/10 rounded-full">
                            <div className={`h-full rounded-full ${level==='high'?'bg-red-500':level==='medium'?'bg-yellow-500':'bg-green-500'}`} style={{ width: `${m.churnRisk*100}%` }} />
                          </div>
                          <p className="text-gray-500 text-xs">Last active: {Math.round((Date.now()-m.lastActiveAt)/86400000)}d ago · Streak: {m.usageMetrics.loginStreak}d</p>
                          <Button size="sm" className="w-full bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs">Send Win-Back Email</Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── BENEFIT MATRIX ─── */}
      {activeTab === 'matrix' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 w-40">Feature</th>
                {MATRIX.tiers.map(t => (
                  <th key={t.id} className="py-3 px-3 text-center" style={{ color: t.color }}>{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.featureKeys.map(key => (
                <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 px-4 text-gray-300 capitalize">{key.replace(/_/g,' ')}</td>
                  {MATRIX.tiers.map(t => {
                    const val = MATRIX.matrix[t.id]?.[key];
                    return (
                      <td key={t.id} className="py-2.5 px-3 text-center">
                        {val === false ? <span className="text-gray-600">—</span> :
                         val === true ? <span className="text-green-400">✓</span> :
                         val === 'unlimited' ? <span className="text-violet-400">∞</span> :
                         <span className="text-white">{val}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
