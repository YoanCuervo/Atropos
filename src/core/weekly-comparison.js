/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */

/**
 * @typedef {object} WeeklyComparison
 * @property {number} currentPercentage Latest weekly usage.
 * @property {number | null} previousPercentageAtSamePoint Usage of the previous week as far into its window, or `null` when unknown.
 * @property {number | null} previousLastPercentage Last usage recorded in the previous week, or `null` without snapshots.
 */

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_WEEK = 7 * 24 * MILLISECONDS_PER_HOUR;

/**
 * Compares the current weekly window with the previous one, at the same point of the window.
 * Usage only grows within a window, so the last snapshot taken before that point
 * is the best known value of the previous week.
 *
 * @param {LimitSnapshot[]} sevenDaySnapshots Weekly snapshots of at least the last fourteen days, oldest first.
 * @returns {WeeklyComparison | null} `null` without any snapshot.
 */
export function compareWithPreviousWeek(sevenDaySnapshots) {
  const latestSnapshot = sevenDaySnapshots.at(-1);
  if (latestSnapshot === undefined) {
    return null;
  }

  const previousWindowResetMs =
    computeWindowResetMs(latestSnapshot) - MILLISECONDS_PER_WEEK;
  const samePointLastWeekMs =
    Date.parse(latestSnapshot.slotStartedAt) - MILLISECONDS_PER_WEEK;
  const previousWindowSnapshots = sevenDaySnapshots.filter(
    (limitSnapshot) =>
      computeWindowResetMs(limitSnapshot) === previousWindowResetMs,
  );
  const snapshotsBeforeSamePoint = previousWindowSnapshots.filter(
    (limitSnapshot) =>
      Date.parse(limitSnapshot.slotStartedAt) <= samePointLastWeekMs,
  );

  return {
    currentPercentage: latestSnapshot.usedPercentage,
    previousPercentageAtSamePoint:
      snapshotsBeforeSamePoint.at(-1)?.usedPercentage ?? null,
    previousLastPercentage:
      previousWindowSnapshots.at(-1)?.usedPercentage ?? null,
  };
}

/**
 * Identifies the weekly window of a snapshot by its reset time, rounded to the hour
 * so that small variations between snapshots of one window do not split it.
 *
 * @param {LimitSnapshot} limitSnapshot
 * @returns {number}
 */
function computeWindowResetMs(limitSnapshot) {
  return (
    Math.round(Date.parse(limitSnapshot.resetsAt) / MILLISECONDS_PER_HOUR) *
    MILLISECONDS_PER_HOUR
  );
}
