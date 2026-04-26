'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

const REVENUE_DATA = [
  { month: 'Oct', revenue: 4200, visitors: 3100, conversions: 98 },
  { month: 'Nov', revenue: 5800, visitors: 4200, conversions: 134 },
  { month: 'Dec', revenue: 7300, visitors: 5600, conversions: 168 },
  { month: 'Jan', revenue: 8900, visitors: 6800, conversions: 198 },
  { month: 'Feb', revenue: 10200, visitors: 7400, conversions: 224 },
  { month: 'Mar', revenue: 12847, visitors: 8432, conversions: 284 },
];

const TOP_PRODUCTS = [
  { name: 'AI Content Generator', revenue: 11281, sales: 389, conversion: 4.2 },
  { name: '12-Week Program', revenue: 13774, sales: 142, conversion: 3.8 },
  { name: 'VIP Membership', revenue: 3283, sales: 67, conversion: 2.9 },
  { name: 'Strategy Call', revenue: 4200, sales: 28, conversion: 5.1 },
];

const TRAFFIC_SOURCES = [
  { source: 'Instagram', visitors: 3200, percentage: 38 },
  { source: 'TikTok', visitors: 2100, percentage: 25 },
  { source: 'Google', visitors: 1500, percentage: 18 },
  { source: 'Twitter/X', visitors: 900, percentage: 11 },
  { source: 'Direct', visitors: 732, percentage: 8 },
];

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.revenue));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered insights into your performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">7 Days</Button>
          <Button variant="outline" size="sm">30 Days</Button>
          <Button size="sm">6 Months</Button>
        </div>
      </div>

      {/* Revenue Chart (CSS-based) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Revenue Overview</h2>
            <Badge variant="success">+23% vs last period</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-48">
            {REVENUE_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium">{formatPrice(d.revenue)}</span>
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Top Products</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.sales} sales &middot; {p.conversion}% conversion</div>
                </div>
                <span className="font-semibold">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Traffic Sources</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {TRAFFIC_SOURCES.map((t) => (
              <div key={t.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{t.source}</span>
                  <span className="text-gray-500">{t.visitors.toLocaleString()} ({t.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${t.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🧠</div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">AI Revenue Prediction</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Based on your growth trajectory, you&apos;re on track to hit <strong className="text-violet-600">{formatPrice(18500)}/mo</strong> by
                next month. To accelerate, consider launching a high-ticket group coaching program ($297-497) — your audience engagement
                scores suggest 3.2% would convert.
              </p>
              <div className="flex gap-2">
                <Button size="sm">Create Group Program</Button>
                <Button size="sm" variant="outline">View Full Report</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
