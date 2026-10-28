import { compareWithPreviousWeek } from "../../../core/weekly-comparison.js";
import FiveHourRingCard from "../components/FiveHourRingCard.jsx";
import WeeklyLimitCard from "../components/WeeklyLimitCard.jsx";
import { useCurrentTimeMs } from "../hooks/useCurrentTimeMs.js";
import { useLimitHistory } from "../hooks/useLimitHistory.js";

/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const COMPARISON_PERIOD_DAY_COUNT = 7;

/**
 * The current state of both usage limits, kept up to date by the main process.
 *
 * @param {object} props
 * @param {import("../hooks/useLimitsOverview.js").LimitsOverviewState} props.limitsOverviewState
 * @param {Messages} props.messages Texts of the chosen language.
 */
function LimitsView({ limitsOverviewState, messages }) {
  const { status, limitsOverview, reloadLimitsOverview } = limitsOverviewState;
  const { limitHistory } = useLimitHistory(COMPARISON_PERIOD_DAY_COUNT);
  const currentTimeMs = useCurrentTimeMs();
  const limitsMessages = messages.limits;

  return (
    <section className="view" aria-labelledby="limits-title">
      <h2 id="limits-title" className="view__title">
        {limitsMessages.title}
      </h2>
      {status === "loading" && (
        <p className="card" role="status">
          {limitsMessages.loading}
        </p>
      )}
      {status === "error" && (
        <div className="card view__message" role="alert">
          <p>{limitsMessages.loadError}</p>
          <button
            type="button"
            className="pill-button"
            onClick={reloadLimitsOverview}
          >
            {limitsMessages.retry}
          </button>
        </div>
      )}
      {status === "empty" && (
        <section className="card view__message" aria-labelledby="empty-title">
          <h3 id="empty-title" className="card__title">
            {limitsMessages.emptyTitle}
          </h3>
          <p>{limitsMessages.emptyText}</p>
        </section>
      )}
      {status === "ready" && (
        <div className="card-grid">
          {renderLimitCards({
            limitsOverview,
            weeklyComparison:
              limitHistory === null
                ? null
                : compareWithPreviousWeek(limitHistory.comparisonSnapshots),
            currentTimeMs,
            messages,
          })}
        </div>
      )}
    </section>
  );
}

/**
 * @param {object} limitCards
 * @param {import("../../../main/ipc-handlers.js").LimitsOverview} limitCards.limitsOverview
 * @param {import("../../../core/weekly-comparison.js").WeeklyComparison | null} limitCards.weeklyComparison
 * @param {number} limitCards.currentTimeMs
 * @param {Messages} limitCards.messages
 */
function renderLimitCards({
  limitsOverview,
  weeklyComparison,
  currentTimeMs,
  messages,
}) {
  const { fiveHour, sevenDay } = limitsOverview;
  const dateDisplayOptions = {
    locale: messages.dateLocale,
    timeZone: TIME_ZONE,
  };

  return (
    <>
      {sevenDay === null ? (
        <MissingLimitCard
          title={messages.limits.sevenDayTitle}
          missingText={messages.gauge.missing}
          isWide
        />
      ) : (
        <WeeklyLimitCard
          limitSnapshot={sevenDay}
          weeklyComparison={weeklyComparison}
          currentTimeMs={currentTimeMs}
          dateDisplayOptions={dateDisplayOptions}
          messages={messages}
        />
      )}
      {fiveHour === null ? (
        <MissingLimitCard
          title={messages.limits.fiveHourTitle}
          missingText={messages.gauge.missing}
        />
      ) : (
        <FiveHourRingCard
          limitSnapshot={fiveHour}
          dateDisplayOptions={dateDisplayOptions}
          messages={messages}
        />
      )}
    </>
  );
}

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.missingText
 * @param {boolean} [props.isWide] Whether the card takes the place of the main card.
 */
function MissingLimitCard({ title, missingText, isWide = false }) {
  return (
    <section className={isWide ? "card card--wide" : "card"}>
      <h3 className="card__title">{title}</h3>
      <p className="card__text">{missingText}</p>
    </section>
  );
}

export default LimitsView;
