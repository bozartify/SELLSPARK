import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get('metric') || 'revenue';
  const period = searchParams.get('period') || '30d';

  const generateData = (days: number) =>
    Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.round(300 + Math.random() * 500),
        visitors: Math.round(200 + Math.random() * 400),
        conversions: Math.round(5 + Math.random() * 20),
        orders: Math.round(3 + Math.random() * 15),
      };
    });

  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
  const data = generateData(days);

  const totals = data.reduce(
    (acc, d) => ({
      revenue: acc.revenue + d.revenue,
      visitors: acc.visitors + d.visitors,
      conversions: acc.conversions + d.conversions,
      orders: acc.orders + d.orders,
    }),
    { revenue: 0, visitors: 0, conversions: 0, orders: 0 }
  );

  return NextResponse.json({
    success: true,
    data: {
      period,
      metric,
      totals,
      timeseries: data,
      conversionRate: totals.visitors > 0 ? ((totals.conversions / totals.visitors) * 100).toFixed(2) + '%' : '0%',
      averageOrderValue: totals.orders > 0 ? Math.round(totals.revenue / totals.orders) : 0,
    },
  });
}
