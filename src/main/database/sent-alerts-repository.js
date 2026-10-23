/** @typedef {import("../../core/rate-limits.js").WindowKind} WindowKind */

/**
 * @typedef {object} SentAlert
 * @property {WindowKind} windowKind
 * @property {number} thresholdPercentage
 * @property {string} windowResetsAt ISO 8601 UTC reset time identifying the window, rounded to the hour.
 */

/**
 * @typedef {object} SentAlertsRepository
 * @property {(sentAlert: SentAlert) => boolean} hasAlertBeenSent
 * @property {(sentAlert: SentAlert, sentAt: string) => void} recordSentAlert
 *   Records an alert; recording the same alert twice keeps the first record.
 * @property {(sentAlert: SentAlert) => void} forgetSentAlert
 *   Deletes the record of one alert, e.g. when Windows refused to show it.
 * @property {(cutoffIso: string) => number} deleteAlertsSentBefore
 *   Deletes the alerts sent before the cutoff; returns how many were deleted.
 * @property {() => number} deleteAllAlerts Deletes every alert; returns how many were deleted.
 */

/**
 * @param {import("better-sqlite3").Database} database
 * @returns {SentAlertsRepository}
 */
export function createSentAlertsRepository(database) {
  const findSentAlertStatement = database.prepare(
    `SELECT 1 FROM sent_alerts
      WHERE window_kind = @windowKind
        AND threshold_percentage = @thresholdPercentage
        AND window_resets_at = @windowResetsAt`,
  );
  const insertSentAlertStatement = database.prepare(
    `INSERT OR IGNORE INTO sent_alerts
       (window_kind, threshold_percentage, window_resets_at, sent_at)
     VALUES (@windowKind, @thresholdPercentage, @windowResetsAt, @sentAt)`,
  );
  const deleteSentAlertStatement = database.prepare(
    `DELETE FROM sent_alerts
      WHERE window_kind = @windowKind
        AND threshold_percentage = @thresholdPercentage
        AND window_resets_at = @windowResetsAt`,
  );
  const deleteAlertsSentBeforeStatement = database.prepare(
    `DELETE FROM sent_alerts WHERE sent_at < ?`,
  );
  const deleteAllAlertsStatement = database.prepare(`DELETE FROM sent_alerts`);

  return {
    hasAlertBeenSent: (sentAlert) =>
      findSentAlertStatement.get(sentAlert) !== undefined,
    recordSentAlert: (sentAlert, sentAt) => {
      insertSentAlertStatement.run({ ...sentAlert, sentAt });
    },
    forgetSentAlert: (sentAlert) => {
      deleteSentAlertStatement.run(sentAlert);
    },
    deleteAlertsSentBefore: (cutoffIso) =>
      deleteAlertsSentBeforeStatement.run(cutoffIso).changes,
    deleteAllAlerts: () => deleteAllAlertsStatement.run().changes,
  };
}
