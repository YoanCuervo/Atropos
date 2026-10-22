export const RETENTION_MONTH_COUNT = 12;

/**
 * Returns the oldest moment kept in the history: snapshots taken before it are purged.
 *
 * @param {number} nowMs Unix timestamp, in milliseconds.
 * @returns {number} Same calendar day and time, twelve months earlier, in UTC.
 */
export function computeRetentionCutoffMs(nowMs) {
  const cutoffDate = new Date(nowMs);
  cutoffDate.setUTCMonth(cutoffDate.getUTCMonth() - RETENTION_MONTH_COUNT);
  return cutoffDate.getTime();
}
