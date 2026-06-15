import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  // CRITICAL: Verify webhook signature to prevent fake events
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Only process if payment was successful
        if (session.payment_status !== 'paid') break;

        const { eventId, userId } = session.metadata;

        // Create registration in Convex (idempotent — check if already exists)
        await convex.mutation(api.registrations.createFromWebhook, {
          eventId,
          userId,
          stripeSessionId: session.id,
          amountPaid: session.amount_total,
          currency: session.currency,
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        // Optionally: notify user via email
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Return 200 to acknowledge receipt — Stripe will retry if we return an error
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
