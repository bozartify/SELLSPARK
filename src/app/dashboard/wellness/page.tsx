'use client';
import { burnoutRisk, optimalPostingWindow } from '@/lib/platform/wellness';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WellnessPage() {
  const risk = burnoutRisk({ hoursToday: 7, hoursThisWeek: 48, lateNightSessions: 1, missedBreaks: 2, hrvDrop: 3 });
  const windows = optimalPostingWindow(-240);
  const color = { low: 'success', moderate: 'warning', high: 'warning', critical: 'destructive' } as const;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Wellness</h1>
        <p className="text-sm text-zinc-500 mt-1">Build your empire without burning out.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><span className="text-xs text-zinc-500">Burnout risk</span></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold">{risk.score}</div>
            <Badge variant={color[risk.level]}>{risk.level}</Badge>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><span className="text-xs text-zinc-500">AI recommendations</span></CardHeader>
          <CardContent><ul className="space-y-2 text-sm">{risk.advice.map((a) => <li key={a} className="flex gap-2"><span className="text-violet-600">✦</span>{a}</li>)}</ul></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Optimal posting windows (local)</h2></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">{windows.map((w) => <Badge key={w} variant="outline" className="text-base">{w}</Badge>)}</CardContent>
      </Card>
    </div>
  );
}
