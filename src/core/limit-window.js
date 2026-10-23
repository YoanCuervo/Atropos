/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/**
 * Identifies the window of a snapshot by its reset time, rounded to the hour
 * so that small variations between snapshots of one window do not split it.
 *
 * @param {LimitSnapshot} limitSnapshot
 * @returns {number} Unix timestamp, in milliseconds.
 */
export function computeWindowResetMs(limitSnapshot) {
  return (
    Math.round(Date.parse(limitSnapshot.resetsAt) / MILLISECONDS_PER_HOUR) *
    MILLISECONDS_PER_HOUR
  );
}
