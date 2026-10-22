import { formatShortDate } from "../../../core/date-display.js";
import { fillMessageTemplate } from "../../../core/message-template.js";

/** @typedef {import("../../../core/history-table.js").DailyHistoryRow} DailyHistoryRow */
/** @typedef {import("../../../core/date-display.js").DateDisplayOptions} DateDisplayOptions */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * The chart as a table, one row per day, behind a disclosure so the view stays short.
 *
 * @param {object} props
 * @param {DailyHistoryRow[]} props.dailyHistoryRows
 * @param {string} props.tableCaption
 * @param {Messages["history"]} props.historyMessages
 * @param {DateDisplayOptions} props.dateDisplayOptions
 */
function HistoryTable({
  dailyHistoryRows,
  tableCaption,
  historyMessages,
  dateDisplayOptions,
}) {
  const formatPercentage = (percentage) =>
    percentage === null
      ? historyMessages.noData
      : fillMessageTemplate(historyMessages.percentage, {
          percentage: Math.round(percentage),
        });

  return (
    <details className="history-table">
      <summary className="history-table__toggle">
        {historyMessages.tableToggle}
      </summary>
      <table className="history-table__table">
        <caption className="history-table__caption">{tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{historyMessages.dayColumn}</th>
            <th scope="col">{historyMessages.fiveHourColumn}</th>
            <th scope="col">{historyMessages.sevenDayColumn}</th>
          </tr>
        </thead>
        <tbody>
          {dailyHistoryRows.map((dailyHistoryRow) => (
            <tr key={dailyHistoryRow.dayKey}>
              <th scope="row">
                <time dateTime={dailyHistoryRow.dayKey}>
                  {formatShortDate(
                    dailyHistoryRow.dayTimestampMs,
                    dateDisplayOptions,
                  )}
                </time>
              </th>
              <td>
                {formatPercentage(dailyHistoryRow.highestFiveHourPercentage)}
              </td>
              <td>
                {formatPercentage(dailyHistoryRow.lastSevenDayPercentage)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export default HistoryTable;
