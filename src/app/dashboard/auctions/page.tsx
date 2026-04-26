'use client';
import { suggestReserve } from '@/lib/platform/auctions';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LIVE = [
  { id: 'a1', title: 'Private 1:1 coaching — 60 min', current: 420, bids: 14, endsIn: '2h 14m', kind: 'english' },
  { id: 'a2', title: 'Lifetime access to Pro course', current: 890, bids: 32, endsIn: '4h 51m', kind: 'vickrey' },
  { id: 'a3', title: 'Signed merch drop #001', current: 180, bids: 7, endsIn: '12h 02m', kind: 'dutch' },
];

export default function AuctionsPage() {
  const reserve = suggestReserve([320, 410, 450, 390, 420]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Auctions</h1>
        <p className="text-sm text-zinc-500 mt-1">English, Dutch, sealed & Vickrey auctions with anti-sniping.</p>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">AI reserve suggestion</h2></CardHeader>
        <CardContent><div className="text-2xl font-bold">${reserve}</div><div className="text-xs text-zinc-500">Based on last 5 comparable sales.</div></CardContent>
      </Card>
      <div className="grid md:grid-cols-3 gap-4">
        {LIVE.map((a) => (
          <Card key={a.id}>
            <CardHeader><div className="flex items-center justify-between"><span className="font-semibold text-sm">{a.title}</span><Badge variant="outline" className="capitalize">{a.kind}</Badge></div></CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">${a.current}</div>
              <div className="text-xs text-zinc-500">{a.bids} bids · ends in {a.endsIn}</div>
              <Button size="sm" className="w-full">Place bid</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
