/**
 * Rendered instead of Clerk UI when no credentials are present.
 *
 * This is a development affordance, not a feature: it must never be shown in a
 * deployed environment, which is why it only appears when keys are genuinely
 * absent rather than when a user merely fails to sign in.
 */
export function ClerkNotConfigured() {
  return (
    <div
      role="status"
      className="mx-auto mt-16 max-w-lg rounded-lg border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      <h1 className="text-lg font-semibold">Authentication is not configured</h1>
      <p className="mt-2 text-sm">
        Clerk keys are missing, so sign-in is disabled. To enable it:
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
        <li>
          Create an application at{" "}
          <a
            href="https://dashboard.clerk.com"
            className="underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            dashboard.clerk.com
          </a>
          , or run{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            npx clerk@latest init
          </code>{" "}
          to provision temporary development keys.
        </li>
        <li>
          Copy <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.example</code>{" "}
          to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>{" "}
          and fill in the values.
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </div>
  );
}