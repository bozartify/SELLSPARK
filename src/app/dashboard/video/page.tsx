'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createVideoJob, tickTranscode, generateThumbnailVariants,
  generateVideoSEO, generateChapters, type VideoJob, type ThumbnailVariant,
} from '@/lib/platform/video-studio';

const DEMO_VIDEOS = [
  { filename: 'how-i-made-10k-in-30-days.mp4', duration: 847, size: 312 },
  { filename: 'fitness-morning-routine.mp4', duration: 1243, size: 521 },
  { filename: 'product-launch-masterclass.mp4', duration: 3612, size: 1420 },
];

export default function VideoStudioPage() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<VideoJob | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailVariant[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'seo'>('upload');

  // Simulate processing
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(j => j.status !== 'complete' && j.status !== 'failed' ? tickTranscode(j) : j));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  function startJob(v: typeof DEMO_VIDEOS[0]) {
    const job = createVideoJob(v.filename, v.duration, v.size);
    setJobs(prev => [job, ...prev]);
    setThumbnails(generateThumbnailVariants(v.filename.replace('.mp4', '').replace(/-/g, ' ')));
  }

  const seo = selectedJob ? generateVideoSEO(selectedJob.filename.replace('.mp4','').replace(/-/g,' '), 'business', generateChapters(selectedJob.durationSeconds)) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Video Studio</h1>
          <p className="text-sm text-gray-400 mt-1">AI transcoding · Auto-chapters · Caption generation · Multi-platform publish</p>
        </div>
        <Badge className="bg-violet-600 text-white">AI-Powered</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(['upload', 'library', 'seo'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'seo' ? 'SEO Tools' : t}
          </button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-violet-500/50 transition-colors cursor-pointer">
            <div className="text-5xl mb-3">🎬</div>
            <p className="text-white font-medium text-lg">Drop video files here or click to upload</p>
            <p className="text-gray-400 text-sm mt-2">MP4, MOV, AVI · Up to 10GB · Auto-transcodes to HLS</p>
            <div className="flex gap-2 justify-center mt-6">
              {DEMO_VIDEOS.map(v => (
                <Button key={v.filename} size="sm" onClick={() => startJob(v)} className="bg-violet-600 hover:bg-violet-700 text-xs">
                  Demo: {v.filename.slice(0, 20)}…
                </Button>
              ))}
            </div>
          </div>

          {/* Active jobs */}
          {jobs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Processing Queue</h2>
              {jobs.map(job => (
                <Card key={job.id} className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/8"
                  onClick={() => { setSelectedJob(job); setActiveTab('library'); }}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-3xl">🎥</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{job.filename}</p>
                      <p className="text-gray-400 text-xs">{Math.floor(job.durationSeconds/60)}m {job.durationSeconds%60}s · {job.sizeMB}MB</p>
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        job.status === 'complete' ? 'bg-green-600 text-white' :
                        job.status === 'failed' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }>{job.status}</Badge>
                      <p className="text-gray-400 text-xs mt-1">{job.progress}%</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'library' && (
        <div className="space-y-4">
          {selectedJob?.status === 'complete' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Outputs */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-white text-sm">Output Formats</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(selectedJob.outputUrls).map(([res, url]) => (
                    <div key={res} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-gray-300 text-sm">{res}</span>
                      <a href={url} className="text-violet-400 text-xs hover:underline">HLS Stream ↗</a>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Chapters */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-white text-sm">AI Chapters ({selectedJob.chapters.length})</CardTitle></CardHeader>
                <CardContent className="space-y-1 max-h-48 overflow-y-auto">
                  {selectedJob.chapters.map((ch, i) => (
                    <div key={i} className="flex gap-3 text-sm p-1">
                      <span className="text-violet-400 tabular-nums w-14">{Math.floor(ch.startSeconds/60)}:{String(ch.startSeconds%60).padStart(2,'0')}</span>
                      <span className="text-gray-300">{ch.title}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Thumbnails */}
              <Card className="bg-white/5 border-white/10 col-span-full">
                <CardHeader><CardTitle className="text-white text-sm">AI Thumbnail Variants (CTR Optimized)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {thumbnails.map(t => (
                      <div key={t.id} className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="bg-gradient-to-br from-violet-600 to-purple-900 h-20 rounded mb-2 flex items-center justify-center text-xs text-white px-2">{t.text_overlay}</div>
                        <Badge className={t.emotion === 'urgency' ? 'bg-red-600 text-white text-xs' : 'bg-violet-600 text-white text-xs'}>{t.emotion}</Badge>
                        <p className="text-green-400 text-xs mt-1">CTR ~{(t.ctr_prediction * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🎬</div>
              <p>Upload and process a video to see library output</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'seo' && seo && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Optimized Title</CardTitle></CardHeader>
            <CardContent>
              <p className="text-violet-300 font-medium">{seo.title}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Tags ({seo.tags.length})</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {seo.tags.map(t => <Badge key={t} className="bg-violet-600/30 text-violet-300 text-xs">{t}</Badge>)}
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">YouTube Chapter Timestamps</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-gray-300 text-xs whitespace-pre-wrap font-mono bg-black/30 p-3 rounded">{seo.timestamps}</pre>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-sm">Platform Hashtag Sets</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(seo.hashtagSets).map(([platform, tags]) => (
                <div key={platform} className="flex gap-2 items-start">
                  <span className="text-gray-400 text-xs w-16 capitalize pt-0.5">{platform}</span>
                  <div className="flex flex-wrap gap-1">{tags.slice(0,5).map(t => <Badge key={t} className="bg-white/10 text-gray-300 text-xs">{t}</Badge>)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
