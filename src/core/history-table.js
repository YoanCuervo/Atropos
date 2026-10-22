import { formatCalendarDayKey } from "./date-display.js";

/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */

/**
 * @typedef {object} DailyHistoryRow
 * @property {string} dayKey Calendar day, e.g. "2026-10-22".
 * @property {number} dayTimestampMs A moment of that day, to display its date.
 * @property {number | null} highestFiveHourPercentage Highest five-hour usage seen that day.
 * @property {number | null} lastSevenDayPercentage Last weekly usage recorded that day.
 */

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/**
 * Sums up the history day by day, as the table that stands in for the chart.
 * Every day of the period gets a row, even without snapshots, so gaps stay visible.
 *
 * @param {object} dailyHistoryRequest
 * @param {LimitSnapshot[]} dailyHistoryRequest.fiveHourSnapshots Oldest first.
 * @param {LimitSnapshot[]} dailyHistoryRequest.sevenDaySnapshots Oldest first.
 * @param {number} dailyHistoryRequest.startMs Start of the period, as a Unix timestamp in milliseconds.
 * @param {number} dailyHistoryRequest.endMs End of the period, as a Unix timestamp in milliseconds.
 * @param {string} dailyHistoryRequest.timeZone IANA time zone that decides where days start.
 * @returns {DailyHistoryRow[]} Oldest day first.
 */
export function summarizeHistoryByDay({
  fiveHourSnapshots,
  sevenDaySnapshots,
  startMs,
  endMs,
  timeZone,
}) {
  const rowsByDayKey = new Map(
    listDayTimestampsMs(startMs, endMs, timeZone).map((dayTimestampMs) => {
      const dayKey = formatCalendarDayKey(dayTimestampMs, timeZone);
      return [
        dayKey,
        {
          dayKey,
          dayTimestampMs,
          highestFiveHourPercentage: null,
          lastSevenDayPercentage: null,
        },
      ];
    }),
  );

  for (const { dayKey, usedPercentage } of keyByDay(
    fiveHourSnapshots,
    timeZone,
  )) {
    const row = rowsByDayKey.get(dayKey);
    if (row !== undefined) {
      row.highestFiveHourPercentage = Math.max(
        row.highestFiveHourPercentage ?? 0,
        usedPercentage,
      );
    }
  }
  for (const { dayKey, usedPercentage } of keyByDay(
    sevenDaySnapshots,
    timeZone,
  )) {
    const row = rowsByDayKey.get(dayKey);
    if (row !== undefined) {
      row.lastSevenDayPercentage = usedPercentage;
    }
  }

  return [...rowsByDayKey.values()];
}

/**
 * Steps hour by hour rather than day by day, so days of 23 or 25 hours are never skipped.
 *
 * @param {number} startMs
 * @param {number} endMs
 * @param {string} timeZone
 * @returns {number[]} One timestamp per calendar day of the period, oldest first.
 */
function listDayTimestampsMs(startMs, endMs, timeZone) {
  const dayTimestampsByKey = new Map();
  for (
    let timestampMs = startMs;
    timestampMs <= endMs;
    timestampMs += MILLISECONDS_PER_HOUR
  ) {
    const dayKey = formatCalendarDayKey(timestampMs, timeZone);
    if (!dayTimestampsByKey.has(dayKey)) {
      dayTimestampsByKey.set(dayKey, timestampMs);
    }
  }
  const endDayKey = formatCalendarDayKey(endMs, timeZone);
  if (!dayTimestampsByKey.has(endDayKey)) {
    dayTimestampsByKey.set(endDayKey, endMs);
  }
  return [...dayTimestampsByKey.values()];
}

/**
 * @param {LimitSnapshot[]} limitSnapshots
 * @param {string} timeZone
 * @returns {{ dayKey: string, usedPercentage: number }[]}
 */
function keyByDay(limitSnapshots, timeZone) {
  return limitSnapshots.map(({ slotStartedAt, usedPercentage }) => ({
    dayKey: formatCalendarDayKey(Date.parse(slotStartedAt), timeZone),
    usedPercentage,
  }));
}
