import { NextRequest, NextResponse } from 'next/server';
import { neuralIntelligence } from '@/lib/quantum/neural';
import { parseVoiceIntent } from '@/lib/platform/voice';
import { mintReceipt, merkleRoot } from '@/lib/platform/blockchain';

export async function POST(req: NextRequest) {
  const { action, payload } = await req.json();
  switch (action) {
    case 'classify-creator':
      return NextResponse.json(neuralIntelligence.classifyCreator(payload.features));
    case 'embed':
      return NextResponse.json({ vector: neuralIntelligence.embedContent(payload.text) });
    case 'similarity': {
      const a = neuralIntelligence.embedContent(payload.a);
      const b = neuralIntelligence.embedContent(payload.b);
      return NextResponse.json({ similarity: neuralIntelligence.similarity(a, b) });
    }
    case 'voice-intent':
      return NextResponse.json(parseVoiceIntent(payload.transcript));
    case 'mint-receipt':
      return NextResponse.json(mintReceipt(payload.owner, payload.content, payload.chain, payload.metadata));
    case 'merkle-root':
      return NextResponse.json({ root: merkleRoot(payload.leaves) });
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
