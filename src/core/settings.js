import { InvalidSettingsChangeError } from "./errors.js";
import { isPlainObject } from "./validation.js";

/** @typedef {"en" | "fr"} Language */
/** @typedef {"system" | "light" | "dark"} Theme */

/**
 * @typedef {object} Settings
 * @property {Language} language Language of the interface, the tray tooltip and the tray menu.
 * @property {Theme} theme "system" follows the Windows setting.
 */

/**
 * @typedef {object} SettingsChange
 * @property {Language} [language]
 * @property {Theme} [theme]
 */

/** @type {readonly Language[]} */
export const LANGUAGES = Object.freeze(["en", "fr"]);

/** @type {readonly Theme[]} */
export const THEMES = Object.freeze(["system", "light", "dark"]);

/** @type {Readonly<Settings>} */
export const DEFAULT_SETTINGS = Object.freeze({
  language: "en",
  theme: "system",
});

const ALLOWED_VALUES_BY_SETTING = Object.freeze({
  language: LANGUAGES,
  theme: THEMES,
});

/**
 * Reads the settings found in `settings.json`. The file may have been edited by hand,
 * so each missing or invalid setting falls back to its default instead of failing.
 *
 * @param {unknown} storedSettings Parsed content of the file, of any shape.
 * @returns {Settings} A new object holding only the known settings.
 */
export function readStoredSettings(storedSettings) {
  const storedValues = isPlainObject(storedSettings) ? storedSettings : {};

  return Object.fromEntries(
    Object.entries(ALLOWED_VALUES_BY_SETTING).map(
      ([settingName, allowedValues]) => [
        settingName,
        allowedValues.includes(storedValues[settingName])
          ? storedValues[settingName]
          : DEFAULT_SETTINGS[settingName],
      ],
    ),
  );
}

/**
 * Checks a settings change coming from the interface, which is never trusted as is.
 *
 * @param {unknown} rawChange
 * @returns {SettingsChange} A new object holding only the settings being changed.
 * @throws {InvalidSettingsChangeError} When the change is empty, names an unknown setting or has an unsupported value.
 */
export function parseSettingsChange(rawChange) {
  if (!isPlainObject(rawChange) || Object.keys(rawChange).length === 0) {
    throw new InvalidSettingsChangeError("(change)", rawChange);
  }

  for (const [settingName, value] of Object.entries(rawChange)) {
    const allowedValues = Object.hasOwn(ALLOWED_VALUES_BY_SETTING, settingName)
      ? ALLOWED_VALUES_BY_SETTING[settingName]
      : [];
    if (!allowedValues.includes(value)) {
      throw new InvalidSettingsChangeError(settingName, value);
    }
  }

  return { ...rawChange };
}

/**
 * @param {Settings} settings
 * @param {SettingsChange} settingsChange Result of `parseSettingsChange`.
 * @returns {Settings} New settings; the given ones are left untouched.
 */
export function applySettingsChange(settings, settingsChange) {
  return { ...settings, ...settingsChange };
}
