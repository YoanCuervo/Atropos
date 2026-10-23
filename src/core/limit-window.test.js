import { describe, expect, it } from "vitest";
import { computeWindowResetMs } from "./limit-window.js";

/**
 * @param {string} resetsAt
 */
function createSnapshot(resetsAt) {
  return {
    slotStartedAt: "2026-10-23T12:00:00.000Z",
    windowKind: "seven_day",
    usedPercentage: 14,
    resetsAt,
  };
}

describe("computeWindowResetMs", () => {
  it("rounds reset times a few seconds apart to the same hour", () => {
    expect(
      computeWindowResetMs(createSnapshot("2026-10-29T07:59:58.000Z")),
    ).toBe(computeWindowResetMs(createSnapshot("2026-10-29T08:00:03.000Z")));
    expect(
      computeWindowResetMs(createSnapshot("2026-10-29T07:59:58.000Z")),
    ).toBe(Date.parse("2026-10-29T08:00:00.000Z"));
  });
});
