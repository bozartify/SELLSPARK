'use client';
import { TIERS, tierFor, STARTER_QUESTS, streakBonus } from '@/lib/platform/loyalty';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LoyaltyPage() {
  const points = 3420;
  const tier = tierFor(points);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty & Quests</h1>
        <p className="text-sm text-zinc-500 mt-1">Turn fans into superfans with tiered rewards.</p>
      </div>
      <Card>
        <CardHeader><div className="flex items-center justify-between"><span className="text-xs text-zinc-500">Current tier</span><Badge variant="success" className="capitalize">{tier.id}</Badge></div></CardHeader>
        <CardContent><div className="text-4xl font-bold">{points.toLocaleString()} pts</div><div className="text-xs text-zinc-500 mt-1">{tier.multiplier}× earn multiplier</div></CardContent>
      </Card>
      <div className="grid md:grid-cols-5 gap-3">
        {TIERS.map((t) => (
          <Card key={t.id} className={tier.id === t.id ? 'ring-2 ring-violet-500' : ''}>
            <CardHeader><span className="font-semibold capitalize">{t.id}</span></CardHeader>
            <CardContent className="text-xs space-y-1">
              <div>{t.min.toLocaleString()}+ pts</div>
              <div className="text-zinc-500">{t.perks.join(' · ')}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Active quests</h2></CardHeader>
        <CardContent className="space-y-3">
          {STARTER_QUESTS.map((q) => (
            <div key={q.id} className="flex items-center justify-between text-sm">
              <div>{q.title}</div>
              <Badge variant="outline">+{q.reward} pts</Badge>
            </div>
          ))}
          <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">Streak bonus (12 days): +{Math.round(streakBonus(12))} pts</div>
        </CardContent>
      </Card>
    </div>
  );
}
