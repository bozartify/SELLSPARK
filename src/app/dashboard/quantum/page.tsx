'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateMockAuditLog,
  createQuantumPaymentSession,
  getSecurityBadge,
  DEFAULT_PQC_CONFIG,
  type PaymentAuditEntry,
} from '@/lib/quantum/payment-guard';

const MODULES = [
  { name: 'CRYSTALS-Kyber KEM', status: 'active', latency: '2.1ms', desc: 'Post-quantum lattice key encapsulation' },
  { name: 'Zero-Knowledge Prover', status: 'active', latency: '8.4ms', desc: 'Schnorr identity proofs' },
  { name: 'Quantum RNG', status: 'active', latency: '0.3ms', desc: 'Entropy-mixed randomness' },
  { name: 'Neural VQC', status: 'active', latency: '12ms', desc: 'Variational quantum classifier' },
  { name: 'Federated Aggregator', status: 'standby', latency: '—', desc: 'Privacy-preserving model updates' },
  { name: 'Homomorphic Rollup', status: 'active', latency: '4.2ms', desc: 'Encrypted metric aggregation' },
  { name: 'Merkle Attestation', status: 'active', latency: '1.8ms', desc: 'Revenue proof trees' },
  { name: 'LinUCB Recommender', status: 'active', latency: '3.6ms', desc: 'Contextual bandit optimizer' },
];

const TABS = ['Modules', 'Payment Guard'] as const;
type Tab = typeof TABS[number];

function msToTimeRemaining(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return 'Expired';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins}m ${secs}s`;
}

function truncate(str: string, len = 20): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function statusVariant(status: PaymentAuditEntry['status']): 'success' | 'destructive' | 'secondary' | 'default' {
  if (status === 'settled' || status === 'verified') return 'success';
  if (status === 'failed') return 'destructive';
  if (status === 'signed') return 'default';
  return 'secondary';
}

function LevelDot({ level }: { level: string }) {
  const colors: Record<string, string> = {
    'quantum-safe': '#7c3aed',
    hybrid: '#3b82f6',
    classical: '#6b7280',
  };
  return (
    <span
      className="inline-block w-3 h-3 rounded-full"
      style={{ backgroundColor: colors[level] ?? '#6b7280' }}
    />
  );
}

function PaymentGuardTab() {
  const badge = useMemo(() => getSecurityBadge(DEFAULT_PQC_CONFIG), []);
  const session = useMemo(() => createQuantumPaymentSession(), []);
  const auditLog = useMemo(() => generateMockAuditLog(8), []);

  // Stats
  const total = auditLog.length;
  const verified = auditLog.filter((e) => e.signatureValid).length;
  const verifiedPct = total > 0 ? Math.round((verified / total) * 100) : 0;
  const hybridCount = auditLog.filter((e) => e.hybridMode).length;
  const avgRisk = total > 0
    ? (auditLog.reduce((sum, e) => sum + e.riskScore, 0) / total).toFixed(3)
    : '—';

  return (
    <div className="space-y-6">
      {/* Security Badge panel */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Security Badge</h2>
        </CardHeader>
        <CardContent className="flex items-center gap-5">
          <span className="text-4xl">{badge.icon}</span>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">{badge.label}</span>
              <LevelDot level={badge.level} />
            </div>
            <div className="text-xs text-zinc-500 font-mono">
              {badge.algorithm} &middot; {badge.nistStandard}
            </div>
            <p className="text-sm text-zinc-600 max-w-xl">{badge.tooltip}</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Session card */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Active Payment Session</h2>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Session ID</div>
              <div className="font-mono text-violet-600">{truncate(session.sessionId, 22)}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Algorithm</div>
              <div className="font-mono">{session.algorithm}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Security Level</div>
              <Badge variant="default">{session.securityLevel}</Badge>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Expires In</div>
              <div className="font-mono text-emerald-600">{msToTimeRemaining(session.expiresAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: total },
          { label: '% Verified', value: `${verifiedPct}%` },
          { label: 'Hybrid Mode', value: hybridCount },
          { label: 'Avg Risk Score', value: avgRisk },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Log table */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Audit Log</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-zinc-500 text-left">
                <th className="pb-2 pr-4 font-medium">Intent ID</th>
                <th className="pb-2 pr-4 font-medium">Amount</th>
                <th className="pb-2 pr-4 font-medium">Algorithm</th>
                <th className="pb-2 pr-4 font-medium">Sig</th>
                <th className="pb-2 pr-4 font-medium">TLS</th>
                <th className="pb-2 pr-4 font-medium">Risk</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="py-2 pr-4 font-mono text-violet-600">{truncate(entry.paymentIntentId, 18)}</td>
                  <td className="py-2 pr-4 font-mono">
                    {entry.currency} {entry.amount}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{entry.pqcAlgorithm}</td>
                  <td className="py-2 pr-4 text-center text-base">
                    {entry.signatureValid ? (
                      <span className="text-emerald-600" title="Valid">✓</span>
                    ) : (
                      <span className="text-red-500" title="Invalid">✗</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{entry.tlsVersion}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{entry.riskScore.toFixed(2)}</td>
                  <td className="py-2">
                    <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuantumPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Modules');
  const [entropy, setEntropy] = useState('—');
  const refresh = () => setEntropy(Math.random().toString(36).slice(2, 18).toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quantum Intelligence Console</h1>
          <p className="text-sm text-zinc-500 mt-1">Patent-pending hybrid quantum-classical stack powering SellSpark.</p>
        </div>
        <Badge variant="success">All systems nominal</Badge>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Modules' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODULES.map((m) => (
              <Card key={m.name} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{m.name}</span>
                    <Badge variant={m.status === 'active' ? 'success' : 'secondary'}>{m.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-zinc-500 mb-2">{m.desc}</p>
                  <div className="text-xs font-mono text-violet-600">{m.latency}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><h2 className="font-semibold">Live Entropy Sample</h2></CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-2xl tracking-widest">{entropy}</div>
              <Button onClick={refresh}>Sample quantum RNG</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'Payment Guard' && <PaymentGuardTab />}
    </div>
  );
}
