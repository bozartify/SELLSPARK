'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  NOTIFICATION_SEGMENTS,
  schedulePushNotification,
  generateNotificationVariants,
  queueOfflineChange,
  processSyncQueue,
  APP_SHELL_ROUTES,
  generatePreloadHints,
  estimateShellSize,
  createBiometricChallenge,
  verifyBiometricResponse,
  generateInstallPromptCopy,
  type PushNotification,
  type OfflineChange,
  type DBOperation,
  type BiometricType,
  type BiometricChallenge,
  type PWAPlatform,
} from '@/lib/platform/pwa-engine';

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'notifications' | 'offline' | 'install' | 'biometric';

const TABS: { id: Tab; label: string }[] = [
  { id: 'notifications', label: 'Push Notifications' },
  { id: 'offline', label: 'Offline Sync' },
  { id: 'install', label: 'Install Prompt' },
  { id: 'biometric', label: 'Biometric Auth' },
];

// ─── Seed data helpers ────────────────────────────────────────────────────────

const SEED_CHANGES: Array<Omit<OfflineChange, 'id' | 'synced'>> = [
  { table: 'products', operation: 'INSERT', data: { name: 'Digital Course Pack', price: 49 }, timestamp: Date.now() - 320000 },
  { table: 'orders', operation: 'UPDATE', data: { status: 'fulfilled', orderId: 'ord_8821' }, timestamp: Date.now() - 210000 },
  { table: 'members', operation: 'DELETE', data: { memberId: 'mem_4492' }, timestamp: Date.now() - 95000 },
  { table: 'posts', operation: 'INSERT', data: { title: 'Q2 Creator Update', draft: true }, timestamp: Date.now() - 45000 },
  { table: 'subscriptions', operation: 'UPDATE', data: { plan: 'pro', renewsAt: '2026-05-22' }, timestamp: Date.now() - 12000 },
];

function operationColor(op: DBOperation): string {
  if (op === 'INSERT') return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  if (op === 'UPDATE') return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
  return 'text-red-400 border-red-500/40 bg-red-500/10';
}

