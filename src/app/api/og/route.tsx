import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'SellSpark';
  const niche = searchParams.get('niche') || 'AI Creator OS';
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', fontFamily: 'system-ui' }}>
        <div style={{ fontSize: 24, opacity: 0.8 }}>{niche}</div>
        <div style={{ fontSize: 90, fontWeight: 800, marginTop: 20, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: 28, marginTop: 40, opacity: 0.9 }}>SellSpark — quantum-safe creator OS</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
