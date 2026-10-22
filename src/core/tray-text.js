import { formatWeekdayAndClockTime } from "./date-display.js";
import { fillMessageTemplate } from "./message-template.js";

/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("./date-display.js").DateDisplayOptions} DateDisplayOptions */

/**
 * @typedef {object} TrayTooltipMessages
 * @property {string} tooltip Template with `{percentage}`, `{resetTime}` and `{updateTime}`.
 * @property {string} noLimitsTooltip Shown before the first snapshot.
 */

/**
 * Builds the tray icon tooltip from the latest weekly snapshot,
 * e.g. "Atropos · week 67% · resets Tue 09:00 · updated Thu 14:06".
 * The update time shows how old the figure is when Claude Code has been closed for a while.
 *
 * @param {LimitSnapshot | null} sevenDaySnapshot Latest snapshot of the weekly window.
 * @param {TrayTooltipMessages} trayMessages Texts of the chosen language.
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string}
 */
export function formatTrayTooltip(
  sevenDaySnapshot,
  trayMessages,
  dateDisplayOptions,
) {
  if (sevenDaySnapshot === null) {
    return trayMessages.noLimitsTooltip;
  }

  return fillMessageTemplate(trayMessages.tooltip, {
    percentage: Math.round(sevenDaySnapshot.usedPercentage),
    resetTime: formatWeekdayAndClockTime(
      Date.parse(sevenDaySnapshot.resetsAt),
      dateDisplayOptions,
    ),
    updateTime: formatWeekdayAndClockTime(
      Date.parse(sevenDaySnapshot.slotStartedAt),
      dateDisplayOptions,
    ),
  });
}
