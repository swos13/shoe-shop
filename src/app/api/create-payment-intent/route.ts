import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

//TODO: Add check if production and if it is then throw error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-09-30.acacia', // Use your targeted API version
});

export async function POST(req: NextRequest) {
  try {
    const body: {
      total: number;
      userId: string;
      customerId: string;
      invoiceId: string;
    } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.total * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      customer: body.customerId,
      metadata: { userId: body.userId, invoiceId: body.invoiceId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
