// NO 'use client' here — this is a Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import MyTicketsClient from './MyTicketsClient';

export const metadata = {
  title: 'My Tickets | EveNex',
  description: 'View and manage your event registrations and tickets',
};

export default async function MyTicketsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return <MyTicketsClient />;
}