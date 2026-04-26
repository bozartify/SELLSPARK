'use client';

import { useState } from 'react';
import { connectWallet, estimateGas, chooseOptimalChain, type Chain, type WalletSession } from '@/lib/platform/web3-wallet';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CHAINS: Chain[] = ['ethereum', 'base', 'polygon', 'solana', 'bitcoin', 'lightning', 'sellspark-l2'];

export default function WalletPage() {
  const [session, setSession] = useState<WalletSession | null>(null);
  const optimal = chooseOptimalChain(25, true);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Universal Wallet</h1>
        <p className="text-sm text-zinc-500 mt-1">Accept payments across 7 chains. Optimal routing recommended: <Badge variant="success">{optimal}</Badge></p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHAINS.map((c) => {
          const g = estimateGas(c, 'transfer');
          return (
            <Card key={c}>
              <CardHeader><div className="flex items-center justify-between"><span className="font-semibold capitalize">{c}</span><Badge variant="outline">${g.usd.toFixed(4)}</Badge></div></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-zinc-500">~{g.latencySec}s settlement</div>
                <Button size="sm" onClick={async () => setSession(await connectWallet(c))}>Connect</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {session && (
        <Card>
          <CardHeader><h2 className="font-semibold">Active session</h2></CardHeader>
          <CardContent className="font-mono text-xs break-all">{session.chain} — {session.address}</CardContent>
        </Card>
      )}
    </div>
  );
}
