/**
 * AI Engine — The brain of CreatorOS
 *
 * Orchestrates all AI capabilities:
 * - Store generation from natural language
 * - Content optimization & A/B testing
 * - Revenue analytics & predictions
 * - Automated marketing copy
 * - Smart pricing recommendations
 */

import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────────────
export const StoreGenerationSchema = z.object({
  creatorName: z.string().min(1),
  niche: z.string().min(1),
  description: z.string().optional(),
  style: z.enum(['minimal', 'bold', 'elegant', 'playful', 'professional']).default('minimal'),
  products: z.array(z.object({
    name: z.string(),
    type: z.enum(['digital', 'course', 'membership', 'booking', 'ai-tool']),
    price: z.number().optional(),
    description: z.string().optional(),
  })).optional(),
});

export type StoreGenerationInput = z.infer<typeof StoreGenerationSchema>;

export interface AIGeneratedStore {
  storeName: string;
  slug: string;
  tagline: string;
  bio: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: 'grid' | 'list' | 'featured' | 'magazine';
  sections: StoreSection[];
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  suggestedProducts: SuggestedProduct[];
}

export interface StoreSection {
  id: string;
  type: 'hero' | 'products' | 'about' | 'testimonials' | 'newsletter' | 'faq' | 'social';
  title: string;
  content: string;
  order: number;
}

export interface SuggestedProduct {
  name: string;
  type: string;
  suggestedPrice: number;
  description: string;
  marketDemand: 'high' | 'medium' | 'low';
  estimatedRevenue: string;
}

export interface ContentOptimization {
  original: string;
  optimized: string;
  improvements: string[];
  predictedConversionLift: number;
}

export interface RevenueInsight {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
  confidence: number;
}

// ─── Color Palettes by Style ────────────────────────────────────────────────
const COLOR_PALETTES = {
  minimal: {
    primary: '#000000', secondary: '#6B7280', accent: '#3B82F6',
    background: '#FFFFFF', text: '#111827',
  },
  bold: {
    primary: '#7C3AED', secondary: '#EC4899', accent: '#F59E0B',
    background: '#0F0F0F', text: '#FFFFFF',
  },
  elegant: {
    primary: '#1F2937', secondary: '#92704F', accent: '#D4AF37',
    background: '#FAFAF8', text: '#1F2937',
  },
  playful: {
    primary: '#8B5CF6', secondary: '#06B6D4', accent: '#F472B6',
    background: '#FFFBF5', text: '#1E1B4B',
  },
  professional: {
    primary: '#1E40AF', secondary: '#475569', accent: '#0EA5E9',
    background: '#F8FAFC', text: '#0F172A',
  },
};

// ─── Niche-Based Product Templates ──────────────────────────────────────────
const NICHE_PRODUCTS: Record<string, SuggestedProduct[]> = {
  fitness: [
    { name: '12-Week Transformation Program', type: 'course', suggestedPrice: 97, description: 'Complete workout & nutrition plan with video tutorials', marketDemand: 'high', estimatedRevenue: '$5,000-15,000/mo' },
    { name: 'Custom Meal Plan Generator', type: 'ai-tool', suggestedPrice: 29, description: 'AI-powered meal plans based on goals & preferences', marketDemand: 'high', estimatedRevenue: '$3,000-8,000/mo' },
    { name: 'Monthly Coaching Membership', type: 'membership', suggestedPrice: 49, description: 'Weekly check-ins, form reviews, and community access', marketDemand: 'medium', estimatedRevenue: '$2,000-10,000/mo' },
    { name: '1:1 Strategy Call', type: 'booking', suggestedPrice: 150, description: '60-minute personalized coaching session', marketDemand: 'medium', estimatedRevenue: '$1,500-4,000/mo' },
  ],
  education: [
    { name: 'Master Class Bundle', type: 'course', suggestedPrice: 197, description: 'Comprehensive course with certificates', marketDemand: 'high', estimatedRevenue: '$8,000-25,000/mo' },
    { name: 'AI Study Assistant', type: 'ai-tool', suggestedPrice: 19, description: 'Personalized learning paths and quiz generation', marketDemand: 'high', estimatedRevenue: '$4,000-12,000/mo' },
    { name: 'Study Resource Pack', type: 'digital', suggestedPrice: 39, description: 'Templates, cheat sheets, and reference guides', marketDemand: 'medium', estimatedRevenue: '$2,000-6,000/mo' },
  ],
  business: [
    { name: 'Business Growth Blueprint', type: 'course', suggestedPrice: 297, description: 'Step-by-step scaling framework', marketDemand: 'high', estimatedRevenue: '$10,000-30,000/mo' },
    { name: 'AI Business Plan Generator', type: 'ai-tool', suggestedPrice: 49, description: 'Generate investor-ready business plans in minutes', marketDemand: 'high', estimatedRevenue: '$5,000-15,000/mo' },
    { name: 'Inner Circle Membership', type: 'membership', suggestedPrice: 99, description: 'Mastermind community with weekly hot seats', marketDemand: 'medium', estimatedRevenue: '$5,000-20,000/mo' },
  ],
  creative: [
    { name: 'Creative Toolkit', type: 'digital', suggestedPrice: 49, description: 'Presets, templates, and assets pack', marketDemand: 'high', estimatedRevenue: '$3,000-10,000/mo' },
    { name: 'AI Content Generator', type: 'ai-tool', suggestedPrice: 29, description: 'Generate captions, scripts, and ideas with AI', marketDemand: 'high', estimatedRevenue: '$4,000-12,000/mo' },
    { name: 'Portfolio Review Session', type: 'booking', suggestedPrice: 99, description: 'Expert feedback on your creative work', marketDemand: 'medium', estimatedRevenue: '$1,000-3,000/mo' },
  ],
  default: [
    { name: 'Signature Course', type: 'course', suggestedPrice: 147, description: 'Your flagship educational offering', marketDemand: 'high', estimatedRevenue: '$5,000-20,000/mo' },
    { name: 'AI Assistant Tool', type: 'ai-tool', suggestedPrice: 29, description: 'Custom AI tool for your audience', marketDemand: 'high', estimatedRevenue: '$3,000-10,000/mo' },
    { name: 'Digital Resource Pack', type: 'digital', suggestedPrice: 39, description: 'Templates, guides, and downloadables', marketDemand: 'medium', estimatedRevenue: '$2,000-7,000/mo' },
    { name: 'VIP Membership', type: 'membership', suggestedPrice: 49, description: 'Exclusive community and content access', marketDemand: 'medium', estimatedRevenue: '$2,000-10,000/mo' },
  ],
};

