import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatShortDate,
  formatWeekdayAndClockTime,
} from "../../../core/date-display.js";
import { fillMessageTemplate } from "../../../core/message-template.js";

/** @typedef {import("../../../core/history-chart.js").ChartPoint} ChartPoint */
/** @typedef {import("../../../core/date-display.js").DateDisplayOptions} DateDisplayOptions */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

const CHART_HEIGHT_PX = 280;
const PERCENTAGE_TICKS = [0, 25, 50, 75, 100];

/**
 * Both usage lines over the period. The session line is dashed, so colour is never
 * the only way to tell the lines apart, and drawn first, so the weekly line stays on top. Screen readers get a summary and the table instead.
 *
 * @param {object} props
 * @param {ChartPoint[]} props.fiveHourPoints
 * @param {ChartPoint[]} props.sevenDayPoints
 * @param {[number, number]} props.timeDomainMs Start and end of the period.
 * @param {number[]} props.dayTicksMs Where the time axis shows a date.
 * @param {Messages["history"]} props.historyMessages
 * @param {string} props.chartDescription
 * @param {DateDisplayOptions} props.dateDisplayOptions
 */
function HistoryChart({
  fiveHourPoints,
  sevenDayPoints,
  timeDomainMs,
  dayTicksMs,
  historyMessages,
  chartDescription,
  dateDisplayOptions,
}) {
  const formatPercentage = (percentage) =>
    fillMessageTemplate(historyMessages.percentage, {
      percentage: Math.round(percentage),
    });

  return (
    <div className="history-chart" role="img" aria-label={chartDescription}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_PX}>
        <LineChart
          accessibilityLayer={false}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="timeMs"
            type="number"
            domain={timeDomainMs}
            ticks={dayTicksMs}
            tickFormatter={(timeMs) =>
              formatShortDate(timeMs, dateDisplayOptions)
            }
            tick={{ fill: "var(--color-text-muted)" }}
            stroke="var(--color-control-border)"
            allowDuplicatedCategory={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={PERCENTAGE_TICKS}
            tickFormatter={formatPercentage}
            tick={{ fill: "var(--color-text-muted)" }}
            stroke="var(--color-control-border)"
            width={56}
          />
          <Tooltip
            labelFormatter={(timeMs) =>
              formatWeekdayAndClockTime(timeMs, dateDisplayOptions)
            }
            formatter={formatPercentage}
            contentStyle={{
              color: "var(--color-text)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-control-border)",
            }}
          />
          <Legend
            itemSorter={(legendItem) =>
              legendItem.value === historyMessages.sevenDaySeries ? 0 : 1
            }
          />
          <Line
            data={fiveHourPoints}
            dataKey="usedPercentage"
            name={historyMessages.fiveHourSeries}
            stroke="var(--color-chart-five-hour)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            legendType="plainline"
            isAnimationActive={false}
          />
          <Line
            data={sevenDayPoints}
            dataKey="usedPercentage"
            name={historyMessages.sevenDaySeries}
            stroke="var(--color-chart-seven-day)"
            strokeWidth={2}
            dot={false}
            legendType="plainline"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HistoryChart;
