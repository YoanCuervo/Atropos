import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { applySettingsChange, readStoredSettings } from "../core/settings.js";

/** @typedef {import("../core/settings.js").Settings} Settings */
/** @typedef {import("../core/settings.js").SettingsChange} SettingsChange */

/**
 * @typedef {object} SettingsStore
 * @property {() => Settings} getSettings
 * @property {(settingsChange: SettingsChange) => Settings} changeSettings Saves the change, then returns the new settings.
 */

/**
 * Keeps the settings of `settings.json` in memory and writes every change back to the file.
 *
 * @param {string} settingsPath `%USERPROFILE%\.atropos\settings.json`
 * @param {string} legacySettingsPath `%APPDATA%\Atropos\settings.json`, read only while `settingsPath` does not exist yet.
 * @returns {SettingsStore}
 */
export function createSettingsStore(settingsPath, legacySettingsPath) {
  let settings = loadSettings(
    existsSync(settingsPath) ? settingsPath : legacySettingsPath,
  );

  return {
    getSettings: () => settings,
    changeSettings(settingsChange) {
      const changedSettings = applySettingsChange(settings, settingsChange);
      saveSettings(settingsPath, changedSettings);
      settings = changedSettings;
      return settings;
    },
  };
}

/**
 * A missing, unreadable or malformed file gives the default settings, so Atropos always starts.
 *
 * @param {string} settingsPath
 * @returns {Settings}
 */
function loadSettings(settingsPath) {
  try {
    return readStoredSettings(JSON.parse(readFileSync(settingsPath, "utf8")));
  } catch {
    return readStoredSettings(undefined);
  }
}

/**
 * Writes a temporary file first and renames it, so a crash never leaves a half-written file.
 *
 * @param {string} settingsPath
 * @param {Settings} settings
 */
function saveSettings(settingsPath, settings) {
  const temporaryPath = `${settingsPath}.tmp`;
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(temporaryPath, `${JSON.stringify(settings, null, 2)}\n`);
  renameSync(temporaryPath, settingsPath);
}
