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
