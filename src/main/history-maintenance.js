import { computeRetentionCutoffMs } from "../core/history-retention.js";
import { importJournal } from "./journal-import.js";

/** @typedef {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} LimitSnapshotsRepository */
/** @typedef {import("./database/sent-alerts-repository.js").SentAlertsRepository} SentAlertsRepository */

/**
 * @typedef {object} HistoryMaintenanceResult
 * @property {number} importedSnapshotCount
 * @property {number} purgedSnapshotCount
 * @property {number} purgedAlertCount
 */

/**
 * Imports the journal written by the status line, then purges snapshots and sent alerts
 * older than the retention period.
 *
 * @param {object} historyMaintenance
 * @param {string} historyMaintenance.journalPath
 * @param {LimitSnapshotsRepository} historyMaintenance.limitSnapshotsRepository
 * @param {SentAlertsRepository} historyMaintenance.sentAlertsRepository
 * @param {number} historyMaintenance.nowMs
 * @returns {Promise<HistoryMaintenanceResult>}
 */
export async function maintainHistory({
  journalPath,
  limitSnapshotsRepository,
  sentAlertsRepository,
  nowMs,
}) {
  const importedSnapshotCount = await importJournal(
    journalPath,
    limitSnapshotsRepository,
  );
  const retentionCutoffIso = new Date(
    computeRetentionCutoffMs(nowMs),
  ).toISOString();
  const purgedSnapshotCount =
    limitSnapshotsRepository.deleteSnapshotsTakenBefore(retentionCutoffIso);

  const purgedAlertCount =
    sentAlertsRepository.deleteAlertsSentBefore(retentionCutoffIso);

  return { importedSnapshotCount, purgedSnapshotCount, purgedAlertCount };
}
