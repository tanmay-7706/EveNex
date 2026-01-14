import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const sendTicketEmail = action({
  args: {
    email: v.string(),
    eventId: v.id("events"),
    eventTitle: v.string(),
    ticketId: v.string(),
    attendeeName: v.string(),
    eventDate: v.string(),
    eventLocation: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const { data, error } = await resend.emails.send({
        from: "EveNex <noreply@evenex.com>",
        to: [args.email],
        subject: `🎟️ Your ticket for ${args.eventTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                .ticket-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
                .ticket-id { font-family: monospace; font-size: 18px; font-weight: bold; color: #667eea; }
                .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 You're registered!</h1>
                  <h2>${args.eventTitle}</h2>
                </div>
                <div class="content">
                  <p>Hi ${args.attendeeName},</p>
                  <p>Great news! Your registration for <strong>${args.eventTitle}</strong> is confirmed.</p>
                  
                  <div class="ticket-box">
                    <h3>📱 Your Digital Ticket</h3>
                    <div class="ticket-id">${args.ticketId}</div>
                    <p><small>Show this QR code at the event entrance</small></p>
                  </div>
                  
                  <h3>📅 Event Details</h3>
                  <ul>
                    <li><strong>Date:</strong> ${args.eventDate}</li>
                    <li><strong>Location:</strong> ${args.eventLocation}</li>
                  </ul>
                  
                  <p>We can't wait to see you there!</p>
                  <p>Best regards,<br>The EveNex Team</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(`Email failed: ${error.message}`);
      }

      console.log("Email sent successfully:", data.id);
      return { success: true, emailId: data.id };
    } catch (error) {
      console.error("Email action failed:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
});

export const createStripeConnectAccount = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    businessType: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        email: args.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: args.businessType,
      });

      // Update user with Stripe account ID
      await ctx.runMutation(internal.users.updateStripeAccount, {
        userId: args.userId,
        stripeAccountId: account.id,
      });

      return { accountId: account.id };
    } catch (error) {
      throw new Error(`Failed to create Stripe account: ${error.message}`);
    }
  },
});

export const createStripeOnboardingLink = action({
  args: {
    accountId: v.string(),
    returnUrl: v.string(),
    refreshUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: args.accountId,
        return_url: args.returnUrl,
        refresh_url: args.refreshUrl,
        type: "account_onboarding",
      });

      return { url: accountLink.url };
    } catch (error) {
      throw new Error(`Failed to create onboarding link: ${error.message}`);
    }
  },
});