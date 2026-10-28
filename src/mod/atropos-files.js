import {
  APPLICATION_DATA_FOLDER_NAME,
  JOURNAL_FILE_NAME,
} from "../core/journal-location.js";
import { SETTINGS_FILE_NAME } from "../core/settings-location.js";
import { readStoredSettings } from "../core/settings.js";
import {
  createLimitSnapshots,
  formatJournalLine,
  parseReadableJournalLines,
  selectSnapshotsToRecord,
} from "../core/snapshot-journal.js";
import { computeSlotStartMs } from "../core/time-slots.js";

/** @typedef {import("../core/rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("../core/settings.js").Language} Language */

/**
 * The mods API, `$`: the only way the mod reaches files and the environment.
 *
 * @typedef {import("claude-code").EngineInterface} ModsApi
 */

/**
 * @param {ModsApi} $
 * @param {string} fileName
 * @returns {Promise<string | null>} Absolute path in `%APPDATA%\Atropos`, or `null` without `APPDATA`.
 */
async function resolveAtroposFilePath($, fileName) {
  const applicationDataPath = await $.env.get("APPDATA");
  return applicationDataPath === undefined
    ? null
    : `${applicationDataPath}\\${APPLICATION_DATA_FOLDER_NAME}\\${fileName}`;
}

/**
 * Follows the language chosen in the Atropos app; English when it has no settings yet.
 *
 * @param {ModsApi} $
 * @returns {Promise<Language>}
 */
export async function readAtroposLanguage($) {
  const settingsPath = await resolveAtroposFilePath($, SETTINGS_FILE_NAME);
  let storedSettings = {};
  if (settingsPath !== null && (await $.fs.exists(settingsPath))) {
    try {
      storedSettings = JSON.parse(await $.fs.read(settingsPath));
    } catch {
      storedSettings = {};
    }
  }
  return readStoredSettings(storedSettings).language;
}

/**
 * Adds the limits to the journal the Atropos app imports, at most once per
 * six-minute slot and window, exactly as the status line does.
 *
 * @param {ModsApi} $
 * @param {RateLimits} rateLimits
 * @param {number} nowMs
 * @returns {Promise<void>}
 */
export async function recordLimitSnapshots($, rateLimits, nowMs) {
  const journalPath = await resolveAtroposFilePath($, JOURNAL_FILE_NAME);
  if (journalPath === null) {
    return;
  }

  const journalText = (await $.fs.exists(journalPath))
    ? await $.fs.read(journalPath)
    : "";
  const snapshotsToRecord = selectSnapshotsToRecord(
    createLimitSnapshots(rateLimits, computeSlotStartMs(nowMs)),
    parseReadableJournalLines(journalText.split("\n")),
  );

  if (snapshotsToRecord.length > 0) {
    const separator =
      journalText === "" || journalText.endsWith("\n") ? "" : "\n";
    await $.fs.write(
      journalPath,
      `${journalText}${separator}${snapshotsToRecord.map(formatJournalLine).join("")}`,
    );
  }
}
