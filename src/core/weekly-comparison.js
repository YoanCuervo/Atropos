import { computeWindowResetMs } from "./limit-window.js";
import { fillMessageTemplate } from "./message-template.js";

/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */

/**
 * @typedef {object} WeeklyComparison
 * @property {number} currentPercentage Latest weekly usage.
 * @property {number | null} previousPercentageAtSamePoint Usage of the previous week as far into its window, or `null` when unknown.
 * @property {number | null} previousLastPercentage Last usage recorded in the previous week, or `null` without snapshots.
 */

/**
 * @typedef {object} DifferenceMessages
 * @property {string} same e.g. "Same as last week".
 * @property {string} onePointLess
 * @property {string} pointsLess e.g. "{points} points less".
 * @property {string} onePointMore
 * @property {string} pointsMore e.g. "{points} points more".
 */

const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

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
 * Writes the gap with the previous week in words, so it is never told by colour alone.
 *
 * @param {number} currentPercentage
 * @param {number} previousPercentage
 * @param {DifferenceMessages} differenceMessages Texts of the chosen language.
 * @returns {string} e.g. "8 points less", compared on whole percentages as displayed.
 */
export function describeWeeklyDifference(
  currentPercentage,
  previousPercentage,
  differenceMessages,
) {
  const differencePoints =
    Math.round(currentPercentage) - Math.round(previousPercentage);
  if (differencePoints === 0) {
    return differenceMessages.same;
  }
  const points = Math.abs(differencePoints);
  if (differencePoints < 0) {
    return points === 1
      ? differenceMessages.onePointLess
      : fillMessageTemplate(differenceMessages.pointsLess, { points });
  }
  return points === 1
    ? differenceMessages.onePointMore
    : fillMessageTemplate(differenceMessages.pointsMore, { points });
}
