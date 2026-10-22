import { formatWeekdayAndClockTime } from "./date-display.js";

/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("./date-display.js").DateDisplayOptions} DateDisplayOptions */

export const NO_LIMITS_RECORDED_TOOLTIP = "Atropos · no limits recorded yet";

/**
 * Builds the tray icon tooltip from the latest weekly snapshot,
 * e.g. "Atropos · week 67% · resets Tue 09:00 · updated Thu 14:06".
 * The update time shows how old the figure is when Claude Code has been closed for a while.
 *
 * @param {LimitSnapshot | null} sevenDaySnapshot Latest snapshot of the weekly window.
 * @param {DateDisplayOptions} dateDisplayOptions
 * @returns {string}
 */
export function formatTrayTooltip(sevenDaySnapshot, dateDisplayOptions) {
  if (sevenDaySnapshot === null) {
    return NO_LIMITS_RECORDED_TOOLTIP;
  }

  const usedPercentageText = `${Math.round(sevenDaySnapshot.usedPercentage)}%`;
  const resetText = formatWeekdayAndClockTime(
    Date.parse(sevenDaySnapshot.resetsAt),
    dateDisplayOptions,
  );
  const updateText = formatWeekdayAndClockTime(
    Date.parse(sevenDaySnapshot.slotStartedAt),
    dateDisplayOptions,
  );

  return `Atropos · week ${usedPercentageText} · resets ${resetText} · updated ${updateText}`;
}
