import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify Svix signature
  const headerPayload = req.headers;
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Clerk webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const { type, data } = event;

  try {
    if (type === 'user.created') {
      await convex.mutation(api.users.createFromClerk, {
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address || '',
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        imageUrl: data.image_url || '',
      });
    }

    if (type === 'user.updated') {
      await convex.mutation(api.users.updateFromClerk, {
        clerkId: data.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        imageUrl: data.image_url || '',
      });
    }

    if (type === 'user.deleted') {
      await convex.mutation(api.users.deleteFromClerk, {
        clerkId: data.id,
      });
    }
  } catch (error) {
    console.error('Convex sync error:', error);
    return NextResponse.json({ error: 'Database sync failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
