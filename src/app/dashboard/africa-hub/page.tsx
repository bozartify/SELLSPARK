'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AFRICAN_LANGUAGES,
  AfricanLanguage,
  UI_STRINGS,
  getLocalizedString,
  generateMockMobileMoneyData,
  getMobileMoneyStats,
  MobileMoneyTransaction,
  SAMPLE_USSD_MENUS,
  buildUSSDFlow,
  processUSSDInput,
  USSDSession,
  MARKET_INSIGHTS,
  MarketInsight,
  rankMarketsByOpportunity,
} from '@/lib/platform/africa-localization';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSpeakers(millions: number): string {
  if (millions >= 1000) return `${(millions / 1000).toFixed(1)}B`;
  return `${millions}M`;
}

function truncateMsisdn(msisdn: string): string {
  if (msisdn.length <= 7) return msisdn;
  return msisdn.slice(0, 4) + '•••' + msisdn.slice(-3);
}

function txIcon(type: MobileMoneyTransaction['type']): { icon: string; color: string } {
  if (type === 'send' || type === 'payment' || type === 'withdraw') {
    return { icon: '↑', color: 'text-red-400' };
  }
  if (type === 'receive' || type === 'deposit') {
    return { icon: '↓', color: 'text-green-400' };
  }
  return { icon: '•', color: 'text-gray-400' };
}

function statusColor(status: MobileMoneyTransaction['status']): string {
  if (status === 'success') return 'text-green-400';
  if (status === 'pending') return 'text-amber-400';
  return 'text-red-400';
}

function tierVariant(tier: string): 'default' | 'success' | 'warning' {
  if (tier === 'merchant') return 'success';
  if (tier === 'premium') return 'default';
  return 'warning';
}

function opportunityColor(rank: number): string {
  if (rank <= 3) return 'bg-green-500/20 text-green-300 border border-green-500/30';
  if (rank <= 7) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
  return 'bg-red-500/20 text-red-300 border border-red-500/30';
}

