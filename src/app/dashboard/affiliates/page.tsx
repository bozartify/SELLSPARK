'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateAffiliateLink, calculateCommission, buildLeaderboard,
  benchmarkAffiliate, type AffiliateProgram, type AffiliateStats,
} from '@/lib/platform/affiliate-engine';

const MOCK_PROGRAM: AffiliateProgram = {
  id: 'prog_001', name: 'SellSpark Partner Program', creatorId: 'creator_001',
  commissionType: 'percentage', commissionRate: 0.3, cookieDays: 30,
  tier2Rate: 0.05, minPayout: 50, payoutSchedule: 'monthly', active: true,
};

const MOCK_AFFILIATES = [
  { id: 'aff_01', displayName: 'Alex Marketing', stats: { clicks: 1240, uniqueClicks: 890, conversions: 67, conversionRate: 0.075, revenue: 13280, commissionEarned: 3984, commissionPaid: 2500, commissionPending: 1484, epc: 4.48, aov: 198, refunds: 3, fraudFlags: 0, rank: 1 } },
  { id: 'aff_02', displayName: 'Creator Collab', stats: { clicks: 980, uniqueClicks: 720, conversions: 43, conversionRate: 0.060, revenue: 8450, commissionEarned: 2535, commissionPaid: 2000, commissionPending: 535, epc: 3.52, aov: 197, refunds: 2, fraudFlags: 0, rank: 2 } },
  { id: 'aff_03', displayName: 'Digital Dave', stats: { clicks: 430, uniqueClicks: 280, conversions: 12, conversionRate: 0.043, revenue: 2160, commissionEarned: 648, commissionPaid: 0, commissionPending: 648, epc: 2.31, aov: 180, refunds: 1, fraudFlags: 1, rank: 3 } },
  { id: 'aff_04', displayName: 'Niche Nina', stats: { clicks: 180, uniqueClicks: 140, conversions: 9, conversionRate: 0.064, revenue: 1890, commissionEarned: 567, commissionPaid: 0, commissionPending: 567, epc: 4.05, aov: 210, refunds: 0, fraudFlags: 0, rank: 4 } },
];

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'affiliates' | 'links' | 'payouts'>('overview');
  const [linkMedium, setLinkMedium] = useState<'link' | 'email' | 'social' | 'video' | 'blog'>('link');

  const leaderboard = buildLeaderboard(MOCK_AFFILIATES);
  const demoLink = generateAffiliateLink('https://sellspark.com', MOCK_PROGRAM.id, 'aff_01', linkMedium);

  const totalStats = MOCK_AFFILIATES.reduce((a, c) => ({
    clicks: a.clicks + c.stats.clicks,
    conversions: a.conversions + c.stats.conversions,
    revenue: a.revenue + c.stats.revenue,
    commission: a.commission + c.stats.commissionEarned,
  }), { clicks: 0, conversions: 0, revenue: 0, commission: 0 });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Affiliate Program</h1>
          <p className="text-sm text-gray-400 mt-1">2-tier commissions · Fraud detection · Smart links · Leaderboard</p>
        </div>
        <div className="flex gap-2">
          <Badge className={MOCK_PROGRAM.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
            {MOCK_PROGRAM.active ? 'Active' : 'Paused'}
          </Badge>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white text-sm">Invite Affiliates</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Affiliates', value: MOCK_AFFILIATES.length.toString(), delta: '+2 this month' },
          { label: 'Total Clicks', value: totalStats.clicks.toLocaleString(), delta: 'all-time' },
          { label: 'Revenue Generated', value: `$${totalStats.revenue.toLocaleString()}`, delta: 'via affiliates' },
          { label: 'Commission Paid', value: `$${totalStats.commission.toLocaleString()}`, delta: `${(MOCK_PROGRAM.commissionRate * 100).toFixed(0)}% rate` },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className="text-2xl font-bold text-violet-400 mt-1">{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['overview', 'affiliates', 'links', 'payouts'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="text-sm text-gray-300 uppercase tracking-wider">Leaderboard</h2>
          {leaderboard.map(entry => (
            <Card key={entry.affiliateId} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                  ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' : entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-gray-500'}`}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{entry.displayName}</p>
                    {entry.badge && (
                      <Badge className={`text-xs ${entry.badge === 'gold' ? 'bg-yellow-600 text-white' : entry.badge === 'silver' ? 'bg-gray-600 text-white' : entry.badge === 'bronze' ? 'bg-orange-700 text-white' : 'bg-violet-600 text-white'}`}>
                        {entry.badge === 'rising-star' ? '⭐ Rising Star' : `🏅 ${entry.badge}`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">{entry.conversions} conversions</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">${entry.commissionEarned.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">earned</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'affiliates' && (
        <div className="space-y-3">
          {MOCK_AFFILIATES.map(aff => {
            const benchmark = benchmarkAffiliate(aff.stats as AffiliateStats);
            return (
              <Card key={aff.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-medium">{aff.displayName}</p>
                    <Badge className={`text-xs ${benchmark.grade === 'A' ? 'bg-green-600 text-white' : benchmark.grade === 'B' ? 'bg-blue-600 text-white' : benchmark.grade === 'C' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'}`}>
                      Grade {benchmark.grade}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center mb-3">
                    {[
                      { l: 'Clicks', v: aff.stats.clicks.toLocaleString() },
                      { l: 'Conv. Rate', v: `${(aff.stats.conversionRate * 100).toFixed(1)}%` },
                      { l: 'EPC', v: `$${aff.stats.epc.toFixed(2)}` },
                      { l: 'Revenue', v: `$${aff.stats.revenue.toLocaleString()}` },
                      { l: 'Commission', v: `$${aff.stats.commissionEarned.toLocaleString()}` },
                      { l: 'Pending', v: `$${aff.stats.commissionPending.toLocaleString()}` },
                    ].map(item => (
                      <div key={item.l}>
                        <p className="text-gray-500 text-xs">{item.l}</p>
                        <p className="text-white text-sm font-medium">{item.v}</p>
                      </div>
                    ))}
                  </div>
                  {aff.stats.fraudFlags > 0 && (
                    <Badge className="bg-red-600/20 text-red-400 text-xs">⚠ {aff.stats.fraudFlags} fraud flag(s)</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'links' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Smart Link Generator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(['link', 'email', 'social', 'video', 'blog'] as const).map(m => (
                  <button key={m} onClick={() => setLinkMedium(m)}
                    className={`px-3 py-1.5 text-xs rounded capitalize ${linkMedium === m ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Affiliate URL</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-black/40 rounded px-3 py-2 text-violet-300 text-xs truncate">{demoLink.url}</code>
                    <Button size="sm" className="text-xs bg-violet-600 hover:bg-violet-700">Copy</Button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Short Code</p>
                  <code className="bg-black/40 rounded px-3 py-2 text-green-400 text-sm font-bold">{demoLink.shortCode}</code>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Commission Preview</p>
                  <div className="space-y-1">
                    {[50, 197, 500, 1000].map(amount => (
                      <div key={amount} className="flex justify-between items-center p-2 bg-white/5 rounded text-sm">
                        <span className="text-gray-400">Order ${amount}</span>
                        <div className="flex gap-4">
                          <span className="text-green-400">T1: ${calculateCommission(amount, MOCK_PROGRAM, 1).toFixed(2)}</span>
                          <span className="text-blue-400">T2: ${calculateCommission(amount, MOCK_PROGRAM, 2).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-3">
          {MOCK_AFFILIATES.map(aff => (
            <Card key={aff.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{aff.displayName}</p>
                  <p className="text-gray-400 text-xs">
                    Pending: <span className="text-yellow-400">${aff.stats.commissionPending.toLocaleString()}</span>
                    {' · '}Paid: <span className="text-green-400">${aff.stats.commissionPaid.toLocaleString()}</span>
                  </p>
                </div>
                {aff.stats.commissionPending >= 50 ? (
                  <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 text-white">
                    Pay ${aff.stats.commissionPending.toLocaleString()}
                  </Button>
                ) : (
                  <Badge className="bg-white/10 text-gray-500 text-xs">Below $50 min</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
