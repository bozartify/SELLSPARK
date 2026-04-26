'use client';

import { mintDID, WORLDS, issueSBT, type Avatar } from '@/lib/platform/metaverse';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function IdentityPage() {
  const avatar: Avatar = {
    did: mintDID('creator-demo-seed'),
    displayName: 'SellSpark Creator',
    mesh: 'ipfs://Qm…/avatar.glb',
    voicePrint: 'vp_abc123',
    worlds: ['apple-vision', 'meta-horizon', 'spatial'],
    reputation: [issueSBT('creator', 'self'), issueSBT('verified', 'sellspark'), issueSBT('og', 'sellspark')],
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sovereign Identity</h1>
        <p className="text-sm text-zinc-500 mt-1">One avatar. Every world. Quantum-signed DID.</p>
      </div>
      <Card>
        <CardHeader><span className="font-semibold">{avatar.displayName}</span></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs font-mono break-all bg-zinc-100 dark:bg-zinc-900 p-2 rounded">{avatar.did}</div>
          <div className="flex flex-wrap gap-2">{avatar.reputation.map((r) => <Badge key={r.kind} variant="success">{r.kind}</Badge>)}</div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {WORLDS.map((w) => {
          const linked = avatar.worlds.includes(w.id);
          return (
            <Card key={w.id}>
              <CardHeader><div className="flex items-center justify-between"><span className="font-semibold text-sm">{w.label}</span>{linked && <Badge variant="success">Linked</Badge>}</div></CardHeader>
              <CardContent><Button size="sm" variant={linked ? 'outline' : 'default'} disabled={!w.supported}>{linked ? 'Unlink' : w.supported ? 'Link' : 'Soon'}</Button></CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
