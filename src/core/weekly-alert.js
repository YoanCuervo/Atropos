import { formatWeekdayAndClockTime } from "./date-display.js";
import { fillMessageTemplate } from "./message-template.js";

/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("./settings.js").Settings} Settings */
/** @typedef {import("./date-display.js").DateDisplayOptions} DateDisplayOptions */

/**
 * @typedef {object} WeeklyAlertMessages
 * @property {string} title
 * @property {string} body Template with `{percentage}` and `{resetTime}`.
 */

/**
 * @typedef {object} WeeklyAlertText
 * @property {string} title
 * @property {string} body
 */

/**
 * Decides whether the weekly usage deserves a notification now.
 *
 * @param {object} weeklyAlertDecision
 * @param {LimitSnapshot | null} weeklyAlertDecision.sevenDaySnapshot Latest snapshot of the weekly window.
 * @param {Settings} weeklyAlertDecision.settings
 * @param {boolean} weeklyAlertDecision.hasAlertBeenSent Whether this window was already alerted at this threshold.
 * @param {number} weeklyAlertDecision.nowMs Unix timestamp, in milliseconds.
 * @returns {boolean} `false` as well when the window of the snapshot has already reset,
 *   so an old snapshot never raises an alert about a week that is over.
 */
export function shouldSendWeeklyAlert({
  sevenDaySnapshot,
  settings,
  hasAlertBeenSent,
  nowMs,
}) {
  return (
    settings.isWeeklyAlertEnabled &&
    sevenDaySnapshot !== null &&
    sevenDaySnapshot.usedPercentage >=
      settings.weeklyAlertThresholdPercentage &&
    Date.parse(sevenDaySnapshot.resetsAt) > nowMs &&
    !hasAlertBeenSent
  );
}

/**
 * @param {LimitSnapshot} sevenDaySnapshot
 * @param {WeeklyAlertMessages} weeklyAlertMessages Texts of the chosen language.
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {WeeklyAlertText} e.g. "82% of your weekly limit is used. It resets Thu 09:00."
 */
export function formatWeeklyAlertText(
  sevenDaySnapshot,
  weeklyAlertMessages,
  dateDisplayOptions,
) {
  return {
    title: weeklyAlertMessages.title,
    body: fillMessageTemplate(weeklyAlertMessages.body, {
      percentage: Math.round(sevenDaySnapshot.usedPercentage),
      resetTime: formatWeekdayAndClockTime(
        Date.parse(sevenDaySnapshot.resetsAt),
        dateDisplayOptions,
      ),
    }),
  };
}
