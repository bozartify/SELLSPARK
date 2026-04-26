'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MY_AI_TOOLS = [
  {
    id: '1',
    name: 'AI Meal Plan Generator',
    description: 'Generates personalized meal plans based on user goals and dietary preferences',
    category: 'Health & Fitness',
    usageCount: 1247,
    revenue: 3612,
    rating: 4.8,
    published: true,
  },
  {
    id: '2',
    name: 'Workout Routine Builder',
    description: 'Creates custom workout routines with video demonstrations',
    category: 'Health & Fitness',
    usageCount: 892,
    revenue: 2140,
    rating: 4.6,
    published: true,
  },
  {
    id: '3',
    name: 'Progress Photo Analyzer',
    description: 'AI-powered body composition analysis from progress photos',
    category: 'Analytics',
    usageCount: 0,
    revenue: 0,
    rating: 0,
    published: false,
  },
];

export default function AIToolsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Tools</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage AI-powered tools for your store</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/marketplace'}>Browse Marketplace</Button>
          <Button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ Create AI Tool'}
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card className="border-violet-200 dark:border-violet-800 animate-slide-up">
          <CardHeader><h3 className="font-semibold">Create New AI Tool</h3></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tool Name</label>
                <Input placeholder="e.g., AI Meal Plan Generator" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm">
                  <option>Content Writing</option>
                  <option>Image Generation</option>
                  <option>Social Media</option>
                  <option>Email Marketing</option>
                  <option>SEO</option>
                  <option>Analytics</option>
                  <option>Education</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Input placeholder="What does this AI tool do?" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">AI Prompt (System Instructions)</label>
              <textarea
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[120px]"
                placeholder="You are a helpful AI that generates personalized meal plans..."
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Price (USD)</label>
                <Input type="number" placeholder="0 = Free" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">AI Model</label>
                <select className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm">
                  <option>Claude Sonnet 4.6</option>
                  <option>Claude Haiku 4.5</option>
                  <option>Claude Opus 4.6</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max Tokens</label>
                <Input type="number" placeholder="2048" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button>Create Tool</Button>
              <Button variant="outline">Test with AI</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Tools */}
      <div className="space-y-3">
        {MY_AI_TOOLS.map((tool) => (
          <Card key={tool.id} hover className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <Badge variant={tool.published ? 'success' : 'secondary'} className="text-xs">
                    {tool.published ? 'Live' : 'Draft'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">{tool.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {tool.usageCount > 0 && (
                    <>
                      <span>{tool.usageCount.toLocaleString()} uses</span>
                      <span>⭐ {tool.rating}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${tool.revenue}</span>
                    </>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
