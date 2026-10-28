import { join } from "node:path";

export const APPLICATION_DATA_FOLDER_NAME = "Atropos";
// Outside AppData on purpose: packaged apps such as Claude Desktop see a private copy
// of AppData, so a journal written there by the mod never reaches the Atropos app.
export const SHARED_FOLDER_NAME = ".atropos";
export const JOURNAL_FILE_NAME = "limit-snapshots.jsonl";

/**
 * Builds the path of the folder shared by the mod, the status line and the desktop app.
 *
 * @param {string} homePath The user's home folder, i.e. `%USERPROFILE%`.
 * @returns {string} `%USERPROFILE%\.atropos`
 */
export function buildSharedFolderPath(homePath) {
  return join(homePath, SHARED_FOLDER_NAME);
}

/**
 * Builds the path of the journal shared by the mod, the status line and the desktop app.
 *
 * @param {string} homePath The user's home folder, i.e. `%USERPROFILE%`.
 * @returns {string} `%USERPROFILE%\.atropos\limit-snapshots.jsonl`
 */
export function buildJournalPath(homePath) {
  return join(buildSharedFolderPath(homePath), JOURNAL_FILE_NAME);
}

/**
 * Builds the path where versions before the shared folder wrote the journal.
 *
 * @param {string} applicationDataPath The roaming application data folder, i.e. `%APPDATA%`.
 * @returns {string} `%APPDATA%\Atropos\limit-snapshots.jsonl`
 */
export function buildLegacyJournalPath(applicationDataPath) {
  return join(
    applicationDataPath,
    APPLICATION_DATA_FOLDER_NAME,
    JOURNAL_FILE_NAME,
  );
}
