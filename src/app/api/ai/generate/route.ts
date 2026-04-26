import { NextRequest, NextResponse } from 'next/server';
import { aiEngine } from '@/lib/ai/engine';
import { multiModalAI } from '@/lib/ai/multimodal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generate-store': {
        const store = await aiEngine.generateStore(params);
        return NextResponse.json({ success: true, data: store });
      }

      case 'optimize-content': {
        const result = await aiEngine.optimizeContent(params.content, params.context);
        return NextResponse.json({ success: true, data: result });
      }

      case 'suggest-pricing': {
        const pricing = await aiEngine.suggestPricing(params.productType, params.niche, params.competitorPrices);
        return NextResponse.json({ success: true, data: pricing });
      }

      case 'analyze-revenue': {
        const insights = await aiEngine.analyzeRevenue(params);
        return NextResponse.json({ success: true, data: insights });
      }

      case 'analyze-sentiment': {
        const sentiment = await multiModalAI.analyzeSentiment(params.text);
        return NextResponse.json({ success: true, data: sentiment });
      }

      case 'generate-product-description': {
        const desc = await multiModalAI.generateProductDescription(params);
        return NextResponse.json({ success: true, data: desc });
      }

      case 'generate-email-sequence': {
        const emails = await multiModalAI.generateEmailSequence(params.product, params.audienceType, params.length);
        return NextResponse.json({ success: true, data: emails });
      }

      case 'moderate-content': {
        const flags = await multiModalAI.moderateContent(params.content);
        return NextResponse.json({ success: true, data: flags });
      }

      case 'translate': {
        const translation = await multiModalAI.translateText(params.text, params.targetLang, params.sourceLang);
        return NextResponse.json({ success: true, data: translation });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: 'AI generation failed' } },
      { status: 500 }
    );
  }
}
