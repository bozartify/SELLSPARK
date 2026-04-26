'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateDripSequence, optimizeSubjectLine, analyzeDeliverability,
  recommendSendTime, type EmailCampaign, type SequenceType,
} from '@/lib/platform/email-automation';

const MOCK_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'c1', name: 'January Launch', subject: 'The secret to $10k months', previewText: 'What nobody tells you about creator income',
    body: '', status: 'sent', recipientCount: 1842, segmentIds: [],
    stats: { delivered: 1801, opened: 612, clicked: 143, bounced: 41, unsubscribed: 12, spamReported: 2, revenue: 4320, openRate: 34, clickRate: 7.9, deliverabilityScore: 92 },
  },
  {
    id: 'c2', name: 'Product Tease Week 1', subject: 'Something big is coming...', previewText: 'Be the first to know',
    body: '', status: 'scheduled', scheduledAt: Date.now() + 86_400_000 * 2, recipientCount: 2140, segmentIds: [],
    stats: { delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, spamReported: 0, revenue: 0, openRate: 0, clickRate: 0, deliverabilityScore: 95 },
  },
];

const SEQUENCE_TYPES: SequenceType[] = ['welcome', 'nurture', 'product-launch', 'cart-abandon', 'win-back', 'onboarding', 'course'];

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'sequences' | 'optimizer'>('campaigns');
  const [subject, setSubject] = useState('How I built a $10k/month creator business');
  const [niche] = useState('business');
  const [selectedSequence, setSelectedSequence] = useState<SequenceType>('welcome');
  const [showDeliverability, setShowDeliverability] = useState(false);

  const subjectVariants = optimizeSubjectLine(subject);
  const deliverability = analyzeDeliverability(subject, 'Sample body text with <a href="#">link</a>. <a href="#">Unsubscribe</a>');
  const dripEmails = generateDripSequence(selectedSequence, niche, 'Creator Pro');
  const sendTimeRec = recommendSendTime([
    { dayOfWeek: 2, hour: 10 }, { dayOfWeek: 2, hour: 11 }, { dayOfWeek: 3, hour: 9 },
  ], 1842);

  const totalStats = MOCK_CAMPAIGNS.reduce((a, c) => ({
    delivered: a.delivered + c.stats.delivered,
    revenue: a.revenue + c.stats.revenue,
    opened: a.opened + c.stats.opened,
  }), { delivered: 0, revenue: 0, opened: 0 });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">AI sequences · Subject optimizer · Send-time AI · Deliverability scoring</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">+ New Campaign</Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Subscribers', value: '3,982', delta: '+127 this week', color: 'text-violet-400' },
          { label: 'Avg Open Rate', value: '34.2%', delta: '+4.1% vs industry', color: 'text-green-400' },
          { label: 'Emails Delivered', value: totalStats.delivered.toLocaleString(), delta: 'this month', color: 'text-blue-400' },
          { label: 'Revenue Attributed', value: `$${totalStats.revenue.toLocaleString()}`, delta: 'from email', color: 'text-yellow-400' },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['campaigns', 'sequences', 'optimizer'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'optimizer' ? 'AI Optimizer' : t}
          </button>
        ))}
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-3">
          {MOCK_CAMPAIGNS.map(c => (
            <Card key={c.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium">{c.name}</p>
                    <Badge className={c.status === 'sent' ? 'bg-green-600 text-white text-xs' : 'bg-yellow-600 text-white text-xs'}>{c.status}</Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{c.subject}</p>
                  <p className="text-gray-500 text-xs mt-1">{c.recipientCount.toLocaleString()} recipients</p>
                  {c.status === 'sent' && (
                    <div className="flex gap-4 mt-3 text-xs">
                      <span className="text-gray-400">Opens: <span className="text-white">{c.stats.openRate}%</span></span>
                      <span className="text-gray-400">Clicks: <span className="text-white">{c.stats.clickRate}%</span></span>
                      <span className="text-gray-400">Revenue: <span className="text-green-400">${c.stats.revenue.toLocaleString()}</span></span>
                    </div>
                  )}
                  {c.status === 'scheduled' && c.scheduledAt && (
                    <p className="text-yellow-400 text-xs mt-2">Sends {new Date(c.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={`text-xs ${c.stats.deliverabilityScore > 85 ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                    Deliverability {c.stats.deliverabilityScore}/100
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'sequences' && (
        <div className="space-y-4">
          {/* Sequence type selector */}
          <div className="flex flex-wrap gap-2">
            {SEQUENCE_TYPES.map(type => (
              <button key={type} onClick={() => setSelectedSequence(type)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${selectedSequence === type ? 'border-violet-500 bg-violet-600/30 text-violet-300' : 'border-white/20 text-gray-400 hover:border-white/40'}`}>
                {type.replace(/-/g, ' ')}
              </button>
            ))}
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm capitalize">{selectedSequence.replace(/-/g,' ')} Sequence — {dripEmails.length} emails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dripEmails.map((email, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-sm font-bold flex-shrink-0">{i+1}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{email.subject}</p>
                      <Badge className="bg-white/10 text-gray-400 text-xs">{email.delayDays === 0 ? 'Immediately' : `Day ${email.delayDays}`}</Badge>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{email.previewText}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Send time recommendation */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">AI Send-Time Recommendation</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl">⏰</div>
                <div>
                  <p className="text-white font-medium">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][sendTimeRec.dayOfWeek]}s at {sendTimeRec.hour}:00 UTC</p>
                  <p className="text-gray-400 text-sm mt-1">{sendTimeRec.reasoning}</p>
                  <p className="text-green-400 text-xs mt-1">Confidence: {(sendTimeRec.confidenceScore * 100).toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'optimizer' && (
        <div className="space-y-4">
          {/* Subject input */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Subject Line Optimizer</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <input value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500"
                placeholder="Enter your subject line..." />
              <div className="space-y-2">
                {subjectVariants.map((v, i) => (
                  <div key={i} className={`p-3 rounded-lg flex items-center justify-between ${i === 0 ? 'bg-violet-600/20 border border-violet-500/30' : 'bg-white/5'}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{v.subject}</p>
                      <div className="flex gap-3 mt-1 text-xs">
                        {v.hasEmoji && <span className="text-yellow-400">has emoji</span>}
                        {v.hasNumber && <span className="text-blue-400">has number</span>}
                        {v.hasQuestion && <span className="text-purple-400">question</span>}
                        {v.powerWords.length > 0 && <span className="text-green-400">{v.powerWords.length} power words</span>}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      {i === 0 && <Badge className="bg-violet-600 text-white text-xs mb-1">BEST</Badge>}
                      <p className="text-green-400 text-sm font-bold">{(v.predictedOpenRate * 100).toFixed(1)}%</p>
                      <p className="text-gray-500 text-xs">pred. open</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deliverability */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">Deliverability Score</CardTitle>
                <button onClick={() => setShowDeliverability(!showDeliverability)} className="text-gray-400 text-xs hover:text-white">
                  {showDeliverability ? 'Hide' : 'Analyze'}
                </button>
              </div>
            </CardHeader>
            {showDeliverability && (
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${deliverability.score > 80 ? 'text-green-400' : deliverability.score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {deliverability.score}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Authentication: <span className="text-green-400">{deliverability.fromAuthentication}</span></p>
                    <p className="text-gray-400 text-sm">Links: {deliverability.linkCount} · Images: {deliverability.imageTextRatio.toFixed(1)}x ratio</p>
                    <p className="text-gray-400 text-sm">Unsubscribe: {deliverability.unsubscribeLink ? '✅' : '❌'}</p>
                  </div>
                </div>
                {deliverability.suggestions.length > 0 && (
                  <div className="space-y-1">
                    {deliverability.suggestions.map((s, i) => <p key={i} className="text-yellow-400 text-xs">⚠ {s}</p>)}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
