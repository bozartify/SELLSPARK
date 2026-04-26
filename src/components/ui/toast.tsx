'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Variant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: Variant;
}

interface ToastCtx {
  toast: (t: Omit<Toast, 'id'>) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const ICONS: Record<Variant, string> = {
  default: '✨',
  success: '✓',
  error:   '✕',
  warning: '!',
  info:    'i',
};

const ACCENTS: Record<Variant, string> = {
  default: '#7c3aed',
  success: '#22c55e',
  error:   '#ef4444',
  warning: '#f59e0b',
  info:    '#60a5fa',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2 w-[340px] pointer-events-none">
        {toasts.map((t) => {
          const v = t.variant || 'default';
          const accent = ACCENTS[v];
          return (
            <div
              key={t.id}
              className="pointer-events-auto animate-slide-in-right rounded-xl p-3 flex items-start gap-3 relative overflow-hidden"
              style={{
                background: 'rgba(16,12,30,0.9)',
                backdropFilter: 'blur(24px)',
                border: `1px solid ${accent}44`,
                boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 20px ${accent}33`,
              }}
            >
              <div className="absolute top-0 left-0 h-full w-[3px]" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
              >
                {ICONS[v]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{t.title}</p>
                {t.description && (
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>{t.description}</p>
                )}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-3)' }}
              >
                ✕
              </button>
              <div
                className="absolute bottom-0 left-0 h-[2px]"
                style={{
                  background: accent,
                  animation: 'toast-progress 4s linear forwards',
                  width: '100%',
                  transformOrigin: 'left',
                }}
              />
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
