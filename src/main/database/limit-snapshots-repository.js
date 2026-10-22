/** @typedef {import("../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */

/**
 * @typedef {object} LimitSnapshotsRepository
 * @property {(limitSnapshots: LimitSnapshot[]) => number} insertSnapshots
 *   Inserts the snapshots in one transaction, ignoring those already stored; returns how many were new.
 * @property {(cutoffIso: string) => number} deleteSnapshotsTakenBefore
 *   Deletes the snapshots whose slot started before the cutoff; returns how many were deleted.
 */

/**
 * @param {import("better-sqlite3").Database} database
 * @returns {LimitSnapshotsRepository}
 */
export function createLimitSnapshotsRepository(database) {
  const insertSnapshotStatement = database.prepare(
    `INSERT OR IGNORE INTO limit_snapshots
       (slot_started_at, window_kind, used_percentage, resets_at)
     VALUES (@slotStartedAt, @windowKind, @usedPercentage, @resetsAt)`,
  );
  const deleteSnapshotsTakenBeforeStatement = database.prepare(
    `DELETE FROM limit_snapshots WHERE slot_started_at < ?`,
  );

  const insertSnapshotsInTransaction = database.transaction((limitSnapshots) =>
    limitSnapshots.reduce(
      (insertedCount, limitSnapshot) =>
        insertedCount + insertSnapshotStatement.run(limitSnapshot).changes,
      0,
    ),
  );

  return {
    insertSnapshots: (limitSnapshots) =>
      insertSnapshotsInTransaction(limitSnapshots),
    deleteSnapshotsTakenBefore: (cutoffIso) =>
      deleteSnapshotsTakenBeforeStatement.run(cutoffIso).changes,
  };
}
