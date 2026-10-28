import { describe, expect, it } from "vitest";
import {
  formatModelFamilyName,
  formatRemainingTime,
  formatSignedPercentage,
  formatTokenCount,
  formatWholePercentage,
} from "./band-text.js";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const REMAINING_TIME_MESSAGES = {
  remainingMinutes: "{minutes}m",
  remainingHours: "{hours}h{minutes}",
  remainingDays: "{days}d {hours}h",
};

describe("formatRemainingTime", () => {
  it("writes minutes under an hour", () => {
    expect(
      formatRemainingTime(45 * MINUTE_MS + 30_000, REMAINING_TIME_MESSAGES),
    ).toBe("45m");
  });

  it("writes hours and padded minutes under a day", () => {
    expect(
      formatRemainingTime(3 * HOUR_MS + 5 * MINUTE_MS, REMAINING_TIME_MESSAGES),
    ).toBe("3h05");
  });

  it("writes days and hours beyond a day", () => {
    expect(
      formatRemainingTime(
        28 * HOUR_MS + 59 * MINUTE_MS,
        REMAINING_TIME_MESSAGES,
      ),
    ).toBe("1d 4h");
  });

  it("writes zero minutes once the window has reset", () => {
    expect(formatRemainingTime(-MINUTE_MS, REMAINING_TIME_MESSAGES)).toBe("0m");
  });
});

describe("formatWholePercentage", () => {
  it("rounds to a whole percentage", () => {
    expect(formatWholePercentage(36.4, "en-GB")).toBe("36%");
  });
});

describe("formatSignedPercentage", () => {
  it("writes a plus sign for margin left", () => {
    expect(formatSignedPercentage(3.84, "en-GB")).toBe("+3.8%");
  });

  it("writes a minus sign when ahead of the pace", () => {
    expect(formatSignedPercentage(-12, "en-GB")).toBe("-12.0%");
  });
});

describe("formatTokenCount", () => {
  it("writes thousands with a k", () => {
    expect(formatTokenCount(72_400)).toBe("72k");
  });

  it("writes small counts as they are", () => {
    expect(formatTokenCount(850)).toBe("850");
  });
});

describe("formatModelFamilyName", () => {
  it("finds the family in a model identifier", () => {
    expect(formatModelFamilyName("claude-opus-5-5")).toBe("Opus");
  });

  it("keeps an unknown identifier as it is", () => {
    expect(formatModelFamilyName("custom-model")).toBe("custom-model");
  });
});
