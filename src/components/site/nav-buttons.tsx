'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NavButtons({ className = '' }: { className?: string }) {
  const router = useRouter();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-violet-500 hover:text-violet-600 transition"
        aria-label="Go back"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back
      </button>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-violet-500 hover:text-violet-600 transition"
        aria-label="Go home"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9.5Z" /></svg>
        Home
      </Link>
    </div>
  );
}
