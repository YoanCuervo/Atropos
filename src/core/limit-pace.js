/** @typedef {import("./rate-limits.js").LimitWindow} LimitWindow */
/** @typedef {import("./rate-limits.js").WindowKind} WindowKind */
/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/** @type {Readonly<Record<WindowKind, number>>} */
export const WINDOW_DURATIONS_MS = Object.freeze({
  five_hour: 5 * MILLISECONDS_PER_HOUR,
  seven_day: 7 * 24 * MILLISECONDS_PER_HOUR,
});

/**
 * Compares usage with a steady pace: the share of the window already elapsed
 * minus the share used. Positive means usage is behind the pace, so there is margin left.
 *
 * @param {LimitWindow} limitWindow
 * @param {number} nowMs
 * @returns {number} Percentage points, e.g. 3.8 or -12.
 */
export function computePaceDeltaPercentage(limitWindow, nowMs) {
  const windowDurationMs = WINDOW_DURATIONS_MS[limitWindow.windowKind];
  const elapsedMs = Math.min(
    Math.max(windowDurationMs - (limitWindow.resetsAtMs - nowMs), 0),
    windowDurationMs,
  );
  return (elapsedMs / windowDurationMs) * 100 - limitWindow.usedPercentage;
}

/**
 * Reads a recorded snapshot as a limit window, so the pace can be computed from the history.
 *
 * @param {LimitSnapshot} limitSnapshot
 * @returns {LimitWindow}
 */
export function convertSnapshotToLimitWindow(limitSnapshot) {
  return {
    windowKind: limitSnapshot.windowKind,
    usedPercentage: limitSnapshot.usedPercentage,
    resetsAtMs: Date.parse(limitSnapshot.resetsAt),
  };
}
