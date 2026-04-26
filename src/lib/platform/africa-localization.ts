// ============================================================
// Africa Localization — SellSpark Platform
// No external dependencies. Pure TypeScript.
// ============================================================

// ---------------------------------------------------------------------------
// African Languages
// ---------------------------------------------------------------------------

export type AfricanLanguageCode =
  | 'sw' | 'yo' | 'ha' | 'am' | 'zu' | 'ig'
  | 'tw' | 'wo' | 'so' | 'om' | 'sn' | 'ti';

export interface AfricanLanguage {
  code: AfricanLanguageCode;
  name: string;
  region: string;
  speakers: number; // millions
  rtl: boolean;
  scriptSystem: string;
}

export const AFRICAN_LANGUAGES: AfricanLanguage[] = [
  { code: 'sw', name: 'Swahili',   region: 'East Africa',    speakers: 200, rtl: false, scriptSystem: 'Latin'    },
  { code: 'yo', name: 'Yoruba',    region: 'West Africa',    speakers: 45,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'ha', name: 'Hausa',     region: 'West Africa',    speakers: 70,  rtl: false, scriptSystem: 'Latin/Ajami' },
  { code: 'am', name: 'Amharic',   region: 'East Africa',    speakers: 57,  rtl: false, scriptSystem: 'Ethiopic' },
  { code: 'zu', name: 'Zulu',      region: 'Southern Africa',speakers: 27,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'ig', name: 'Igbo',      region: 'West Africa',    speakers: 44,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'tw', name: 'Twi',       region: 'West Africa',    speakers: 22,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'wo', name: 'Wolof',     region: 'West Africa',    speakers: 12,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'so', name: 'Somali',    region: 'East Africa',    speakers: 22,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'om', name: 'Oromo',     region: 'East Africa',    speakers: 37,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'sn', name: 'Shona',     region: 'Southern Africa',speakers: 15,  rtl: false, scriptSystem: 'Latin'    },
  { code: 'ti', name: 'Tigrinya',  region: 'East Africa',    speakers: 9,   rtl: false, scriptSystem: 'Ethiopic' },
];

// ---------------------------------------------------------------------------
// UI String Translations
// ---------------------------------------------------------------------------

export const UI_STRINGS: Record<string, Record<string, string>> = {
  welcome:       { en: 'Welcome',           sw: 'Karibu',           yo: 'Kaabo',            ha: 'Barka da zuwa'       },
  dashboard:     { en: 'Dashboard',         sw: 'Dashibodi',        yo: 'Dashibodu',        ha: 'Dashibod'            },
  profile:       { en: 'Profile',           sw: 'Wasifu',           yo: 'Profaili',         ha: 'Bayanin kai'         },
  settings:      { en: 'Settings',          sw: 'Mipangilio',       yo: 'Eto',              ha: 'Saiti'               },
  earnings:      { en: 'Earnings',          sw: 'Mapato',           yo: 'Ere',              ha: 'Kudin shiga'         },
  subscribers:   { en: 'Subscribers',       sw: 'Wanachama',        yo: 'Awon alabapin',    ha: 'Masu biyan kuɗi'     },
  content:       { en: 'Content',           sw: 'Maudhui',          yo: 'Akoonu',           ha: 'Abun ciki'           },
  upload:        { en: 'Upload',            sw: 'Pakia',            yo: 'Gbe soke',         ha: 'Loda'                },
  logout:        { en: 'Logout',            sw: 'Toka',             yo: 'Jade',             ha: 'Fita'                },
  notifications: { en: 'Notifications',     sw: 'Arifa',            yo: 'Awon ifitonileti', ha: 'Sanarwa'             },
  payment:       { en: 'Payment',           sw: 'Malipo',           yo: 'Isanwo',           ha: 'Biya'                },
  support:       { en: 'Support',           sw: 'Msaada',           yo: 'Atilẹyin',         ha: 'Taimako'             },
};

/**
 * Returns the translated string for key+langCode, falling back to English,
 * then to the key itself if no translation exists.
 */
