/**
 * Uptime check engine.
 *
 * Performs a single reachability probe against a target and returns a result
 * that is safe to persist and safe to show. Network error messages are mapped to
 * a small set of categories on purpose: a raw error can contain internal
 * hostnames, ports, or IPs, and this value ends up in a database and in the UI.
 */

export type CheckStatus = "up" | "down";

export type CheckErrorCategory =
  | "invalid_url"
  | "timeout"
  | "dns"
  | "tls"
  | "connection_refused"
  | "unreachable"
  | "http_error"
  | "unknown";

export type CheckResult = {
  status: CheckStatus;
  /** HTTP status code, or null when no response was received. */
  statusCode: number | null;
  /** Round-trip time in milliseconds. */
  responseMs: number;
  /** Final URL after redirects, or null when no response was received. */
  finalUrl: string | null;
  /** Safe category, or null when the check succeeded. */
  error: CheckErrorCategory | null;
};

export type CheckOptions = {
  /** Abort the request after this many milliseconds. */
  timeoutMs?: number;
  /**
   * When true, a 4xx/5xx response still counts as reachable. Useful for
   * checking that a host answers, even if the path is wrong.
   */
  acceptErrorStatuses?: boolean;
};

const DEFAULT_TIMEOUT_MS = 10_000;

/** Only these schemes may be probed; anything else could reach unexpected handlers. */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Detect an aborted request across the shapes Node's fetch may produce. */
function isAbort(error: unknown): boolean {
  let current: unknown = error;
  let depth = 0;
  while (current && typeof current === "object" && depth < 10) {
    const name = (current as { name?: unknown }).name;
    const code = (current as { code?: unknown }).code;
    if (name === "AbortError" || name === "TimeoutError" || code === 20 || code === "ABORT_ERR") {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
    depth += 1;
  }
  return false;
}

/**
 * Classify a failure into a category that is safe to persist.
 * Ordered from most specific to least, since Node reports the underlying cause
 * on the error's `cause` chain.
 */
function categorise(error: unknown): CheckErrorCategory {
  // Node's fetch reports an abort as `name: "AbortError"` with the numeric
  // DOMException code 20, not the string "ABORT_ERR".
  if (isAbort(error)) return "timeout";

  const codes = new Set<string>();
  let current: unknown = error;

  while (current && typeof current === "object" && codes.size < 10) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") codes.add(code);
    current = (current as { cause?: unknown }).cause;
  }

  if (codes.has("UND_ERR_CONNECT_TIMEOUT") || codes.has("UND_ERR_HEADERS_TIMEOUT")) {
    return "timeout";
  }
  if (codes.has("ENOTFOUND") || codes.has("EAI_AGAIN")) return "dns";
  if (
    codes.has("CERT_HAS_EXPIRED") ||
    codes.has("DEPTH_ZERO_SELF_SIGNED_CERT") ||
    codes.has("UNABLE_TO_VERIFY_LEAF_SIGNATURE") ||
    codes.has("ERR_TLS_CERT_ALTNAME_INVALID")
  ) {
    return "tls";
  }
  if (codes.has("ECONNREFUSED")) return "connection_refused";
  if (
    codes.has("ECONNRESET") ||
    codes.has("EHOSTUNREACH") ||
    codes.has("ENETUNREACH") ||
    codes.has("EPIPE")
  ) {
    return "unreachable";
  }
  return "unknown";
}

/** Parse and validate a target URL, returning null when it is not probeable. */
export function parseTargetUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
  // A target with no hostname is not addressable.
  if (!url.hostname) return null;
  return url;
}

/**
 * Probe a single target once.
 *
 * `fetchImpl` and `now` are injectable so the engine can be tested without a
 * network or with a fake clock.
 */
export async function checkTarget(
  rawUrl: string,
  options: CheckOptions & { fetchImpl?: typeof fetch; now?: () => number } = {},
): Promise<CheckResult> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, acceptErrorStatuses = false, fetchImpl = fetch } = options;
  const now = options.now ?? (() => performance.now());

  const url = parseTargetUrl(rawUrl);
  if (!url) {
    return {
      status: "down",
      statusCode: null,
      responseMs: 0,
      finalUrl: null,
      error: "invalid_url",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = now();

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      // Never send credentials to a monitored third party.
      headers: { "user-agent": "InfraPulseAI-UptimeCheck/1.0" },
    });

    const responseMs = Math.max(0, Math.round(now() - startedAt));
    const statusCode = response.status;
    // Release the connection so checks cannot exhaust the socket pool.
    void response.body?.cancel();

    const reachable = statusCode >= 200 && statusCode < 400;
    return {
      status: reachable || acceptErrorStatuses ? "up" : "down",
      statusCode,
      responseMs,
      finalUrl: response.url || url.toString(),
      error: reachable || acceptErrorStatuses ? null : "http_error",
    };
  } catch (error) {
    // The signal is the authoritative timeout signal: the error's shape varies
    // between Node versions and runtimes.
    return {
      status: "down",
      statusCode: null,
      responseMs: Math.max(0, Math.round(now() - startedAt)),
      finalUrl: null,
      error: controller.signal.aborted ? "timeout" : categorise(error),
    };
  } finally {
    clearTimeout(timer);
  }
}