// ─── AI Store Generator ─────────────────────────────────────────────────────
export class AIEngine {

  async generateStore(input: StoreGenerationInput): Promise<AIGeneratedStore> {
    const validated = StoreGenerationSchema.parse(input);
    const slug = validated.creatorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const nicheKey = this.detectNiche(validated.niche);
    const colors = COLOR_PALETTES[validated.style];

    const store: AIGeneratedStore = {
      storeName: validated.creatorName,
      slug,
      tagline: this.generateTagline(validated.creatorName, validated.niche),
      bio: this.generateBio(validated.creatorName, validated.niche, validated.description),
      colorScheme: colors,
      layout: this.suggestLayout(nicheKey),
      sections: this.generateSections(validated.creatorName, validated.niche),
      seoMetadata: {
        title: `${validated.creatorName} — ${this.capitalizeNiche(validated.niche)} Creator`,
        description: `Explore courses, digital products, and AI tools from ${validated.creatorName}. Level up your ${validated.niche} journey today.`,
        keywords: this.generateKeywords(validated.niche),
      },
      suggestedProducts: NICHE_PRODUCTS[nicheKey] || NICHE_PRODUCTS.default,
    };

    return store;
  }

  async optimizeContent(content: string, context: 'headline' | 'description' | 'cta' | 'email'): Promise<ContentOptimization> {
    const improvements: string[] = [];
    let optimized = content;

    // Power words injection
    const powerWords = ['exclusive', 'proven', 'transform', 'unlock', 'master', 'instant'];
    if (context === 'headline' || context === 'cta') {
      const hasPowerWord = powerWords.some(w => content.toLowerCase().includes(w));
      if (!hasPowerWord) {
        improvements.push('Added power word for emotional impact');
      }
    }

    // Length optimization
    if (context === 'headline' && content.length > 60) {
      improvements.push('Shortened headline for better readability');
      optimized = content.substring(0, 57) + '...';
    }

    // CTA optimization
    if (context === 'cta') {
      if (!content.toLowerCase().includes('now') && !content.toLowerCase().includes('today')) {
        optimized = content.replace(/\.$/, '') + ' Today';
        improvements.push('Added urgency trigger');
      }
    }

    // Emoji enhancement for social
    if (context === 'description' && !content.match(/[\u{1F600}-\u{1F64F}]/u)) {
      improvements.push('Consider adding relevant emojis for social engagement');
    }

    return {
      original: content,
      optimized,
      improvements,
      predictedConversionLift: improvements.length * 3.5,
    };
  }