function BarCell({ value, max = 100, color = 'violet' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = color === 'green' ? 'bg-green-500' : 'bg-violet-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white/70">{value}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab types
// ---------------------------------------------------------------------------

type Tab = 'languages' | 'mobile-money' | 'ussd' | 'markets';

// ---------------------------------------------------------------------------
// Languages Tab
// ---------------------------------------------------------------------------

const UI_PREVIEW_KEYS = ['welcome', 'dashboard', 'profile', 'earnings', 'payment'] as const;

function LanguagesTab() {
  const [selected, setSelected] = useState<AfricanLanguage | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {AFRICAN_LANGUAGES.map((lang) => {
          const isSelected = selected?.code === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setSelected(isSelected ? null : lang)}
              className={`text-left rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-violet-500/60 bg-violet-500/15 shadow-lg shadow-violet-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center rounded-md bg-violet-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-violet-300 uppercase">
                  {lang.code}
                </span>
                {lang.rtl && (
                  <span className="text-[10px] text-amber-400 font-medium">RTL</span>
                )}
              </div>
              <p className="text-sm font-semibold text-white">{lang.name}</p>
              <p className="text-xs text-white/50 mt-0.5">{lang.region}</p>
              <p className="text-xs text-green-400 mt-1 font-medium">{formatSpeakers(lang.speakers)} speakers</p>
              <p className="text-[11px] text-white/40 mt-0.5">{lang.scriptSystem}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            UI Preview — {selected.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {UI_PREVIEW_KEYS.map((key) => (
              <div key={key} className="rounded-lg bg-white/5 border border-white/10 p-3">
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{key}</p>
                <p className="text-sm font-medium text-white">{getLocalizedString(key, selected.code)}</p>
                <p className="text-[11px] text-white/40 mt-1 italic">
                  en: {UI_STRINGS[key]?.['en'] ?? key}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile Money Tab
// ---------------------------------------------------------------------------

function MobileMoneyTab() {
  const { accounts, transactions } = useMemo(() => generateMockMobileMoneyData(), []);
  const stats = useMemo(() => getMobileMoneyStats(transactions), [transactions]);
  const displayAccounts = accounts.slice(0, 5);
  const displayTxs = transactions.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total In', value: stats.totalIn, color: 'text-green-400' },
          { label: 'Total Out', value: stats.totalOut, color: 'text-red-400' },
          { label: 'Fees', value: stats.fees, color: 'text-amber-400' },
          { label: 'Net Flow', value: stats.netFlow, color: stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayAccounts.map((acc) => (
          <div key={acc.accountId} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white capitalize">{acc.provider}</span>
              <Badge variant={tierVariant(acc.tier)}>{acc.tier}</Badge>
            </div>
            <p className="text-xs font-mono text-white/50">{truncateMsisdn(acc.msisdn)}</p>
            <p className="text-lg font-bold text-violet-300">
              {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs text-white/50">{acc.currency}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-white/5">
          {displayTxs.map((tx) => {
            const { icon, color } = txIcon(tx.type);
            return (
              <div key={tx.txId} className="flex items-center gap-3 px-5 py-3">
                <span className={`text-lg font-bold w-6 shrink-0 text-center ${color}`}>{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white capitalize">{tx.type}</p>
                  <p className="text-xs text-white/40 truncate">{tx.counterparty}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {tx.amount.toLocaleString()} {tx.currency}
                  </p>
                  <p className="text-xs text-white/40">fee {tx.fee}</p>
                </div>
                <span className={`text-xs font-medium capitalize shrink-0 ${statusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// USSD Tab
// ---------------------------------------------------------------------------

const USSD_FLOW = buildUSSDFlow(SAMPLE_USSD_MENUS);

function makeInitialSession(): USSDSession {
  return {
    sessionId: 'sim_001',
    phoneNumber: '+254 700 000 000',
    currentMenu: 'main',
    history: [],
    data: {},
  };
}

function USSDTab() {
  const [session, setSession] = useState<USSDSession>(makeInitialSession);

  const currentMenu = USSD_FLOW[session.currentMenu];

  function handleOption(key: string) {
    setSession((prev) => processUSSDInput(prev, key, USSD_FLOW));
  }

  function handleReset() {
    setSession(makeInitialSession());
  }

  // Build breadcrumb from history
  const breadcrumb = [...session.history, session.currentMenu];

  return (
    <div className="space-y-6 max-w-lg">
      {/* Phone display */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
        <span className="text-2xl">📱</span>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider">Simulated Device</p>
          <p className="text-sm font-mono font-semibold text-white">{session.phoneNumber}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 text-xs text-white/40">
        {breadcrumb.map((menuId, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-white/20">›</span>}
            <span className={i === breadcrumb.length - 1 ? 'text-violet-300 font-medium' : ''}>{menuId}</span>
          </span>
        ))}
      </div>

      {/* USSD screen */}
      {currentMenu ? (
        <div className="rounded-xl border border-violet-500/30 bg-black/40 p-5 space-y-4">
          <pre className="text-sm text-white/90 whitespace-pre-wrap font-mono leading-relaxed">
            {currentMenu.title}
          </pre>
          <div className="flex flex-wrap gap-2">
            {currentMenu.options.map((opt) => (
              <Button
                key={opt.key}
                variant="secondary"
                size="sm"
                onClick={() => handleOption(opt.key)}
              >
                {opt.key}. {opt.label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white/40 text-sm">
          Session ended or menu not found.
        </div>
      )}

      {/* Session data */}
      {Object.keys(session.data).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Session Data</p>
          {Object.entries(session.data).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-white/50 font-mono">{k}</span>
              <span className="text-white font-mono">{v}</span>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" onClick={handleReset}>
        ↺ Reset Session
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Markets Tab
// ---------------------------------------------------------------------------

type MarketSortKey = 'country' | 'internetPenetration' | 'mobileMoneyAdoption' | 'avgRevenuePerUser' | 'growthRate' | 'opportunity';
type SortDir = 'asc' | 'desc';

function MarketsTab() {
  const [sortKey, setSortKey] = useState<MarketSortKey>('opportunity');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Compute ranked markets once
  const rankedMarkets = useMemo(() => rankMarketsByOpportunity(MARKET_INSIGHTS), []);

  // Build a rank map: countryCode -> rank (1-based)
  const rankMap = useMemo(() => {
    const map: Record<string, number> = {};
    rankedMarkets.forEach((m, i) => { map[m.countryCode] = i + 1; });
    return map;
  }, [rankedMarkets]);

  const sorted = useMemo(() => {
    const arr = [...MARKET_INSIGHTS];
    arr.sort((a, b) => {
      let va: number | string;
      let vb: number | string;
      if (sortKey === 'country') {
        va = a.country;
        vb = b.country;
      } else if (sortKey === 'opportunity') {
        va = rankMap[a.countryCode] ?? 99;
        vb = rankMap[b.countryCode] ?? 99;
      } else {
        va = a[sortKey as keyof MarketInsight] as number;
        vb = b[sortKey as keyof MarketInsight] as number;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [sortKey, sortDir, rankMap]);

  function handleSort(key: MarketSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortHeader({ col, label }: { col: MarketSortKey; label: string }) {
    const active = sortKey === col;
    return (
      <th
        className="px-3 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none hover:text-white/80 transition-colors whitespace-nowrap"
        onClick={() => handleSort(col)}
      >
        {label}
        {active && <span className="ml-1 text-violet-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </th>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <SortHeader col="country" label="Country" />
            <SortHeader col="internetPenetration" label="Internet %" />
            <SortHeader col="mobileMoneyAdoption" label="Mobile Money %" />
            <SortHeader col="avgRevenuePerUser" label="ARPU $" />
            <th className="px-3 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider whitespace-nowrap">Top Payment</th>
            <SortHeader col="growthRate" label="Growth %" />
            <SortHeader col="opportunity" label="Opportunity" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.map((m: MarketInsight) => {
            const rank = rankMap[m.countryCode] ?? 10;
            return (
              <tr key={m.countryCode} className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="mr-2">{m.flagEmoji}</span>
                  <span className="text-white font-medium">{m.country}</span>
                </td>
                <td className="px-3 py-3">
                  <BarCell value={m.internetPenetration} color="violet" />
                </td>
                <td className="px-3 py-3">
                  <BarCell value={m.mobileMoneyAdoption} color="green" />
                </td>
                <td className="px-3 py-3 text-white/80 font-mono">
                  ${m.avgRevenuePerUser.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-white/60 max-w-[160px] truncate">
                  {m.topPaymentMethod}
                </td>
                <td className="px-3 py-3 text-green-400 font-semibold">
                  +{m.growthRate}%
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${opportunityColor(rank)}`}>
                    #{rank}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS: { id: Tab; label: string }[] = [
  { id: 'languages', label: 'Languages' },
  { id: 'mobile-money', label: 'Mobile Money' },
  { id: 'ussd', label: 'USSD' },
  { id: 'markets', label: 'Markets' },
];

export default function AfricaHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('languages');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950/20 to-gray-950 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Africa Hub</h1>
        <p className="text-white/50 text-sm mt-1">Languages · Mobile Money · USSD · Market Insights</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-white/5 border border-white/10 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'languages' && <LanguagesTab />}
        {activeTab === 'mobile-money' && <MobileMoneyTab />}
        {activeTab === 'ussd' && <USSDTab />}
        {activeTab === 'markets' && <MarketsTab />}
      </div>
    </div>
  );
}
