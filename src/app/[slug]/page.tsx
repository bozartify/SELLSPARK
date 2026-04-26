'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  icon: string;
  popular?: boolean;
}

const DEMO_STORE = {
  name: 'Sarah Fitness',
  tagline: 'Transform your body, transform your life',
  bio: 'Certified personal trainer helping 10,000+ people achieve their dream physique with science-backed programs and AI-powered tools.',
  avatar: '💪',
  social: {
    instagram: '@sarahfitness',
    youtube: 'SarahFitness',
    tiktok: '@sarahfitness',
  },
  colors: {
    primary: '#7C3AED',
    background: '#0F0F0F',
    text: '#FFFFFF',
  },
  products: [
    { id: '1', name: '12-Week Transformation Program', type: 'Course', price: 97, description: 'Complete workout & nutrition plan with 50+ video tutorials, progress tracking, and community access.', icon: '🏋️', popular: true },
    { id: '2', name: 'AI Meal Plan Generator', type: 'AI Tool', price: 29, description: 'Get personalized meal plans based on your goals, dietary preferences, and macros — powered by AI.', icon: '🤖', popular: true },
    { id: '3', name: 'Monthly Coaching Membership', type: 'Membership', price: 49, description: 'Weekly check-ins, form reviews, custom adjustments, and exclusive community access.', icon: '👑' },
    { id: '4', name: '1:1 Strategy Call', type: 'Booking', price: 150, description: '60-minute personalized session to build your custom fitness roadmap.', icon: '📞' },
    { id: '5', name: 'Home Workout Essentials Pack', type: 'Digital', price: 19, description: '30 no-equipment workout routines, printable schedules, and exercise guide.', icon: '📄' },
  ] as Product[],
};

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const store = DEMO_STORE;

  return (
    <div className="min-h-screen" style={{ background: store.colors.background, color: store.colors.text }}>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 to-transparent" />
        <div className="relative max-w-2xl mx-auto px-6 pt-16 pb-12 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-5xl mx-auto mb-4 shadow-2xl shadow-violet-500/30">
            {store.avatar}
          </div>
          <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
          <p className="text-lg opacity-80 mb-4">{store.tagline}</p>
          <p className="text-sm opacity-60 max-w-md mx-auto mb-6">{store.bio}</p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 text-sm opacity-60">
            <span>📸 {store.social.instagram}</span>
            <span>🎬 {store.social.youtube}</span>
            <span>🎵 {store.social.tiktok}</span>
          </div>
        </div>
      </div>

      {/* ─── Products ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 pb-20 space-y-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Products & Tools
          <Badge className="text-xs bg-violet-600">{store.products.length}</Badge>
        </h2>

        {store.products.map((product) => (
          <Card
            key={product.id}
            hover
            className="overflow-hidden cursor-pointer border-gray-800 bg-gray-900/50"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center text-2xl shrink-0">
                  {product.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.popular && <Badge className="text-xs bg-amber-500/20 text-amber-400">Popular</Badge>}
                  </div>
                  <Badge variant="secondary" className="text-xs mb-2 bg-gray-800 text-gray-300">
                    {product.type}
                  </Badge>
                  <p className="text-sm opacity-60 line-clamp-2">{product.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold" style={{ color: store.colors.primary }}>
                    {formatPrice(product.price)}
                  </div>
                  <Button
                    size="sm"
                    className="mt-2"
                    style={{ background: store.colors.primary }}
                  >
                    Get Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Newsletter */}
        <Card className="mt-8 border-gray-800 bg-gray-900/50 overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-3">📬</div>
            <h3 className="font-semibold mb-1">Stay in the loop</h3>
            <p className="text-sm opacity-60 mb-4">Get exclusive content and early access to new products</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 h-10 rounded-xl border border-gray-700 bg-gray-800 px-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
              />
              <Button size="sm" style={{ background: store.colors.primary }}>
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Powered by */}
        <div className="text-center pt-8">
          <a href="/" className="text-xs opacity-40 hover:opacity-60 transition">
            Powered by <span className="font-semibold">SellSpark</span> — AI-First Creator Platform
          </a>
        </div>
      </div>
    </div>
  );
}
