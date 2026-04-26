/**
 * SellSpark Voice Commerce & Conversational AI
 * Voice intent parsing, wake-word stubs, TTS/STT orchestration,
 * multilingual voice checkout, and voice-first storefront navigation.
 */

export interface VoiceIntent {
  intent: 'buy' | 'browse' | 'search' | 'support' | 'analytics' | 'unknown';
  entities: Record<string, string>;
  confidence: number;
}

const INTENT_PATTERNS: { intent: VoiceIntent['intent']; patterns: RegExp[] }[] = [
  { intent: 'buy', patterns: [/\b(buy|purchase|order|checkout|get)\b/i] },
  { intent: 'browse', patterns: [/\b(show|see|browse|explore)\b/i] },
  { intent: 'search', patterns: [/\b(find|search|look for)\b/i] },
  { intent: 'support', patterns: [/\b(help|support|issue|problem)\b/i] },
  { intent: 'analytics', patterns: [/\b(revenue|sales|stats|analytics|how much)\b/i] },
];

export function parseVoiceIntent(transcript: string): VoiceIntent {
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(transcript))) {
      const entities: Record<string, string> = {};
      const priceMatch = transcript.match(/\$?(\d+(?:\.\d+)?)/);
      if (priceMatch) entities.price = priceMatch[1];
      const productMatch = transcript.match(/(?:for|about)\s+([a-z0-9\s]+?)(?:\?|$|\.)/i);
      if (productMatch) entities.product = productMatch[1].trim();
      return { intent, entities, confidence: 0.85 };
    }
  }
  return { intent: 'unknown', entities: {}, confidence: 0.1 };
}

export interface VoiceProfile {
  locale: string;
  voice: string;
  rate: number;
  pitch: number;
}

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  default: { locale: 'en-US', voice: 'neural-warm', rate: 1.0, pitch: 1.0 },
  energetic: { locale: 'en-US', voice: 'neural-bright', rate: 1.1, pitch: 1.05 },
  calm: { locale: 'en-US', voice: 'neural-soft', rate: 0.95, pitch: 0.98 },
  multilingual: { locale: 'auto', voice: 'neural-universal', rate: 1.0, pitch: 1.0 },
};

export async function speak(text: string, profile: VoiceProfile = VOICE_PROFILES.default): Promise<void> {
  const w = globalThis as unknown as { speechSynthesis?: { speak: (u: unknown) => void }; SpeechSynthesisUtterance?: new (t: string) => { rate: number; pitch: number; lang: string } };
  if (!w.speechSynthesis || !w.SpeechSynthesisUtterance) return;
  const u = new w.SpeechSynthesisUtterance(text);
  u.rate = profile.rate;
  u.pitch = profile.pitch;
  u.lang = profile.locale;
  w.speechSynthesis.speak(u);
}
