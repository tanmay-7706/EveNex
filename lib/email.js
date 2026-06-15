import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send ticket confirmation email — fails silently so it never
 * blocks the registration flow
 */
export const sendTicketEmail = async ({ to, eventTitle, qrToken, eventDate }) => {
  try {
    await resend.emails.send({
      from: 'EveNex <noreply@evenex.app>',
      to,
      subject: `Your ticket for ${eventTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366F1;">You're registered! 🎉</h1>
          <p>Your ticket for <strong>${eventTitle}</strong> on ${eventDate} is confirmed.</p>
          <p style="background: #f3f4f6; padding: 16px; border-radius: 8px; font-family: monospace; word-break: break-all;">
            Ticket ID: ${qrToken}
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Show this ticket at the event entrance for check-in.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    // Log but never throw — email failure should not block registration
    console.error('Failed to send ticket email:', error);
    return { success: false, error: error.message };
  }
};
