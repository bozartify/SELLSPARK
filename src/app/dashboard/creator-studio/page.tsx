'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generateContentOutline,
  generateContentCalendar,
  analyzeSEOExtended,
  generateMetaTags,
  generateHooks,
  type ContentBriefSpec,
  type ContentOutline,
  type ContentSlot,
  type SEOAnalysisExtended,
} from '@/lib/platform/creator-tools';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'brief' | 'calendar' | 'seo' | 'hooks';
type AudienceOption = 'Beginners' | 'Professionals' | 'Entrepreneurs' | 'Students';
type ToneOption = 'Educational' | 'Entertaining' | 'Inspirational' | 'Controversial';
type HookPlatform = 'TikTok' | 'YouTube' | 'Twitter' | 'LinkedIn' | 'Instagram';

const TONE_MAP: Record<ToneOption, ContentBriefSpec['tone']> = {
  Educational: 'educational',
  Entertaining: 'casual',
  Inspirational: 'inspirational',
  Controversial: 'authoritative',
};

const PLATFORM_ICONS: Record<string, string> = {
  YouTube: '🎬',
  TikTok: '🎵',
  Instagram: '📸',
  Twitter: '🐦',
  LinkedIn: '💼',
  Email: '📧',
  Blog: '📝',
  blog: '📝',
  video: '🎬',
  reel: '🎵',
  email: '📧',
  thread: '🧵',
  podcast: '🎙️',
  webinar: '🖥️',
};

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'brief', label: 'Content Brief' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'seo', label: 'SEO Analyzer' },
    { id: 'hooks', label: 'Hook Generator' },
  ];
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            active === t.id
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Brief Tab ───────────────────────────────────────────────────────────────

