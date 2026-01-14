import { NextResponse } from "next/server";
import { createEvents } from "ics";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    const event = await convex.query(api.events.getEventBySlug, { slug });
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    const icsEvent = {
      title: event.title,
      description: event.description,
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ],
      location: event.locationType === "online" ? "Online Event" : `${event.venue || ""} ${event.address || ""}, ${event.city}`,
      url: `${request.nextUrl.origin}/events/${event.slug}`,
    };

    const { error, value } = createEvents([icsEvent]);
    
    if (error) {
      throw new Error(error);
    }

    return new NextResponse(value, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 });
  }
}