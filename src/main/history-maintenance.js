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
 * Imports the journals written by the mod and the status line, then purges snapshots
 * and sent alerts older than the retention period.
 *
 * @param {object} historyMaintenance
 * @param {string[]} historyMaintenance.journalPaths The current journal, then any left at an older location.
 * @param {LimitSnapshotsRepository} historyMaintenance.limitSnapshotsRepository
 * @param {SentAlertsRepository} historyMaintenance.sentAlertsRepository
 * @param {number} historyMaintenance.nowMs
 * @returns {Promise<HistoryMaintenanceResult>}
 */
export async function maintainHistory({
  journalPaths,
  limitSnapshotsRepository,
  sentAlertsRepository,
  nowMs,
}) {
  let importedSnapshotCount = 0;
  for (const journalPath of journalPaths) {
    importedSnapshotCount += await importJournal(
      journalPath,
      limitSnapshotsRepository,
    );
  }
  const retentionCutoffIso = new Date(
    computeRetentionCutoffMs(nowMs),
  ).toISOString();
  const purgedSnapshotCount =
    limitSnapshotsRepository.deleteSnapshotsTakenBefore(retentionCutoffIso);

  const purgedAlertCount =
    sentAlertsRepository.deleteAlertsSentBefore(retentionCutoffIso);

  return { importedSnapshotCount, purgedSnapshotCount, purgedAlertCount };
}
