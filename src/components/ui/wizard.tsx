'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  content: ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete?: () => void;
  onCancel?: () => void;
  orientation?: 'horizontal' | 'vertical';
  completeLabel?: string;
}

export function Wizard({
  steps,
  onComplete,
  onCancel,
  orientation = 'horizontal',
  completeLabel = 'Complete ✓',
}: WizardProps) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const pct = Math.round(((current + (done.has(current) ? 1 : 0)) / steps.length) * 100);

  async function next() {
    if (step.validate) {
      const ok = await step.validate();
      if (!ok) return;
    }
    const nd = new Set(done);
    nd.add(current);
    setDone(nd);
    if (isLast) {
      onComplete?.();
    } else {
      setCurrent(current + 1);
    }
  }

  const stepsBar = (
    <div
      className={cn(
        orientation === 'horizontal'
          ? 'flex items-center gap-2 flex-wrap'
          : 'flex flex-col gap-2'
      )}
    >
      {steps.map((s, i) => {
        const isActive = i === current;
        const isDone = done.has(i) && i !== current;
        return (
          <button
            key={s.id}
            onClick={() => i <= current || done.has(i - 1) ? setCurrent(i) : null}
            className={cn('fr-step text-left', isActive && 'active', isDone && 'done')}
            style={{ flex: orientation === 'horizontal' ? '1 1 auto' : 'none' }}
          >
            <span className="fr-step-num">{isDone ? '✓' : s.icon || i + 1}</span>
            <span className="truncate">{s.title}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fr-card p-6 space-y-5">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: 'var(--text-3)' }}>
            Step {current + 1} of {steps.length}
          </span>
          <span className="fr-gradient-text-purple font-semibold">{pct}%</span>
        </div>
        <div className="fr-progress">
          <div className="fr-progress-bar" style={{ ['--fill' as never]: `${pct}%`, width: `${pct}%` }} />
        </div>
      </div>

      {stepsBar}

      {/* Step content */}
      <div key={step.id} className="animate-wizard-step space-y-3 pt-2">
        <div className="flex items-start gap-3">
          {step.icon && (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 animate-pop-in"
              style={{ background: 'var(--grad-brand)', boxShadow: 'var(--glow-sm)' }}
            >
              {step.icon}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>
              {step.title}
            </h3>
            {step.description && (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                {step.description}
              </p>
            )}
          </div>
        </div>
        <div className="pt-2">{step.content}</div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-xs)' }}>
        <div className="flex gap-2 pt-4">
          {onCancel && (
            <button onClick={onCancel} className="fr-btn-ghost text-sm">
              Cancel
            </button>
          )}
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="fr-btn-outline text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
        </div>
        <button onClick={next} className="fr-btn text-sm mt-4">
          {isLast ? completeLabel : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
