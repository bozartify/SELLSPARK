'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

const PAYOUTS = [
  { id: 'PAY-001', amount: 2847.50, date: '2026-04-01', status: 'completed' as const },
  { id: 'PAY-002', amount: 3156.00, date: '2026-03-15', status: 'completed' as const },
  { id: 'PAY-003', amount: 2490.75, date: '2026-03-01', status: 'completed' as const },
  { id: 'PAY-004', amount: 1823.00, date: '2026-02-15', status: 'completed' as const },
];

export default function PayoutsPage() {
  const [connected] = useState(false);
  const balance = 1284.50;
  const totalPaid = PAYOUTS.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your earnings and payment settings</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Available Balance</div>
          <div className="text-2xl font-bold text-emerald-600">{formatPrice(balance)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Total Paid Out</div>
          <div className="text-2xl font-bold">{formatPrice(totalPaid)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Next Payout</div>
          <div className="text-2xl font-bold">Apr 15</div>
        </Card>
      </div>

      {/* Stripe Connect */}
      {!connected && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="text-3xl">🏦</div>
            <div className="flex-1">
              <h3 className="font-semibold">Connect your bank account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set up Stripe Connect to receive instant payouts from your sales.</p>
            </div>
            <Button>Connect Stripe</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="font-semibold">Available for withdrawal</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{formatPrice(balance)}</div>
          </div>
          <Button disabled={!connected}>Withdraw Funds</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Payout History</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PAYOUTS.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <div className="text-sm font-medium">{payout.id}</div>
                  <div className="text-xs text-gray-500">{payout.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="text-xs">Completed</Badge>
                  <span className="font-semibold">{formatPrice(payout.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
