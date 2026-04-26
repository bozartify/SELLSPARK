'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateCaption, buildHashtagMix, predictVirality,
  buildContentCalendar, adaptPostForPlatform, analyzeHashtags,
  PLATFORM_LIMITS, type SocialPlatform, type ContentType,
} from '@/lib/platform/social-scheduler';

const PLATFORMS: SocialPlatform[] = ['instagram', 'tiktok', 'twitter', 'linkedin', 'youtube', 'threads'];
const PLATFORM_ICONS: Record<SocialPlatform, string> = {
  instagram: '📸', tiktok: '🎵', twitter: '🐦', linkedin: '💼',
  youtube: '▶️', facebook: '👤', pinterest: '📌', threads: '🔗',
};

const TONES = ['educational', 'inspirational', 'promotional', 'conversational'] as const;

export default function SocialPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['instagram', 'tiktok']);
  const [topic, setTopic] = useState('How to get your first 1000 followers');
  const [niche] = useState('business');
  const [tone, setTone] = useState<typeof TONES[number]>('educational');
  const [activeTab, setActiveTab] = useState<'compose' | 'calendar' | 'hashtags' | 'virality'>('compose');

  const togglePlatform = (p: SocialPlatform) => setSelectedPlatforms(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
  );

  const hashtags = buildHashtagMix(niche, topic);
  const hashtagAnalysis = analyzeHashtags(hashtags, niche);
  const calendar = buildContentCalendar(selectedPlatforms, 3, 17, 2026);

  const viralPredictions = selectedPlatforms.map(p => ({
    platform: p,
    prediction: predictVirality(p, 'reel', 5000, 0.04, hashtags.length, 19),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Scheduler</h1>
          <p className="text-sm text-gray-400 mt-1">AI captions · Hashtag intelligence · Virality predictor · Content calendar</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">+ Schedule Post</Button>
      </div>

      {/* Platform selector */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map(p => (
          <button key={p} onClick={() => togglePlatform(p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${selectedPlatforms.includes(p) ? 'border-violet-500 bg-violet-600/20 text-white' : 'border-white/20 text-gray-400 hover:border-white/40'}`}>
            <span>{PLATFORM_ICONS[p]}</span>
            <span className="capitalize">{p}</span>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['compose', 'calendar', 'hashtags', 'virality'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'virality' ? '🚀 Virality' : t}
          </button>
        ))}
      </div>

      {activeTab === 'compose' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-400 text-xs uppercase tracking-wider">Topic</label>
              <input value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
                placeholder="What is this post about?" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs uppercase tracking-wider">Tone</label>
              <div className="flex gap-2">
                {TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`px-3 py-1.5 text-xs rounded capitalize ${tone === t ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {selectedPlatforms.map(platform => {
              const baseCaption = generateCaption(platform, topic, niche, tone);
              const adapted = adaptPostForPlatform(baseCaption, hashtags, platform);
              const limits = PLATFORM_LIMITS[platform];
              return (
                <Card key={platform} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <span>{PLATFORM_ICONS[platform]}</span>
                      <span className="capitalize">{platform}</span>
                      <Badge className="bg-white/10 text-gray-400 text-xs ml-auto">
                        {adapted.caption.length}/{limits.captionMax} chars
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea readOnly value={adapted.caption}
                      className="w-full bg-white/5 rounded p-3 text-gray-300 text-xs resize-none h-24 font-mono" />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {adapted.hashtags.slice(0, 5).map(h => (
                        <Badge key={h} className="bg-violet-600/20 text-violet-300 text-xs">{h}</Badge>
                      ))}
                      {adapted.hashtags.length > 5 && <Badge className="bg-white/10 text-gray-400 text-xs">+{adapted.hashtags.length - 5} more</Badge>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Week {calendar.week}, {calendar.year} — Optimal posting slots</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {calendar.slots.map((slot, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{PLATFORM_ICONS[slot.platform]}</span>
                    <span className="text-white text-sm capitalize font-medium">{slot.platform}</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][slot.dayOfWeek]} at {slot.hour}:00 UTC
                  </p>
                  <p className="text-gray-400 text-xs capitalize mt-1">Format: {slot.contentType}</p>
                  <p className="text-green-400 text-xs mt-2">~{slot.expectedReach.toLocaleString()} estimated reach</p>
                  {!slot.post ? (
                    <Button size="sm" className="mt-2 w-full text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/30">
                      + Schedule Content
                    </Button>
                  ) : (
                    <Badge className="mt-2 bg-green-600 text-white text-xs">Scheduled</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hashtags' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['niche', 'mid', 'broad'].map(tier => (
              <div key={tier} className="space-y-2">
                <p className="text-gray-400 text-xs uppercase tracking-wider capitalize">{tier} tags</p>
                {hashtagAnalysis.filter(h => h.recommendationTier === tier).map(h => (
                  <div key={h.tag} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-violet-300 text-sm">{h.tag}</span>
                      <Badge className={`text-xs ${h.volume === 'mega' ? 'bg-red-600/30 text-red-400' : h.volume === 'high' ? 'bg-yellow-600/30 text-yellow-400' : 'bg-green-600/30 text-green-400'}`}>{h.volume}</Badge>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>Difficulty: {h.difficulty}/100</span>
                      <span>Relevance: {(h.relevanceScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full mt-2">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${h.difficulty}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Card className="bg-violet-900/20 border-violet-500/20">
            <CardContent className="p-4">
              <p className="text-violet-300 text-sm font-medium">💡 3-8-19 Formula</p>
              <p className="text-gray-400 text-xs mt-1">Use 3 niche tags + 8 mid tags + 19 broad tags for maximum algorithmic distribution on Instagram.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'virality' && (
        <div className="space-y-3">
          {viralPredictions.map(({ platform, prediction }) => (
            <Card key={platform} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{PLATFORM_ICONS[platform]}</span>
                    <span className="text-white font-medium capitalize">{platform}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${prediction.score > 70 ? 'text-green-400' : prediction.score > 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {prediction.score}
                    </span>
                    <span className="text-gray-500 text-sm">/100</span>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full mb-3">
                  <div className={`h-full rounded-full transition-all ${prediction.score > 70 ? 'bg-green-500' : prediction.score > 50 ? 'bg-yellow-500' : 'bg-gray-500'}`}
                    style={{ width: `${prediction.score}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div><p className="text-gray-400 text-xs">Peak Reach</p><p className="text-white text-sm font-medium">{prediction.peakReach.toLocaleString()}</p></div>
                  <div><p className="text-gray-400 text-xs">Est. Shares</p><p className="text-white text-sm font-medium">{prediction.estimatedShares.toLocaleString()}</p></div>
                  <div><p className="text-gray-400 text-xs">Breakout P</p><p className="text-white text-sm font-medium">{(prediction.breakoutProbability * 100).toFixed(1)}%</p></div>
                </div>
                <div className="space-y-1">
                  {prediction.recommendations.map((r, i) => (
                    <p key={i} className={`text-xs ${r.includes('✓') ? 'text-green-400' : 'text-yellow-400'}`}>
                      {r.includes('✓') ? '✓' : '→'} {r}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
