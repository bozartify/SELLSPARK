'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createSwarm, createPipeline, swarmAnalytics,
  PIPELINE_TEMPLATES, type AgentSwarm, type Agent, type Pipeline,
} from '@/lib/platform/agent-framework';

const MODEL_COLORS: Record<string, string> = {
  'claude-3-5-sonnet': 'bg-orange-500/20 text-orange-300',
  'gpt-4o': 'bg-green-500/20 text-green-300',
  'gemini-2.0-flash': 'bg-blue-500/20 text-blue-300',
  'llama-3.3-70b': 'bg-purple-500/20 text-purple-300',
};

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-500/20 text-gray-400',
  running: 'bg-green-500/20 text-green-300',
  waiting: 'bg-yellow-500/20 text-yellow-300',
  error: 'bg-red-500/20 text-red-300',
  completed: 'bg-violet-500/20 text-violet-300',
  paused: 'bg-orange-500/20 text-orange-300',
};

const TASK_STATUS_COLORS: Record<string, string> = {
  queued: 'bg-gray-500/20 text-gray-400',
  running: 'bg-green-500/20 text-green-300',
  blocked: 'bg-orange-500/20 text-orange-300',
  completed: 'bg-violet-500/20 text-violet-300',
  failed: 'bg-red-500/20 text-red-300',
  cancelled: 'bg-gray-600/20 text-gray-500',
};

