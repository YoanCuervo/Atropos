/**
 * @typedef {object} DateDisplayOptions
 * @property {string} locale BCP 47 locale used for weekday names, e.g. "en-GB".
 * @property {string} timeZone IANA time zone used to display times, e.g. "Europe/Paris".
 */

/**
 * @param {number} timestampMs Unix timestamp, in milliseconds.
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string} 24-hour clock time, e.g. "17:00".
 */
export function formatClockTime(timestampMs, { locale, timeZone }) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(timestampMs);
}

/**
 * @param {number} timestampMs Unix timestamp, in milliseconds.
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string} Short weekday and 24-hour clock time, e.g. "Tue 09:00".
 */
export function formatWeekdayAndClockTime(timestampMs, { locale, timeZone }) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(timestampMs);
}

/**
 * @param {number} timestampMs Unix timestamp, in milliseconds.
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string} Short weekday, day and month, e.g. "Thu 22 Oct".
 */
export function formatShortDate(timestampMs, { locale, timeZone }) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(timestampMs);
}

/**
 * Names the calendar day of a timestamp in a time zone, so that snapshots can be grouped by day.
 *
 * @param {number} timestampMs Unix timestamp, in milliseconds.
 * @param {string} timeZone IANA time zone, e.g. "Europe/Paris".
 * @returns {string} e.g. "2026-10-22".
 */
export function formatCalendarDayKey(timestampMs, timeZone) {
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone,
    })
      .formatToParts(timestampMs)
      .map(({ type, value }) => [type, value]),
  );
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}
