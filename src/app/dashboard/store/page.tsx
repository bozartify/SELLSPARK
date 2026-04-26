'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';

const STYLES = [
  { id: 'MINIMAL', label: 'Minimal', color: '#000000' },
  { id: 'BOLD', label: 'Bold', color: '#7C3AED' },
  { id: 'ELEGANT', label: 'Elegant', color: '#92704F' },
  { id: 'PLAYFUL', label: 'Playful', color: '#8B5CF6' },
  { id: 'PROFESSIONAL', label: 'Professional', color: '#1E40AF' },
];

export default function StoreSettingsPage() {
  const { user } = useAuthStore();
  const [storeName, setStoreName] = useState(user?.name || 'My Store');
  const [tagline, setTagline] = useState('Your tagline here');
  const [bio, setBio] = useState('Tell your audience about yourself...');
  const [style, setStyle] = useState('MINIMAL');
  const [published, setPublished] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Store</h1>
          <p className="text-sm text-gray-500 mt-1">Customize your storefront</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Preview</Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Store Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Store Name</label>
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tagline</label>
                <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="A short description of what you do" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Bio</label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[100px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Store URL</label>
                <div className="flex items-center gap-0">
                  <span className="h-11 px-4 flex items-center bg-gray-100 dark:bg-gray-800 rounded-l-xl border border-r-0 border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                    sellspark.com/
                  </span>
                  <Input className="rounded-l-none" value={storeName.toLowerCase().replace(/\s+/g, '-')} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Theme & Style</h2></CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      style === s.id
                        ? 'border-violet-500 ring-2 ring-violet-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ background: s.color }} />
                    <div className="text-xs font-medium">{s.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Social Links</h2></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Instagram URL" />
              <Input placeholder="Twitter/X URL" />
              <Input placeholder="YouTube URL" />
              <Input placeholder="TikTok URL" />
              <Input placeholder="Website URL" />
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-sm font-medium mb-3">Live Preview</h3>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-center text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mx-auto mb-3">
                  {storeName[0]?.toUpperCase() || 'S'}
                </div>
                <h3 className="font-bold">{storeName}</h3>
                <p className="text-sm opacity-80 mt-1">{tagline}</p>
              </div>
              <CardContent className="p-4 space-y-2">
                {['Product 1', 'Product 2', 'Product 3'].map((p) => (
                  <div key={p} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center px-3 text-sm text-gray-500">
                    {p}
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Published</span>
              <button
                onClick={() => setPublished(!published)}
                className={`w-11 h-6 rounded-full transition-colors ${published ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {published && (
              <Badge variant="success" className="mt-2 w-full justify-center">Store is live</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
