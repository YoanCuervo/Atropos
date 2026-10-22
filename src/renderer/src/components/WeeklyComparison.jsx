import { fillMessageTemplate } from "../../../core/message-template.js";

/** @typedef {import("../../../core/weekly-comparison.js").WeeklyComparison} WeeklyComparison */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * Usage of the current week next to the previous one, at the same point of the window and at its end.
 *
 * @param {object} props
 * @param {WeeklyComparison} props.weeklyComparison
 * @param {Messages["comparison"]} props.comparisonMessages
 * @param {Messages["history"]} props.historyMessages
 */
function WeeklyComparison({
  weeklyComparison,
  comparisonMessages,
  historyMessages,
}) {
  const formatPercentage = (percentage) =>
    percentage === null
      ? comparisonMessages.notRecorded
      : fillMessageTemplate(historyMessages.percentage, {
          percentage: Math.round(percentage),
        });
  const {
    currentPercentage,
    previousPercentageAtSamePoint,
    previousLastPercentage,
  } = weeklyComparison;

  return (
    <section className="weekly-comparison" aria-labelledby="comparison-title">
      <h3 id="comparison-title" className="weekly-comparison__title">
        {comparisonMessages.title}
      </h3>
      <dl className="weekly-comparison__figures">
        <div className="weekly-comparison__figure">
          <dt>{comparisonMessages.current}</dt>
          <dd>{formatPercentage(currentPercentage)}</dd>
        </div>
        <div className="weekly-comparison__figure">
          <dt>{comparisonMessages.samePoint}</dt>
          <dd>{formatPercentage(previousPercentageAtSamePoint)}</dd>
        </div>
        <div className="weekly-comparison__figure">
          <dt>{comparisonMessages.previousLast}</dt>
          <dd>{formatPercentage(previousLastPercentage)}</dd>
        </div>
      </dl>
      {previousPercentageAtSamePoint !== null && (
        <p className="weekly-comparison__difference">
          {describeDifference(
            Math.round(currentPercentage) -
              Math.round(previousPercentageAtSamePoint),
            comparisonMessages,
          )}
        </p>
      )}
    </section>
  );
}

/**
 * @param {number} differencePoints Current week minus previous week, in percentage points.
 * @param {Messages["comparison"]} comparisonMessages
 * @returns {string} e.g. "8 points less".
 */
function describeDifference(differencePoints, comparisonMessages) {
  if (differencePoints === 0) {
    return comparisonMessages.same;
  }
  const points = Math.abs(differencePoints);
  if (differencePoints < 0) {
    return points === 1
      ? comparisonMessages.onePointLess
      : fillMessageTemplate(comparisonMessages.pointsLess, { points });
  }
  return points === 1
    ? comparisonMessages.onePointMore
    : fillMessageTemplate(comparisonMessages.pointsMore, { points });
}

export default WeeklyComparison;