export function getLocalizedString(key: string, langCode: string): string {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  return entry[langCode] ?? entry['en'] ?? key;
}

/**
 * Reads navigator.language / navigator.languages and attempts to match an
 * African language. Returns null when running server-side or no match.
 */
export function detectBrowserLanguage(): AfricanLanguage | null {
  if (typeof navigator === 'undefined') return null;

  const candidates: string[] = [];
  if (navigator.languages && navigator.languages.length > 0) {
    candidates.push(...Array.from(navigator.languages));
  } else if (navigator.language) {
    candidates.push(navigator.language);
  }

  for (const raw of candidates) {
    const base = raw.split('-')[0].toLowerCase() as AfricanLanguageCode;
    const match = AFRICAN_LANGUAGES.find((l) => l.code === base);
    if (match) return match;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mobile Money
// ---------------------------------------------------------------------------

export type MobileMoneyProvider = 'mpesa' | 'mtn' | 'airtel' | 'orange' | 'tigo';

export interface MobileMoneyAccount {
  accountId: string;
  provider: MobileMoneyProvider;
  msisdn: string;
  balance: number;
  currency: string;
  tier: 'basic' | 'premium' | 'merchant';
}

export interface MobileMoneyTransaction {
  txId: string;
  type: 'send' | 'receive' | 'withdraw' | 'deposit' | 'payment';
  amount: number;
  currency: string;
  counterparty: string;
  fee: number;
  timestamp: number; // unix ms
  status: 'success' | 'pending' | 'failed';
}

export function getMobileMoneyStats(transactions: MobileMoneyTransaction[]): {
  totalIn: number;
  totalOut: number;
  fees: number;
  netFlow: number;
  topProviders: string[];
} {
  let totalIn = 0;
  let totalOut = 0;
  let fees = 0;
  const providerCount: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.status !== 'success') continue;
    if (tx.type === 'receive' || tx.type === 'deposit') {
      totalIn += tx.amount;
    } else if (tx.type === 'send' || tx.type === 'withdraw' || tx.type === 'payment') {
      totalOut += tx.amount;
    }
    fees += tx.fee;

    // derive provider from counterparty prefix convention e.g. "mpesa:+254…"
    const providerKey = tx.counterparty.split(':')[0] ?? 'unknown';
    providerCount[providerKey] = (providerCount[providerKey] ?? 0) + 1;
  }

  const topProviders = Object.entries(providerCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([p]) => p);

  return { totalIn, totalOut, fees, netFlow: totalIn - totalOut - fees, topProviders };
}

