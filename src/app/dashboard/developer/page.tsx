'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { generateAPIKey, API_ENDPOINTS, SDK_EXAMPLES, generateWidgetEmbed } from '@/lib/developer/api';

const DEMO_KEYS = [
  { id: '1', name: 'Production App', key: 'sk_live_4f8a2b...c9d1', permissions: ['Full Access'], lastUsed: '2h ago', active: true },
  { id: '2', name: 'Analytics Dashboard', key: 'sk_live_7e3f1a...b2c4', permissions: ['Analytics Only'], lastUsed: '1d ago', active: true },
  { id: '3', name: 'Test Environment', key: 'sk_test_9c2d4e...a1b3', permissions: ['Full Access'], lastUsed: '5d ago', active: false },
];

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'api' | 'widgets' | 'sdk'>('keys');
  const [selectedLang, setSelectedLang] = useState<'javascript' | 'python' | 'curl'>('javascript');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Developer Portal</h1>
          <p className="text-sm text-gray-500 mt-1">API keys, documentation, widgets & SDK</p>
        </div>
        <Badge>API v1</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['keys', 'api', 'widgets', 'sdk'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab === 'keys' ? 'API Keys' : tab === 'api' ? 'API Docs' : tab === 'widgets' ? 'Widgets' : 'SDK'}
          </button>
        ))}
      </div>

      {/* API Keys */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">API Keys</h2>
                <Button>+ Create Key</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_KEYS.map(key => (
                <div key={key.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{key.name}</span>
                      <Badge variant={key.active ? 'success' : 'secondary'} className="text-[10px]">
                        {key.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <code className="text-xs text-gray-500 font-mono">{key.key}</code>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {key.permissions.join(', ')} &middot; Last used {key.lastUsed}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Reveal</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="p-5 bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-sm">Quantum-Safe API Authentication</h3>
                <p className="text-xs text-gray-500">All API requests are authenticated with HMAC-SHA256 signatures and protected with quantum-resistant session keys.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* API Docs */}
      {activeTab === 'api' && (
        <Card>
          <CardHeader><h2 className="font-semibold">REST API Endpoints</h2></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(API_ENDPOINTS).map(([endpoint, info]) => {
              const [method, path] = endpoint.split(' ');
              return (
                <div key={endpoint} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <Badge variant={method === 'GET' ? 'success' : method === 'POST' ? 'default' : method === 'PATCH' ? 'warning' : 'destructive'} className="text-[10px] font-mono w-16 justify-center">
                    {method}
                  </Badge>
                  <code className="text-sm font-mono flex-1">{path}</code>
                  <span className="text-xs text-gray-500">{info.description}</span>
                  <Badge variant="secondary" className="text-[10px]">{info.permission}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Widgets */}
      {activeTab === 'widgets' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><h2 className="font-semibold">Embeddable Widgets</h2></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">Embed SellSpark components on any website with a single code snippet.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {['Product Card', 'Buy Button', 'Checkout', 'Storefront', 'AI Tool'].map(widget => (
                  <Card key={widget} hover className="p-4 cursor-pointer">
                    <h3 className="font-semibold text-sm">{widget}</h3>
                    <p className="text-xs text-gray-500 mt-1">Embed a {widget.toLowerCase()} on your website</p>
                    <Button variant="outline" size="sm" className="mt-3">Get Code</Button>
                  </Card>
                ))}
              </div>
              <div>
                <h3 className="font-medium text-sm mb-2">Embed Code</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto">
                  {generateWidgetEmbed({ type: 'product-card', storeSlug: 'my-store', theme: 'auto', primaryColor: '#7C3AED', borderRadius: 12, showBranding: true })}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SDK */}
      {activeTab === 'sdk' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">SDK & Code Examples</h2>
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                  {(['javascript', 'python', 'curl'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition capitalize ${
                        selectedLang === lang ? 'bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap">
                {SDK_EXAMPLES[selectedLang]}
              </pre>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-2">npm / yarn</h3>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg block">npm install @sellspark/sdk</code>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-2">pip</h3>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg block">pip install sellspark</code>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
