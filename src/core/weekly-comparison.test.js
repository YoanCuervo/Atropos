import { describe, expect, it } from "vitest";
import { compareWithPreviousWeek } from "./weekly-comparison.js";

const CURRENT_RESET = "2026-10-29T08:00:00.000Z";
const PREVIOUS_RESET = "2026-10-22T08:00:00.000Z";

/**
 * @param {string} slotStartedAt
 * @param {number} usedPercentage
 * @param {string} resetsAt
 */
function createSnapshot(slotStartedAt, usedPercentage, resetsAt) {
  return { slotStartedAt, windowKind: "seven_day", usedPercentage, resetsAt };
}

describe("compareWithPreviousWeek", () => {
  it("returns null without snapshots", () => {
    expect(compareWithPreviousWeek([])).toBeNull();
  });

  it("compares with the previous week at the same point of its window", () => {
    expect(
      compareWithPreviousWeek([
        createSnapshot("2026-10-16T12:00:00.000Z", 10, PREVIOUS_RESET),
        createSnapshot("2026-10-17T12:00:00.000Z", 22, PREVIOUS_RESET),
        createSnapshot("2026-10-21T12:00:00.000Z", 70, PREVIOUS_RESET),
        createSnapshot("2026-10-24T12:00:00.000Z", 14, CURRENT_RESET),
      ]),
    ).toEqual({
      currentPercentage: 14,
      previousPercentageAtSamePoint: 22,
      previousLastPercentage: 70,
    });
  });

  it("treats reset times a few seconds apart as the same window", () => {
    expect(
      compareWithPreviousWeek([
        createSnapshot(
          "2026-10-17T12:00:00.000Z",
          22,
          "2026-10-22T07:59:59.000Z",
        ),
        createSnapshot(
          "2026-10-24T12:00:00.000Z",
          14,
          "2026-10-29T08:00:01.000Z",
        ),
      ]).previousPercentageAtSamePoint,
    ).toBe(22);
  });

  it("leaves the same point unknown when the previous week started being recorded later", () => {
    expect(
      compareWithPreviousWeek([
        createSnapshot("2026-10-20T12:00:00.000Z", 40, PREVIOUS_RESET),
        createSnapshot("2026-10-24T12:00:00.000Z", 14, CURRENT_RESET),
      ]),
    ).toEqual({
      currentPercentage: 14,
      previousPercentageAtSamePoint: null,
      previousLastPercentage: 40,
    });
  });

  it("ignores windows older than the previous week", () => {
    expect(
      compareWithPreviousWeek([
        createSnapshot(
          "2026-10-10T12:00:00.000Z",
          90,
          "2026-10-15T08:00:00.000Z",
        ),
        createSnapshot("2026-10-24T12:00:00.000Z", 14, CURRENT_RESET),
      ]),
    ).toEqual({
      currentPercentage: 14,
      previousPercentageAtSamePoint: null,
      previousLastPercentage: null,
    });
  });
});
