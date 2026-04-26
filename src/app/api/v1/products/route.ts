import { NextRequest, NextResponse } from 'next/server';

// Demo data — in production, query from Prisma
const PRODUCTS = [
  { id: 'prod_1', name: '12-Week Transformation Program', type: 'COURSE', price: 97, currency: 'USD', published: true, salesCount: 142, createdAt: '2026-01-15T00:00:00Z' },
  { id: 'prod_2', name: 'AI Content Generator', type: 'AI_TOOL', price: 29, currency: 'USD', published: true, salesCount: 389, createdAt: '2026-02-01T00:00:00Z' },
  { id: 'prod_3', name: 'Monthly VIP Membership', type: 'MEMBERSHIP', price: 49, currency: 'USD', published: true, salesCount: 67, createdAt: '2026-02-15T00:00:00Z' },
  { id: 'prod_4', name: '1:1 Strategy Call', type: 'BOOKING', price: 150, currency: 'USD', published: true, salesCount: 28, createdAt: '2026-03-01T00:00:00Z' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');
  const type = searchParams.get('type');

  let filtered = PRODUCTS;
  if (type) filtered = filtered.filter(p => p.type === type);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return NextResponse.json({
    success: true,
    data: paginated,
    meta: { page, perPage, total, hasMore: page * perPage < total },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, price, description } = body;

    if (!name || !type || price === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'name, type, and price are required' } },
        { status: 400 }
      );
    }

    const product = {
      id: `prod_${Date.now()}`,
      name,
      type,
      price,
      description: description || '',
      currency: 'USD',
      published: false,
      salesCount: 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create product' } },
      { status: 500 }
    );
  }
}
