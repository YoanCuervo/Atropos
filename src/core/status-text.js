/** @typedef {import("./rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("./rate-limits.js").LimitWindow} LimitWindow */

/**
 * @typedef {object} DateDisplayOptions
 * @property {string} locale BCP 47 locale used for weekday names, e.g. "en-GB".
 * @property {string} timeZone IANA time zone used for reset times, e.g. "Europe/Paris".
 */

export const NO_LIMITS_TEXT = "Limits appear after the first reply";
export const UNREADABLE_LIMITS_TEXT = "Limits unreadable";

const FIVE_HOUR_LABEL = "5h";
const SEVEN_DAY_LABEL = "week";
const SEPARATOR = " · ";

/**
 * Builds the text shown in the Claude Code status line, e.g. "5h 42% (17:00) · week 67% (Tue 09:00)".
 *
 * @param {RateLimits | null} rateLimits Result of `readRateLimits`.
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string}
 */
export function formatStatusText(rateLimits, dateDisplayOptions) {
  if (rateLimits === null) {
    return NO_LIMITS_TEXT;
  }

  const windowTexts = [];
  if (rateLimits.fiveHour !== null) {
    const resetTimeText = formatResetTime(
      rateLimits.fiveHour.resetsAtMs,
      dateDisplayOptions,
    );
    windowTexts.push(
      formatWindowText(FIVE_HOUR_LABEL, rateLimits.fiveHour, resetTimeText),
    );
  }
  if (rateLimits.sevenDay !== null) {
    const resetDayAndTimeText = formatResetDayAndTime(
      rateLimits.sevenDay.resetsAtMs,
      dateDisplayOptions,
    );
    windowTexts.push(
      formatWindowText(
        SEVEN_DAY_LABEL,
        rateLimits.sevenDay,
        resetDayAndTimeText,
      ),
    );
  }

  return windowTexts.length === 0
    ? NO_LIMITS_TEXT
    : windowTexts.join(SEPARATOR);
}

/**
 * @param {string} label
 * @param {LimitWindow} limitWindow
 * @param {string} resetText
 * @returns {string}
 */
function formatWindowText(label, limitWindow, resetText) {
  return `${label} ${Math.round(limitWindow.usedPercentage)}% (${resetText})`;
}

/**
 * @param {number} resetsAtMs
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string} e.g. "17:00"
 */
function formatResetTime(resetsAtMs, { locale, timeZone }) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(resetsAtMs);
}

/**
 * @param {number} resetsAtMs
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string} e.g. "Tue 09:00"
 */
function formatResetDayAndTime(resetsAtMs, { locale, timeZone }) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(resetsAtMs);
}
