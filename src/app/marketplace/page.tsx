'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Magnetic, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

interface Tool {
  id: string; name: string; description: string; category: string;
  price: number; rating: number; usageCount: number; creator: string;
  icon: IconName; featured: boolean;
}

const CATEGORIES = ['All', 'Content Writing', 'Image Generation', 'Social Media', 'Email Marketing', 'SEO', 'Analytics', 'Sales Copy', 'Education'];

const AI_TOOLS: Tool[] = [
  { id: '1', name: 'AI Caption Writer', description: 'Generate viral social media captions with hashtags for any niche.', category: 'Social Media', price: 0, rating: 4.8, usageCount: 12400, creator: 'SellSpark', icon: 'pen', featured: true },
  { id: '2', name: 'Course Outline Generator', description: 'AI creates complete course structures with modules and lessons.', category: 'Education', price: 19, rating: 4.9, usageCount: 8200, creator: 'EduAI', icon: 'grad', featured: true },
  { id: '3', name: 'Sales Page Builder', description: 'High-converting sales copy generated from your product details.', category: 'Sales Copy', price: 29, rating: 4.7, usageCount: 6300, creator: 'CopyGenie', icon: 'diamond', featured: true },
  { id: '4', name: 'Email Sequence Creator', description: 'Build 7-day nurture sequences that convert subscribers to buyers.', category: 'Email Marketing', price: 24, rating: 4.6, usageCount: 5100, creator: 'MailCraft', icon: 'mail', featured: false },
  { id: '5', name: 'SEO Blog Writer', description: 'Research keywords and write SEO-optimized blog posts automatically.', category: 'SEO', price: 39, rating: 4.8, usageCount: 9800, creator: 'RankAI', icon: 'radar', featured: false },
  { id: '6', name: 'Thumbnail Generator', description: 'AI-designed YouTube/course thumbnails that maximize click-through.', category: 'Image Generation', price: 14, rating: 4.5, usageCount: 7600, creator: 'PixelAI', icon: 'film', featured: false },
  { id: '7', name: 'Product Description AI', description: 'Transform features into benefit-driven product descriptions.', category: 'Content Writing', price: 9, rating: 4.7, usageCount: 11200, creator: 'DescribeIt', icon: 'spark', featured: false },
  { id: '8', name: 'Revenue Forecaster', description: 'AI predicts your revenue growth and suggests optimization strategies.', category: 'Analytics', price: 49, rating: 4.9, usageCount: 3400, creator: 'SellSpark', icon: 'chart', featured: true },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = AI_TOOLS.filter((t) => {
    const m = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return m && (cat === 'All' || t.category === cat);
  });

  return (
    <MarketingShell>
      <PageHero
        eyebrow="Marketplace — 100+ AI apps"
        title="Supercharge"
        italic="every storefront"
        suffix="."
        subtitle="One-click install. Built by creators, for creators. Free and paid tools that plug into your SellSpark OS."
      />
      <PageSection>
        <div className="max-w-2xl mx-auto mb-8">
          <input
            placeholder="Search AI tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl text-[14px] outline-none"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="px-4 py-2 rounded-full fr-mono text-[11px] uppercase tracking-wider transition-all"
              style={cat === c
                ? { background: 'var(--grad-brand)', color: '#fff', border: '1px solid transparent' }
                : { background: 'var(--surface-1)', color: 'var(--text-3)', border: '1px solid var(--border-sm)' }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t, i) => (
            <Reveal key={t.id} delay={i * 40}>
              <Tilt max={5}>
                <div className="rounded-2xl p-6 h-full flex flex-col" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="shrink-0" style={{ color: 'var(--purple-glow)' }}><Icon name={t.icon} size={30} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="fr-display text-[18px] leading-tight" style={{ color: 'var(--ivory)' }}>{t.name}</div>
                      <div className="fr-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-3)' }}>by {t.creator}</div>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed mb-5 flex-1" style={{ color: 'var(--text-2)' }}>{t.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="fr-mono text-[11px] flex gap-3" style={{ color: 'var(--text-3)' }}>
                      <span>★ {t.rating}</span>
                      <span>{t.usageCount.toLocaleString()} uses</span>
                    </div>
                    <Magnetic strength={8}>
                      <button className="fr-btn text-[11px]" style={{ padding: '8px 14px', fontWeight: 600 }}>
                        {t.price === 0 ? 'Install free' : `$${t.price}`} →
                      </button>
                    </Magnetic>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Build. Publish." italic="Earn revenue share." primary={{ href: '/auth/signup', label: 'Become a creator' }} secondary={{ href: '/docs', label: 'Read dev docs' }} />
    </MarketingShell>
  );
}
