// NO 'use client' here — this is a Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import EventDashboardClient from './EventDashboardClient';

export const metadata = {
  title: 'Event Dashboard | EveNex',
  description: 'Manage your event, view registrations, and check in attendees',
};

export default async function EventDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return <EventDashboardClient />;
}