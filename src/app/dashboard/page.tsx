import { redirect } from "next/navigation";

import { ClerkNotConfigured } from "@/components/clerk-not-configured";
import { isClerkConfigured } from "@/lib/clerk-env";

/**
 * The whole page depends on the session cookie, which is a request-time read.
 * With `cacheComponents` enabled (Next 16), that cannot be prerendered into a
 * static shell, so this route is explicitly allowed to block on the server
 * instead of failing the build. See the Cache Components auth guide.
 */
export const instant = false;

/**
 * Protected dashboard.
 *
 * `src/proxy.ts` already redirects unauthenticated visitors here, but a matcher
 * is not an authorization boundary: it can be bypassed by a Server Function call
 * or a matcher change. This page therefore re-verifies the session on the server
 * and redirects if it is absent. Treat the proxy as UX, this as security.
 */
export default async function DashboardPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6">
        <ClerkNotConfigured />
      </main>
    );
  }

  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { SignOutButton } = await import("@clerk/nextjs");

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="rounded-full border border-black/[.08] px-4 py-2 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Sign out
          </button>
        </SignOutButton>
      </header>

      <section aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Signed in
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Name</dt>
            <dd className="mt-1 font-medium">
              {user?.firstName || user?.lastName
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : "Not set"}
            </dd>
          </div>
          <div className="rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="mt-1 font-medium">
              {user?.primaryEmailAddress?.emailAddress ?? "Not set"}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="empty-heading">
        <h2 id="empty-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Monitored systems
        </h2>
        <p className="mt-4 rounded-lg border border-dashed border-black/[.15] p-8 text-center text-sm text-zinc-500 dark:border-white/[.2] dark:text-zinc-400">
          No systems are being monitored yet. Data collection lands in a later
          milestone, once the schema and roles are confirmed.
        </p>
      </section>
    </main>
  );
}