import {
  formatClockTime,
  formatWeekdayAndClockTime,
} from "../../../core/date-display.js";
import LimitGauge from "../components/LimitGauge.jsx";
import { useLimitsOverview } from "../hooks/useLimitsOverview.js";

/** @typedef {import("../../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */

const DATE_DISPLAY_OPTIONS = {
  locale: "en-GB",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

/**
 * The current state of both usage limits, kept up to date by the main process.
 */
function LimitsView() {
  const { status, limitsOverview, reloadLimitsOverview } = useLimitsOverview();

  if (status === "loading") {
    return (
      <p className="limits-view__message" role="status">
        Loading limits…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="limits-view__message" role="alert">
        <p>Atropos could not read the limits.</p>
        <button
          type="button"
          className="limits-view__button"
          onClick={reloadLimitsOverview}
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <section className="limits-view__message" aria-labelledby="empty-title">
        <h2 id="empty-title">No limits recorded yet</h2>
        <p>
          Limits are recorded by the Claude Code status line. Open Claude Code
          in a terminal and send a message: they appear here within six minutes.
        </p>
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
          title="Session (5 hours)"
          limitSnapshot={fiveHour}
          resetText={
            fiveHour === null
              ? ""
              : `at ${formatClockTime(Date.parse(fiveHour.resetsAt), DATE_DISPLAY_OPTIONS)}`
          }
        />
        <LimitGauge
          gaugeId="seven-day"
          title="Week"
          limitSnapshot={sevenDay}
          resetText={
            sevenDay === null
              ? ""
              : formatWeekdayAndClockTime(
                  Date.parse(sevenDay.resetsAt),
                  DATE_DISPLAY_OPTIONS,
                )
          }
        />
      </div>
      <p className="limits-view__updated">
        Updated{" "}
        <time dateTime={latestSnapshot.slotStartedAt}>
          {formatWeekdayAndClockTime(
            Date.parse(latestSnapshot.slotStartedAt),
            DATE_DISPLAY_OPTIONS,
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
