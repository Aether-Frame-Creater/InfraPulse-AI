import { Suspense } from "react";

import { ClerkNotConfigured } from "@/components/clerk-not-configured";
import { isClerkConfigured } from "@/lib/clerk-env";

export default async function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="flex flex-1 flex-col items-center px-6">
        <ClerkNotConfigured />
      </main>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      {/* Clerk's components read the pathname in a client component, which
          cannot be prerendered without a boundary to stream it through. */}
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading sign-in…</p>}>
        <SignIn />
      </Suspense>
    </main>
  );
}