function BriefTab() {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState<AudienceOption>('Beginners');
  const [tone, setTone] = useState<ToneOption>('Educational');
  const [wordCount, setWordCount] = useState(1200);
  const [outline, setOutline] = useState<ContentOutline | null>(null);
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    if (!title.trim()) return;
    setLoading(true);
    const brief: ContentBriefSpec = {
      title,
      audience,
      tone: TONE_MAP[tone],
      keywords: [title.toLowerCase(), audience.toLowerCase()],
      wordCount,
      format: 'blog',
    };
    const result = generateContentOutline(brief);
    setOutline(result);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Content Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Content Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. How to Build a 6-Figure Creator Business"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Audience */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Target Audience</label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value as AudienceOption)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              >
                {(['Beginners', 'Professionals', 'Entrepreneurs', 'Students'] as AudienceOption[]).map(o => (
                  <option key={o} value={o} className="bg-gray-900">{o}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Tone</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value as ToneOption)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              >
                {(['Educational', 'Entertaining', 'Inspirational', 'Controversial'] as ToneOption[]).map(o => (
                  <option key={o} value={o} className="bg-gray-900">{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Word Count Slider */}
          <div>
            <label className="flex justify-between text-sm text-white/60 mb-1.5">
              <span>Word Count</span>
              <span className="text-violet-400 font-semibold">{wordCount.toLocaleString()} words</span>
            </label>
            <input
              type="range"
              min={300}
              max={3000}
              step={100}
              value={wordCount}
              onChange={e => setWordCount(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>300</span><span>3,000</span>
            </div>
          </div>

          <Button onClick={handleGenerate} loading={loading} disabled={!title.trim()}>
            Generate Outline
          </Button>
        </CardContent>
      </Card>

      {outline && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold text-lg">Content Outline</h3>
            <Badge variant="default">{outline.estimatedReadTime} min read</Badge>
            <Badge variant="success">SEO {outline.seoScore}/100</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outline.sections.map((section, i) => (
              <Card key={i} className="bg-white/5 border-white/10 hover:border-violet-500/40 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white font-medium text-sm leading-snug">{section.heading}</h4>
                    <span className="text-white/30 text-xs shrink-0">~{section.estimatedWords}w</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{section.summary}</p>
                  <div className="flex gap-2 pt-1">
                    <Badge variant="secondary" className="text-xs">{Math.ceil(section.estimatedWords / 200)} min</Badge>
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

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  planned: 'bg-gray-400',
  'in-progress': 'bg-blue-400',
  review: 'bg-amber-400',
  published: 'bg-emerald-400',
};

function CalendarTab() {
  const [slots, setSlots] = useState<ContentSlot[]>([]);
  const [selected, setSelected] = useState<ContentSlot | null>(null);
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    setLoading(true);
    const result = generateContentCalendar(4, 5, ['blog', 'video', 'reel', 'email', 'thread']);
    setSlots(result);
    setLoading(false);
  }

  // Build 4×7 grid: find start date (week-aligned Monday from first slot)
  const grid = useMemo<(ContentSlot | null)[][]>(() => {
    if (slots.length === 0) return [];
    const startDate = new Date(slots[0].date);
    const rows: (ContentSlot | null)[][] = [];
    for (let w = 0; w < 4; w++) {
      const row: (ContentSlot | null)[] = [];
      for (let d = 0; d < 7; d++) {
        const target = new Date(startDate);
        target.setDate(startDate.getDate() + w * 7 + d);
        const iso = target.toISOString().slice(0, 10);
        const slot = slots.find(s => s.date === iso) ?? null;
        row.push(slot);
      }
      rows.push(row);
    }
    return rows;
  }, [slots]);

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={handleGenerate} loading={loading}>Generate Calendar</Button>
        {slots.length > 0 && (
          <div className="flex gap-3 text-xs text-white/50">
            {Object.entries({ planned: 'Planned', 'in-progress': 'Draft', review: 'Review', published: 'Published' }).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full inline-block ${STATUS_DOT[k]}`} />
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {grid.length > 0 && (
        <div className="flex gap-6">
          <div className="flex-1 overflow-x-auto">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-xs text-white/30 font-medium py-1">{d}</div>
              ))}
            </div>
            {/* Weeks */}
            {grid.map((row, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {row.map((slot, di) => (
                  <div
                    key={di}
                    onClick={() => slot && setSelected(slot)}
                    className={`h-16 rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-1 text-xs
                      ${slot
                        ? 'bg-white/5 border-white/10 cursor-pointer hover:border-violet-500/60 hover:bg-violet-500/10'
                        : 'bg-white/[0.02] border-white/5'
                      }
                      ${selected === slot && slot ? 'border-violet-500 bg-violet-500/20' : ''}
                    `}
                  >
                    {slot && (
                      <>
                        <span className="text-base leading-none">{PLATFORM_ICONS[slot.contentType] ?? '📄'}</span>
                        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[slot.status]}`} />
                        <span className="text-white/40 text-[10px]">{slot.date.slice(5)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Side panel */}
          {selected && (
            <div className="w-64 shrink-0">
              <Card className="bg-white/5 border-white/10 sticky top-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">Slot Details</CardTitle>
                    <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-lg leading-none">×</button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2 items-center">
                    <span className="text-xl">{PLATFORM_ICONS[selected.contentType] ?? '📄'}</span>
                    <div>
                      <p className="text-white font-medium capitalize">{selected.contentType}</p>
                      <p className="text-white/40 text-xs">{selected.platform}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs">{selected.date}</p>
                  <Badge
                    variant={
                      selected.status === 'published' ? 'success'
                      : selected.status === 'in-progress' ? 'default'
                      : selected.status === 'review' ? 'warning'
                      : 'secondary'
                    }
                    className="capitalize"
                  >
                    {selected.status}
                  </Badge>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Brief</p>
                    <p className="text-white/80 text-xs leading-relaxed">{selected.brief}</p>
                  </div>
                  <p className="text-white/40 text-xs">Assignee: {selected.assignee}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SEO Tab ─────────────────────────────────────────────────────────────────

function SEOArcGauge({ score }: { score: number }) {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const startAngle = -210;
  const sweepAngle = 240;
  const pct = score / 100;

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(start: number, end: number, radius: number) {
    const s = polarToXY(start, radius);
    const e = polarToXY(end, radius);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const endAngle = startAngle + sweepAngle * pct;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="140" height="110" viewBox="0 0 140 110">
      <path d={arcPath(startAngle, startAngle + sweepAngle, r)} fill="none" stroke="#ffffff10" strokeWidth="10" strokeLinecap="round" />
      <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{score}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#ffffff60" fontSize="10">/ 100</text>
    </svg>
  );
}

function SEOTab() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<SEOAnalysisExtended | null>(null);
  const [metaTags, setMetaTags] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    const mockContent = `# ${url.replace(/https?:\/\//, '').replace(/\//g, ' ')}\n\nThis is a sample page content for SEO analysis. The page covers topics related to creator economy and content monetization strategies. Building a sustainable creator business requires understanding your audience, creating consistent content, and diversifying revenue streams. Many creators struggle with finding the right balance between quality and quantity.\n\n## Key Strategies\n\nFocus on long-form content that provides real value. Short-form content drives discovery but long-form builds authority. Use keyword research tools to find topics with high search volume and low competition.\n\n## Monetization\n\nDiversify income through courses, memberships, sponsorships, and affiliate marketing. Do not rely on a single revenue source.`;
    const result = analyzeSEOExtended(url, mockContent);
    const tags = generateMetaTags(result.title || url, result.metaDesc, result.keywords);
    setAnalysis(result);
    setMetaTags(tags);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-5 flex gap-3">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://yoursite.com/page-to-analyze"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
          />
          <Button onClick={handleAnalyze} loading={loading} disabled={!url.trim()}>
            Analyze
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score gauge */}
          <Card className="bg-white/5 border-white/10 flex flex-col items-center justify-center py-6">
            <SEOArcGauge score={analysis.score} />
            <p className="text-white/60 text-sm mt-2">SEO Score</p>
            <Badge
              variant={analysis.score >= 75 ? 'success' : analysis.score >= 50 ? 'warning' : 'destructive'}
              className="mt-2"
            >
              {analysis.score >= 75 ? 'Strong' : analysis.score >= 50 ? 'Moderate' : 'Needs Work'}
            </Badge>
          </Card>

          {/* Issues & Recommendations */}
          <Card className="bg-white/5 border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white text-sm">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.issues.length > 0 && (
                <div>
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2">Issues</p>
                  <ul className="space-y-1.5">
                    {analysis.issues.map((issue, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/70">
                        <span>❌</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.recommendations.length > 0 && (
                <div>
                  <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">Recommendations</p>
                  <ul className="space-y-1.5">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/70">
                        <span>✅</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meta tags */}
          {metaTags && (
            <Card className="bg-white/5 border-white/10 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-white text-sm">Generated Meta Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="font-mono text-xs text-emerald-300/80 bg-black/30 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-white/5">
                  {metaTags}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Hooks Tab ────────────────────────────────────────────────────────────────

function HooksTab() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<HookPlatform>('TikTok');
  const [hooks, setHooks] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    const result = generateHooks(topic, platform, 5);
    setHooks(result);
    setLoading(false);
  }

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  const PLATFORMS: HookPlatform[] = ['TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Instagram'];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-5 space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Topic</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. content monetization, growing on TikTok..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    platform === p
                      ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
                  }`}
                >
                  {PLATFORM_ICONS[p] ?? ''} {p}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} loading={loading} disabled={!topic.trim()}>
            Generate Hooks
          </Button>
        </CardContent>
      </Card>

      {hooks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold">
            {platform} Hooks
            <Badge variant="secondary" className="ml-3">{hooks.length} hooks</Badge>
          </h3>
          {hooks.map((hook, i) => (
            <Card key={i} className="bg-white/5 border-white/10 hover:border-violet-500/30 transition-colors">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <span className="text-violet-400 font-bold text-sm shrink-0 mt-0.5">#{i + 1}</span>
                  <p className="text-white/80 text-sm leading-relaxed">{hook}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(hook, i)}
                  className="shrink-0"
                >
                  {copied === i ? 'Copied!' : 'Copy'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatorStudioPage() {
  const [tab, setTab] = useState<Tab>('brief');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950/20 to-gray-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Creator Studio</h1>
          <p className="text-white/50 mt-1 text-sm">AI-powered tools to create, plan, and optimize your content.</p>
        </div>

        {/* Tabs */}
        <TabBar active={tab} onChange={setTab} />

        {/* Content */}
        {tab === 'brief' && <BriefTab />}
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'seo' && <SEOTab />}
        {tab === 'hooks' && <HooksTab />}
      </div>
    </div>
  );
}
