import { query } from './_generated/server';
import { v } from 'convex/values';

export const getEventStats = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('Event not found');

    // Verify requester is the organizer
    if (event.organizerId !== identity.subject) {
      throw new Error('Not authorized');
    }

    const registrations = await ctx.db
      .query('registrations')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect();

    const checkedIn = registrations.filter((r) => r.checkedIn).length;
    const totalRevenue = registrations
      .filter((r) => r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    return {
      totalRegistrations: registrations.length,
      checkedIn,
      checkInRate: registrations.length > 0
        ? Math.round((checkedIn / registrations.length) * 100)
        : 0,
      totalRevenue: totalRevenue / 100, // Convert from paise to rupees
      capacityUsed: event.capacity > 0
        ? Math.round((registrations.length / event.capacity) * 100)
        : 0,
      spotsRemaining: Math.max(0, event.capacity - registrations.length),
    };
  },
});
