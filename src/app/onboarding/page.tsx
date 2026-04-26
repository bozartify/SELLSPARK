'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreBuilder } from '@/lib/store';
import { aiEngine, type AIGeneratedStore } from '@/lib/ai/engine';
import { Reveal, Magnetic, TerminalStream } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

const NICHES: { id: string; label: string; icon: IconName }[] = [
  { id: 'fitness', label: 'Fitness & Health', icon: 'arm' },
  { id: 'education', label: 'Education', icon: 'grad' },
  { id: 'business', label: 'Business & Marketing', icon: 'chart' },
  { id: 'creative', label: 'Creative & Design', icon: 'pen' },
  { id: 'tech', label: 'Technology', icon: 'cog' },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'spark' },
  { id: 'finance', label: 'Finance', icon: 'money' },
  { id: 'music', label: 'Music & Audio', icon: 'film' },
];

const STYLES = [
  { id: 'minimal' as const, label: 'Minimal', desc: 'Clean. Spacious. Editorial.', tint: 'linear-gradient(135deg, #faf8f3, #d8cff5)' },
  { id: 'bold' as const, label: 'Bold', desc: 'Dark. High-contrast. Loud.', tint: 'linear-gradient(135deg, #13111f, #7c3aed)' },
  { id: 'elegant' as const, label: 'Elegant', desc: 'Refined. Serif. Luxe.', tint: 'linear-gradient(135deg, #f59e0b, #d8cff5)' },
  { id: 'playful' as const, label: 'Playful', desc: 'Fun. Colorful. Round.', tint: 'linear-gradient(135deg, #ec4899, #a78bfa)' },
  { id: 'professional' as const, label: 'Professional', desc: 'Corporate. Trustworthy. Crisp.', tint: 'linear-gradient(135deg, #60a5fa, #818cf8)' },
];

