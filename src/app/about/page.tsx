import { MarketingShell, PageHero, PageSection, PageCTA } from '@/components/site/marketing-shell';
import { Reveal, Counter, Tilt } from '@/components/ui/motion';
import { Icon, IconName } from '@/components/ui/icon';

export const metadata = { title: 'About — SellSpark' };

const VALUES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'spark', title: 'Speed over perfection', desc: 'A 60-second store beats a 60-day one every time.' },
  { icon: 'shield', title: 'Security by default', desc: 'Quantum-safe crypto, not as an upsell — as table stakes.' },
  { icon: 'brain', title: 'AI that earns its keep', desc: 'Every AI feature must drive real creator revenue.' },
  { icon: 'handshake', title: 'Creator-owned', desc: 'We align incentives. When you earn more, we earn more.' },
];

const TEAM = [
  { name: 'Ava Chen', role: 'CEO & Co-founder', bio: 'Ex-Stripe. Scaled creator payouts to $2B+.' },
  { name: 'Jordan Rivera', role: 'CTO & Co-founder', bio: 'Ex-OpenAI research. Quantum cryptographer.' },
  { name: 'Mira Patel', role: 'Head of AI', bio: 'Stanford PhD. Built recs at TikTok.' },
  { name: 'Leo Okafor', role: 'Head of Design', bio: 'Previously Design Lead at Linear & Figma.' },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="About — our story"
        title="Democratizing the"
        italic="$10k/mo creator"
        suffix="."
        subtitle="Every creator deserves an AI co-founder, quantum-grade security, and instant scale — without code, agencies, or VC."
      />
      <PageSection eyebrow="Mission" title="We build" italic="the rails" subtitle="SellSpark is the operating system for the next billion creator businesses. We fuse post-quantum cryptography, autonomous AI agents, and spatial commerce into a single platform that ships a full creator empire in under a minute.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ k: 12000, suffix: '+', v: 'Creators' }, { k: 2.4, prefix: '$', suffix: 'M+', v: 'Paid out', dec: 1 }, { k: 47, v: 'Countries' }, { k: 99.97, suffix: '%', v: 'Uptime', dec: 2 }].map((s) => (
            <Reveal key={s.v}>
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                <div className="fr-display text-[40px] leading-none fr-gradient-animated">
                  <Counter to={s.k} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} decimals={s.dec ?? 0} />
                </div>
                <div className="fr-mono text-[10px] uppercase tracking-widest mt-2" style={{ color: 'var(--text-3)' }}>{s.v}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Values" title="What we" italic="believe">
        <div className="grid md:grid-cols-2 gap-5">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 60}>
              <Tilt max={5}>
                <div className="rounded-2xl p-7 h-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-sm)' }}>
                  <div className="mb-4" style={{ color: 'var(--purple-glow)' }}><Icon name={v.icon} size={28} /></div>
                  <div className="fr-display text-[22px] mb-2" style={{ color: 'var(--ivory)' }}>{v.title}</div>
                  <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{v.desc}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageSection eyebrow="Team" title="The" italic="builders">
        <div className="grid md:grid-cols-4 gap-6">
          {TEAM.map((t, i) => (
            <Reveal key={t.name} delay={i * 60}>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 fr-float" style={{ background: 'var(--grad-brand)', boxShadow: '0 10px 30px -10px rgba(124,58,237,0.6)' }} />
                <div className="fr-display text-[18px]" style={{ color: 'var(--ivory)' }}>{t.name}</div>
                <div className="fr-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--purple-glow)' }}>{t.role}</div>
                <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{t.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>
      <PageCTA title="Come build with us." italic="We're hiring." primary={{ href: '/careers', label: 'See open roles' }} secondary={{ href: '/contact', label: 'Say hello' }} />
    </MarketingShell>
  );
}
