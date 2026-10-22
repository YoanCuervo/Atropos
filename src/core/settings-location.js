import { join } from "node:path";
import { APPLICATION_DATA_FOLDER_NAME } from "./journal-location.js";

export const SETTINGS_FILE_NAME = "settings.json";

/**
 * @param {string} applicationDataPath The roaming application data folder, i.e. `%APPDATA%`.
 * @returns {string} `%APPDATA%\Atropos\settings.json`
 */
export function buildSettingsPath(applicationDataPath) {
  return join(
    applicationDataPath,
    APPLICATION_DATA_FOLDER_NAME,
    SETTINGS_FILE_NAME,
  );
}
