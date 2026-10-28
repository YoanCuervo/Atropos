/** @typedef {"comfortable" | "warning" | "critical"} UsageLevel */

export const WARNING_USAGE_PERCENTAGE = 50;
export const CRITICAL_USAGE_PERCENTAGE = 80;

/**
 * Sorts a used share into the three levels the gauges show, with the same
 * thresholds as their `<meter>` (`low` and `high`).
 *
 * @param {number} usedPercentage From 0 to 100.
 * @returns {UsageLevel}
 */
export function classifyUsageLevel(usedPercentage) {
  if (usedPercentage >= CRITICAL_USAGE_PERCENTAGE) {
    return "critical";
  }
  if (usedPercentage >= WARNING_USAGE_PERCENTAGE) {
    return "warning";
  }
  return "comfortable";
}
