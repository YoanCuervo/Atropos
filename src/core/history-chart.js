import { SLOT_DURATION_MS } from "./time-slots.js";

/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */

/**
 * @typedef {object} ChartPoint
 * @property {number} timeMs Start of the slot, as a Unix timestamp in milliseconds.
 * @property {number | null} usedPercentage `null` marks a break in the line.
 */

/** Longer than this without a snapshot, the line breaks instead of joining the two ends. */
export const CHART_GAP_MS = 30 * 60 * 1000;

/**
 * Turns the snapshots of one window into the points of its line. Snapshots only exist
 * while Claude Code runs, so a long gap gets a break point rather than a made-up slope.
 *
 * @param {LimitSnapshot[]} limitSnapshots Snapshots of one window, oldest first.
 * @returns {ChartPoint[]}
 */
export function buildChartPoints(limitSnapshots) {
  return limitSnapshots.flatMap((limitSnapshot, index) => {
    const point = {
      timeMs: Date.parse(limitSnapshot.slotStartedAt),
      usedPercentage: limitSnapshot.usedPercentage,
    };
    if (index === 0) {
      return [point];
    }

    const previousTimeMs = Date.parse(limitSnapshots[index - 1].slotStartedAt);
    return point.timeMs - previousTimeMs > CHART_GAP_MS
      ? [
          { timeMs: previousTimeMs + SLOT_DURATION_MS, usedPercentage: null },
          point,
        ]
      : [point];
  });
}
