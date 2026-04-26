'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  repurposeContent, generateBrandKit, generateContentBrief, analyzeSEO,
  createMediaAsset, organizeAssetsByTag, type ContentFormat, type BrandKit,
} from '@/lib/platform/creator-tools';

const MOCK_BRAND: BrandKit = generateBrandKit('Alex Creator Pro', 'business', 'Turn your knowledge into income');

const FORMATS: ContentFormat[] = ['blog', 'tweet-thread', 'linkedin-post', 'youtube-script', 'email', 'tiktok-caption', 'podcast-outline', 'course-module', 'sales-page'];

const MOCK_ASSETS = [
  createMediaAsset('hero-banner.jpg', 'image', 2.4, ['brand', 'hero']),
  createMediaAsset('intro-video.mp4', 'video', 145, ['video', 'course']),
  createMediaAsset('logo-v2.svg', 'logo', 0.05, ['brand', 'logo']),
  createMediaAsset('email-template.html', 'template', 0.02, ['email']),
  createMediaAsset('podcast-ep1.mp3', 'audio', 48, ['audio', 'podcast']),
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'repurpose' | 'brand' | 'seo' | 'assets'>('repurpose');
  const [sourceText, setSourceText] = useState('How I built a $10,000/month online business from scratch using content marketing and email automation in just 6 months');
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('tweet-thread');
  const [repurposed, setRepurposed] = useState<ReturnType<typeof repurposeContent> | null>(null);
  const [seoKeyword, setSeoKeyword] = useState('content marketing for creators');
  const [seoResult, setSeoResult] = useState<ReturnType<typeof analyzeSEO> | null>(null);
  const [assetSearch, setAssetSearch] = useState('');

  const brief = generateContentBrief('Content Marketing for Creators', 'business', MOCK_BRAND);
  const assetGroups = organizeAssetsByTag(MOCK_ASSETS);
  const filteredAssets = MOCK_ASSETS.filter(a =>
    a.filename.toLowerCase().includes(assetSearch.toLowerCase()) ||
    a.tags.some(t => t.includes(assetSearch.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Studio</h1>
          <p className="text-sm text-gray-400 mt-1">AI repurposer · Brand kit · SEO analyzer · Media library · Content briefs</p>
        </div>
        <Badge className="bg-violet-600 text-white">AI-Powered</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['repurpose', 'brand', 'seo', 'assets'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'repurpose' ? '♻️ Repurpose' : t === 'brand' ? '🎨 Brand Kit' : t === 'seo' ? '🔍 SEO' : '📁 Assets'}
          </button>
        ))}
      </div>

      {activeTab === 'repurpose' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">AI Content Repurposer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Source Content</label>
                <textarea value={sourceText} onChange={e => setSourceText(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm resize-none h-24 placeholder-gray-500"
                  placeholder="Paste any content — blog post, transcript, idea, tweet..." />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Target Format</label>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map(f => (
                    <button key={f} onClick={() => setSelectedFormat(f)}
                      className={`px-3 py-1.5 text-xs rounded capitalize transition-colors ${selectedFormat === f ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                      {f.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={() => setRepurposed(repurposeContent(sourceText, selectedFormat, MOCK_BRAND))}
                className="bg-violet-600 hover:bg-violet-700 text-white">
                ✨ Repurpose Content
              </Button>
            </CardContent>
          </Card>

          {repurposed && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm capitalize">{repurposed.format.replace(/-/g, ' ')} — {repurposed.wordCount} words · {repurposed.readingTimeMinutes}m read</CardTitle>
                  <Button size="sm" className="text-xs bg-violet-600/30 hover:bg-violet-600/50 text-violet-300">Copy</Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-gray-300 text-xs whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto max-h-80">
                  {repurposed.repurposedContent}
                </pre>
                {repurposed.seoScore && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-gray-400 text-xs">SEO Score:</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${repurposed.seoScore}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${repurposed.seoScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{repurposed.seoScore}/100</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Content Brief */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">AI Content Brief</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  { l: 'Topic', v: brief.topic },
                  { l: 'Target Keyword', v: brief.targetKeyword },
                  { l: 'Word Count', v: brief.wordCount.toString() },
                  { l: 'Audience', v: brief.targetAudience },
                  { l: 'Tone', v: brief.tone },
                  { l: 'CTA', v: brief.cta },
                ].map(item => (
                  <div key={item.l} className="p-2 bg-white/5 rounded">
                    <p className="text-gray-500">{item.l}</p>
                    <p className="text-white mt-0.5 truncate">{item.v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Outline</p>
                {brief.outlinePoints.map((point, i) => (
                  <div key={i} className="flex gap-2 text-xs py-1 border-b border-white/5">
                    <span className="text-violet-400 font-bold">{i + 1}.</span>
                    <span className="text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'brand' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Brand Kit — {MOCK_BRAND.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Brand Colors</p>
                <div className="flex gap-3">
                  {Object.entries(MOCK_BRAND.colors).map(([name, hex]) => (
                    <div key={name} className="text-center">
                      <div className="w-10 h-10 rounded-lg border border-white/20" style={{ backgroundColor: hex }} />
                      <p className="text-gray-500 text-xs mt-1 capitalize">{name}</p>
                      <p className="text-gray-400 text-xs">{hex}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Typography</p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(MOCK_BRAND.fonts).map(([role, font]) => (
                    <div key={role} className="p-2 bg-white/5 rounded">
                      <p className="text-gray-500 text-xs capitalize">{role}</p>
                      <p className="text-white text-sm">{font}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Brand Voice</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-violet-600/20 text-violet-300 capitalize">{MOCK_BRAND.tone}</Badge>
                  {MOCK_BRAND.values.map(v => <Badge key={v} className="bg-white/10 text-gray-300">{v}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Tagline</p>
                <p className="text-white font-medium italic">"{MOCK_BRAND.tagline}"</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Target Audience</p>
                <p className="text-gray-300 text-sm">{MOCK_BRAND.targetAudience}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">SEO Content Analyzer</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input value={seoKeyword} onChange={e => setSeoKeyword(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
                  placeholder="Target keyword..." />
                <Button onClick={() => setSeoResult(analyzeSEO(sourceText + ' ' + seoKeyword.repeat(5), seoKeyword))}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm">
                  Analyze
                </Button>
              </div>
              {seoResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-bold ${seoResult.score > 80 ? 'text-green-400' : seoResult.score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>{seoResult.score}</div>
                    <div>
                      <p className="text-white font-medium">SEO Score</p>
                      <p className="text-gray-400 text-sm">Estimated ranking: <span className="text-violet-300">{seoResult.estimatedRanking}</span></p>
                      <p className="text-gray-400 text-sm">Keyword density: <span className="text-white">{seoResult.density}%</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Optimized Title Tag</p>
                    <p className="text-white bg-white/5 p-2 rounded text-sm">{seoResult.titleTag}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Meta Description</p>
                    <p className="text-gray-300 bg-white/5 p-2 rounded text-sm">{seoResult.metaDescription}</p>
                  </div>
                  {seoResult.suggestions.length > 0 && (
                    <div className="space-y-1">
                      {seoResult.suggestions.map((s, i) => <p key={i} className="text-yellow-400 text-xs">⚠ {s}</p>)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input value={assetSearch} onChange={e => setAssetSearch(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
              placeholder="Search assets by name or tag..." />
            <Button className="bg-violet-600 hover:bg-violet-700 text-white text-sm">+ Upload</Button>
          </div>

          {/* Tag groups */}
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.keys(assetGroups).map(tag => (
              <button key={tag} onClick={() => setAssetSearch(tag)}
                className="px-2 py-1 text-xs rounded bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white">
                #{tag} ({assetGroups[tag].length})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAssets.map(asset => (
              <Card key={asset.id} className="bg-white/5 border-white/10">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-violet-600/30 to-indigo-600/30 flex items-center justify-center text-xl flex-shrink-0">
                      {asset.type === 'image' ? '🖼️' : asset.type === 'video' ? '🎬' : asset.type === 'audio' ? '🎵' : asset.type === 'logo' ? '✍️' : asset.type === 'template' ? '📄' : '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{asset.filename}</p>
                      <p className="text-gray-400 text-xs">{asset.sizeMB.toFixed(2)} MB · {asset.usageCount} uses</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map(t => <Badge key={t} className="bg-white/10 text-gray-400 text-xs">#{t}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
