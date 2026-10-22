import { describe, expect, it } from "vitest";
import { summarizeHistoryByDay } from "./history-table.js";

/**
 * @param {string} slotStartedAt
 * @param {"five_hour" | "seven_day"} windowKind
 * @param {number} usedPercentage
 */
function createSnapshot(slotStartedAt, windowKind, usedPercentage) {
  return {
    slotStartedAt,
    windowKind,
    usedPercentage,
    resetsAt: "2026-10-29T08:00:00.000Z",
  };
}

const PERIOD = {
  startMs: Date.parse("2026-10-20T10:00:00.000Z"),
  endMs: Date.parse("2026-10-22T10:00:00.000Z"),
  timeZone: "UTC",
};

describe("summarizeHistoryByDay", () => {
  it("gives every day of the period a row, oldest first, even without snapshots", () => {
    const rows = summarizeHistoryByDay({
      fiveHourSnapshots: [],
      sevenDaySnapshots: [],
      ...PERIOD,
    });

    expect(rows.map((row) => row.dayKey)).toEqual([
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
    ]);
    expect(rows.every((row) => row.highestFiveHourPercentage === null)).toBe(
      true,
    );
    expect(rows.every((row) => row.lastSevenDayPercentage === null)).toBe(true);
  });

  it("keeps the highest session usage and the last weekly usage of each day", () => {
    const rows = summarizeHistoryByDay({
      fiveHourSnapshots: [
        createSnapshot("2026-10-21T09:00:00.000Z", "five_hour", 40),
        createSnapshot("2026-10-21T13:00:00.000Z", "five_hour", 85),
        createSnapshot("2026-10-21T19:00:00.000Z", "five_hour", 12),
      ],
      sevenDaySnapshots: [
        createSnapshot("2026-10-21T09:00:00.000Z", "seven_day", 20),
        createSnapshot("2026-10-21T19:00:00.000Z", "seven_day", 31),
      ],
      ...PERIOD,
    });

    expect(rows[1]).toMatchObject({
      dayKey: "2026-10-21",
      highestFiveHourPercentage: 85,
      lastSevenDayPercentage: 31,
    });
  });

  it("groups snapshots by day in the given time zone", () => {
    const rows = summarizeHistoryByDay({
      fiveHourSnapshots: [],
      sevenDaySnapshots: [
        createSnapshot("2026-10-20T23:30:00.000Z", "seven_day", 50),
      ],
      ...PERIOD,
      timeZone: "Europe/Paris",
    });

    expect(
      rows.find((row) => row.dayKey === "2026-10-21").lastSevenDayPercentage,
    ).toBe(50);
  });

  it("does not skip the day the clocks go back", () => {
    const rows = summarizeHistoryByDay({
      fiveHourSnapshots: [],
      sevenDaySnapshots: [],
      startMs: Date.parse("2026-10-24T12:00:00.000Z"),
      endMs: Date.parse("2026-10-26T12:00:00.000Z"),
      timeZone: "Europe/Paris",
    });

    expect(rows.map((row) => row.dayKey)).toEqual([
      "2026-10-24",
      "2026-10-25",
      "2026-10-26",
    ]);
  });
});
