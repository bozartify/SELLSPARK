/**
 * @module pwa-engine
 * @description PWA/Mobile features: push notification scheduling with A/B variants,
 * offline-first data sync with conflict resolution, app shell pre-rendering,
 * biometric auth challenges, install prompt management, and VAPID key utilities.
 */

// ─── Push Notifications ────────────────────────────────────────────────────────

export type NotificationStatus = 'scheduled' | 'sent' | 'failed';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  scheduledAt: number; // unix ms
  segment: string;
  status: NotificationStatus;
  openRate?: number; // 0–1, present only when status === 'sent'
}

export const NOTIFICATION_SEGMENTS = [
  'all_subscribers',
  'active_last_7d',
  'new_this_month',
  'high_ltv',
  'at_risk_churn',
  'product_purchasers',
] as const;

export type NotificationSegment = (typeof NOTIFICATION_SEGMENTS)[number];

const notificationStore: PushNotification[] = [];

export function schedulePushNotification(
  notif: Omit<PushNotification, 'id' | 'status'>
): PushNotification {
  const record: PushNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'scheduled',
  };
  notificationStore.push(record);
  return record;
}

export function generateNotificationVariants(topic: string, count: number): string[] {
  const templates: Record<string, string[]> = {
    sale: [
      `🔥 {topic} — limited time offer inside`,
      `Your exclusive {topic} deal expires soon`,
      `Don't miss out: {topic} savings await`,
      `Last chance: {topic} at a special price`,
      `{topic} — members-only pricing unlocked`,
    ],
    content: [
      `New {topic} drop — be the first to see it`,
      `Fresh {topic} content just for you`,
      `You asked, we delivered: {topic} is live`,
      `{topic} update: check what's new`,
      `Your {topic} digest is ready`,
    ],
    default: [
      `{topic} — tap to learn more`,
      `Update on {topic}`,
      `Something new about {topic}`,
      `Your {topic} notification`,
      `{topic} — don't miss this`,
    ],
  };

  const key = Object.keys(templates).find((k) => topic.toLowerCase().includes(k)) ?? 'default';
  const pool = templates[key];
  const variants: string[] = [];

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    variants.push(pool[i].replace(/{topic}/g, topic));
  }

  // If more variants requested than pool has, generate numbered extras
  for (let i = pool.length; i < count; i++) {
    variants.push(`${topic} — variant ${i + 1}`);
  }

  return variants;
}

// ─── Offline-First Data Sync ───────────────────────────────────────────────────

export type DBOperation = 'INSERT' | 'UPDATE' | 'DELETE';
export type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge';

export interface OfflineChange {
  id: string;
  table: string;
  operation: DBOperation;
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: OfflineChange[];
}

const syncQueue: OfflineChange[] = [];

export function queueOfflineChange(
  change: Omit<OfflineChange, 'id' | 'synced'>
): OfflineChange {
  const record: OfflineChange = {
    ...change,
    id: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    synced: false,
  };
  syncQueue.push(record);
  return record;
}

export async function processSyncQueue(queue: OfflineChange[]): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, failed: 0, conflicts: [] };

  for (const change of queue) {
    // Simulate network attempt — in production this calls the real API
    const success = Math.random() > 0.1; // 90% success rate simulation
    const hasConflict = !change.synced && Math.random() < 0.15;

    if (hasConflict) {
      result.conflicts.push(change);
    } else if (success) {
      change.synced = true;
      result.synced++;
    } else {
      result.failed++;
    }
  }

  return result;
}

export function resolveConflict(
  local: OfflineChange,
  remote: OfflineChange,
  strategy: ConflictStrategy
): OfflineChange {
  switch (strategy) {
    case 'server-wins':
      return { ...remote, synced: true };

    case 'client-wins':
      return { ...local, synced: false }; // will be re-synced

    case 'merge': {
      // Shallow merge: remote fields take precedence for non-null values,
      // but local additions (keys not in remote) are preserved.
      const mergedData = { ...local.data };
      for (const [key, value] of Object.entries(remote.data)) {
        if (value !== null && value !== undefined) {
          mergedData[key] = value;
        }
      }
      return {
        ...local,
        data: mergedData,
        timestamp: Math.max(local.timestamp, remote.timestamp),
        synced: false,
      };
    }
  }
}

