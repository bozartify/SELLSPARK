'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { generateQuantumSafeToken } from '@/lib/quantum/crypto';
import { Reveal, Magnetic } from '@/components/ui/motion';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!email || !password) { setError('Please fill in all fields'); return; }
      const userId = generateQuantumSafeToken(16);
      setUser({ id: userId, name: email.split('@')[0], email, role: 'CREATOR' });
      router.push('/dashboard');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)' }} />
      <Reveal>
        <div className="relative w-full max-w-md rounded-3xl p-10"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)', backdropFilter: 'blur(20px)', boxShadow: '0 40px 120px -30px rgba(0,0,0,0.5)' }}>
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="fr-logo-mark w-12 h-12 rounded-2xl text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
            </div>
            <span className="fr-display text-[34px] leading-none" style={{ color: 'var(--ivory)' }}>
              Sell<span className="fr-display-italic fr-gradient-animated">Spark</span>
            </span>
          </Link>

          <h1 className="fr-display text-[40px] text-center leading-[1]" style={{ color: 'var(--ivory)' }}>
            Welcome <span className="fr-display-italic fr-gradient-animated">back</span>.
          </h1>
          <p className="text-center text-[14px] mt-3 mb-8" style={{ color: 'var(--text-3)' }}>Sign in to your creator dashboard</p>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-lg text-[14px] outline-none"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-lg text-[14px] outline-none"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }} />
            {error && <p className="text-[12px] text-center" style={{ color: '#f87171' }}>{error}</p>}
            <Magnetic strength={8}>
              <button type="submit" disabled={loading} className="fr-btn text-[13px] w-full" style={{ padding: '13px 20px', fontWeight: 600 }}>
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </Magnetic>
          </form>

          <div className="relative my-7 flex items-center">
            <div className="flex-1 h-px" style={{ background: 'var(--border-sm)' }} />
            <span className="px-4 fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-sm)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['Google', 'GitHub'].map((p) => (
              <button key={p} className="py-3 rounded-lg text-[13px] transition-all"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}>
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-[13px] mt-7" style={{ color: 'var(--text-3)' }}>
            New here?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--purple-glow)' }}>Create an account →</Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
