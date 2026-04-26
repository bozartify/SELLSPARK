'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  selectOptimalRoute, getDunningSchedule, classifyFailure,
  buildRecognitionSchedule, convertAmount, recommendPriceLocalization,
  type Currency, type RevenueRecognitionMethod,
} from '@/lib/platform/payment-intelligence';
import {
  AFRICAN_COUNTRIES, AFRICAN_FX, PAPSS_CORRIDORS,
  recommendRail, convertFromUSD, getLocalizedPaymentMethods, generateUSSDCode,
  type AfricanCurrency,
} from '@/lib/platform/pan-african-payments';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'BRL', 'INR', 'MXN', 'SGD'];
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD:'$', EUR:'€', GBP:'£', CAD:'CA$', AUD:'A$', JPY:'¥', BRL:'R$', INR:'₹', MXN:'MX$', SGD:'S$',
};
const CURRENCY_COUNTRIES: Record<Currency, string> = {
  USD:'US', EUR:'DE', GBP:'GB', CAD:'CA', AUD:'AU', JPY:'JP', BRL:'BR', INR:'IN', MXN:'MX', SGD:'SG',
};

const MOCK_TRANSACTIONS = [
  { id: 'txn_001', amount: 197,  currency: 'USD', status: 'success',  processor: 'stripe',    country: 'US' },
  { id: 'txn_002', amount: 97,   currency: 'EUR', status: 'failed',   processor: 'stripe',    country: 'DE' },
  { id: 'txn_003', amount: 29,   currency: 'GBP', status: 'success',  processor: 'adyen',     country: 'GB' },
  { id: 'txn_004', amount: 497,  currency: 'USD', status: 'failed',   processor: 'braintree', country: 'US' },
  { id: 'txn_005', amount: 1497, currency: 'USD', status: 'success',  processor: 'stripe',    country: 'AU' },
  { id: 'txn_006', amount: 49,   currency: 'CAD', status: 'disputed', processor: 'paypal',    country: 'CA' },
];

const DUNNING_CUSTOMERS = [
  { name: 'Sarah K.',   mrr: 297, stageIdx: 0, email: 'sarah@example.com',  lastAttempt: '2 days ago' },
  { name: 'Mike T.',    mrr: 97,  stageIdx: 1, email: 'mike@example.com',   lastAttempt: '5 days ago' },
  { name: 'Priya S.',   mrr: 497, stageIdx: 2, email: 'priya@example.com',  lastAttempt: '9 days ago' },
  { name: 'Carlos R.',  mrr: 197, stageIdx: 0, email: 'carlos@example.com', lastAttempt: '1 day ago'  },
];

const RECOGNITION_PRODUCTS: Array<{ name: string; price: number; type: RevenueRecognitionMethod; days: number }> = [
  { name: 'Annual Course Bundle', price: 997,  type: 'ratable',    days: 365 },
  { name: 'Coaching Package',     price: 1500, type: 'milestone',  days: 90  },
  { name: 'Template Pack',        price: 97,   type: 'immediate',  days: 1   },
];

