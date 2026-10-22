import { describe, expect, it } from "vitest";
import { computeRetentionCutoffMs } from "./history-retention.js";

describe("computeRetentionCutoffMs", () => {
  it("goes back twelve calendar months", () => {
    const nowMs = Date.UTC(2026, 9, 22, 14, 6, 0, 0);

    expect(computeRetentionCutoffMs(nowMs)).toBe(
      Date.UTC(2025, 9, 22, 14, 6, 0, 0),
    );
  });

  it("keeps the last day of a month", () => {
    const nowMs = Date.UTC(2026, 2, 31, 23, 59, 0, 0);

    expect(computeRetentionCutoffMs(nowMs)).toBe(
      Date.UTC(2025, 2, 31, 23, 59, 0, 0),
    );
  });

  it("moves a leap day to the first of March of the previous year", () => {
    const leapDayMs = Date.UTC(2028, 1, 29, 12, 0, 0, 0);

    expect(computeRetentionCutoffMs(leapDayMs)).toBe(
      Date.UTC(2027, 2, 1, 12, 0, 0, 0),
    );
  });
});
