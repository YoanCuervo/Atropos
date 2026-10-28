/**
 * Schema changes, in order: the migration at index N moves the schema from version N to N + 1.
 * A released migration is never edited; a change to the schema is a new migration appended here.
 */
export const MIGRATIONS = [
  `CREATE TABLE limit_snapshots (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_started_at  TEXT    NOT NULL,
    window_kind      TEXT    NOT NULL CHECK (window_kind IN ('five_hour', 'seven_day')),
    used_percentage  REAL    NOT NULL CHECK (used_percentage >= 0),
    resets_at        TEXT    NOT NULL,
    UNIQUE (window_kind, slot_started_at)
  );`,
  `CREATE TABLE sent_alerts (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    window_kind           TEXT    NOT NULL CHECK (window_kind IN ('five_hour', 'seven_day')),
    threshold_percentage  INTEGER NOT NULL,
    window_resets_at      TEXT    NOT NULL,
    sent_at               TEXT    NOT NULL,
    UNIQUE (window_kind, threshold_percentage, window_resets_at)
  );`,
];

/**
 * Brings the schema up to date, using SQLite's `user_version` as the schema version.
 * All pending migrations run in one transaction: either all of them apply, or none.
 *
 * @param {import("better-sqlite3").Database} database
 * @returns {number} Number of migrations applied.
 */
export function applyPendingMigrations(database) {
  const schemaVersion = database.pragma("user_version", { simple: true });
  const pendingMigrations = MIGRATIONS.slice(schemaVersion);

  database.transaction(() => {
    for (const migrationSql of pendingMigrations) {
      database.exec(migrationSql);
    }
    database.pragma(`user_version = ${MIGRATIONS.length}`);
  })();

  return pendingMigrations.length;
}
