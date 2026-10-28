import {
  formatRemainingTime,
  formatSignedPercentage,
} from "../../../core/band-text.js";
import { formatWeekdayAndClockTime } from "../../../core/date-display.js";
import {
  computePaceDeltaPercentage,
  convertSnapshotToLimitWindow,
} from "../../../core/limit-pace.js";
import { fillMessageTemplate } from "../../../core/message-template.js";
import {
  CRITICAL_USAGE_PERCENTAGE,
  WARNING_USAGE_PERCENTAGE,
  classifyUsageLevel,
} from "../../../core/usage-level.js";
import { describeWeeklyDifference } from "../../../core/weekly-comparison.js";

/** @typedef {import("../../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("../../../core/weekly-comparison.js").WeeklyComparison} WeeklyComparison */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * The main card: the weekly limit, its level, when it resets, and three figures around it.
 *
 * @param {object} props
 * @param {LimitSnapshot} props.limitSnapshot Latest weekly snapshot.
 * @param {WeeklyComparison | null} props.weeklyComparison `null` while the history is unknown.
 * @param {number} props.currentTimeMs
 * @param {{ locale: string, timeZone: string }} props.dateDisplayOptions
 * @param {Messages} props.messages Texts of the chosen language.
 */
function WeeklyLimitCard({
  limitSnapshot,
  weeklyComparison,
  currentTimeMs,
  dateDisplayOptions,
  messages,
}) {
  const limitsMessages = messages.limits;
  const { usedPercentage, resetsAt } = limitSnapshot;
  const usageLevel = classifyUsageLevel(usedPercentage);
  const usedPercentageText = fillMessageTemplate(messages.gauge.used, {
    percentage: Math.round(usedPercentage),
  });
  const paceDelta = computePaceDeltaPercentage(
    convertSnapshotToLimitWindow(limitSnapshot),
    currentTimeMs,
  );
  const tiles = [
    {
      label: limitsMessages.paceLabel,
      value: formatSignedPercentage(paceDelta, messages.dateLocale),
    },
    {
      label: limitsMessages.remainingLabel,
      value: formatRemainingTime(
        Date.parse(resetsAt) - currentTimeMs,
        messages.band,
      ),
    },
    {
      label: limitsMessages.comparisonLabel,
      value:
        weeklyComparison?.previousPercentageAtSamePoint == null
          ? limitsMessages.notRecorded
          : describeWeeklyDifference(
              usedPercentage,
              weeklyComparison.previousPercentageAtSamePoint,
              messages.comparison,
            ),
    },
  ];

  return (
    <section
      className="card card--wide weekly-limit-card"
      aria-labelledby="weekly-limit-title"
    >
      <div className="weekly-limit-card__header">
        <h3 id="weekly-limit-title" className="card__title">
          {limitsMessages.sevenDayTitle}
        </h3>
        <p className={`status-pill status-pill--${usageLevel}`}>
          {messages.usageLevels[usageLevel]}
        </p>
      </div>
      <label
        className="weekly-limit-card__percentage"
        htmlFor="weekly-limit-meter"
      >
        {usedPercentageText}
      </label>
      <meter
        id="weekly-limit-meter"
        className="weekly-limit-card__meter"
        min={0}
        max={100}
        low={WARNING_USAGE_PERCENTAGE}
        high={CRITICAL_USAGE_PERCENTAGE}
        optimum={0}
        value={Math.min(usedPercentage, 100)}
      >
        {usedPercentageText}
      </meter>
      <p className="weekly-limit-card__reset">
        {messages.gauge.resetsPrefix}{" "}
        <time dateTime={resetsAt}>
          {formatWeekdayAndClockTime(Date.parse(resetsAt), dateDisplayOptions)}
        </time>
      </p>
      <dl className="weekly-limit-card__tiles">
        {tiles.map(({ label, value }) => (
          <div key={label} className="weekly-limit-card__tile">
            <dt className="weekly-limit-card__tile-label">{label}</dt>
            <dd className="weekly-limit-card__tile-value">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default WeeklyLimitCard;
