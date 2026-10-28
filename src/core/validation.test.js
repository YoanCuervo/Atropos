import { describe, expect, it } from "vitest";
import { isIsoTimestamp } from "./validation.js";

describe("isIsoTimestamp", () => {
  it("accepts a timestamp written by toISOString", () => {
    expect(isIsoTimestamp(new Date(0).toISOString())).toBe(true);
  });

  it.each([
    ["a date without time", "2026-10-22"],
    ["a timestamp without milliseconds", "2026-10-22T14:06:00Z"],
    ["a timestamp with an offset", "2026-10-22T16:06:00.000+02:00"],
    ["an impossible date", "2026-02-30T00:00:00.000Z"],
    ["a number", 1_792_670_400_000],
  ])("rejects %s", (_description, value) => {
    expect(isIsoTimestamp(value)).toBe(false);
  });
});
