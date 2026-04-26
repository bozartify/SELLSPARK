'use client';

import { totalFootprint, offsetRoute, esgReport } from '@/lib/platform/sustainability';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ImpactPage() {
  const footprint = totalFootprint({
    txByChain: { 'sellspark-l2': 12400, base: 3200, solana: 980, ethereum: 42 },
    streamHours: 218,
    aiCalls: 84_300,
  });
  const route = offsetRoute(footprint);
  const esg = esgReport(footprint, 124_000);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impact & Sustainability</h1>
        <p className="text-sm text-zinc-500 mt-1">Transparent carbon accounting. Automatic verified offsets.</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardHeader><span className="text-xs text-zinc-500">Footprint (30d)</span></CardHeader><CardContent className="text-2xl font-bold">{(footprint / 1000).toFixed(1)} kg CO₂e</CardContent></Card>
        <Card><CardHeader><span className="text-xs text-zinc-500">Offset cost</span></CardHeader><CardContent className="text-2xl font-bold">${route.costUsd.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><span className="text-xs text-zinc-500">ESG grade</span></CardHeader><CardContent><Badge variant="success" className="text-lg">{esg.grade}</Badge></CardContent></Card>
        <Card><CardHeader><span className="text-xs text-zinc-500">Intensity (g/$)</span></CardHeader><CardContent className="text-2xl font-bold">{esg.intensity.toFixed(3)}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Verified offset partner</h2></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm"><span className="font-semibold">{route.fund}</span> · verified by {route.verifier}</div>
          <div className="text-xs text-zinc-500">{route.tons.toFixed(5)} tons CO₂e will be permanently removed via direct-air capture.</div>
          <Button>Auto-offset monthly</Button>
        </CardContent>
      </Card>
    </div>
  );
}
