import { join } from "node:path";
import {
  APPLICATION_DATA_FOLDER_NAME,
  buildSharedFolderPath,
} from "./journal-location.js";

export const SETTINGS_FILE_NAME = "settings.json";

/**
 * Builds the path of the settings, shared with the mod, which follows their language.
 *
 * @param {string} homePath The user's home folder, i.e. `%USERPROFILE%`.
 * @returns {string} `%USERPROFILE%\.atropos\settings.json`
 */
export function buildSettingsPath(homePath) {
  return join(buildSharedFolderPath(homePath), SETTINGS_FILE_NAME);
}

/**
 * Builds the path where versions before the shared folder kept the settings.
 *
 * @param {string} applicationDataPath The roaming application data folder, i.e. `%APPDATA%`.
 * @returns {string} `%APPDATA%\Atropos\settings.json`
 */
export function buildLegacySettingsPath(applicationDataPath) {
  return join(
    applicationDataPath,
    APPLICATION_DATA_FOLDER_NAME,
    SETTINGS_FILE_NAME,
  );
}
