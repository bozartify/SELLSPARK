'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface HowToStep {
  title: string;
  body: ReactNode;
  icon?: string;
  tip?: string;
  time?: string;
}

interface HowToProps {
  title: string;
  description?: string;
  steps: HowToStep[];
  defaultOpen?: number;
}

export function HowTo({ title, description, steps, defaultOpen = 0 }: HowToProps) {
  const [open, setOpen] = useState<number>(defaultOpen);

  return (
    <div className="fr-card overflow-hidden">
      {/* Header with purple glow */}
      <div className="relative p-5 fr-section-glow" style={{ borderBottom: '1px solid var(--border-xs)' }}>
        <div className="absolute inset-0 fr-grid-bg opacity-40" />
        <div className="relative z-10 flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 animate-pulse-glow"
            style={{ background: 'var(--grad-brand)' }}
          >
            📘
          </div>
          <div>
            <div className="fr-badge fr-badge-purple mb-2">
              <span className="fr-pulse-dot" style={{ width: 6, height: 6 }} />
              How-to guide
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
              {title}
            </h3>
            {description && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Steps accordion */}
      <div className="p-3">
        {steps.map((s, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={cn(
                'rounded-xl mb-2 transition-all duration-300 overflow-hidden',
                isOpen && 'animate-border-pulse'
              )}
              style={{
                background: isOpen ? 'var(--surface-3)' : 'var(--surface-2)',
                border: `1px solid ${isOpen ? 'var(--border-md)' : 'var(--border-xs)'}`,
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors"
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all',
                    isOpen && 'animate-pop-in'
                  )}
                  style={{
                    background: isOpen ? 'var(--grad-brand)' : 'var(--surface-4)',
                    color: isOpen ? '#fff' : 'var(--text-3)',
                    boxShadow: isOpen ? 'var(--glow-sm)' : 'none',
                  }}
                >
                  {s.icon || i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                    {s.title}
                  </p>
                  {s.time && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
                      ⏱ {s.time}
                    </p>
                  )}
                </div>
                <span
                  className="text-sm transition-transform duration-300"
                  style={{
                    color: 'var(--purple-glow)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                >
                  →
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pl-14 animate-slide-in-left">
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    {s.body}
                  </div>
                  {s.tip && (
                    <div
                      className="mt-3 p-3 rounded-lg text-xs flex items-start gap-2"
                      style={{
                        background: 'rgba(124,58,237,0.08)',
                        border: '1px solid var(--border-sm)',
                        color: 'var(--text-2)',
                      }}
                    >
                      <span>💡</span>
                      <span>
                        <strong style={{ color: 'var(--purple-glow)' }}>Tip:</strong> {s.tip}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
