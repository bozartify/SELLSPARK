'use client';

import { useState, ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Lightweight syntax highlighter — no deps.
   Token colors follow the VS Code "Dark+" / One Dark palette.
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  bg:        '#0b0817',
  line:      'rgba(124,58,237,0.08)',
  comment:   '#6b7280',
  keyword:   '#c084fc',  // purple
  string:    '#86efac',  // green
  number:    '#fbbf24',  // amber
  fn:        '#60a5fa',  // blue
  prop:      '#e879f9',  // pink-purple
  builtin:   '#f472b6',
  operator:  '#a78bfa',
  type:      '#fde68a',
  text:      '#e5e7eb',
  punctuation: '#9ca3af',
};

const KEYWORDS = new Set([
  'const','let','var','function','return','if','else','for','while','do','switch','case','break','continue',
  'class','extends','new','this','super','import','export','from','as','default','async','await','try','catch',
  'finally','throw','typeof','instanceof','in','of','null','undefined','true','false','void','delete','yield',
  'interface','type','enum','public','private','protected','readonly','static','implements',
]);
const BUILTINS = new Set(['console','window','document','Array','Object','String','Number','Boolean','Promise','Math','JSON','process','require','module','exports']);

type Token = { t: string; c: string };

function highlightJS(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    // line comment
    if (ch === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i);
      const j = end === -1 ? src.length : end;
      out.push({ t: src.slice(i, j), c: C.comment });
      i = j;
      continue;
    }
    // block comment
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end === -1 ? src.length : end + 2;
      out.push({ t: src.slice(i, j), c: C.comment });
      i = j;
      continue;
    }
    // strings (single, double, backtick)
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < src.length && src[j] !== quote) {
        if (src[j] === '\\') j += 2; else j++;
      }
      j = Math.min(src.length, j + 1);
      out.push({ t: src.slice(i, j), c: C.string });
      i = j;
      continue;
    }
    // numbers
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9a-fA-Fxo._]/.test(src[j])) j++;
      out.push({ t: src.slice(i, j), c: C.number });
      i = j;
      continue;
    }
    // identifiers / keywords
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const word = src.slice(i, j);
      // after "." → property; followed by "(" → function
      const prev = out.length ? out[out.length - 1].t.trimEnd().slice(-1) : '';
      const next = src[j];
      let color = C.text;
      if (KEYWORDS.has(word)) color = C.keyword;
      else if (BUILTINS.has(word)) color = C.builtin;
      else if (prev === '.') color = C.prop;
      else if (next === '(') color = C.fn;
      else if (/^[A-Z]/.test(word)) color = C.type;
      out.push({ t: word, c: color });
      i = j;
      continue;
    }
    // operators / punctuation
    if ('=+-*/%<>!&|^~?:'.includes(ch)) {
      out.push({ t: ch, c: C.operator });
      i++;
      continue;
    }
    if ('{}[]().,;'.includes(ch)) {
      out.push({ t: ch, c: C.punctuation });
      i++;
      continue;
    }
    // whitespace / fallback
    out.push({ t: ch, c: C.text });
    i++;
  }
  return out;
}

function highlightJSON(src: string): Token[] {
  const out: Token[] = [];
  const re = /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(\b-?\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|\b(true|false|null)\b|([{}\[\],:])|(\s+)|([^\s]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[1]) out.push({ t: m[1], c: C.prop });
    else if (m[2]) out.push({ t: m[2], c: C.string });
    else if (m[3]) out.push({ t: m[3], c: C.number });
    else if (m[4]) out.push({ t: m[4], c: C.keyword });
    else if (m[5]) out.push({ t: m[5], c: C.punctuation });
    else if (m[6]) out.push({ t: m[6], c: C.text });
    else if (m[7]) out.push({ t: m[7], c: C.text });
  }
  return out;
}

function highlightBash(src: string): Token[] {
  const out: Token[] = [];
  const lines = src.split('\n');
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('#')) {
      out.push({ t: line, c: C.comment });
    } else {
      const parts = line.split(/(\s+)/);
      parts.forEach((p, i) => {
        if (/^\s+$/.test(p)) out.push({ t: p, c: C.text });
        else if (i === 0 || parts[i - 2] === '' || (i > 0 && parts[i - 1] && /^\s+$/.test(parts[i - 1]) && i === 1))
          out.push({ t: p, c: C.fn });
        else if (p.startsWith('--') || p.startsWith('-'))
          out.push({ t: p, c: C.keyword });
        else if (/^".*"$|^'.*'$/.test(p))
          out.push({ t: p, c: C.string });
        else
          out.push({ t: p, c: C.text });
      });
    }
    if (idx < lines.length - 1) out.push({ t: '\n', c: C.text });
  });
  return out;
}

export type Lang = 'ts' | 'tsx' | 'js' | 'json' | 'bash' | 'sh';

function tokenize(src: string, lang: Lang): Token[] {
  if (lang === 'json') return highlightJSON(src);
  if (lang === 'bash' || lang === 'sh') return highlightBash(src);
  return highlightJS(src);
}

/* ═══════════════════════════════════════════════════════════════════
   CodeBlock component
   ═══════════════════════════════════════════════════════════════════ */
export function CodeBlock({
  code, lang = 'ts', title, badge,
}: {
  code: string; lang?: Lang; title?: string; badge?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const tokens = tokenize(code, lang);
  const lines = code.split('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: C.bg,
        border: '1px solid var(--border-sm)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(124,58,237,0.08)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: 'rgba(124,58,237,0.06)', borderBottom: `1px solid ${C.line}` }}
      >
        {/* macOS dots */}
        <div className="flex gap-1.5 mr-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        {title && (
          <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>{title}</span>
        )}
        <span
          className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
          style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--purple-glow)', border: '1px solid var(--border-sm)' }}
        >
          {lang}
        </span>
        {badge}
        <button
          onClick={copy}
          className="ml-1 px-2 py-1 rounded text-[11px] font-semibold transition-all"
          style={{
            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.15)',
            color: copied ? '#4ade80' : 'var(--purple-glow)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'var(--border-sm)'}`,
          }}
        >
          {copied ? '✓ copied' : '⧉ copy'}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="text-[13px] leading-[1.6] font-mono p-4 m-0" style={{ color: C.text }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '14px' }}>
            {/* line numbers */}
            <div style={{ color: 'rgba(255,255,255,0.18)', userSelect: 'none', textAlign: 'right' }}>
              {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            {/* tokens */}
            <code>
              {tokens.map((tk, i) => (
                <span key={i} style={{ color: tk.c }}>{tk.t}</span>
              ))}
            </code>
          </div>
        </pre>
      </div>
    </div>
  );
}