const BUILD_LINES = [
  '$ sellspark init --niche=fitness',
  '✓ Provisioning quantum-safe store…',
  '✓ Generating brand palette',
  '✓ Drafting 6 hero products',
  '✓ Wiring Stripe + crypto rails',
  '✓ Deploying to edge in 47s',
  '◆ Storefront ready.',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { step, storeData, setStep, updateStoreData } = useStoreBuilder();
  const [loading, setLoading] = useState(false);
  const [generatedStore, setGeneratedStore] = useState<AIGeneratedStore | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const store = await aiEngine.generateStore({
        creatorName: storeData.name,
        niche: storeData.niche,
        description: storeData.description,
        style: storeData.style,
      });
      setGeneratedStore(store);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  const card: React.CSSProperties = {
    background: 'var(--surface-1)',
    border: '1px solid var(--border-sm)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 40px 120px -30px rgba(0,0,0,0.5)',
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-2)',
    border: '1px solid var(--border-sm)',
    color: 'var(--text-1)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22), transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.16), transparent 70%)' }} />

      <div className="w-full max-w-2xl relative">
        {/* Progress */}
        <Reveal>
          <div className="flex items-center justify-center gap-2 mb-10">
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: s <= step ? 56 : 28,
                  background: s <= step ? 'var(--grad-brand)' : 'var(--border-sm)',
                  boxShadow: s <= step ? '0 0 16px rgba(124,58,237,0.5)' : 'none',
                }} />
            ))}
          </div>
        </Reveal>

        {step === 0 && (
          <Reveal>
            <div className="rounded-3xl p-10" style={card}>
              <div className="text-center mb-8">
                <div className="fr-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>
                  ◆ Step 01 — Tell us about you
                </div>
                <h1 className="fr-display text-[44px] leading-[1]" style={{ color: 'var(--ivory)' }}>
                  Build a store in <span className="fr-display-italic fr-gradient-animated">47 seconds</span>.
                </h1>
                <p className="text-[14px] mt-4" style={{ color: 'var(--text-3)' }}>
                  AI generates products, branding, and SEO. You approve.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="fr-mono text-[10px] uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-3)' }}>Your brand</label>
                  <input placeholder="e.g. Sarah Fitness, The Code Academy"
                    value={storeData.name} onChange={(e) => updateStoreData({ name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-lg text-[14px] outline-none" style={inputStyle} />
                </div>

                <div>
                  <label className="fr-mono text-[10px] uppercase tracking-widest mb-3 block" style={{ color: 'var(--text-3)' }}>Pick your niche</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {NICHES.map((n) => {
                      const active = storeData.niche === n.id;
                      return (
                        <button key={n.id} onClick={() => updateStoreData({ niche: n.id })}
                          className="p-3 rounded-xl text-center transition-all"
                          style={{
                            background: active ? 'rgba(124,58,237,0.18)' : 'var(--bg-2)',
                            border: `1px solid ${active ? 'rgba(167,139,250,0.5)' : 'var(--border-sm)'}`,
                          }}>
                          <div className="flex justify-center mb-2" style={{ color: active ? 'var(--purple-glow)' : 'var(--text-2)' }}>
                            <Icon name={n.icon} size={22} />
                          </div>
                          <div className="text-[11px]" style={{ color: 'var(--text-1)' }}>{n.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="fr-mono text-[10px] uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-3)' }}>Describe it (optional)</label>
                  <input placeholder="I help busy pros get fit with 20-min workouts"
                    value={storeData.description} onChange={(e) => updateStoreData({ description: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-lg text-[14px] outline-none" style={inputStyle} />
                </div>

                <Magnetic strength={8}>
                  <button disabled={!storeData.name || !storeData.niche} onClick={() => setStep(1)}
                    className="fr-btn text-[13px] w-full disabled:opacity-40"
                    style={{ padding: '14px 20px', fontWeight: 600 }}>
                    Continue →
                  </button>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        )}

        {step === 1 && (
          <Reveal>
            <div className="rounded-3xl p-10" style={card}>
              <div className="text-center mb-8">
                <div className="fr-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>
                  ◆ Step 02 — Aesthetic
                </div>
                <h1 className="fr-display text-[44px] leading-[1]" style={{ color: 'var(--ivory)' }}>
                  Pick your <span className="fr-display-italic fr-gradient-animated">vibe</span>.
                </h1>
                <p className="text-[14px] mt-4" style={{ color: 'var(--text-3)' }}>
                  AI customizes typography, palette, and motion to match.
                </p>
              </div>

              <div className="grid gap-3 mb-7">
                {STYLES.map((s) => {
                  const active = storeData.style === s.id;
                  return (
                    <button key={s.id} onClick={() => updateStoreData({ style: s.id })}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                      style={{
                        background: active ? 'rgba(124,58,237,0.18)' : 'var(--bg-2)',
                        border: `1px solid ${active ? 'rgba(167,139,250,0.5)' : 'var(--border-sm)'}`,
                      }}>
                      <div className="w-12 h-12 rounded-lg shrink-0" style={{ background: s.tint }} />
                      <div>
                        <div className="fr-display text-[20px] leading-none" style={{ color: 'var(--ivory)' }}>{s.label}</div>
                        <div className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>{s.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="flex-1 py-3.5 rounded-md text-[13px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}>
                  ← Back
                </button>
                <Magnetic strength={8}>
                  <button onClick={() => setStep(2)} disabled={!storeData.style}
                    className="fr-btn text-[13px] disabled:opacity-40"
                    style={{ padding: '14px 28px', fontWeight: 600 }}>
                    Continue →
                  </button>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        )}

        {step === 2 && (
          <Reveal>
            <div className="rounded-3xl p-10" style={card}>
              <div className="text-center mb-8">
                <div className="fr-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>
                  ◆ Step 03 — Ignite
                </div>
                <h1 className="fr-display text-[44px] leading-[1]" style={{ color: 'var(--ivory)' }}>
                  Ready to <span className="fr-display-italic fr-gradient-animated">build</span>?
                </h1>
                <p className="text-[14px] mt-4" style={{ color: 'var(--text-3)' }}>
                  AI will generate your storefront, products, brand & SEO in under 60 seconds.
                </p>
              </div>

              <div className="rounded-xl p-5 mb-6 space-y-3"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)' }}>
                {[
                  ['Brand', storeData.name],
                  ['Niche', storeData.niche],
                  ['Style', storeData.style],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="fr-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{k}</span>
                    <span className="text-[14px] capitalize" style={{ color: 'var(--ivory)' }}>{v || '—'}</span>
                  </div>
                ))}
              </div>

              {loading && (
                <div className="rounded-xl p-5 mb-6"
                  style={{ background: 'var(--bg-2)', border: '1px solid rgba(167,139,250,0.3)' }}>
                  <TerminalStream lines={BUILD_LINES} lineDelay={420} />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} disabled={loading}
                  className="flex-1 py-3.5 rounded-md text-[13px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)', color: 'var(--text-1)' }}>
                  ← Back
                </button>
                <Magnetic strength={10}>
                  <button onClick={handleGenerate} disabled={loading}
                    className="fr-btn text-[13px] disabled:opacity-60"
                    style={{ padding: '14px 28px', fontWeight: 600 }}>
                    {loading ? 'AI is building…' : 'Build my store →'}
                  </button>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        )}

        {step === 3 && generatedStore && (
          <Reveal>
            <div className="rounded-3xl p-10" style={card}>
              <div className="text-center mb-8">
                <div className="fr-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: '#4ade80' }}>
                  ✓ Step 04 — Live
                </div>
                <h1 className="fr-display text-[44px] leading-[1]" style={{ color: 'var(--ivory)' }}>
                  Your store is <span className="fr-display-italic fr-gradient-animated">ready</span>.
                </h1>
                <p className="text-[14px] mt-4" style={{ color: 'var(--text-3)' }}>
                  Review, tweak, and launch — all from your dashboard.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--border-sm)' }}>
                <div className="p-7 text-center"
                  style={{ backgroundColor: generatedStore.colorScheme.background, color: generatedStore.colorScheme.text }}>
                  <h2 className="fr-display text-[28px] leading-tight">{generatedStore.storeName}</h2>
                  <p className="text-[13px] opacity-75 mt-2">{generatedStore.tagline}</p>
                </div>
              </div>

              <div className="mb-7">
                <div className="fr-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--purple-glow)' }}>
                  ◆ AI-suggested products
                </div>
                <div className="space-y-2">
                  {generatedStore.suggestedProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border-sm)' }}>
                      <div>
                        <div className="text-[14px]" style={{ color: 'var(--ivory)' }}>{p.name}</div>
                        <div className="fr-mono text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-3)' }}>
                          {p.type} · {p.estimatedRevenue}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="fr-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
                          style={{
                            background: p.marketDemand === 'high' ? 'rgba(74,222,128,0.18)' : 'rgba(167,139,250,0.18)',
                            color: p.marketDemand === 'high' ? '#4ade80' : 'var(--purple-glow)',
                          }}>
                          {p.marketDemand}
                        </span>
                        <span className="fr-display text-[18px]" style={{ color: 'var(--ivory)' }}>${p.suggestedPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Magnetic strength={12}>
                <button onClick={() => router.push('/dashboard')}
                  className="fr-btn text-[14px] w-full"
                  style={{ padding: '16px 24px', fontWeight: 600 }}>
                  Launch my store →
                </button>
              </Magnetic>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
