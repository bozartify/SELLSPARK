'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createStream, moderateChat, pinProduct, getDonationTier, assessStreamHealth,
  simulateViewerCurve, computeEngagement, DONATION_TIERS,
  type LiveStream, type ChatMessage, type ProductPin, type StreamHealth,
} from '@/lib/platform/live-streaming';

const MOCK_STREAM = createStream('creator_001', '🔴 LIVE: How I Made $50k Online — Q&A + Secrets Revealed', {
  status: 'live', startedAt: Date.now() - 18 * 60_000,
  isShoppable: true, isMembersOnly: false,
  analytics: { totalViewers: 1842, peakConcurrent: 2104, avgWatchTimeMinutes: 14, chatMessages: 3280, donations: 47, donationRevenue: 1240, productClicks: 312, productPurchases: 28, productRevenue: 5516, replayViews: 0, engagementRate: 0 },
});

const MOCK_CHAT: ChatMessage[] = [
  { id: 'm1', userId: 'u1', username: 'Alex_Creator', role: 'subscriber', text: 'This is GOLD 🔥 been following for 2 years!', timestamp: Date.now() - 60000, toxicityScore: 0, isHidden: false, isPinned: false, badges: ['subscriber'] },
  { id: 'm2', userId: 'u2', username: 'Maya_Learns', role: 'viewer', text: 'Question: What is the best niche for 2026?', timestamp: Date.now() - 45000, toxicityScore: 0, isHidden: false, isPinned: false, badges: [] },
  { id: 'm3', userId: 'u3', username: 'SuperFan_Jake', role: 'vip', text: '🎉', timestamp: Date.now() - 30000, toxicityScore: 0, isHidden: false, isPinned: false, badges: ['vip'], donation: { amount: 50, currency: 'USD' } },
  { id: 'm4', userId: 'u4', username: 'spammer_bot', role: 'viewer', text: 'CLICK HERE FREE MONEY spam spam spam scam', timestamp: Date.now() - 20000, toxicityScore: 0, isHidden: false, isPinned: false, badges: [] },
  { id: 'm5', userId: 'u5', username: 'Lisa_B', role: 'viewer', text: 'When is your next course launching?', timestamp: Date.now() - 10000, toxicityScore: 0, isHidden: false, isPinned: false, badges: [] },
];

const MOCK_PRODUCTS: ProductPin[] = [
  pinProduct('prod_01', 'Creator Business Masterclass', 497, 50, 20),
  pinProduct('prod_02', 'Email Template Pack', 47),
];

