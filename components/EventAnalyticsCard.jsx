'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function EventAnalyticsCard({ eventId }) {
  const stats = useQuery(api.analytics.getEventStats, { eventId });

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  const metrics = [
    { label: 'Registrations', value: stats.totalRegistrations, icon: '🎫' },
    { label: 'Checked In', value: stats.checkedIn, icon: '✅' },
    { label: 'Check-in Rate', value: `${stats.checkInRate}%`, icon: '📊' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰' },
    { label: 'Capacity Used', value: `${stats.capacityUsed}%`, icon: '📈' },
    { label: 'Spots Left', value: stats.spotsRemaining, icon: '💺' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-2xl">{m.icon}</span>
          <span className="text-2xl font-bold text-white">{m.value}</span>
          <span className="text-sm text-gray-400">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
