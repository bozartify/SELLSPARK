'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  scoreRFM, predictChurn, predictLTV, generateWinBack, buildPipeline,
  PRESET_SEGMENTS, type Contact, type ContactStage,
} from '@/lib/platform/crm-engine';

const NOW = Date.now();

const MOCK_CONTACTS: Contact[] = [
  { id: 'c1', email: 'alex@email.com', firstName: 'Alex', lastName: 'Chen', tags: ['buyer', 'champion'], stage: 'champion', source: 'organic', ltv: 1240, predictedLTV: 3800, churnScore: 12, rfm: scoreRFM(5, 8, 1240, { maxDays: 90, maxCount: 15, maxSpend: 2000 }), totalOrders: 8, totalSpend: 1240, lastPurchase: NOW - 5 * 86_400_000, firstPurchase: NOW - 180 * 86_400_000, customFields: {}, notes: [], createdAt: NOW - 180 * 86_400_000 },
  { id: 'c2', email: 'maya@email.com', firstName: 'Maya', lastName: 'Patel', tags: ['buyer'], stage: 'customer', source: 'social', ltv: 394, predictedLTV: 1200, churnScore: 45, rfm: scoreRFM(32, 3, 394, { maxDays: 90, maxCount: 15, maxSpend: 2000 }), totalOrders: 3, totalSpend: 394, lastPurchase: NOW - 32 * 86_400_000, firstPurchase: NOW - 90 * 86_400_000, customFields: {}, notes: [], createdAt: NOW - 90 * 86_400_000 },
  { id: 'c3', email: 'james@email.com', firstName: 'James', lastName: 'Rivera', tags: ['lead'], stage: 'lead', source: 'email', ltv: 0, predictedLTV: 400, churnScore: 72, rfm: scoreRFM(60, 1, 0, { maxDays: 90, maxCount: 15, maxSpend: 2000 }), totalOrders: 0, totalSpend: 0, lastPurchase: undefined, firstPurchase: undefined, customFields: {}, notes: [], createdAt: NOW - 60 * 86_400_000 },
  { id: 'c4', email: 'sara@email.com', firstName: 'Sara', lastName: 'Kim', tags: ['buyer'], stage: 'churned', source: 'ads', ltv: 197, predictedLTV: 250, churnScore: 88, rfm: scoreRFM(85, 1, 197, { maxDays: 90, maxCount: 15, maxSpend: 2000 }), totalOrders: 1, totalSpend: 197, lastPurchase: NOW - 85 * 86_400_000, firstPurchase: NOW - 85 * 86_400_000, customFields: {}, notes: [], createdAt: NOW - 85 * 86_400_000 },
];

const STAGE_COLORS: Record<ContactStage, string> = {
  lead: 'bg-yellow-600/20 text-yellow-400',
  prospect: 'bg-blue-600/20 text-blue-400',
  customer: 'bg-green-600/20 text-green-400',
  champion: 'bg-violet-600/20 text-violet-400',
  churned: 'bg-red-600/20 text-red-400',
  'win-back': 'bg-orange-600/20 text-orange-400',
};

