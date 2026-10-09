/**
 * Clerk configuration detection.
 *
 * Clerk's provider and middleware throw when their keys are absent. That would
 * make `next build` fail on any machine that has not been given real credentials,
 * including CI. This module lets the app degrade to a clearly-labelled
 * "not configured" state instead, so the build stays verifiable while auth is
 * still fully enforced the moment real keys are present.
 *
 * Never log or return the values themselves, only whether they exist.
 */

/** Variables Clerk reads from the server. Missing any of them means unconfigured. */
const REQUIRED_SERVER_KEYS = ["CLERK_SECRET_KEY"] as const;

/** Variables Clerk reads from the browser. Missing any of them means unconfigured. */
const REQUIRED_PUBLIC_KEYS = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] as const;

function isSet(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * True when every required Clerk variable is present, meaning auth should be
 * treated as fully live: route protection on, and unauthenticated users rejected.
 */
export function isClerkConfigured(): boolean {
  return (
    REQUIRED_SERVER_KEYS.every((key) => isSet(process.env[key])) &&
    REQUIRED_PUBLIC_KEYS.every((key) => isSet(process.env[key]))
  );
}

/**
 * Names of the missing variables, for display in setup instructions.
 * Returns an empty array when Clerk is fully configured.
 */
export function missingClerkKeys(): string[] {
  return [
    ...REQUIRED_SERVER_KEYS.filter((key) => !isSet(process.env[key])),
    ...REQUIRED_PUBLIC_KEYS.filter((key) => !isSet(process.env[key])),
  ];
}