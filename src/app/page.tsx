import Link from "next/link";

import { isClerkConfigured } from "@/lib/clerk-env";

export default function Home() {
  const clerkConfigured = isClerkConfigured();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-24">
      <div className="flex flex-col items-start gap-6">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          Infrastructure monitoring
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
          Know the health of your infrastructure at a glance.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          InfraPulse AI tracks uptime, CPU and memory across your servers and
          networks, and surfaces what needs attention before it becomes an
          outage.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {clerkConfigured ? (
          <>
            <Link
              href="/dashboard"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              Open dashboard
            </Link>
            <Link
              href="/sign-up"
              className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              Create account
            </Link>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Sign in
          </Link>
        )}
      </div>

      {!clerkConfigured && (
        <p
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          Authentication is not configured. Add Clerk keys to{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>{" "}
          to enable sign-in. See{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.example</code>.
        </p>
      )}

      <section aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Platform
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ["Auth", "Clerk"],
            ["Database", "Supabase (planned)"],
            ["Email", "Google SMTP (planned)"],
          ].map(([term, value]) => (
            <div key={term} className="rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{term}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}