const RFM_COLORS: Record<string, string> = {
  champions: 'text-yellow-400', loyal: 'text-green-400', 'potential-loyal': 'text-blue-400',
  recent: 'text-cyan-400', promising: 'text-teal-400', 'at-risk': 'text-orange-400',
  lost: 'text-red-400', hibernating: 'text-gray-400', 'cant-lose': 'text-purple-400', 'about-to-sleep': 'text-pink-400',
};

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'segments' | 'pipeline' | 'win-back'>('contacts');
  const [search, setSearch] = useState('');

  const pipeline = buildPipeline(MOCK_CONTACTS);
  const filtered = MOCK_CONTACTS.filter(c =>
    c.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalLTV = MOCK_CONTACTS.reduce((a, c) => a + c.ltv, 0);
  const avgChurn = Math.round(MOCK_CONTACTS.reduce((a, c) => a + c.churnScore, 0) / MOCK_CONTACTS.length);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM & Contacts</h1>
          <p className="text-sm text-gray-400 mt-1">RFM scoring · Churn prediction · LTV forecasting · Win-back automation</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">+ Add Contact</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Contacts', value: MOCK_CONTACTS.length.toString(), color: 'text-violet-400' },
          { label: 'Total LTV', value: `$${totalLTV.toLocaleString()}`, color: 'text-green-400' },
          { label: 'Avg Churn Risk', value: `${avgChurn}/100`, color: avgChurn > 60 ? 'text-red-400' : 'text-yellow-400' },
          { label: 'At-Risk Contacts', value: MOCK_CONTACTS.filter(c => c.churnScore > 70).length.toString(), color: 'text-red-400' },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['contacts', 'segments', 'pipeline', 'win-back'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'win-back' ? '♻️ Win-Back' : t}
          </button>
        ))}
      </div>

      {activeTab === 'contacts' && (
        <div className="space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500" />
          {filtered.map(contact => (
            <Card key={contact.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{contact.firstName} {contact.lastName}</p>
                      <p className="text-gray-400 text-xs">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    <Badge className={`text-xs ${STAGE_COLORS[contact.stage]}`}>{contact.stage}</Badge>
                    <Badge className={`text-xs ${RFM_COLORS[contact.rfm.segment] || 'text-gray-400'} bg-white/5`}>{contact.rfm.segment}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-center">
                  {[
                    { l: 'LTV', v: `$${contact.ltv.toLocaleString()}` },
                    { l: 'Predicted LTV', v: `$${contact.predictedLTV.toLocaleString()}` },
                    { l: 'Orders', v: contact.totalOrders.toString() },
                    { l: 'Churn Risk', v: `${contact.churnScore}/100` },
                    { l: 'RFM Score', v: `${contact.rfm.score}/15` },
                  ].map(item => (
                    <div key={item.l}>
                      <p className="text-gray-500 text-xs">{item.l}</p>
                      <p className={`text-sm font-medium ${item.l === 'Churn Risk' && contact.churnScore > 70 ? 'text-red-400' : 'text-white'}`}>{item.v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="space-y-3">
          {PRESET_SEGMENTS.map(seg => {
            const count = MOCK_CONTACTS.length; // simplified
            return (
              <Card key={seg.name} className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                    <div>
                      <p className="text-white font-medium">{seg.name}</p>
                      <p className="text-gray-400 text-xs">{seg.rules.map(r => `${r.field} ${r.operator} ${r.value}`).join(' AND ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{Math.floor(count * (0.1 + 0.4 * Math.random()))} contacts</p>
                    <Button size="sm" className="text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 mt-1">Send Campaign</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="space-y-3">
          {(Object.entries(pipeline.stages) as [ContactStage, { count: number; value: number }][]).map(([stage, data]) => (
            <Card key={stage} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs capitalize ${STAGE_COLORS[stage]}`}>{stage}</Badge>
                  <span className="text-white">{data.count} contacts</span>
                </div>
                <span className="text-green-400 font-medium">${data.value.toLocaleString()} predicted LTV</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'win-back' && (
        <div className="space-y-3">
          {MOCK_CONTACTS.filter(c => c.churnScore > 60).map(contact => {
            const wb = generateWinBack(contact);
            return (
              <Card key={contact.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{contact.firstName} {contact.lastName}</p>
                    <Badge className={`text-xs ${wb.offerType === 'discount' ? 'bg-red-600/30 text-red-400' : 'bg-violet-600/30 text-violet-400'}`}>
                      {wb.offerType.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{wb.message}</p>
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-gray-500">Last purchase: {wb.daysSinceLastPurchase} days ago</span>
                    {wb.discountPct && <span className="text-green-400">{wb.discountPct}% off offer</span>}
                    <span className="text-violet-400">ROI: {wb.expectedRoiMultiple.toFixed(1)}x</span>
                  </div>
                  <Button size="sm" className="mt-3 text-xs bg-violet-600 hover:bg-violet-700 text-white">Send Win-Back Email</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
