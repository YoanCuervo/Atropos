import { formatClockTime } from "../../../core/date-display.js";
import { fillMessageTemplate } from "../../../core/message-template.js";
import { computeRingStroke } from "../../../core/ring-geometry.js";
import {
  CRITICAL_USAGE_PERCENTAGE,
  WARNING_USAGE_PERCENTAGE,
  classifyUsageLevel,
} from "../../../core/usage-level.js";

/** @typedef {import("../../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

const RING_RADIUS = 52;

/**
 * The five-hour window as a ring. The ring is decorative: the `<meter>` carries the value.
 *
 * @param {object} props
 * @param {LimitSnapshot} props.limitSnapshot Latest five-hour snapshot.
 * @param {{ locale: string, timeZone: string }} props.dateDisplayOptions
 * @param {Messages} props.messages Texts of the chosen language.
 */
function FiveHourRingCard({ limitSnapshot, dateDisplayOptions, messages }) {
  const { usedPercentage, resetsAt } = limitSnapshot;
  const usageLevel = classifyUsageLevel(usedPercentage);
  const usedPercentageText = fillMessageTemplate(messages.gauge.used, {
    percentage: Math.round(usedPercentage),
  });
  const { circumference, dashOffset } = computeRingStroke(
    usedPercentage / 100,
    RING_RADIUS,
  );

  return (
    <section className="card ring-card" aria-labelledby="five-hour-title">
      <h3 id="five-hour-title" className="card__title">
        {messages.limits.fiveHourTitle}
      </h3>
      <div className="ring-card__ring">
        <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <circle
            className="ring-card__track"
            cx="60"
            cy="60"
            r={RING_RADIUS}
          />
          <circle
            className={`ring-card__arc ring-card__arc--${usageLevel}`}
            cx="60"
            cy="60"
            r={RING_RADIUS}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <label className="ring-card__percentage" htmlFor="five-hour-meter">
          {Math.round(usedPercentage)}
          <span className="ring-card__unit">%</span>
        </label>
      </div>
      <meter
        id="five-hour-meter"
        className="visually-hidden"
        min={0}
        max={100}
        low={WARNING_USAGE_PERCENTAGE}
        high={CRITICAL_USAGE_PERCENTAGE}
        optimum={0}
        value={Math.min(usedPercentage, 100)}
      >
        {usedPercentageText}
      </meter>
      <p className="ring-card__level">{messages.usageLevels[usageLevel]}</p>
      <p className="ring-card__reset">
        {messages.gauge.resetsPrefix}{" "}
        <time dateTime={resetsAt}>
          {fillMessageTemplate(messages.limits.fiveHourReset, {
            time: formatClockTime(Date.parse(resetsAt), dateDisplayOptions),
          })}
        </time>
      </p>
    </section>
  );
}

export default FiveHourRingCard;
