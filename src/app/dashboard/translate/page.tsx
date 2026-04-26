'use client';
import { useState } from 'react';
import { SUPPORTED_LANGUAGES, detectLanguage, translate, isRTL } from '@/lib/platform/translate-realtime';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TranslatePage() {
  const [src, setSrc] = useState('Your creator empire, built by AI.');
  const [to, setTo] = useState('es');
  const [out, setOut] = useState<string | null>(null);
  const [lat, setLat] = useState(0);
  const detected = detectLanguage(src);
  const run = async () => {
    const r = await translate(src, to);
    setOut(r.text); setLat(r.latencyMs);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Real-time Translation</h1>
        <p className="text-sm text-zinc-500 mt-1">{SUPPORTED_LANGUAGES.length} languages · sub-200ms edge pipeline</p>
      </div>
      <Card>
        <CardHeader><div className="flex items-center justify-between"><h2 className="font-semibold">Try it</h2><Badge variant="outline">Detected: {detected.toUpperCase()}</Badge></div></CardHeader>
        <CardContent className="space-y-3">
          <textarea value={src} onChange={(e) => setSrc(e.target.value)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-sm min-h-[100px]" />
          <div className="flex gap-2">
            <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-sm">
              {SUPPORTED_LANGUAGES.slice(0, 40).map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <Button onClick={run}>Translate</Button>
          </div>
          {out && (
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4 text-sm" dir={isRTL(to) ? 'rtl' : 'ltr'}>
              <div className="font-semibold mb-1">{out}</div>
              <div className="text-xs text-zinc-500">{lat}ms · edge</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
