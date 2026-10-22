import { describe, expect, it } from "vitest";
import { buildChartPoints } from "./history-chart.js";

/**
 * @param {string} slotStartedAt
 * @param {number} usedPercentage
 */
function createSnapshot(slotStartedAt, usedPercentage) {
  return {
    slotStartedAt,
    windowKind: "seven_day",
    usedPercentage,
    resetsAt: "2026-10-29T08:00:00.000Z",
  };
}

describe("buildChartPoints", () => {
  it("returns no point without snapshots", () => {
    expect(buildChartPoints([])).toEqual([]);
  });

  it("joins snapshots taken in consecutive slots", () => {
    expect(
      buildChartPoints([
        createSnapshot("2026-10-22T12:00:00.000Z", 10),
        createSnapshot("2026-10-22T12:06:00.000Z", 11),
      ]),
    ).toEqual([
      { timeMs: Date.parse("2026-10-22T12:00:00.000Z"), usedPercentage: 10 },
      { timeMs: Date.parse("2026-10-22T12:06:00.000Z"), usedPercentage: 11 },
    ]);
  });

  it("keeps the line through a gap of thirty minutes", () => {
    expect(
      buildChartPoints([
        createSnapshot("2026-10-22T12:00:00.000Z", 10),
        createSnapshot("2026-10-22T12:30:00.000Z", 12),
      ]),
    ).toHaveLength(2);
  });

  it("breaks the line after a longer gap", () => {
    expect(
      buildChartPoints([
        createSnapshot("2026-10-22T12:00:00.000Z", 10),
        createSnapshot("2026-10-22T18:00:00.000Z", 20),
      ]),
    ).toEqual([
      { timeMs: Date.parse("2026-10-22T12:00:00.000Z"), usedPercentage: 10 },
      { timeMs: Date.parse("2026-10-22T12:06:00.000Z"), usedPercentage: null },
      { timeMs: Date.parse("2026-10-22T18:00:00.000Z"), usedPercentage: 20 },
    ]);
  });
});
