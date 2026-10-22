import { LANGUAGES, THEMES } from "../../../core/settings.js";
import { MESSAGES_BY_LANGUAGE } from "../../../shared/locales/index.js";

/** @typedef {import("../../../core/settings.js").Settings} Settings */
/** @typedef {import("../../../core/settings.js").SettingsChange} SettingsChange */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * Language and theme pickers, until the full settings view exists.
 * Each language is named in itself, so it can be found whatever the current language.
 *
 * @param {object} props
 * @param {Settings} props.settings
 * @param {Messages["preferences"]} props.preferencesMessages
 * @param {(settingsChange: SettingsChange) => void} props.onSettingsChange
 * @param {boolean} props.hasSaveFailed
 */
function PreferencesControls({
  settings,
  preferencesMessages,
  onSettingsChange,
  hasSaveFailed,
}) {
  return (
    <section className="preferences" aria-labelledby="preferences-title">
      <h2 id="preferences-title" className="visually-hidden">
        {preferencesMessages.title}
      </h2>
      <div className="preferences__field">
        <label className="preferences__label" htmlFor="language-select">
          {preferencesMessages.languageLabel}
        </label>
        <select
          id="language-select"
          className="preferences__select"
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
      <div className="preferences__field">
        <label className="preferences__label" htmlFor="theme-select">
          {preferencesMessages.themeLabel}
        </label>
        <select
          id="theme-select"
          className="preferences__select"
          value={settings.theme}
          onChange={(event) => onSettingsChange({ theme: event.target.value })}
        >
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {preferencesMessages.themes[theme]}
            </option>
          ))}
        </select>
      </div>
      {hasSaveFailed && (
        <p className="preferences__error" role="alert">
          {preferencesMessages.saveError}
        </p>
      )}
    </section>
  );
}

export default PreferencesControls;
