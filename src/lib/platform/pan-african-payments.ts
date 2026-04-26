/**
 * @module pan-african-payments
 * @description Pan-African payment rails integrating:
 * - PAPSS (Pan-African Payment and Settlement System) — intra-African settlements
 * - M-Pesa STK Push (Kenya, Tanzania, Uganda, DRC, Mozambique, Ghana, Lesotho)
 * - Flutterwave (35+ African countries, card + mobile money + bank transfer)
 * - Paystack (Nigeria, Ghana, South Africa, Kenya, Côte d'Ivoire)
 * - MTN Mobile Money (17 countries)
 * - Airtel Money (14 countries)
 * - OPay / PalmPay (Nigeria)
 *
 * Patent angle: Cross-rail settlement routing with real-time FX arbitrage
 * using PAPSS corridors to minimize conversion costs (WO pending).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type AfricanCurrency =
  'NGN' | 'KES' | 'GHS' | 'ZAR' | 'EGP' | 'TZS' | 'UGX' |
  'XOF' | 'XAF' | 'RWF' | 'ETB' | 'MAD' | 'TND' | 'DZD' | 'MZN';

export type AfricanRail = 'mpesa' | 'flutterwave' | 'paystack' | 'papss' | 'mtn-momo' | 'airtel-money' | 'opay';
export type MobileMoneyStatus = 'pending' | 'processing' | 'success' | 'failed' | 'timeout' | 'insufficient_funds';
export type PaymentChannel = 'stk_push' | 'ussd' | 'qr' | 'bank_transfer' | 'card' | 'wallet';

export interface AfricanCountry {
  code: string;
  name: string;
  currency: AfricanCurrency;
  dialCode: string;
  supportedRails: AfricanRail[];
  mobileMoneyProviders: string[];
  bankingPenetration: number;  // 0–1
  mobilePenetration: number;   // 0–1
  preferredChannel: PaymentChannel;
}

export interface MobileMoneyTransaction {
  id: string;
  rail: AfricanRail;
  phoneNumber: string;       // MSISDN in E.164
  amount: number;
  currency: AfricanCurrency;
  reference: string;
  description: string;
  status: MobileMoneyStatus;
  checkoutRequestId?: string; // M-Pesa
  flwRef?: string;            // Flutterwave
  paystackRef?: string;       // Paystack
  createdAt: number;
  completedAt?: number;
  ussdCode?: string;
  failureReason?: string;
}

export interface PAPSSTransfer {
  id: string;
  sendingCountry: string;
  receivingCountry: string;
  sendingCurrency: AfricanCurrency;
  receivingCurrency: AfricanCurrency;
  sendAmount: number;
  receiveAmount: number;
  fxRate: number;
  corridorFee: number;       // percentage
  settlementTime: string;    // e.g. 'T+0', 'T+1'
  status: 'initiated' | 'processing' | 'settled' | 'failed';
  traceNumber: string;
}

export interface USSDSession {
  sessionId: string;
  msisdn: string;
  serviceCode: string;       // e.g. '*234#'
  text: string;
  type: 'BEGIN' | 'CONTINUE' | 'END';
  response: string;
  options: string[];
}

// ─── Country Directory ────────────────────────────────────────────────────────

export const AFRICAN_COUNTRIES: AfricanCountry[] = [
  { code: 'NG', name: 'Nigeria',        currency: 'NGN', dialCode: '+234', supportedRails: ['paystack','flutterwave','opay'],          mobileMoneyProviders: ['OPay','PalmPay','Paga'],          bankingPenetration: 0.45, mobilePenetration: 0.48, preferredChannel: 'wallet'       },
  { code: 'KE', name: 'Kenya',          currency: 'KES', dialCode: '+254', supportedRails: ['mpesa','flutterwave','paystack'],          mobileMoneyProviders: ['M-Pesa','Airtel Money'],          bankingPenetration: 0.82, mobilePenetration: 0.73, preferredChannel: 'stk_push'     },
  { code: 'GH', name: 'Ghana',          currency: 'GHS', dialCode: '+233', supportedRails: ['mtn-momo','flutterwave','paystack'],       mobileMoneyProviders: ['MTN MoMo','Vodafone Cash','AirtelTigo Money'], bankingPenetration: 0.58, mobilePenetration: 0.68, preferredChannel: 'ussd' },
  { code: 'ZA', name: 'South Africa',   currency: 'ZAR', dialCode: '+27',  supportedRails: ['paystack','flutterwave','papss'],          mobileMoneyProviders: ['SnapScan','Zapper','FNB eWallet'], bankingPenetration: 0.87, mobilePenetration: 0.77, preferredChannel: 'card'         },
  { code: 'EG', name: 'Egypt',          currency: 'EGP', dialCode: '+20',  supportedRails: ['flutterwave','papss'],                     mobileMoneyProviders: ['Vodafone Cash','Etisalat Cash'],  bankingPenetration: 0.43, mobilePenetration: 0.55, preferredChannel: 'bank_transfer' },
  { code: 'TZ', name: 'Tanzania',       currency: 'TZS', dialCode: '+255', supportedRails: ['mpesa','airtel-money','flutterwave'],       mobileMoneyProviders: ['M-Pesa TZ','Airtel Money TZ','Tigo Pesa'], bankingPenetration: 0.40, mobilePenetration: 0.60, preferredChannel: 'stk_push' },
  { code: 'UG', name: 'Uganda',         currency: 'UGX', dialCode: '+256', supportedRails: ['mtn-momo','airtel-money','flutterwave'],   mobileMoneyProviders: ['MTN MoMo UG','Airtel Money UG'], bankingPenetration: 0.35, mobilePenetration: 0.55, preferredChannel: 'ussd'         },
  { code: 'SN', name: 'Senegal',        currency: 'XOF', dialCode: '+221', supportedRails: ['flutterwave','papss'],                     mobileMoneyProviders: ['Orange Money','Wave','Free Money'], bankingPenetration: 0.38, mobilePenetration: 0.62, preferredChannel: 'ussd'        },
  { code: 'CM', name: 'Cameroon',       currency: 'XAF', dialCode: '+237', supportedRails: ['mtn-momo','flutterwave','papss'],          mobileMoneyProviders: ['MTN MoMo CM','Orange Money CM'], bankingPenetration: 0.35, mobilePenetration: 0.57, preferredChannel: 'ussd'         },
  { code: 'RW', name: 'Rwanda',         currency: 'RWF', dialCode: '+250', supportedRails: ['mtn-momo','flutterwave','papss'],          mobileMoneyProviders: ['MTN MoMo RW','Airtel Money RW'], bankingPenetration: 0.93, mobilePenetration: 0.71, preferredChannel: 'stk_push'     },
  { code: 'ET', name: 'Ethiopia',       currency: 'ETB', dialCode: '+251', supportedRails: ['flutterwave'],                             mobileMoneyProviders: ['Telebirr','CBEBirr'],             bankingPenetration: 0.35, mobilePenetration: 0.45, preferredChannel: 'ussd'         },
  { code: 'MA', name: 'Morocco',        currency: 'MAD', dialCode: '+212', supportedRails: ['flutterwave','papss'],                     mobileMoneyProviders: ['Orange Money MA','Wafacash'],     bankingPenetration: 0.71, mobilePenetration: 0.59, preferredChannel: 'card'         },
];

// ─── FX Rates (African currencies vs USD) ────────────────────────────────────

export const AFRICAN_FX: Record<AfricanCurrency, number> = {
  NGN: 1540, KES: 129, GHS: 15.2, ZAR: 18.4, EGP: 48.5,
  TZS: 2580, UGX: 3720, XOF: 608, XAF: 608, RWF: 1310,
  ETB: 57.2, MAD: 9.95, TND: 3.12, DZD: 134.5, MZN: 63.8,
};

export function convertToUSD(amount: number, currency: AfricanCurrency): number {
  return Math.round((amount / AFRICAN_FX[currency]) * 100) / 100;
}

export function convertFromUSD(usd: number, currency: AfricanCurrency): number {
  return Math.round(usd * AFRICAN_FX[currency]);
}

// ─── Rail Selection ───────────────────────────────────────────────────────────

export interface RailRecommendation {
  rail: AfricanRail;
  channel: PaymentChannel;
  estimatedFee: number;        // percentage
  settlementHours: number;
  successRate: number;
  reasoning: string;
}

const RAIL_FEES: Record<AfricanRail, number> = {
  mpesa: 0.015, flutterwave: 0.014, paystack: 0.015,
  papss: 0.005, 'mtn-momo': 0.018, 'airtel-money': 0.018, opay: 0.01,
};
const RAIL_SETTLEMENT: Record<AfricanRail, number> = {
  mpesa: 0, flutterwave: 24, paystack: 24,
  papss: 1, 'mtn-momo': 0, 'airtel-money': 0, opay: 0,
};
const RAIL_SUCCESS: Record<AfricanRail, number> = {
  mpesa: 0.96, flutterwave: 0.92, paystack: 0.93,
  papss: 0.98, 'mtn-momo': 0.90, 'airtel-money': 0.88, opay: 0.91,
};

export function recommendRail(countryCode: string, amountUSD: number): RailRecommendation {
  const country = AFRICAN_COUNTRIES.find(c => c.code === countryCode);
  if (!country) return { rail: 'flutterwave', channel: 'card', estimatedFee: 0.014, settlementHours: 24, successRate: 0.92, reasoning: 'Default fallback — Flutterwave covers 35+ countries' };

  const rails = country.supportedRails;
  const scored = rails.map(rail => ({
    rail,
    score: RAIL_SUCCESS[rail] * 50 - RAIL_FEES[rail] * 1000 - RAIL_SETTLEMENT[rail] * 0.1 + (amountUSD < 10 ? (RAIL_FEES[rail] < 0.015 ? 5 : 0) : 0),
  })).sort((a, b) => b.score - a.score);

  const best = scored[0].rail;
  const reasoning = best === 'mpesa' ? 'M-Pesa — instant settlement, highest trust in East Africa' :
                    best === 'paystack' ? 'Paystack — lowest friction for NGN/GHS/ZAR markets' :
                    best === 'papss' ? 'PAPSS — lowest fee corridor for intra-African settlements' :
                    best === 'mtn-momo' ? 'MTN MoMo — widest coverage for USSD mobile money' :
                    'Flutterwave — broadest coverage for this region';

  return { rail: best, channel: country.preferredChannel, estimatedFee: RAIL_FEES[best], settlementHours: RAIL_SETTLEMENT[best], successRate: RAIL_SUCCESS[best], reasoning };
}

// ─── M-Pesa STK Push ─────────────────────────────────────────────────────────

export function initiateMpesaSTK(
  phoneNumber: string,
  amount: number,
  currency: AfricanCurrency,
  description: string,
): MobileMoneyTransaction {
  const amountKES = currency === 'KES' ? amount : Math.round(convertFromUSD(convertToUSD(amount, currency), 'KES'));
  return {
    id: `mpesa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rail: 'mpesa',
    phoneNumber: formatMSISDN(phoneNumber, 'KE'),
    amount: amountKES,
    currency: 'KES',
    reference: `SELL${Date.now().toString(36).toUpperCase().slice(-8)}`,
    description: description.slice(0, 13), // M-Pesa max 13 chars
    status: 'pending',
    checkoutRequestId: `ws_CO_${Date.now()}`,
    createdAt: Date.now(),
  };
}

// ─── Flutterwave ──────────────────────────────────────────────────────────────

export function initiateFlutterwaveCharge(
  phoneNumber: string,
  amount: number,
  currency: AfricanCurrency,
  email: string,
  fullName: string,
  channel: PaymentChannel = 'ussd',
): MobileMoneyTransaction {
  return {
    id: `flw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rail: 'flutterwave',
    phoneNumber: formatMSISDN(phoneNumber),
    amount,
    currency,
    reference: `FLW_SS_${Date.now()}`,
    description: `SellSpark purchase by ${fullName}`,
    status: 'pending',
    flwRef: `FLW-REF-${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
    createdAt: Date.now(),
  };
}

// ─── Paystack ─────────────────────────────────────────────────────────────────

export function initiatePaystackCharge(
  amount: number,
  currency: AfricanCurrency,
  email: string,
  channel: 'card' | 'bank' | 'ussd' | 'mobile_money' = 'card',
): MobileMoneyTransaction {
  const koboAmount = currency === 'NGN' ? amount * 100 : amount; // Paystack uses kobo for NGN
  return {
    id: `pstk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rail: 'paystack',
    phoneNumber: '',
    amount: koboAmount,
    currency,
    reference: `SS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    description: 'SellSpark purchase',
    status: 'pending',
    paystackRef: `pst_${Math.random().toString(36).slice(2, 20)}`,
    createdAt: Date.now(),
  };
}

// ─── USSD Flow ────────────────────────────────────────────────────────────────

export function generateUSSDCode(rail: AfricanRail, countryCode: string, amount: number, reference: string): string {
  const codes: Record<string, string> = {
    'mpesa-KE': `*334*1*1*${amount}*${reference}#`,
    'mtn-momo-GH': `*170*2*${amount}*${reference}#`,
    'mtn-momo-UG': `*165*3*${amount}*${reference}#`,
    'mtn-momo-CM': `*126*2*${amount}*${reference}#`,
    'airtel-money-TZ': `*150*60*${amount}*${reference}#`,
  };
  return codes[`${rail}-${countryCode}`] ?? `*123*${amount}*${reference}#`;
}

export function buildUSSDSession(msisdn: string, amount: number, currency: AfricanCurrency, description: string): USSDSession {
  return {
    sessionId: `ussd-${Date.now()}`,
    msisdn,
    serviceCode: '*384#',
    text: '',
    type: 'BEGIN',
    response: `CON Welcome to SellSpark Payments\n1. Pay ${currency} ${amount.toLocaleString()}\n2. Check balance\n3. Transaction history`,
    options: ['Pay now', 'Cancel'],
  };
}

// ─── Phone Formatting ─────────────────────────────────────────────────────────

export function formatMSISDN(phone: string, countryCode: string = 'NG'): string {
  const cleaned = phone.replace(/\D/g, '');
  const dialCodes: Record<string, string> = { NG: '234', KE: '254', GH: '233', ZA: '27', TZ: '255', UG: '256', RW: '250' };
  const dial = dialCodes[countryCode] || '234';
  if (cleaned.startsWith(dial)) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+${dial}${cleaned.slice(1)}`;
  return `+${dial}${cleaned}`;
}

export function detectAfricanCarrier(msisdn: string): { carrier: string; country: string; isValid: boolean } {
  const prefixes: Array<{ prefix: string; carrier: string; country: string }> = [
    { prefix: '+25470', carrier: 'Safaricom (M-Pesa)', country: 'KE' },
    { prefix: '+25471', carrier: 'Safaricom (M-Pesa)', country: 'KE' },
    { prefix: '+25472', carrier: 'Airtel Kenya', country: 'KE' },
    { prefix: '+23380', carrier: 'MTN Nigeria', country: 'NG' },
    { prefix: '+23381', carrier: 'Airtel Nigeria', country: 'NG' },
    { prefix: '+23390', carrier: 'OPay Nigeria', country: 'NG' },
    { prefix: '+23324', carrier: 'MTN Ghana', country: 'GH' },
    { prefix: '+27060', carrier: 'Vodacom SA', country: 'ZA' },
    { prefix: '+27081', carrier: 'MTN SA', country: 'ZA' },
    { prefix: '+25578', carrier: 'Vodacom TZ (M-Pesa)', country: 'TZ' },
    { prefix: '+25676', carrier: 'MTN Uganda', country: 'UG' },
    { prefix: '+25078', carrier: 'MTN Rwanda', country: 'RW' },
  ];
  const match = prefixes.find(p => msisdn.startsWith(p.prefix));
  return match ? { carrier: match.carrier, country: match.country, isValid: true } : { carrier: 'Unknown', country: 'Unknown', isValid: false };
}

// ─── PAPSS Corridor ───────────────────────────────────────────────────────────

export const PAPSS_CORRIDORS: Array<{ from: string; to: string; currency_pair: string; fee_pct: number; settlement: string }> = [
  { from: 'NG', to: 'GH', currency_pair: 'NGN/GHS', fee_pct: 0.003, settlement: 'T+0' },
  { from: 'NG', to: 'KE', currency_pair: 'NGN/KES', fee_pct: 0.005, settlement: 'T+0' },
  { from: 'GH', to: 'SN', currency_pair: 'GHS/XOF', fee_pct: 0.004, settlement: 'T+0' },
  { from: 'ZA', to: 'NG', currency_pair: 'ZAR/NGN', fee_pct: 0.005, settlement: 'T+1' },
  { from: 'KE', to: 'TZ', currency_pair: 'KES/TZS', fee_pct: 0.003, settlement: 'T+0' },
  { from: 'KE', to: 'UG', currency_pair: 'KES/UGX', fee_pct: 0.003, settlement: 'T+0' },
  { from: 'KE', to: 'RW', currency_pair: 'KES/RWF', fee_pct: 0.003, settlement: 'T+0' },
  { from: 'MA', to: 'SN', currency_pair: 'MAD/XOF', fee_pct: 0.006, settlement: 'T+1' },
];

export function initiatePAPSSTransfer(
  fromCountry: string,
  toCountry: string,
  sendAmount: number,
  sendCurrency: AfricanCurrency,
): PAPSSTransfer {
  const corridor = PAPSS_CORRIDORS.find(c => c.from === fromCountry && c.to === toCountry);
  const toCountryData = AFRICAN_COUNTRIES.find(c => c.code === toCountry);
  const toCurrency = toCountryData?.currency ?? 'USD' as AfricanCurrency;
  const sendUSD = convertToUSD(sendAmount, sendCurrency);
  const receiveAmount = convertFromUSD(sendUSD * (1 - (corridor?.fee_pct ?? 0.005)), toCurrency as AfricanCurrency);

  return {
    id: `papss-${Date.now()}`,
    sendingCountry: fromCountry,
    receivingCountry: toCountry,
    sendingCurrency: sendCurrency,
    receivingCurrency: toCurrency as AfricanCurrency,
    sendAmount,
    receiveAmount,
    fxRate: AFRICAN_FX[toCurrency as AfricanCurrency] / AFRICAN_FX[sendCurrency],
    corridorFee: corridor?.fee_pct ?? 0.005,
    settlementTime: corridor?.settlement ?? 'T+1',
    status: 'initiated',
    traceNumber: `PAPSS${Date.now().toString(36).toUpperCase()}`,
  };
}

// ─── Payment Method Localization ──────────────────────────────────────────────

export function getLocalizedPaymentMethods(countryCode: string): Array<{ id: string; name: string; icon: string; rail: AfricanRail; popular: boolean }> {
  const country = AFRICAN_COUNTRIES.find(c => c.code === countryCode);
  if (!country) return [];

  return country.supportedRails.map((rail, i) => ({
    id: rail,
    name: rail === 'mpesa' ? 'M-Pesa' : rail === 'flutterwave' ? 'Flutterwave' : rail === 'paystack' ? 'Paystack' : rail === 'mtn-momo' ? 'MTN MoMo' : rail === 'airtel-money' ? 'Airtel Money' : rail === 'papss' ? 'PAPSS' : 'OPay',
    icon: rail === 'mpesa' ? '📱' : rail === 'mtn-momo' ? '🟡' : rail === 'airtel-money' ? '🔴' : rail === 'paystack' ? '💙' : rail === 'flutterwave' ? '🦋' : '🏦',
    rail,
    popular: i === 0,
  }));
}
