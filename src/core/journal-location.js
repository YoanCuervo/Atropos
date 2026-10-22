import { join } from "node:path";

export const APPLICATION_DATA_FOLDER_NAME = "Atropos";
export const JOURNAL_FILE_NAME = "limit-snapshots.jsonl";

/**
 * Builds the path of the journal shared by the status line and the desktop app.
 *
 * @param {string} applicationDataPath The roaming application data folder, i.e. `%APPDATA%`.
 * @returns {string} `%APPDATA%\Atropos\limit-snapshots.jsonl`
 */
export function buildJournalPath(applicationDataPath) {
  return join(
    applicationDataPath,
    APPLICATION_DATA_FOLDER_NAME,
    JOURNAL_FILE_NAME,
  );
}
