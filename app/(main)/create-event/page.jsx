// NO 'use client' here — this is a Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CreateEventClient from './CreateEventClient';

export const metadata = {
  title: 'Create Event | EveNex',
  description: 'Create a new event with AI-powered assistance',
};

export default async function CreateEventPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return <CreateEventClient />;
}