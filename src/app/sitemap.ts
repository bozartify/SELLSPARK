import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://sellspark.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const marketing = [
    '', '/about', '/features', '/pricing', '/marketplace', '/blog', '/docs', '/help', '/guides',
    '/careers', '/contact', '/press', '/partners', '/community', '/changelog', '/roadmap', '/status',
    '/security', '/privacy', '/terms', '/cookies', '/dpa',
  ];

  const solutions = [
    '/solutions/coaches', '/solutions/educators', '/solutions/fitness',
    '/solutions/agencies', '/solutions/enterprise', '/solutions/creators',
    '/solutions/podcasters', '/solutions/authors',
  ];

  const auth = ['/auth/login', '/auth/signup', '/onboarding'];

  const features = [
    '/features/video-studio', '/features/email-marketing', '/features/social-scheduler',
    '/features/affiliate-program', '/features/course-platform', '/features/live-streaming',
    '/features/ai-agents', '/features/quantum-security', '/features/analytics',
    '/features/crm', '/features/wallet', '/features/community',
  ];

  const blog = [
    '/blog/how-to-build-10k-creator-business',
    '/blog/quantum-resistant-security-for-creators',
    '/blog/ai-store-generator-guide',
    '/blog/affiliate-marketing-for-creators',
    '/blog/best-email-marketing-strategies-2026',
    '/blog/live-streaming-monetization-guide',
    '/blog/how-to-price-your-online-course',
    '/blog/creator-economy-trends-2026',
  ];

  const now = new Date();

  return [
    ...marketing.map(p => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1.0 : p === '/features' || p === '/pricing' ? 0.9 : 0.7,
    })),
    ...solutions.map(p => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...features.map(p => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...blog.map(p => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...auth.map(p => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
