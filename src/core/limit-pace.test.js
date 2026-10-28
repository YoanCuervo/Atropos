import { describe, expect, it } from "vitest";
import {
  WINDOW_DURATIONS_MS,
  computePaceDeltaPercentage,
} from "./limit-pace.js";

const HOUR_MS = 60 * 60 * 1000;
const NOW_MS = Date.parse("2026-10-28T08:00:00.000Z");

describe("computePaceDeltaPercentage", () => {
  it("is positive when usage is behind the elapsed share of the window", () => {
    const delta = computePaceDeltaPercentage(
      {
        windowKind: "five_hour",
        usedPercentage: 8,
        resetsAtMs: NOW_MS + 3 * HOUR_MS,
      },
      NOW_MS,
    );
    expect(delta).toBeCloseTo(32);
  });

  it("is negative when usage is ahead of the elapsed share", () => {
    const delta = computePaceDeltaPercentage(
      {
        windowKind: "seven_day",
        usedPercentage: 62,
        resetsAtMs: NOW_MS + 24 * HOUR_MS,
      },
      NOW_MS,
    );
    expect(delta).toBeCloseTo(100 * (6 / 7) - 62);
  });

  it("counts a window that has already reset as fully elapsed", () => {
    const delta = computePaceDeltaPercentage(
      {
        windowKind: "five_hour",
        usedPercentage: 40,
        resetsAtMs: NOW_MS - HOUR_MS,
      },
      NOW_MS,
    );
    expect(delta).toBeCloseTo(60);
  });

  it("counts a reset further away than the window as nothing elapsed", () => {
    const delta = computePaceDeltaPercentage(
      {
        windowKind: "five_hour",
        usedPercentage: 5,
        resetsAtMs: NOW_MS + WINDOW_DURATIONS_MS.five_hour + HOUR_MS,
      },
      NOW_MS,
    );
    expect(delta).toBeCloseTo(-5);
  });
});
