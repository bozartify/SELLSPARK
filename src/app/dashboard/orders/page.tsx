'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

const ORDERS = [
  { id: 'ORD-001', product: '12-Week Transformation Program', customer: 'Sarah Mitchell', email: 's.mitchell@email.com', amount: 97, date: '2026-04-13 10:23', status: 'completed' as const },
  { id: 'ORD-002', product: 'AI Content Generator', customer: 'Mike Rodriguez', email: 'mike.r@email.com', amount: 29, date: '2026-04-13 08:15', status: 'completed' as const },
  { id: 'ORD-003', product: 'VIP Coaching Call', customer: 'Emma Larson', email: 'emma@email.com', amount: 150, date: '2026-04-12 16:45', status: 'completed' as const },
  { id: 'ORD-004', product: 'Monthly Coaching Membership', customer: 'Alex Kim', email: 'alex.k@email.com', amount: 49, date: '2026-04-12 14:30', status: 'completed' as const },
  { id: 'ORD-005', product: 'Resource Pack: Templates & Guides', customer: 'Jordan Lee', email: 'jordan@email.com', amount: 39, date: '2026-04-12 11:00', status: 'completed' as const },
  { id: 'ORD-006', product: 'AI Content Generator', customer: 'Casey Brown', email: 'casey.b@email.com', amount: 29, date: '2026-04-11 20:15', status: 'refunded' as const },
  { id: 'ORD-007', product: '12-Week Transformation Program', customer: 'Riley Davis', email: 'riley.d@email.com', amount: 97, date: '2026-04-11 09:22', status: 'completed' as const },
  { id: 'ORD-008', product: 'VIP Coaching Call', customer: 'Sam Taylor', email: 'sam.t@email.com', amount: 150, date: '2026-04-10 17:00', status: 'completed' as const },
];

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'destructive'> = {
  completed: 'success',
  pending: 'warning',
  refunded: 'destructive',
};

export default function OrdersPage() {
  const totalRevenue = ORDERS.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{ORDERS.length} total orders &middot; {formatPrice(totalRevenue)} revenue</p>
        </div>
        <Button variant="outline">Export CSV</Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Total Orders</div>
          <div className="text-2xl font-bold">{ORDERS.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Revenue</div>
          <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Avg Order Value</div>
          <div className="text-2xl font-bold">{formatPrice(totalRevenue / ORDERS.filter(o => o.status === 'completed').length)}</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Order History</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">All</Button>
              <Button variant="ghost" size="sm">Completed</Button>
              <Button variant="ghost" size="sm">Refunded</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {ORDERS.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <td className="py-3 font-mono text-xs text-gray-500">{order.id}</td>
                    <td className="py-3 font-medium">{order.product}</td>
                    <td className="py-3">
                      <div>{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                    </td>
                    <td className="py-3 font-semibold">{formatPrice(order.amount)}</td>
                    <td className="py-3 text-gray-500 text-xs">{order.date}</td>
                    <td className="py-3">
                      <Badge variant={STATUS_BADGE[order.status]} className="text-xs capitalize">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
