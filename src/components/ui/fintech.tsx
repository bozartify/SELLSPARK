'use client';

/* ═══════════════════════════════════════════════════════════════════════════
   Fintech/crypto-grade primitives — live tickers, sparklines, candle charts,
   flash-on-change numerics, portfolio rings. Zero deps.
   ═══════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState, CSSProperties } from 'react';

/* ─── TickerRow: scrolling market strip with price flashes ───────── */
export type Tick = { sym: string; price: number; chg: number };

export function TickerStrip({
  seed,
  className = '',
  style,
}: {
  seed: Tick[];
  className?: string;
  style?: CSSProperties;
}) {
  const [ticks, setTicks] = useState(seed);
  const [flash, setFlash] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setTicks((prev) => {
        const f: Record<string, 'up' | 'down' | null> = {};
        const next = prev.map((t) => {
          const delta = (Math.random() - 0.48) * t.price * 0.004;
          const p = Math.max(0, t.price + delta);
          f[t.sym] = delta > 0 ? 'up' : delta < 0 ? 'down' : null;
          return { ...t, price: p, chg: t.chg + (delta / t.price) * 100 };
        });
        setFlash(f);
        setTimeout(() => setFlash({}), 600);
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const items = [...ticks, ...ticks];
  return (
    <div
      className={`overflow-hidden relative ${className}`}
      style={{
        ...style,
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
      }}
    >
      <div
        className="flex gap-8 whitespace-nowrap py-2.5 px-4"
        style={{ animation: 'fr-marquee 55s linear infinite', width: 'max-content' }}
      >
        {items.map((t, i) => {
          const f = flash[t.sym];
          const up = t.chg >= 0;
          return (
            <span key={`${t.sym}-${i}`} className="inline-flex items-center gap-2 fr-mono text-[12px]">
              <span style={{ color: 'var(--text-3)' }}>{t.sym}</span>
              <span
                style={{
                  color: f === 'up' ? '#4ade80' : f === 'down' ? '#f87171' : 'var(--ivory)',
                  transition: 'color 400ms ease',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                ${t.price.toFixed(t.price > 100 ? 2 : 4)}
              </span>
              <span
                className="inline-flex items-center gap-0.5"
                style={{ color: up ? '#4ade80' : '#f87171', fontVariantNumeric: 'tabular-nums' }}
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                  {up ? <path d="M5 2l4 6H1z" /> : <path d="M5 8L1 2h8z" />}
                </svg>
                {Math.abs(t.chg).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sparkline: smooth SVG mini-chart ───────────────────────────── */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  stroke = 'var(--purple-glow)',
  fill = 'rgba(167,139,250,0.15)',
  strokeWidth = 1.5,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * height]);
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
  const area = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="spk-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={fill === 'auto' ? 'url(#spk-fill)' : fill} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={stroke} />
    </svg>
  );
}

/* ─── Candle chart (mini OHLC) ───────────────────────────────────── */
export function CandleMini({
  bars,
  width = 260,
  height = 90,
}: {
  bars: { o: number; h: number; l: number; c: number }[];
  width?: number;
  height?: number;
}) {
  const all = bars.flatMap((b) => [b.h, b.l]);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const cw = width / bars.length;
  const bodyW = Math.max(2, cw * 0.6);
  const y = (v: number) => height - ((v - min) / range) * height;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {bars.map((b, i) => {
        const cx = i * cw + cw / 2;
        const up = b.c >= b.o;
        const color = up ? '#4ade80' : '#f87171';
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={y(b.h)} y2={y(b.l)} stroke={color} strokeWidth={1} opacity={0.8} />
            <rect
              x={cx - bodyW / 2}
              y={y(Math.max(b.o, b.c))}
              width={bodyW}
              height={Math.max(1, Math.abs(y(b.o) - y(b.c)))}
              fill={color}
              opacity={0.9}
              rx={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ─── RadialRing: portfolio donut % ──────────────────────────────── */
export function RadialRing({
  pct,
  size = 96,
  stroke = 8,
  color = 'var(--purple-glow)',
  track = 'rgba(167,139,250,0.12)',
  label,
  value,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
  value?: string;
}) {
  const [draw, setDraw] = useState(0);
  const ref = useRef<SVGSVGElement | null>(null);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) {
        requestAnimationFrame(() => setDraw(pct));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [pct]);

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg ref={ref} width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (draw / 100) * c}
          style={{ transition: 'stroke-dashoffset 1400ms cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="fr-display text-[22px] leading-none" style={{ color: 'var(--ivory)' }}>
          {value ?? `${pct}%`}
        </div>
        {label && (
          <div className="fr-mono text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-3)' }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── FlashNumber: value that flashes green/red on change ─────────── */
export function FlashNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const prev = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  useEffect(() => {
    if (value > prev.current) setFlash('up');
    else if (value < prev.current) setFlash('down');
    prev.current = value;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <span
      className={className}
      style={{
        ...style,
        fontVariantNumeric: 'tabular-nums',
        color: flash === 'up' ? '#4ade80' : flash === 'down' ? '#f87171' : (style?.color ?? 'var(--ivory)'),
        transition: 'color 500ms ease',
      }}
    >
      {prefix}
      {value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      {suffix}
    </span>
  );
}

/* ─── DepthBar: orderbook-style horizontal meter ─────────────────── */
export function DepthBar({
  pct,
  side = 'buy',
  label,
  value,
}: {
  pct: number;
  side?: 'buy' | 'sell';
  label: string;
  value: string;
}) {
  const color = side === 'buy' ? '#4ade80' : '#f87171';
  return (
    <div className="relative flex items-center justify-between py-1.5 px-2 rounded"
      style={{ background: `linear-gradient(${side === 'buy' ? 'to right' : 'to left'}, ${color}22 ${pct}%, transparent ${pct}%)` }}>
      <span className="fr-mono text-[11px]" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className="fr-mono text-[11px]" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
