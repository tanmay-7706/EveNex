import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTicketConfirmation = action({
  args: {
    to: v.string(),
    attendeeName: v.string(),
    eventTitle: v.string(),
    eventDate: v.string(),
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "EveNex <noreply@evenex.com>",
        to: [args.to],
        subject: `Ticket Confirmation: ${args.eventTitle}`,
        html: `
          <h2>You're registered for ${args.eventTitle}!</h2>
          <p>Hi ${args.attendeeName},</p>
          <p>Your registration is confirmed for <strong>${args.eventTitle}</strong> on ${args.eventDate}.</p>
          <p>Your ticket ID: <code>${args.qrCode}</code></p>
          <p>See you there!</p>
        `,
      });

      if (error) {
        throw new Error(`Email failed: ${error.message}`);
      }

      return { success: true, emailId: data.id };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
});