export function generateMockMobileMoneyData(): {
  accounts: MobileMoneyAccount[];
  transactions: MobileMoneyTransaction[];
} {
  const accounts: MobileMoneyAccount[] = [
    { accountId: 'acc_001', provider: 'mpesa',  msisdn: '+254712345678', balance: 12450.50, currency: 'KES', tier: 'merchant' },
    { accountId: 'acc_002', provider: 'mtn',    msisdn: '+233241234567', balance: 3820.00,  currency: 'GHS', tier: 'premium'  },
    { accountId: 'acc_003', provider: 'airtel', msisdn: '+255781234567', balance: 89500.00, currency: 'TZS', tier: 'basic'    },
    { accountId: 'acc_004', provider: 'orange', msisdn: '+221771234567', balance: 25000.00, currency: 'XOF', tier: 'premium'  },
    { accountId: 'acc_005', provider: 'tigo',   msisdn: '+255621234567', balance: 47200.00, currency: 'TZS', tier: 'merchant' },
  ];

  const now = Date.now();
  const transactions: MobileMoneyTransaction[] = [
    { txId: 'tx_001', type: 'receive',  amount: 5000,   currency: 'KES', counterparty: 'mpesa:+254798765432', fee: 0,    timestamp: now - 3600000,  status: 'success' },
    { txId: 'tx_002', type: 'payment',  amount: 1200,   currency: 'KES', counterparty: 'mpesa:merchant_shop', fee: 30,   timestamp: now - 7200000,  status: 'success' },
    { txId: 'tx_003', type: 'deposit',  amount: 10000,  currency: 'GHS', counterparty: 'mtn:bank_transfer',  fee: 0,    timestamp: now - 86400000, status: 'success' },
    { txId: 'tx_004', type: 'send',     amount: 2500,   currency: 'GHS', counterparty: 'mtn:+233501234567',  fee: 50,   timestamp: now - 172800000,status: 'success' },
    { txId: 'tx_005', type: 'withdraw', amount: 50000,  currency: 'TZS', counterparty: 'airtel:agent_TZ01',  fee: 500,  timestamp: now - 259200000,status: 'success' },
    { txId: 'tx_006', type: 'receive',  amount: 15000,  currency: 'XOF', counterparty: 'orange:+221701234', fee: 0,    timestamp: now - 345600000,status: 'success' },
    { txId: 'tx_007', type: 'payment',  amount: 8000,   currency: 'XOF', counterparty: 'orange:biz_dakar',  fee: 160,  timestamp: now - 432000000,status: 'failed'  },
    { txId: 'tx_008', type: 'send',     amount: 20000,  currency: 'TZS', counterparty: 'tigo:+255621000001', fee: 200, timestamp: now - 518400000,status: 'pending' },
    { txId: 'tx_009', type: 'receive',  amount: 3500,   currency: 'KES', counterparty: 'mpesa:+254733000001', fee: 0,  timestamp: now - 604800000,status: 'success' },
    { txId: 'tx_010', type: 'deposit',  amount: 25000,  currency: 'TZS', counterparty: 'tigo:atm_DSM',      fee: 0,   timestamp: now - 691200000,status: 'success' },
  ];

  return { accounts, transactions };
}

// ---------------------------------------------------------------------------
// USSD Builder
// ---------------------------------------------------------------------------

export interface USSDOption {
  key: string;
  label: string;
  action: 'navigate' | 'input' | 'api-call';
  target?: string;
}

export interface USSDMenu {
  menuId: string;
  title: string;
  options: USSDOption[];
}

export interface USSDSession {
  sessionId: string;
  phoneNumber: string;
  currentMenu: string;
  history: string[];
  data: Record<string, string>;
}

/** Index an array of menus by menuId for O(1) lookup. */
export function buildUSSDFlow(menus: USSDMenu[]): Record<string, USSDMenu> {
  return menus.reduce<Record<string, USSDMenu>>((acc, menu) => {
    acc[menu.menuId] = menu;
    return acc;
  }, {});
}

/**
 * Process a single USSD input digit/string against the current session state.
 * Returns the updated session (immutably cloned).
 */
export function processUSSDInput(
  session: USSDSession,
  input: string,
  menus: Record<string, USSDMenu>,
): USSDSession {
  const currentMenu = menus[session.currentMenu];
  if (!currentMenu) return session;

  const trimmed = input.trim();
  const option = currentMenu.options.find((o) => o.key === trimmed);

  if (!option) return session; // invalid input — stay on same menu

  const newHistory = [...session.history, session.currentMenu];
  let nextMenu = session.currentMenu;
  const newData = { ...session.data };

  if (option.action === 'navigate' && option.target) {
    nextMenu = option.target;
  } else if (option.action === 'input' && option.target) {
    newData[option.target] = trimmed;
  } else if (option.action === 'api-call') {
    // In a real impl this would trigger a backend call; here we just record it
    newData['last_api_call'] = option.target ?? option.key;
  }

  return { ...session, currentMenu: nextMenu, history: newHistory, data: newData };
}

/** Derive a USSD short code from a service name deterministically. */
export function generateUSSDShortCode(service: string): string {
  const base = service
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);
  const suffix = base
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100;
  return `*${suffix + 100}#`;
}