export default function AgentsPage() {
  const [swarm, setSwarm] = useState<AgentSwarm>(() => createSwarm());
  const [activeTab, setActiveTab] = useState<'swarm' | 'pipelines' | 'guardrails' | 'analytics'>('swarm');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSwarm(prev => ({
        ...prev,
        agents: prev.agents.map(a => ({
          ...a,
          status: Math.random() < 0.15 ? 'running' : Math.random() < 0.05 ? 'waiting' : 'idle',
          costUsedToday: Math.min(a.dailyCostLimit, a.costUsedToday + Math.random() * 0.01),
        })),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const analytics = swarmAnalytics(swarm);

  const handleLaunchPipeline = (templateIdx: number) => {
    const pipeline = createPipeline(PIPELINE_TEMPLATES[templateIdx]);
    const running: Pipeline = {
      ...pipeline,
      status: 'running',
      startedAt: Date.now(),
      tasks: pipeline.tasks.map((t, i) => ({ ...t, status: i === 0 ? 'running' : 'queued', startedAt: i === 0 ? Date.now() : undefined })),
    };
    setSwarm(prev => ({ ...prev, activePipelines: [...prev.activePipelines, running] }));
    setActiveTab('pipelines');
  };

  const priorityColor = (p: string) =>
    p === 'critical' ? 'bg-red-500/20 text-red-300' :
    p === 'high' ? 'bg-orange-500/20 text-orange-300' :
    p === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
    'bg-gray-500/20 text-gray-400';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agent Swarm</h1>
          <p className="text-sm text-gray-400 mt-1">{swarm.agents.length} specialist agents · DAG pipelines · Guardrails · Episodic memory</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-500/20 text-green-300">
            {swarm.agents.filter(a => a.status === 'running').length} Running
          </Badge>
          <Badge className="bg-violet-600 text-white">
            ${swarm.globalCostToday.toFixed(2)} / ${swarm.globalCostLimit} today
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks Completed', value: analytics.totalTasksCompleted.toLocaleString(), sub: 'all time' },
          { label: 'Avg Success Rate', value: (analytics.avgSuccessRate * 100).toFixed(1) + '%', sub: 'across swarm' },
          { label: 'Cost Efficiency', value: analytics.costEfficiency.toFixed(0) + ' tasks/$', sub: 'today' },
          { label: 'Active Pipelines', value: swarm.activePipelines.length.toString(), sub: 'running now' },
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

      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['swarm', 'pipelines', 'guardrails', 'analytics'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab === t ? 'text-violet-400 border-b-2 border-violet-400' : 'text-gray-400 hover:text-white'}`}>
            {t === 'swarm' ? '🦾 Agent Swarm' : t === 'pipelines' ? '⚙️ Pipelines' : t === 'guardrails' ? '🛡️ Guardrails' : '📊 Analytics'}
          </button>
        ))}
      </div>

      {activeTab === 'swarm' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {swarm.agents.map(agent => (
              <Card key={agent.id}
                className={`bg-white/5 border-white/10 cursor-pointer transition-all ${selectedAgent?.id === agent.id ? 'border-violet-500/60' : ''}`}
                onClick={() => setSelectedAgent(agent)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {agent.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{agent.name}</p>
                        <Badge className={STATUS_COLORS[agent.status] || STATUS_COLORS.idle}>{agent.status}</Badge>
                      </div>
                      <p className="text-gray-400 text-xs capitalize">{agent.role.replace(/-/g,' ')}</p>
                    </div>
                    <div className="text-right text-xs flex-shrink-0">
                      <p className="text-white">{(agent.successRate * 100).toFixed(0)}%</p>
                      <p className="text-gray-500">{agent.tasksCompleted} done</p>
                    </div>
                  </div>
                  {agent.status === 'running' && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedAgent ? (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {selectedAgent.name[0]}
                  </div>
                  <div>
                    <CardTitle className="text-white">{selectedAgent.name}</CardTitle>
                    <p className="text-gray-400 text-xs capitalize">{selectedAgent.role.replace(/-/g,' ')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{selectedAgent.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white/5 rounded">
                    <p className="text-gray-500 mb-1">Model</p>
                    <Badge className={MODEL_COLORS[selectedAgent.config.model] || 'bg-gray-500/20 text-gray-300'}>
                      {selectedAgent.config.model}
                    </Badge>
                  </div>
                  <div className="p-2 bg-white/5 rounded"><p className="text-gray-500">Latency</p><p className="text-white">{selectedAgent.avgLatencyMs.toFixed(0)}ms</p></div>
                  <div className="p-2 bg-white/5 rounded"><p className="text-gray-500">Cost today</p><p className="text-white">${selectedAgent.costUsedToday.toFixed(3)}</p></div>
                  <div className="p-2 bg-white/5 rounded"><p className="text-gray-500">Daily limit</p><p className="text-white">${selectedAgent.dailyCostLimit}</p></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Daily budget</span>
                    <span>{((selectedAgent.costUsedToday / selectedAgent.dailyCostLimit) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all" style={{ width: `${(selectedAgent.costUsedToday / selectedAgent.dailyCostLimit) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tools</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {selectedAgent.tools.map(tool => (
                      <div key={tool.name} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-white truncate">{tool.name}</p>
                          <p className="text-gray-500 truncate">{tool.description}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {tool.requiresHumanApproval && <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">Human</Badge>}
                          <span className="text-gray-500">${tool.costEstimate.toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Memory</p>
                  <p className="text-gray-300 text-xs italic">{selectedAgent.memory.longTermSummary}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm border border-white/10 rounded-xl">
              Click an agent to inspect
            </div>
          )}
        </div>
      )}

      {activeTab === 'pipelines' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {PIPELINE_TEMPLATES.map((template, i) => (
              <Card key={template.name} className="bg-white/5 border-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl flex-shrink-0">{template.icon}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{template.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>⏱ ~{template.estimatedMinutes}m</span>
                    <span>💰 ~${template.estimatedCost.toFixed(2)}</span>
                    <span>📋 {template.tasks.length} tasks</span>
                  </div>
                  <div className="space-y-1">
                    {template.tasks.map(t => (
                      <div key={t.title} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-300 flex-1 truncate">{t.title}</span>
                        <Badge className={priorityColor(t.priority)}>{t.priority}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => handleLaunchPipeline(i)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm">
                    ▶ Launch
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {swarm.activePipelines.length > 0 && (
            <div className="space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Active Pipelines</p>
              {swarm.activePipelines.map(pipeline => (
                <Card key={pipeline.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm">{pipeline.name}</CardTitle>
                      <Badge className="bg-green-500/20 text-green-300">Running</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pipeline.tasks.map((task, i) => (
                        <div key={task.id} className="flex items-center gap-3 text-xs">
                          <span className="text-gray-600 w-4">{i+1}.</span>
                          <div className="flex-1">
                            <p className="text-gray-300">{task.title}</p>
                            <p className="text-gray-500 capitalize">{task.assignedTo.replace(/-/g,' ')}</p>
                          </div>
                          <Badge className={TASK_STATUS_COLORS[task.status] || 'bg-gray-500/20 text-gray-400'}>{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'guardrails' && (
        <div className="grid md:grid-cols-2 gap-4">
          {swarm.guardRails.map(gr => (
            <Card key={gr.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">{gr.name}</p>
                  <div className="flex gap-2">
                    <Badge className={gr.type === 'cost' ? 'bg-yellow-500/20 text-yellow-300' : gr.type === 'safety' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}>
                      {gr.type}
                    </Badge>
                    <Badge className={gr.enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}>
                      {gr.enabled ? 'Active' : 'Off'}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{gr.description}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-400">Threshold: <span className="text-white">{gr.threshold}</span></span>
                  <span className="text-gray-400">Action: <span className="text-orange-300 capitalize">{gr.action}</span></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">Agent Success Rates</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {swarm.agents.map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-xs">
                    <span className="text-gray-300 w-14 flex-shrink-0">{a.name}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${a.successRate * 100}%` }} />
                    </div>
                    <span className="text-white w-8 text-right">{(a.successRate * 100).toFixed(0)}%</span>
                    <span className="text-gray-500 w-16 text-right">{a.avgLatencyMs.toFixed(0)}ms</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-sm">System Health</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analytics.topRisks.length === 0 ? (
                  <p className="text-green-400 text-sm">✅ All systems nominal</p>
                ) : analytics.topRisks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-400">⚠</span>
                    <p className="text-gray-300">{risk}</p>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                  <p className="text-gray-400">Busiest: <span className="text-white capitalize">{analytics.busiest.replace(/-/g,' ')}</span></p>
                  <p className="text-gray-400">Most reliable: <span className="text-violet-300 capitalize">{analytics.mostReliable.replace(/-/g,' ')}</span></p>
                  <p className="text-gray-400">Total cost today: <span className="text-white">${swarm.globalCostToday.toFixed(2)}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
