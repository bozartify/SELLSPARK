/* Monoline stroke icon set — replaces emoji navigation.
   Lucide-style 24x24 viewBox, currentColor strokes, 1.75 weight.
   Single file, zero deps, tree-shakable via named exports. */

import { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20): P => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

const S = ({ size, children, ...rest }: P & { children: React.ReactNode }) => (
  <svg {...base(size)} {...rest}>
    {children}
  </svg>
);

/* eslint-disable react/jsx-key */
const PATHS: Record<string, React.ReactNode> = {
  overview: (<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
  rocket: (<><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></>),
  vault: (<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
  spark: (<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>),
  store: (<><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>),
  box: (<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.3 7L12 12l8.7-5M12 22V12" /></>),
  bot: (<><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M12 8V4M8 3h8M9 14h.01M15 14h.01" /></>),
  receipt: (<><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
  chart: (<><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-6" /></>),
  live: (<><circle cx="12" cy="12" r="3" /><path d="M5.6 18.4a9 9 0 1 1 12.8 0M8.5 15.5a5 5 0 1 1 7 0" /></>),
  pen: (<><path d="M12 19l7-7 3 3-7 7H12v-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></>),
  mail: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 6 10-6" /></>),
  share: (<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" /></>),
  film: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5" /></>),
  grad: (<><path d="M12 3L2 8l10 5 10-5-10-5z" /><path d="M6 10v6a6 6 0 0 0 12 0v-6" /></>),
  users: (<><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><circle cx="17" cy="8" r="3" /><path d="M22 21a5 5 0 0 0-6-5" /></>),
  handshake: (<><path d="M11 17l2 2 4-4M3 12l4-4h4l3 3 3-3h4l-4 4-7 7-4-4z" /></>),
  chat: (<><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>),
  trophy: (<><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3" /></>),
  gavel: (<><path d="M14 9l-4 4M7 16l5-5M2 22l6-6M14 2l8 8-4 4-8-8z" /></>),
  radar: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12L20 6" /></>),
  flask: (<><path d="M9 3h6M10 3v6l-5 9a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3" /></>),
  arm: (<><path d="M6 10c0-4 3-6 6-6s6 2 6 6-2 6-6 6v5M6 10h3M6 14h4" /></>),
  growth: (<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>),
  gem: (<><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M6 3l4 6M18 3l-4 6M2 9h20M10 9L12 22M14 9L12 22" /></>),
  atom: (<><circle cx="12" cy="12" r="1" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></>),
  lock: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /><circle cx="12" cy="16" r="1" /></>),
  brain: (<><path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-3 3 3 3 0 0 0 2 2.8A3 3 0 0 0 6 18a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1-2 2.8A3 3 0 0 1 18 18a3 3 0 0 1-3 3 3 3 0 0 1-3-3" /></>),
  shield: (<><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6z" /></>),
  leaf: (<><path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 11-11 1 9-1 15-4 18z" /><path d="M4 21c4-4 7-5 11-5" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" /></>),
  translate: (<><path d="M4 5h8M9 3v2m-1 0c0 5-3 9-6 9M7 5c0 3 3 6 7 7" /><path d="M14 22l4-10 4 10M16 18h4" /></>),
  plug: (<><path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 0 1-10 0zM12 17v5" /></>),
  cash: (<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></>),
  wrench: (<><path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 1 5.4-5.4L15 12l-3-3z" /></>),
  card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>),
  mirror: (<><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M12 3v18" /></>),
  vote: (<><path d="M9 11l2 2 4-4" /><rect x="3" y="3" width="18" height="18" rx="2" /></>),
  diamond: (<><path d="M2 9l4-6h12l4 6-10 13z" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  web: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  stack: (<><path d="M12 2l10 5-10 5L2 7z" /><path d="M2 12l10 5 10-5M2 17l10 5 10-5" /></>),
  mobile: (<><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>),
  link: (<><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1-1" /></>),
  stars: (<><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /><path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></>),
  money: (<><path d="M12 2v20M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6" /></>),
  crystal: (<><path d="M12 2l5 6-5 14-5-14z" /><path d="M7 8h10" /></>),
  keyhole: (<><circle cx="12" cy="10" r="3" /><path d="M12 13v6" /><circle cx="12" cy="12" r="10" /></>),
  africa: (<><path d="M8 3c4 0 8 2 9 6-1 5-3 7-3 10-2 1-4 2-7 2-3 0-5-2-5-5 0-2 1-3 1-5 0-3 1-7 5-8z" /></>),
  scales: (<><path d="M12 3v18M5 21h14M7 8l-4 8a4 4 0 0 0 8 0zM17 8l-4 8a4 4 0 0 0 8 0zM7 8l5-2 5 2" /></>),
  cog: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.4.6.7 1.1.7H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  book: (<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>),
};
/* eslint-enable react/jsx-key */

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, ...rest }: { name: IconName; size?: number } & Omit<P, 'name'>) {
  return <S size={size} {...rest}>{PATHS[name]}</S>;
}
