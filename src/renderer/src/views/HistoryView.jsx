import { useMemo, useState } from "react";
import { buildChartPoints } from "../../../core/history-chart.js";
import { HISTORY_PERIOD_DAY_COUNTS } from "../../../core/history-request.js";
import { summarizeHistoryByDay } from "../../../core/history-table.js";
import { fillMessageTemplate } from "../../../core/message-template.js";
import { compareWithPreviousWeek } from "../../../core/weekly-comparison.js";
import HistoryChart from "../components/HistoryChart.jsx";
import HistoryTable from "../components/HistoryTable.jsx";
import WeeklyComparison from "../components/WeeklyComparison.jsx";
import { useLimitHistory } from "../hooks/useLimitHistory.js";

/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const MAX_DAY_TICK_COUNT = 8;

/**
 * Usage over the last 7 or 30 days: a chart, the same data as a table,
 * and the comparison with the previous week.
 *
 * @param {object} props
 * @param {Messages} props.messages Texts of the chosen language.
 */
function HistoryView({ messages }) {
  const [periodDayCount, setPeriodDayCount] = useState(
    HISTORY_PERIOD_DAY_COUNTS[0],
  );
  const { status, limitHistory, reloadLimitHistory } =
    useLimitHistory(periodDayCount);
  const historyMessages = messages.history;
  const periodLabels = {
    7: historyMessages.sevenDays,
    30: historyMessages.thirtyDays,
  };

  const dailyHistoryRows = useMemo(
    () =>
      limitHistory === null
        ? []
        : summarizeHistoryByDay({ ...limitHistory, timeZone: TIME_ZONE }),
    [limitHistory],
  );

  return (
    <section className="history-view" aria-labelledby="history-title">
      <h2 id="history-title" className="history-view__title">
        {historyMessages.title}
      </h2>
      <fieldset className="history-view__period">
        <legend className="history-view__period-legend">
          {historyMessages.periodLabel}
        </legend>
        {HISTORY_PERIOD_DAY_COUNTS.map((dayCount) => (
          <label key={dayCount} className="history-view__period-option">
            <input
              type="radio"
              name="history-period"
              value={dayCount}
              checked={dayCount === periodDayCount}
              onChange={() => setPeriodDayCount(dayCount)}
            />
            {periodLabels[dayCount]}
          </label>
        ))}
      </fieldset>
      {renderHistoryContent({
        status,
        limitHistory,
        dailyHistoryRows,
        periodDayCount,
        messages,
        reloadLimitHistory,
      })}
    </section>
  );
}

/**
 * @param {object} historyContent
 * @param {import("../hooks/useLimitHistory.js").LimitHistoryStatus} historyContent.status
 * @param {import("../hooks/useLimitHistory.js").LimitHistory | null} historyContent.limitHistory
 * @param {import("../../../core/history-table.js").DailyHistoryRow[]} historyContent.dailyHistoryRows
 * @param {number} historyContent.periodDayCount
 * @param {Messages} historyContent.messages
 * @param {() => void} historyContent.reloadLimitHistory
 */
function renderHistoryContent({
  status,
  limitHistory,
  dailyHistoryRows,
  periodDayCount,
  messages,
  reloadLimitHistory,
}) {
  const historyMessages = messages.history;

  if (status === "loading") {
    return (
      <p className="history-view__message" role="status">
        {historyMessages.loading}
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="history-view__message" role="alert">
        <p>{historyMessages.loadError}</p>
        <button
          type="button"
          className="pill-button"
          onClick={reloadLimitHistory}
        >
          {historyMessages.retry}
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return <p className="history-view__message">{historyMessages.empty}</p>;
  }

  const dateDisplayOptions = {
    locale: messages.dateLocale,
    timeZone: TIME_ZONE,
  };
  const weeklyComparison = compareWithPreviousWeek(
    limitHistory.comparisonSnapshots,
  );
  const dayTickStep = Math.ceil(dailyHistoryRows.length / MAX_DAY_TICK_COUNT);

  return (
    <>
      {weeklyComparison !== null && (
        <WeeklyComparison
          weeklyComparison={weeklyComparison}
          comparisonMessages={messages.comparison}
          historyMessages={historyMessages}
        />
      )}
      <figure className="history-view__figure">
        <figcaption className="history-view__figcaption">
          {fillMessageTemplate(historyMessages.chartTitle, {
            dayCount: periodDayCount,
          })}
        </figcaption>
        <HistoryChart
          fiveHourPoints={buildChartPoints(limitHistory.fiveHourSnapshots)}
          sevenDayPoints={buildChartPoints(limitHistory.sevenDaySnapshots)}
          timeDomainMs={[limitHistory.startMs, limitHistory.endMs]}
          dayTicksMs={dailyHistoryRows
            .slice(1)
            .filter((_dailyHistoryRow, index) => index % dayTickStep === 0)
            .map((dailyHistoryRow) => dailyHistoryRow.dayTimestampMs)}
          historyMessages={historyMessages}
          chartDescription={fillMessageTemplate(
            historyMessages.chartDescription,
            { dayCount: periodDayCount },
          )}
          dateDisplayOptions={dateDisplayOptions}
        />
      </figure>
      <HistoryTable
        dailyHistoryRows={dailyHistoryRows}
        tableCaption={fillMessageTemplate(historyMessages.tableCaption, {
          dayCount: periodDayCount,
        })}
        historyMessages={historyMessages}
        dateDisplayOptions={dateDisplayOptions}
      />
    </>
  );
}

export default HistoryView;
