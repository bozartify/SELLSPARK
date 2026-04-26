'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  generateMockAudienceGraph, getInfluenceNodes, computeInterestHeatmap,
  applyKAnonymity, type AudienceGraph, type ClusterInfo,
} from '@/lib/platform/audience-graph';

export default function AudiencePage() {
  const [graph] = useState<AudienceGraph>(() => generateMockAudienceGraph());
  const [activeTab, setActiveTab] = useState<'graph' | 'clusters' | 'influence' | 'heatmap'>('clusters');
  const [kParam, setKParam] = useState(3);
  const [selectedCluster, setSelectedCluster] = useState<ClusterInfo | null>(null);

  const influenceNodes = useMemo(() => getInfluenceNodes(graph, 8), [graph]);
  const heatmap = useMemo(() => computeInterestHeatmap(graph), [graph]);
  const anonymisedGraph = useMemo(() => applyKAnonymity(graph, kParam), [graph, kParam]);

  const subscriberCount = graph.nodes.filter(n => n.type === 'subscriber').length;
  const contentCount    = graph.nodes.filter(n => n.type === 'content').length;
  const suppressedCount = subscriberCount - anonymisedGraph.nodes.filter(n => n.type === 'subscriber').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audience Graph</h1>
          <p className="text-sm text-gray-400 mt-1">Privacy-first behaviour graph · k-anonymity · PageRank influence · Interest clusters</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500/20 text-green-300">{anonymisedGraph.privacyLevel}</Badge>
          <Badge className="bg-violet-600 text-white">{graph.nodes.length} nodes · {graph.edges.length} edges</Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Subscribers', value: subscriberCount.toString(), sub: `${suppressedCount} suppressed (k=${kParam})` },
          { label: 'Content Nodes', value: contentCount.toString(), sub: 'tracked pieces' },
          { label: 'Communities', value: graph.clusters.length.toString(), sub: 'detected clusters' },
          { label: 'k-Anonymity', value: `k=${kParam}`, sub: 'privacy guarantee' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{kpi.label}</p>
              <p className="text-white text-2xl font-bold mt-1">{kpi.value}</p>
              <p className="text-gray-500 text-xs">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Privacy control */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-gray-400 text-xs mb-1">k-Anonymity Parameter</p>
            <div className="flex items-center gap-3">
              <input type="range" min={2} max={10} value={kParam} onChange={e => setKParam(+e.target.value)} className="w-32 accent-violet-500" />
              <span className="text-white font-bold">k = {kParam}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 flex-1">
            <p>Suppressing <span className="text-white">{suppressedCount}</span> subscribers with fewer than {kParam} interactions.</p>
            <p className="mt-0.5">Each remaining subscriber is indistinguishable from at least <span className="text-violet-300">{kParam-1}</span> others.</p>
          </div>
          <Badge className={suppressedCount === 0 ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}>
            {suppressedCount === 0 ? 'All included' : `${suppressedCount} suppressed for privacy`}
          </Badge>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['clusters','influence','heatmap','graph'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab===t?'text-violet-400 border-b-2 border-violet-400':'text-gray-400 hover:text-white'}`}>
            {t==='clusters'?'🫧 Communities':t==='influence'?'⭐ Influence':t==='heatmap'?'🔥 Interest Heatmap':'🕸️ Graph'}
          </button>
        ))}
      </div>

      {/* ─── CLUSTERS ─── */}
      {activeTab === 'clusters' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {graph.clusters.map(cluster => (
            <Card key={cluster.id}
              className={`bg-white/5 border-white/10 cursor-pointer transition-all ${selectedCluster?.id===cluster.id?'border-violet-500/60':''}`}
              onClick={() => setSelectedCluster(selectedCluster?.id===cluster.id?null:cluster)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cluster.color }} />
                  <p className="text-white font-medium">{cluster.label}</p>
                  <Badge className="bg-white/10 text-gray-300 ml-auto">{cluster.size}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-gray-500">Avg LTV</p><p className="text-white">${cluster.ltv}</p></div>
                  <div><p className="text-gray-500">Engagement</p><p className="text-white">{(cluster.avgEngagementRate*100).toFixed(1)}%</p></div>
                  <div><p className="text-gray-500">Purchase Rate</p><p className="text-violet-300">{(cluster.avgPurchaseRate*100).toFixed(1)}%</p></div>
                  <div><p className="text-gray-500">Top Topics</p><p className="text-gray-300 truncate">{cluster.topTopics.join(', ')}</p></div>
                </div>
                {/* Engagement bar */}
                <div className="h-1.5 bg-white/10 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${cluster.avgEngagementRate*500}%`, backgroundColor: cluster.color }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── INFLUENCE ─── */}
      {activeTab === 'influence' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Top Influence Nodes by PageRank</p>
          {influenceNodes.map((node, i) => (
            <Card key={node.nodeId} className="bg-white/5 border-white/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    <span className="text-gray-500 text-sm">#{i+1}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {node.type === 'content' ? '📄' : node.type === 'topic' ? '#' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{node.label}</p>
                    <p className="text-gray-500 text-xs capitalize">{node.type} · Reach ~{node.reachEstimate.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${node.pageRankScore * 10000}%` }} />
                  </div>
                  <div className="text-right text-xs flex-shrink-0">
                    <p className="text-white">PR: {(node.pageRankScore*1000).toFixed(1)}</p>
                    <p className="text-gray-500">Bridge: {(node.bridgingScore*100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── HEATMAP ─── */}
      {activeTab === 'heatmap' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Interest Intensity by Topic</p>
          {heatmap.slice(0, 12).map(topic => (
            <div key={topic.topic} className="flex items-center gap-4">
              <div className="w-36 flex-shrink-0 flex items-center gap-2">
                <span className="text-white text-sm capitalize">{topic.topic.replace(/-/g,' ')}</span>
                {topic.trending && <Badge className="bg-orange-500/20 text-orange-300 text-xs">Trending</Badge>}
              </div>
              <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${topic.intensity * 100}%`,
                  background: `linear-gradient(to right, #7c3aed, ${topic.trending ? '#f59e0b' : '#6366f1'})`,
                }} />
              </div>
              <div className="w-20 text-right text-xs flex-shrink-0">
                <span className={topic.weekOverWeekDelta >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {topic.weekOverWeekDelta >= 0 ? '+' : ''}{(topic.weekOverWeekDelta*100).toFixed(0)}% WoW
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── GRAPH ─── */}
      {activeTab === 'graph' && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-white text-sm">Force-Directed Graph (SVG)</CardTitle></CardHeader>
          <CardContent>
            <svg width="100%" viewBox="-300 -300 600 600" className="max-h-96">
              {/* Edges */}
              {anonymisedGraph.edges.slice(0, 80).map((edge, i) => {
                const src = anonymisedGraph.nodes.find(n => n.id === edge.source);
                const tgt = anonymisedGraph.nodes.find(n => n.id === edge.target);
                if (!src?.x || !tgt?.x) return null;
                return (
                  <line key={i} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke="rgba(124,58,237,0.2)" strokeWidth={edge.weight * 1.5} />
                );
              })}
              {/* Nodes */}
              {anonymisedGraph.nodes.map(node => {
                const cluster = graph.clusters[node.cluster];
                const r = node.type === 'content' ? 6 : node.type === 'topic' ? 8 : 4;
                return (
                  <circle key={node.id}
                    cx={node.x ?? 0} cy={node.y ?? 0} r={r}
                    fill={cluster?.color ?? '#6b7280'}
                    fillOpacity={0.8}
                    stroke={cluster?.color ?? '#6b7280'}
                    strokeWidth={1}
                  />
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-3 mt-3">
              {graph.clusters.map(c => (
                <div key={c.id} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-gray-400">{c.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
