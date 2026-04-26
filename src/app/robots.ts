import type { MetadataRoute } from 'next';
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://sellspark.com';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/api', '/auth'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
