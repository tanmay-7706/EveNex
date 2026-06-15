import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define ALL routes that should be publicly accessible
const isPublicRoute = createRouteMatcher([
  "/",                          // Landing page
  "/sign-in(.*)",               // Clerk sign-in
  "/sign-up(.*)",               // Clerk sign-up
  "/events(.*)",                // Public event browsing
  "/explore(.*)",               // Public explore page
  "/api/webhooks/stripe(.*)",   // Stripe webhooks (must be public)
  "/api/webhooks/clerk(.*)",    // Clerk webhooks (must be public)
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect(); // Redirects to sign-in if not authenticated
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};