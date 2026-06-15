// NO 'use client' here — this is a Server Component
import EventDetailClient from './EventDetailClient';

export const metadata = {
  title: 'Event Details | EveNex',
  description: 'View event details, register, and get your ticket',
};

export default function EventDetailPage({ params }) {
  return <EventDetailClient />;
}