export default function LivePage() {
  const [stream] = useState<LiveStream>(MOCK_STREAM);
  const [viewerCount, setViewerCount] = useState(1842);
  const [chat, setChat] = useState(moderateChat(MOCK_CHAT));
  const [health] = useState<StreamHealth>(assessStreamHealth(5800, 30, 12, 1200));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'commerce' | 'health'>('dashboard');
  const [newMessage, setNewMessage] = useState('');

  const viewerCurve = simulateViewerCurve(30, 18, 2104);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(100, prev + Math.floor((Math.random() - 0.48) * 30)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const engagement = computeEngagement({ ...stream.analytics, totalViewers: viewerCount });
  const moderated = chat.filter(m => m.isHidden);

  function sendMessage() {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`, userId: 'creator', username: 'You (Creator)', role: 'creator',
      text: newMessage, timestamp: Date.now(), toxicityScore: 0, isHidden: false, isPinned: false, badges: ['creator'],
    };
    setChat(prev => [...prev.slice(-50), msg]);
    setNewMessage('');
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Studio</h1>
          <p className="text-sm text-gray-400 mt-1">RTMP ingest · Shoppable streams · Chat moderation · Viewer analytics</p>
        </div>
        <div className="flex gap-2 items-center">
          {stream.status === 'live' && (
            <Badge className="bg-red-600 text-white animate-pulse">🔴 LIVE</Badge>
          )}
          <Button className="bg-red-600 hover:bg-red-700 text-white">End Stream</Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Viewers', value: viewerCount.toLocaleString(), color: 'text-red-400' },
          { label: 'Peak', value: stream.analytics.peakConcurrent.toLocaleString(), color: 'text-white' },
          { label: 'Revenue', value: `$${stream.analytics.productRevenue.toLocaleString()}`, color: 'text-green-400' },
          { label: 'Donations', value: `$${stream.analytics.donationRevenue.toLocaleString()}`, color: 'text-violet-400' },
          { label: 'Engagement', value: `${engagement.toFixed(0)}/100`, color: 'text-yellow-400' },
        ].map(s => (
          <Card key={s.label} className="bg-white/5 border-white/10">
            <CardContent className="p-3 text-center">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Viewer curve mini chart */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <p className="text-gray-400 text-xs mb-2">Viewer curve (last 30 minutes)</p>
          <div className="flex items-end gap-0.5 h-12">
            {viewerCurve.map((v, i) => (
              <div key={i} className="flex-1 bg-red-500/60 rounded-t"
                style={{ height: `${(v / Math.max(...viewerCurve)) * 100}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['dashboard', 'chat', 'commerce', 'health'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'health' ? '📡 Health' : t === 'commerce' ? '🛍️ Commerce' : t}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Stream Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Title</span><span className="text-white truncate max-w-[60%]">{stream.title.slice(0, 40)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white">{Math.floor((Date.now() - (stream.startedAt ?? 0)) / 60000)}m</span></div>
              <div className="flex justify-between"><span className="text-gray-400">RTMP URL</span><code className="text-violet-400 text-xs truncate max-w-[60%]">rtmp://live.sellspark.com/...</code></div>
              <div className="flex justify-between"><span className="text-gray-400">Stream Key</span><code className="text-gray-600 text-xs">••••••••••••••••</code></div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Donation Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {DONATION_TIERS.map(tier => (
                <div key={tier.name} className="flex items-center justify-between text-xs p-1.5 rounded" style={{ backgroundColor: `${tier.color}15` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span style={{ color: tier.color }}>{tier.name}</span>
                  </div>
                  <div className="flex gap-3 text-gray-400">
                    <span>${tier.minAmount}+</span>
                    <span>{tier.duration}s highlight</span>
                    {tier.animated && <span>✨ animated</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-3">
          {moderated.length > 0 && (
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-3">
                <p className="text-red-400 text-sm">🚨 {moderated.length} message(s) auto-hidden by AI moderation</p>
              </CardContent>
            </Card>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {chat.filter(m => !m.isHidden).map(msg => (
              <div key={msg.id} className={`p-3 rounded-lg ${msg.donation ? 'bg-violet-900/30 border border-violet-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: msg.role === 'creator' ? '#7c3aed' : msg.role === 'vip' ? '#f59e0b' : msg.role === 'subscriber' ? '#3b82f6' : '#9ca3af' }}
                    className="text-xs font-medium">{msg.username}</span>
                  {msg.badges.map(b => <Badge key={b} className="text-xs bg-white/10 text-gray-400">{b}</Badge>)}
                  {msg.donation && <Badge className="bg-violet-600 text-white text-xs">💰 ${msg.donation.amount}</Badge>}
                </div>
                <p className="text-gray-300 text-sm">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
              placeholder="Send a message as creator..." />
            <Button onClick={sendMessage} className="bg-red-600 hover:bg-red-700 text-white">Send</Button>
          </div>
        </div>
      )}

      {activeTab === 'commerce' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Products pinned to stream</p>
            <Button size="sm" className="text-xs bg-violet-600 hover:bg-violet-700 text-white">+ Pin Product</Button>
          </div>
          {MOCK_PRODUCTS.map(product => (
            <Card key={product.productId} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium">{product.name}</p>
                  <div className="flex gap-3 text-xs mt-1">
                    <span className="text-green-400 font-bold">${product.price}</span>
                    {product.limitedTimeOffer && <Badge className="bg-red-600 text-white text-xs">⚡ {product.limitedTimeOffer.discountPct}% OFF</Badge>}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>{product.clicks} clicks</span>
                    <span>{product.conversions} purchases</span>
                    {product.remainingStock && <span>{product.remainingStock} left</span>}
                  </div>
                </div>
                <Button size="sm" className="text-xs bg-white/10 hover:bg-white/20 text-white">Unpin</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-4">
          <Card className={`border ${health.status === 'excellent' ? 'border-green-500/30 bg-green-900/10' : health.status === 'good' ? 'border-blue-500/30 bg-blue-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`text-4xl ${health.status === 'excellent' ? '🟢' : health.status === 'good' ? '🟡' : '🔴'}`} />
              <div>
                <p className="text-white font-medium capitalize">Stream Quality: {health.status}</p>
                <p className="text-gray-400 text-sm">{health.resolution} · {(health.bitrate / 1000).toFixed(1)} Mbps · {health.fps} fps</p>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: 'Bitrate', v: `${(health.bitrate / 1000).toFixed(1)} Mbps`, good: health.bitrate > 3000 },
              { l: 'Frame Rate', v: `${health.fps} fps`, good: health.fps >= 30 },
              { l: 'Dropped Frames', v: health.droppedFrames.toString(), good: health.droppedFrames < 50 },
              { l: 'Latency', v: `${health.latency}ms`, good: health.latency < 3000 },
            ].map(s => (
              <Card key={s.l} className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <p className="text-gray-400 text-xs">{s.l}</p>
                  <p className={`text-xl font-bold mt-1 ${s.good ? 'text-green-400' : 'text-red-400'}`}>{s.v}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {health.recommendations.length > 0 && (
            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <CardHeader><CardTitle className="text-yellow-400 text-sm">Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {health.recommendations.map((r, i) => <p key={i} className="text-gray-300 text-sm">→ {r}</p>)}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