export const SAMPLE_USSD_MENUS: USSDMenu[] = [
  {
    menuId: 'main',
    title: 'SellSpark\n1. My Earnings\n2. My Content\n3. Subscribers\n0. Exit',
    options: [
      { key: '1', label: 'My Earnings',   action: 'navigate', target: 'earnings'    },
      { key: '2', label: 'My Content',    action: 'navigate', target: 'content'     },
      { key: '3', label: 'Subscribers',   action: 'navigate', target: 'subscribers' },
      { key: '0', label: 'Exit',          action: 'api-call', target: 'exit'        },
    ],
  },
  {
    menuId: 'earnings',
    title: 'Earnings\n1. View Balance\n2. Withdraw\n9. Back',
    options: [
      { key: '1', label: 'View Balance', action: 'api-call',  target: 'get_balance' },
      { key: '2', label: 'Withdraw',     action: 'navigate',  target: 'withdraw'    },
      { key: '9', label: 'Back',         action: 'navigate',  target: 'main'        },
    ],
  },
  {
    menuId: 'withdraw',
    title: 'Enter amount to withdraw:',
    options: [
      { key: '1', label: 'Confirm withdraw', action: 'input',    target: 'withdraw_amount' },
      { key: '9', label: 'Back',             action: 'navigate', target: 'earnings'        },
    ],
  },
  {
    menuId: 'subscribers',
    title: 'Subscribers\n1. Total Count\n2. New This Month\n9. Back',
    options: [
      { key: '1', label: 'Total Count',     action: 'api-call', target: 'get_total_subs'    },
      { key: '2', label: 'New This Month',  action: 'api-call', target: 'get_monthly_subs'  },
      { key: '9', label: 'Back',            action: 'navigate', target: 'main'              },
    ],
  },
];

// ---------------------------------------------------------------------------
// Low-Data Mode
// ---------------------------------------------------------------------------

export interface LowDataConfig {
  imagesDisabled: boolean;
  videoDisabled: boolean;
  fontsMinimal: boolean;
  animationsOff: boolean;
  compressionLevel: number; // 0–9
  estimatedSavingsKB: number;
}

/**
 * Compute a LowDataConfig based on the detected connection speed in kbps.
 * Thresholds:
 *   < 50 kbps  → full low-data (2G)
 *   50–256     → moderate low-data
 *   256–1000   → light optimisation
 *   > 1000     → no restrictions
 */
export function computeLowDataConfig(connectionKbps: number): LowDataConfig {
  if (connectionKbps < 50) {
    return {
      imagesDisabled: true,
      videoDisabled: true,
      fontsMinimal: true,
      animationsOff: true,
      compressionLevel: 9,
      estimatedSavingsKB: 2400,
    };
  }
  if (connectionKbps < 256) {
    return {
      imagesDisabled: false,
      videoDisabled: true,
      fontsMinimal: true,
      animationsOff: true,
      compressionLevel: 7,
      estimatedSavingsKB: 1200,
    };
  }
  if (connectionKbps < 1000) {
    return {
      imagesDisabled: false,
      videoDisabled: false,
      fontsMinimal: false,
      animationsOff: true,
      compressionLevel: 4,
      estimatedSavingsKB: 400,
    };
  }
  return {
    imagesDisabled: false,
    videoDisabled: false,
    fontsMinimal: false,
    animationsOff: false,
    compressionLevel: 0,
    estimatedSavingsKB: 0,
  };
}

/**
 * Strip HTML tags and collapse whitespace to produce a plain-text fallback
 * suitable for SMS / low-bandwidth rendering.
 */
