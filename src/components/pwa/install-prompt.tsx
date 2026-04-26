'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
    else if (/android/.test(ua)) setPlatform('android');
    else setPlatform('desktop');

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show custom prompt after 30 seconds or 2 page views
      const visits = parseInt(localStorage.getItem('ss-visits') || '0') + 1;
      localStorage.setItem('ss-visits', visits.toString());
      if (visits >= 2) setShowPrompt(true);
      else setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setShowPrompt(false); });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
    setShowPrompt(false);
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem('ss-install-dismissed', Date.now().toString());
  }

  if (installed || !showPrompt) return null;

  // iOS doesn't support beforeinstallprompt — show manual instructions
  if (platform === 'ios') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
        <Card className="p-4 bg-white dark:bg-gray-900 shadow-2xl border-violet-200 dark:border-violet-800">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📱</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install SellSpark</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tap <span className="inline-flex items-center"><svg className="w-3 h-3 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span> then &quot;Add to Home Screen&quot; for the full app experience.
              </p>
            </div>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <Card className="p-4 bg-white dark:bg-gray-900 shadow-2xl border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-2xl shrink-0">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Install SellSpark</h3>
            <p className="text-xs text-gray-500">Get instant access, offline support & push notifications</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleDismiss}>Later</Button>
            <Button size="sm" onClick={handleInstall}>Install</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
