import { describe, expect, it } from "vitest";
import { InvalidRateLimitsError } from "./errors.js";
import { readRateLimits } from "./rate-limits.js";

const FIVE_HOUR_RESETS_AT_SECONDS = 1_792_670_400;
const SEVEN_DAY_RESETS_AT_SECONDS = 1_793_088_000;

function createStatusLinePayload(rateLimits) {
  return {
    session_id: "7f3c9b2e-session",
    transcript_path: "C:/Users/someone/.claude/projects/demo/session.jsonl",
    cwd: "C:/Users/someone/Documents/secret-project",
    model: { id: "model-id", display_name: "Model" },
    rate_limits: rateLimits,
  };
}

function createCompleteRateLimits() {
  return {
    five_hour: {
      used_percentage: 42,
      resets_at: FIVE_HOUR_RESETS_AT_SECONDS,
    },
    seven_day: {
      used_percentage: 67.5,
      resets_at: SEVEN_DAY_RESETS_AT_SECONDS,
    },
  };
}

describe("readRateLimits", () => {
  it("reads both windows and converts reset times to milliseconds", () => {
    const payload = createStatusLinePayload(createCompleteRateLimits());

    expect(readRateLimits(payload)).toEqual({
      fiveHour: {
        windowKind: "five_hour",
        usedPercentage: 42,
        resetsAtMs: FIVE_HOUR_RESETS_AT_SECONDS * 1000,
      },
      sevenDay: {
        windowKind: "seven_day",
        usedPercentage: 67.5,
        resetsAtMs: SEVEN_DAY_RESETS_AT_SECONDS * 1000,
      },
    });
  });

  it("returns null when the payload carries no rate limits", () => {
    expect(readRateLimits(createStatusLinePayload(undefined))).toBeNull();
    expect(readRateLimits(createStatusLinePayload(null))).toBeNull();
  });

  it("returns null for a window that is missing", () => {
    const rateLimits = createCompleteRateLimits();
    delete rateLimits.five_hour;

    const result = readRateLimits(createStatusLinePayload(rateLimits));

    expect(result.fiveHour).toBeNull();
    expect(result.sevenDay.windowKind).toBe("seven_day");
  });

  it("ignores rate limit entries other than the two windows", () => {
    const rateLimits = {
      ...createCompleteRateLimits(),
      spend_limit: { used_percentage: 10, resets_at: 1, used_usd: 3 },
    };

    const result = readRateLimits(createStatusLinePayload(rateLimits));

    expect(Object.keys(result)).toEqual(["fiveHour", "sevenDay"]);
  });

  it("keeps no personal field from the payload", () => {
    const payload = createStatusLinePayload(createCompleteRateLimits());

    const serializedResult = JSON.stringify(readRateLimits(payload));

    expect(serializedResult).not.toContain(payload.session_id);
    expect(serializedResult).not.toContain("secret-project");
    expect(serializedResult).not.toContain("session.jsonl");
  });

  it("accepts a used percentage above 100", () => {
    const rateLimits = createCompleteRateLimits();
    rateLimits.seven_day.used_percentage = 100.4;

    const result = readRateLimits(createStatusLinePayload(rateLimits));

    expect(result.sevenDay.usedPercentage).toBe(100.4);
  });

  it.each([
    ["a string", "payload"],
    ["an array", []],
    ["null", null],
  ])("rejects a payload that is %s", (_description, payload) => {
    expect(() => readRateLimits(payload)).toThrow(InvalidRateLimitsError);
  });

  it.each([
    ["rate limits that are not an object", () => "full", "rate_limits"],
    [
      "a window that is not an object",
      (rateLimits) => ({ ...rateLimits, five_hour: 42 }),
      "rate_limits.five_hour",
    ],
    [
      "a negative used percentage",
      (rateLimits) => {
        rateLimits.five_hour.used_percentage = -1;
        return rateLimits;
      },
      "rate_limits.five_hour.used_percentage",
    ],
    [
      "a used percentage given as text",
      (rateLimits) => {
        rateLimits.seven_day.used_percentage = "67";
        return rateLimits;
      },
      "rate_limits.seven_day.used_percentage",
    ],
    [
      "a missing reset time",
      (rateLimits) => {
        delete rateLimits.seven_day.resets_at;
        return rateLimits;
      },
      "rate_limits.seven_day.resets_at",
    ],
    [
      "a reset time that is not finite",
      (rateLimits) => {
        rateLimits.five_hour.resets_at = Number.POSITIVE_INFINITY;
        return rateLimits;
      },
      "rate_limits.five_hour.resets_at",
    ],
  ])("rejects %s and names the field", (_description, corrupt, fieldPath) => {
    const payload = createStatusLinePayload(
      corrupt(createCompleteRateLimits()),
    );

    expect(() => readRateLimits(payload)).toThrow(
      expect.objectContaining({
        name: "InvalidRateLimitsError",
        fieldPath,
      }),
    );
  });
});
