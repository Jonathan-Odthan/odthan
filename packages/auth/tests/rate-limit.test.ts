import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../src/rate-limit";

describe("checkRateLimit", () => {
  it("autorise les requêtes sous la limite", () => {
    const key = `test-${Date.now()}-1`;
    const result = checkRateLimit(key, { max: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("bloque après avoir atteint la limite", () => {
    const key = `test-${Date.now()}-2`;
    checkRateLimit(key, { max: 2, windowMs: 60_000 });
    checkRateLimit(key, { max: 2, windowMs: 60_000 });
    const third = checkRateLimit(key, { max: 2, windowMs: 60_000 });
    expect(third.allowed).toBe(false);
  });
});
