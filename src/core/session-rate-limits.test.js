import { describe, expect, it } from "vitest";
import { InvalidRateLimitsError } from "./errors.js";
import { readSessionRateLimits } from "./session-rate-limits.js";

const FIVE_HOUR_RESETS_AT = "2026-10-28T11:20:00.000Z";
const SEVEN_DAY_RESETS_AT = "2026-10-29T08:00:00.000Z";

describe("readSessionRateLimits", () => {
  it("reads both windows and converts reset times to milliseconds", () => {
    expect(
      readSessionRateLimits([
        { kind: "five_hour", percentUsed: 36, resetsAt: FIVE_HOUR_RESETS_AT },
        { kind: "seven_day", percentUsed: 62.5, resetsAt: SEVEN_DAY_RESETS_AT },
      ]),
    ).toEqual({
      fiveHour: {
        windowKind: "five_hour",
        usedPercentage: 36,
        resetsAtMs: Date.parse(FIVE_HOUR_RESETS_AT),
      },
      sevenDay: {
        windowKind: "seven_day",
        usedPercentage: 62.5,
        resetsAtMs: Date.parse(SEVEN_DAY_RESETS_AT),
      },
    });
  });

  it("ignores windows other than the five-hour and weekly ones", () => {
    expect(
      readSessionRateLimits([
        { kind: "spend_limit", percentUsed: 120 },
        { kind: "seven_day", percentUsed: 10, resetsAt: SEVEN_DAY_RESETS_AT },
      ]),
    ).toEqual({
      fiveHour: null,
      sevenDay: {
        windowKind: "seven_day",
        usedPercentage: 10,
        resetsAtMs: Date.parse(SEVEN_DAY_RESETS_AT),
      },
    });
  });

  it("treats a window without a reset time as not read yet", () => {
    expect(
      readSessionRateLimits([{ kind: "five_hour", percentUsed: 0 }]),
    ).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(readSessionRateLimits([])).toBeNull();
  });

  it("rejects a value that is not a list", () => {
    expect(() => readSessionRateLimits({ five_hour: 3 })).toThrow(
      InvalidRateLimitsError,
    );
  });

  it("rejects a negative percentage", () => {
    expect(() =>
      readSessionRateLimits([
        { kind: "five_hour", percentUsed: -1, resetsAt: FIVE_HOUR_RESETS_AT },
      ]),
    ).toThrow(InvalidRateLimitsError);
  });

  it("rejects a reset time that is not an ISO timestamp", () => {
    expect(() =>
      readSessionRateLimits([
        { kind: "seven_day", percentUsed: 5, resetsAt: "tomorrow" },
      ]),
    ).toThrow(InvalidRateLimitsError);
  });
});
