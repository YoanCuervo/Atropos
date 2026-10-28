import { formatClockTime, formatWeekdayAndClockTime } from "./date-display.js";

/** @typedef {import("./rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("./rate-limits.js").LimitWindow} LimitWindow */
/** @typedef {import("./date-display.js").DateDisplayOptions} DateDisplayOptions */

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
    const resetTimeText = formatClockTime(
      rateLimits.fiveHour.resetsAtMs,
      dateDisplayOptions,
    );
    windowTexts.push(
      formatWindowText(FIVE_HOUR_LABEL, rateLimits.fiveHour, resetTimeText),
    );
  }
  if (rateLimits.sevenDay !== null) {
    const resetDayAndTimeText = formatWeekdayAndClockTime(
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
