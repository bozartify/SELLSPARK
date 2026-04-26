'use client';
import { flowState } from '@/lib/platform/bci';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NeuralPage() {
  const sample = { ts: Date.now(), sampleRateHz: 256, channels: Array.from({ length: 256 }, (_, i) => Math.sin(i * 0.3) + Math.sin(i * 0.1) * 0.5 + (Math.random() - 0.5) * 0.2) };
  const f = flowState(sample);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Neural Interface Lab</h1>
        <p className="text-sm text-zinc-500 mt-1">EEG-driven creator flow detection. Muse / Neurable / Emotiv.</p>
      </div>
      <div className="grid md:grid-cols-5 gap-3">
        {[{ k: 'Alpha (relax)', v: f.alpha }, { k: 'Beta (focus)', v: f.beta }, { k: 'Theta (flow)', v: f.theta }, { k: 'Focus index', v: f.focus }, { k: 'Flow index', v: f.flow }].map((m) => (
          <Card key={m.k}><CardHeader><span className="text-xs text-zinc-500">{m.k}</span></CardHeader><CardContent className="text-xl font-bold">{m.v.toFixed(2)}</CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Adaptive pacing</h2></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>When flow &gt; 3 → mute notifications, extend creator session.</div>
          <div>When focus drops → suggest 2-min reset, dim UI.</div>
          <Badge variant="success">Auto-adaptive ON</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
