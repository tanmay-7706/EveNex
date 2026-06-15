import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate unique QR code ID (fallback for free events)
function generateQRCode() {
  return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Called by Stripe webhook — idempotent registration for paid events
export const createFromWebhook = mutation({
  args: {
    eventId: v.string(), // String from Stripe metadata, not v.id
    userId: v.string(), // Clerk user ID from Stripe metadata
    stripeSessionId: v.string(),
    amountPaid: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency check: don't create duplicate registrations
    const existing = await ctx.db
      .query('registrations')
      .withIndex('by_stripe_session', (q) =>
        q.eq('stripeSessionId', args.stripeSessionId)
      )
      .first();

    if (existing) {
      console.log('Registration already exists for session:', args.stripeSessionId);
      return existing._id;
    }

    // Resolve Convex event ID
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('Event not found');

    // Find the Convex user by their Clerk tokenIdentifier
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', args.userId)
      )
      .first();

    // Fall back: try by_clerk_id
    const resolvedUser = user || await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) =>
        q.eq('clerkId', args.userId)
      )
      .first();

    if (!resolvedUser) throw new Error('User not found');

    // Create the registration
    const qrCode = generateQRCode();
    const registrationId = await ctx.db.insert('registrations', {
      eventId: args.eventId,
      userId: resolvedUser._id,
      attendeeName: resolvedUser.name || 'Attendee',
      attendeeEmail: resolvedUser.email || '',
      qrCode,
      stripeSessionId: args.stripeSessionId,
      amountPaid: args.amountPaid,
      currency: args.currency,
      status: 'confirmed',
      checkedIn: false,
      registeredAt: Date.now(),
    });

    // Update event registration count
    await ctx.db.patch(args.eventId, {
      registrationCount: (event.registrationCount || 0) + 1,
    });

    return registrationId;
  },
});


// Register for an event
export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    attendeeName: v.string(),
    attendeeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if event is full
    if (event.registrationCount >= event.capacity) {
      throw new Error("Event is full");
    }

    // Check if user already registered
    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    if (existingRegistration) {
      throw new Error("You are already registered for this event");
    }

    // Create registration
    const qrCode = generateQRCode();
    
    const registrationId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      userId: user._id,
      attendeeName: args.attendeeName,
      attendeeEmail: args.attendeeEmail,
      qrCode: qrCode,
      checkedIn: false,
      status: "confirmed",
      registeredAt: Date.now(),
    });

    // Update event registration count
    await ctx.db.patch(args.eventId, {
      registrationCount: event.registrationCount + 1,
    });

    return registrationId;
  },
});

// Check if user is registered for an event
export const checkRegistration = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    if (!user) return null;

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    return registration;
  },
});

// Get user's registrations (tickets)
export const getMyRegistrations = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Fetch event details for each registration
    const registrationsWithEvents = await Promise.all(
      registrations.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        return {
          ...reg,
          event,
        };
      })
    );

    return registrationsWithEvents;
  },
});

// Cancel registration
export const cancelRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    // Check if user owns this registration
    if (registration.userId !== user._id) {
      throw new Error("You are not authorized to cancel this registration");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Update registration status
    await ctx.db.patch(args.registrationId, {
      status: "cancelled",
    });

    // Decrement event registration count
    if (event.registrationCount > 0) {
      await ctx.db.patch(registration.eventId, {
        registrationCount: event.registrationCount - 1,
      });
    }

    return { success: true };
  },
});

// Get registrations for an event (for organizers)
export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the organizer
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to view registrations");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return registrations;
  },
});

// Check-in attendee with QR code
export const checkInAttendee = mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();

    if (!registration) {
      throw new Error("Invalid QR code");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the organizer
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to check in attendees");
    }

    // Check if already checked in
    if (registration.checkedIn) {
      return {
        success: false,
        message: "Already checked in",
        registration,
      };
    }

    // Check in
    await ctx.db.patch(registration._id, {
      checkedIn: true,
      checkedInAt: Date.now(),
    });

    return {
      success: true,
      message: "Check-in successful",
      registration: {
        ...registration,
        checkedIn: true,
        checkedInAt: Date.now(),
      },
    };
  },
});

// Approve registration (for organizers)
export const approveRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    const registration = await ctx.db.get(args.registrationId);
    
    if (!registration) {
      throw new Error("Registration not found");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event || event.organizerId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.registrationId, {
      approvalStatus: "approved",
      status: "confirmed",
    });

    return { success: true };
  },
});

// Reject registration (for organizers)
export const rejectRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    const registration = await ctx.db.get(args.registrationId);
    
    if (!registration) {
      throw new Error("Registration not found");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event || event.organizerId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.registrationId, {
      approvalStatus: "rejected",
      status: "cancelled",
    });

    return { success: true };
  },
});