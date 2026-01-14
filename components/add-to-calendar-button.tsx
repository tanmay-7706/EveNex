"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadIcsFile, type EventDetails } from "@/lib/generateIcs";
import { toast } from "sonner";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description: string;
    startDate: number;
    endDate: number;
    city: string;
    state?: string;
    country: string;
    locationType: "online" | "physical";
    venue?: string;
    address?: string;
    slug: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function AddToCalendarButton({ 
  event, 
  variant = "outline", 
  size = "default",
  className = "" 
}: AddToCalendarButtonProps) {
  const handleAddToCalendar = () => {
    try {
      const eventDetails: EventDetails = {
        title: event.title,
        description: event.description,
        startTime: new Date(event.startDate),
        endTime: new Date(event.endDate),
        location: event.locationType === "online" 
          ? "Online Event" 
          : `${event.venue || ""} ${event.address || ""}, ${event.city}, ${event.state || event.country}`.trim(),
        url: `${window.location.origin}/events/${event.slug}`,
      };

      downloadIcsFile(eventDetails);
      toast.success("Calendar event downloaded!");
    } catch (error) {
      console.error("Calendar download failed:", error);
      toast.error("Failed to download calendar event");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={handleAddToCalendar}
    >
      <CalendarPlus className="w-4 h-4" />
      Add to Calendar
    </Button>
  );
}