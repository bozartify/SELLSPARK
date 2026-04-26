'use client';

/* ═══════════════════════════════════════════════════════════════════════════
   Motion primitives — scroll reveal, counters, typewriter, marquee,
   magnetic CTAs, terminal streaming. All respect prefers-reduced-motion.
   CSS-only where possible; rAF for counters; IntersectionObserver for reveal.
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  CSSProperties,
  MouseEvent,
  ElementType,
} from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───── Reveal: fade-up on scroll intersection ─────────────────────── */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  as = 'div',
  className = '',
  style,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (prefersReduced()) { setVis(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            setVis(true);
            if (once) io.unobserve(e.target);
          } else if (!once) setVis(false);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      style={{
        ...style,
        transform: vis ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        opacity: vis ? 1 : 0,
        transition: `transform 780ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, opacity 620ms ease ${delay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </Tag>
  );
}

/* ───── Stagger wrapper — children fade in sequentially ────────────── */
export function Stagger({
  children,
  gap = 80,
  start = 0,
  y = 18,
  className = '',
  style,
}: {
  children: ReactNode[];
  gap?: number;
  start?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {children.map((c, i) => (
        <Reveal key={i} delay={start + i * gap} y={y}>
          {c}
        </Reveal>
      ))}
    </div>
  );
}

/* ───── Counter: animated number with rAF + easeOutCubic ──────────── */
export function Counter({
  to,
  duration = 1600,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  className = '',
  style,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (prefersReduced()) { setVal(to); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(to * eased);
          if (p < 1) requestAnimationFrame(tick);
          else setVal(to);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const formatted = val
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return <span ref={ref} className={className} style={style}>{prefix}{formatted}{suffix}</span>;
}

/* ───── Typewriter: rotating phrases with blinking caret ──────────── */
export function Typewriter({
  words,
  typeMs = 70,
  holdMs = 1400,
  eraseMs = 36,
  className = '',
  style,
  caretColor = 'currentColor',
}: {
  words: string[];
  typeMs?: number;
  holdMs?: number;
  eraseMs?: number;
  className?: string;
  style?: CSSProperties;
  caretColor?: string;
}) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState('');
  const [phase, setPhase] = useState<'type' | 'hold' | 'erase'>('type');

  useEffect(() => {
    if (prefersReduced()) { setTxt(words[0] || ''); return; }
    let timer: NodeJS.Timeout;
    const word = words[i % words.length];
    if (phase === 'type') {
      if (txt.length < word.length) timer = setTimeout(() => setTxt(word.slice(0, txt.length + 1)), typeMs);
      else timer = setTimeout(() => setPhase('erase'), holdMs);
    } else if (phase === 'erase') {
      if (txt.length > 0) timer = setTimeout(() => setTxt(txt.slice(0, -1)), eraseMs);
      else { setPhase('type'); setI(i + 1); }
    }
    return () => clearTimeout(timer);
  }, [txt, phase, i, words, typeMs, holdMs, eraseMs]);

  return (
    <span className={className} style={style}>
      {txt}
      <span
        style={{
          display: 'inline-block',
          width: 2,
          height: '0.9em',
          background: caretColor,
          marginLeft: 4,
          verticalAlign: 'middle',
          animation: 'fr-blink 1s steps(2) infinite',
        }}
      />
    </span>
  );
}

/* ───── Marquee: infinite horizontal scroll ───────────────────────── */
export function Marquee({
  items,
  speed = 40,
  className = '',
  itemClassName = '',
}: {
  items: ReactNode[];
  speed?: number;
  className?: string;
  itemClassName?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden relative ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}>
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{ animation: `fr-marquee ${speed}s linear infinite`, width: 'max-content' }}
      >
        {doubled.map((it, i) => (
          <span key={i} className={itemClassName}>{it}</span>
        ))}
      </div>
    </div>
  );
}

/* ───── MagneticButton: cursor-following translate ────────────────── */
export function Magnetic({
  children,
  strength = 18,
  className = '',
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate3d(0,0,0)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ ...style, transition: 'transform 380ms cubic-bezier(0.22,1,0.36,1)', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

/* ───── TiltCard: 3D parallax on mouse ────────────────────────────── */
export function Tilt({
  children,
  max = 8,
  scale = 1.01,
  className = '',
  style,
}: {
  children: ReactNode;
  max?: number;
  scale?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -max * 2;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * max * 2;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        ...style,
        transition: 'transform 420ms cubic-bezier(0.22,1,0.36,1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

/* ───── TerminalStream: lines appear one-by-one on intersection ───── */
export function TerminalStream({
  lines,
  lineDelay = 420,
  startDelay = 150,
  className = '',
  style,
}: {
  lines: { text: ReactNode; color?: string }[];
  lineDelay?: number;
  startDelay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (prefersReduced()) { setN(lines.length); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) {
        let i = 0;
        const next = () => {
          setN(++i);
          if (i < lines.length) setTimeout(next, lineDelay);
        };
        setTimeout(next, startDelay);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [lines.length, lineDelay, startDelay]);

  return (
    <div ref={ref} className={className} style={style}>
      {lines.slice(0, n).map((l, i) => (
        <div
          key={i}
          style={{
            color: l.color,
            animation: 'fr-line-in 420ms cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          {l.text}
        </div>
      ))}
    </div>
  );
}
