'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_INTEGRATIONS, type IntegrationCategory } from '@/lib/integrations/hub';

const CATEGORIES: { id: IntegrationCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🔌' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'sms', label: 'SMS', icon: '💬' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'automation', label: 'Automation', icon: '⚡' },
  { id: 'crm', label: 'CRM', icon: '🧲' },
  { id: 'communication', label: 'Chat', icon: '💬' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'storage', label: 'Storage', icon: '☁️' },
];

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const filtered = AVAILABLE_INTEGRATIONS.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleConnect = (id: string) => {
    setConnectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-gray-500 mt-1">Connect SellSpark to your favorite tools ({connectedIds.size} active)</p>
        </div>
        <Button variant="outline">Manage Webhooks</Button>
      </div>

      {/* Search + Categories */}
      <div className="space-y-4">
        <Input placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<span>🔍</span>} />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Connected */}
      {connectedIds.size > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">CONNECTED ({connectedIds.size})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_INTEGRATIONS.filter(i => connectedIds.has(i.id)).map(integration => (
              <Card key={integration.id} className="p-4 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{integration.name}</h3>
                      <Badge variant="success" className="text-[10px]">Connected</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{integration.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleConnect(integration.id)} className="text-xs shrink-0">
                    Settings
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">AVAILABLE ({filtered.length})</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.filter(i => !connectedIds.has(i.id)).map(integration => (
            <Card key={integration.id} hover className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{integration.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{integration.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {integration.capabilities.slice(0, 3).map(cap => (
                      <Badge key={cap} variant="secondary" className="text-[10px]">{cap}</Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={() => toggleConnect(integration.id)} className="shrink-0">
                  Connect
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
