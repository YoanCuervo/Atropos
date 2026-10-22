import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "../../../core/settings.js";
import { getMessages } from "../../../shared/locales/index.js";

/** @typedef {import("../../../core/settings.js").Settings} Settings */
/** @typedef {import("../../../core/settings.js").SettingsChange} SettingsChange */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * @typedef {object} SettingsState
 * @property {Settings | null} settings `null` until the main process answers.
 * @property {Messages} messages Texts of the chosen language.
 * @property {(settingsChange: SettingsChange) => Promise<void>} changeSettings
 * @property {boolean} hasSaveFailed Whether the last change could not be saved.
 */

/**
 * Reads the settings from the main process and keeps the `lang` attribute of the page in step with the language.
 * The theme needs nothing here: the main process switches `prefers-color-scheme`.
 *
 * @returns {SettingsState}
 */
export function useSettings() {
  const [settings, setSettings] = useState(
    /** @type {Settings | null} */ (null),
  );
  const [hasSaveFailed, setHasSaveFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    window.atropos.getSettings().then(
      (receivedSettings) => {
        if (isMounted) {
          setSettings(receivedSettings);
        }
      },
      () => {
        if (isMounted) {
          setSettings({ ...DEFAULT_SETTINGS });
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  const language = settings?.language ?? DEFAULT_SETTINGS.language;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeSettings = useCallback(async (settingsChange) => {
    try {
      setSettings(await window.atropos.updateSettings(settingsChange));
      setHasSaveFailed(false);
    } catch {
      setHasSaveFailed(true);
    }
  }, []);

  return {
    settings,
    messages: getMessages(language),
    changeSettings,
    hasSaveFailed,
  };
}
