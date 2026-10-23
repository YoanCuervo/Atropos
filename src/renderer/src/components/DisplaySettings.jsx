import { LANGUAGES, THEMES } from "../../../core/settings.js";
import { MESSAGES_BY_LANGUAGE } from "../../../shared/locales/index.js";

/** @typedef {import("../../../core/settings.js").Settings} Settings */
/** @typedef {import("../../../core/settings.js").SettingsChange} SettingsChange */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * Language and theme. Each language is named in itself, so it can be found whatever the current language.
 *
 * @param {object} props
 * @param {Settings} props.settings
 * @param {Messages["preferences"]} props.preferencesMessages
 * @param {(settingsChange: SettingsChange) => void} props.onSettingsChange
 */
function DisplaySettings({ settings, preferencesMessages, onSettingsChange }) {
  return (
    <section className="settings-section" aria-labelledby="display-title">
      <h3 id="display-title" className="settings-section__title">
        {preferencesMessages.title}
      </h3>
      <div className="settings-section__fields">
        <div className="settings-field">
          <label className="settings-field__label" htmlFor="language-select">
            {preferencesMessages.languageLabel}
          </label>
          <select
            id="language-select"
            className="settings-field__control"
            value={settings.language}
            onChange={(event) =>
              onSettingsChange({ language: event.target.value })
            }
          >
            {LANGUAGES.map((language) => (
              <option key={language} value={language} lang={language}>
                {MESSAGES_BY_LANGUAGE[language].languageName}
              </option>
            ))}
          </select>
        </div>
        <div className="settings-field">
          <label className="settings-field__label" htmlFor="theme-select">
            {preferencesMessages.themeLabel}
          </label>
          <select
            id="theme-select"
            className="settings-field__control"
            value={settings.theme}
            onChange={(event) =>
              onSettingsChange({ theme: event.target.value })
            }
          >
            {THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {preferencesMessages.themes[theme]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

export default DisplaySettings;
