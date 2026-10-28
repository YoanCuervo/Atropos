import { describe, expect, it } from "vitest";
import { formatTrayTooltip } from "./tray-text.js";

const PARIS_DISPLAY_OPTIONS = { locale: "en-GB", timeZone: "Europe/Paris" };

const TRAY_MESSAGES = {
  tooltip:
    "Atropos · week {percentage}% · resets {resetTime} · updated {updateTime}",
  noLimitsTooltip: "Atropos · no limits recorded yet",
};

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
      formatTrayTooltip(
        createSevenDaySnapshot(),
        TRAY_MESSAGES,
        PARIS_DISPLAY_OPTIONS,
      ),
    ).toBe("Atropos · week 67% · resets Tue 09:00 · updated Thu 14:06");
  });

  it("says so when nothing has been recorded yet", () => {
    expect(formatTrayTooltip(null, TRAY_MESSAGES, PARIS_DISPLAY_OPTIONS)).toBe(
      TRAY_MESSAGES.noLimitsTooltip,
    );
  });
});
