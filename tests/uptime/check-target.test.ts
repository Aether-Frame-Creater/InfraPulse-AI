import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import { checkTarget, parseTargetUrl } from "../../src/lib/uptime/check-target.ts";

/**
 * These tests run against a real local HTTP server rather than a mocked fetch,
 * so redirects, status codes, aborts, and socket errors are genuinely
 * exercised.
 */
let server: Server;
let baseUrl: string;
/** A port that is bound then released, so connecting to it is refused. */
let closedPort: number;
let slowServer: Server;
let slowUrl: string;

before(async () => {
  server = createServer((req, res) => {
    if (req.url === "/ok") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
    } else if (req.url === "/redirect") {
      res.writeHead(302, { location: "/ok" });
      res.end();
    } else if (req.url === "/boom") {
      res.writeHead(500);
      res.end("boom");
    } else {
      res.writeHead(404);
      res.end("nope");
    }
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;

  // Bind and immediately release a port to obtain one that refuses connections.
  const tmp = createServer();
  await new Promise<void>((resolve) => tmp.listen(0, "127.0.0.1", resolve));
  const tmpAddress = tmp.address();
  assert.ok(tmpAddress && typeof tmpAddress === "object");
  closedPort = tmpAddress.port;
  await new Promise<void>((resolve) => tmp.close(() => resolve()));

  // A server that accepts the connection but never answers, to force a timeout.
  slowServer = createServer(() => {
    /* deliberately never responds */
  });
  await new Promise<void>((resolve) => slowServer.listen(0, "127.0.0.1", resolve));
  const slowAddress = slowServer.address();
  assert.ok(slowAddress && typeof slowAddress === "object");
  slowUrl = `http://127.0.0.1:${slowAddress.port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await new Promise<void>((resolve) => slowServer.close(() => resolve()));
});

describe("parseTargetUrl", () => {
  it("accepts http and https", () => {
    assert.ok(parseTargetUrl("http://example.com"));
    assert.ok(parseTargetUrl("https://example.com/health"));
  });

  it("trims surrounding whitespace", () => {
    assert.ok(parseTargetUrl("  https://example.com  "));
  });

  it("rejects non-http schemes", () => {
    assert.equal(parseTargetUrl("ftp://example.com"), null);
    assert.equal(parseTargetUrl("file:///etc/passwd"), null);
    assert.equal(parseTargetUrl("gopher://example.com"), null);
  });

  it("rejects malformed input", () => {
    assert.equal(parseTargetUrl("not a url"), null);
    assert.equal(parseTargetUrl(""), null);
    assert.equal(parseTargetUrl("http://"), null);
  });
});

describe("checkTarget", () => {
  it("reports up for a healthy 200 response", async () => {
    const result = await checkTarget(`${baseUrl}/ok`);
    assert.equal(result.status, "up");
    assert.equal(result.statusCode, 200);
    assert.equal(result.error, null);
    assert.ok(result.responseMs >= 0);
    assert.ok(result.finalUrl);
  });

  it("follows redirects and reports the final response", async () => {
    const result = await checkTarget(`${baseUrl}/redirect`);
    assert.equal(result.status, "up");
    assert.equal(result.statusCode, 200);
    assert.match(result.finalUrl ?? "", /\/ok$/);
  });

  it("reports down with http_error for a 500", async () => {
    const result = await checkTarget(`${baseUrl}/boom`);
    assert.equal(result.status, "down");
    assert.equal(result.statusCode, 500);
    assert.equal(result.error, "http_error");
  });

  it("reports down with http_error for a 404", async () => {
    const result = await checkTarget(`${baseUrl}/missing`);
    assert.equal(result.status, "down");
    assert.equal(result.statusCode, 404);
    assert.equal(result.error, "http_error");
  });

  it("treats error statuses as up when acceptErrorStatuses is set", async () => {
    const result = await checkTarget(`${baseUrl}/boom`, { acceptErrorStatuses: true });
    assert.equal(result.status, "up");
    assert.equal(result.statusCode, 500);
    assert.equal(result.error, null);
  });

  it("reports connection_refused without leaking the address", async () => {
    const result = await checkTarget(`http://127.0.0.1:${closedPort}/health`, { timeoutMs: 5000 });
    assert.equal(result.status, "down");
    assert.equal(result.statusCode, null);
    assert.equal(result.error, "connection_refused");
    assert.equal(result.finalUrl, null);
  });

  it("reports timeout when the server never responds", async () => {
    const result = await checkTarget(slowUrl, { timeoutMs: 250 });
    assert.equal(result.status, "down");
    assert.equal(result.error, "timeout");
    assert.equal(result.statusCode, null);
  });

  it("reports invalid_url without attempting a request", async () => {
    let called = false;
    const result = await checkTarget("ftp://example.com", {
      fetchImpl: (async () => {
        called = true;
        throw new Error("should not be called");
      }) as unknown as typeof fetch,
    });
    assert.equal(result.status, "down");
    assert.equal(result.error, "invalid_url");
    assert.equal(result.responseMs, 0);
    assert.equal(called, false, "must not perform a request for an invalid URL");
  });

  it("never returns a raw error message", async () => {
    const result = await checkTarget("http://nonexistent.invalid.example", { timeoutMs: 3000 });
    assert.equal(result.status, "down");
    // The category must be a known value, never a free-text error.
    assert.ok(
      ["dns", "timeout", "tls", "connection_refused", "unreachable", "unknown"].includes(result.error ?? ""),
      `unexpected error category: ${result.error}`,
    );
  });

  it("measures response time with an injected clock", async () => {
    let tick = 0;
    const result = await checkTarget(`${baseUrl}/ok`, { now: () => (tick += 250) });
    assert.equal(result.responseMs, 250);
  });
});