export function generateTextFallback(richContent: string): string {
  return richContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Market Insights
// ---------------------------------------------------------------------------

export interface MarketInsight {
  country: string;
  countryCode: string;
  flagEmoji: string;
  gdpPerCapita: number;       // USD
  internetPenetration: number; // 0–100 %
  mobileMoneyAdoption: number; // 0–100 %
  avgRevenuePerUser: number;   // USD / month
  topPaymentMethod: string;
  growthRate: number;          // YoY % creator economy
}

export const MARKET_INSIGHTS: MarketInsight[] = [
  {
    country: 'Nigeria',       countryCode: 'NG', flagEmoji: '🇳🇬',
    gdpPerCapita: 2184,  internetPenetration: 55, mobileMoneyAdoption: 38,
    avgRevenuePerUser: 4.20, topPaymentMethod: 'Bank Transfer / Flutterwave', growthRate: 31,
  },
  {
    country: 'Kenya',         countryCode: 'KE', flagEmoji: '🇰🇪',
    gdpPerCapita: 2083,  internetPenetration: 85, mobileMoneyAdoption: 92,
    avgRevenuePerUser: 5.80, topPaymentMethod: 'M-Pesa', growthRate: 28,
  },
  {
    country: 'Ghana',         countryCode: 'GH', flagEmoji: '🇬🇭',
    gdpPerCapita: 2362,  internetPenetration: 58, mobileMoneyAdoption: 71,
    avgRevenuePerUser: 3.90, topPaymentMethod: 'MTN Mobile Money', growthRate: 25,
  },
  {
    country: 'South Africa',  countryCode: 'ZA', flagEmoji: '🇿🇦',
    gdpPerCapita: 6994,  internetPenetration: 72, mobileMoneyAdoption: 45,
    avgRevenuePerUser: 9.50, topPaymentMethod: 'Card / EFT', growthRate: 18,
  },
  {
    country: 'Tanzania',      countryCode: 'TZ', flagEmoji: '🇹🇿',
    gdpPerCapita: 1136,  internetPenetration: 47, mobileMoneyAdoption: 78,
    avgRevenuePerUser: 2.10, topPaymentMethod: 'Tigo Pesa / Airtel Money', growthRate: 22,
  },
  {
    country: 'Ethiopia',      countryCode: 'ET', flagEmoji: '🇪🇹',
    gdpPerCapita: 1020,  internetPenetration: 22, mobileMoneyAdoption: 35,
    avgRevenuePerUser: 1.40, topPaymentMethod: 'Telebirr', growthRate: 34,
  },
  {
    country: 'Egypt',         countryCode: 'EG', flagEmoji: '🇪🇬',
    gdpPerCapita: 3876,  internetPenetration: 72, mobileMoneyAdoption: 40,
    avgRevenuePerUser: 6.10, topPaymentMethod: 'Fawry / Card', growthRate: 20,
  },
  {
    country: 'Senegal',       countryCode: 'SN', flagEmoji: '🇸🇳',
    gdpPerCapita: 1641,  internetPenetration: 64, mobileMoneyAdoption: 65,
    avgRevenuePerUser: 2.80, topPaymentMethod: 'Orange Money', growthRate: 26,
  },
  {
    country: "Côte d'Ivoire", countryCode: 'CI', flagEmoji: '🇨🇮',
    gdpPerCapita: 2590,  internetPenetration: 52, mobileMoneyAdoption: 68,
    avgRevenuePerUser: 3.20, topPaymentMethod: 'MTN / Orange Money', growthRate: 24,
  },
  {
    country: 'Rwanda',        countryCode: 'RW', flagEmoji: '🇷🇼',
    gdpPerCapita: 934,   internetPenetration: 61, mobileMoneyAdoption: 80,
    avgRevenuePerUser: 2.50, topPaymentMethod: 'MTN Mobile Money', growthRate: 30,
  },
];

/**
 * Rank markets by composite opportunity score:
 *   score = (internetPenetration * 0.25)
 *         + (mobileMoneyAdoption * 0.25)
 *         + (growthRate          * 0.30)
 *         + (avgRevenuePerUser   * 2.0)   // scaled to be comparable
 *         + (gdpPerCapita / 500  * 0.20)  // normalised
 */
export function rankMarketsByOpportunity(insights: MarketInsight[]): MarketInsight[] {
  const score = (m: MarketInsight): number =>
    m.internetPenetration * 0.25 +
    m.mobileMoneyAdoption * 0.25 +
    m.growthRate          * 0.30 +
    m.avgRevenuePerUser   * 2.0  +
    (m.gdpPerCapita / 500) * 0.20;

  return [...insights].sort((a, b) => score(b) - score(a));
}
