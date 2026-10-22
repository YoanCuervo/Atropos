import { computeRetentionCutoffMs } from "../core/history-retention.js";
import { importJournal } from "./journal-import.js";

/** @typedef {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} LimitSnapshotsRepository */

/**
 * @typedef {object} HistoryMaintenanceResult
 * @property {number} importedSnapshotCount
 * @property {number} purgedSnapshotCount
 */

/**
 * Imports the journal written by the status line, then purges snapshots older than the retention period.
 *
 * @param {object} historyMaintenance
 * @param {string} historyMaintenance.journalPath
 * @param {LimitSnapshotsRepository} historyMaintenance.limitSnapshotsRepository
 * @param {number} historyMaintenance.nowMs
 * @returns {Promise<HistoryMaintenanceResult>}
 */
export async function maintainHistory({
  journalPath,
  limitSnapshotsRepository,
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

  return { importedSnapshotCount, purgedSnapshotCount };
}