// ─── App Shell Pre-rendering ──────────────────────────────────────────────────

export interface AppShellRoute {
  path: string;
  componentName: string;
  preloadPriority: 'critical' | 'high' | 'medium' | 'low';
  estimatedKB: number;
  dependencies: string[];
}

export const APP_SHELL_ROUTES: AppShellRoute[] = [
  {
    path: '/',
    componentName: 'LandingPage',
    preloadPriority: 'critical',
    estimatedKB: 28,
    dependencies: ['react', 'framer-motion'],
  },
  {
    path: '/dashboard',
    componentName: 'DashboardHome',
    preloadPriority: 'critical',
    estimatedKB: 52,
    dependencies: ['react', 'recharts', 'swr'],
  },
  {
    path: '/dashboard/products',
    componentName: 'ProductsPage',
    preloadPriority: 'high',
    estimatedKB: 38,
    dependencies: ['react', 'swr'],
  },
  {
    path: '/dashboard/analytics',
    componentName: 'AnalyticsPage',
    preloadPriority: 'high',
    estimatedKB: 74,
    dependencies: ['react', 'recharts', 'date-fns'],
  },
  {
    path: '/dashboard/memberships',
    componentName: 'MembershipsPage',
    preloadPriority: 'high',
    estimatedKB: 44,
    dependencies: ['react', 'stripe-js'],
  },
  {
    path: '/dashboard/content',
    componentName: 'ContentPage',
    preloadPriority: 'medium',
    estimatedKB: 61,
    dependencies: ['react', 'tiptap', 'swr'],
  },
  {
    path: '/dashboard/community',
    componentName: 'CommunityPage',
    preloadPriority: 'medium',
    estimatedKB: 56,
    dependencies: ['react', 'swr', 'socket.io-client'],
  },
  {
    path: '/dashboard/email',
    componentName: 'EmailPage',
    preloadPriority: 'medium',
    estimatedKB: 48,
    dependencies: ['react', 'tiptap'],
  },
  {
    path: '/dashboard/store',
    componentName: 'StorePage',
    preloadPriority: 'medium',
    estimatedKB: 42,
    dependencies: ['react', 'stripe-js', 'swr'],
  },
  {
    path: '/dashboard/settings',
    componentName: 'SettingsPage',
    preloadPriority: 'low',
    estimatedKB: 33,
    dependencies: ['react', 'react-hook-form'],
  },
  {
    path: '/dashboard/pwa-mobile',
    componentName: 'PWAMobilePage',
    preloadPriority: 'low',
    estimatedKB: 29,
    dependencies: ['react'],
  },
  {
    path: '/dashboard/wallet',
    componentName: 'WalletPage',
    preloadPriority: 'low',
    estimatedKB: 37,
    dependencies: ['react', 'ethers', 'swr'],
  },
];

export function generatePreloadHints(routes: AppShellRoute[]): string {
  const sorted = [...routes].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.preloadPriority] - order[b.preloadPriority];
  });

  return sorted
    .map((route) => {
      const rel = route.preloadPriority === 'critical' ? 'preload' : 'prefetch';
      const as = 'script';
      const chunk = route.componentName.toLowerCase().replace(/page$/, '');
      return `<link rel="${rel}" href="/_next/static/chunks/${chunk}.js" as="${as}" />`;
    })
    .join('\n');
}

export function estimateShellSize(routes: AppShellRoute[]): number {
  return routes.reduce((total, route) => total + route.estimatedKB, 0);
}

// ─── Biometric Auth ────────────────────────────────────────────────────────────

export type BiometricType = 'fingerprint' | 'face' | 'voice';

export interface BiometricChallenge {
  challengeId: string;
  type: BiometricType;
  nonce: string;
  expiresAt: number; // unix ms
}

