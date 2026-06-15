// NO 'use client' here — this is a Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import MyEventsClient from './MyEventsClient';

export const metadata = {
  title: 'My Events | EveNex',
  description: 'Manage your created events and track registrations',
};

export default async function MyEventsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return <MyEventsClient />;
}