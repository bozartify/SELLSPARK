import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

const PLANS: Record<string, { priceId: string; name: string; amount: number }> = {
  starter: { priceId: 'price_starter', name: 'Starter', amount: 0 },
  pro: { priceId: 'price_pro', name: 'Pro', amount: 2900 },
  business: { priceId: 'price_business', name: 'Business', amount: 7900 },
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { plan, email, userId } = await req.json();
    const planData = PLANS[plan];

    if (!planData) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (plan === 'starter') {
      return NextResponse.json({ message: 'Free plan activated', plan: 'starter' });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer = customers.data[0];
    if (!customer) {
      customer = await stripe.customers.create({ email, metadata: { userId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `SellSpark ${planData.name} Plan` },
            unit_amount: planData.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
