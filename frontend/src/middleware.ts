import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isUserRoute = createRouteMatcher(["/user(.*)"]);
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("returnTo", new URL(req.url).pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Admin-only routes
  if (isAdminRoute(req)) {
    // If you prefer, use await auth.protect(); here to ensure session exists first
    const role =
      // adjust this if your role lives elsewhere
      sessionClaims?.metadata?.role ?? sessionClaims?.publicMetadata?.role;

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Additional user routes checks (optional if already protected above)
  if (isUserRoute(req)) {
    // Example place for org/tenant checks if needed
    // await auth.protect(); // redundant if you already checked userId above
  }
});

// This config tells Next.js middleware which routes it should run on.
// - The first matcher includes all app routes except Next.js internals (`_next`) and common static assets
//   (html, css, js/json, images, fonts, icons, documents, archives, webmanifest).
// - The second matcher ensures middleware also runs on all API and tRPC routes.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
