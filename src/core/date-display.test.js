import { describe, expect, it } from "vitest";
import { formatCalendarDayKey, formatShortDate } from "./date-display.js";

const THURSDAY_LATE_EVENING_UTC_MS = Date.parse("2026-10-22T22:30:00.000Z");

describe("formatShortDate", () => {
  it("writes the weekday, day and month in English", () => {
    expect(
      formatShortDate(THURSDAY_LATE_EVENING_UTC_MS, {
        locale: "en-GB",
        timeZone: "UTC",
      }),
    ).toBe("Thu 22 Oct");
  });

  it("writes the weekday, day and month in French", () => {
    expect(
      formatShortDate(THURSDAY_LATE_EVENING_UTC_MS, {
        locale: "fr-FR",
        timeZone: "UTC",
      }),
    ).toBe("jeu. 22 oct.");
  });
});

describe("formatCalendarDayKey", () => {
  it("names the day in the given time zone", () => {
    expect(formatCalendarDayKey(THURSDAY_LATE_EVENING_UTC_MS, "UTC")).toBe(
      "2026-10-22",
    );
    expect(
      formatCalendarDayKey(THURSDAY_LATE_EVENING_UTC_MS, "Europe/Paris"),
    ).toBe("2026-10-23");
  });
});
