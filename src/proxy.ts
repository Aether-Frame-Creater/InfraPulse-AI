import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { isClerkConfigured } from "@/lib/clerk-env";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`; the export must be named
 * `proxy` and the runtime defaults to Node.js. Clerk 7.x detects Next 16 and
 * supports both conventions, so this file is the current one.
 *
 * Security note: this matcher is a convenience redirect for UX only. It runs
 * before rendering and can be bypassed by matcher changes or by calling a
 * Server Function directly, so every protected page and handler must ALSO
 * authorise on the server. See `src/app/dashboard/page.tsx`.
 */
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Without keys there is no session to verify. Fail open here rather than
  // crashing; the server-side checks in each protected page still refuse access.
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, req) => {
    if (!isProtectedRoute(req)) {
      return NextResponse.next();
    }

    // `auth` is a callable helper; await it to resolve the session object.
    const { userId } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      // Preserve the destination so the user lands where they intended.
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  })(request, event);
}

export const config = {
  matcher: [
    // Skip Next internals and static assets so auth logic cannot block
    // CSS, JS, or images from loading.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Always run for API routes so they can be protected server-side too.
    "/api(.*)",
  ],
};