/** @typedef {import("../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("../../core/rate-limits.js").WindowKind} WindowKind */

/**
 * @typedef {object} LimitSnapshotsRepository
 * @property {(limitSnapshots: LimitSnapshot[]) => number} insertSnapshots
 *   Inserts the snapshots in one transaction, ignoring those already stored; returns how many were new.
 * @property {(cutoffIso: string) => number} deleteSnapshotsTakenBefore
 *   Deletes the snapshots whose slot started before the cutoff; returns how many were deleted.
 * @property {(windowKind: WindowKind) => LimitSnapshot | null} findLatestSnapshot
 *   Returns the most recent snapshot of a window, or `null` when none is stored.
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

  const findLatestSnapshotStatement = database.prepare(
    `SELECT slot_started_at AS slotStartedAt,
            window_kind     AS windowKind,
            used_percentage AS usedPercentage,
            resets_at       AS resetsAt
       FROM limit_snapshots
      WHERE window_kind = ?
      ORDER BY slot_started_at DESC
      LIMIT 1`,
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
    findLatestSnapshot: (windowKind) =>
      findLatestSnapshotStatement.get(windowKind) ?? null,
  };
}