export function createBiometricChallenge(type: BiometricType): BiometricChallenge {
  const nonce = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  return {
    challengeId: `bio_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type,
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
}

export function verifyBiometricResponse(
  challenge: BiometricChallenge,
  response: string
): boolean {
  // In production this would call the WebAuthn Authenticator assertion API.
  // Here we validate structural correctness and expiry only.
  if (Date.now() > challenge.expiresAt) return false;
  if (!response || response.length < 16) return false;
  // Simulate ~95% success for a valid, non-expired response
  return Math.random() > 0.05;
}

export function getBiometricCapabilities(): BiometricType[] {
  // In a real browser environment this calls PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  // and navigator.credentials.get(). Here we return a deterministic simulation.
  if (typeof window === 'undefined') return [];
  const ua = navigator.userAgent.toLowerCase();
  const capabilities: BiometricType[] = ['fingerprint'];
  if (/iphone|mac/.test(ua)) capabilities.push('face');
  if (/android/.test(ua)) capabilities.push('face');
  return capabilities;
}

// ─── PWA Install Prompt ────────────────────────────────────────────────────────

export type PWAPlatform = 'ios' | 'android' | 'desktop';

export interface PWAInstallState {
  canInstall: boolean;
  platform: PWAPlatform;
  isInstalled: boolean;
  dismissed: boolean;
  installCount: number;
}

export function getPWAInstallState(): PWAInstallState {
  if (typeof window === 'undefined') {
    return { canInstall: false, platform: 'desktop', isInstalled: false, dismissed: false, installCount: 0 };
  }

  const ua = navigator.userAgent.toLowerCase();
  let platform: PWAPlatform = 'desktop';
  if (/iphone|ipad/.test(ua)) platform = 'ios';
  else if (/android/.test(ua)) platform = 'android';

  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);

  const dismissed = sessionStorage.getItem('pwa_install_dismissed') === 'true';
  const installCount = parseInt(localStorage.getItem('pwa_install_count') ?? '0', 10);

  // On iOS the beforeinstallprompt event never fires; we show our own prompt.
  const canInstall = !isInstalled && !dismissed && platform !== 'ios'
    ? true
    : platform === 'ios' && !isInstalled && !dismissed;

  return { canInstall, platform, isInstalled, dismissed, installCount };
}

export function generateInstallPromptCopy(platform: PWAPlatform): {
  title: string;
  subtitle: string;
  cta: string;
} {
  const copy: Record<PWAPlatform, { title: string; subtitle: string; cta: string }> = {
    ios: {
      title: 'Add SellSpark to your Home Screen',
      subtitle: 'Tap the Share button, then "Add to Home Screen" for instant access — no App Store needed.',
      cta: 'Show me how',
    },
    android: {
      title: 'Install SellSpark',
      subtitle: 'Get the full app experience — works offline, loads instantly, no Play Store required.',
      cta: 'Install App',
    },
    desktop: {
      title: 'Install SellSpark on your desktop',
      subtitle: 'One click to pin SellSpark to your taskbar. Opens in its own window, always ready.',
      cta: 'Install Now',
    },
  };

  return copy[platform];
}

// ─── Web Push / VAPID ─────────────────────────────────────────────────────────

export interface VAPIDKeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generates a simulated VAPID key pair.
 * In production, use the `web-push` npm package: `webpush.generateVAPIDKeys()`.
 */
export function generateVAPIDKeys(): VAPIDKeyPair {
  const randomBase64url = (byteLength: number) =>
    btoa(
      String.fromCharCode(...Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256)))
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  return {
    publicKey: randomBase64url(65),  // uncompressed EC P-256 public key
    privateKey: randomBase64url(32), // EC P-256 private scalar
  };
}

export function subscriptionToBase64(sub: PushSubscription): string {
  return btoa(JSON.stringify(sub.toJSON()));
}

export function buildPushPayload(notif: PushNotification): string {
  return JSON.stringify({
    title: notif.title,
    body: notif.body,
    icon: notif.icon,
    data: {
      notificationId: notif.id,
      segment: notif.segment,
      scheduledAt: notif.scheduledAt,
    },
    timestamp: Date.now(),
  });
}
