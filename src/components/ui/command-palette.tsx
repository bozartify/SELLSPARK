'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface CommandItem {
  id: string;
  title: string;
  hint?: string;
  icon?: string;
  group?: string;
  href?: string;
  keywords?: string;
  action?: () => void;
}

interface Props {
  items: CommandItem[];
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ items, open, onClose }: Props) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = q
    ? items.filter((c) =>
        (c.title + ' ' + (c.keywords || '') + ' ' + (c.group || '')).toLowerCase().includes(q.toLowerCase())
      )
    : items;

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIdx((i) => Math.min(filtered.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      }
      if (e.key === 'Enter') {
        const c = filtered[idx];
        if (c) {
          c.action?.();
          if (c.href) window.location.href = c.href;
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, idx, onClose]);

  if (!open) return null;

  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, c) => {
    const g = c.group || 'General';
    (acc[g] ||= []).push(c);
    return acc;
  }, {});

  let runningIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-fade-in"
      style={{ background: 'rgba(8,6,19,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'rgba(16,12,30,0.85)',
          backdropFilter: 'blur(32px)',
          border: '1px solid var(--border-md)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.25)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-xs)' }}>
          <span style={{ color: 'var(--text-3)' }}>⌘</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-1)' }}
          />
          <kbd
            className="px-2 py-0.5 text-[10px] rounded font-mono"
            style={{ background: 'var(--surface-3)', color: 'var(--text-3)', border: '1px solid var(--border-xs)' }}
          >
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-2">
          {Object.keys(groups).length === 0 && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-3)' }}>
              No results for &ldquo;{q}&rdquo;
            </div>
          )}
          {Object.entries(groups).map(([group, list]) => (
            <div key={group}>
              <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>
                {group}
              </p>
              {list.map((c) => {
                runningIdx++;
                const active = runningIdx === idx;
                const content = (
                  <div
                    onMouseEnter={() => setIdx(runningIdx)}
                    className="mx-2 px-3 py-2 rounded-lg flex items-center gap-3 cursor-pointer transition-colors"
                    style={{
                      background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                      border: `1px solid ${active ? 'var(--border-sm)' : 'transparent'}`,
                    }}
                  >
                    <span className="text-base">{c.icon || '›'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{c.title}</p>
                      {c.hint && <p className="text-[11px] truncate" style={{ color: 'var(--text-4)' }}>{c.hint}</p>}
                    </div>
                    {active && <span className="text-xs" style={{ color: 'var(--purple-glow)' }}>↵</span>}
                  </div>
                );
                return c.href ? (
                  <Link key={c.id} href={c.href} onClick={onClose}>{content}</Link>
                ) : (
                  <button key={c.id} onClick={() => { c.action?.(); onClose(); }} className="w-full text-left">
                    {content}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div
          className="px-4 py-2 flex items-center gap-4 text-[10px]"
          style={{ borderTop: '1px solid var(--border-xs)', color: 'var(--text-4)' }}
        >
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
          <span className="ml-auto">{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}
