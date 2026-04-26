import { PageShell } from '@/components/site/page-shell';
import { POSTS } from '../page';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/blog" className="text-sm text-violet-600">← All posts</Link>
        <div className="text-xs text-violet-600 font-semibold mt-6 mb-3">{post.tag} · {new Date(post.date).toLocaleDateString()}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{post.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4">
          <p>SellSpark was built on one bet: creators deserve an operating system as sophisticated as Shopify, as fast as Linear, and as intelligent as any frontier AI lab.</p>
          <p>In this post, we unpack the engineering choices, the math, and the creator-first decisions behind what you see on the surface.</p>
          <h2 className="text-2xl font-bold mt-8">The stack</h2>
          <p>Next.js 16 on Turbopack, Prisma, Stripe, post-quantum Kyber, custom neural runtime, edge AI, and a six-agent swarm — all speaking through a single typed API.</p>
          <h2 className="text-2xl font-bold mt-8">What&apos;s next</h2>
          <p>Spatial commerce on Vision Pro, deeper on-chain payouts, and federated learning across creator cohorts.</p>
        </div>
      </article>
    </PageShell>
  );
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}
