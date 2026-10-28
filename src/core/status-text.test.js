import { describe, expect, it } from "vitest";
import { NO_LIMITS_TEXT, formatStatusText } from "./status-text.js";

const PARIS_DISPLAY_OPTIONS = { locale: "en-GB", timeZone: "Europe/Paris" };

function createRateLimits() {
  return {
    fiveHour: {
      windowKind: "five_hour",
      usedPercentage: 42,
      resetsAtMs: Date.UTC(2026, 9, 22, 15, 0, 0, 0),
    },
    sevenDay: {
      windowKind: "seven_day",
      usedPercentage: 67.4,
      resetsAtMs: Date.UTC(2026, 9, 27, 8, 0, 0, 0),
    },
  };
}

describe("formatStatusText", () => {
  it("shows both windows with their local reset times", () => {
    expect(formatStatusText(createRateLimits(), PARIS_DISPLAY_OPTIONS)).toBe(
      "5h 42% (17:00) · week 67% (Tue 09:00)",
    );
  });

  it("rounds the used percentage to the nearest integer", () => {
    const rateLimits = createRateLimits();
    rateLimits.fiveHour.usedPercentage = 41.5;

    expect(formatStatusText(rateLimits, PARIS_DISPLAY_OPTIONS)).toMatch(
      /^5h 42% /,
    );
  });

  it("shows reset times in the requested time zone", () => {
    const tokyoDisplayOptions = { locale: "en-GB", timeZone: "Asia/Tokyo" };

    expect(formatStatusText(createRateLimits(), tokyoDisplayOptions)).toBe(
      "5h 42% (00:00) · week 67% (Tue 17:00)",
    );
  });

  it("shows only the window that is present", () => {
    const rateLimits = { ...createRateLimits(), fiveHour: null };

    expect(formatStatusText(rateLimits, PARIS_DISPLAY_OPTIONS)).toBe(
      "week 67% (Tue 09:00)",
    );
  });

  it("explains that limits come later when there are none yet", () => {
    expect(formatStatusText(null, PARIS_DISPLAY_OPTIONS)).toBe(NO_LIMITS_TEXT);
    expect(
      formatStatusText(
        { fiveHour: null, sevenDay: null },
        PARIS_DISPLAY_OPTIONS,
      ),
    ).toBe(NO_LIMITS_TEXT);
  });
});
