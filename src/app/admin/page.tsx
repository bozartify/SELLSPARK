'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/utils';
import Link from 'next/link';

const PLATFORM_STATS = [
  { label: 'Total Creators', value: 12847, change: '+342 this week' },
  { label: 'Total Revenue (Platform)', value: 2487650, format: 'currency', change: '+18% MoM' },
  { label: 'Active Stores', value: 8432, change: '+127 this week' },
  { label: 'AI Tool Executions', value: 847320, change: '+23% MoM' },
  { label: 'Total Orders', value: 142890, change: '+2,340 today' },
  { label: 'Platform MRR', value: 89450, format: 'currency', change: '+12% MoM' },
];

const SYSTEM_HEALTH = [
  { service: 'API Gateway', status: 'operational', latency: '12ms', uptime: '99.99%' },
  { service: 'Database Cluster', status: 'operational', latency: '3ms', uptime: '99.98%' },
  { service: 'AI Inference', status: 'operational', latency: '245ms', uptime: '99.95%' },
  { service: 'Stripe Payments', status: 'operational', latency: '89ms', uptime: '99.97%' },
  { service: 'CDN / Storage', status: 'operational', latency: '8ms', uptime: '99.99%' },
  { service: 'Push Notifications', status: 'degraded', latency: '156ms', uptime: '99.82%' },
  { service: 'Quantum Crypto', status: 'operational', latency: '34ms', uptime: '99.99%' },
  { service: 'WebSocket / Chat', status: 'operational', latency: '5ms', uptime: '99.96%' },
];

const RECENT_ACTIVITY = [
  { type: 'signup', message: 'New creator: jessica.wang@email.com (Fitness)', time: '2m ago' },
  { type: 'sale', message: '$297 sale on "Business Growth Blueprint" by @marketer_pro', time: '5m ago' },
  { type: 'ai', message: 'AI Tool "Course Outline Generator" hit 10,000 uses', time: '12m ago' },
  { type: 'moderation', message: 'AI flagged content for review on store "quick-money-123"', time: '15m ago' },
  { type: 'payout', message: '$4,250 payout processed for @sarah_fitness', time: '1h ago' },
  { type: 'integration', message: '50 new Zapier connections this week', time: '2h ago' },
];

const MODERATION_QUEUE = [
  { id: '1', store: 'quick-money-123', reason: 'Potential misleading claims', severity: 'high', reported: '15m ago' },
  { id: '2', store: 'crypto-guru', reason: 'Unverified income claims', severity: 'medium', reported: '2h ago' },
  { id: '3', store: 'health-tips-daily', reason: 'Medical advice without disclaimer', severity: 'low', reported: '5h ago' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg">SellSpark</Link>
            <Badge className="bg-white/20 text-white">Admin</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="font-medium">Dashboard</Link>
            <span className="opacity-50">Users</span>
            <span className="opacity-50">Moderation</span>
            <span className="opacity-50">Finance</span>
            <span className="opacity-50">System</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Platform Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_STATS.map(stat => (
            <Card key={stat.label} className="p-5">
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold mt-1">
                {stat.format === 'currency' ? formatPrice(stat.value) : formatNumber(stat.value)}
              </div>
              <div className="text-xs text-emerald-600 mt-1">{stat.change}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">System Health</h2>
                <Badge variant="success">All Systems Operational</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SYSTEM_HEALTH.map(svc => (
                <div key={svc.service} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${svc.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-sm">{svc.service}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{svc.latency}</span>
                    <span>{svc.uptime}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader><h2 className="font-semibold">Recent Activity</h2></CardHeader>
            <CardContent className="space-y-3">
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <span className="text-lg mt-0.5">
                    {item.type === 'signup' ? '👤' : item.type === 'sale' ? '💰' : item.type === 'ai' ? '🤖' : item.type === 'moderation' ? '🛡️' : item.type === 'payout' ? '💸' : '🔌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.message}</p>
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Moderation Queue */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">AI Moderation Queue</h2>
                <Badge variant="warning">{MODERATION_QUEUE.length} pending</Badge>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {MODERATION_QUEUE.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.store}</span>
                    <Badge variant={item.severity === 'high' ? 'destructive' : item.severity === 'medium' ? 'warning' : 'secondary'} className="text-[10px]">
                      {item.severity}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">{item.reason} &middot; {item.reported}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-emerald-600">Approve</Button>
                  <Button variant="ghost" size="sm" className="text-red-600">Reject</Button>
                  <Button variant="ghost" size="sm">Review</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
