import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { isClerkConfigured, missingClerkKeys } from "../src/lib/clerk-env.ts";

const KEYS = ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] as const;

const original = new Map<string, string | undefined>();

function setEnv(values: Partial<Record<(typeof KEYS)[number], string | undefined>>) {
  for (const key of KEYS) {
    if (!original.has(key)) {
      original.set(key, process.env[key]);
    }
    const value = values[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

afterEach(() => {
  for (const [key, value] of original) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  original.clear();
});

describe("isClerkConfigured", () => {
  it("is false when no keys are present", () => {
    setEnv({});
    assert.equal(isClerkConfigured(), false);
  });

  it("is false when only the publishable key is present", () => {
    setEnv({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123" });
    assert.equal(isClerkConfigured(), false);
  });

  it("is false when only the secret key is present", () => {
    setEnv({ CLERK_SECRET_KEY: "sk_test_123" });
    assert.equal(isClerkConfigured(), false);
  });

  it("is true when both keys are present", () => {
    setEnv({ CLERK_SECRET_KEY: "sk_test_123", NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123" });
    assert.equal(isClerkConfigured(), true);
  });

  it("treats empty and whitespace-only values as missing", () => {
    setEnv({ CLERK_SECRET_KEY: "   ", NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "" });
    assert.equal(isClerkConfigured(), false);
  });
});

describe("missingClerkKeys", () => {
  it("lists both keys when unconfigured", () => {
    setEnv({});
    assert.deepEqual(missingClerkKeys().sort(), [
      "CLERK_SECRET_KEY",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    ]);
  });

  it("lists only the secret key when the publishable key is present", () => {
    setEnv({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123" });
    assert.deepEqual(missingClerkKeys(), ["CLERK_SECRET_KEY"]);
  });

  it("is empty when fully configured", () => {
    setEnv({ CLERK_SECRET_KEY: "sk_test_123", NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123" });
    assert.deepEqual(missingClerkKeys(), []);
  });

  it("never returns key values", () => {
    setEnv({ CLERK_SECRET_KEY: "sk_test_supersecret" });
    for (const entry of missingClerkKeys()) {
      assert.ok(!entry.includes("supersecret"), "must not leak values");
    }
  });
});