function statusColor(status: PushNotification['status']): string {
  if (status === 'sent') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (status === 'scheduled') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  return 'bg-red-500/20 text-red-300 border-red-500/40';
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function msToCountdown(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return 'Expired';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function PWAMobilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('notifications');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">PWA &amp; Mobile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Push notifications · Offline sync · Install prompt · Biometric auth
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit backdrop-blur">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'offline' && <OfflineTab />}
      {activeTab === 'install' && <InstallTab />}
      {activeTab === 'biometric' && <BiometricTab />}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState<string>(NOTIFICATION_SEGMENTS[0]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [notifications, setNotifications] = useState<PushNotification[]>(() => [
    { id: 'n1', title: 'Flash Sale — 40% off', body: 'Your members get exclusive pricing today only.', icon: '/icon-192.png', scheduledAt: Date.now() - 3600000, segment: 'high_ltv', status: 'sent', openRate: 0.34 },
    { id: 'n2', title: 'New course dropped', body: 'Advanced Creator Monetization is live now.', icon: '/icon-192.png', scheduledAt: Date.now() - 86400000, segment: 'active_last_7d', status: 'sent', openRate: 0.51 },
    { id: 'n3', title: 'Weekly digest ready', body: 'See your top content this week.', icon: '/icon-192.png', scheduledAt: Date.now() + 7200000, segment: 'all_subscribers', status: 'scheduled' },
    { id: 'n4', title: 'Cart reminder', body: 'You left something behind.', icon: '/icon-192.png', scheduledAt: Date.now() - 172800000, segment: 'new_this_month', status: 'failed' },
  ]);
  const [variants, setVariants] = useState<string[]>([]);

  const handleSchedule = useCallback(() => {
    if (!title || !body) return;
    const n = schedulePushNotification({
      title,
      body,
      icon: '/icon-192.png',
      scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : Date.now() + 3600000,
      segment,
    });
    setNotifications((prev) => [n, ...prev]);
    setTitle('');
    setBody('');
    setScheduledAt('');
  }, [title, body, segment, scheduledAt]);

  const handleGenerateVariants = () => {
    if (!title) return;
    setVariants(generateNotificationVariants(title, 3));
  };

  return (
    <div className="space-y-4">
      {/* Compose */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader className="pb-2">
          <h2 className="text-white font-semibold">Compose Notification</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
          />
          <div className="flex gap-3 flex-wrap">
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            >
              {NOTIFICATION_SEGMENTS.map((s) => (
                <option key={s} value={s} className="bg-gray-900">
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSchedule}
              disabled={!title || !body}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm"
            >
              Schedule
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateVariants}
              disabled={!title}
              className="border-white/20 text-gray-300 hover:text-white text-sm"
            >
              Generate A/B Variants
            </Button>
          </div>
          {variants.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-xs text-gray-500 font-medium">A/B variants</p>
              {variants.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setTitle(v)}
                  className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {v}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification list */}
      <div className="space-y-2">
        {notifications.map((n) => (
          <Card key={n.id} className="bg-white/5 border-white/10 backdrop-blur">
            <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white truncate">{n.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(n.status)}`}>
                    {n.status}
                  </span>
                  {n.status === 'sent' && n.openRate !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-medium">
                      {(n.openRate * 100).toFixed(0)}% open rate
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {n.segment.replace(/_/g, ' ')} · {timeAgo(n.scheduledAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Offline Tab ──────────────────────────────────────────────────────────────

type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge';

function OfflineTab() {
  const [changes, setChanges] = useState<OfflineChange[]>(() =>
    SEED_CHANGES.map((c) => queueOfflineChange(c))
  );
  const [syncing, setSyncing] = useState(false);
  const [strategy, setStrategy] = useState<ConflictStrategy>('server-wins');
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number; conflicts: number } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    // Animate: mark all as optimistically syncing
    await new Promise((r) => setTimeout(r, 800));
    const result = await processSyncQueue(changes);
    setChanges((prev) =>
      prev.map((c) => {
        const wasConflict = result.conflicts.some((x) => x.id === c.id);
        if (wasConflict) return c;
        return { ...c, synced: result.synced > 0 ? true : c.synced };
      })
    );
    setSyncResult({ synced: result.synced, failed: result.failed, conflicts: result.conflicts.length });
    setSyncing(false);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-white font-semibold">Sync Queue</h2>
              <p className="text-xs text-gray-400">{changes.filter((c) => !c.synced).length} pending · {changes.filter((c) => c.synced).length} synced</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as ConflictStrategy)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="server-wins" className="bg-gray-900">server-wins</option>
                <option value="client-wins" className="bg-gray-900">client-wins</option>
                <option value="merge" className="bg-gray-900">merge</option>
              </select>
              <Button
                onClick={handleSync}
                disabled={syncing || changes.every((c) => c.synced)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >
                {syncing ? 'Syncing…' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {changes.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-all duration-500 ${
                c.synced ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-white/3 border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${operationColor(c.operation)}`}>
                  {c.operation}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium">{c.table}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {JSON.stringify(c.data)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-500">{timeAgo(c.timestamp)}</span>
                {c.synced ? (
                  <span className="text-xs text-emerald-400 font-medium">✓ synced</span>
                ) : (
                  <span className="text-xs text-yellow-400/80">pending</span>
                )}
              </div>
            </div>
          ))}

          {syncResult && (
            <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 text-sm">
              <span className="text-emerald-400 font-medium">{syncResult.synced} synced</span>
              {syncResult.failed > 0 && <span className="text-red-400 ml-3">{syncResult.failed} failed</span>}
              {syncResult.conflicts > 0 && <span className="text-yellow-400 ml-3">{syncResult.conflicts} conflicts resolved via <em>{strategy}</em></span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shell stats */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardContent className="py-3 px-4 flex items-center gap-6 text-sm flex-wrap">
          <div>
            <p className="text-gray-500 text-xs">Shell routes</p>
            <p className="text-white font-semibold">{APP_SHELL_ROUTES.length}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Total shell size</p>
            <p className="text-white font-semibold">{estimateShellSize(APP_SHELL_ROUTES)} KB</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Critical routes</p>
            <p className="text-white font-semibold">
              {APP_SHELL_ROUTES.filter((r) => r.preloadPriority === 'critical').length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Install Tab ──────────────────────────────────────────────────────────────

const CHECKLIST = [
  { label: 'Web App Manifest', ok: true },
  { label: 'Service Worker', ok: true },
  { label: 'HTTPS / Secure Context', ok: true },
  { label: 'Icons (192×192 & 512×512)', ok: true },
  { label: 'Offline Fallback Page', ok: true },
  { label: 'Start URL reachable', ok: true },
];

const INSTALL_STATS = {
  impressions: 4821,
  installs: 1037,
  get conversionRate() { return ((this.installs / this.impressions) * 100).toFixed(1); },
};

function InstallTab() {
  const [platform, setPlatform] = useState<PWAPlatform>('android');
  const copy = generateInstallPromptCopy(platform);
  const preloadHints = generatePreloadHints(APP_SHELL_ROUTES.filter((r) => r.preloadPriority === 'critical'));

  return (
    <div className="space-y-4">
      {/* Checklist */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader className="pb-2">
          <h2 className="text-white font-semibold">PWA Checklist</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHECKLIST.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="text-gray-300">{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Install prompt preview */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-white font-semibold">Install Prompt Preview</h2>
            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
              {(['ios', 'android', 'desktop'] as PWAPlatform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all capitalize ${
                    platform === p ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-950/40 to-purple-950/40 p-5 space-y-2">
            <p className="text-base font-bold text-white">{copy.title}</p>
            <p className="text-sm text-gray-300">{copy.subtitle}</p>
            <Button className="mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm">
              {copy.cta}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Install stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Impressions', value: INSTALL_STATS.impressions.toLocaleString() },
          { label: 'Installs', value: INSTALL_STATS.installs.toLocaleString() },
          { label: 'Conversion Rate', value: `${INSTALL_STATS.conversionRate}%` },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white/5 border-white/10 backdrop-blur">
            <CardContent className="py-3 px-4">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preload hints */}
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader className="pb-1">
          <h3 className="text-sm font-semibold text-white">Critical Preload Hints</h3>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-green-400/80 overflow-x-auto whitespace-pre-wrap break-all">
            {preloadHints}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Biometric Tab ────────────────────────────────────────────────────────────

type BiometricState = {
  challenge: BiometricChallenge | null;
  result: 'idle' | 'pending' | 'success' | 'failed';
  countdown: string;
};

const BIOMETRIC_INFO: Record<BiometricType, { icon: string; label: string; desc: string }> = {
  fingerprint: { icon: '🫳', label: 'Fingerprint', desc: 'Touch sensor / WebAuthn platform authenticator' },
  face: { icon: '🤳', label: 'Face ID', desc: 'Camera-based facial recognition via platform auth' },
  voice: { icon: '🎙️', label: 'Voice Print', desc: 'Passphrase + voiceprint challenge response' },
};

function BiometricCard({ type }: { type: BiometricType }) {
  const info = BIOMETRIC_INFO[type];
  const [state, setState] = useState<BiometricState>({
    challenge: null,
    result: 'idle',
    countdown: '',
  });

  // Tick countdown
  useEffect(() => {
    if (!state.challenge) return;
    const iv = setInterval(() => {
      setState((prev) => ({
        ...prev,
        countdown: msToCountdown(prev.challenge?.expiresAt ?? 0),
      }));
    }, 1000);
    return () => clearInterval(iv);
  }, [state.challenge]);

  const handleChallenge = () => {
    const challenge = createBiometricChallenge(type);
    setState({ challenge, result: 'pending', countdown: msToCountdown(challenge.expiresAt) });

    // Simulate user interaction delay then verify
    setTimeout(() => {
      const mockResponse = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const ok = verifyBiometricResponse(challenge, mockResponse);
      setState((prev) => ({ ...prev, result: ok ? 'success' : 'failed' }));
    }, 2200);
  };

  const reset = () => setState({ challenge: null, result: 'idle', countdown: '' });

  // Simulated support: fingerprint always, others by heuristic
  const supported = type === 'fingerprint' || type === 'face';

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur">
      <CardContent className="py-4 px-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info.icon}</span>
            <div>
              <p className="text-white font-semibold text-sm">{info.label}</p>
              <p className="text-xs text-gray-500 max-w-xs">{info.desc}</p>
            </div>
          </div>
          <Badge className={supported ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
            {supported ? 'Supported' : 'Not supported'}
          </Badge>
        </div>

        {state.result === 'idle' && (
          <Button
            onClick={handleChallenge}
            disabled={!supported}
            className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-sm"
          >
            Test Challenge
          </Button>
        )}

        {state.result === 'pending' && state.challenge && (
          <div className="rounded-lg border border-white/10 bg-white/3 px-3 py-3 space-y-1.5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Challenge active</p>
            <p className="text-xs text-gray-300">
              <span className="text-gray-500">Nonce: </span>
              <span className="font-mono">{state.challenge.nonce.slice(0, 24)}…</span>
            </p>
            <p className="text-xs text-gray-300">
              <span className="text-gray-500">Expires: </span>
              <span className={state.countdown === 'Expired' ? 'text-red-400' : 'text-yellow-300'}>
                {state.countdown}
              </span>
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <p className="text-xs text-blue-400">Awaiting authenticator…</p>
            </div>
          </div>
        )}

        {state.result === 'success' && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 flex items-center justify-between">
            <p className="text-sm text-emerald-300 font-medium">✓ Verification passed</p>
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300">Reset</button>
          </div>
        )}

        {state.result === 'failed' && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 flex items-center justify-between">
            <p className="text-sm text-red-300 font-medium">✗ Verification failed</p>
            <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300">Retry</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BiometricTab() {
  const types: BiometricType[] = ['fingerprint', 'face', 'voice'];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Capability detection uses WebAuthn platform authenticator APIs. Challenge nonces expire in 5 minutes.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {types.map((t) => (
          <BiometricCard key={t} type={t} />
        ))}
      </div>
    </div>
  );
}