const FAILURE_CODES = ['insufficient_funds', 'card_declined', 'expired_card', 'do_not_honor', 'fraudulent'];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'routing' | 'dunning' | 'recognition' | 'localization' | 'pan-african'>('routing');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [fxUSD, setFxUSD] = useState(100);
  const [amount, setAmount] = useState(197);
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'discover'>('visa');
  const [isIntl, setIsIntl] = useState(false);

  const routes = selectOptimalRoute(amount * 100, 'USD', cardBrand, isIntl); // amount in cents
  const bestRoute = routes[0];
  const dunningSchedule = getDunningSchedule();

  const statusColor = (s: string) =>
    s === 'success' ? 'text-green-400' : s === 'failed' ? 'text-red-400' : 'text-yellow-400';
  const stageColor = (i: number) => i === 0 ? 'bg-yellow-500/20 text-yellow-300' : i === 1 ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">Smart routing · Dunning · Revenue recognition · Price localization</p>
        </div>
        <Badge className="bg-violet-600 text-white">AI-Optimized</Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Payment Success Rate', value: '94.2%', delta: '+1.8% this month', color: 'text-green-400' },
          { label: 'Revenue Recovered',    value: '$4,820', delta: 'dunning wins',    color: 'text-violet-400' },
          { label: 'Avg Processing Fee',   value: '2.1%',  delta: '-0.3% vs manual', color: 'text-green-400' },
          { label: 'Disputed Txns',        value: '0.4%',  delta: 'below 1% target', color: 'text-green-400' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{kpi.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['routing', 'dunning', 'recognition', 'localization', 'pan-african'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'routing' ? '🔀 Smart Routing' : t === 'dunning' ? '🔔 Dunning' : t === 'recognition' ? '📊 Recognition' : t === 'localization' ? '🌍 Localization' : '🌍 Pan-African Rails'}
          </button>
        ))}
      </div>

      {/* ─── ROUTING ─── */}
      {activeTab === 'routing' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">Route Optimizer</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Amount ($)</label>
                    <input type="number" value={amount} onChange={e => setAmount(+e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Card Brand</label>
                    <select value={cardBrand} onChange={e => setCardBrand(e.target.value as typeof cardBrand)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
                      {(['visa','mastercard','amex','discover'] as const).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={isIntl} onChange={e => setIsIntl(e.target.checked)} className="rounded" />
                  International card (+1.5% cross-border fee)
                </label>
                {bestRoute && (
                  <div className="p-3 bg-violet-600/10 border border-violet-500/30 rounded-lg">
                    <p className="text-violet-300 text-xs mb-2 font-semibold">RECOMMENDED ROUTE</p>
                    <p className="text-white font-bold text-lg capitalize">{bestRoute.processorId}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-gray-400">Fee: <span className="text-white">{(bestRoute.feePercent * 100).toFixed(2)}%</span></span>
                      <span className="text-gray-400">Success: <span className="text-green-400">{(bestRoute.successRate * 100).toFixed(1)}%</span></span>
                      <span className="text-gray-400">Score: <span className="text-violet-300">{bestRoute.score.toFixed(2)}</span></span>
                      <span className="text-gray-400">Settle: <span className="text-white">{bestRoute.settlementDays}d</span></span>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">All Routes (ranked)</p>
                  {routes.map((r, i) => (
                    <div key={r.processorId} className="flex items-center gap-3 text-xs py-1 border-b border-white/5">
                      <span className="text-gray-500 w-4">#{i+1}</span>
                      <span className="text-gray-300 capitalize w-24">{r.processorId}</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.max(0, r.score)}%` }} />
                      </div>
                      <span className="text-white w-12 text-right">{r.score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">Failure Classification</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {FAILURE_CODES.map(code => {
                  const info = classifyFailure(code);
                  return (
                    <div key={code} className="p-2 bg-white/5 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white capitalize">{code.replace(/_/g,' ')}</p>
                        <Badge className={info.retryable ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                          {info.retryable ? 'Retryable' : 'Terminal'}
                        </Badge>
                      </div>
                      <p className="text-gray-400">{info.userAction}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Recent Transactions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {MOCK_TRANSACTIONS.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
                    <span className="text-gray-500 font-mono w-20">{tx.id}</span>
                    <span className="text-white">{tx.currency} {tx.amount}</span>
                    <span className="text-gray-400 capitalize">{tx.processor}</span>
                    <span className="text-gray-500">{tx.country}</span>
                    <span className={`font-medium capitalize ${statusColor(tx.status)}`}>{tx.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── DUNNING ─── */}
      {activeTab === 'dunning' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DUNNING_CUSTOMERS.map(c => {
              const stage = dunningSchedule[c.stageIdx];
              return (
                <Card key={c.name} className="bg-white/5 border-white/10">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{c.name}</p>
                        <p className="text-gray-500 text-xs">{c.email}</p>
                      </div>
                      <Badge className={stageColor(c.stageIdx)}>Stage {c.stageIdx + 1}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">MRR at risk: <span className="text-white font-medium">${c.mrr}/mo</span></p>
                    <div className="p-2 bg-white/5 rounded text-xs space-y-0.5">
                      <p className="text-gray-400">Retry in: <span className="text-white">{stage.delayHours}h</span></p>
                      <p className="text-gray-400">SMS: <span className={stage.smsEnabled ? 'text-green-400' : 'text-gray-500'}>{stage.smsEnabled ? 'Yes' : 'No'}</span></p>
                      {stage.offerDiscount && <p className="text-violet-300">💎 Offer {stage.discountPct}% discount</p>}
                    </div>
                    <div className="text-xs text-gray-300 italic border-l-2 border-violet-500/40 pl-2">
                      "{stage.emailSubject}"
                    </div>
                    <Button size="sm" className="w-full bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs">
                      Send Recovery Email
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Dunning Sequence Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 overflow-x-auto pb-2">
                {dunningSchedule.map((stage, i) => (
                  <div key={stage.stage} className="flex items-start gap-2 flex-shrink-0">
                    <div className="text-center p-3 bg-white/5 rounded-lg w-40">
                      <p className="text-violet-400 text-xs font-bold mb-1 capitalize">{stage.stage.replace('_',' ')}</p>
                      <p className="text-white text-xs">{stage.emailSubject.slice(0, 40)}…</p>
                      <p className="text-gray-500 text-xs mt-1">+{stage.delayHours}h</p>
                      {stage.offerDiscount && <p className="text-green-400 text-xs mt-1">{stage.discountPct}% off</p>}
                    </div>
                    {i < dunningSchedule.length - 1 && <div className="text-gray-600 mt-4">→</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── RECOGNITION ─── */}
      {activeTab === 'recognition' && (
        <div className="space-y-4">
          {RECOGNITION_PRODUCTS.map((prod, idx) => {
            const entry = buildRecognitionSchedule(
              `order-${idx}`,
              prod.price,
              prod.type,
              prod.days,
              prod.type === 'milestone' ? [{ name: 'Kickoff', pct: 0.33 }, { name: 'Mid-point', pct: 0.34 }, { name: 'Delivery', pct: 0.33 }] : undefined,
            );
            return (
              <Card key={prod.name} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{prod.name}</CardTitle>
                    <Badge className="bg-indigo-500/20 text-indigo-300 capitalize">{prod.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-3 text-sm">
                    <div><p className="text-gray-400 text-xs">Total</p><p className="text-white font-bold">${prod.price}</p></div>
                    <div><p className="text-gray-400 text-xs">Schedule Points</p><p className="text-white">{entry.recognitionSchedule.length}</p></div>
                    <div><p className="text-gray-400 text-xs">Deferred</p><p className="text-yellow-400">${entry.deferredRevenue}</p></div>
                    <div><p className="text-gray-400 text-xs">Recognized</p><p className="text-green-400">${entry.recognizedToDate}</p></div>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {entry.recognitionSchedule.map((e, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <span className="text-gray-500">{e.date}</span>
                        <div className="flex-1 mx-3 h-1.5 bg-white/10 rounded-full">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min((e.amount / prod.price) * 100, 100)}%` }} />
                        </div>
                        <span className="text-white">${e.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── PAN-AFRICAN ─── */}
      {activeTab === 'pan-african' && (() => {
        const FEATURED = ['NG', 'KE', 'GH', 'ZA', 'TZ', 'EG'];
        const FLAG: Record<string, string> = { NG: '🇳🇬', KE: '🇰🇪', GH: '🇬🇭', ZA: '🇿🇦', TZ: '🇹🇿', EG: '🇪🇬' };
        const featuredCountries = AFRICAN_COUNTRIES.filter(c => FEATURED.includes(c.code));
        const activeCountry = selectedCountry ? AFRICAN_COUNTRIES.find(c => c.code === selectedCountry) : null;
        const rec = activeCountry ? recommendRail(activeCountry.code, 50) : null;
        const methods = activeCountry ? getLocalizedPaymentMethods(activeCountry.code) : [];
        const ussd = rec && activeCountry ? generateUSSDCode(rec.rail, activeCountry.code, 100, 'REF001') : '';
        const FX_CURRENCIES: AfricanCurrency[] = ['NGN', 'KES', 'GHS', 'ZAR'];
        const FX_SYMBOLS: Record<AfricanCurrency, string> = { NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R', EGP: 'E£', TZS: 'TSh', UGX: 'USh', XOF: 'CFA', XAF: 'FCFA', RWF: 'RWF', ETB: 'Br', MAD: 'MAD', TND: 'TND', DZD: 'DZD', MZN: 'MT' };
        const railColor = (rail: string) => rail === 'mpesa' ? 'bg-green-500/20 text-green-300' : rail === 'paystack' ? 'bg-blue-500/20 text-blue-300' : rail === 'papss' ? 'bg-violet-500/20 text-violet-300' : rail === 'mtn-momo' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300';
        return (
          <div className="space-y-6">
            {/* Country Grid */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">Featured Markets</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {featuredCountries.map(c => {
                    const r = recommendRail(c.code, 50);
                    const isSelected = selectedCountry === c.code;
                    return (
                      <button key={c.code} onClick={() => setSelectedCountry(isSelected ? null : c.code)}
                        className={`p-3 rounded-lg border text-left transition-all ${isSelected ? 'bg-violet-600/20 border-violet-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                        <div className="text-2xl mb-1">{FLAG[c.code]}</div>
                        <p className="text-white text-xs font-semibold">{c.name}</p>
                        <p className="text-gray-400 text-xs">{c.currency}</p>
                        <Badge className={`mt-1 text-xs px-1 py-0 ${railColor(r.rail)}`}>{r.rail}</Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Country Detail */}
            {activeCountry && rec && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    {FLAG[activeCountry.code]} {activeCountry.name} — Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">Recommended Rail</p>
                      <Badge className={`text-sm px-3 py-1 ${railColor(rec.rail)}`}>{rec.rail}</Badge>
                      <p className="text-gray-300 text-xs">{rec.reasoning}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-gray-400">Est. Fee</span><span className="text-white">{(rec.estimatedFee * 100).toFixed(2)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Settlement</span><span className="text-white">{rec.settlementHours === 0 ? 'Instant' : `${rec.settlementHours}h`}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Success Rate</span><span className="text-green-400">{(rec.successRate * 100).toFixed(0)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Channel</span><span className="text-violet-300">{rec.channel}</span></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">Payment Methods</p>
                      {methods.map(m => (
                        <div key={m.id} className="flex items-center gap-2 p-2 bg-white/5 rounded text-xs">
                          <span>{m.icon}</span>
                          <span className="text-white flex-1">{m.name}</span>
                          {m.popular && <Badge className="bg-violet-500/20 text-violet-300 text-xs px-1 py-0">Popular</Badge>}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">USSD Code</p>
                      <div className="p-3 bg-black/30 rounded font-mono text-green-400 text-sm break-all">{ussd}</div>
                      <p className="text-gray-500 text-xs">Dial this code on any phone to pay via {rec.rail}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-gray-400">Banking penetration</span><span className="text-white">{(activeCountry.bankingPenetration * 100).toFixed(0)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Mobile penetration</span><span className="text-white">{(activeCountry.mobilePenetration * 100).toFixed(0)}%</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PAPSS Corridors */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">PAPSS Corridors</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-gray-400 py-2 pr-4">From → To</th>
                        <th className="text-left text-gray-400 py-2 pr-4">Currency Pair</th>
                        <th className="text-left text-gray-400 py-2 pr-4">Fee (bps)</th>
                        <th className="text-left text-gray-400 py-2 pr-4">Settlement</th>
                        <th className="text-left text-gray-400 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PAPSS_CORRIDORS.map(c => (
                        <tr key={`${c.from}-${c.to}`} className="border-b border-white/5">
                          <td className="py-2 pr-4 text-white font-mono">{c.from} → {c.to}</td>
                          <td className="py-2 pr-4 text-gray-300">{c.currency_pair}</td>
                          <td className="py-2 pr-4 text-violet-300">{(c.fee_pct * 10000).toFixed(0)} bps</td>
                          <td className="py-2 pr-4 text-green-400">{c.settlement}</td>
                          <td className="py-2"><Badge className="bg-green-500/20 text-green-300 text-xs px-1 py-0">Active</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* FX Calculator */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">FX Calculator</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-400 text-xs">USD Amount</label>
                  <input type="number" value={fxUSD} onChange={e => setFxUSD(Math.max(0, +e.target.value))}
                    className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FX_CURRENCIES.map(cur => (
                    <div key={cur} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-gray-400 text-xs font-bold mb-1">{cur}</p>
                      <p className="text-white font-bold text-lg">{FX_SYMBOLS[cur]}{convertFromUSD(fxUSD, cur).toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">1 USD = {AFRICAN_FX[cur].toLocaleString()} {cur}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* ─── LOCALIZATION ─── */}
      {activeTab === 'localization' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Price Localization Engine</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Base Price (USD)</label>
                <input type="number" value={amount} onChange={e => setAmount(+e.target.value)}
                  className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm w-40" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {CURRENCIES.filter(c => c !== 'USD').map(currency => {
                  const loc = recommendPriceLocalization(amount, currency);
                  const usdEquiv = convertAmount(loc.roundedPrice, currency, 'USD');
                  return (
                    <div key={currency} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs font-bold">{currency}</span>
                        <span className="text-xs text-gray-500">{CURRENCY_COUNTRIES[currency]}</span>
                      </div>
                      <p className="text-white font-bold">{CURRENCY_SYMBOLS[currency]}{loc.roundedPrice.toFixed(0)}</p>
                      <p className="text-gray-500 text-xs">≈ ${usdEquiv.toFixed(0)} USD</p>
                      <p className="text-violet-300 text-xs mt-1">Rate: {loc.exchangeRate.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
