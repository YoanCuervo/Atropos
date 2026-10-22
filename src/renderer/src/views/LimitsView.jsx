import {
  formatClockTime,
  formatWeekdayAndClockTime,
} from "../../../core/date-display.js";
import { fillMessageTemplate } from "../../../core/message-template.js";
import LimitGauge from "../components/LimitGauge.jsx";
import { useLimitsOverview } from "../hooks/useLimitsOverview.js";

/** @typedef {import("../../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * The current state of both usage limits, kept up to date by the main process.
 *
 * @param {object} props
 * @param {Messages} props.messages Texts of the chosen language.
 */
function LimitsView({ messages }) {
  const { status, limitsOverview, reloadLimitsOverview } = useLimitsOverview();
  const limitsMessages = messages.limits;
  const dateDisplayOptions = {
    locale: messages.dateLocale,
    timeZone: TIME_ZONE,
  };

  if (status === "loading") {
    return (
      <p className="limits-view__message" role="status">
        {limitsMessages.loading}
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="limits-view__message" role="alert">
        <p>{limitsMessages.loadError}</p>
        <button
          type="button"
          className="limits-view__button"
          onClick={reloadLimitsOverview}
        >
          {limitsMessages.retry}
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <section className="limits-view__message" aria-labelledby="empty-title">
        <h2 id="empty-title">{limitsMessages.emptyTitle}</h2>
        <p>{limitsMessages.emptyText}</p>
      </section>
    );
  }

  const { fiveHour, sevenDay } = limitsOverview;
  const latestSnapshot = findLatestSnapshot([fiveHour, sevenDay]);

  return (
    <div className="limits-view">
      <div className="limits-view__gauges">
        <LimitGauge
          gaugeId="five-hour"
          title={limitsMessages.fiveHourTitle}
          limitSnapshot={fiveHour}
          resetText={
            fiveHour === null
              ? ""
              : fillMessageTemplate(limitsMessages.fiveHourReset, {
                  time: formatClockTime(
                    Date.parse(fiveHour.resetsAt),
                    dateDisplayOptions,
                  ),
                })
          }
          gaugeMessages={messages.gauge}
        />
        <LimitGauge
          gaugeId="seven-day"
          title={limitsMessages.sevenDayTitle}
          limitSnapshot={sevenDay}
          resetText={
            sevenDay === null
              ? ""
              : formatWeekdayAndClockTime(
                  Date.parse(sevenDay.resetsAt),
                  dateDisplayOptions,
                )
          }
          gaugeMessages={messages.gauge}
        />
      </div>
      <p className="limits-view__updated">
        {limitsMessages.updatedPrefix}{" "}
        <time dateTime={latestSnapshot.slotStartedAt}>
          {formatWeekdayAndClockTime(
            Date.parse(latestSnapshot.slotStartedAt),
            dateDisplayOptions,
          )}
        </time>
      </p>
    </div>
  );
}

/**
 * @param {(LimitSnapshot | null)[]} limitSnapshots
 * @returns {LimitSnapshot} The snapshot taken in the most recent slot.
 */
function findLatestSnapshot(limitSnapshots) {
  return limitSnapshots
    .filter((limitSnapshot) => limitSnapshot !== null)
    .reduce((latest, candidate) =>
      candidate.slotStartedAt > latest.slotStartedAt ? candidate : latest,
    );
}

export default LimitsView;
