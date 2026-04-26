'use client';

import { useState } from 'react';
import { viralCoefficient, projectGrowth } from '@/lib/platform/growth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function GrowthPage() {
  const [invites, setInvites] = useState(3);
  const [conv, setConv] = useState(0.25);
  const [seed, setSeed] = useState(100);
  const k = viralCoefficient(invites, conv);
  const curve = projectGrowth(seed, k, 12);
  const max = Math.max(...curve, 1);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Growth Engine</h1>
        <p className="text-sm text-zinc-500 mt-1">Model viral loops, cohorts, and super-spreaders.</p>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Viral Loop Simulator</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="space-y-1 text-sm"><span>Invites/user</span><Input type="number" value={invites} onChange={(e) => setInvites(+e.target.value)} /></label>
            <label className="space-y-1 text-sm"><span>Conversion</span><Input type="number" step="0.01" value={conv} onChange={(e) => setConv(+e.target.value)} /></label>
            <label className="space-y-1 text-sm"><span>Seed users</span><Input type="number" value={seed} onChange={(e) => setSeed(+e.target.value)} /></label>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={k >= 1 ? 'success' : 'warning'}>k = {k.toFixed(2)}</Badge>
            <span className="text-xs text-zinc-500">{k >= 1 ? 'Viral — exponential growth' : 'Sub-viral — needs tuning'}</span>
          </div>
          <div className="flex items-end gap-1 h-40">
            {curve.map((v, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-violet-600 to-fuchsia-400 rounded-t" style={{ height: `${(v / max) * 100}%` }} title={`Cycle ${i + 1}: ${v}`} />
            ))}
          </div>
          <Button>Launch referral campaign</Button>
        </CardContent>
      </Card>
    </div>
  );
}
