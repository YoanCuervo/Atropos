const GAUGE_LOW_PERCENTAGE = 50;
const GAUGE_HIGH_PERCENTAGE = 80;

import { fillMessageTemplate } from "../../../core/message-template.js";

/** @typedef {import("../../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * One usage limit: its title, how much is used, and when it resets.
 * The percentage is written out in full, so the meter's colour is never the only signal.
 *
 * @param {object} props
 * @param {string} props.gaugeId Unique prefix for the ids linking the title, label and meter.
 * @param {string} props.title e.g. "Session (5 hours)".
 * @param {LimitSnapshot | null} props.limitSnapshot Latest snapshot of the window, or `null` when none exists.
 * @param {string} props.resetText Reset time as displayed, e.g. "at 22:40" or "Thu 09:00".
 * @param {Messages["gauge"]} props.gaugeMessages Texts of the chosen language.
 */
function LimitGauge({
  gaugeId,
  title,
  limitSnapshot,
  resetText,
  gaugeMessages,
}) {
  const titleId = `${gaugeId}-title`;
  const meterId = `${gaugeId}-meter`;

  if (limitSnapshot === null) {
    return (
      <section className="limit-gauge" aria-labelledby={titleId}>
        <h2 id={titleId} className="limit-gauge__title">
          {title}
        </h2>
        <p className="limit-gauge__missing">{gaugeMessages.missing}</p>
      </section>
    );
  }

  const roundedPercentage = Math.round(limitSnapshot.usedPercentage);
  const usedPercentageText = fillMessageTemplate(gaugeMessages.used, {
    percentage: roundedPercentage,
  });

  return (
    <section className="limit-gauge" aria-labelledby={titleId}>
      <h2 id={titleId} className="limit-gauge__title">
        {title}
      </h2>
      <label className="limit-gauge__percentage" htmlFor={meterId}>
        {usedPercentageText}
      </label>
      <meter
        id={meterId}
        className="limit-gauge__meter"
        min={0}
        max={100}
        low={GAUGE_LOW_PERCENTAGE}
        high={GAUGE_HIGH_PERCENTAGE}
        optimum={0}
        value={Math.min(limitSnapshot.usedPercentage, 100)}
      >
        {usedPercentageText}
      </meter>
      <p className="limit-gauge__reset">
        {gaugeMessages.resetsPrefix}{" "}
        <time dateTime={limitSnapshot.resetsAt}>{resetText}</time>
      </p>
    </section>
  );
}

export default LimitGauge;
