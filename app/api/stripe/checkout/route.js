import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, eventTitle, ticketPrice, organizerStripeAccountId } = await req.json();

    if (!eventId || !eventTitle || !ticketPrice || !organizerStripeAccountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const priceInPaise = Math.round(ticketPrice * 100); // Stripe uses smallest currency unit

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: eventTitle,
              description: `Ticket for ${eventTitle}`,
            },
            unit_amount: priceInPaise,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // For Connect: charge the organizer's account with application fee
      payment_intent_data: {
        application_fee_amount: Math.round(priceInPaise * 0.05), // 5% platform fee
        transfer_data: {
          destination: organizerStripeAccountId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}?payment=cancelled`,
      metadata: {
        eventId,
        userId, // Clerk user ID
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