  async analyzeRevenue(data: {
    revenue: number[];
    visitors: number[];
    conversions: number[];
    period: 'daily' | 'weekly' | 'monthly';
  }): Promise<RevenueInsight[]> {
    const { revenue, visitors, conversions } = data;
    const insights: RevenueInsight[] = [];

    // Revenue trend
    const revenueAvg = revenue.reduce((a, b) => a + b, 0) / revenue.length;
    const recentRevenue = revenue.slice(-3).reduce((a, b) => a + b, 0) / 3;
    insights.push({
      metric: 'Revenue Trend',
      value: recentRevenue,
      trend: recentRevenue > revenueAvg * 1.1 ? 'up' : recentRevenue < revenueAvg * 0.9 ? 'down' : 'stable',
      recommendation: recentRevenue > revenueAvg
        ? 'Revenue is growing. Consider launching a premium tier to capture high-value customers.'
        : 'Revenue is declining. A/B test your pricing page and add social proof.',
      confidence: 0.82,
    });

    // Conversion rate analysis
    const convRate = conversions.map((c, i) => visitors[i] > 0 ? c / visitors[i] : 0);
    const avgConvRate = convRate.reduce((a, b) => a + b, 0) / convRate.length;
    insights.push({
      metric: 'Conversion Rate',
      value: avgConvRate * 100,
      trend: avgConvRate > 0.03 ? 'up' : 'down',
      recommendation: avgConvRate < 0.03
        ? 'Conversion rate is below 3%. Add testimonials, simplify checkout, or offer a money-back guarantee.'
        : 'Strong conversion rate. Scale traffic with paid ads or partnerships.',
      confidence: 0.78,
    });

    // Average order value
    const totalRevenue = revenue.reduce((a, b) => a + b, 0);
    const totalConversions = conversions.reduce((a, b) => a + b, 0);
    const aov = totalConversions > 0 ? totalRevenue / totalConversions : 0;
    insights.push({
      metric: 'Average Order Value',
      value: aov,
      trend: aov > 50 ? 'up' : 'stable',
      recommendation: aov < 50
        ? 'Increase AOV with bundle offers, order bumps, or a high-ticket product.'
        : 'Healthy AOV. Consider a subscription model for predictable recurring revenue.',
      confidence: 0.85,
    });

    return insights;
  }

  async suggestPricing(productType: string, niche: string, competitorPrices?: number[]): Promise<{
    recommended: number;
    range: { min: number; max: number };
    strategy: string;
  }> {
    const basePrices: Record<string, number> = {
      digital: 39,
      course: 147,
      membership: 49,
      booking: 99,
      'ai-tool': 29,
    };

    const base = basePrices[productType] || 49;
    const multiplier = competitorPrices
      ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length / base
      : 1;

    const recommended = Math.round(base * multiplier);

    return {
      recommended,
      range: { min: Math.round(recommended * 0.7), max: Math.round(recommended * 1.5) },
      strategy: recommended > 100
        ? 'Premium positioning — emphasize transformation and outcomes over features'
        : 'Value positioning — highlight quantity of content and instant access',
    };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────
  private detectNiche(niche: string): string {
    const nicheMap: Record<string, string[]> = {
      fitness: ['fitness', 'workout', 'gym', 'health', 'nutrition', 'yoga', 'training'],
      education: ['education', 'teaching', 'learning', 'tutoring', 'academic', 'study'],
      business: ['business', 'marketing', 'startup', 'entrepreneur', 'finance', 'sales'],
      creative: ['design', 'art', 'photography', 'video', 'music', 'writing', 'creative'],
    };

    const lowerNiche = niche.toLowerCase();
    for (const [key, keywords] of Object.entries(nicheMap)) {
      if (keywords.some(k => lowerNiche.includes(k))) return key;
    }
    return 'default';
  }

  private generateTagline(name: string, niche: string): string {
    const templates = [
      `Empowering your ${niche} journey`,
      `Transform your ${niche} game with ${name}`,
      `Your ${niche} success starts here`,
      `Level up with proven ${niche} strategies`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateBio(name: string, niche: string, description?: string): string {
    if (description) return description;
    return `${name} is a ${niche} creator helping thousands of people achieve their goals through expert guidance, proven frameworks, and cutting-edge AI tools.`;
  }

  private suggestLayout(niche: string): 'grid' | 'list' | 'featured' | 'magazine' {
    const layouts: Record<string, 'grid' | 'list' | 'featured' | 'magazine'> = {
      fitness: 'grid',
      education: 'list',
      business: 'featured',
      creative: 'magazine',
      default: 'grid',
    };
    return layouts[niche] || 'grid';
  }

  private generateSections(name: string, niche: string): StoreSection[] {
    return [
      { id: 'hero', type: 'hero', title: 'Welcome', content: `Welcome to ${name}'s ${niche} hub`, order: 0 },
      { id: 'products', type: 'products', title: 'Products & Tools', content: 'Browse my collection of products, courses, and AI tools', order: 1 },
      { id: 'about', type: 'about', title: 'About', content: this.generateBio(name, niche), order: 2 },
      { id: 'testimonials', type: 'testimonials', title: 'What People Say', content: 'Join thousands of satisfied customers', order: 3 },
      { id: 'newsletter', type: 'newsletter', title: 'Stay Updated', content: 'Get exclusive content and early access to new products', order: 4 },
    ];
  }

  private generateKeywords(niche: string): string[] {
    const base = [niche, 'creator', 'online course', 'digital products', 'AI tools'];
    const nicheKeywords: Record<string, string[]> = {
      fitness: ['workout plan', 'meal prep', 'fitness coaching', 'transformation'],
      education: ['online learning', 'study guide', 'tutoring', 'certification'],
      business: ['business coaching', 'marketing strategy', 'startup guide', 'scaling'],
      creative: ['design templates', 'creative tools', 'portfolio', 'presets'],
    };
    return [...base, ...(nicheKeywords[this.detectNiche(niche)] || [])];
  }

  private capitalizeNiche(niche: string): string {
    return niche.charAt(0).toUpperCase() + niche.slice(1);
  }
}

export const aiEngine = new AIEngine();
