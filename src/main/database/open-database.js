import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { applyPendingMigrations } from "./migrations.js";

/**
 * Opens the history database, creating its folder and file if needed, and migrates its schema.
 *
 * @param {string} databasePath
 * @returns {import("better-sqlite3").Database}
 */
export function openDatabase(databasePath) {
  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  applyPendingMigrations(database);

  return database;
}
