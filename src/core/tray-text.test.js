import { describe, expect, it } from "vitest";
import { NO_LIMITS_RECORDED_TOOLTIP, formatTrayTooltip } from "./tray-text.js";

const PARIS_DISPLAY_OPTIONS = { locale: "en-GB", timeZone: "Europe/Paris" };

function createSevenDaySnapshot() {
  return {
    slotStartedAt: "2026-10-22T12:06:00.000Z",
    windowKind: "seven_day",
    usedPercentage: 67.4,
    resetsAt: "2026-10-27T08:00:00.000Z",
  };
}

describe("formatTrayTooltip", () => {
  it("shows the weekly usage, its reset and when it was recorded", () => {
    expect(
      formatTrayTooltip(createSevenDaySnapshot(), PARIS_DISPLAY_OPTIONS),
    ).toBe("Atropos · week 67% · resets Tue 09:00 · updated Thu 14:06");
  });

  it("says so when nothing has been recorded yet", () => {
    expect(formatTrayTooltip(null, PARIS_DISPLAY_OPTIONS)).toBe(
      NO_LIMITS_RECORDED_TOOLTIP,
    );
  });

  it("stays within the 127 characters Windows allows for a tray tooltip", () => {
    const longestSnapshot = {
      ...createSevenDaySnapshot(),
      usedPercentage: 100,
    };

    expect(
      formatTrayTooltip(longestSnapshot, PARIS_DISPLAY_OPTIONS).length,
    ).toBeLessThanOrEqual(127);
  });
});
