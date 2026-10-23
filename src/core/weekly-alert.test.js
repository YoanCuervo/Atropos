import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./settings.js";
import {
  formatWeeklyAlertText,
  shouldSendWeeklyAlert,
} from "./weekly-alert.js";

const NOW_MS = Date.parse("2026-10-23T12:00:00.000Z");

/**
 * @param {number} usedPercentage
 * @param {string} [resetsAt]
 */
function createSevenDaySnapshot(
  usedPercentage,
  resetsAt = "2026-10-29T08:00:00.000Z",
) {
  return {
    slotStartedAt: "2026-10-23T11:54:00.000Z",
    windowKind: "seven_day",
    usedPercentage,
    resetsAt,
  };
}

/**
 * @param {Partial<Parameters<typeof shouldSendWeeklyAlert>[0]>} overrides
 */
function decide(overrides) {
  return shouldSendWeeklyAlert({
    sevenDaySnapshot: createSevenDaySnapshot(85),
    settings: DEFAULT_SETTINGS,
    hasAlertBeenSent: false,
    nowMs: NOW_MS,
    ...overrides,
  });
}

describe("shouldSendWeeklyAlert", () => {
  it("alerts once the usage reaches the threshold", () => {
    expect(decide({})).toBe(true);
    expect(decide({ sevenDaySnapshot: createSevenDaySnapshot(80) })).toBe(true);
  });

  it("stays silent below the threshold", () => {
    expect(decide({ sevenDaySnapshot: createSevenDaySnapshot(79.9) })).toBe(
      false,
    );
  });

  it("follows the chosen threshold", () => {
    expect(
      decide({
        sevenDaySnapshot: createSevenDaySnapshot(60),
        settings: { ...DEFAULT_SETTINGS, weeklyAlertThresholdPercentage: 50 },
      }),
    ).toBe(true);
  });

  it("stays silent when the alert is turned off", () => {
    expect(
      decide({
        settings: { ...DEFAULT_SETTINGS, isWeeklyAlertEnabled: false },
      }),
    ).toBe(false);
  });

  it("stays silent without any snapshot", () => {
    expect(decide({ sevenDaySnapshot: null })).toBe(false);
  });

  it("alerts only once per window and threshold", () => {
    expect(decide({ hasAlertBeenSent: true })).toBe(false);
  });

  it("stays silent about a window that has already reset", () => {
    expect(
      decide({
        sevenDaySnapshot: createSevenDaySnapshot(
          95,
          "2026-10-22T08:00:00.000Z",
        ),
      }),
    ).toBe(false);
  });
});

describe("formatWeeklyAlertText", () => {
  it("gives the usage and the reset time", () => {
    expect(
      formatWeeklyAlertText(
        createSevenDaySnapshot(82.4),
        {
          title: "Atropos · weekly limit",
          body: "{percentage}% of your weekly limit is used. It resets {resetTime}.",
        },
        { locale: "en-GB", timeZone: "Europe/Paris" },
      ),
    ).toEqual({
      title: "Atropos · weekly limit",
      body: "82% of your weekly limit is used. It resets Thu 09:00.",
    });
  });
});
